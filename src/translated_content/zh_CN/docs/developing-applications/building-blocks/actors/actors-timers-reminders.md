---
type: docs
title: "actor 定时器和提醒"
linkTitle: "定时器和提醒"
weight: 50
description: "为您的 actor 设置定时器和提醒并执行错误处理"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

actor 可以通过注册定时器或提醒来安排周期性工作。

定时器和提醒的功能非常相似。主要区别在于 Dapr actor 运行时在停用后不会保留任何关于定时器的信息，而是使用 Dapr actor 状态提供程序持久化提醒的信息。

这种区别允许用户在轻量但无状态的定时器与更资源密集但有状态的提醒之间进行选择。

定时器和提醒的调度配置是相同的，概述如下：

---
`dueTime` 是一个可选参数，用于设置第一次调用回调的时间或时间间隔。如果省略 `dueTime`，则在定时器/提醒注册后立即调用回调。

支持的格式：
- RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
- time.Duration 格式，例如 `2h30m`
- [ISO 8601 持续时间](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式，例如 `PT2H30M`

---
`period` 是一个可选参数，用于设置两次连续回调调用之间的时间间隔。当以 `ISO 8601-1 持续时间` 格式指定时，您还可以配置重复次数以限制回调调用的总次数。
如果省略 `period`，则回调只会被调用一次。

支持的格式：
- time.Duration 格式，例如 `2h30m`
- [ISO 8601 持续时间](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式，例如 `PT2H30M`, `R5/PT1M30S`

---
`ttl` 是一个可选参数，用于设置定时器/提醒将过期和删除的时间或时间间隔。如果省略 `ttl`，则不应用任何限制。

支持的格式：
* RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
* time.Duration 格式，例如 `2h30m`
* [ISO 8601 持续时间](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式。示例：`PT2H30M`

---
actor 运行时验证调度配置的正确性，并在输入无效时返回错误。

当您同时指定 `period` 中的重复次数和 `ttl` 时，定时器/提醒将在任一条件满足时停止。

## actor 定时器

您可以在 actor 上注册一个基于定时器执行的回调。

Dapr actor 运行时确保回调方法遵循基于轮次的并发保证。这意味着在此回调完成执行之前，不会有其他 actor 方法或定时器/提醒回调正在进行。

Dapr actor 运行时在回调完成时保存对 actor 状态所做的更改。如果在保存状态时发生错误，该 actor 对象将被停用，并激活一个新实例。

当 actor 作为垃圾回收的一部分被停用时，所有定时器都会停止。之后不会调用任何定时器回调。此外，Dapr actor 运行时不会保留关于停用前正在运行的定时器的任何信息。actor 需要在将来重新激活时注册所需的任何定时器。

您可以通过调用如下所示的 HTTP/gRPC 请求或通过 Dapr SDK 为 actor 创建定时器。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

### 示例

定时器参数在请求体中指定。

以下请求体配置了一个 `dueTime` 为 9 秒和 `period` 为 3 秒的定时器。这意味着它将在 9 秒后首次触发，然后每隔 3 秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

以下请求体配置了一个 `period` 为 3 秒（ISO 8601 持续时间格式）的定时器。它还将调用次数限制为 10 次。这意味着它将触发 10 次：首先在注册后立即触发，然后每隔 3 秒触发一次。
```json
{
  "period":"R10/PT3S",
}
```

以下请求体配置了一个 `period` 为 3 秒（ISO 8601 持续时间格式）和 `ttl` 为 20 秒的定时器。这意味着它在注册后立即触发，然后每隔 3 秒触发一次，持续 20 秒。
```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

以下请求体配置了一个 `dueTime` 为 10 秒、`period` 为 3 秒和 `ttl` 为 10 秒的定时器。它还将调用次数限制为 4 次。这意味着它将在 10 秒后首次触发，然后每隔 3 秒触发一次，持续 10 秒，但总共不超过 4 次。
```json
{
  "dueTime":"10s",
  "period":"R4/PT3S",
  "ttl":"10s"
}
```

您可以通过调用以下命令删除 actor 定时器

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

有关更多详细信息，请参阅 [api 规范]({{< ref "actors_api.md#invoke-timer" >}})。

## actor 提醒

{{% alert title="注意" color="primary" %}}
在 Dapr v1.15 中，actor 提醒默认存储在 [Scheduler 服务]({{< ref "scheduler.md#actor-reminders" >}})中。
{{% /alert %}}

提醒是一种在指定时间触发 actor 上*持久*回调的机制。它们的功能类似于定时器。但与定时器不同，提醒在所有情况下都会被触发，直到 actor 明确取消注册它们或 actor 被明确删除或调用次数耗尽。具体来说，提醒在 actor 停用和故障转移期间被触发，因为 Dapr actor 运行时使用 Dapr actor 状态提供程序持久化关于 actor 提醒的信息。

您可以通过调用如下所示的 HTTP/gRPC 请求或通过 Dapr SDK 为 actor 创建持久提醒。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

提醒的请求结构与 actor 的相同。请参阅 [actor 定时器示例]({{< ref "#actor-timers" >}})。

### 检索 actor 提醒

您可以通过调用以下命令检索 actor 提醒

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

### 删除 actor 提醒

您可以通过调用以下命令删除 actor 提醒

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

如果 actor 提醒被触发且应用程序未向运行时返回 2** 代码（例如，由于连接问题），actor 提醒将重试最多三次，每次尝试之间的退避间隔为一秒。可能会根据任何可选应用的 [actor 弹性策略]({{< ref "policies.md#overriding-default-retries" >}})进行额外的重试。

有关更多详细信息，请参阅 [api 规范]({{< ref "actors_api.md#invoke-reminder" >}})。

## 错误处理

当 actor 的方法成功完成时，运行时将继续按照指定的定时器或提醒计划调用该方法。然而，如果方法抛出异常，运行时会捕获它并在 Dapr sidecar 日志中记录错误消息，而不进行重试。

为了允许 actor 从故障中恢复并在崩溃或重启后重试，您可以通过配置状态存储（如 Redis 或 Azure Cosmos DB）来持久化 actor 的状态。

如果方法的调用失败，定时器不会被移除。定时器仅在以下情况下被移除：
- sidecar 崩溃
- 执行次数用尽
- 您明确删除它

## 提醒数据序列化格式

actor 提醒数据默认序列化为 JSON。从 Dapr v1.13 开始，支持通过 Placement 和 Scheduler 服务为工作流的内部提醒数据使用 protobuf 序列化格式。根据吞吐量和负载大小，这可以显著提高性能，为开发人员提供更高的吞吐量和更低的延迟。

另一个好处是将较小的数据存储在 actor 底层数据库中，这在使用某些云数据库时可以实现成本优化。使用 protobuf 序列化的限制是提醒数据不再可查询。

{{% alert title="注意" color="primary" %}}
protobuf 序列化将在 Dapr 1.14 中成为默认格式
{{% /alert %}}

以 protobuf 格式保存的提醒数据无法在 Dapr 1.12.x 及更早版本中读取。建议在 Dapr v1.13 中测试此功能，并验证它在您的数据库中按预期工作，然后再投入生产。

{{% alert title="注意" color="primary" %}}
如果您在 Dapr v1.13 中使用 protobuf 序列化并需要降级到更早的 Dapr 版本，提醒数据将与 1.12.x 及更早版本不兼容。**一旦您以 protobuf 格式保存提醒数据，就无法将其移回 JSON 格式**。
{{% /alert %}}

### 在 Kubernetes 上启用 protobuf 序列化

要在 Kubernetes 上为 actor 提醒使用 protobuf 序列化，请使用以下 Helm 值：

```
--set dapr_placement.maxActorApiLevel=20
```

### 在自托管环境中启用 protobuf 序列化

要在自托管环境中为 actor 提醒使用 protobuf 序列化，请使用以下 `daprd` 标志：

```
--max-api-level=20
```

## 下一步

{{< button text="配置 actor 运行时行为 >>" page="actors-runtime-config.md" >}}

## 相关链接

- [actor API 参考]({{< ref actors_api.md >}})
- [actor 概述]({{< ref actors-overview.md >}})
