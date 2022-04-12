---
type: docs
title: "How-to: 在 Dapr 中使用 virtual actors"
linkTitle: "How-To: Virtual actors"
weight: 20
description: 了解有关 Actor 模式的更多信息
---

Dapr actors 运行时提供了以下功能以支持[虚拟actors]({{< ref actors-overview.md >}}):

## 调用 Actor 方法

您可以通过 HTTP/gRPC 来与 Dapr 交互以调用 actor 方法

```html
POST/GET/PUT/DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/method/<method>
```

您可以在请求主体中为 actor 方法提供任何数据，并且请求的响应在响应主体中，这是来自 actor 方法调用的数据。

更多信息，请查阅：[api 规范]({{< ref "actors_api.md#invoke-actor-method" >}})

## Actor 状态管理

Actor 可以使用状态管理功能可靠地保存状态。 您可以通过 HTTP/GRPC 端点与 Dapr 进行状态管理。

要使用Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [component](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  支持事务/actors的组建列表如下:[受支持状态存储]({{< ref supported-state-stores.md >}}) 只有一个 状态存储 件可以用作所有 Actors 的状态存储 。

## Actor timers 和 reminders

Actors 可以通过 timer 或者 remider 自行注册周期性的任务.

### Actor 计时器

你可以通过 timer 在actor中注册一个回调。

Dapr Actor 运行时确保回调方法被顺序调用，而非并发调用。 这意味着，在此回调完成执行之前，不会有其他Actor方法或timer/remider回调被执行。

Timer的下一个周期在回调完成执行后开始计算。 这意味着 timer 在回调执行时停止，并在回调完成时启动。

Dapr Actor 运行时在回调完成时保存对actor的状态所作的更改。 如果在保存状态时发生错误，那么将取消激活该actor对象，并且将激活新实例。

当actor作为垃圾回收(GC)的一部分被停用时，所有 timer 都会停止。 在此之后，将不会再调用 timer 的回调。 此外， Dapr Actors 运行时不会保留有关在失活之前运行的 timer 的任何信息。 也就是说，重新启动 actor 后将会激活的 timer 完全取决于注册时登记的 timer。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 timer。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Timer 的 `duetime` 和回调函数可以在请求主体中指定。  到期时间（due time）表示注册后 timer 将首次触发的时间。  `period` 表示timer在此之后触发的频率。  到期时间为0表示立即执行。  负 due times 和负 periods 都是无效。

下面的请求体配置了一个 timer, `dueTime` 9秒, `period` 3秒。  这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置了一个 timer, `dueTime` 0秒, `period` 3秒。  这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

您可以通过调用来除去 Actor timers

```md
DELETE http://localhost:3500/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

更多信息，请查阅:[api规范]({{< ref "actors_api.md#invoke-timer" >}})

### Actor reminders

Reminders 是一种在指定时间内触发 *persistent* 回调的机制。 它们的功能类似于 timer。 但与 timer 不同，在所有情况下 reminders 都会触发，直到 actor 显式取消注册 reminders 或删除 actor 或者执行次数已经到达给定值。 具体而言， reminders 会在所有 actor 失活和故障时也会触发触发，因为Dapr Actors 运行时会将 reminders 信息持久化到 Dapr Actors 状态提供者中。

您可以通过将 HTTP/gRPC 请求调用 Dapr 来为 actor 创建 reminders。

```md
POST/PUT http://localhost:3500/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Reminders 的 `duetime` 和回调函数可以在请求主体中指定。  到期时间（due time）表示注册后 reminders将首次触发的时间。  `period` 表示在此之后 reminders 将触发的频率。  到期时间为0表示立即执行。  负 due times 和负 periods 都是无效。  若要注册仅触发一次的 reminders ，请将 period 设置为空字符串。

下面的请求体配置了一个 reminders, `dueTime` 9秒, `period` 3秒。  这意味着它将在9秒后首次触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m9s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置了一个 reminders, `dueTime` 0秒, `period` 3秒。  这意味着它将在注册之后立即触发，然后每3秒触发一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m3s0ms"
}
```

下面的请求体配置了一个 reminders, `dueTime` 15秒, `period` 空字符串。  这意味着它将在15秒后首次触发，之后就不再被触发。
```json
{
  "dueTime":"0h0m15s0ms",
  "period":""
}
```

[ISO 8601 持续时间](https://en.wikipedia.org/wiki/ISO_8601#Durations) 也可用来指定 `period`。 下面的请求体配置了一个 reminders, `dueTime` 0秒, `period` 15秒。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"P0Y0M0W0DT0H0M15S"
}
```
The designators for zero are optional and the above `period` can be simplified to `PT15S`. ISO 8601 指定多个重复格式，但目前只支持持续时间格式。

#### 带有重复次数的 reminders

当配置为 ISO 8601 持续时间时， `期间` 列还允许指定 reminders 可以运行的次数。 以下请求主体将创建一个 reminders ，该提醒将在 15 秒内执行 5 次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"R5/PT15S"
}
```

重复次数，即运行提醒的次数应该是正数。

**例子**

Watch this [video](https://www.youtube.com/watch?v=B_vkXqptpXY&t=1002s) for more information on using ISO 861 for Reminders

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/B_vkXqptpXY?start=1003" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

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

您可以配置 Dapr Actors 运行时间配置以修改默认的运行时间行为。

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