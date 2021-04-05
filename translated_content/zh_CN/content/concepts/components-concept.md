---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "被用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 For example the [actors]({{X12X}}) building block and the [state management]({{X13X}}) building block both use [state components](https://github.com/dapr/components-contrib/tree/master/state).  As another example, the [Pub/Sub]({{X14X}}) building block uses [Pub/Sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型：

* [绑定](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Pub/sub（发布/订阅）](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [中间件](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Service discovery name resolution（服务发现名称解析）](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Secret stores（密钥存储）](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [State（状态）](https://github.com/dapr/components-contrib/tree/master/state)

### 服务调用和服务发现组件
Service discovery components are used with the [service invocation]({{X22X}}) building block to integrate with the hosting environment to provide service-to-service discovery. 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，而自托管时使用 mDNS。

### 服务调用和中间件组件
Dapr allows custom [middleware]({{X24X}})  to be plugged into the request processing pipeline. 中间件可以在请求路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作（例如，认证，加密和消息转换）。 The middleware components are used with the [service invocation]({{X25X}}) building block.

### 密钥存储组件
In Dapr, a [secret]({{X28X}}) is any piece of private information that you want to guard against unwanted users. 用于存储机密的机密存储组件是 Dapr 组件，可由任何构建基块使用。
