---
type: docs
title: "配置概览"
linkTitle: "配置概览"
weight: 1000
description: "Use Dapr to get and watch application configuration"
---

在编写应用程序时，使用应用程序配置是一项常见任务，并且经常使用配置存储来管理此配置数据。 配置项目通常具有动态性质，并且与消费它的应用程序的需求紧密耦合。 For example, common uses for application configuration include names of secrets that need to be retrieved, different identifiers, partition or consumer IDs, names of databased to connect to etc. These configuration items are typically stored as key-value items in a database.

Dapr provides a [State Management API]({{<ref "state-management-overview.md">}})) that is based on key-value stores. However, application configuration can be changed by either developers or operators at runtime and the developer needs to be notified of these changes in order to take the required action and load the new configuration. Also the configuration data may want to be read only. Dapr's Configuration API allows developers to consume configuration items that are returned as key/value pair and subscribe to changes whenever a configuration item changes.

*此 API 目前在 `Alpha 状态` 并且只能在 gRPC 上使用。 此 URL `/v1.0/configuration` 支持的HTTP1.1版本将在 API 变得稳定之前可用。 *

## 参考资料

- [如何管理应用程序配置]({{< ref howto-manage-configuration.md >}})

