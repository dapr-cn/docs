---
type: docs
title: "如何启用actor提醒分区"
linkTitle: "如何分区提醒"
weight: 60
description: "为您的应用程序启用actor提醒分区"
aliases:
  - "/zh-hans/developing-applications/building-blocks/actors/actors-background"
---

[actor提醒]({{< ref "actors-timers-reminders.md#actor-reminders" >}})在sidecar重启后仍然持久化并继续触发。注册了多个提醒的应用程序可能会遇到以下问题：

- 提醒注册和注销的吞吐量低
- 基于state存储单个记录大小限制的提醒注册数量有限

为了解决这些问题，应用程序可以通过在state存储中将数据分布在多个键中来启用actor提醒分区。

1. 在`actors\|\|<actor type>\|\|metadata`中使用一个元数据记录来存储给定actor类型的持久化配置。
1. 多个记录存储同一actor类型的提醒子集。

| 键         | 值       |
| ----------- | ----------- |
| `actors\|\|<actor type>\|\|metadata` | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]` |

如果您需要更改分区数量，Dapr的sidecar将自动重新分配提醒集。

## 配置actor运行时以分区actor提醒

与其他actor配置元素类似，actor运行时通过actor的`GET /dapr/config`端点提供适当的配置来分区actor提醒。选择您偏好的语言以获取actor运行时配置示例。

{{< tabs ".NET" JavaScript Python Java Go >}}

{{% codetab %}}

<!--dotnet-->

```csharp
// 在Startup.cs中
public void ConfigureServices(IServiceCollection services)
{
    // 使用DI注册actor运行时
    services.AddActors(options =>
    {
        // 注册actor类型并配置actor设置
        options.Actors.RegisterActor<MyActor>();

        // 配置默认设置
        options.ActorIdleTimeout = TimeSpan.FromMinutes(60);
        options.ActorScanInterval = TimeSpan.FromSeconds(30);
        options.RemindersStoragePartitions = 7;
    });

    // 注册用于actor的其他服务
    services.AddSingleton<BankService>();
}
```

[查看.NET SDK中注册actor的文档]({{< ref "dotnet-actors-usage.md#registring-actors" >}})。

{{% /codetab %}}

{{% codetab %}}
<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// 使用DaprClientOptions配置actor运行时。
const clientOptions = {
  actor: {
    remindersStoragePartitions: 0,
  },
};

const actor = builder.build(new ActorId("my-actor"));

// 注册一个提醒，它有一个默认回调：`receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // 提醒的唯一名称。
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // 发送到提醒回调的状态。
);

// 删除提醒
await actor.unregisterActorReminder("reminder-id");
```

[查看使用JavaScript SDK编写actor的文档]({{< ref "js-actors.md#registering-actors" >}})。

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

[查看使用Python SDK运行actor的文档]({{< ref "python-actor.md" >}})

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

[查看使用Java SDK编写actor的文档]({{< ref "java.md#actors" >}})。

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

[查看使用Go SDK的actor示例](https://github.com/dapr/go-sdk/tree/main/examples/actor)。

{{% /codetab %}}

{{< /tabs >}}

以下是一个有效的提醒分区配置示例：

```json
{
	"entities": [ "MyActorType", "AnotherActorType" ],
	"remindersStoragePartitions": 7
}
```

## 处理配置更改

为了配置actor提醒分区，Dapr将actor类型元数据持久化在actor的state存储中。这允许配置更改在全局范围内应用，而不仅仅是在单个sidecar实例中。

此外，**您只能增加分区数量**，不能减少。这允许Dapr在滚动重启时自动重新分配数据，其中一个或多个分区配置可能处于活动状态。

## 演示

观看[此视频以获取actor提醒分区的演示](https://youtu.be/ZwFOEUYe1WA?t=1493)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZwFOEUYe1WA?start=1495" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 下一步

{{< button text="与虚拟actor交互 >>" page="howto-actors.md" >}}

## 相关链接

- [actor API参考]({{< ref actors_api.md >}})
- [actor概述]({{< ref actors-overview.md >}})
