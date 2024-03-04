---
type: docs
title: "如何操作使用脚本与 virtual actors 互动"
linkTitle: "如何：与virtual actors互动"
weight: 60
description: 调用 actor 方法进行状态管理
---

了解如何通过调用 HTTP/gRPC 端点来使用 virtual actors。

## 调用 actor 方法

你可以通过调用 HTTP/gRPC 端点与 Dapr 互动来调用 actor 方法。

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

在请求正文中为角色方法提供数据。 请求的响应（即 actor 方法调用的数据）在响应体中。

指 [到 Actors API 规范]({{< ref "actors_api.md#invoke-actor-method" >}}) 了解更多详情。

{{% alert title="Note" color="primary" %}}
另外，您也可以使用 [Dapr SDK 来使用 Actors]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
{{% /alert %}}

## 与 Actors 一起保存状态

You can interact with Dapr via HTTP/gRPC endpoints to save state reliably using the Dapr actor state management capabaility.

要使用 Actor，您的状态存储必须支持多项目事务。 这意味着你的状态存储组件必须实现 `TransactionalStore` 接口。

[请参见支持事务/Actors 的组件列表]({{< ref supported-state-stores.md >}})。 只有一个单一的状态存储组件可以被用作所有角色的状态存储。

## 下一步

{{< button text="Actor reentrancy >>" page="actor-reentrancy.md" >}}

## 相关链接

- 请参阅 [Dapr SDK 文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
- [Actors API 参考]({{< ref actors_api.md >}})
- [Actor 概述]({{< ref actors-overview.md >}})