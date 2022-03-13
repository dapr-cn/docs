---
type: docs
title: "贡献概述"
linkTitle: "概述"
weight: 1000
description: >
  为任何 Dapr 项目仓库做贡献的通用指南
---

感谢您对 Dapr 的关注！ 本文档提供了有关如何通过问题和拉取请求为 [Dapr 项目](https://github.com/dapr)做贡献的指南。 贡献也可以以其他方式进行，例如在社区会议中与社区互动，对问题发表评论或拉动请求等。

有关社区参与和社区成员的更多信息，请参阅 [Dapr community 仓库](https://github.com/dapr/community)。

> 如果你想为 Dapr 文档做贡献，还请参阅[投稿准则]({{< ref contributing-docs >}})。

## Issues

### Issue类型

在大多数 Dapr 仓库中，通常有 4 种类型的 issue:

- Issue/Bug: 你发现了代码中的 Bug，想要报告该错误，或者创建一个 issue 来跟踪该 Bug。
- Issue/Discussion: 你有自己的想法，需要其他人在讨论中提供意见，然后才能最终表现为提案。
- Issue/Proposal: 用于提出新想法或功能的项目。 这允许在编写代码之前获得其他人的反馈。
- Issue/Question: 如果您需要帮助或有疑问，请使用此 issue 类型。

### 提交前

在提交 issue 之前，请确保检查了以下内容:

1. 仓库正确吗?
    - Dapr 项目分布在多个仓库中。 如果你不确定哪个仓库是正确的，请检查[仓库](https://github.com/dapr)列表。
1. 检查现有 issue
    - 在创建新的 issue 之前，请在 [open issues](https://github.com/dapr/dapr/issues) 中进行搜索，以查看 issue 或功能请求是否已经被提交。
    - 如果发现 issue 已存在，请进行相关注释并添加 [reaction](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments)。 添加回应：
        - 👍 赞成票
        - 👎 反对票
1. 对于 bugs
    - 确认不是环境问题。 例如，如果在 Kubernetes 上运行，请确保先决条件已就绪。 (状态存储，绑定等)
    - 提供尽可能多的数据。 通常是日志和堆栈跟踪。 如果在 Kubernetes 或其他环境中运行，请查看 Dapr 服务的日志 (runtime，operator 和 placement 服务) 。 关于如何获取日志的更多细节，可以[在这里]({{< ref "logs-troubleshooting.md" >}})找到。
1. 对于提案
    - 许多对 Dapr 运行时的更改可能需要改动到 API。 在此情况下，讨论潜在功能的最佳场合是 [Dapr 仓库](https://github.com/dapr/dapr)。
    - 其他示例可以是绑定、状态存储或全新的组件。


## Pull Requests

所有的贡献都是通过 pull request 来实现的。 要提交拟议的更改，请遵循此工作流程：

1. 确保有提出一个 issue（bug 或 proposal），这为你即将做出的贡献设定了期望。
1. Fork 相关的仓库并创建一个新的分支。
    - 某些 Dapr 仓库支持 [Codespaces]({{< ref codespaces.md >}}) ，以便为您提供一个即时环境来构建和测试更改。
1. 创建更改
    - 代码更改需要测试
1. 更新和更改相关的文档
1. 使用 [DCO 签核]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}}) 提交并打开 PR
1. 等待 CI 过程完成，确保所有检查均为绿色
1. 将会分配项目的维护者，预计会在几天内审查。


#### 使用正在进行的 PR 获取早期反馈

在投入太多时间之前，一个好的沟通方式是创建一个 "Work-in-progress" 的PR，并与你的审阅者分享。 标准方法是在 PR 的标题中添加 "[WIP]" 前缀，并分配 **do-not-merge** 标签。 这将使查看您的 PR 的人知道它还没有准备好。

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
