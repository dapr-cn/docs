---
type: docs
title: 配置概览
linkTitle: Overview
weight: 1000
description: Dapr 配置管理构建块概述
---

在编写应用程序时，消费应用程序配置是一项常见任务。 配置存储通常用于管理这些配置数据。 配置项目通常具有动态性质，并且与消费它的应用程序的需求紧密耦合。

例如，应用程序配置可包括

- Secrets 名称
- 不同的标识符
- 分区或消费者 ID
- 要连接的数据库名称等

通常，配置项以键/值项的形式存储在状态存储或数据库中。 开发人员或操作人员可在运行时更改配置存储区中的应用程序配置。 一旦做出更改，就会通知服务加载新配置。

从应用程序接口的角度来看，配置数据是只读的，通过操作员工具对配置存储进行更新。 使用 Dapr 的配置 API，您可以

- 使用以只读键/值对形式返回的配置项
- 每当配置项发生变化时，都会订阅更改

<img src="/images/configuration-api-overview.png" width=900>

{{% alert title="注意" color="primary" %}}
配置 API 不应与[Dapr sidecar 和控制平面配置]({{< ref "configuration-overview" >}}) 混淆，后者用于在 Dapr sidecar 实例或已安装的 Dapr 控制平面上设置策略和设置。
{{% /alert %}}

## 试用配置API

### 快速入门

想测试一下 Dapr 配置 API 吗？ 通过下面的快速入门，了解配置 API 的运行情况：

| 快速入门                                                                                                                     | 说明                     |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------------- |
| [配置快速入门]({{< ref configuration-quickstart.md >}}) | 使用配置 API 获取配置项或订阅配置更改。 |

### 开始直接在应用程序中使用配置应用程序接口

想跳过快速入门？ Not a problem. 您可以直接在应用程序中试用配置构建模块，以读取和管理配置数据。 安装[Dapr]({{< ref "getting-started/_index.md" >}})之后，您可以开始使用配置 API，从[配置操作方法指南]({{< ref howto-manage-configuration.md >}})开始。

## 观看演示

观看 [使用 Dapr 配置构建模块的演示](https://youtu.be/tNq-n1XQuLA?t=496)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/tNq-n1XQuLA?start=496" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

关注以下指南：

- [操作方法：从配置存储中读取应用程序配置]({{< ref howto-manage-configuration.md >}})
