---
type: docs
title: "如何：启用 actor 提醒分区"
linkTitle: "操作方法：Actor Reminders 分区"
weight: 50
description: "为您的应用程序启用 actor 提醒分区"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

[ Actor reminder]({{< ref "actors-timers-reminders.md#actor-reminders" >}}) 在 sidecar 重启后继续被保留并继续触发。 注册许多 reminder 的应用程序可能会遇到以下问题：

- Reminder 注册和注销的吞吐量低
- 对注册的 reminder 总数的限制是基于状态存储上的单个记录大小的限制。

为了规避这些问题，应用程序可以在状态存储中分布数据的同时启用actor reminder 的分区。

1. 在 `actors\|\|<actor type>\|\|metadata` 中有一个元数据记录，用于存储给定 actor 类型的持久化配置。
1. 同一 actor 类型的 reminder 子集被存储在多个记录中。

| Key                                                                                           | Value                                                                                                                                     |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `actors\|\|<actor type>\|\|metadata`                                                | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]`                                                              |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]`                                                              |

如果需要更改分区的数量，Dapr 的 sidecar 将自动重新分发 reminder 的设置。

## 配置 actor 运行时以对 actor reminder 进行分区

与其他 actor 配置元素类似，actor 运行时通过 actor 的 endpoint 为 `GET /dapr/config`提供适当的配置以分区 actor remider。 选择您偏好的语言来进行 actor 运行时配置示例。

{{< tabs ".NET" JavaScript Python Java Go >}}

{{% codetab %}}

<!--dotnet-->

```csharp
// In Startup.cs
public void ConfigureServices(IServiceCollection services)
{
    // Register actor runtime with DI
    services.AddActors(options =>
    {
        // Register actor types and configure actor settings
        options.Actors.RegisterActor<MyActor>();

        // Configure default settings
        options.ActorIdleTimeout = TimeSpan.FromMinutes(60);
        options.ActorScanInterval = TimeSpan.FromSeconds(30);
        options.RemindersStoragePartitions = 7;
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```

[See the .NET SDK documentation on registering actors]({{< ref "dotnet-actors-usage.md#registring-actors" >}}).

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    remindersStoragePartitions: 0,
  },
};

const actor = builder.build(new ActorId("my-actor"));

// Register a reminder, it has a default callback: `receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // Unique name of the reminder.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // State to be sent to reminder callback.
);

// Delete the reminder
await actor.unregisterActorReminder("reminder-id");
```

[See the documentation on writing actors with the JavaScript SDK]({{< ref "js-actors.md#registering-actors" >}}).

{{% /codetab %}}

{{% codetab %}}

<!--python-->

```python
from datetime import timedelta

ActorRuntime.set_actor_config(
    ActorRuntimeConfig(
        actor_idle_timeout=timedelta(hours=1),
        actor_scan_interval=timedelta(seconds=30),
        remindersStoragePartitions=7
    )
)
```

[请参阅有关使用 Python SDK 运行 Actors 的文档]({{< ref "python-actor.md" >}})

{{% /codetab %}}

{{% codetab %}}
<!--java-->

```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

[请参阅有关使用 Java SDK 编写 Actors 的文档]({{< ref "java.md#actors" >}})。

{{% /codetab %}}

{{% codetab %}}
<!--go-->

```go
type daprConfig struct {
    Entities                   []string `json:"entities,omitempty"`
    ActorIdleTimeout           string   `json:"actorIdleTimeout,omitempty"`
    ActorScanInterval          string   `json:"actorScanInterval,omitempty"`
    DrainOngoingCallTimeout    string   `json:"drainOngoingCallTimeout,omitempty"`
    DrainRebalancedActors      bool     `json:"drainRebalancedActors,omitempty"`
    RemindersStoragePartitions int      `json:"remindersStoragePartitions,omitempty"`
}

var daprConfigResponse = daprConfig{
    []string{defaultActorType},
    actorIdleTimeout,
    actorScanInterval,
    drainOngoingCallTimeout,
    drainRebalancedActors,
    7,
}

func configHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(daprConfigResponse)
}
```

[请参阅使用 Go SDK 的 Actors示例](https://github.com/dapr/go-sdk/tree/main/examples/actor)。

{{% /codetab %}}

{{< /tabs >}}

以下是 reminder 分区的有效配置示例：

```json
{
    "entities": [ "MyActorType", "AnotherActorType" ],
    "remindersStoragePartitions": 7
}
```

## 处理配置更改

为了配置 actor 提醒分区，Dapr 将 actor 类型元数据保存在 actor 的状态存储中。 这允许全局应用配置更改，而不仅仅是在单个 sidecar 实例中。

此外， **只能增加分区的数量**，不能减少。 这允许 Dapr 在滚动重启时自动重新分发数据，其中一个或多个分区配置可能处于活动状态。

## 例子

看 [此视频用于 Actor reminder 分区的演示](https://youtu.be/ZwFOEUYe1WA?t=1493):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZwFOEUYe1WA?start=1495" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

{{< button text="Interact with virtual actors >>" page="howto-actors.md" >}}

## 相关链接

- [Actors API 参考]({{< ref actors_api.md >}})
- [Actor 概述]({{< ref actors-overview.md >}})