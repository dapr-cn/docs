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

All timers are stopped when the actor is deactivated as part of garbage collection. No timer callbacks are invoked after that. Also, the Dapr actors runtime does not retain any information about the timers that were running before deactivation. It is up to the actor to register any timers that it needs when it is reactivated in the future.

You can create a timer for an actor by calling the HTTP/gRPC request to Dapr.

```http
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

The timer `duetime` and callback are specified in the request body.  The due time represents when the timer will first fire after registration.  The `period` represents how often the timer fires after that.  A due time of 0 means to fire immediately.  Negative due times and negative periods are invalid.

The following request body configures a timer with a `dueTime` of 9 seconds and a `period` of 3 seconds.  This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a timer with a `dueTime` 0 seconds and a `period` of 3 seconds.  This means it fires immediately after registration, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

You can remove the actor timer by calling

```http
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Refer [api spec]({{< ref "actors_api.md#invoke-timer" >}}) for more details.

### Actor reminders

Reminders are a mechanism to trigger *persistent* callbacks on an actor at specified times. Their functionality is similar to timers. But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the actor is explicitly deleted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr actors runtime persists the information about the actors' reminders using Dapr actor state provider.

You can create a persistent reminder for an actor by calling the Http/gRPC request to Dapr.

```http
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

The reminder `duetime` and callback can be specified in the request body.  The due time represents when the reminder first fires after registration.  The `period` represents how often the reminder will fire after that.  A due time of 0 means to fire immediately.  Negative due times and negative periods are invalid.  To register a reminder that fires only once, set the period to an empty string.

The following request body configures a reminder with a `dueTime` 9 seconds and a `period` of 3 seconds.  This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a reminder with a `dueTime` 0 seconds and a `period` of 3 seconds.  This means it will fire immediately after registration, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a reminder with a `dueTime` 15 seconds and a `period` of empty string.  This means it will first fire after 15 seconds, then never fire again.
```json
{
  "dueTime":"0h0m15s0ms",
  "period":""
}
```

#### Retrieve actor reminder

You can retrieve the actor reminder by calling

```http
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### Remove the actor reminder

You can remove the actor reminder by calling

```http
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请参阅 [Api 描述]({{< ref "actors_api.md#invoke-reminder" >}}) 以获取更多详细信息。
