---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "被用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 例如， [actor]({{X12X}}) 构建块和 [状态管理]({{X13X}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  另一个示例是 [Pub/Sub]({{X14X}}) 构建块使用 [ Pub/Sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型：

* [Bindings（绑定）](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Pub/sub（发布/订阅）](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Middleware（中间件）](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Service discovery name resolution（服务发现名称解析）](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Secret stores（密钥存储）](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [State（状态）](https://github.com/dapr/components-contrib/tree/master/state)

### 服务调用和服务发现组件
服务发现组件与 [服务调用]({{X 22 X}}) 构建块配合使用，与托管环境集成以提供服务间发现。 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，而自托管时使用 mDNS。

### 服务调用和中间件组件
Dapr 允许将自定义 [中间件]({{X24X}})  插入请求处理管道。 中间件可以在请求路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作（例如，认证，加密和消息转换）。 中间件组件与服务调用 [构建块]({{X25X}}) 一起使用。

### 密钥存储组件
在 Dapr 中，[密钥]({{X28X}}) 是您想要防止不需要的用户得到的任何私有信息。 用于存储机密的机密存储组件是 Dapr 组件，可由任何构建基块使用。
