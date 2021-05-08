---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "被用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 例如， [actors]({{X24X}}) 构建块和 [状态管理]({{X25X}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  另一个示例是 [Pub/Sub]({{X26X}}) 构建块使用 [ Pub/Sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型：

## 状态存储

状态存储组件是存储键值对的数据存储（数据库、文件、内存），其作为 [状态管理]({{< ref "state-management-overview.md" >}}) 的构建模块之一。

- [状态存储列表]({{< ref supported-state-stores >}})
- [状态存储的实现](https://github.com/dapr/components-contrib/tree/master/state)

## 服务发现

服务发现组件与 [服务调用]({{X35X}}) 构建块配合使用，与托管环境集成以提供服务到服务发现。 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，而自托管时使用 mDNS。

- [服务发现名称解析的实现](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## 中间件

Dapr 允许将自定义 [中间件]({{X37X}})  插入请求处理管道。 中间件可以在请求路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作（例如，认证，加密和消息转换）。 中间件组件与服务调用 [构建块]({{X38X}}) 一起使用。

- [中间件的实现](https://github.com/dapr/components-contrib/tree/master/middleware)

## Pub/Sub 代理

Pub/sub broker components are message brokers that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

- [List of pub/sub brokers]({{< ref supported-pubsub >}})
- [Pub/sub broker implementations](https://github.com/dapr/components-contrib/tree/master/pubsub)

## 绑定

External resources can connect to Dapr in order to trigger a service or be called from a service as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [List of supported bindings]({{< ref supported-bindings >}})
- [Binding implementations](https://github.com/dapr/components-contrib/tree/master/bindings)

## Secret stores（密钥存储）

在 dapr 中， [机密]({{X43X}}) 是指任何你不想给不受欢迎的人（例如：黑客）知道的私有信息。 密钥存储被用来存储可以在服务中被获取以及被使用的密钥

- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)
