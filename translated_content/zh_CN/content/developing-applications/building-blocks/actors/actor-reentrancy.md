---
type: docs
title: "操作方法：在 Dapr 中启用 actor 的可重入性"
linkTitle: "操作方法：Actor 的可重入性"
weight: 30
description: 了解更多关于 actor 可重入性
---

{{% alert title="Preview feature" color="warning" %}}
Actor 可重入性当前处于 [preview]({{< ref preview-features.md >}})状态。
{{% /alert %}}

## Actor可重入性
Virtual actor 模式的核心原则是 actor 执行的单线程性质。 在可重入之前，这会导致 Dapr 运行时锁定任何给定请求的 actor。 第二个请求要到第一个请求完成后才能开始。 这种行为意味着 actor 不能调用自己，或让另一个 actor 调用它，即使它是同一链的一部分。 可重入性通过允许来自同一链或同一上下文的请求重新进入已锁定的 actor 来解决这个问题。 可重入性的调用链示例如下：

```
Actor A -> Actor A
ActorA -> Actor B -> Actor A
```

通过可重入性，可以在不牺牲虚拟 actor 单线程行为的情况下，支持更复杂的 actor 调用。

## 启用 Actor 的可重入性
Actor 可重入性进入当前处于预览阶段，所以启动它仅需两步处理。

### 预览功能配置
在启动可重入性之前，必须在 Dapr 中启用该功能。 有关预览配置的更多信息，请参阅 [在 Dapr 中选择预览功能的完整指南]({{< ref preview-features.md >}})。 以下是 actor 可重入性配置的示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: reentrantconfig
spec:
  features:
    - name: Actor.Reentrancy
      enabled: true
```

### Actor 运行时配置
在预览功能配置中添加 actor 可重入性之后，可重入的 actor 还必须进行适当的配置。 这是由 `GET /dapr/config` 的 actor 端点完成的，类似于其他 actor 配置元素。 以下是用 Golang 编写的 actor 配置代码片段示例：

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
重入请求的关键是名为 `Dapr-Reentrancy-Id` 的请求头。 该请求头的值用于匹配请求与他们的执行链，允许他们绕过 actor 的锁定。

Dapr 运行时为每一个指定了重新入配置项的 actor 请求创建了该请求头。 请求头一旦创建，即被锁定于该 actor，且必须传递给后续的所有请求。 以下为用 Golang 编写的 actor 处理该情况代码示例:

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

目前，没有 SDK 支持 actor 的可重入性。 将来，在 SDK 中使用的处理可重入 ID 的方法可能有所不同。
