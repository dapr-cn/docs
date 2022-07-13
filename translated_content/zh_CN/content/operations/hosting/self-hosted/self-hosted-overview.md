---
type: docs
title: "自我托管模式下的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在Windows/Linux/MacOS机器上运行 Dapr 的概述"
---

## 概述

Dapr 可以配置为在本地开发者机器或生产VM上以自托管模式运行。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

## 初始化

Dapr can be initialized [with Docker]({{< ref self-hosted-with-docker.md >}}) (default) or in [slim-init mode]({{< ref self-hosted-no-docker.md >}}). It can also be initialized and run in [offline or airgap environments]({{< ref self-hosted-airgap.md >}}). 默认的 Docker 初始通过以下容器和配置提供了开箱即用功能：
- 一个为状态管理和发布/订阅配置的默认组件的 Redis 容器。
- 一个用于诊断和追踪的Zipkin容器。
- 默认的 Dapr 配置和组件安装在 `$HOME/.dapr/` (Mac/Linux) 或`%USERPROFILE%\.dapr\` (Windows)。

`dapr-placement` 服务负责管理 actor 分布方案和关键范围设置。 此服务不是作为容器启动的，仅当你使用 Dapr actor 功能时才需要。 For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}).

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## 使用 Dapr 启动应用程序

You can use the [`dapr run` CLI command]({{< ref dapr-run.md >}}) to a Dapr sidecar process along with your application. Additional arguments and flags can be found [here]({{< ref arguments-annotations-overview.md >}}).

## Name resolution

Dapr uses a [name resolution component]({{< ref supported-name-resolution >}}) for service discovery within the [service invocation]({{< ref service-invocation >}}) building block. By default Dapr uses mDNS when in self-hosted mode.

If you are running Dapr on virtual machines or where mDNS is not available, then you can use the [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) component for name resolution.
