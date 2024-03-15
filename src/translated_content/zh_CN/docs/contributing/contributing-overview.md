---
type: docs
title: 贡献概述
linkTitle: 概述
weight: 10
description: |
  为任何 Dapr 项目仓库做贡献的通用指南
---

感谢您对 Dapr 的关注！
本文档提供了有关如何通过问题和拉取请求为[Dapr项目](https://github.com/dapr)做贡献的指南。 贡献也可以通过其他方式进行，比如参与社区电话会议、在 issue 或 pull requests 上发表评论等。

有关社区参与和社区成员的更多信息，请参阅 [Dapr community 仓库](https://github.com/dapr/community)。

> 如果您想为Dapr文档做出贡献，请同时查看[贡献文档]({{< ref contributing-docs >}}) 的具体指南。

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
   - Dapr 项目分布在多个仓库中。 如果你不确定哪个仓库是正确的，请检查[仓库列表](https://github.com/dapr)。
2. 检查现有 issue
   - 在创建新的 issue 之前，请在 [open issues](https://github.com/dapr/dapr/issues) 中进行搜索，以查看 issue 或功能请求是否已经被提交。
   - 如果你发现你的问题已经存在，请添加相关评论并在[reaction](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments)中加上你的反应。 添加回应：
     - 👍 赞同投票
     - 👎 反对投票
3. 对于 bugs
   - 检查它不是环境问题。 例如，如果在 Kubernetes 上运行，请确保先决条件已就绪。 (状态存储，绑定等)
   - 提供尽可能多的数据。 这通常以日志和/或堆栈跟踪的形式出现。 如果在 Kubernetes 或其他环境中运行，请查看 Dapr 服务的日志 (runtime，operator 和 placement 服务) 。 有关如何获取日志的更多详细信息，请在[此处]({{< ref "logs-troubleshooting.md" >}})。
4. 对于提案
   - 许多对 Dapr 运行时的更改可能需要改动到 API。 在此情况下，讨论潜在功能的最佳场合是主要的[Dapr仓库](https://github.com/dapr/dapr)。
   - 其他示例可以是绑定、状态存储或全新的组件。

## Pull Requests

所有的贡献都是通过 pull request 来实现的。 要提交拟议的更改，请遵循此工作流程：

1. 确保有提出一个 issue（bug 或 proposal），这为你即将做出的贡献设定了期望。
2. 分叉相关的repo并创建一个新的分支。
   - 某些 Dapr 仓库支持 [Codespaces]({{< ref codespaces.md >}}) ，以便为您提供一个即时环境来构建和测试更改。
   - 查看[开发Dapr文档](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)获取有关设置Dapr开发环境的更多信息。
3. 创建更改
   - 代码更改需要测试
4. 更新和更改相关的文档
5. 提交带有[DCO签名]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}})的提交并打开PR
6. 等待 CI 过程完成，确保所有检查均为绿色
7. 将会分配项目的维护者，预计会在几天内审查。

#### 使用正在进行的 PR 获取早期反馈

在投入太多时间之前，一个好的沟通方式是创建一个 "Work-in-progress" 的PR，并与你的审阅者分享。 标准方法是在 PR 的标题中添加 "[WIP]" 前缀，并分配 **do-not-merge** 标签。 这将使查看您的 PR 的人知道它还没有准备好。

## 第三方代码的使用

- 第三方代码必须包含许可证。

## 开发者证书：签署您的工作

#### 每个提交都需要签名

开发者证书（DCO）是一种轻量级的方式，用于让贡献者证明他们撰写或拥有提交到项目的代码的权利。 以下是[DCO](https://developercertificate.org/)的全文，为便于阅读而重新排版：

```
By making a contribution to this project, I certify that:
    (a) The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file; or
    (b) The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or
    (c) The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.
    (d) I understand and agree that this project and the contribution are public and that a record of the contribution (including all personal information I submit with it, including my sign-off) is maintained indefinitely and may be redistributed consistent with this project or the open source license(s) involved.
```

参与者通过添加 `Signed-off-by` 行来签署他们遵守这些要求。

```
This is my commit message
Signed-off-by: Random J Developer <random@developer.example.org>
```

Git甚至有一个`-s`命令行选项，可以自动将其附加到您的提交消息中：

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

请查看[Dapr社区行为准则](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md)。
