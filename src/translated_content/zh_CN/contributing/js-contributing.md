---
type: docs
title: "贡献到 JavaScript SDK"
linkTitle: "JavaScript SDK"
weight: 3000
description: 为 Dapr JavaScript SDK 贡献的指南
---

在为 [JavaScript SDK](https://github.com/dapr/js-sdk) 贡献时，应遵循以下规则和最佳实践。

💡 你可以运行 `npm pretty-fix` 来格式化所有文件

## 提交指南

Dapr JavaScript SDK 遵循 [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) 规范。自动生成的变更日志工具会根据提交信息自动生成变更日志。以下是编写提交信息的指南：

### 格式

```
type(scope)!: subject
```

- `type`: 提交的类型是以下之一：

  - `feat`: 新功能。
  - `fix`: 错误修复。
  - `docs`: 文档更改。
  - `refactor`: 重构特定代码部分，不引入新功能或错误修复。
  - `style`: 代码风格改进。
  - `perf`: 性能改进。
  - `test`: 测试套件的更改。
  - `ci`: CI 系统的更改。
  - `build`: 构建系统的更改（我们目前没有，所以不适用）。
  - `chore`: 其他不符合上述类型的更改。这不会出现在变更日志中。

- `scope`: 提交更改的代码库部分。如果更改了多个部分，或没有特定部分被修改，则留空，不加括号。
  示例：

  - 添加 `test` 的提交：

  ```
  test(actors): add an actor test
  ```

  - 一次更改多项的提交：

  ```
  style: adopt eslint
  ```

  对于示例的更改，范围应为示例名称，前缀为 `examples/`：

  - ❌ `fix(agnoster): commit subject`
  - ✅ `fix(examples/http/actor): commit subject`

- `!`: 这个符号放在 `scope`（或 `type` 如果范围为空）之后，表示提交引入了重大更改。

  你可以选择性地添加一条消息，变更日志工具会向用户显示这条消息，以说明更改了什么以及如何处理。你可以使用多行来输入此消息；变更日志解析器会继续读取，直到提交信息结束或找到空行。

  示例（虚构的）：

  ```
  style(agnoster)!: change dirty git repo glyph

  BREAKING CHANGE: the glyph to indicate when a git repository is dirty has
  changed from a Powerline character to a standard UTF-8 emoji.

  Fixes #420

  Co-authored-by: Username <email>
  ```

- `subject`: 对更改的简要描述。这将在变更日志中显示。如果需要指定其他详细信息，可以使用提交正文，但它不会被显示。

  提交主题可以包括以下内容：

  - 通过编写 `#issue` 链接到相关问题或 PR。这将由变更日志工具突出显示：

    ```
    feat(archlinux): add support for aura AUR helper (#9467)
    ```

  - 使用反引号格式化内联代码：反引号之间的文本也将由变更日志工具突出显示：
    ```
    feat(shell-proxy): enable unexported `DEFAULT_PROXY` setting (#9774)
    ```

### 风格

尽量保持第一行提交信息简短。使用这种提交风格更难做到这一点，但尽量简洁，如果需要更多空间，可以使用提交正文。确保提交主题清晰明了，以便用户仅通过查看变更日志就能知道更改了什么。

## Github Dapr Bot 命令

查看 [daprbot 文档](https://docs.dapr.io/contributing/daprbot/) 以获取可以在此仓库中运行的 Github 命令以完成常见任务。例如，你可以运行 `/assign`（作为问题的评论）来将问题分配给用户或用户组。

## 编码规则

为了确保源代码的一致性，请在工作时牢记以下规则：

- 所有功能或错误修复**必须通过**一个或多个规范（单元测试）进行测试。
- 所有公共 API 方法**必须被记录**。
- 我们遵循 [ESLint 推荐规则](https://eslint.org/docs/rules/)。

## 示例

`examples` 目录包含供用户运行的代码示例，以尝试各种 JavaScript SDK 包和扩展的特定功能。在编写新的和更新的示例时，请记住：

- 所有示例应可在 Windows、Linux 和 MacOS 上运行。虽然 JavaScript 代码在操作系统之间是一致的，但任何前/后示例命令应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供选项。
- 包含下载/安装任何所需前提条件的步骤。一个全新操作系统安装的用户应该能够开始示例并完成它而不会出错。链接到外部下载页面是可以的。

## 文档

`daprdocs` 目录包含渲染到 [Dapr Docs](https://docs.dapr.io) 网站的 markdown 文件。当文档网站构建时，此仓库被克隆并配置，以便其内容与文档内容一起渲染。在编写文档时，请记住：

- 除了这些规则外，还应遵循 [docs guide]({{< ref contributing-docs.md >}}) 中的所有规则。
- 所有文件和目录应以 `js-` 为前缀，以确保所有文件/目录名称在所有 Dapr 文档中都是全局唯一的。
