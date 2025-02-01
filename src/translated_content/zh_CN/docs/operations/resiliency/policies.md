---
type: docs
title: "弹性策略"
linkTitle: "策略"
weight: 200
description: "配置超时、重试和断路器的弹性策略"
---

在 `policies` 下定义超时、重试和断路器策略。每个策略都有一个名称，以便您可以在弹性规范的 `targets` 部分中引用它们。

> 注意：Dapr 为某些 API 提供默认的重试机制。[请参阅此处]({{< ref "#overriding-default-retries" >}})了解如何使用用户定义的重试策略覆盖默认重试逻辑。

## 超时

超时是可选策略，用于提前终止长时间运行的操作。如果超过了超时时间：

- 正在进行的操作将被终止（如果可能）。
- 返回错误。

有效值是 Go 的 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 接受的格式，例如：`15s`、`2m`、`1h30m`。超时没有设置最大值。

示例：

```yaml
spec:
  policies:
    # 超时是简单的命名持续时间。
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s
```

如果未指定超时值，则策略不会强制执行时间限制，默认使用请求客户端设置的任何值。

## 重试

通过 `retries`，您可以为失败的操作定义重试策略，包括由于触发定义的超时或断路器策略而失败的请求。

{{% alert title="Pub/sub 组件重试与入站弹性" color="warning" %}}
每个 [pub/sub 组件]({{< ref supported-pubsub >}}) 都有其内置的重试行为。显式应用 Dapr 弹性策略不会覆盖这些内置重试机制。相反，重试策略补充了内置重试机制，这可能导致消息的重复聚集。
{{% /alert %}}

以下重试选项是可配置的：

| 重试选项 | 描述 |
| ------------ | ----------- |
| `policy` | 确定退避和重试间隔策略。有效值为 `constant` 和 `exponential`。<br/>默认为 `constant`。 |
| `duration` | 确定重试之间的时间间隔。仅适用于 `constant` 策略。<br/>有效值为 `200ms`、`15s`、`2m` 等格式。<br/>默认为 `5s`。|
| `maxInterval` | 确定 `exponential` 退避策略可以增长到的最大间隔。<br/>额外的重试总是在 `maxInterval` 的持续时间之后发生。默认为 `60s`。有效值为 `5s`、`1m`、`1m30s` 等格式。 |
| `maxRetries` | 尝试的最大重试次数。<br/>`-1` 表示无限次重试，而 `0` 表示请求不会被重试（本质上表现为未设置重试策略）。<br/>默认为 `-1`。 |
| `matching.httpStatusCodes` | 可选：要重试的 HTTP 状态代码或代码范围的逗号分隔字符串。未列出的状态代码不重试。<br/>有效值：100-599，[参考](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)<br/>格式：`<code>` 或范围 `<start>-<end>`<br/>示例："429,501-503"<br/>默认：空字符串 `""` 或字段未设置。重试所有 HTTP 错误。 |
| `matching.gRPCStatusCodes` | 可选：要重试的 gRPC 状态代码或代码范围的逗号分隔字符串。未列出的状态代码不重试。<br/>有效值：0-16，[参考](https://grpc.io/docs/guides/status-codes/)<br/>格式：`<code>` 或范围 `<start>-<end>`<br/>示例："1,501-503"<br/>默认：空字符串 `""` 或字段未设置。重试所有 gRPC 错误。 |

{{% alert title="httpStatusCodes 和 gRPCStatusCodes 格式" color="warning" %}}
字段值应遵循字段描述中指定的格式或下面的“示例 2”中的格式。
格式不正确的值将产生错误日志（“无法读取弹性策略”），并且 `daprd` 启动序列将继续。
{{% /alert %}}

指数退避窗口使用以下公式：

```
BackOffDuration = PreviousBackOffDuration * (随机值从 0.5 到 1.5) * 1.5
if BackOffDuration > maxInterval {
  BackoffDuration = maxInterval
}
```

示例：

```yaml
spec:
  policies:
    # 重试是重试配置的命名模板，并在操作的生命周期内实例化。
    retries:
      pubsubRetry:
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever:
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # 无限重试
```

示例 2：

```yaml
spec:
  policies:
    retries:
      retry5xxOnly:
        policy: constant
        duration: 5s
        maxRetries: 3
        matching:
          httpStatusCodes: "429,500-599" # 重试此范围内的 HTTP 状态代码。所有其他不重试。
          gRPCStatusCodes: "1-4,8-11,13,14" # 重试这些范围内的 gRPC 状态代码并分隔单个代码。
```

## 断路器

断路器（CB）策略用于当其他应用程序/服务/组件经历较高的失败率时。CB 监控请求，并在满足某个条件时关闭所有流向受影响服务的流量（“打开”状态）。通过这样做，CB 给服务时间从其故障中恢复，而不是用事件淹没它。CB 还可以允许部分流量通过，以查看系统是否已恢复（“半开”状态）。一旦请求恢复成功，CB 进入“关闭”状态并允许流量完全恢复。

| 重试选项 | 描述 |
| ------------ | ----------- |
| `maxRequests` | 在 CB 半开（从故障中恢复）时允许通过的最大请求数。默认为 `1`。 |
| `interval` | CB 用于清除其内部计数的周期性时间段。如果设置为 0 秒，则永不清除。默认为 `0s`。 |
| `timeout` | 开放状态（直接在故障后）到 CB 切换到半开的时间段。默认为 `60s`。 |
| `trip` | 由 CB 评估的 [通用表达式语言（CEL）](https://github.com/google/cel-spec) 语句。当语句评估为 true 时，CB 触发并变为打开。默认为 `consecutiveFailures > 5`。其他可能的值是 `requests` 和 `totalFailures`，其中 `requests` 表示电路打开之前的成功或失败调用次数，`totalFailures` 表示电路打开之前的总失败尝试次数（不一定是连续的）。示例：`requests > 5` 和 `totalFailures >3`。|

示例：

```yaml
spec:
  policies:
    circuitBreakers:
      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8
```

## 覆盖默认重试

Dapr 为任何不成功的请求（如失败和瞬态错误）提供默认重试。在弹性规范中，您可以通过定义具有保留名称关键字的策略来覆盖 Dapr 的默认重试逻辑。例如，定义名为 `DaprBuiltInServiceRetries` 的策略，覆盖通过服务到服务请求的 sidecar 之间的失败的默认重试。策略覆盖不适用于特定目标。

> 注意：尽管您可以使用更强大的重试覆盖默认值，但您不能使用比提供的默认值更低的值覆盖，或完全删除默认重试。这可以防止意外停机。

下面是描述 Dapr 默认重试和覆盖它们的策略关键字的表格：

| 功能 | 覆盖关键字 | 默认重试行为 | 描述 |
| ------------------ | ------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| 服务调用 | DaprBuiltInServiceRetries | 每次调用重试以 1 秒的退避间隔执行，最多达到 3 次的阈值。 | sidecar 到 sidecar 请求（服务调用方法调用）失败并导致 gRPC 代码 `Unavailable` 或 `Unauthenticated` |
| actor | DaprBuiltInActorRetries | 每次调用重试以 1 秒的退避间隔执行，最多达到 3 次的阈值。 | sidecar 到 sidecar 请求（actor 方法调用）失败并导致 gRPC 代码 `Unavailable` 或 `Unauthenticated` |
| actor 提醒 | DaprBuiltInActorReminderRetries | 每次调用重试以指数退避执行，初始间隔为 500ms，最多 60s，持续 15 分钟 | 请求失败将 actor 提醒持久化到状态存储 |
| 初始化重试 | DaprBuiltInInitializationRetries | 每次调用重试 3 次，指数退避，初始间隔为 500ms，持续 10s | 向应用程序发出请求以检索给定规范时的失败。例如，无法检索订阅、组件或弹性规范 |

下面的弹性规范示例显示了使用保留名称关键字 'DaprBuiltInServiceRetries' 覆盖 _所有_ 服务调用请求的默认重试。

还定义了一个名为 'retryForever' 的重试策略，仅适用于 appB 目标。appB 使用 'retryForever' 重试策略，而所有其他应用程序服务调用重试失败使用覆盖的 'DaprBuiltInServiceRetries' 默认策略。

```yaml
spec:
  policies:
    retries:
      DaprBuiltInServiceRetries: # 覆盖服务到服务调用的默认重试行为
        policy: constant
        duration: 5s
        maxRetries: 10

      retryForever: # 用户定义的重试策略替换默认重试。目标仅依赖于应用的策略。
        policy: exponential
        maxInterval: 15s
        maxRetries: -1 # 无限重试

  targets:
    apps:
      appB: # 目标服务的 app-id
        retry: retryForever
```

## 设置默认策略

在弹性中，您可以设置默认策略，这些策略具有广泛的范围。这是通过保留关键字完成的，这些关键字让 Dapr 知道何时应用策略。有 3 种默认策略类型：

- `DefaultRetryPolicy`
- `DefaultTimeoutPolicy`
- `DefaultCircuitBreakerPolicy`

如果定义了这些策略，它们将用于服务、应用程序或组件的每个操作。它们还可以通过附加其他关键字进行更具体的修改。特定策略遵循以下模式，`Default%sRetryPolicy`、`Default%sTimeoutPolicy` 和 `Default%sCircuitBreakerPolicy`。其中 `%s` 被策略的目标替换。

下面是所有可能的默认策略关键字及其如何转换为策略名称的表格。

| 关键字                          | 目标操作                                     | 示例策略名称                                         |
| -------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `App`                            | 服务调用。                                  | `DefaultAppRetryPolicy`                                     |
| `Actor`                          | actor 调用。                                    | `DefaultActorTimeoutPolicy`                                 |
| `Component`                      | 所有组件操作。                            | `DefaultComponentCircuitBreakerPolicy`                      |
| `ComponentInbound`               | 所有入站组件操作。                    | `DefaultComponentInboundRetryPolicy`                        |
| `ComponentOutbound`              | 所有出站组件操作。                   | `DefaultComponentOutboundTimeoutPolicy`                     |
| `StatestoreComponentOutbound`    | 所有状态存储组件操作。                 | `DefaultStatestoreComponentOutboundCircuitBreakerPolicy`    |
| `PubsubComponentOutbound`        | 所有出站 pubsub（发布）组件操作。 | `DefaultPubsubComponentOutboundRetryPolicy`                 |
| `PubsubComponentInbound`         | 所有入站 pubsub（订阅）组件操作。 | `DefaultPubsubComponentInboundTimeoutPolicy`                |
| `BindingComponentOutbound`       | 所有出站绑定（调用）组件操作。  | `DefaultBindingComponentOutboundCircuitBreakerPolicy`       |
| `BindingComponentInbound`        | 所有入站绑定（读取）组件操作。     | `DefaultBindingComponentInboundRetryPolicy`                 |
| `SecretstoreComponentOutbound`   | 所有 secretstore 组件操作。                | `DefaultSecretstoreComponentTimeoutPolicy`                  |
| `ConfigurationComponentOutbound` | 所有配置组件操作。              | `DefaultConfigurationComponentOutboundCircuitBreakerPolicy` |
| `LockComponentOutbound`          | 所有锁组件操作。                       | `DefaultLockComponentOutboundRetryPolicy`                   |

### 策略层次结构解析

如果正在执行的操作与策略类型匹配，并且没有更具体的策略针对它，则应用默认策略。对于每个目标类型（应用程序、actor 和组件），优先级最高的策略是命名策略，即专门针对该构造的策略。

如果不存在，则策略从最具体到最广泛应用。

#### 默认策略和内置重试如何协同工作

在 [内置重试]({{< ref "policies.md#Override Default Retries" >}}) 的情况下，默认策略不会阻止内置重试策略运行。两者一起使用，但仅在特定情况下。

对于服务和 actor 调用，内置重试专门处理连接到远程 sidecar 的问题（如有必要）。由于这些对于 Dapr 运行时的稳定性至关重要，因此它们不会被禁用**除非**为操作专门引用了命名策略。在某些情况下，可能会有来自内置重试和默认重试策略的额外重试，但这可以防止过于弱的默认策略降低 sidecar 的可用性/成功率。

应用程序的策略解析层次结构，从最具体到最广泛：

1. 应用程序目标中的命名策略
2. 默认应用程序策略 / 内置服务重试
3. 默认策略 / 内置服务重试

actor 的策略解析层次结构，从最具体到最广泛：

1. actor 目标中的命名策略
2. 默认 actor 策略 / 内置 actor 重试
3. 默认策略 / 内置 actor 重试

组件的策略解析层次结构，从最具体到最广泛：

1. 组件目标中的命名策略
2. 默认组件类型 + 组件方向策略 / 内置 actor 提醒重试（如适用）
3. 默认组件方向策略 / 内置 actor 提醒重试（如适用）
4. 默认组件策略 / 内置 actor 提醒重试（如适用）
5. 默认策略 / 内置 actor 提醒重试（如适用）

例如，以下解决方案由三个应用程序、三个组件和两个 actor 类型组成：

应用程序：

- AppA
- AppB
- AppC

组件：

- Redis Pubsub: pubsub
- Redis 状态存储: statestore
- CosmosDB 状态存储: actorstore

actor：

- EventActor
- SummaryActor

下面是使用默认和命名策略的策略，并将其应用于目标。

```yaml
spec:
  policies:
    retries:
      # 全局重试策略
      DefaultRetryPolicy:
        policy: constant
        duration: 1s
        maxRetries: 3
      
      # 应用程序的全局重试策略
      DefaultAppRetryPolicy:
        policy: constant
        duration: 100ms
        maxRetries: 5

      # actor 的全局重试策略
      DefaultActorRetryPolicy:
        policy: exponential
        maxInterval: 15s
        maxRetries: 10

      # 入站组件操作的全局重试策略
      DefaultComponentInboundRetryPolicy:
        policy: constant
        duration: 5s
        maxRetries: 5

      # 状态存储的全局重试策略
      DefaultStatestoreComponentOutboundRetryPolicy:
        policy: exponential
        maxInterval: 60s
        maxRetries: -1

     # 命名策略
      fastRetries:
        policy: constant
        duration: 10ms
        maxRetries: 3

     # 命名策略
      retryForever:
        policy: exponential
        maxInterval: 10s
        maxRetries: -1

  targets:
    apps:
      appA:
        retry: fastRetries

      appB:
        retry: retryForever
    
    actors:
      EventActor:
        retry: retryForever

    components:
      actorstore:
        retry: fastRetries
```

下表是尝试调用此解决方案中的各种目标时应用的策略的细分。

| 目标             | 使用的策略                                     |
| ------------------ | ----------------------------------------------- |
| AppA               | fastRetries                                     |
| AppB               | retryForever                                    |
| AppC               | DefaultAppRetryPolicy / DaprBuiltInActorRetries |
| pubsub - 发布   | DefaultRetryPolicy                              |
| pubsub - 订阅 | DefaultComponentInboundRetryPolicy              |
| statestore         | DefaultStatestoreComponentOutboundRetryPolicy   |
| actorstore         | fastRetries                                     |
| EventActor         | retryForever                                    |
| SummaryActor       | DefaultActorRetryPolicy                         |

## 下一步

尝试其中一个弹性快速入门：
- [弹性：服务到服务]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [弹性：状态管理]({{< ref resiliency-state-quickstart.md >}})
