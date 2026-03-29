import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, readFileSync, utimesSync } from 'node:fs'
import { dirname, join } from 'node:path'
import test from 'node:test'
import { tmpdir } from 'node:os'
import { buildBucketConfigs, buildPipeline, parseMounts } from '../sync_source_documents.ts'

function writeText(filePath: string, content: string) {
  mkdirSync(dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, 'utf-8')
}

test('buildBucketConfigs derives buckets from hugo mounts', () => {
  const root = mkdtempSync(join(tmpdir(), 'zh-sync-'))
  try {
    const hugoPath = join(root, 'hugo.yaml')
    writeText(
      hugoPath,
      [
        'module:',
        '  mounts:',
        '    - source: daprdocs/content/en',
        '      target: content',
        '      lang: en',
        '    - source: sdkdocs/python/content/en/python-sdk-docs',
        '      target: content/developing-applications/sdks/python',
        '      lang: en',
        '    - source: sdkdocs/python/content/en/python-sdk-contributing',
        '      target: content/contributing/sdk-contrib/',
        '      lang: en',
        '    - source: translations/docs-zh/translated_content/zh_CN/docs',
        '      target: content',
        '      lang: zh-hans',
        '    - source: translations/docs-zh/translated_content/zh_CN/sdks_python',
        '      target: content/developing-applications/sdks/python',
        '      lang: zh-hans',
        '    - source: translations/docs-zh/translated_content/zh_CN/contributing',
        '      target: content/contributing/sdk-contrib/',
        '      lang: zh-hans',
      ].join('\n'),
    )

    const buckets = Object.fromEntries(buildBucketConfigs(parseMounts(hugoPath)).map((item) => [item.bucket, item]))
    assert.deepEqual(Object.keys(buckets).sort(), ['contributing', 'docs', 'sdks_python'])
    assert.deepEqual(buckets.docs.sourceRoots, ['daprdocs/content/en'])
    assert.deepEqual(buckets.sdks_python.sourceRoots, ['sdkdocs/python/content/en/python-sdk-docs'])
    assert.deepEqual(buckets.contributing.sourceRoots, ['sdkdocs/python/content/en/python-sdk-contributing'])
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('buildPipeline keeps relativePath stable and writes JSON', async () => {
  const root = mkdtempSync(join(tmpdir(), 'zh-sync-'))
  const sourceRepo = join(root, 'source')
  const zhRepo = join(root, 'zh')
  mkdirSync(sourceRepo, { recursive: true })
  mkdirSync(zhRepo, { recursive: true })

  try {
    const hugoPath = join(sourceRepo, 'hugo.yaml')
    writeText(
      hugoPath,
      [
        'module:',
        '  mounts:',
        '    - source: daprdocs/content/en',
        '      target: content',
        '      lang: en',
        '    - source: sdkdocs/python/content/en/python-sdk-docs',
        '      target: content/developing-applications/sdks/python',
        '      lang: en',
        '    - source: sdkdocs/python/content/en/python-sdk-contributing',
        '      target: content/contributing/sdk-contrib/',
        '      lang: en',
        '    - source: translations/docs-zh/translated_content/zh_CN/docs',
        '      target: content',
        '      lang: zh-hans',
        '    - source: translations/docs-zh/translated_content/zh_CN/sdks_python',
        '      target: content/developing-applications/sdks/python',
        '      lang: zh-hans',
        '    - source: translations/docs-zh/translated_content/zh_CN/contributing',
        '      target: content/contributing/sdk-contrib/',
        '      lang: zh-hans',
      ].join('\n'),
    )

    writeText(join(sourceRepo, 'daprdocs/content/en/getting-started/install.md'), '# install\n')
    writeText(join(sourceRepo, 'sdkdocs/python/content/en/python-sdk-docs/_index.md'), '# sdk\n')
    writeText(join(sourceRepo, 'sdkdocs/python/content/en/python-sdk-contributing/python.md'), '# contribute\n')
    writeText(join(zhRepo, 'data/source/stale/orphan.md'), '# stale\n')
    writeText(join(zhRepo, 'translated_content/zh_CN/docs/getting-started/install.md'), '# translated install\n')
    writeText(join(zhRepo, 'translated_content/zh_CN/contributing/python.md'), '# stale contribute\n')
    writeText(join(zhRepo, 'translated_content/zh_CN/docs/orphan.md'), '# orphan translation\n')
    utimesSync(
      join(zhRepo, 'translated_content/zh_CN/docs/getting-started/install.md'),
      new Date('2026-03-28T15:12:00Z'),
      new Date('2026-03-28T15:12:00Z'),
    )
    utimesSync(
      join(zhRepo, 'translated_content/zh_CN/contributing/python.md'),
      new Date('2026-03-28T12:00:00Z'),
      new Date('2026-03-28T12:00:00Z'),
    )
    utimesSync(
      join(zhRepo, 'translated_content/zh_CN/docs/orphan.md'),
      new Date('2026-03-28T16:00:00Z'),
      new Date('2026-03-28T16:00:00Z'),
    )

    const payloads = await buildPipeline({
      sourceRepo,
      zhRepo,
      hugoConfigPath: hugoPath,
      version: 'v1.17',
      generatedAt: '2026-03-28T14:08:00Z',
    })

    const dataDir = join(zhRepo, 'data')
    for (const filePath of [
      join(dataDir, 'sync-status.json'),
      join(dataDir, 'glossary.json'),
      join(dataDir, 'source.json'),
      join(dataDir, 'source-manifest.json'),
      join(dataDir, 'source/docs/getting-started/install.md'),
      join(dataDir, 'source/sdks_python/_index.md'),
      join(dataDir, 'source/contributing/python.md'),
    ]) {
      assert.equal(existsSync(filePath), true, `missing file: ${filePath}`)
      if (filePath.endsWith('.json')) {
        JSON.parse(readFileSync(filePath, 'utf-8'))
      }
    }

    const syncItems = payloads.syncStatus.items as Array<Record<string, string | null>>
    const byKey = new Map(syncItems.map((item) => [`${item.bucket}:${item.relativePath}`, item]))
    assert.ok(byKey.has('docs:getting-started/install.md'))
    assert.ok(byKey.has('sdks_python:_index.md'))
    assert.ok(byKey.has('contributing:python.md'))
    assert.equal(byKey.has('docs:orphan.md'), false)
    assert.equal(byKey.get('contributing:python.md')?.status, 'synced')
    assert.equal(byKey.get('contributing:python.md')?.sourceStatus, 'synced')
    assert.equal(byKey.get('contributing:python.md')?.sourceFile, 'data/source/contributing/python.md')
    assert.equal(byKey.get('contributing:python.md')?.mirroredSha256, byKey.get('contributing:python.md')?.sourceSha256)
    assert.equal(byKey.get('docs:getting-started/install.md')?.translationStatus, 'translated')
    assert.equal(byKey.get('docs:getting-started/install.md')?.translationFile, 'translated_content/zh_CN/docs/getting-started/install.md')
    assert.equal(byKey.get('contributing:python.md')?.translationStatus, 'staleTranslation')
    assert.equal(byKey.get('sdks_python:_index.md')?.translationStatus, 'missingTranslation')
    assert.equal(existsSync(join(dataDir, 'source/stale/orphan.md')), false)
    assert.equal(existsSync(join(zhRepo, 'translated_content/zh_CN/docs/orphan.md')), false)

    const sourceMetadata = JSON.parse(readFileSync(join(dataDir, 'source.json'), 'utf-8')) as {
      items: Array<Record<string, string>>
    }
    const docsItem = sourceMetadata.items.find((item) => item.bucket === 'docs')
    assert.ok(docsItem)
    if (!docsItem) {
      throw new Error('expected docs item in source metadata')
    }
    assert.equal(docsItem.relativePath, 'getting-started/install.md')
    assert.equal(docsItem.sourceFile, 'data/source/docs/getting-started/install.md')
    assert.equal(byKey.get(`${docsItem.bucket}:${docsItem.relativePath}`)?.sourceFile, docsItem.sourceFile)
    assert.equal(readFileSync(join(zhRepo, docsItem.sourceFile), 'utf-8'), '# install\n')

    assert.equal(existsSync(join(dataDir, 'copy-log.json')), false)
    assert.deepEqual((payloads.syncStatus as { sourceSummary: Record<string, number> }).sourceSummary, {
      synced: 3,
      drift: 0,
      missingSource: 0,
    })
    assert.deepEqual((payloads.syncStatus as { translationSummary: Record<string, number> }).translationSummary, {
      translated: 1,
      staleTranslation: 1,
      missingTranslation: 1,
      orphanTranslation: 0,
    })
    assert.equal((payloads.source as { documentCount: number }).documentCount, 3)
    assert.equal((payloads.sourceManifest as { failureCount: number }).failureCount, 0)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
