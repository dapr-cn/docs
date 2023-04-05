---
type: docs
title: "操作方法: 在 Dapr 中使用 virtual actor"
linkTitle: "操作方法: Virtual actor"
weight: 20
description: 了解有关 Actor 模式的更多信息
---

The Dapr actor runtime provides support for [virtual actors]({{< ref actors-overview.md >}}) through following capabilities:

## Actor method invocation

你可以通过调用 HTTP/gRPC 端点与 Dapr 互动来调用 actor 方法。

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-actor-method" >}})

或者，您可以在 [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}), 或 [Python]({{< ref "python-actor" >}}) 中使用 Dapr SDK 。

## Actor 状态管理

Actors can save state reliably using state management capability. You can interact with Dapr through HTTP/gRPC endpoints for state management.

要使用 Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [component](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  支持事务/actors 的组件列表如下：[受支持状态存储]({{< ref supported-state-stores.md >}}) 只有一个状态存储组件可以用作所有 Actors 的状态存储 。

## Actor timer 和 reminder

参与者可以通过注册 timer 或 reminder 来安排自己的定期工作。

Timer 和 reminder 的功能非常相似。 主要的区别在于，Dapr actor 运行时在停用后不保留任何有关 timer 的信息，而使用 Dapr actor 状态提供程序持久化有关 reminder 的信息。

这种区别允许用户在轻量级但无状态的 timer 和需要更多资源但有状态的 reminder 之间进行权衡。

Timer 和 reminder 的调度配置是相同的，总结如下:

---
`dueTime` 是一个可选的参数，它设置了首次调用回调之前的时间或时间间隔。 如果忽略了 `dueTime` ，则在 timer/reminder 注册后立即调用回调。

支持的格式:
- RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`

---
`period` 是一个可选参数，用于设置两个连续回调调用之间的时间间隔。 当以 `ISO 8601-1 duration` 格式指定时，您还可以配置重复次数，以限制回调调用的总次数。 如果 `period` 被省略，回调函数将只被调用一次。

支持的格式:
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式, 例如 `PT2H30M`, `R5/PT1M30S`

---
`ttl` 是一个可选的参数，它设定时间或时间间隔，其后 timer/reminder 将过期并删除。 如果省略 `ttl`，则不应用任何限制。

支持的格式:
* RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
* time.Duration 格式，例如` 2h30m`
* [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式。 示例：`PT2H30M`

---
The actor runtime validates correctness of the scheduling configuration and returns error on invalid input.

当您在 `period` 以及 `ttl` 中同时指定重复次数， 当满足任何条件时，timer/reminder 都将停止。

### Actor 计时器

你可以通过 timer 在 actor 中注册一个回调。

Dapr actor 运行时确保回调方法遵守基于回合的并发保证。 这意味着，在此回调完成执行之前，没有其他执行者的方法或 timer/reminder 回调将在进行中。

Dapr actor 运行时在回调完成时保存对 actor 的状态所作的更改。 如果在保存状态时发生错误，那么将取消激活该 actor 对象，并且将激活新实例。

当 actor 作为垃圾回收(GC)的一部分被停用时，所有 timer 都会停止。 No timer callbacks are invoked after that. 另外，Dapr actor 运行时不会保留关于在停用之前正在运行的 timer 的任何信息。 Actor 在将来重新激活时要注册所需的 timer，而这完全取决于 actor。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 timer。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

**示例**

Timer 的 duetime 可以在请求主体中指定。

下面的请求体配置了一个 timer，`dueTime` 9秒，`period` 3秒。 This means it will first fire after 9 seconds, then every 3 seconds after that.
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置一个 timer，其`period`为3秒(采用ISO 8601 duration格式)。 它还将调用次数限制为10次。 这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "period":"R10/PT3S",
}
```

下面的请求体配置一个 timer，其`period`为3秒(ISO 8601 duration 格式)，`ttl`为20秒。 这意味着它在注册后立即触发，然后每3秒触发一次，持续20秒。
```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

下面的请求体配置一个 timer:`dueTime`为10秒，`period`为3秒，`ttl`为10秒。 它还把调用次数限制在4次。 这意味着它会在10秒后第一次启动，然后每3秒启动一次，持续10秒，但总次数不超过4次。
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

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-timer" >}})

### Actor reminder

Reminder 是一种在指定时间内触发 *persistent* 回调的机制。 Their functionality is similar to timers. 但与 timer 不同，在所有情况下 reminder 都会触发，直到 actor 显式取消注册 reminder 或删除 actor 或者执行次数已经到达给定值。 具体而言， reminder 会在所有 actor 失活和故障时也会触发，因为Dapr Actor 运行时会将 reminder 信息持久化到 Dapr Actor 状态提供者中。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 reminder。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请求 reminder 的结构与 actor 相同。 请参阅 [actor timer 示例]({{< ref "#actor-timers" >}})。

#### Retrieve actor reminder

您可以通过调用来检索 actor reminder

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### 删除 actor reminder

您可以通过调用来除去 Actor timer

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-reminder" >}})

## Actor runtime configuration

您可以配置 Dapr actor 运行时配置来修改默认的运行时行为。

### 配置参数
- `entities` - 此主机支持的Actor 类型。
- `actorIdleTimeout` - The timeout before deactivating an idle actor. Checks for timeouts occur every `actorScanInterval` interval. **Default: 60 minutes**
- `actorScanInterval` - The duration which specifies how often to scan for actors to deactivate idle actors. Actors that have been idle longer than actor_idle_timeout will be deactivated. **Default: 30 seconds**
- `drainOngoingCallTimeout` - The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. 如果没有当前 actor 方法被调用，那么将忽略此时间。 **Default: 60 seconds**
- `drainRebalancedActors` - If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. **Default: true**
- `reentrancy` (ActorReentrancyConfig) - Configure the reentrancy behavior for an actor. If not provided, reentrancy is disabled. **Default: disabled** **Default: false**
- `remindersStoragePartitions` - Configure the number of partitions for actor's reminders. If not provided, all reminders are saved as a single record in actor's state store. **Default: 0**
- `entityConfig` - 使用一组配置单独配置每个参与者类型。 在单个实体配置中指定的任何实体也必须在顶级 `实体` 字段中指定。 **Default: None**

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}
```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setDrainOngoingCallTimeout(Duration.ofSeconds(60));
ActorRuntime.getInstance().getConfig().setDrainBalancedActors(true);
ActorRuntime.getInstance().getConfig().setActorReentrancyConfig(false, null);
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

See [this example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
{{% /codetab %}}

{{% codetab %}}
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
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(60);
        options.DrainRebalancedActors = true;
        options.RemindersStoragePartitions = 7;
        options.ReentrancyConfig = new() { Enabled = false };

        // Add a configuration for a specific actor type.
        // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
        // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
        // In this example, `ReentrantActor` has reentrancy enabled; however, 'MyActor' will not have reentrancy enabled.
        options.Actors.RegisterActor<ReentrantActor>(typeOptions: new()
        {
            ReentrancyConfig = new()
            {
                Enabled = true,
            }
        });
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```
See the .NET SDK [documentation](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors).
{{% /codetab %}}

{{% codetab %}}
```python
from datetime import timedelta
from dapr.actor.runtime.config import ActorRuntimeConfig, ActorReentrancyConfig

ActorRuntime.set_actor_config(
    ActorRuntimeConfig(
        actor_idle_timeout=timedelta(hours=1),
        actor_scan_interval=timedelta(seconds=30),
        drain_ongoing_call_timeout=timedelta(minutes=1),
        drain_rebalanced_actors=True,
        reentrancy=ActorReentrancyConfig(enabled=False),
        remindersStoragePartitions=7
    )
)
```
{{% /codetab %}}

{{% codetab %}}
```go
const (
    defaultActorType = "basicType"
    reentrantActorType = "reentrantType"
)

type daprConfig struct {
    Entities                []string                `json:"entities,omitempty"`
    ActorIdleTimeout        string                  `json:"actorIdleTimeout,omitempty"`
    ActorScanInterval       string                  `json:"actorScanInterval,omitempty"`
    DrainOngoingCallTimeout string                  `json:"drainOngoingCallTimeout,omitempty"`
    DrainRebalancedActors   bool                    `json:"drainRebalancedActors,omitempty"`
    Reentrancy              config.ReentrancyConfig `json:"reentrancy,omitempty"`
    EntitiesConfig          []config.EntityConfig   `json:"entitiesConfig,omitempty"`
}

var daprConfigResponse = daprConfig{
    Entities:                []string{defaultActorType, reentrantActorType},
    ActorIdleTimeout:        actorIdleTimeout,
    ActorScanInterval:       actorScanInterval,
    DrainOngoingCallTimeout: drainOngoingCallTimeout,
    DrainRebalancedActors:   drainRebalancedActors,
    Reentrancy:              config.ReentrancyConfig{Enabled: false},
    EntitiesConfig: []config.EntityConfig{
        {
            // Add a configuration for a specific actor type.
            // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
            // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
            // In this example, `reentrantActorType` has reentrancy enabled; however, 'defaultActorType' will not have reentrancy enabled.
            Entities: []string{reentrantActorType},
            Reentrancy: config.ReentrancyConfig{
                Enabled:       true,
                MaxStackDepth: &maxStackDepth,
            },
        },
    },
}

func configHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(daprConfigResponse)
}
```
{{% /codetab %}}

{{< /tabs >}}

Refer to the documentation and examples of the [Dapr SDKs]({{< ref "developing-applications/sdks/#sdk-languages" >}}) for more details.

## Reminder 分区

Actor reminders are persisted and continue to be triggered after sidecar restarts. Applications with multiple reminders registered can experience the following issues:

- Low throughput on reminders registration and de-registration
- Limit on the total number of reminders registered based on the single record size limit on the state store

Applications can enable partitioning of actor reminders while data is distributed in multiple keys in the state store.

1. A metadata record in `actors\|\|<actor type>\|\|metadata` is used to store persisted configuration for a given actor type.
1. Multiple records store subsets of the reminders for the same actor type.

| Key                                                                                           | Value                                                                                                                                     |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `actors\|\|<actor type>\|\|metadata`                                                | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]`                                                              |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]`                                                              |
| ...                                                                                           | ...                                                                                                                                       |

If you need to change the number of partitions, Dapr's sidecar will automatically redistribute the reminders's set.

### 启用 actor reminder 分区

#### Actor runtime configuration for actor reminders partitioning

Similar to other actor configuration elements, the actor runtime provides the appropriate configuration to partition actor reminders via the actor's endpoint for `GET /dapr/config`.

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}

```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

For more information, see [the Java actors example](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
{{% /codetab %}}

{{% codetab %}}

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

See the .NET SDK [documentation for registering actors](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors).
{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{% codetab %}}

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

{{% /codetab %}}

{{< /tabs >}}

The following is an example of a valid configuration for reminder partitioning:

```json
{
    "entities": [ "MyActorType", "AnotherActorType" ],
    "remindersStoragePartitions": 7
}
```

#### Handling configuration changes

To configure actor reminders partitioning, Dapr persists the actor type metadata in the actor's state store. This allows the configuration changes to be applied globally, not just in a single sidecar instance.

Also, **you can only increase the number of partitions**, not decrease. This allows Dapr to automatically redistribute the data on a rolling restart where one or more partition configurations might be active.

#### Demo

Watch [this video for a demo of actor reminder partitioning](https://youtu.be/ZwFOEUYe1WA?t=1493):

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ZwFOEUYe1WA?start=1495" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
