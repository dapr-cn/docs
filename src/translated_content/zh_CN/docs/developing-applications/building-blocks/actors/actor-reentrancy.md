---
type: docs
title: 如何：在 Dapr 中启用和使用 Actor可重入性
linkTitle: 如何：Actor可重入性
weight: 70
description: 进一步了解 Actor可重入性
---

[虚拟actor模式](https://www.microsoft.com/research/project/orleans-virtual-actors/)的一个核心原则是actor执行的单线程特性。 在没有重入的情况下，Dapr 运行时会锁定所有 actor 请求。 在第一个请求完成之前，第二个请求无法启动。 这意味着一个 actor 不能调用它自己，也不能让另一个 actor 调用它，即使它是同一个调用链的一部分。

重入功能允许来自同一链或上下文的请求重新进入已锁定的 actor ，从而解决了这一问题。 这在以下情况下非常有用：

- Actor 想调用自己的方法
- Actors 在工作流程中用于执行工作，然后回调到协调 Actors。

可重入性的调用链示例如下：

```
Actor A -> Actor A
ActorA -> Actor B -> Actor A
```

有了重入功能，你就可以执行更复杂的 actor 调用，而无需牺牲虚拟 actor 的单线程行为。

<img src="/images/actor-reentrancy.png" width=1000 height=500 alt="Diagram showing reentrancy for a coordinator workflow actor calling worker actors or an actor calling an method on itself">

`maxStackDepth` 参数设置一个值，该值控制对同一参与者进行多少次可重入调用。 默认情况下，此值设置为**32**，这在大多数情况下已足够。

## 配置 actor 运行时以启用重入功能

可重入 actor 必须提供适当的配置。 与其他 actor 配置元素类似，这是由 actor 端点 `GET /dapr/config` 完成的。

{{< tabs ".NET" JavaScript Python Java Go >}}

{{% codetab %}}

<!--dotnet-->

```csharp
public class Startup
{
	public void ConfigureServices(IServiceCollection services)
	{
		services.AddSingleton<BankService>();
		services.AddActors(options =>
		{
		options.Actors.RegisterActor<DemoActor>();
		options.ReentrancyConfig = new Dapr.Actors.ActorReentrancyConfig()
			{
			Enabled = true,
			MaxStackDepth = 32,
			};
		});
	}
}
```

{{% /codetab %}}

{{% codetab %}}

<!--javascript-->

```js
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  actor: {
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
  },
};
```

{{% /codetab %}}

{{% codetab %}}

<!--python-->

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprActor
from dapr.actor.runtime.config import ActorRuntimeConfig, ActorReentrancyConfig
from dapr.actor.runtime.runtime import ActorRuntime
from demo_actor import DemoActor

reentrancyConfig = ActorReentrancyConfig(enabled=True)
config = ActorRuntimeConfig(reentrancy=reentrancyConfig)
ActorRuntime.set_actor_config(config)
app = FastAPI(title=f'{DemoActor.__name__}Service')
actor = DaprActor(app)

@app.on_event("startup")
async def startup_event():
	# Register DemoActor
	await actor.register_actor(DemoActor)

@app.get("/MakeExampleReentrantCall")
def do_something_reentrant():
	# invoke another actor here, reentrancy will be handled automatically
	return
```

{{% /codetab %}}

{{% codetab %}}

<!--java-->

```java
```

{{% /codetab %}}

{{% codetab %}}

这是一个用 Golang 编写的 actor 配置代码片段，通过 HTTP API 提供重入配置。 可重入性尚未包含在 Go SDK 中。

```go
type daprConfig struct {
	Entities                []string                `json:"entities,omitempty"`
	ActorIdleTimeout        string                  `json:"actorIdleTimeout,omitempty"`
	ActorScanInterval       string                  `json:"actorScanInterval,omitempty"`
	DrainOngoingCallTimeout string                  `json:"drainOngoingCallTimeout,omitempty"`
	DrainRebalancedActors   bool                    `json:"drainRebalancedActors,omitempty"`
	Reentrancy              config.ReentrancyConfig `json:"reentrancy,omitempty"`
}

var daprConfigResponse = daprConfig{
	[]string{defaultActorType},
	actorIdleTimeout,
	actorScanInterval,
	drainOngoingCallTimeout,
	drainRebalancedActors,
	config.ReentrancyConfig{Enabled: true, MaxStackDepth: &maxStackDepth},
}

func configHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(daprConfigResponse)
}
```

### 处理重入请求

重入请求的关键是`Dapr-Reentrancy-Id`请求头。 该标头的值用于将请求与其调用链进行匹配，并允许它们绕过 actor 锁。

Dapr 运行时会为任何指定了重入配置的 actor 请求生成该标头。 一旦生成，它就会被用来锁定 actor ，并且必须传递给以后的所有请求。 下面是一个代理处理重入请求的示例：

```go
func reentrantCallHandler(w http.ResponseWriter, r *http.Request) {
    /*
     * Omitted.
     */

	req, _ := http.NewRequest("PUT", url, bytes.NewReader(nextBody))

	reentrancyID := r.Header.Get("Dapr-Reentrancy-Id")
	req.Header.Add("Dapr-Reentrancy-Id", reentrancyID)

	client := http.Client{}
	resp, err := client.Do(req)

    /*
     * Omitted.
     */
}
```

{{% /codetab %}}

{{< /tabs >}}

## 例子

观看这个[视频](https://www.youtube.com/watch?v=QADHQ5v-gww\&list=PLcip_LgkYwzuF-OV6zKRADoiBvUvGhkao\&t=674s)，了解如何使用Actor可重入性。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/QADHQ5v-gww?start=674" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 下一步

{{< button text="Actors in the Dapr SDKs" page="developing-applications/sdks/#sdk-languages" >}}

## 相关链接

- [Actors API参考]({{< ref actors_api.md >}})
- [Actors概述]({{< ref actors-overview.md >}})
