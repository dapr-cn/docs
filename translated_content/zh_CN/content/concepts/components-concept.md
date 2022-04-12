---
type: docs
title: "组件"
linkTitle: "组件"
weight: 300
description: "构建模块和应用所使用的模块化功能"
---

Dapr采用模块化设计，功能以组件形式交付。 每个组件都有接口定义。  所有组件都是可插拔的，因此您可以将组件换为另一个具有相同接口的组件。 您可以在 [components contrib repo](https://github.com/dapr/components-contrib) 为组件接口贡献实现并扩展 Dapr 功能。

 构建块可以使用组件的任意组合。 例如， [actors]({{<ref "actors-overview.md">}}) 构建块和[状态管理]({{<ref "state-management-overview.md">}})构建块都使用[状态组件](https://github.com/dapr/components-contrib/tree/master/state)。  再比如，[Pub/Sub]({{<ref "pubsub-overview.md">}}) 构建块使用 [ Pub/Sub 组件](https://github.com/dapr/components-contrib/tree/master/pubsub)。

 您可以使用 `dapr components` CLI 命令查看当前托管环境中可用的组件列表。

以下是 Dapr 提供的组件：

## 状态存储

状态存储组件是存储键值对的数据存储（数据库、文件、内存），是[状态管理]({{< ref "state-management-overview.md" >}})构建块的一部分。

- [状态存储列表]({{< ref supported-state-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/state)

## 命名解析

命名解析组件与[服务调用]({{<ref "service-invocation-overview.md">}})构建块配合使用，与托管环境集成以提供服务到服务的发现。 例如，Kubernetes 命名解析组件与 Kubernetes DNS 服务集成，自托管使用 mDNS，VM 集群可以使用 Consul 命名解析组件。

- [命名解析组件列表]({{< ref supported-name-resolution >}})
- [命名解析实现](https://github.com/dapr/components-contrib/tree/master/nameresolution)

## Pub/Sub 代理

发布/订阅组件是消息代理，可以在应用程序之间收发消息，是[发布&订阅]({{< ref pubsub-overview.md >}})构建块的一部分。

- [发布/订阅代理列表]({{< ref supported-pubsub >}})
- [发布/订阅 实现](https://github.com/dapr/components-contrib/tree/master/pubsub)

## 绑定

外部资源可以连接到 Dapr，以便触发应用程序的方法，或者被应用程序调用，是[绑定]({{< ref bindings-overview.md >}})构建块的一部分。

- [支持的绑定列表]({{< ref supported-bindings >}})
- [绑定实现](https://github.com/dapr/components-contrib/tree/master/bindings)

## 密钥存储

[密钥]({{<ref "secrets-overview.md">}})是任何你想保护的私人信息，以防止不需要的访问。 密钥存储用来存储可在应用中检索和使用的密钥。

- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [密钥存储实现](https://github.com/dapr/components-contrib/tree/master/secretstores)

## 配置存储

配置存储用于保存应用数据，配置可在应用启动或者配置更改的时候被应用读取。 配置存储支持动态加载（热更新）

- [支持的配置存储列表]({{< ref supported-configuration-stores >}})
- [配置存储的实现](https://github.com/dapr/components-contrib/tree/master/configuration)

## 中间件

Dapr 允许将自定义[中间件]({{<ref "middleware.md">}})插入到 HTTP 请求处理管道中。 中间件可以对HTTP请求进行额外的操作，如在请求被路由到用户代码之前，或在请求被返回给客户端之前，进行认证、加密和消息转换。 中间件组件与[服务调用]({{<ref "service-invocation-overview.md">}})构建块一起使用。

- [支持的中间件组件列表]({{< ref supported-middleware >}})
- [中间件的实现](https://github.com/dapr/components-contrib/tree/master/middleware)