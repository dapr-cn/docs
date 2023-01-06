---
type: docs
title: "如何：在Dapr中启用 Actor 的可重入性"
linkTitle: "How-To: Actor reentrancy"
weight: 30
description: 了解更多关于 actor 可重入性
---

## Actor可重入性
虚拟 actor 模式的核心原则是 actor 执行的单线程性质。 在不重入的情况下，Dapr 运行时会锁定所有Actor 组件请求，甚至包括位于同一调用链中的请求。 第二个请求要到第一个请求完成后才能开始。 这意味着一个actor不能调用自己，或者让另一个actor调用它，即使它是同一链的一部分。 可重入性通过允许来自同一链或同一上下文的请求重新进入已锁定的 actor 来解决这个问题。 这在以下情况下特别有用：Actor 想要调用自身上的方法，或者在工作流中使用Actor，其中其他Actors 用于执行工作，然后他们回调协调参与者。 可重入性的调用链示例如下：

```
Actor A -> Actor A
ActorA -> Actor B -> Actor A
```

通过可重入性，可以在不牺牲虚拟 actor 单线程行为的情况下，支持更复杂的 actor 调用。

<img src="/images/actor-reentrancy.png" width=1000 height=500 alt="显示调用工作角色的协调工作流 actor 或在其自身上调用方法的actor 的重入关系的图示">

`maxStackDepth` 参数设置一个值，该值控制对同一参与者进行多少次可重入调用。 默认情况下，此值设置为 32，这在大多数情况下已足够。

## 使用 Actor 配置启用 Actor 可重入性

将重入的Actor 必须提供配置才能使用重入。 这是由 `GET /dapr/config`的 actor 终结点完成的，类似于其他 actor 配置元素。

{{< tabs Dotnet Python Go >}}

{{% codetab %}}

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

### 重入请求处理
重入请求的关键是名为`Dapr-Reentrancy-Id`的请求头。 该请求头的值用于匹配请求与他们的执行链，允许他们绕过actor的锁定。

Dapr运行时为每一个指定了重新入配置项的actor请求创建了该请求头。 请求头一旦创建，即被锁定于该actor，且必须传递给后续的所有请求。 以下是处理此问题的 actor 的代码片段：

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

观看此 [视频](https://www. youtube. com/watch? v=Qadhq5v-gww& list=Plcip_LgkYwzuF-Ov6zKRADoiBvUvGhkao& t=674s) ，了解如何使用Actor 可重入性。
<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/QADHQ5v-gww?start=674" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
