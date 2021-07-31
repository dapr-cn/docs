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

要使用Actor，您的状态存储必须支持多项目事务。  这意味着您的状态存储 [component](https://github.com/dapr/components-contrib/tree/master/state) 必须实现 [TransactionalStore](https://github.com/dapr/components-contrib/blob/master/state/transactional_store.go) 接口。  支持事务/actors的组建列表如下:[受支持状态存储]({{< ref supported-state-stores.md >}}) Only a single state store component can be used as the statestore for all actors.

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

Reminders 是一种在指定时间内触发 *persistent* 回调的机制。 它们的功能类似于 timer。 但与 timer 不同，在所有情况下 reminders 都会触发，直到 actor 显式取消注册 reminders 或删除 actor 。 具体而言， reminders 会在所有 actor 失活和故障时也会触发触发，因为Dapr Actors 运行时会将 reminders 信息持久化到 Dapr Actors 状态提供者中。

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

You can configure the Dapr Actors runtime configuration to modify the default runtime behavior.

### Configuration parameters
- `actorIdleTimeout` - The timeout before deactivating an idle actor. Checks for timeouts occur every `actorScanInterval` interval. **Default: 60 minutes**
- `actorScanInterval` - The duration which specifies how often to scan for actors to deactivate idle actors. Actors that have been idle longer than actor_idle_timeout will be deactivated. **Default: 30 seconds**
- `drainOngoingCallTimeout` - The duration when in the process of draining rebalanced actors. This specifies the timeout for the current active actor method to finish. 如果没有当前 actor 方法调用，那么将忽略此时间。 **Default: 60 seconds**
- `drainRebalancedActors` - If true, Dapr will wait for `drainOngoingCallTimeout` duration to allow a current actor call to complete before trying to deactivate an actor. **Default: true**
- `reentrancy` (ActorReentrancyConfig) - Configure the reentrancy behavior for an actor. If not provided, reentrancy is diabled. **Default: disabled**

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
        // reentrancy not implemented in the .NET SDK at this time
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
        reentrancy=ActorReentrancyConfig(enabled=False)
    )
)
```
{{% /codetab %}}

{{< /tabs >}}

Refer to the documentation and examples of the [Dapr SDKs]({{< ref "developing-applications/sdks/#sdk-languages" >}}) for more details.
