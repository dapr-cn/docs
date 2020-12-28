---
type: docs
title: "Dapr Actors 概述"
linkTitle: "Overview"
weight: 10
description: Dapr 中对 Actors 支持的概述
---

Dapr Actors 运行时通过以下功能为 [virtual actors]({{< ref actors-background.md >}}) 提供支持:

## 调用 Actor 方法

您可以通过 HTTP/gRPC 来与 Dapr 交互以调用 actor 方法

```bash
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

参阅[api spec]({{< ref "actors_api.md#invoke-actor-method" >}}) 获取更多信息。

## Actor 状态管理

Actor 可以使用状态管理功能可靠地保存状态。

您可以通过 HTTP/GRPC 端点与 Dapr 进行状态管理。

要使用Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [组件](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  以下状态存储实现了此接口:

- Redis
- MongoDB
- PostgreSQL
- SQL Server
- Azure CosmSDB

## Actor timers 和 reminders

Actors 可以通过 timer 或者 remider 自行注册周期性的任务.

### Actor timers

你可以通过 timer 在actor中注册一个回调。

Dapr Actor 运行时确保回调方法被顺序调用，而非并发调用。这意味着，在此回调完成执行之前，不会有其他Actor方法或timer/remider回调被执行。

Timer的下一个周期在回调完成执行后开始计算。 这意味着timer在执行回调时停止，并在回调结束时开始。

Dapr Actor 运行时在回调完成时保存对actor的状态所作的更改。 如果在保存状态时发生错误，那么将取消激活该actor对象，并且将激活新实例。

当 actor 作为垃圾收集的一部分被停用时，所有 timer 都会停止。 在此之后，将不会再调用 timer 的回调。 此外， Dapr Actors 运行时不会保留有关在失活之前运行的 timer 的任何信息。 也就是说，重新启动 actor 后将会激活的 timer 完全取决于注册时登记的 timer。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 timer。

```http
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Timer 的 `duetime` 和回调函数可以在请求主体中指定。  到期时间（due time）表示注册后 timer 将首次触发的事件。  `period` 表示 timer 在此之后触发的频率。  到期时间为0表示立即执行。  负 due times 和负 periods 都是无效。

以下请求主体将配置一个 timer，该 timer 的 `dueTime` 为 9 秒， `period `为 3 秒。  这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

以下请求主体将配置一个 timer，该 timer 的 `dueTime` 为 0 秒， `period`为 3 秒。  这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

您可以通过调用来除去 Actor timers

```http
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

参阅[api spec]({{< ref "actors_api.md#invoke-timer" >}}) 获取更多信息。

### Actor reminders

Reminders 是一种机制，用于在指定时间触发 *持久化*的回调。 它们的功能类似于 timer。 但与 timer 不同，在所有情况下 reminders 都会触发，直到 actor 显式取消注册 reminders 或删除 actor 。 具体而言， reminders 会在所有 actor 失活和故障时也会触发触发，因为Dapr Actors 运行时会将 reminders 信息持久化到 Dapr Actors 状态提供者中。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 reminders。

```http
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Reminders 的 `duetime` 和回调函数可以在请求主体中指定。  到期时间（due time）表示注册后 reminders将首次触发的时间。  `period` 表示 reminders 在此之后触发的频率。  到期时间为0表示立即执行。  负 due times 和负 periods 都是无效。  若要注册仅触发一次的 reminders ，请将 period 设置为空字符串。

以下请求主体将配置一个 reminders，该 reminders 的 `dueTime` 为 9 秒， `period`为 3 秒。  这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

以下请求主体将配置一个 reminders，该 reminders 的 `dueTime` 为 0 秒， `period`为 3 秒。  这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

以下请求主体将配置一个 reminders，该 reminders 的 `dueTime` 为 15 秒， `period`为空。  这意味着它将在15秒后首次触发，之后就不再被触发。
```json
{
  "dueTime":"0h0m15s0ms",
  "period":""
}
```

#### 检索 actor reminders

您可以通过调用来检索 actor reminders

```http
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### 删除 actor reminders

您可以通过调用来除去 Actor timers

```http
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请参阅 [Api 描述]({{< ref "actors_api.md#invoke-reminder" >}}) 以获取更多详细信息。
