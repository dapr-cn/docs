---
type: docs
title: "自我托管模式下的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "Overview of how to get Dapr running on a Windows/Linux/MacOS machine"
---

## 概述

Dapr can be configured to run in self-hosted mode on your local developer machine or on production VMs. 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

## Initialization

Dapr can be initialized [with Docker]({{< ref self-hosted-with-docker.md >}}) (default) or in [slim-init mode]({{< ref self-hosted-no-docker.md >}}). The default Docker setup provides out of the box functionality with the following containers and configuration:
- A Redis container configured to serve as the default component for both state management and publish/subscribe.
- A Zipkin container for diagnostics and tracing.
- A default Dapr configuration and components installed in `$HOME/.dapr/` (Mac/Linux) or `%USERPROFILE%\.dapr\` (Windows).

`dapr-placement` 服务负责管理 actor 分布方案和关键范围设置。 This service is not launched as a container and is only required if you are using Dapr actors. 有关 actor `放置` 服务的更多信息，请阅读 [actor 概述]({{< ref "actors-overview.md" >}})。

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## Launching applications with Dapr

You can use the [`dapr run` CLI command]({{< ref dapr-run.md >}}) to a Dapr sidecar process along with your application.

