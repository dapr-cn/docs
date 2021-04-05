---
type: 文档
title: "Overview of Dapr in self-hosted mode"
linkTitle: "概述"
weight: 10000
description: "Overview of how to get Dapr running on your local machine"
---

Dapr can be configured to run on your local developer machine in self hosted mode. 每个运行的服务都有一个 Dapr 运行时进程 (或 sidecar) ，配置为使用状态存储， pub/sub，绑定组件和其他构建块。

In self hosted mode, Redis is running locally in a container and is configured to serve as both the default component for state store and for pub/sub. A Zipkin container is also configured for diagnostics and tracing.  After running `dapr init`, see the `$HOME/.dapr/components` directory (Mac/Linux) or `%USERPROFILE%\.dapr\components` on Windows.

The `dapr-placement` service is responsible for managing the actor distribution scheme and key range settings. This service is only required if you are using Dapr actors. For more information on the actor `Placement` service read [actor overview]({{< ref "actors-overview.md" >}}).

<img src="/images/overview_standalone.png" width=800>

您可以使用 [Dapr CLI](https://github.com/dapr/cli#launch-dapr-and-your-app) 在本地机器上运行启用了 Dapr 的应用程序。