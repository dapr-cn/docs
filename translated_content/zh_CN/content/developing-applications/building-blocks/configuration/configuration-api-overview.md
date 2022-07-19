---
type: docs
title: "配置概览"
linkTitle: "概述"
weight: 1000
description: "Dapr 配置管理构建块概述"
---

## 介绍

在编写应用程序时，使用应用程序配置是一项常见任务，并且经常使用配置存储来管理此配置数据。 配置项目通常具有动态性质，并且与消费它的应用程序的需求紧密耦合。 例如，应用程序配置的常见用途包括密钥名称、不同标识符、分区或使用者 ID、要连接到的数据库的名称等。 这些配置项目通常作为键/值项存储在状态存储或数据库中。 开发人员或操作员可以在运行时更改应用程序配置，并且需要通知开发人员这些更改，以便执行所需的操作并加载新配置。 此外，从应用程序 API 的角度来看，配置数据通常是只读的，通过操作员工具对配置存储进行了更新。 Dapr 的配置 API 允许开发人员使用以只读键/值对形式返回的配置项目，并在配置项目更改时订阅更改。

<img src="/images/configuration-api-overview.png" width=900>

值得注意的是，此配置 API 不应与 [Dapr sidecar 和控制平面配置]({{<ref "configuration-overview">}}) 混淆，后者用于在 Dapr sidecar 实例或已安装的 Dapr 控制平面上设置策略和设置。

## 特性

**此 API 目前在 `Alpha` 并且只能在 gRPC 上使用。 在将 API 认证为 `Stable` 状态之前，将提供具有此 URL 语法 `/v1.0/configuration` 的 HTTP1.1 支持版本。*

## 下一步
遵循这些指南：
- [操作方法：从配置存储中读取应用程序配置]({{< ref howto-manage-configuration.md >}})

