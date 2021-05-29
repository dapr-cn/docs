---
type: docs
title: "组件"
linkTitle: "Components"
weight: 300
description: "被用于构建块和应用程序的模块化功能"
---

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用任何组件组合。 For example the [actors]({{<ref "actors-overview.md">}}) building block and the [state management]({{<ref "state-management-overview.md">}}) building block both use [state components](https://github.com/dapr/components-contrib/tree/master/state).  As another example, the [Pub/Sub]({{<ref "pubsub-overview.md">}}) building block uses [Pub/Sub components](https://github.com/dapr/components-contrib/tree/master/pubsub).

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用组件的列表。

 以下是 Dapr 提供的组件类型：

## 状态存储

State store components are data stores (databases, files, memory) that store key-value pairs as part of the [state management]({{< ref "state-management-overview.md" >}}) building block.

- [状态存储列表]({{< ref supported-state-stores >}})
- [状态存储的实现](https://github.com/dapr/components-contrib/tree/master/state)

## 服务发现

Service discovery components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block to integrate with the hosting environment to provide service-to-service discovery. 例如， Kubernetes 服务发现组件与 Kubernetes DNS 服务集成，而自托管时使用 mDNS。

- [服务发现名称解析的实现](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## 中间件

Dapr allows custom [middleware]({{<ref "middleware-concept.md">}})  to be plugged into the request processing pipeline. 中间件可以在请求路由到用户代码之前，或者在将请求返回给客户端之前，对请求执行额外的操作（例如，认证，加密和消息转换）。 The middleware components are used with the [service invocation]({{<ref "service-invocation-overview.md">}}) building block.

- [中间件的实现](https://github.com/dapr/components-contrib/tree/master/middleware)

## Pub/Sub 代理

Pub/sub broker components are message brokers that can pass messages to/from services as part of the [publish & subscribe]({{< ref pubsub-overview.md >}}) building block.

- [Pub/sub 支持的列表]({{< ref supported-pubsub >}})
- [发布/订阅 实现](https://github.com/dapr/components-contrib/tree/master/pubsub)

## 绑定

External resources can connect to Dapr in order to trigger a service or be called from a service as part of the [bindings]({{< ref bindings-overview.md >}}) building block.

- [支持的绑定列表]({{< ref supported-bindings >}})
- [绑定实现](https://github.com/dapr/components-contrib/tree/master/bindings)

## Secret stores（密钥存储）

In Dapr, a [secret]({{<ref "secrets-overview.md">}}) is any piece of private information that you want to guard against unwanted users. 密钥存储被用来存储可以在服务中被获取以及被使用的密钥

- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)
