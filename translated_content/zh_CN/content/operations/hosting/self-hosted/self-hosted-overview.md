---
type: docs
title: "自我托管模式下的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在本地机器上运行 Dapr 的概述"
---

Dapr 可以配置为在开发人员本地计算机上以 自托管模式 运行。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

在自托管模式下，Redis 在本地容器中运行，并被配置为 状态存储 和 发布/订阅 的默认组件。 还配置了一个 Zipkin 容器用于诊断和跟踪。  运行 `dapr init`, 见 `$HOME/.dapr/components` directory (Mac/Linux) 或 `%USERPROFILE%\.dapr\components` on Windows。

`dapr-placement` 服务负责管理 actor 分布方案和关键范围设置。 此服务仅在您使用 Dapr actors 时才需要。 For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}).

<img src="/images/overview_standalone.png" width=800>

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行启用了 Dapr 的应用程序。