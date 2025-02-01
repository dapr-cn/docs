---
type: docs
title: "Dapr 自托管模式概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Windows/Linux/MacOS 机器上运行 Dapr 的概述"
---

## 概述

Dapr 可以配置为在本地开发者机器或生产环境的虚拟机上运行自托管模式。每个服务都会有一个 Dapr 运行时进程（或称为 sidecar），该进程配置为使用状态存储、发布/订阅、绑定组件和其他构建块。

## 初始化

Dapr 可以通过 [Docker]({{< ref self-hosted-with-docker.md >}})（默认）或 [slim-init 模式]({{< ref self-hosted-no-docker.md >}})进行初始化。它也可以在 [离线或隔离环境]({{< ref self-hosted-airgap.md >}})中初始化和运行。

{{% alert title="注意" color="warning" %}}
您也可以使用 [Podman](https://podman.io/) 代替 Docker 作为容器运行时。请参阅 [使用 Podman 初始化 Dapr]({{< ref self-hosted-with-podman.md >}}) 以获取更多详细信息。在由于各种网络限制无法安装 Docker 的情况下，这可能会很有用。
{{% /alert %}}

默认的 Docker 设置提供了即用的功能，包含以下容器和配置：
- 一个 Redis 容器，配置为同时用于状态管理和发布/订阅的默认组件。
- 一个 Zipkin 容器，用于诊断和跟踪。
- 默认的 Dapr 配置和组件安装在 `$HOME/.dapr/` (Mac/Linux) 或 `%USERPROFILE%\.dapr\` (Windows)。

`dapr-placement` 服务负责管理 actor 的分布方案和键范围设置。此服务不作为容器启动，仅在您使用 Dapr actor 时才需要。有关 actor `Placement` 服务的更多信息，请阅读 [actor 概述]({{< ref "actors-overview.md" >}})。

<img src="/images/overview-standalone-docker.png" width=1000 alt="Dapr 自托管 Docker 模式的示意图" />

## 使用 Dapr 启动应用程序

您可以使用 [`dapr run` CLI 命令]({{< ref dapr-run.md >}}) 启动 Dapr sidecar 进程和您的应用程序。其他参数和标志可以在[这里]({{< ref arguments-annotations-overview.md >}})找到。

## 名称解析

Dapr 使用 [名称解析组件]({{< ref supported-name-resolution >}}) 在 [服务调用]({{< ref service-invocation >}}) 构建块中进行服务发现。默认情况下，Dapr 在自托管模式下使用 mDNS。

如果您在虚拟机上运行 Dapr 或 mDNS 不可用的情况下，可以使用 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 组件进行名称解析。