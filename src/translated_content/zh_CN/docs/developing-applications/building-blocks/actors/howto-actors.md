---
type: docs
title: "操作指南：使用脚本与虚拟actor交互"
linkTitle: "操作指南：与虚拟actor交互"
weight: 70
description: 通过调用actor方法来管理状态
---

了解如何通过HTTP/gRPC端点来使用虚拟actor。

## 调用actor方法

您可以通过调用HTTP/gRPC端点与Dapr交互，以调用actor方法。

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

在请求体中提供actor方法所需的数据。请求的响应，即actor方法调用返回的数据，将在响应体中。

有关更多详细信息，请参阅[Actors API规范]({{< ref "actors_api.md#invoke-actor-method" >}})。

{{% alert title="注意" color="primary" %}}
您也可以使用[Dapr SDKs来操作actors]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
{{% /alert %}}

## 使用actors保存状态

您可以通过HTTP/gRPC端点与Dapr交互，利用Dapr的actor状态管理功能来可靠地保存状态。

要使用actors，您的状态存储必须支持多项事务。这意味着您的状态存储组件需要实现`TransactionalStore`接口。

[查看支持事务/actors的组件列表]({{< ref supported-state-stores.md >}})。所有actors只能使用一个状态存储组件来保存状态。

## 下一步

{{< button text="actor重入 >>" page="actor-reentrancy.md" >}}

## 相关链接

- 请参阅[Dapr SDK文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview.md >}})
