---
type: docs
title: "自我托管模式下的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Windows/Linux/MacOS 机器上运行 Dapr 的概述"
---

## 概述

Dapr 可以配置为在本地开发者机器或生产 VM 上以自托管模式运行。 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

## 初始化

Dapr 能通过 [Docker]({{< ref self-hosted-with-docker.md >}}) (default) 或者在 [slim-init 模式]({{< ref self-hosted-no-docker.md >}})初始化。 默认 Docker 的设置提供了开箱即用功能，并带有以下的容器和配置：
- 一个为状态管理和发布/订阅配置的默认组件的 Redis 容器。
- 一个用于诊断和追踪的 Zipkin 容器。
- 默认的 Dapr 配置和组件安装在 `$HOME/.dapr/` (Mac/Linux) 或 `%USERPROFILE%\.dapr\` (Windows)。

`dapr-placement` 服务负责管理 actor 分布方案和键范围设置。 此服务不是作为容器启动的，仅当你使用 Dapr actor 功能时才需要。 有关 actor ` Placement ` 服务的更多信息，请阅读 [actor 概述]({{< ref "actors-overview.md" >}})。

<img src="/images/overview-standalone-docker.png" width=1000 alt="自托管 Docker 模式下的 Dapr 图示" />

## 使用 Dapr 启动应用程序

您可以使用 [`dapr run` CLI命令行]({{< ref dapr-run.md >}}) 运行 Dapr sidecar 和您的应用程序。 额外的参数和标志可以在 [此处]({{< ref arguments-annotations-overview.md >}}) 找到。

## 名称解析

Dapr 使用 [名称解析组件]({{< ref supported-name-resolution >}}) 在 [服务调用]({{< ref service-invocation >}}) 构建块中进行服务发现。 默认情况下，Dapr 在自托管模式下使用 mDNS。

如果您在虚拟机或者其他不支持 mTLS 的场景下运行 Dapr，您可以使用 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 组件用于名称解析。
