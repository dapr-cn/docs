import { createHash } from 'node:crypto'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'
import { pathToFileURL } from 'node:url'
import { reconcileTranslationIntegrity } from '../../repos/dapr-docs-copilot/src/server/translation-integrity-audit.ts'
import type { SyncStatusPayload, TranslationStatePayload } from '../../repos/dapr-docs-copilot/src/lib/translation-integrity-models.ts'

const ZH_SOURCE_PREFIX = 'translations/docs-zh/translated_content/zh_CN/'

const MIME_BY_EXTENSION: Record<string, string> = {
  '.css': 'text/css',
  '.htm': 'text/html',
  '.html': 'text/html',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.markdown': 'text/markdown',
  '.md': 'text/markdown',
  '.png': 'image/png',
  '.py': 'text/x-python',
  '.sh': 'text/x-shellscript',
  '.svg': 'image/svg+xml',
  '.toml': 'application/toml',
  '.ts': 'text/typescript',
  '.tsx': 'text/tsx',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.yaml': 'application/yaml',
  '.yml': 'application/yaml',
}

const DEFAULT_GLOSSARY_TERMS = [
  {
    source: 'building block',
    target: '构建块',
    category: 'product',
    status: 'approved',
    notes: '对应 Dapr 核心能力分类。',
  },
  {
    source: 'sidecar',
    target: '边车',
    category: 'architecture',
    status: 'approved',
    notes: '沿用 Kubernetes 与 Dapr 常用译法。',
  },
  {
    source: 'service invocation',
    target: '服务调用',
    category: 'api',
    status: 'approved',
    notes: '与运行时 API 名称保持一致。',
  },
  {
    source: 'state store',
    target: '状态存储',
    category: 'component',
    status: 'approved',
    notes: '用于组件类型与文档标题。',
  },
  {
    source: 'pub/sub',
    target: '发布订阅',
    category: 'messaging',
    status: 'approved',
    notes: '保留 slash 形式的英文缩写。',
  },
  {
    source: 'workflow',
    target: '工作流',
    category: 'product',
    status: 'approved',
    notes: '与工作流 API 和页面文案一致。',
  },
  {
    source: 'drift',
    target: '漂移',
    category: 'quality',
    status: 'review',
    notes: '用于表示源文与译文更新节奏偏差。',
  },
  {
    source: 'pluggable component',
    target: '可插拔组件',
    category: 'component',
    status: 'approved',
    notes: '与 pluggable-components 目录语义保持一致。',
  },
] as const

export type Mount = {
  source: string
  target: string
  lang?: string
}

export type BucketConfig = {
  bucket: string
  targetMount: string
  sourceRoots: string[]
  translationRoot: string
  sourceDirectory: string
}

type SourceItem = {
  bucket: string
  relativePath: string
  sourcePath: string
  sourceFile: string
  targetMount: string
  sourceSha256: string
  mimeType: string
  sizeBytes: number
  copiedAt: string
  sourceUpdatedAt: string | null
}

type SourceSyncStatus = 'synced' | 'drift' | 'missingSource'

type TranslationStatus = 'translated' | 'staleTranslation' | 'missingTranslation' | 'orphanTranslation'

type SyncItem = {
  version: string
  bucket: string
  relativePath: string
  sourcePath: string | null
  sourceFile: string | null
  sourceSha256: string | null
  mirroredSha256: string | null
  status: SourceSyncStatus
  sourceStatus: SourceSyncStatus
  translationStatus: TranslationStatus
  translationFile: string | null
  translationUpdatedAt: string | null
  sourceUpdatedAt: string | null
  syncedAt: string
  lastCheckedAt: string
}

type FailureRecord = {
  bucket: string
  sourceRoot: string
  relativePath: string
  error: string
}

type TranslationItem = {
  bucket: string
  relativePath: string
  translationFile: string
  translationUpdatedAt: string | null
}

type BuildPipelineOptions = {
  sourceRepo: string
  zhRepo: string
  hugoConfigPath: string
  version: string
  generatedAt: string
}

class PipelineError extends Error {}

function workspaceRelative(targetPath: string, workspaceRoot: string): string {
  const resolvedTarget = resolve(targetPath)
  const resolvedRoot = resolve(workspaceRoot)
  const relativePath = relative(resolvedRoot, resolvedTarget)
  return relativePath && !relativePath.startsWith('..') ? toPosix(relativePath) : toPosix(resolvedTarget)
}

function toPosix(value: string): string {
  return value.replaceAll('\\', '/')
}

function getMimeType(filePath: string): string {
  return MIME_BY_EXTENSION[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
}

function sha256File(filePath: string): string {
  const hash = createHash('sha256')
  hash.update(readFileSync(filePath))
  return hash.digest('hex')
}

function writeJson(filePath: string, payload: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
}

function copySourceFile(sourcePath: string, targetPath: string): void {
  mkdirSync(dirname(targetPath), { recursive: true })
  copyFileSync(sourcePath, targetPath)
}

function removeFileAndEmptyParents(filePath: string, stopAt: string): void {
  rmSync(filePath, { force: true })

  const resolvedStopAt = resolve(stopAt)
  let current = dirname(filePath)
  while (resolve(current) !== resolvedStopAt) {
    const relativeToStop = relative(resolvedStopAt, current)
    if (relativeToStop === '' || relativeToStop.startsWith('..')) {
      break
    }
    if (readdirSync(current).length > 0) {
      break
    }

    rmSync(current, { recursive: true, force: true })
    current = dirname(current)
  }
}

function verifySourceItem(
  item: Pick<SourceItem, 'sourceFile' | 'sourceSha256'>,
  zhRepo: string,
): Pick<SyncItem, 'status' | 'sourceStatus' | 'mirroredSha256'> {
  const mirrorPath = join(zhRepo, item.sourceFile)
  if (!existsSync(mirrorPath)) {
    return {
      status: 'missingSource',
      sourceStatus: 'missingSource',
      mirroredSha256: null,
    }
  }

  const mirroredSha256 = sha256File(mirrorPath)
  const sourceStatus = mirroredSha256 === item.sourceSha256 ? 'synced' : 'drift'
  return {
    status: sourceStatus,
    sourceStatus,
    mirroredSha256,
  }
}

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

function ensureGlossary(glossaryPath: string, version: string, generatedAt: string) {
  const terms = existsSync(glossaryPath)
    ? (readJson<{ terms?: typeof DEFAULT_GLOSSARY_TERMS }>(glossaryPath).terms ?? [...DEFAULT_GLOSSARY_TERMS])
    : [...DEFAULT_GLOSSARY_TERMS]

  const glossary = {
    version,
    generatedAt,
    terms,
  }
  writeJson(glossaryPath, glossary)
  return glossary
}

function walkFiles(rootPath: string): string[] {
  if (!existsSync(rootPath)) {
    return []
  }

  const result: string[] = []
  const stack = [rootPath]
  while (stack.length > 0) {
    const current = stack.pop()!
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = join(current, entry.name)
      if (entry.isDirectory()) {
        stack.push(fullPath)
      } else if (entry.isFile()) {
        result.push(fullPath)
      }
    }
  }

  result.sort((left, right) => left.localeCompare(right))
  return result
}

function compareIsoTime(left: string | null | undefined, right: string | null | undefined): number {
  if (!left || !right) {
    return Number.NaN
  }

  const leftTime = new Date(left).getTime()
  const rightTime = new Date(right).getTime()
  if (Number.isNaN(leftTime) || Number.isNaN(rightTime)) {
    return Number.NaN
  }

  return leftTime - rightTime
}

function resolveTranslationStatus(translationUpdatedAt: string | null, syncedAt: string): TranslationStatus {
  if (!translationUpdatedAt) {
    return 'staleTranslation'
  }

  return compareIsoTime(translationUpdatedAt, syncedAt) > 0 ? 'translated' : 'staleTranslation'
}

function parseYamlKeyValue(line: string): [string, string] {
  const index = line.indexOf(':')
  if (index === -1) {
    return [line.trim(), '']
  }
  return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '')]
}

export function parseMounts(hugoConfigPath: string): Mount[] {
  const lines = readFileSync(hugoConfigPath, 'utf-8').split(/\r?\n/)
  const mounts: Mount[] = []
  let inModule = false
  let inMounts = false
  let moduleIndent = 0
  let mountsIndent = 0
  let current: Partial<Mount> = {}

  for (const rawLine of lines) {
    const stripped = rawLine.trimStart()
    if (!stripped || stripped.startsWith('#')) {
      continue
    }

    const indent = rawLine.length - stripped.length
    if (!inModule) {
      if (stripped === 'module:') {
        inModule = true
        moduleIndent = indent
      }
      continue
    }

    if (!inMounts) {
      if (indent <= moduleIndent && stripped.endsWith(':') && stripped !== 'module:') {
        inModule = false
        continue
      }
      if (stripped === 'mounts:') {
        inMounts = true
        mountsIndent = indent
      }
      continue
    }

    if (indent <= mountsIndent && !stripped.startsWith('- ')) {
      if (current.source) {
        mounts.push({
          source: current.source,
          target: current.target ?? '',
          lang: current.lang,
        })
        current = {}
      }
      break
    }

    if (stripped.startsWith('- ')) {
      if (current.source) {
        mounts.push({
          source: current.source,
          target: current.target ?? '',
          lang: current.lang,
        })
      }
      const [key, value] = parseYamlKeyValue(stripped.slice(2))
      current = { [key]: value }
      continue
    }

    const [key, value] = parseYamlKeyValue(stripped)
    current = { ...current, [key]: value }
  }

  if (current.source) {
    mounts.push({
      source: current.source,
      target: current.target ?? '',
      lang: current.lang,
    })
  }

  return mounts
}

export function buildBucketConfigs(mounts: Mount[]): BucketConfig[] {
  const zhByTarget = new Map<string, Mount>()
  const enByBucket = new Map<string, string[]>()
  const targetByBucket = new Map<string, string>()

  for (const mount of mounts) {
    const target = mount.target.replace(/\/+$/, '')
    if (mount.lang === 'zh-hans' && mount.source.startsWith(ZH_SOURCE_PREFIX)) {
      zhByTarget.set(target, mount)
    }
  }

  for (const mount of mounts) {
    const target = mount.target.replace(/\/+$/, '')
    if (mount.lang !== 'en' || !target.startsWith('content')) {
      continue
    }
    const zhMount = zhByTarget.get(target)
    if (!zhMount) {
      continue
    }
    const bucket = zhMount.source.slice(ZH_SOURCE_PREFIX.length).replace(/^\/+|\/+$/g, '')
    const sourceRoots = enByBucket.get(bucket) ?? []
    sourceRoots.push(mount.source.replace(/^\/+|\/+$/g, ''))
    enByBucket.set(bucket, sourceRoots)
    targetByBucket.set(bucket, target)
  }

  return [...enByBucket.keys()]
    .sort((left, right) => left.localeCompare(right))
    .map((bucket) => ({
      bucket,
      targetMount: targetByBucket.get(bucket) ?? '',
      sourceRoots: [...new Set(enByBucket.get(bucket) ?? [])].sort((left, right) => left.localeCompare(right)),
      translationRoot: `translated_content/zh_CN/${bucket}`,
      sourceDirectory: `data/source/${bucket}`,
    }))
}

class GitMetadata {
  private isRepoCache: boolean | null = null
  private branchCache: string | null = null
  private timestampCache = new Map<string, string | null>()

  constructor(private readonly repoRoot: string) {}

  isRepo(): boolean {
    if (this.isRepoCache !== null) {
      return this.isRepoCache
    }

    const result = spawnSync('git', ['-C', this.repoRoot, 'rev-parse', '--is-inside-work-tree'], {
      encoding: 'utf-8',
    })
    this.isRepoCache = result.status === 0 && result.stdout.trim() === 'true'
    return this.isRepoCache
  }

  branch(): string {
    if (this.branchCache) {
      return this.branchCache
    }

    const configuredBranch = process.env.SOURCE_REPO_BRANCH
    if (configuredBranch) {
      this.branchCache = configuredBranch
      return configuredBranch
    }

    if (!this.isRepo()) {
      this.branchCache = resolve(this.repoRoot).split('/').at(-1) ?? 'main'
      return this.branchCache
    }

    const result = spawnSync('git', ['-C', this.repoRoot, 'rev-parse', '--abbrev-ref', 'HEAD'], {
      encoding: 'utf-8',
    })
    const branch = result.status === 0 ? result.stdout.trim() : ''
    this.branchCache = branch && branch !== 'HEAD' ? branch : resolve(this.repoRoot).split('/').at(-1) ?? 'main'
    return this.branchCache
  }

  lastUpdatedAt(relativePath: string, fallbackFilePath?: string): string | null {
    if (this.timestampCache.has(relativePath)) {
      return this.timestampCache.get(relativePath) ?? null
    }

    let value: string | null = null
    if (this.isRepo()) {
      const result = spawnSync('git', ['-C', this.repoRoot, 'log', '-1', '--format=%cI', '--', relativePath], {
        encoding: 'utf-8',
      })
      if (result.status === 0) {
        value = result.stdout.trim() || null
      }
    }

    if (!value && fallbackFilePath && existsSync(fallbackFilePath)) {
      value = new Date(statSync(fallbackFilePath).mtimeMs).toISOString()
    }

    this.timestampCache.set(relativePath, value)
    return value
  }
}

export async function buildPipeline(options: BuildPipelineOptions) {
  const sourceRepo = resolve(options.sourceRepo)
  const zhRepo = resolve(options.zhRepo)
  const hugoConfigPath = resolve(options.hugoConfigPath)

  if (!existsSync(sourceRepo)) {
    throw new PipelineError(`source repo not found: ${sourceRepo}`)
  }
  if (!existsSync(zhRepo)) {
    throw new PipelineError(`zh repo not found: ${zhRepo}`)
  }
  if (!existsSync(hugoConfigPath)) {
    throw new PipelineError(`hugo config not found: ${hugoConfigPath}`)
  }

  const dataDir = join(zhRepo, 'data')
  const sourceDir = join(dataDir, 'source')
  const glossaryPath = join(dataDir, 'glossary.json')
  const sourceMetadataPath = join(dataDir, 'source.json')
  const syncStatusPath = join(dataDir, 'sync-status.json')
  const sourceManifestPath = join(dataDir, 'source-manifest.json')
  const copyLogPath = join(dataDir, 'copy-log.json')

  const mounts = parseMounts(hugoConfigPath)
  const bucketConfigs = buildBucketConfigs(mounts)
  if (bucketConfigs.length === 0) {
    throw new PipelineError('no zh-aware content buckets were found in hugo mounts')
  }

  const workspaceRoot = resolve(zhRepo, '..', '..')
  const sourceRepoLabel = workspaceRelative(sourceRepo, workspaceRoot)
  const sourceGit = new GitMetadata(sourceRepo)
  const zhGit = new GitMetadata(zhRepo)
  const sourceBranch = sourceGit.branch()
  const batchId = `batch-${options.generatedAt.replaceAll(':', '').replaceAll('-', '').replaceAll('+', '-')}`

  rmSync(sourceDir, { recursive: true, force: true })
  rmSync(join(dataDir, 'source-documents'), { recursive: true, force: true })
  rmSync(copyLogPath, { force: true })

  const sourceItems: SourceItem[] = []
  const syncItems: SyncItem[] = []
  const manifestBuckets: Array<Record<string, unknown>> = []
  const failures: FailureRecord[] = []
  const translationItemsByKey = new Map<string, TranslationItem>()

  for (const config of bucketConfigs) {
    const translationRoot = join(zhRepo, config.translationRoot)
    for (const filePath of walkFiles(translationRoot)) {
      const relativePath = toPosix(relative(translationRoot, filePath))
      const translationFile = toPosix(relative(zhRepo, filePath))
      const translationUpdatedAt = zhGit.lastUpdatedAt(translationFile, filePath)
      translationItemsByKey.set(`${config.bucket}:${relativePath}`, {
        bucket: config.bucket,
        relativePath,
        translationFile,
        translationUpdatedAt,
      })
    }
  }

  for (const config of bucketConfigs) {
    let bucketDocumentCount = 0

    for (const sourceRootRelative of config.sourceRoots) {
      const sourceRoot = join(sourceRepo, sourceRootRelative)
      if (!existsSync(sourceRoot)) {
        failures.push({
          bucket: config.bucket,
          sourceRoot: sourceRootRelative,
          relativePath: '',
          error: 'source root missing',
        })
        continue
      }

      for (const filePath of walkFiles(sourceRoot)) {
        const relativePath = toPosix(relative(sourceRoot, filePath))
        const sourceRelativePath = toPosix(relative(sourceRepo, filePath))
        const sourceFilePath = join(sourceDir, config.bucket, relativePath)
        const sourceFileRelativePath = toPosix(relative(zhRepo, sourceFilePath))

        try {
          const sourceSha256 = sha256File(filePath)
          const mimeType = getMimeType(filePath)
          const sourceUpdatedAt = sourceGit.lastUpdatedAt(sourceRelativePath, filePath)
          bucketDocumentCount += 1

          const sourceItem: SourceItem = {
            bucket: config.bucket,
            relativePath,
            sourcePath: sourceRelativePath,
            sourceFile: sourceFileRelativePath,
            targetMount: config.targetMount,
            sourceSha256,
            mimeType,
            sizeBytes: statSync(filePath).size,
            copiedAt: options.generatedAt,
            sourceUpdatedAt,
          }
          sourceItems.push(sourceItem)

          copySourceFile(filePath, sourceFilePath)
        } catch (error) {
          failures.push({
            bucket: config.bucket,
            sourceRoot: sourceRootRelative,
            relativePath,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    }

    manifestBuckets.push({
      id: config.bucket,
      targetMount: config.targetMount,
      sourceRoots: config.sourceRoots,
      translationRoot: config.translationRoot,
      sourceDirectory: config.sourceDirectory,
      documentCount: bucketDocumentCount,
    })
  }

  sourceItems.sort((left, right) => `${left.bucket}:${left.relativePath}`.localeCompare(`${right.bucket}:${right.relativePath}`))
  syncItems.push(
    ...sourceItems.map((item) => {
      const verification = verifySourceItem(item, zhRepo)
      const translationKey = `${item.bucket}:${item.relativePath}`
      const translation = translationItemsByKey.get(translationKey)
      if (translation) {
        translationItemsByKey.delete(translationKey)
      }

      return {
        version: options.version,
        bucket: item.bucket,
        relativePath: item.relativePath,
        sourcePath: item.sourcePath,
        sourceFile: item.sourceFile,
        sourceSha256: item.sourceSha256,
        mirroredSha256: verification.mirroredSha256,
        status: verification.status,
        sourceStatus: verification.sourceStatus,
        translationStatus: translation ? resolveTranslationStatus(translation.translationUpdatedAt, options.generatedAt) : 'missingTranslation',
        translationFile: translation?.translationFile ?? null,
        translationUpdatedAt: translation?.translationUpdatedAt ?? null,
        sourceUpdatedAt: item.sourceUpdatedAt,
        syncedAt: options.generatedAt,
        lastCheckedAt: options.generatedAt,
      } satisfies SyncItem
    }),
  )
  for (const item of translationItemsByKey.values()) {
    const translationPath = join(zhRepo, item.translationFile)
    const bucket = bucketConfigs.find((config) => config.bucket === item.bucket)
    if (!bucket) {
      continue
    }

    removeFileAndEmptyParents(translationPath, join(zhRepo, bucket.translationRoot))
  }
  syncItems.sort((left, right) => `${left.bucket}:${left.relativePath}`.localeCompare(`${right.bucket}:${right.relativePath}`))

  const bucketSummaryById = new Map(
    manifestBuckets.map((bucket) => [
      String(bucket.id),
      {
        synced: 0,
        drift: 0,
        missingSource: 0,
        translated: 0,
        staleTranslation: 0,
        missingTranslation: 0,
        orphanTranslation: 0,
      },
    ]),
  )
  const sourceSummary = syncItems.reduce(
    (current, item) => {
      current[item.sourceStatus] += 1
      const bucketSummary = bucketSummaryById.get(item.bucket)
      if (bucketSummary) {
        bucketSummary[item.sourceStatus] += 1
      }
      return current
    },
    { synced: 0, drift: 0, missingSource: 0 },
  )
  const translationSummary = syncItems.reduce(
    (current, item) => {
      current[item.translationStatus] += 1
      const bucketSummary = bucketSummaryById.get(item.bucket)
      if (bucketSummary) {
        bucketSummary[item.translationStatus] += 1
      }
      return current
    },
    { translated: 0, staleTranslation: 0, missingTranslation: 0, orphanTranslation: 0 },
  )

  manifestBuckets.forEach((bucket) => {
    const bucketSummary = bucketSummaryById.get(String(bucket.id))
    bucket.syncedCount = bucketSummary?.synced ?? 0
    bucket.driftCount = bucketSummary?.drift ?? 0
    bucket.missingSourceCount = bucketSummary?.missingSource ?? 0
    bucket.translatedCount = bucketSummary?.translated ?? 0
    bucket.staleTranslationCount = bucketSummary?.staleTranslation ?? 0
    bucket.missingTranslationCount = bucketSummary?.missingTranslation ?? 0
    bucket.orphanTranslationCount = bucketSummary?.orphanTranslation ?? 0
  })
  manifestBuckets.sort((left, right) => String(left.id).localeCompare(String(right.id)))

  const source = {
    version: options.version,
    generatedAt: options.generatedAt,
    sourceRepo: sourceRepoLabel,
    sourceBranch,
    copiedAt: options.generatedAt,
    sourceRoot: 'data/source',
    documentCount: sourceItems.length,
    bucketCount: manifestBuckets.length,
    buckets: manifestBuckets,
    items: sourceItems,
  }
  writeJson(sourceMetadataPath, source)

  const sourceManifest = {
    version: options.version,
    sourceRepo: sourceRepoLabel,
    sourceBranch,
    batchId,
    copiedAt: options.generatedAt,
    sourceRoot: 'data/source',
    metadataFile: 'data/source.json',
    documentCount: sourceItems.length,
    failureCount: failures.length,
    buckets: manifestBuckets,
    failures,
  }
  writeJson(sourceManifestPath, sourceManifest)

  const rawSyncStatus: SyncStatusPayload = {
    version: options.version,
    generatedAt: options.generatedAt,
    syncedAt: options.generatedAt,
    summary: sourceSummary,
    sourceSummary,
    translationSummary,
    items: syncItems,
  }

  const glossary = ensureGlossary(glossaryPath, options.version, options.generatedAt)
  const currentBatch = {
    id: batchId,
    sourceRepo: sourceManifest.sourceRepo,
    sourceBranch,
    copiedAt: options.generatedAt,
    documentCount: sourceItems.length,
    bucketCount: manifestBuckets.length,
    failureCount: failures.length,
    statusSummary: rawSyncStatus.sourceSummary,
    translationSummary: rawSyncStatus.translationSummary,
    status: failures.length > 0 ? 'completed_with_errors' : 'completed',
    failures,
  }
  const translationState = existsSync(join(dataDir, 'translation-state.json'))
    ? readJson<TranslationStatePayload>(join(dataDir, 'translation-state.json'))
    : {
        version: options.version,
        items: [],
      }
  const reconciled = await reconcileTranslationIntegrity({
    repoPath: zhRepo,
    version: options.version,
    generatedAt: options.generatedAt,
    source,
    syncStatus: rawSyncStatus,
    translationState,
    batchSeed: currentBatch,
  })
  writeJson(syncStatusPath, reconciled.syncStatus)
  writeJson(sourceMetadataPath, reconciled.source)
  writeJson(join(dataDir, 'integrity-report.json'), reconciled.integrityReport)
  rmSync(copyLogPath, { force: true })

  return {
    glossary,
    source: reconciled.source,
    syncStatus: reconciled.syncStatus,
    sourceManifest,
    copyLog: reconciled.copyLog,
  }
}

function parseCliArgs() {
  const { values } = parseArgs({
    options: {
      'source-repo': { type: 'string', default: 'repos/v1.17' },
      'zh-repo': { type: 'string', default: 'repos/v1.17_zh' },
      'hugo-config': { type: 'string' },
      version: { type: 'string', default: 'v1.17' },
      timestamp: { type: 'string' },
    },
  })

  return {
    sourceRepo: values['source-repo'] ?? 'repos/v1.17',
    zhRepo: values['zh-repo'] ?? 'repos/v1.17_zh',
    hugoConfigPath: values['hugo-config'] ?? join(values['source-repo'] ?? 'repos/v1.17', 'hugo.yaml'),
    version: values.version ?? 'v1.17',
    generatedAt: values.timestamp ?? new Date().toISOString(),
  }
}

export async function main(): Promise<number> {
  const options = parseCliArgs()
  await buildPipeline(options)
  console.log(`generated zh pipeline datasets at ${resolve(options.zhRepo, 'data')}`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main()
}
