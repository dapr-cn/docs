---
type: docs
title: "贡献概述"
linkTitle: "概述"
weight: 1000
description: >
  为任何Dapr项目资源库做出贡献的通用指南
---

感谢您对 Dapr 的关注！ 感谢您对 Dapr的兴趣! 本文档提供了有关如何通过问题和拉取请求对 [Dapr 项目](https://github.com/dapr) 作出贡献的指南。 贡献还可以通过多种方式来实现，如举办线下活动，参加社区会议，评论问题或拉取请求等。

了解有关社区参与和社区成员的更多信息，请参阅 [Dapr community repository](https://github.com/dapr/community)。

> 如果你想为Dapr文档做出贡献，还请参阅 [ 投稿准则 ]({{< ref contributing-docs >}})。

## Issues

### Issue类型

在大多数 Dapr 存储库中，通常有 4 种类型的问题:

- Issue/Bug: 你发现了代码中的一个错误，想要报告它，或者创建一个问题来跟踪这个错误。
- Issue/Discussion: 你有一些想法，需要别人在讨论中提出意见，最终才会体现为一个建议。
- Issue/Proposal: 用于提出新想法或功能的项目。 这样就可以在编写代码之前得到别人的反馈。
- Issue/Question: 如果您需要帮助或有问题，请使用此问题类型。

### 提交前

在提交问题之前，请确保检查了以下内容:

1. 是正确的存储库吗?
    - Dapr 项目分布在多个存储库中。 如果你不确定哪个repo是正确的，请检查[repositories](https://github.com/dapr)的列表。
1. 检查现有问题
    - 在创建新问题之前，请在 [open issues](https://github.com/dapr/dapr/issues) 中进行搜索，以查看问题或功能请求是否已经被提交。
    - 如果发现问题已存在，请进行相关注释并添加 [reaction](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments)。 添加回应
        - 👍 赞同投票
        - 👎 反对投票
1. 对于bugs
    - 检查它不是环境问题。 例如，如果在 Kubernetes 上运行，请确保先决条件已到位。 (状态存储，绑定等)
    - 您有尽可能多的数据。 这通常以日志和/或堆栈跟踪的形式出现。 如果在 Kubernetes 或其他环境中运行，请查看 Dapr 服务的日志 (运行时，操作员和安置服务) 。 有关如何获取日志的更多详细信息，请在[此处]({{< ref "logs-troubleshooting.md" >}}).
1. 对于建议
    - 对 Dapr 运行时的许多更改可能需要对 API 进行更改。 在此情况下，讨论潜在功能的最佳位置是 [Dapr repo](https://github.com/dapr/dapr)。
    - 其他的例子可以包括绑定、状态存储或全新的组件。


## Pull Requests

所有的贡献都是通过拉请求来实现的。 要提交拟议的更改，请遵循此工作流程。

1. 确保有一个问题（bug或建议）被提出，这为你即将做出的贡献设定了期望。
1. 分叉相关的repo并创建一个新的分支。
    - 某些 Dapr 仓库支持 [Codespaces]({{< ref codespaces.md >}}) ，以便为您提供一个即时环境来构建和测试更改。
    - 有关设置 Dapr 开发环境的详细信息，请参阅 [ 开发 Dapr 文档 ](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)
1. 创建更改
    - 代码更改需要测试
1. 更新有关更改的相关文档
1. 使用 [DCO 签核]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}}) 提交并打开 PR
1. 等待 CI 进程完成并确保所有检查都是绿色的
1. 项目的维护者将被指定，您可以在几天内得到审查。


#### 使用正在进行的 PRs 进行早期反馈

在投入太多时间之前，一个好的沟通方式是创建一个 "Work-in-progress "的PR，并与你的审阅者分享。 标准的方法是在PR的标题中添加 "[WIP]" 前缀，并分配 **do-not-merge** 标签。 这将使查看您的 PR 的人知道它还没有准备好。

## 使用第三方代码

- 第三方代码必须包含许可证。

## 开发者原产地证书：签署您的作品
#### 每个提交都需要签名

开发人员原产地证书（DCO）是贡献者证明他们编写或以其他方式有权提交他们为项目贡献的代码的轻量级方式。 以下是 [DCO](https://developercertificate.org/) 的全文，为便于阅读而重新排版：
```
通过对本项目的贡献，我证明：
    （a）贡献全部或部分由我创建，我有权根据文件中指示的开源许可证提交;或
    （b）贡献基于先前的工作，据我所知，这些工作受适当的开源许可证的约束，并且我有权根据该许可证在同一开源许可证下提交该作品，无论是全部还是部分由我创建（除非我被允许以不同的许可证提交）， 如文件中所示;或
    （c）捐款是由其他认证（a），（b）或（c）的人直接提供给我的，我没有修改它。
    （d）我理解并同意，本项目和贡献是公开的，并且贡献的记录（包括我随之提交的所有个人信息，包括我的签名）将无限期地保留，并且可以根据本项目或所涉及的开源许可证进行重新分发。
```
参与者通过添加 `Signed-off-by` 行来签署他们遵守这些要求。

```
This is my commit message
Signed-off-by: Random J Developer <random@developer.example.org>
```
Git 甚至有一个 `-s` 命令行选项，可以自动将其附加到您的提交消息中：
```
$ git commit -s -m 'This is my commit message'
```

检查每个 Pull Request 中的提交是否包含有效的 "Signed-off-by" 行。

#### 我没有签署我的提交，现在该怎么办？！

不用担心 - 您可以轻松重放更改，签名并强制推送！

```
git checkout <branch-name>
git commit --amend --no-edit --signoff
git push --force-with-lease <remote-name> <branch-name>
```

## 行为准则

请参阅 [Dapr 社区行为准则](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)。
