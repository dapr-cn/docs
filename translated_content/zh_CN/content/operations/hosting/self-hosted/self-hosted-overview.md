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

Dapr 可以初始化为 [使用 Docker 模式]({{< ref self-hosted-with-docker.md >}}) (默认) 或 [ slim-init 模式]({{< ref self-hosted-no-docker.md >}})。 默认的 Docker 初始通过以下容器和配置提供了开箱即用功能：
- 一个为状态管理和发布/订阅配置的默认组件的 Redis 容器。
- 一个用于诊断和追踪的Zipkin容器。
- 默认的 Dapr 配置和组件安装在 `$HOME/.dapr/` (Mac/Linux) 或`%USERPROFILE%\.dapr\` (Windows)。

`dapr-placement` 服务负责管理 actor 分布方案和关键范围设置。 此服务不是作为容器启动的，仅当你使用 Dapr actor 功能时才需要。 有关 actor `放置` 服务的更多信息，请阅读 [actor 概述]({{< ref "actors-overview.md" >}})。

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## 使用 Dapr 启动应用程序

您可以使用 [`dapr run` CLI 命令]({{< ref dapr-run.md >}}) 运行 Dapr sidecar 程序以及您的应用程序。

