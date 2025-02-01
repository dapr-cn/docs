---
type: docs
title: "为 .NET SDK 贡献"
linkTitle: ".NET SDK"
weight: 3000
description: 为 Dapr .NET SDK 贡献的指南
---

# 欢迎！
如果你正在阅读这篇文章，说明你可能对为 Dapr 和/或 Dapr .NET SDK 做出贡献感兴趣。欢迎加入这个项目，感谢你对贡献的兴趣！

请查看文档，了解 Dapr 的定义及其目标，并通过 [Discord](https://bit.ly/dapr-discord) 联系我们。告诉我们你想如何贡献，我们很乐意提供想法和建议。

有很多方式可以为 Dapr 做出贡献：
- 为 [Dapr 运行时](https://github.com/dapr/dapr/issues/new/choose) 或 [Dapr .NET SDK](https://github.com/dapr/dotnet-sdk/issues/new/choose) 提交错误报告
- 提出新的 [运行时功能](https://github.com/dapr/proposals/issues/new/choose) 或 [SDK 功能](https://github.com/dapr/dotnet-sdk/issues/new/choose)
- 改进 [Dapr 大项目](https://github.com/dapr/docs) 或 [Dapr .NET SDK 专门](https://github.com/dapr/dotnet-sdk/tree/master/daprdocs) 的文档
- 添加新的或改进现有的 [组件](https://github.com/dapr/components-contrib/)，以实现各种构建块
- 增强 [.NET 可插拔组件 SDK 功能](https://github.com/dapr-sandbox/components-dotnet-sdk)
- 改进 Dapr .NET SDK 代码库和/或修复错误（详见下文）

如果你是代码库的新手，请在 Discord 的 #dotnet-sdk 频道中询问如何进行更改或提出一般性问题。你不需要获得许可即可进行任何工作，但请注意，如果某个问题已分配给某人，这表明可能已经有人开始处理它了。特别是如果自上次活动以来已经有一段时间，请随时联系他们，看看他们是否仍然有兴趣继续，或者你是否可以接手，并提交你的实现的 pull request。

如果你想将自己分配给一个问题，请在对话中回复 "/assign"，机器人会将你分配给它。

我们将一些问题标记为 `good-first-issue` 或 `help wanted`，表明这些问题可能是小的、独立的更改。

如果你不确定你的实现，请将其创建为草稿 pull request，并通过标记 `@dapr/maintainers-dotnet-sdk` 向 [.NET 维护者](https://github.com/orgs/dapr/teams/maintainers-dotnet-sdk) 征求反馈，并提供一些关于你需要帮助的上下文。

# 贡献规则和最佳实践

在为 [.NET SDK](https://github.com/dapr/dotnet-sdk) 贡献时，应遵循以下规则和最佳实践。

## Pull Requests
仅包含格式更改的 pull request 通常不被鼓励。pull request 应该寻求修复错误、添加新功能或改进现有功能。

请尽量将你的 pull request 限制在单个问题上。涉及许多文件的广泛 PR 不太可能在短时间内被审查或接受。在单个 PR 中处理许多不同的问题使得很难确定你的代码是否完全解决了潜在问题，并使代码审查复杂化。

## 测试
所有 pull request 应包括单元和/或集成测试，以反映所添加或更改的内容，以便明确功能按预期工作。避免使用自动生成的测试，这些测试会多次重复测试相同的功能。相反，寻求通过验证更改的每个可能路径来提高代码覆盖率，以便未来的贡献者可以更轻松地导航你的逻辑轮廓，并更容易识别限制。

## 示例

`examples` 目录包含用户可以运行的代码示例，以尝试各种 Dapr .NET SDK 包和扩展的特定功能。在编写新的和更新的示例时，请记住：

- 所有示例应可在 Windows、Linux 和 MacOS 上运行。虽然 .NET Core 代码在操作系统之间是一致的，但任何前/后示例命令应通过 [codetabs]({{< ref "contributing-docs.md#tabbed-content" >}}) 提供选项
- 包含下载/安装任何所需先决条件的步骤。一个全新操作系统安装的用户应该能够开始示例并完成它而不会出错。链接到外部下载页面是可以的。

## 文档

`daprdocs` 目录包含渲染到 [Dapr Docs](https://docs.dapr.io) 网站的 markdown 文件。当文档网站构建时，此仓库被克隆并配置，以便其内容与文档内容一起渲染。在编写文档时，请记住：

   - 除了这些规则外，还应遵循 [文档指南]({{< ref contributing-docs.md >}}) 中的所有规则。
   - 所有文件和目录应以 `dotnet-` 为前缀，以确保所有文件/目录名称在所有 Dapr 文档中都是全局唯一的。

所有 pull request 应努力包括代码中的 XML 文档，清楚地指明功能的作用和原因，以及对已发布文档的更改，以便为其他开发人员澄清你的更改如何改进 Dapr 框架。

## GitHub Dapr Bot 命令

查看 [daprbot 文档](https://docs.dapr.io/contributing/daprbot/) 以获取你可以在此仓库中运行的常见任务的 Github 命令。例如，你可以在问题上评论 `/assign` 来将其分配给自己。

## 提交签署
提交到 Dapr .NET SDK 的所有代码必须由编写它的开发人员签署。这意味着每个提交必须以以下内容结尾：
> Signed-off-by: First Last <flast@example.com>

姓名和电子邮件地址必须与提交更改的用户的注册 GitHub 姓名和电子邮件地址匹配。我们使用一个机器人在 pull request 中检测这一点，如果此检查未能验证，我们将无法合并 PR。

如果你注意到 PR 因 DCO 检查失败而未能验证，请考虑在本地压缩 PR 并重新提交，以确保签署声明包含在提交历史中。

# 语言、工具和流程
Dapr .NET SDK 中的所有源代码都是用 C# 编写的，并针对最新的语言版本可用于最早支持的 .NET SDK。截至 v1.15，这意味着因为 .NET 6 仍然受支持，最新的语言版本是 [C# 版本 10](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-version-history#c-version-10)。

截至 v1.15，支持以下 .NET 版本：

| 版本 | 备注                                                           |
| --- |-----------------------------------------------------------------|
| .NET 6 | 将在 v1.16 中停止支持                                   |
| .NET 7 | 仅在 Dapr.Workflows 中支持，将在 v1.16 中停止支持 |
| .NET 8 | 将在 v1.16 中继续支持                          |
| .NET 9 | 将在 v1.16 中继续支持                          |

欢迎贡献者使用他们最熟悉的 IDE 进行开发，但请不要提交 IDE 特定的偏好文件，因为这些文件将被拒绝。