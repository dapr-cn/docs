---
type: docs
title: "贡献概述"
linkTitle: "概述"
weight: 10
description: >
  为任何 Dapr 项目仓库做贡献的通用指南
---

Thank you for your interest in Dapr! This document provides the guidelines for how to contribute to the [Dapr project](https://github.com/dapr) through issues and pull-requests. Contributions can also come in additional ways such as engaging with the community in community calls, commenting on issues or pull requests and more.

有关社区参与和社区成员的更多信息，请参阅 [Dapr community 仓库](https://github.com/dapr/community)。

> 如果你想为 Dapr 文档做贡献，还请参阅[投稿准则]({{< ref contributing-docs >}})。

## Issues

### Issue types

在大多数 Dapr 仓库中，通常有 4 种类型的 issue:

- Issue/Bug: You've found a bug with the code, and want to report it, or create an issue to track the bug.
- Issue/Discussion: You have something on your mind, which requires input form others in a discussion, before it eventually manifests as a proposal.
- Issue/Proposal: Used for items that propose a new idea or functionality. This allows feedback from others before code is written.
- Issue/Question: Use this issue type, if you need help or have a question.

### 提交前

在提交 issue 之前，请确保检查了以下内容:

1. Is it the right repository?
    - The Dapr project is distributed across multiple repositories. Check the list of [repositories](https://github.com/dapr) if you aren't sure which repo is the correct one.
1. Check for existing issues
    - Before you create a new issue, please do a search in [open issues](https://github.com/dapr/dapr/issues) to see if the issue or feature request has already been filed.
    - If you find your issue already exists, make relevant comments and add your [reaction](https://github.com/blog/2119-add-reaction-to-pull-requests-issues-and-comments). Use a reaction:
        - 👍 up-vote
        - 👎 down-vote
1. For bugs
    - Check it's not an environment issue. For example, if running on Kubernetes, make sure prerequisites are in place. (state stores, bindings, etc.)
    - You have as much data as possible. This usually comes in the form of logs and/or stacktrace. If running on Kubernetes or other environment, look at the logs of the Dapr services (runtime, operator, placement service). More details on how to get logs can be found [here]({{< ref "logs-troubleshooting.md" >}}).
1. For proposals
    - Many changes to the Dapr runtime may require changes to the API. In that case, the best place to discuss the potential feature is the main [Dapr repo](https://github.com/dapr/dapr).
    - Other examples could include bindings, state stores or entirely new components.


## Pull Requests

所有的贡献都是通过 pull request 来实现的。 要提交拟议的更改，请遵循此工作流程：

1. Make sure there's an issue (bug or proposal) raised, which sets the expectations for the contribution you are about to make.
1. 分叉相关的repo并创建一个新的分支。
    - Some Dapr repos support [Codespaces]({{< ref codespaces.md >}}) to provide an instant environment for you to build and test your changes.
    - 有关设置 Dapr 开发环境的详细信息，请参阅 [ 开发 Dapr 文档 ](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md)
1. 创建更改
    - 代码更改需要测试
1. 更新和更改相关的文档
1. 使用 [DCO 签核]({{< ref "contributing-overview.md#developer-certificate-of-origin-signing-your-work" >}}) 提交并打开 PR
1. 等待 CI 过程完成，确保所有检查均为绿色
1. 将会分配项目的维护者，预计会在几天内审查。


#### Use work-in-progress PRs for early feedback

在投入太多时间之前，一个好的沟通方式是创建一个 "Work-in-progress" 的PR，并与你的审阅者分享。 标准方法是在 PR 的标题中添加 "[WIP]" 前缀，并分配 **do-not-merge** 标签。 这将使查看您的 PR 的人知道它还没有准备好。

## Use of Third-party code

- 第三方代码必须包含许可证。

## 开发者原产地证书：签署您的作品
#### 每个提交都需要签名

开发人员原产地证书（DCO）是贡献者证明他们编写或以其他方式有权提交他们为项目贡献的代码的轻量级方式。 以下是 [DCO](https://developercertificate.org/) 的全文，为便于阅读而重新排版：
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

## Code of Conduct

Please see the [Dapr community code of conduct](https://github.com/dapr/community/blob/master/CODE-OF-CONDUCT.md).
