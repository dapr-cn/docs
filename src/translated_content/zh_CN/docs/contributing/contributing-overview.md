---
type: docs
title: "贡献概览"
linkTitle: "概览"
weight: 10
description: >
  对Dapr项目的任何代码库进行贡献的一般指导
---

感谢您对Dapr项目的关注！
本文档为您提供如何通过提交问题和拉取请求来为[Dapr项目](https://github.com/dapr)做出贡献的指南。您还可以通过其他方式参与，例如参加社区电话会议、对问题或拉取请求进行评论等。

有关社区参与和成员资格的更多信息，请参阅[Dapr社区代码库](https://github.com/dapr/community)。

## Dapr代码库索引

以下是Dapr组织下的代码库列表，您可以在这些代码库中进行贡献：

1. **文档**：此[代码库](https://github.com/dapr/docs)包含Dapr的文档。您可以通过更新现有文档、修复错误或添加新内容来改善用户体验和清晰度。请参阅[文档贡献指南](https://github.com/dapr/docs/blob/master/CONTRIBUTING.md)。

2. **快速入门**：快速入门[代码库](https://github.com/dapr/quickstarts)提供简单的分步指南，帮助用户快速上手Dapr。您可以通过创建新的快速入门、改进现有的快速入门或确保它们与最新功能保持同步来贡献。[查看贡献指南](https://github.com/dapr/quickstarts/blob/master/CONTRIBUTING.md)。

3. **运行时**：Dapr运行时[代码库](https://github.com/dapr/dapr)包含核心运行时组件。您可以通过修复错误、优化性能、实现新功能或增强现有功能来贡献。

4. **组件贡献**：此[代码库](https://github.com/dapr/components-contrib)托管了Dapr的社区贡献组件集合。您可以通过添加新组件、改进现有组件或审查和测试社区的贡献来参与。

5. **SDKs**：Dapr SDKs为各种编程语言提供与Dapr交互的库。您可以通过改进SDK功能、修复错误或添加对新功能的支持来贡献。请参阅[SDK贡献指南](https://github.com/dapr/docs/blob/master/CONTRIBUTING.md)以获取特定SDK的详细信息。

6. **CLI**：Dapr CLI用于在本地开发机器或Kubernetes集群上设置Dapr以启动和管理Dapr实例。对CLI代码库的贡献包括添加新功能、修复错误、提高可用性，并确保与最新的Dapr版本兼容。请参阅[开发指南](https://github.com/dapr/cli/blob/master/docs/development/development.md)以获取有关开发Dapr CLI的帮助。

## 问题

### 问题类型

在大多数Dapr代码库中，通常有4种类型的问题：

- 问题/错误：您发现了代码中的错误，并希望报告或创建一个问题来跟踪该错误。
- 问题/讨论：您有一些想法，需要在讨论中获得他人的意见，然后最终形成提案。
- 问题/提案：用于提出新想法或功能的项目。这允许在编写代码之前获得他人的反馈。
- 问题/问题：如果您需要帮助或有问题，请使用此问题类型。

### 提交之前

在提交问题之前，请确保您已检查以下内容：

1. 这是正确的代码库吗？
    - Dapr项目分布在多个代码库中。如果您不确定哪个代码库是正确的，请查看[代码库列表](https://github.com/dapr)。
1. 检查现有问题
    - 在创建新问题之前，请在[开放问题](https://github.com/dapr/dapr/issues)中搜索，查看该问题或功能请求是否已被提交。
    - 如果您发现您的问题已经存在，请进行相关评论并添加您的[反应](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments)。使用反应：
        - 👍 赞成
        - 👎 反对
1. 对于错误
    - 检查这不是环境问题。例如，如果在Kubernetes上运行，请确保先决条件已到位。（state存储、bindings等）
    - 您拥有尽可能多的数据。这通常以日志和/或堆栈跟踪的形式出现。如果在Kubernetes或其他环境中运行，请查看Dapr服务（运行时、operator、placement服务）的日志。有关如何获取日志的更多详细信息，请参阅[此处]({{< ref "logs-troubleshooting.md" >}})。
1. 对于提案
    - 许多对Dapr运行时的更改可能需要对API进行更改。在这种情况下，讨论潜在功能的最佳地点是主要的[Dapr代码库](https://github.com/dapr/dapr)。
    - 其他示例可能包括bindings、state存储或全新的组件。

## 拉取请求

所有贡献都通过拉取请求提交。要提交建议的更改，请遵循以下工作流程：

1. 确保已提出问题（错误或提案），以设定您即将进行的贡献的期望。
1. 分叉相关代码库并创建新分支
    - 一些Dapr代码库支持[Codespaces]({{< ref codespaces.md >}})，为您提供即时环境以构建和测试您的更改。
	- 有关设置Dapr开发环境的更多信息，请参阅[开发Dapr文档](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)。
1. 创建您的更改
    - 代码更改需要测试
1. 更新相关文档以反映更改
1. 使用[DCO签署]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}})提交并打开PR
1. 等待CI过程完成并确保所有检查通过
1. 项目的维护者将被分配，您可以在几天内期待审查

#### 使用草稿PR以获得早期反馈

在投入过多时间之前进行沟通的好方法是创建一个“草稿”PR并与您的审阅者分享。标准做法是在PR的标题中添加“[WIP]”前缀，并分配**do-not-merge**标签。这将让查看您PR的人知道它尚未成熟。

## 使用第三方代码

- 第三方代码必须包含许可证。

## 开发者来源证书：签署您的工作
#### 每次提交都需要签署

开发者来源证书（DCO）是一种轻量级方式，供贡献者证明他们编写或以其他方式有权提交他们贡献给项目的代码。以下是[DCO](https://developercertificate.org/)的完整文本，经过重新格式化以提高可读性：
```
通过对该项目进行贡献，我证明：
    (a) 该贡献完全或部分由我创建，并且我有权根据文件中指明的开源许可证提交它；或者
    (b) 该贡献基于我所知的适当开源许可证覆盖的先前工作，并且我有权根据该许可证提交该工作及其修改，无论是由我完全或部分创建的，均根据相同的开源许可证（除非我被允许根据不同的许可证提交），如文件中所示；或者
    (c) 该贡献是由其他人直接提供给我的，他们证明了(a)、(b)或(c)，而我没有修改它。
    (d) 我理解并同意该项目和贡献是公开的，并且贡献的记录（包括我提交的所有个人信息，包括我的签署）将被无限期地维护，并可能根据该项目或涉及的开源许可证进行再分发。
```
贡献者通过在提交消息中添加`Signed-off-by`行来签署他们遵守这些要求。

```
这是我的提交消息
Signed-off-by: Random J Developer <random@developer.example.org>
```
Git甚至有一个`-s`命令行选项，可以自动将其附加到您的提交消息中：
```
$ git commit -s -m '这是我的提交消息'
```

每个拉取请求都会检查拉取请求中的提交是否包含有效的Signed-off-by行。

#### 我没有签署我的提交，现在怎么办？！

别担心 - 您可以轻松地重放您的更改，签署它们并强制推送它们！

```
git checkout <branch-name>
git commit --amend --no-edit --signoff
git push --force-with-lease <remote-name> <branch-name>
```

## 行为准则

请参阅[Dapr社区行为准则](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)。