---
type: docs
title: "Contributing to the JavaScript SDK"
linkTitle: "JavaScript SDK"
weight: 3000
description: Guidelines for contributing to the Dapr JavaScript SDK
---

When contributing to the [JavaScript SDK](https://github.com/dapr/js-sdk) the following rules and best-practices should be followed.

## 提交指南

Dapr Javascript SDK 使用 [常规提交(Conventional Commits)](https://www.conventionalcommits.org/en/v1.0.0/) 规范。 自动变更日志工具使用这些来根据提交消息自动生成变更日志。 下面是编写提交消息的指南，以允许这样做：

### 格式

```
type(scope)!: subject
```

- `type`：提交的类型是以下之一：

  - `feat`：新功能。
  - `fix`：Bug 修复。
  - `docs`: 文档变化。
  - `refactor`：重构某个特定的代码部分，不引入新功能或错误修复。
  - `style`：代码风格改进。
  - `perf`：性能改进。
  - `test`：对测试套件的更改。
  - `ci`: CI 系统的变化。
  - `build`：对构建系统的更改（我们还没有，所以这不应该适用）。
  - `chore`: 用于其他不符合先前类型的变化。 这在更改日志中不会显示。

- `scope`: 提交所修改的代码库的部分。 如果它对许多部分进行了修改，或者没有特别的部分被修改，请留出空白，不要加括号。 Examples:

  - 添加 `test` 的提交：
  ```
  test(actors): add an actor test
  ```

  - 提交一次会改变很多事情：
  ```
  style: adopt eslint
  ```

  对于示例的更改，范围应该是带有 `examples/` 前缀的示例名称：

  - ❌ `fix(agnoster): commit subject`
  - ✅ `fix(examples/http/actor): commit subject`

- `!`：这在 `scope`（或 `type` 如果范围为空）之后，表示提交引入了破坏性的变化。

  或者，您可以指定更改日志工具将向用户显示的消息，以指示更改了什么以及他们可以做些什么来处理它。 您可以使用多行来键入此消息；更改日志解析器将继续读取，直到提交消息结束或找到空的行。

  编造的例子：

  ```
  style(agnoster)!: change dirty git repo glyph

  BREAKING CHANGE: the glyph to indicate when a git repository is dirty has
  changed from a Powerline character to a standard UTF-8 emoji.

  Fixes #420

  Co-authored-by: Username <email>
  ```

- `subject`：对更改的简要说明。 这将显示在更改日志中。 如果您需要来指定其他详细信息，您可以使用提交主体，但它不会可见。

  格式化技巧：提交主题可能包含：

  - 通过编写 `#issue` 链接到相关问题或 PR。 更改日志工具将突出显示这一点：
    ```
    feat(archlinux): add support for aura AUR helper (#9467)
    ```

  - 使用反引号格式化内联代码：反引号之间的文本也将通过更改日志工具以突出显示：
    ```
    feat(shell-proxy): enable unexported `DEFAULT_PROXY` setting (#9774)
    ```

### 样式

尽量保持第一个提交行简短。 使用这种提交风格很难做到这一点，但尽量做到简洁，如果你需要更多空间，你可以使用提交主体。 尝试确保提交主题足够清晰和精确，以便用户只需查看更改日志即可知道发生了什么更改。

## 编码规则

为确保整个源代码的一致性，请在工作时牢记以下规则：

* 所有功能或错误修复 **必须由一个或多个规范（单元测试）测试**。
* 所有公共 API 方法 **必须记录在案**。
* 我们遵循 \[ESLint 推荐规则\](https://eslint.org/docs/rules/)。

## 示例

The `examples` directory contains code samples for users to run to try out specific functionality of the various JavaScript SDK packages and extensions. 在写新的和更新的示例时，请牢记。

- 所有的例子都应该可以在Windows、Linux和MacOS上运行。 While JavaScript code is consistent among operating systems, any pre/post example commands should provide options through [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}})
- 包含下载/安装任何所需先决条件的步骤。 使用全新安装的操作系统的人，应该能够在没有错误的情况下启动这个例子并完成它。 指向外部下载页面的链接是正常的。

## Docs

`daprdocs` 目录包含渲染到 [Dapr 文档](https://docs.dapr.io) 网站的 markdown 文件。 When the documentation website is built, this repo is cloned and configured so that its contents are rendered with the docs content. When writing docs, keep in mind:

   - 除了这些规则外，还应遵循 [文档指南]({{< ref contributing-docs.md >}})。
   - All files and directories should be prefixed with `js-` to ensure all file/directory names are globally unique across all Dapr documentation.
