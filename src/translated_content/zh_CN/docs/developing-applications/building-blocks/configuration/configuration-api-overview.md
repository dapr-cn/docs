---
type: docs
title: "配置概述"
linkTitle: "概述"
weight: 1000
description: "配置API构建模块的概述"
---

在开发应用程序时，配置是一个常见的任务。通常，我们会使用配置存储来管理这些配置数据。配置项通常具有动态特性，并且与应用程序的需求紧密相关。

例如，应用程序的配置可能包括：
- 密钥名称
- 各种标识符
- 分区或消费者ID
- 数据库名称等

通常，配置项以键/值对的形式存储在状态存储或数据库中。开发人员或运维人员可以在运行时更改配置存储中的应用程序配置。一旦进行了更改，服务会被通知以加载新的配置。

从应用程序API的角度来看，配置数据是只读的，配置存储的更新通过运维工具进行。使用Dapr的配置API，您可以：
- 获取以只读键/值对形式返回的配置项
- 订阅配置项的变更通知

<img src="/images/configuration-api-overview.png" width=900>

{{% alert title="注意" color="primary" %}}
配置API不应与[Dapr sidecar和控制平面配置]({{< ref "configuration-overview" >}})混淆，后者用于在Dapr sidecar实例或已安装的Dapr控制平面上设置策略和参数。
{{% /alert %}}

## 试用配置

### 快速入门

想要测试Dapr配置API？通过以下快速入门来了解配置API的实际应用：

| 快速入门 | 描述 |
| ---------- | ----------- |
| [配置快速入门]({{< ref configuration-quickstart.md >}}) | 使用配置API获取配置项或订阅配置更改。 |

### 直接在应用中开始使用配置API

想要跳过快速入门？没问题。您可以直接在应用程序中尝试配置构建模块以读取和管理配置数据。在[Dapr安装完成]({{< ref "getting-started/_index.md" >}})后，您可以从[配置操作指南]({{< ref howto-manage-configuration.md >}})开始使用配置API。

## 观看演示

观看[使用Dapr配置构建模块的演示](https://youtu.be/tNq-n1XQuLA?t=496)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/tNq-n1XQuLA?start=496" title="YouTube视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步
请参阅以下指南：
- [操作指南：从配置存储读取应用程序配置]({{< ref howto-manage-configuration.md >}})