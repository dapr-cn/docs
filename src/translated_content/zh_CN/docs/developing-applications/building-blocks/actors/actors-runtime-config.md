---
type: docs
title: Actor 运行时配置参数
linkTitle: 运行时配置
weight: 30
description: 修改默认的 Dapr actor 运行时配置行为
---

您可以使用以下配置参数修改默认的 Dapr actor 运行时行为。

| 参数                                                        | 说明                                                                                                                     | 默认值             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------- |
| 108469                                                    | 主机支持的角色类型。                                                                                                             | N/A             |
| `actorIdleTimeout`                                        | 停用空闲 actor 前的超时。 每当经过 `actorScanInterval` 会进行一次超时检查。                                                                   | 60分钟            |
| `actorScanInterval`                                       | 持续时间，指定多久扫描一次 Actors，以停用闲置的 Actors。 闲置时间超过 actor_idle_timeout 的 Actors 将被停用。 | 30秒             |
| `drainOngoingCallTimeout`                                 | 重新平衡后的 Actors 重定位过程中的持续时间。 这将指定当前活动 actor 方法完成的超时时间。 如果没有当前 actor 方法调用，那么将忽略此时间。                                       | 60秒             |
| `drainRebalancedActors`                                   | 如果为 true ，那么 Dapr 将等待 `drainOngoingCallTimeout` 以允许当前 actor 调用完成，然后再尝试停用 actor。                                        | true            |
| `reentrancy` (`ActorReentrancyConfig`) | 配置 actor 的重入行为。 如果不提供，则禁用重入功能。                                                                                         | disabled, false |
| `remindersStoragePartitions`                              | 配置 actor 提醒的分区数量。 如果未提供，则所有 reminder 将作为单个记录保存在 actor 的状态存储中。                                                          | 0               |
| `entitiesConfig`                                          | 通过配置阵列对每种 actor 类型进行单独配置。 在单个实体配置中指定的任何实体也必须在顶级 `entities` 字段中指定。                                                      | N/A             |

## 示例

{{< tabs ".NET" JavaScript Python Java Go >}}

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

[查看注册 Actors 的.NET SDK文档]({{< ref "dotnet-actors-usage.md#registring-actors" >}})。

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    actorIdleTimeout: "1h",
    actorScanInterval: "30s",
    drainOngoingCallTimeout: "1m",
    drainRebalancedActors: true,
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
    remindersStoragePartitions: 0,
  },
};

// Use the options when creating DaprServer and DaprClient.

// Note, DaprServer creates a DaprClient internally, which needs to be configured with clientOptions.
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, clientOptions);

const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP, clientOptions);
```

[查看使用JavaScript SDK编写actors的文档]({{< ref "js-actors.md#registering-actors" >}})。

{{% /codetab %}}

{{% codetab %}}

<!--python-->

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

[请参阅有关使用 Python SDK 运行 Actors 的文档]({{< ref "python-actor.md" >}})

{{% /codetab %}}

{{% codetab %}}

<!--java-->

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

[请参阅有关使用Java SDK编写Actor的文档]({{< ref "java.md#actors" >}}).

{{% /codetab %}}

{{% codetab %}}

<!--go-->

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

[查看使用 Go SDK 与 actors 的示例](https://github.com/dapr/go-sdk/tree/main/examples/actor)。

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="启用actor提醒分区" page="howto-actors-partitioning.md" >}}

## 相关链接

- 请参考[Dapr SDK文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview.md >}})
