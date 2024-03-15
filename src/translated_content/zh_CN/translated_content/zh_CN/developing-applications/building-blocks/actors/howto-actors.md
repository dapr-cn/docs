---
type: docs
title: 如何操作使用脚本与 virtual actors 互动
linkTitle: 如何：与virtual actors互动
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

请参阅 [Actors API 描述]({{< ref "actors_api.md#invoke-actor-method" >}}) 以获取更多详细信息。

{{% alert title="注意" color="primary" %}}
或者，您可以使用[Dapr SDK来使用Actors]({{< ref "developing-applications/sdks/#sdk-languages" >}}).
{{% /alert %}}

## 与 Actors 一起保存状态

您可以通过 HTTP/gRPC 端点与 Dapr 交互，利用 Dapr 的 actor 状态管理功能可靠地保存状态。

要使用 Actor，您的状态存储必须支持多项目事务。 这意味着您的状态存储组件必须实现`TransactionalStore`接口。

[查看支持事务/actors的组件列表]({{< ref supported-state-stores.md >}})。 只有一个单一的状态存储组件可以被用作所有角色的状态存储。

## 下一步

{{< button text="Actor可重入性>>" page="actor-reentrancy.md" >}}

## 相关链接

- 请参考[Dapr SDK文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview\.md >}})
