---
type: docs
title: "如何：在Dapr中启用和使用actor重入"
linkTitle: "如何：actor重入"
weight: 80
description: 了解更多关于actor重入的信息
---

[虚拟actor模式](https://www.microsoft.com/research/project/orleans-virtual-actors/)的一个核心原则是actor的单线程执行特性。没有重入时，Dapr运行时会锁定所有actor请求。第二个请求必须等到第一个请求完成后才能启动。这意味着actor不能调用自身，也不能被另一个actor调用，即使它们属于同一调用链。

重入通过允许同一链或上下文的请求重新进入已锁定的actor来解决这个问题。这在以下场景中非常有用：
- 一个actor想要调用自身的方法
- actor在工作流中用于执行任务，然后回调到协调actor。

重入允许的调用链示例如下：

```
Actor A -> Actor A
Actor A -> Actor B -> Actor A
```

通过重入，您可以执行更复杂的actor调用，而不影响虚拟actor的单线程特性。

<img src="/images/actor-reentrancy.png" width=1000 height=500 alt="显示协调工作流actor调用工作actor或actor调用自身方法的重入图示">

`maxStackDepth`参数用于设置一个值，以控制对同一actor可以进行多少次重入调用。默认情况下，这个值为**32**，通常已经足够。

## 配置actor运行时以启用重入

要启用actor重入，必须提供适当的配置。这是通过actor的`GET /dapr/config`端点完成的，类似于其他actor配置元素。

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

// 使用DaprClientOptions配置actor运行时。
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
	# 注册DemoActor
	await actor.register_actor(DemoActor)

@app.get("/MakeExampleReentrantCall")
def do_something_reentrant():
	# 在这里调用另一个actor，重入将自动处理
	return
```
{{% /codetab %}}

{{% codetab %}}
<!--java-->

```

```

{{% /codetab %}}

{{% codetab %}}

以下是一个用Golang编写的actor代码片段，通过HTTP API提供重入配置。重入尚未包含在Go SDK中。

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

处理重入请求的关键在于`Dapr-Reentrancy-Id`头。此头的值用于将请求与其调用链匹配，并允许它们绕过actor的锁。

此头由Dapr运行时为任何具有重入配置的actor请求生成。一旦生成，它用于锁定actor，并且必须传递给所有后续请求。以下是一个actor处理重入请求的示例：

```go
func reentrantCallHandler(w http.ResponseWriter, r *http.Request) {
    /*
     * 省略。
     */

	req, _ := http.NewRequest("PUT", url, bytes.NewReader(nextBody))

	reentrancyID := r.Header.Get("Dapr-Reentrancy-Id")
	req.Header.Add("Dapr-Reentrancy-Id", reentrancyID)

	client := http.Client{}
	resp, err := client.Do(req)

    /*
     * 省略。
     */
}
```

{{% /codetab %}}

{{< /tabs >}}

## 演示

观看此[视频](https://www.youtube.com/watch?v=QADHQ5v-gww&list=PLcip_LgkYwzuF-OV6zKRADoiBvUvGhkao&t=674s)以了解如何使用actor重入。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/QADHQ5v-gww?start=674" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 下一步

{{< button text="Dapr SDK中的actor" page="developing-applications/sdks/#sdk-languages" >}}

## 相关链接

- [actor API参考]({{< ref actors_api.md >}})
- [actor概述]({{< ref actors-overview.md >}})
