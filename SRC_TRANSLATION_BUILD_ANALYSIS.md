# src 目录旧版翻译与构建机制分析

## 文档目的

本文用于沉淀当前仓库中 `src` 目录的历史职责、版本组织方式、翻译链路与构建链路。

目标有三：

1. 说明 `src` 中原始内容是如何组织的。
2. 说明旧流程如何处理不同版本、翻译与构建。
3. 为后续“新管理界面”设计提供约束依据，避免误把历史快照当成真实构建源。

本文偏 `Explanation + Reference`，面向后续维护者、管理界面开发者与流程迁移人员。

---

## 一、结论摘要

`src` 并不是当前官方站点的直接构建入口，而更像一份“翻译工作快照”。

旧流程的核心可概括为三段：

1. 从某个指定版本的上游源码仓中抽取英文内容，聚合到 `src/content`。
2. 以相同的相对路径，在 `src/translated_content/zh_CN` 中维护中文译文。
3. 在构建阶段，将中文目录挂载进 Hugo，生成中文站点。

多版本管理并不发生在 `src` 内，而是发生在根目录的 `repos/*` 与 `monospecs.yaml` 中。也就是说：

- `src` 解决的是“内容汇总与翻译映射”。
- `repos/*` 解决的是“版本选择与仓库角色管理”。

因此，后续新管理界面不应只围绕 `src` 设计，而应显式建模：

- 版本
- 仓库角色
- 内容分组
- 相对路径
- 构建映射

---

## 二、当前仓库中的核心对象

### 2.1 根目录仓库编排

根目录通过 `monospecs.yaml` 管理多个版本与多个角色的仓库：

- `repos/v1.15`：上游官方英文源码仓
- `repos/fork-v1.15`：dapr-cn 的 fork
- `repos/v1.15_zh`：官方中文翻译仓
- `repos/v1.17`：上游官方英文源码仓
- `repos/fork-v1.17`：dapr-cn 的 fork
- `repos/v1.17_zh`：官方中文翻译仓

对应配置见：

- `monospecs.yaml:8`
- `monospecs.yaml:27`
- `monospecs.yaml:39`

这说明“一个版本”至少包含三类仓库角色：

| 角色 | 含义 | 典型路径 |
| --- | --- | --- |
| upstream | 官方源内容 | `repos/v1.17` |
| fork | 中文团队 fork，用于 PR 或流程中转 | `repos/fork-v1.17` |
| zh-official | 中文翻译仓 | `repos/v1.17_zh` |

---

### 2.2 `src` 的目录职责

当前 `src` 结构主要分为三部分：

- `src/content`：英文聚合内容
- `src/translated_content/zh_CN`：中文翻译内容
- `src/scripts`：历史同步、构建辅助脚本

其中：

- `src/content` 下共有 563 个文件
- `src/translated_content/zh_CN` 下共有 563 个文件
- 两侧相对路径集合一致，可视为一一对应的翻译镜像

当前一级分类如下：

- `docs`
- `contributing`
- `sdks_dotnet`
- `sdks_go`
- `sdks_java`
- `sdks_js`
- `sdks_php`
- `sdks_python`
- `sdks_rust`
- `pluggable-components`

这说明旧系统在 `src` 内部，并不是保留 Hugo 构建时的真实挂载路径，而是采用“按内容桶归档”的工作目录结构。

---

## 三、旧版内容聚合机制

### 3.1 入口脚本

旧流程的入口是：

- `src/scripts/tasks.py:41`

关键任务为：

- `update_source`
- `update_files_for_building`
- `clean_translations`

---

### 3.2 `update_source` 的工作方式

`update_source` 的逻辑见：

- `src/scripts/tasks.py:42`
- `src/scripts/tasks.py:52`
- `src/scripts/tasks.py:67`

其流程如下：

1. 删除并重建 `src/content`
2. 从指定源仓复制英文主站内容
3. 遍历 `sdkdocs`，复制各 SDK 文档与 contributing 文档
4. 对英文 markdown 中的 `aliases` 做批量重写

默认源仓是：

- `src/scripts/tasks.py:12`

即：

- `repos/v1.17`

也可通过环境变量覆盖：

- `SOURCE_REPO_DIR`
- `SOURCE_REPO_BRANCH`

对应逻辑见：

- `src/scripts/tasks.py:15`
- `src/scripts/tasks.py:29`

---

### 3.3 主站英文内容的来源

旧脚本将主站英文文档从以下路径复制到 `src/content/docs`：

- 源：`<source_repo>/daprdocs/content/en`
- 目标：`src/content/docs`

对应代码：

- `src/scripts/tasks.py:53`
- `src/scripts/tasks.py:54`

因此，`src/content/docs` 实际上是“官方主站 docs 内容”的抽取结果。

---

### 3.4 SDK 内容的来源

旧脚本随后遍历 `sdkdocs`，将 SDK 内容抽取为多个内容桶：

| 源内容 | `src` 目标 |
| --- | --- |
| `sdkdocs/python/.../python-sdk-docs` | `src/content/sdks_python` |
| `sdkdocs/php/.../php-sdk-docs` | `src/content/sdks_php` |
| `sdkdocs/dotnet/.../dotnet-sdk-docs` | `src/content/sdks_dotnet` |
| `sdkdocs/go/.../go-sdk-docs` | `src/content/sdks_go` |
| `sdkdocs/java/.../java-sdk-docs` | `src/content/sdks_java` |
| `sdkdocs/js/.../js-sdk-docs` | `src/content/sdks_js` |
| `sdkdocs/rust/.../rust-sdk-docs` | `src/content/sdks_rust` |
| `sdkdocs/pluggable-components/*/...` | `src/content/pluggable-components/*` |

相关代码见：

- `src/scripts/tasks.py:69`
- `src/scripts/tasks.py:72`
- `src/scripts/tasks.py:81`

若某 SDK 存在 `*-sdk-contributing` 目录，则统一合并到：

- `src/content/contributing`

对应逻辑：

- `src/scripts/tasks.py:85`
- `src/scripts/tasks.py:90`

这说明旧系统在 `src` 内做了一次“内容再归类”，而非简单镜像上游目录。

---

## 四、翻译机制

### 4.1 翻译数据模型本质

旧翻译模型非常简单：

- 英文源文件在 `src/content`
- 中文译文在 `src/translated_content/zh_CN`
- 二者以相同相对路径建立映射

历史 `crowdin.yml` 亦证明了这一点，其规则为：

- source：`/content/**/*.*`
- translation：`/translated_content/%locale_with_underscore%/**/%original_file_name%`

可见：

1. 翻译系统并不关心版本语义
2. 它只关心“源路径”和“译文路径”的镜像关系

因此，后续管理界面若要支持翻译管理，最稳的页面主键应是：

- `version + locale + relative_path`

---

### 4.2 中文目录与英文目录的一一对应

当前仓库中：

- `src/content`
- `src/translated_content/zh_CN`

文件数相同，且相对路径集合一致。

这意味着旧流程隐含了一条重要约束：

> 中文翻译管理是以“文件路径镜像”为中心，而不是以数据库 ID 或页面 UUID 为中心。

此约束对后续新界面非常重要。若后续要做状态管理、任务分配、差异对比、同步检查，建议仍以相对路径为核心索引。

---

### 4.3 中文内容中的来源元数据

部分中文 `_index.md` 中保留了源码来源信息。例如：

- `src/translated_content/zh_CN/sdks_python/_index.md:8`

其中包含：

- `github_repo`
- `github_subdir`
- `path_base_for_github_subdir`
- `github_branch`

这类数据有助于在页面层面追溯来源仓库，但它们并不足以可靠表示“当前版本真源”。例如某些字段仍保留旧值，如 `github_branch: master`。

故此类 front matter 适合作为辅助展示，不宜作为管理界面的权威版本来源。

---

## 五、旧版构建机制

### 5.1 核心思路

旧版中文站点构建，不是直接在本仓 `src` 内完成，而是通过脚本把构建辅助文件注入到目标源码仓，再由目标源码仓运行 Hugo。

对应任务：

- `src/scripts/tasks.py:152`

其行为包括：

1. 将 `update_config_zh.sh` 复制到目标 docs 目录
2. 基于当前分支生成 `zh-build.yml`
3. 将生成后的工作流写入目标仓 `.github/workflows`

---

### 5.2 旧版 workflow 模板

模板文件：

- `src/scripts/zh-build.yml:1`

其逻辑是：

1. 在指定分支 push / PR 时触发
2. checkout 代码
3. 安装 Hugo
4. 执行 `update_config_zh.sh`
5. 在目标 docs 目录运行 `hugo --minify`

分支名通过占位符 `%%tag%%` 注入，替换逻辑见：

- `src/scripts/tasks.py:161`
- `src/scripts/tasks.py:163`

这说明旧系统的构建策略是：

> 先按版本选定目标仓，再向该目标仓写入专用中文构建工作流。

---

### 5.3 旧版配置改写脚本

旧版配置改写脚本为：

- `src/scripts/update_config_zh.sh:1`

其核心做法是用 `sed` 直接修改 `config.toml` 中的挂载路径，把：

- `../translations/docs-zh/...`

替换为：

- `../translated_content/zh_CN/...`

并把默认语言改为：

- `zh-hans`

这是一种典型的“基于文本替换的构建注入”方案，简单直接，但强依赖目标仓配置文件格式稳定。

---

## 六、版本差异：v1.15 与 v1.17

这是本次分析中最重要的一点。

### 6.1 v1.15 仍是旧结构

`v1.15` 仍使用：

- `repos/v1.15/daprdocs/config.toml`

其挂载方式中，中文内容来自：

- `../translations/docs-zh/translated_content/zh_CN/...`

可见：

- `repos/v1.15/daprdocs/config.toml:115`

这与 `update_config_zh.sh` 的替换逻辑是匹配的。

---

### 6.2 v1.17 已切换到新结构

`v1.17` 已不再使用 `daprdocs/config.toml`，而是改为根目录：

- `repos/v1.17/hugo.yaml`

关键变化如下：

1. Hugo 配置从 `config.toml` 切到 `hugo.yaml`
2. 语言配置在根配置中声明
3. `module.mounts` 直接定义英文与中文内容的挂载路径

相关位置：

- `repos/v1.17/hugo.yaml:1`
- `repos/v1.17/hugo.yaml:47`
- `repos/v1.17/hugo.yaml:271`
- `repos/v1.17/hugo.yaml:330`

其中：

- 英文主站挂载源：`daprdocs/content/en`
- 中文主站挂载源：`translations/docs-zh/translated_content/zh_CN/docs`
- 中文 SDK 挂载源：`translations/docs-zh/translated_content/zh_CN/sdks_*`

这说明 `v1.17` 的真实构建逻辑，已经不再依赖旧脚本那套“修改 `config.toml`”的方式。

---

### 6.3 旧脚本对新版本已部分失配

`src/scripts/tasks.py` 中关于 SDK 的复制路径，仍使用旧目录假设，例如：

- `sdkdocs/<name>/daprdocs/content/en/...`

但 `v1.17` 真实目录已变为：

- `sdkdocs/<name>/content/en/...`

可见于：

- `repos/v1.17/hugo.yaml:285`

因此：

- 旧脚本适合理解历史流程
- 不适合作为未来多版本管理界面的直接执行依据

换言之，旧脚本更多是“历史实现”，不是“当前标准接口”。

---

## 七、`src` 与真实版本仓的关系

### 7.1 `src` 不是当前唯一真源

对比后可见：

- `src/translated_content/zh_CN` 与 `repos/v1.17_zh/translated_content/zh_CN` 的文件路径集合一致
- 但正文内容并不完全一致

差异中较典型的一类是短代码语法调整，例如：

- `src/translated_content/zh_CN/docs/_index.md` 中仍存在 `{{< ref ... >}}`
- `repos/v1.17_zh/translated_content/zh_CN/docs/_index.md` 中已变为 `{{% ref ... %}}`

这类差异说明：

1. `src` 更像一份历史工作副本
2. `repos/v1.17_zh` 更接近当前官方中文仓状态

因此，若新管理界面需要“展示当前版本真实状态”，应优先面向 `repos/*` 而不是仅面向 `src`。

---

### 7.2 `src` 的真实价值

虽然 `src` 不是当前真源，但它仍有重要价值：

1. 它保留了旧流程的统一内容模型
2. 它清楚展示了“英文源 / 中文译文”的文件级镜像关系
3. 它适合作为翻译管理界面的抽象原型

可理解为：

- `repos/*` 解决真实版本与真实构建
- `src/*` 解决历史翻译工作流抽象

---

## 八、对新管理界面的设计约束

基于以上分析，新管理界面至少应满足以下约束。

### 8.1 版本必须是一等实体

不能把系统设计成默认只有一个 `src`。

至少应支持：

- `v1.15`
- `v1.17`
- 后续新版本

版本切换不应只是 UI 筛选，而应影响：

- 源仓选择
- 中文仓选择
- 构建配置
- 路径映射

---

### 8.2 仓库角色必须显式建模

至少应建模三类角色：

- upstream
- fork
- zh-official

因为后续操作的目标不同：

- 查看来源：用 upstream
- 提交 PR：可能用 fork
- 查看已发布中文内容：用 zh-official

若不显式建模，很多同步行为会混乱。逻辑有问题。

---

### 8.3 内容桶必须配置化

旧系统中已有稳定内容分桶：

- `docs`
- `contributing`
- `sdks_*`
- `pluggable-components/*`

新界面可直接沿用这一层抽象。

但不要把这些桶写死在业务逻辑里，宜改为配置化元数据，因为不同版本未来可能新增：

- 新 SDK
- 新组件目录
- 新内容分组

---

### 8.4 页面主键应以相对路径为核心

推荐最小主键：

- `version`
- `locale`
- `relative_path`

可选辅助字段：

- `bucket`
- `source_repo`
- `source_branch`
- `translation_status`
- `build_target`

重点是：路径镜像是旧系统最稳定的规律，应保留。

---

### 8.5 构建映射必须配置化

不同版本的构建映射不同：

- `v1.15` 更接近旧式 `config.toml + sed`
- `v1.17` 更接近 `hugo.yaml + module.mounts`

因此管理界面不应再依赖字符串替换配置文件，而应直接维护一份“版本到挂载映射”的结构化配置。

建议抽象为：

- 源路径
- 目标挂载路径
- 语言
- 内容类型
- 是否参与构建

---

## 九、推荐的数据模型草案

为了便于后续设计管理界面，可先采用如下模型。

### 9.1 Version

| 字段 | 含义 |
| --- | --- |
| `id` | 版本标识，如 `v1.17` |
| `source_repo_dir` | 英文源仓路径 |
| `fork_repo_dir` | fork 仓路径 |
| `zh_repo_dir` | 中文仓路径 |
| `build_system` | `config.toml` 或 `hugo.yaml` |
| `default_branch` | 默认分支 |

### 9.2 ContentBucket

| 字段 | 含义 |
| --- | --- |
| `id` | 如 `docs`、`sdks_python` |
| `display_name` | 展示名称 |
| `source_glob` | 英文源路径规则 |
| `translation_glob` | 中文路径规则 |
| `mount_target` | Hugo 挂载目标 |

### 9.3 Document

| 字段 | 含义 |
| --- | --- |
| `version` | 所属版本 |
| `locale` | `en` / `zh_CN` |
| `bucket` | 内容桶 |
| `relative_path` | 文件相对路径 |
| `repo_role` | 来源仓角色 |
| `file_path` | 物理路径 |
| `last_modified` | 最后修改时间 |
| `status` | 正常 / 缺失 / 漂移 |

### 9.4 MountRule

| 字段 | 含义 |
| --- | --- |
| `version` | 所属版本 |
| `lang` | 语言 |
| `source` | 构建源路径 |
| `target` | Hugo 目标路径 |
| `bucket` | 对应内容桶 |

---

## 十、后续落地建议

若后续开始做新管理界面，建议按如下顺序推进：

1. 先以 `monospecs.yaml` 建立“版本与仓库角色”模型。
2. 再从 `hugo.yaml` 或历史 `config.toml` 提取“挂载规则”模型。
3. 最后再把 `src` 中的“路径镜像翻译模型”折叠进统一页面数据结构。

这样做的好处是：

- 不会把历史实现误当成当前事实
- 能同时兼容旧版与新版构建结构
- 便于未来扩展更多版本

---

## 十一、关键文件索引

以下文件是理解旧流程与新流程的关键入口：

### 根仓

- `README.md`
- `monospecs.yaml`
- `scripts/clone-repos.mjs`

### `src` 历史流程

- `src/scripts/tasks.py`
- `src/scripts/zh-build.yml`
- `src/scripts/update_config_zh.sh`

### 旧版构建参考

- `repos/v1.15/daprdocs/config.toml`

### 新版构建参考

- `repos/v1.17/hugo.yaml`
- `repos/v1.17/.github/workflows/website-v1-17.yml`
- `repos/v1.17/.github/workflows/website-root.yml`

### 中文内容参考

- `repos/v1.17_zh/translated_content/zh_CN`
- `src/translated_content/zh_CN`

---

## 十二、最终判断

重点是：

- `src` 是旧翻译工作流的抽象层
- `repos/*` 是当前多版本与真实构建的事实层

故后续新管理界面若要做对，宜以 `repos/* + 构建映射 + 路径镜像` 为基础，而不是仅围绕 `src` 目录做静态管理。

这是目前最稳的设计依据。
