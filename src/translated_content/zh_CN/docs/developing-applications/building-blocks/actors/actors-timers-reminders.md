---
type: docs
title: Actor timers 和 reminders
linkTitle: 计时器和提醒器
weight: 40
description: 为 Actors 设置计时器和提醒事项并执行错误处理
aliases:
  - /zh-hans/developing-applications/building-blocks/actors/actors-background
---

参与者可以通过注册 timer 或 reminder 来安排自己的定期工作。

Timer 和 reminder 的功能非常相似。 主要的区别在于，Dapr actor 运行时在停用后不保留任何有关 timer 的信息，而使用 Dapr actor 状态提供程序持久化有关 reminder 的信息。

这种区别允许用户在轻量级但无状态的 timer 和需要更多资源但有状态的 reminder 之间进行权衡。

Timer 和 reminder 的调度配置是相同的，总结如下:

***

`dueTime`是一个可选的参数，它设置了首次调用回调之前的时间或时间间隔。 如果忽略了 `dueTime` ，则在 timer/reminder 注册后立即调用回调。

支持的格式：

- RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
- time.Duration 格式，例如 `2h30m`
- [ISO 8601持续时间](https://zh.wikipedia.org/wiki/ISO_8601#持续时间)格式，例如`PT2H30M`

***

`period` 是一个可选参数，用于设置两个连续回调调用之间的时间间隔。 当以`ISO 8601-1 duration`格式指定时，您还可以配置重复次数，以限制回调调用的总次数。
如果`period`被省略，回调函数将只被调用一次。

支持的格式：

- time.Duration 格式，例如 `2h30m`
- [ISO 8601持续时间](https://zh.wikipedia.org/wiki/ISO_8601#持续时间)格式，例如`PT2H30M`，`R5/PT1M30S`

***

`ttl`是一个可选的参数，它设定时间或时间间隔，其后timer/reminder将过期并删除。 如果省略`ttl`，则不应用任何限制。

支持的格式：

- RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
- time.Duration 格式，例如 `2h30m`
- [ISO 8601持续时间](https://zh.wikipedia.org/wiki/ISO_8601#持续时间)格式。 示例：`PT2H30M`

***

Actor 运行时验证调度配置的正确性并返回无效输入的错误。

当您在`period`中指定重复次数以及在`ttl`中指定时间时，当满足任何条件时，timer/reminder将停止。

## Actor 计时器

你可以通过 timer 在 actor 中注册一个回调。

Dapr actor 运行时确保回调方法遵守基于回合的并发保证。 这意味着，在此回调完成执行之前，没有其他执行者的方法或 timer/reminder 回调将在进行中。

Dapr actor 运行时在回调完成时保存对 actor 的状态所作的更改。 如果在保存状态时发生错误，那么将取消激活该 actor 对象，并且将激活新实例。

当 actor 作为垃圾回收(Gc) 的一部分被停用时，所有 timer 都会停止。 在此之后，将不会再调用 timer 的回调。 另外，Dapr actor 运行时不会保留关于在停用之前正在运行的 timer 的任何信息。 Actor 在将来重新激活时要注册所需的 timer，而这完全取决于 actor。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 timer。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

### 示例

Timer 的 duetime 可以在请求主体中指定。

下面的请求体配置了一个timer，`dueTime`为9秒，`period`为3秒。 这意味着它将在9秒后首次触发，然后每3秒触发一次。

```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置一个 timer，其`period`为3秒（以ISO 8601持续时间格式）。 它还将调用次数限制为10次。 这意味着它将在注册之后立即触发，然后每3秒触发一次。

```json
{
  "period":"R10/PT3S",
}
```

下面的请求体配置一个 timer，其`period`为3秒（以ISO 8601持续时间格式），并且`ttl`为20秒。 这意味着它在注册后立即触发，然后每3秒触发一次，持续20秒。

```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

下面的请求体配置一个 timer，其`dueTime`为10秒，`period`为3秒，`ttl`为10秒。 它还把调用次数限制在4次。 这意味着它会在10秒后第一次启动，然后每3秒启动一次，持续10秒，但总次数不超过4次。

```json
{
  "dueTime":"10s",
  "period":"R4/PT3S",
  "ttl":"10s"
}
```

您可以通过调用来除去 Actor timer

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

请参阅 [Api 描述]({{< ref "actors_api.md#invoke-timer" >}}) 以获取更多详细信息。

## Actor reminder

提醒是一种在指定时间内触发_持久_回调的机制。 它们的功能类似于 timer。 但与 timer 不同，在所有情况下 reminder 都会触发，直到 actor 显式取消注册 reminder 或删除 actor 或者执行次数已经到达给定值。 具体而言， reminder 会在所有 actor 失活和故障时也会触发，因为Dapr Actor 运行时会将 reminder 信息持久化到 Dapr Actor 状态提供者中。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 reminder。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请求 reminder 的结构与 actor 相同。 请参考[actor 计时器示例]({{< ref "#actor-timers" >}})。

### 检索 actor reminder

您可以通过调用来检索 actor reminder

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

### 删除 actor reminder

您可以通过调用来除去 Actor timer

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请参阅 [Api 描述]({{< ref "actors_api.md#invoke-reminder" >}}) 以获取更多详细信息。

## 错误处理

当一个角色的方法成功完成后，运行时将继续在指定的定时器或提醒计划中调用该方法。 但是，如果该方法抛出异常，运行时会捕获异常并将错误信息记录在 Dapr 副卡日志中，而不会重试。

为了让行为体从故障中恢复并在崩溃或重启后重试，可以通过配置状态存储（如 Redis 或 Azure Cosmos DB）来持久化行为体的状态。

如果方法调用失败，计时器不会被移除。 只有在下列情况下，计时器才会被移除

- Sidecar 崩溃
- 执行完毕
- 明确删除

## 提醒数据序列化格式

Actor提醒数据默认以JSON序列化。 Dapr v1.13及以上版本支持使用protobuf序列化格式来处理提醒数据，这可以根据吞吐量和负载大小带来显著的性能提升，使开发人员能够获得更高的吞吐量和更低的延迟。 另一个好处是将较小的数据存储在 actor 底层数据库中，这可以在使用某些云数据库时实现成本优化。 使用protobuf序列化的限制是无法再查询提醒数据。



在 Dapr 1.12.x 及之前的版本中，以 protobuf 格式保存的提醒数据无法读取。 建议在 Dapr v1.13 中测试此功能，并在将其投入生产之前，验证它与您的数据库是否按预期工作。

{{% alert title="注意" color="primary" %}}
如果您在Dapr v1.13中使用protobuf序列化，并且需要降级到较早的Dapr版本，则提醒数据将与1.12.x版本和更早版本不兼容。 **一旦你将提醒数据保存为protobuf格式，就无法将其转回JSON格式**。
{{% /alert %}}

### 在Kubernetes上启用protobuf序列化

要在Kubernetes上使用protobuf序列化来处理actor提醒，请使用以下Helm值：

```
--set dapr_placement.maxActorApiLevel=20
```

### 在自托管上启用protobuf序列化

要在自托管上使用protobuf序列化来处理actor提醒，请使用以下`daprd`标志：

```
--max-api-level=20
```

## 下一步

{{< button text="配置actor运行时行为 >>" page="actors-runtime-config.md" >}}

## 相关链接

- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview\.md >}})
