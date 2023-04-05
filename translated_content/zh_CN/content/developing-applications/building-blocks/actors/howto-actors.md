---
type: docs
title: "How-to: 在 Dapr 中使用 virtual actors"
linkTitle: "How-To: Virtual actors"
weight: 20
description: 了解有关 Actor 模式的更多信息
---

Dapr actors 运行时提供了以下功能以支持[虚拟actors]({{< ref actors-overview.md >}}):

## 调用 Actor 方法

您可以通过 HTTP/gRPC 来与 Dapr 交互以调用 actor 方法.

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-actor-method" >}})

或者，您可以在 [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}), 或 [Python]({{< ref "python-actor" >}}) 中使用Dapr SDK 。

## Actor 状态管理

Actor 可以使用状态管理功能可靠地保存状态。 您可以通过 HTTP/GRPC 端点与 Dapr 进行状态管理。

要使用Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [component](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  支持事务/actors的组建列表如下:[受支持状态存储]({{< ref supported-state-stores.md >}}) 只有一个 状态存储 件可以用作所有 Actors 的状态存储 。

## Actor timers 和 reminders

Actors 可以通过 timer 或者 remider 自行注册周期性的任务.

Timers 和 reminders 的功能非常相似。 主要的区别在于，Dapr actor运行时在停用后不保留任何有关 timer 的信息，而使用Dapr actor状态提供程序持久化有关 reminder 的信息。

这种区别允许用户在轻量级但无状态的 timer 和需要更多资源但有状态的 reminder 之间进行权衡。

Timer和reminder的调度配置是相同的，总结如下:

---
`dueTime` 是一个可选的参数，它设置了首次调用回调之前的时间或时间间隔。 如果忽略了 `dueTime` ，则在timer/reminder注册后立即调用回调。

支持的格式:
- RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
- time.Duration 格式，例如`2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式，例如: `PT2H30M`

---
`period`是一个可选参数，用于设置两个连续回调调用之间的时间间隔。 当以`ISO 8601-1 duration`格式指定时，您还可以配置重复次数，以限制回调调用的总次数。 如果`period`被省略，回调函数将只被调用一次。

支持的格式:
- time.Duration 格式，例如`2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式, 例如 `PT2H30M`, `R5/PT1M30S`

---
`ttl` 是一个可选的参数，它设定时间或时间间隔，其后timer/reminder将到期并删除。 如果省略`ttl`，则不应用任何限制。

支持的格式:
* RFC3339 日期格式，例如 `2020-10-02T15:00:00Z`
* time.Duration 格式，例如`2h30m`
* [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) 格式。 示例： `PT2H30M`

---
Actor运行时验证调度配置的正确性并返回无效输入的错误。

当您在 `period` 以及 `ttl`中同时指定重复次数， 当满足任何条件时，timer/reminder都将停止。

### Actor 计时器

你可以通过 timer 在actor中注册一个回调。

Dapr actor运行时确保回调方法遵守基于回合的并发保证。 这意味着，在此回调完成执行之前，没有其他执行者的方法或timer/reminder回调将在进行中。

Dapr Actor 运行时在回调完成时保存对actor的状态所作的更改。 如果在保存状态时发生错误，那么将取消激活该actor对象，并且将激活新实例。

当actor作为垃圾回收(GC)的一部分被停用时，所有 timer 都会停止。 在此之后，将不会再调用 timer 的回调。 另外，Dapr actor运行时不会保留关于在停用之前正在运行的timer的任何信息。 也就是说，重新启动 actor 后将会激活的 timer 完全取决于注册时登记的 timer。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 timer。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

**示例**

Timer 的 duetime 可以在请求主体中指定。

下面的请求体配置了一个 timer, `dueTime` 9秒, `period` 3秒。 这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置一个timer，其`period`为3秒(采用ISO 8601 duration格式)。 它还将调用次数限制为10次。 这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "period":"R10/PT3S",
}
```

下面的请求体配置一个timer，其`period`为3秒(ISO 8601 duration 格式)，`ttl`为20秒。 这意味着它在注册后立即触发，然后每3秒触发一次，持续20秒。
```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

下面的请求体配置一个timer:`dueTime`为10秒，`period`为3秒，`ttl`为10秒。 它还把调用次数限制在4次。 这意味着它会在10秒后第一次启动，然后每3秒启动一次，持续10秒，但总次数不超过4次。
```json
{
  "dueTime":"10s",
  "period":"R4/PT3S",
  "ttl":"10s"
}
```

您可以通过调用来除去 Actor timers

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

更多信息，请查阅:[api规范]({{< ref "actors_api.md#invoke-timer" >}})

### Actor reminders

Reminders 是一种在指定时间内触发 *persistent* 回调的机制。 它们的功能类似于 timer。 但与 timer 不同，在所有情况下 reminders 都会触发，直到 actor 显式取消注册 reminders 或删除 actor 或者执行次数已经到达给定值。 具体而言， reminders 会在所有 actor 失活和故障时也会触发，因为Dapr Actors 运行时会将 reminders 信息持久化到 Dapr Actors 状态提供者中。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 reminders。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

请求reminder的结构与actors相同。 请参阅 [actor timers示例]({{< ref "#actor-timers" >}})。

#### 检索 actor reminders

您可以通过调用来检索 actor reminders

```md
GET http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### 删除 actor reminders

您可以通过调用来除去 Actor timers

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

更多信息，请查阅:[api规范]({{< ref "actors_api.md#invoke-reminder" >}})

## Actor 运行时配置

您可以配置 Dapr actor运行时配置来修改默认的运行时行为。

### 配置参数
- `entities` - 此主机支持的Actor 类型。
- `actorIdleTimeout` - 停用 actor 之前的超时。 每当经过 `actorScanInterval` 会进行一次超时检查。 默认**：60分钟**
- `actorScanInterval` - 指定扫描 Actors 以停用空闲 Actors 的频率时间间隔。 Actors 时间超过 actor_idle_timeout 的 Actors 将被取消激活。 默认**：30 秒**
- `drainOngoingCallTimeout` - 在重定位 actor 的过程中的持续时间。 这指定等待当前活动 actor 方法完成多长时间。 如果没有当前 actor 方法调用，那么将忽略此时间。 默认**：60 秒**
- `drainRebalancedActors` - 如果为 true，那么 Dapr 将等待`drainOngoingCallTimeout`的持续时间，以便在尝试停用一个 actor 之前, 允许当前的 actor 调用完成。 **默认: true**
- `reentrancy` (ActorReentrancyConfig) - 配置一个 actor 的重入行为。 如果没有提供，重入是禁用的。 **默认值：disabled** **默认值：0**
- `remindersStoragePartitions` - 配置 actor reminder 的分区数量。 如果未提供，则所有 reminder 将作为单个记录保存在 actor 的状态存储中。 **默认: 0**
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

查看 [这个示例](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
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
        // reentrancy not implemented in the .NET SDK at this time
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```
查看 .NET SDK [文档](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors)。
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
            // This actor type must have a matching value in the base level 'entities' field. If it does not, the configuration will be ignored.
            // If there is a matching entity, the values here will be used to overwrite any values specified in the root configuration.
            // In the case of this actor, it will have reentrancy enabled and 'defaultActorType' will not have reentrancy enabled.
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

更多详细信息请参阅 [Dapr SDK]({{< ref "developing-applications/sdks/#sdk-languages" >}}) 的文档和示例。

## Reminder 分区

{{% alert title="Preview feature" color="warning" %}}
Actor reminder 分区当前处于 [preview]({{< ref preview-features.md >}}) 状态。 如果您由于注册了大量 reminder 而遇到问题，请使用此功能。
{{% /alert %}}

Actor reminder 将持续存在，并在 sidecar 重新启动后继续触发。 在 Dapr 运行时版本 1.3 之前，reminder 保留在 actor 状态存储中的单个记录上：

| 键                                | 值                                                                      |
| -------------------------------- | ---------------------------------------------------------------------- |
| `actors\|\|<actor type>` | `[ <reminder 1>, <reminder 2>, ... , <reminder n> ]` |

注册许多 reminder 的应用程序可能会遇到以下问题：

* Reminder 注册和注销的吞吐量低
* 对注册的 reminder 总数的限制是基于状态存储上的单个记录大小的限制。

从版本 1.3 开始，应用程序现在可以在状态存储中启用 actor reminder 分区。 由于数据分布在状态存储中的多个键中。 首先， `actors\|\|<actor type>\|\|metadata` 中的元数据记录被用于存储给定 actor 类型的持久化配置。 然后，同一 actor 类型的 reminder 子集被存储在多个记录中。

| 键                                                                                             | 值                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `actors\|\|<actor type>\|\|metadata`                                                | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]`                                                              |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]`                                                              |
| ...                                                                                           | ...                                                                                                                                       |

如果分区数量不够，可以更改它，Dapr 的 sidecar 将自动重新分发 reminder 的设置。

### 启用 actor reminder 分区
Actor reminder 分区当前处于预览阶段，所以启动它仅需两步处理。

#### 预览功能配置
在使用 reminder 分区之前，必须在 Dapr 中启用 actor 类型元数据。 有关预览配置的更多信息，请参阅 [在Dapr中选择预览功能的完整指南]({{< ref preview-features.md >}})。 以下是配置示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: myconfig
spec:
  features:
    - name: Actor.TypeMetadata
      enabled: true
```

#### Actor 运行时配置
当以可选预览功能启用 actor 类型元数据时，actor 运行时还必须提供适当的配置来对 actor reminder 进行分区。 这是由 `GET /dapr/config`的 actor 终结点完成的，类似于其他 actor 配置元素。

{{< tabs Java Dotnet Python Go >}}

{{% codetab %}}
```java
// import io.dapr.actors.runtime.ActorRuntime;
// import java.time.Duration;

ActorRuntime.getInstance().getConfig().setActorIdleTimeout(Duration.ofMinutes(60));
ActorRuntime.getInstance().getConfig().setActorScanInterval(Duration.ofSeconds(30));
ActorRuntime.getInstance().getConfig().setRemindersStoragePartitions(7);
```

查看 [这个示例](https://github.com/dapr/java-sdk/blob/master/examples/src/main/java/io/dapr/examples/actors/DemoActorService.java)
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
        // reentrancy not implemented in the .NET SDK at this time
    });

    // Register additional services for use with actors
    services.AddSingleton<BankService>();
}
```
查看 .NET SDK [文档](https://github.com/dapr/dotnet-sdk/blob/master/daprdocs/content/en/dotnet-sdk-docs/dotnet-actors/dotnet-actors-usage.md#registering-actors)。
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

以下是 reminder 分区的有效配置示例：

```json
{
    "entities": [ "MyActorType", "AnotherActorType" ],
    "remindersStoragePartitions": 7
}
```

#### 处理配置更改
对于生产方案，在启用此功能之前需要考虑以下几点：

* 仅当分区数保持为零时，才能还原启用（即从启用改为禁用）actor 类型元数据，否则 reminder 集合将还原到以前的状态。
* 分区数只能增加，不能减少。 这允许 Dapr 在滚动重启时自动重新分发数据，其中一个或多个分区配置可能处于活动状态。

#### 例子
* [Actor reminder 分区 community call 视频](https://youtu.be/ZwFOEUYe1WA?t=1493)