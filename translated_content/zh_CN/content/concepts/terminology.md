---
type: docs
title: "Dapr 术语和定义"
linkTitle: "术语"
weight: 800
description: Dapr文件中通用术语和缩略语的定义
---

这个页面详细介绍了您可能在Dapr文档中读到的常见术语。

| 词条                             | 定义                                                                                                                                                                                                                      | 详情                                                                                                   |
|:------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 应用（App/Application）            | A running service/binary, usually one that you as the user create and run.                                                                                                                                              |                                                                                                      |
| Building block (构建块)           | Dapr 为用户提供的 API，以帮助创建微服务和应用程序。                                                                                                                                                                                          | [Dapr 构建块]({{< ref building-blocks-concept.md >}})                                                   |
| Component (组件)                 | 由 Dapr 构建块单独使用或与其他组件集合一起使用的模块化功能类型。                                                                                                                                                                                     | [Dapr 组件]({{< ref components-concept.md >}})                                                         |
| Configuration (配置)             | 一个 YAML 文件，声明Dapr sidecars 或 Dapr 控制面板的所有设置。 This is where you can configure control plane mTLS settings, or the tracing and middleware settings for an application instance.                                           | [Dapr配置]({{< ref configuration-concept.md >}})                                                       |
| Dapr                           | 分布式应用程序运行时。                                                                                                                                                                                                             | [Dapr 概述]({{< ref overview.md >}})                                                                   |
| Dapr control plane (Dapr 控制面板) | 在托管平台（如 Kubernetes 集群）上安装 Dapr 的一部分的服务集合。 This allows Dapr-enabled applications to run on the platform and handles Dapr capabilities such as actor placement, Dapr sidecar injection, or certificate issuance/rollover. | [自托管概述]({{< ref self-hosted-overview >}})<br />[Kubernetes概述]({{< ref kubernetes-overview >}}) |
| 自托管                            | 您可以在 Windows/macOS/Linux机器 用Dapr运行您的应用程序。 Dapr provides the capability to run on machines in "self-hosted" mode.                                                                                                        | [自托管模式]({{< ref self-hosted-overview.md >}})                                                         |
| Service (服务)                   | 正在运行的应用程序或二进制文件。 This can refer to your application or to a Dapr application.                                                                                                                                           |                                                                                                      |
| Sidecar(边车)                    | 将应用程序作为单独的流程或容器与您的应用程序一起运行的程序。                                                                                                                                                                                          | [Sidecar 模式](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar)                   |
