---
type: docs
title: "组件"
linkTitle: "Components"
weight: 300
description: "用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有一个接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 [components contrib repo](https://github.com/dapr/components-contrib) 是您可以为组件接口贡献实现并扩展Dapr功能的地方。

 构建块可以使用任何组件组合。 例如， [actors]({{X13X}}) 构建块和 [状态管理]({{X14X}}) 构建块都使用 [状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  As another example, the [Pub/Sub]({{X15X}}) building block uses [Pub/Sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 You can get a list of current components available in the current hosting environment using the `dapr components` CLI command.

 The following are the component types provided by Dapr:

* [Bindings](https://github.com/dapr/components-contrib/tree/master/bindings)
* [Pub/sub](https://github.com/dapr/components-contrib/tree/master/pubsub)
* [Middleware](https://github.com/dapr/components-contrib/tree/master/middleware)
* [Service discovery name resolution](https://github.com/dapr/components-contrib/tree/master/nameresolution)
* [Secret stores](https://github.com/dapr/components-contrib/tree/master/secretstores)
* [State](https://github.com/dapr/components-contrib/tree/master/state)
* [Tracing exporters](https://github.com/dapr/components-contrib/tree/master/exporters)

### Service invocation and service discovery components
Service discovery components are used with the [service invocation]({{X23X}}) building block to integrate with the hosting environment to provide service-to-service discovery. For example, the Kubernetes service discovery component integrates with the Kubernetes DNS service and self hosted uses mDNS.

### Service invocation and middleware components
Dapr allows custom [middleware]({{X25X}})  to be plugged into the request processing pipeline. Middleware can perform additional actions on a request, such as authentication, encryption and message transformation before the request is routed to the user code, or before the request is returned to the client. The middleware components are used with the [service invocation]({{X26X}}) building block.

### Secret store components
In Dapr, a [secret]({{X29X}}) is any piece of private information that you want to guard against unwanted users. Secrets stores, used to store secrets, are Dapr components and can be used by any of the building blocks.
