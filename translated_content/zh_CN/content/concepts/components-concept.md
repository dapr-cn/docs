---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "被用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 例如， [actors]({{<ref "actors-overview.md">}}) 构建块和 [状态管理]({{<ref "state-management-overview.md">}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  As another example, the [pub/sub]({{<ref "pubsub-overview.md">}}) building block uses [pub/sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 You can get a list of current components available in the hosting environment using the `dapr components` CLI command.

以下是 Dapr 提供的组件类型：

## State stores

状态存储组件是存储键值对的数据存储（数据库、文件、内存），其作为 [状态管理]({{< ref "state-management-overview.md" >}}) 的构建模块之一。

- [状态存储列表]({{< ref supported-state-stores >}})
- [状态存储的实现](https://github.com/dapr/components-contrib/tree/master/state)

## Name resolution

Name resolution components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment and provide service-to-service discovery. 例如，Kubernetes 名称解析组件与 Kubernetes DNS 服务集成，自托管使用 mDNS，VM 集群可以使用 Consul 名称解析组件。

- [List of name resolution components]({{< ref supported-name-resolution >}})
- [Name resolution implementations](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## Pub/Sub 代理

发布/订阅 组件是消息分发器，可以作为应用程序之间进行消息[发布 & 订阅]({{< ref pubsub-overview.md >}}) 构建块。

- [Pub/sub 支持的列表]({{< ref supported-pubsub >}})
- [发布/订阅 实现](https://github.com/dapr/components-contrib/tree/master/pubsub)

## 绑定

External resources can connect to Dapr in order to trigger a method on an application or be called from an application as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [支持的绑定列表]({{< ref supported-bindings >}})
- [绑定实现](https://github.com/dapr/components-contrib/tree/master/bindings)

## Secret stores（密钥仓库）

A [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted access. Secrets stores are used to store secrets that can be retrieved and used in applications.

- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)

## Configuration stores

Configuration stores are used to save application data, which can then be read by application instances on startup or notified of when changes occur. This allows for dynamic configuration.

- [List of supported configuration stores]({{< ref supported-configuration-stores >}})
- [Configuration store implementations](https://github.com/dapr/components-contrib/tree/master/configuration)

## 中间件

Dapr allows custom [middleware]({{<ref "middleware.md">}})  to be plugged into the HTTP request processing pipeline. Middleware can perform additional actions on an HTTP request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. 中间件组件与 [服务调用]({{<ref "service-invocation-overview.md">}}) 基础结构块一起使用。

- [List of supported middleware components]({{< ref supported-middleware >}})
- [中间件的实现](https://github.com/dapr/components-contrib/tree/master/middleware)