---
type: docs
title: "actor 运行时配置参数"
linkTitle: "运行时配置"
weight: 30
description: 修改默认 Dapr actor 运行时配置行为
---

您可以使用以下配置参数来调整 Dapr actor 的默认运行时行为。

| 参数 | 描述 | 默认值 |
| --------- | ----------- | ------- |
| `entities` | 此主机支持的 actor 类型。 | N/A |
| `actorIdleTimeout` | 空闲 actor 的停用超时时间。每隔 `actorScanInterval` 时间间隔检查一次。 | 60 分钟 |
| `actorScanInterval` | 指定扫描空闲 actor 的时间间隔。超过 `actorIdleTimeout` 的 actor 将被停用。 | 30 秒 |
| `drainOngoingCallTimeout` | 在重新平衡 actor 时，指定当前活动 actor 方法的完成超时时间。如果没有正在进行的方法调用，则忽略此项。 | 60 秒 |
| `drainRebalancedActors` | 如果设置为 true，Dapr 将在 `drainOngoingCallTimeout` 时间内等待当前 actor 调用完成，然后再尝试停用 actor。 | true |
| `reentrancy` (`ActorReentrancyConfig`) | 配置 actor 的重入行为。如果未提供，则重入功能被禁用。 | 禁用，false |
| `remindersStoragePartitions` | 配置 actor 的提醒分区数量。如果未提供，所有提醒将作为 actor 状态存储中的单个记录保存。 | 0 |
| `entitiesConfig` | 使用配置数组单独配置每个 actor 类型。任何在单个实体配置中指定的实体也必须在顶级 `entities` 字段中列出。 | N/A |

## 示例

{{< tabs ".NET" JavaScript Python Java Go >}}

{{% codetab %}}
```csharp
// 在 Startup.cs 中
public void ConfigureServices(IServiceCollection services)
{
    // 使用 DI 注册 actor 运行时
    services.AddActors(options =>
    {
        // 注册 actor 类型并配置 actor 设置
        options.Actors.RegisterActor<MyActor>();

        // 配置默认设置
        options.ActorIdleTimeout = TimeSpan.FromMinutes(60);
        options.ActorScanInterval = TimeSpan.FromSeconds(30);
        options.DrainOngoingCallTimeout = TimeSpan.FromSeconds(60);
        options.DrainRebalancedActors = true;
        options.RemindersStoragePartitions = 7;
        options.ReentrancyConfig = new() { Enabled = false };

        // 为特定 actor 类型添加配置。
        // 此 actor 类型必须在基础级别的 'entities' 字段中有匹配值。如果没有，配置将被忽略。
        // 如果有匹配的实体，这里的值将用于覆盖根配置中指定的任何值。
        // 在此示例中，`ReentrantActor` 启用了重入；然而，'MyActor' 将不启用重入。
        options.Actors.RegisterActor<ReentrantActor>(typeOptions: new()
        {
            ReentrancyConfig = new()
            {
                Enabled = true,
            }
        });
    });

    // 注册用于 actor 的其他服务
    services.AddSingleton<BankService>();
}
```
[查看 .NET SDK 文档以注册 actor]({{< ref "dotnet-actors-usage.md#registring-actors" >}})。

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// 使用 DaprClientOptions 配置 actor 运行时。
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

// 在创建 DaprServer 和 DaprClient 时使用这些选项。

// 注意，DaprServer 内部创建了一个 DaprClient，需要使用 clientOptions 进行配置。
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, clientOptions);

const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP, clientOptions);
```

[查看使用 JavaScript SDK 编写 actor 的文档]({{< ref "js-actors.md#registering-actors" >}})。

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

[查看使用 Python SDK 运行 actor 的文档]({{< ref "python-actor.md" >}})

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

[查看使用 Java SDK 编写 actor 的文档]({{< ref "java.md#actors" >}})。

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
            // 为特定 actor 类型添加配置。
            // 此 actor 类型必须在基础级别的 'entities' 字段中有匹配值。如果没有，配置将被忽略。
            // 如果有匹配的实体，这里的值将用于覆盖根配置中指定的任何值。
            // 在此示例中，`reentrantActorType` 启用了重入；然而，'defaultActorType' 将不启用重入。
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

[查看使用 Go SDK 的 actor 示例](https://github.com/dapr/go-sdk/tree/main/examples/actor)。

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="启用 actor reminder 分区 >>" page="howto-actors-partitioning.md" >}}

## 相关链接

- 参考 [Dapr SDK 文档和示例]({{< ref "developing-applications/sdks/#sdk-languages" >}})。
- [actor API 参考]({{< ref actors_api.md >}})
- [actor 概述]({{< ref actors-overview.md >}})
