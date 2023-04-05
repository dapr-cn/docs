---
type: docs
title: "自我托管模式下的 Dapr 概述"
linkTitle: "概述"
weight: 10000
description: "如何在 Windows/Linux/MacOS 机器上运行 Dapr 的概述"
---

## 概述

Dapr can be configured to run in self-hosted mode on your local developer machine or on production VMs. 每个正在运行的服务都有一个 Dapr 运行时进程（或 sidecar），该进程配置为使用状态存储、发布/订阅、绑定组件和其他构建块。

## 初始化

Dapr 能通过 [Docker]({{< ref self-hosted-with-docker.md >}}) (default) 或者在 [slim-init 模式]({{< ref self-hosted-no-docker.md >}})初始化。 它还可以初始化并在 [离线或气隙环境]({{< ref self-hosted-airgap. md >}})中运行。

{{% alert title="Note" color="warning" %}}
You can also use [Podman](https://podman.io/) in place of Docker as container runtime. Please refer [dapr init with Podman]({{< ref self-hosted-with-podman.md >}}) for more details. It can be useful in the scenarios where docker cannot be installed due to various networking constraints.
{{% /alert %}}

The default Docker setup provides out of the box functionality with the following containers and configuration:
- A Redis container configured to serve as the default component for both state management and publish/subscribe.
- 一个用于诊断和追踪的 Zipkin 容器。
- 默认的 Dapr 配置和组件安装在 `$HOME/.dapr/` (Mac/Linux) 或 `%USERPROFILE%\.dapr\` (Windows)。

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is not launched as a container and is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}).

<img src="/images/overview-standalone-docker.png" width=1000 alt="Diagram of Dapr in self-hosted Docker mode" />

## 使用 Dapr 启动应用程序

You can use the [`dapr run` CLI command]({{< ref dapr-run.md >}}) to a Dapr sidecar process along with your application. Additional arguments and flags can be found [here]({{< ref arguments-annotations-overview.md >}}).

## 名称解析

Dapr uses a [name resolution component]({{< ref supported-name-resolution >}}) for service discovery within the [service invocation]({{< ref service-invocation >}}) building block. By default Dapr uses mDNS when in self-hosted mode.

如果您在虚拟机或者其他不支持 mTLS 的场景下运行 Dapr，您可以使用 [HashiCorp Consul]({{< ref setup-nr-consul.md >}}) 组件用于名称解析。
