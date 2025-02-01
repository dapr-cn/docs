---
type: docs
title: "Dapr术语和定义"
linkTitle: "术语"
weight: 1000
description: Dapr文档中常见术语和缩写的定义
---

本页面详细介绍了您可能在Dapr文档中遇到的所有常见术语。

| 术语 | 定义 | 更多信息 |
|:-----|------------|------------------|
| 应用程序 | 一个正在运行的服务或程序，通常是由用户创建和运行的。 |
| 构件 | Dapr为用户提供的API，帮助创建微服务和应用程序。 | [Dapr构件]({{< ref building-blocks-concept.md >}})
| 组件 | 模块化的功能单元，可以单独使用或与其他组件结合使用，由Dapr构件调用。 | [Dapr组件]({{< ref components-concept.md >}})
| 配置 | 一个YAML文件，用于声明所有Dapr边车或Dapr控制平面的设置。在这里，您可以配置控制平面的mTLS设置，或应用程序实例的跟踪和中间件设置。 | [Dapr配置]({{< ref configuration-concept.md >}})
| Dapr | 分布式应用运行时。 | [Dapr概述]({{< ref overview.md >}})
| Dapr控制平面 | 一组服务，是在托管平台（如Kubernetes集群）上安装Dapr的一部分。这使得启用Dapr的应用程序可以在平台上运行，并处理Dapr功能，如actor放置、Dapr边车注入或证书签发/轮换。 | [自托管概述]({{< ref self-hosted-overview >}})<br />[Kubernetes概述]({{< ref kubernetes-overview >}})
| HTTPEndpoint | HTTPEndpoint是一个Dapr资源，用于识别通过服务调用API访问的非Dapr端点。 | [服务调用API]({{< ref service_invocation_api.md >}})
| 命名空间 | Dapr中的命名空间提供隔离功能，从而支持多租户。 | 了解更多关于命名空间的[组件]({{< ref component-scopes.md >}})、[服务调用]({{< ref service-invocation-namespaces.md >}})、[发布/订阅]({{< ref pubsub-namespaces.md >}})和[actors]({{< ref namespaced-actors.md >}})
| 自主管理 | 在Windows/macOS/Linux机器上运行应用程序的能力，使用Dapr。Dapr提供在“自主管理”模式下运行的能力。 | [自主管理模式]({{< ref self-hosted-overview.md >}})
| 服务 | 一个正在运行的应用程序或程序。这可以指您的应用程序或Dapr应用程序。 |
| sidecar | 一个与您的应用程序一起运行的程序，作为一个单独的进程或容器。 | [边车模式](https://docs.microsoft.com/azure/architecture/patterns/sidecar)
