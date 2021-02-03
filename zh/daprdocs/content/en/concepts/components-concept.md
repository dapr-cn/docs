---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，以组件的方式提供功能。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 例如， [actor]({{X12X}}) 构建块和 [状态管理]({{X13X}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  另一个示例是 [Pub/Sub]({{X14X}}) 构建块使用 [ Pub/Sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型：

* [Bindings（绑定）](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Pub/sub（发布/订阅）](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Middleware（中间件）](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Service discovery name resolution（服务发现名称解析）](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Secret stores（密钥存储）](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [State（状态）](https://github.com/dapr/components-contrib/tree/master/state)

### 服务调用和服务发现组件
Service discovery components are used with the [service invocation]({{X22X}}) building block to integrate with the hosting environment to provide service-to-service discovery. 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，并且自身托管使用 mDNS。

### 服务调用和中间件组件
Dapr allows custom [middleware]({{X24X}})  to be plugged into the request processing pipeline. 中间件可以在请求( 例如，认证，加密和消息转换) 路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作。 The middleware components are used with the [service invocation]({{X25X}}) building block.

### 机密存储组件
In Dapr, a [secret]({{X28X}}) is any piece of private information that you want to guard against unwanted users. 用于存储机密的机密存储组件是 Dapr 组件，可由任何构建基块使用。
