---
type: docs
title: "组件"
linkTitle: "Components"
weight: 300
description: "用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有一个接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 [components contrib repo](https://github.com/dapr/components-contrib) 是您可以为组件接口贡献实现并扩展Dapr功能的地方。

 构建块可以使用任何组件组合。 例如， [actors]({{X13X}}) 构建块和 [状态管理]({{X14X}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  另一个示例是 [Pub/Sub]({{X15X}}) 构建块使用 [ Pub/Sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型:

* [Bindings（绑定）](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Pub/sub（发布/订阅）](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Middleware（中间件）](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Service discovery name resolution（服务发现名称解析）](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Secret stores（密钥存储）](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [State（状态）](https://github.com/dapr/components-contrib/tree/master/state)
* [Tracing exporters（追踪出口）](https://github.com/dapr/components-contrib/tree/master/exporters)

### 服务调用和服务发现组件
服务发现组件与 [服务调用]({{X23X}}) 构建块配合使用，与托管环境集成以提供服务到服务发现。 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，并且自身托管使用 mDNS。

### 服务调用和中间件组件
Dapr 允许将自定义 [中间件]({{X25X}})  插入请求处理管道。 中间件可以在请求( 例如，认证，加密和消息转换) 路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作。 中间件组件与服务调用 [构建块]({{X26X}}) 一起使用。

### 机密存储组件
在 dapr 中， [机密]({{X29X}}) 是指任何你不想给不受欢迎的人（例如：黑客）知道的私有信息。 用于存储机密的机密存储组件是 Dapr 组件，可由任何构建基块使用。
