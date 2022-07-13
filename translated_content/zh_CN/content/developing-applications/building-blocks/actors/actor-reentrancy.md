---
type: docs
title: "如何：在Dapr中启用 Actor 的可重入性"
linkTitle: "如何：Actor的可重入性"
weight: 30
description: 了解更多关于 actor 可重入性
---

## Actor可重入性
虚拟 actor 模式的核心原则是 actor 执行的单线程性质。 Without reentrancy, the Dapr runtime locks on all actor requests, even those that are in the same call chain. 第二个请求要到第一个请求完成后才能开始。 This means an actor cannot call itself, or have another actor call into it even if it is part of the same chain. Reentrancy solves this by allowing requests from the same chain, or context, to re-enter into an already locked actor. This is especially useful in scenarios where an actor wants to call a method on itself or when actors are used in workflows where other actors are used to perform work, and they then call back onto the coordinating actor. Examples of chains that reentrancy allows are shown below:

```
Actor A -> Actor A
ActorA -> Actor B -> Actor A
```

通过可重入性，可以在不牺牲虚拟 actor 单线程行为的情况下，支持更复杂的 actor 调用。

<img src="/images/actor-reentrancy.png" width=1000 height=500 alt="Diagram showing reentrancy for a coordinator workflow actor calling worker actors or an actor calling an method on itself">

The `maxStackDepth` parameter sets a value that controls how many reentrant calls be made to the same actor. By default this is set to 32, which is more than sufficient in most cases.

## Enable Actor Reentrancy with Actor Configuration

The actor that will be reentrant must provide configuration to use reentrancy. 这是由 `GET /dapr/config`的 actor 终结点完成的，类似于其他 actor 配置元素。

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

Here is a snippet of an actor written in Golang providing the reentrancy configuration via the HTTP API. Reentrancy has not yet been included into the Go SDK.

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

Dapr运行时为每一个指定了重新入配置项的actor请求创建了该请求头。 请求头一旦创建，即被锁定于该actor，且必须传递给后续的所有请求。 Below are the snippets of code from an actor handling this:

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

Watch this [video](https://www.youtube.com/watch?v=QADHQ5v-gww&list=PLcip_LgkYwzuF-OV6zKRADoiBvUvGhkao&t=674s) on how to use actor reentrancy.
<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/QADHQ5v-gww?start=674" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>
