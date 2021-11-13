---
type: docs
title: "How-to: 在 Dapr 中使用 virtual actors"
linkTitle: "How-To: Virtual actors"
weight: 20
description: 了解有关 Actor 模式的更多信息
---

The Dapr actor runtime provides support for [virtual actors]({{< ref actors-overview.md >}}) through following capabilities:

## 调用 Actor 方法

您可以通过 HTTP/gRPC 来与 Dapr 交互以调用 actor 方法.

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-actor-method" >}})

Alternatively, you can use the Dapr SDK in [.NET]({{< ref "dotnet-actors" >}}), [Java]({{< ref "java#actors" >}}), or [Python]({{< ref "python-actor" >}}).

## Actor 状态管理

Actor 可以使用状态管理功能可靠地保存状态。 您可以通过 HTTP/GRPC 端点与 Dapr 进行状态管理。

要使用Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [component](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  支持事务/actors的组建列表如下:[受支持状态存储]({{< ref supported-state-stores.md >}}) 只有一个 状态存储 件可以用作所有 Actors 的状态存储 。

## Actor timers 和 reminders

Actors 可以通过 timer 或者 remider 自行注册周期性的任务.

The functionality of timers and reminders is very similar. The main difference is that Dapr actor runtime is not retaining any information about timers after deactivation, while persisting the information about reminders using Dapr actor state provider.

This distintcion allows users to trade off between light-weight but stateless timers vs. more resource-demanding but stateful reminders.

The scheduling configuration of timers and reminders is identical, as summarized below:

---
`dueTime` is an optional parameter that sets time at which or time interval before the callback is invoked for the first time. If `dueTime` is omitted, the callback is invoked immediately after timer/reminder registration.

Supported formats:
- RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`

---
`period` is an optional parameter that sets time interval between two consecutive callback invocations. When specified in `ISO 8601-1 duration` format, you can also configure the number of repetition in order to limit the total number of callback invocations. If `period` is omitted, the callback will be invoked only once.

Supported formats:
- time.Duration format, e.g. `2h30m`
- [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format, e.g. `PT2H30M`, `R5/PT1M30S`

---
`ttl` is an optional parameter that sets time at which or time interval after which the timer/reminder will be expired and deleted. If `ttl` is omitted, no restrictions are applied.

Supported formats:
* RFC3339 date format, e.g. `2020-10-02T15:00:00Z`
* time.Duration format, e.g. `2h30m`
* [ISO 8601 duration](https://en.wikipedia.org/wiki/ISO_8601#Durations) format. Example: `PT2H30M`

---
The actor runtime validates correctess of the scheduling configuration and returns error on invalid input.

When you specify both the number of repetitions in `period` as well as `ttl`, the timer/reminder will be stopped when either condition is met.

### Actor 计时器

你可以通过 timer 在actor中注册一个回调。

The Dapr actor runtime ensures that the callback methods respect the turn-based concurrency guarantees. This means that no other actor methods or timer/reminder callbacks will be in progress until this callback completes execution.

The Dapr actor runtime saves changes made to the actor's state when the callback finishes. 如果在保存状态时发生错误，那么将取消激活该actor对象，并且将激活新实例。

当actor作为垃圾回收(GC)的一部分被停用时，所有 timer 都会停止。 在此之后，将不会再调用 timer 的回调。 Also, the Dapr actor runtime does not retain any information about the timers that were running before deactivation. 也就是说，重新启动 actor 后将会激活的 timer 完全取决于注册时登记的 timer。

You can create a timer for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

**示例**

The timer parameters are specified in the request body.

下面的请求体配置了一个 timer, `dueTime` 9秒, `period` 3秒。 这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

The following request body configures a timer with a `period` of 3 seconds (in ISO 8601 duration format). It also limits the number of invocations to 10. This means it will fire 10 times: first, immediately after registration, then every 3 seconds after that.
```json
{
  "period":"R10/PT3S",
}
```

The following request body configures a timer with a `period` of 3 seconds (in ISO 8601 duration format) and a `ttl` of 20 seconds. This means it fires immediately after registration, then every 3 seconds after that for the duration of 20 seconds.
```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

The following request body configures a timer with a `dueTime` of 10 seconds, a `period` of 3 seconds, and a `ttl` of 10 seconds. It also limits the number of invocations to 4. This means it will first fire after 10 seconds, then every 3 seconds after that for the duration of 10 seconds, but no more than 4 times in total.
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

Reminders 是一种在指定时间内触发 *persistent* 回调的机制。 它们的功能类似于 timer。 But unlike timers, reminders are triggered under all circumstances until the actor explicitly unregisters them or the actor is explicitly deleted or the number in invocations is exhausted. Specifically, reminders are triggered across actor deactivations and failovers because the Dapr actor runtime persists the information about the actors' reminders using Dapr actor state provider.

You can create a persistent reminder for an actor by calling the HTTP/gRPC request to Dapr as shown below, or via Dapr SDK.

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

The request structure for reminders is identical to those of actors. Please refer to the [actor timers examples]({{< ref "#actor-timers" >}}).

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

You can configure the Dapr actor runtime configuration to modify the default runtime behavior.

### 配置参数
- `actorIdleTimeout` - 停用 actor 之前的超时。 每当经过 `actorScanInterval` 会进行一次超时检查。 默认**：60分钟**
- `actorScanInterval` - 指定扫描 Actors 以停用空闲 Actors 的频率时间间隔。 Actors 时间超过 actor_idle_timeout 的 Actors 将被取消激活。 默认**：30 秒**
- `drainOngoingCallTimeout` - 在重定位 actor 的过程中的持续时间。 这指定等待当前活动 actor 方法完成多长时间。 如果没有当前 actor 方法调用，那么将忽略此时间。 默认**：60 秒**
- `drainRebalancedActors` - 如果为 true，那么 Dapr 将等待`drainOngoingCallTimeout`的持续时间，以便在尝试停用一个 actor 之前, 允许当前的 actor 调用完成。 **默认: true**
- `reentrancy` (ActorReentrancyConfig) - 配置一个 actor 的重入行为。 如果没有提供，重入是禁用的。 **Default: disabled** **Default: 0**
- `remindersStoragePartitions` - Configure the number of partitions for actor's reminders. If not provided, all reminders are saved as a single record in actor's state store. **Default: 0**

{{< tabs Java Dotnet Python >}}

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

{{< /tabs >}}

更多详细信息请参阅 [Dapr SDK]({{< ref "developing-applications/sdks/#sdk-languages" >}}) 的文档和示例。

## Partitioning reminders

{{% alert title="Preview feature" color="warning" %}}
Actor reminders partitioning is currently in [preview]({{< ref preview-features.md >}}). Use this feature if you are runnining into issues due to a high number of reminders registered.
{{% /alert %}}

Actor reminders are persisted and continue to be triggered after sidecar restarts. Prior to Dapr runtime version 1.3, reminders were persisted on a single record in the actor state store:

| Key                              | 值                                                                      |
| -------------------------------- | ---------------------------------------------------------------------- |
| `actors\|\|<actor type>` | `[ <reminder 1>, <reminder 2>, ... , <reminder n> ]` |

Applications that register many reminders can experience the following issues:

* Low throughput on reminders registration and deregistration
* Limit on total number of reminders registered based on the single record size limit on the state store

Since version 1.3, applications can now enable partitioning of actor reminders in the state store. As data is distributed in multiple keys in the state store. First, there is a metadata record in `actors\|\|<actor type>\|\|metadata` that is used to store persisted configuration for a given actor type. Then, there are multiple records that stores subsets of the reminders for the same actor type.

| Key                                                                                           | 值                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `actors\|\|<actor type>\|\|metadata`                                                | `{ "id": <actor metadata identifier>, "actorRemindersMetadata": { "partitionCount": <number of partitions for reminders> } }` |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|1` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-n> ]`                                                              |
| `actors\|\|<actor type>\|\|<actor metadata identifier>\|\|reminders\|\|2` | `[ <reminder 1-1>, <reminder 1-2>, ... , <reminder 1-m> ]`                                                              |
| ...                                                                                           | ...                                                                                                                                       |

If the number of partitions is not enough, it can be changed and Dapr's sidecar will automatically redistribute the reminders's set.

### Enabling actor reminders partitioning
Actor reminders partitioning is currently in preview, so enabling it is a two step process.

#### 预览功能配置
Before using reminders partitioning, actor type metadata must be enabled in Dapr. 有关预览配置的更多信息，请参阅 [在Dapr中选择预览功能的完整指南]({{< ref preview-features.md >}})。 Below is an example of the configuration:

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
Once actor type metadata is enabled as an opt-in preview feature, the actor runtime must also provide the appropriate configuration to partition actor reminders. 这是由 `GET /dapr/config`的 actor 终结点完成的，类似于其他 actor 配置元素。

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

The following, is an example of a valid configuration for reminder partitioning:

```json
{
    "entities": [ "MyActorType", "AnotherActorType" ],
    "remindersStoragePartitions": 7
}
```

#### Handling configuration changes
For production scenarios, there are some points to be considered before enabling this feature:

* Enabling actor type metadata can only be reverted if the number of partitions remains zero, otherwise the reminders' set will be reverted to an previous state.
* Number of partitions can only be increased and not decreased. This allows Dapr to automatically redistribute the data on a rolling restart where one or more partition configurations might be active.

#### 例子
* [Actor reminder partitioning community call video](https://youtu.be/ZwFOEUYe1WA?t=1493)