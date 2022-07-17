---
type: docs
title: "绑定概述"
linkTitle: "概述"
weight: 100
description: Dapr 绑定构建块概述
---

## 介绍

使用绑定，您可以使用来自外部系统的事件或与外部系统的接口来触发应用程序。 此构建块为您和您的代码提供了若干益处 :

- 除去连接到消息传递系统 ( 如队列和消息总线 ) 并进行轮询的复杂性
- 聚焦于业务逻辑，而不是如何与系统交互的实现细节
- 使代码不受 SDK 或库的跟踪
- 处理重试和故障恢复
- 在运行时在绑定之间切换
- 构建具有特定于环境的绑定的可移植应用程序，不需要进行代码更改

对于特定示例，绑定将允许微服务响应入局 Twilo/SMS 消息而不添加或配置第三方 Twilio SDK，担心来自 Twilio 的轮询 (或使用 websockets 等 ) 。

绑定是独立于 Dapr 运行时开发的。 您可以在 [这里](https://github.com/dapr/components-contrib/tree/master/bindings) 查看绑定并做出贡献。

## 输入绑定

输入绑定用于在发生来自外部资源的事件时触发应用程序。 可选的有效负载和元数据可以与请求一起发送。

为了接收来自输入绑定的事件 :

1. 定义描述绑定类型及其元数据 ( 连接信息等) 的组件 YAML
2. 监听传入事件的 HTTP 终结点，或使用 gRPC 原型库获取传入事件

> 如果应用程序要订阅绑定，在启动 Dapr 时，对应用程序的所有已定义输入绑定发送 `OPTIONS` 请求，并期望 `NOT FOUND (404)` 以外的状态码。

开始使用输入绑定，请参阅[使用输入绑定创建事件驱动应用]({{< ref howto-triggers.md >}})。

## 输出绑定

输出绑定允许用户调用外部资源。 可选的有效负载和元数据可与调用请求一起发送。

为了调用输出绑定：

1. 定义描述绑定类型及其元数据 ( 连接信息等) 的组件 YAML
2. 使用 HTTP 终结点或 gRPC 方法调用具有可选有效负载的绑定

开始使用输入绑定，请参阅[使用输出绑定向外部系统发送事件]({{< ref howto-bindings.md >}})。

## 下一步
* 遵循这些指南：
    * [使用输入绑定从不同资源触发服务]({{< ref howto-triggers.md >}})
    * [使用输出绑定调用不同的资源]({{< ref howto-bindings.md >}})
* Try out the [bindings quickstart](https://github.com/dapr/quickstarts/tree/master/bindings)
* 查阅[绑定API规范]({{< ref bindings_api.md >}})
