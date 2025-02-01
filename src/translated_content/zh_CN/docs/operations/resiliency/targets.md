---
type: docs
title: "目标"
linkTitle: "目标"
weight: 300
description: "将弹性策略应用于包括应用程序、组件和actor在内的目标"
---

### 目标

命名的策略被应用于目标。Dapr支持三种目标类型，这些类型适用于所有Dapr构建块的API：
- `apps`
- `components`
- `actors`

#### 应用程序

使用`apps`目标，您可以将`retry`、`timeout`和`circuitBreaker`策略应用于Dapr应用程序之间的服务调用。在`targets/apps`下，策略应用于每个目标服务的`app-id`。当sidecar之间的通信出现故障时，这些策略将被调用，如下图所示。

> Dapr提供了[内置的服务调用重试]({{< ref "service-invocation-overview.md#retries" >}})，因此任何应用的`retry`策略都是额外的。

<img src="/images/resiliency_svc_invocation.png" width=1000 alt="显示服务调用弹性的图示" />

应用于目标应用程序`app-id`为"appB"的策略示例：

```yaml
specs:
  targets:
    apps:
      appB: # 目标服务的app-id
        timeout: general
        retry: general
        circuitBreaker: general
```

#### 组件

使用`components`目标，您可以将`retry`、`timeout`和`circuitBreaker`策略应用于组件操作。

策略可以应用于`outbound`操作（从Dapr sidecar到组件的调用）和/或`inbound`（从sidecar到您的应用程序的调用）。

##### 出站

`outbound`操作是从sidecar到组件的调用，例如：

- 持久化或检索状态。
- 在pubsub组件上发布消息。
- 调用输出绑定。

> 某些组件可能具有内置的重试功能，并且可以在每个组件的基础上进行配置。

<img src="/images/resiliency_outbound.png" width=1000 alt="显示服务调用弹性的图示">

```yaml
spec:
  targets:
    components:
      myStateStore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

##### 入站

`inbound`操作是从sidecar到您的应用程序的调用，例如：

- pubsub订阅在传递消息时。
- 输入绑定。

> 某些组件可能具有内置的重试功能，并且可以在每个组件的基础上进行配置。

<img src="/images/resiliency_inbound.png" width=1000 alt="显示服务调用弹性的图示" />

```yaml
spec:
  targets:
    components:
      myInputBinding:
        inbound: 
          timeout: general
          retry: general
          circuitBreaker: general
```

##### PubSub

在pubsub `target/component`中，您可以同时指定`inbound`和`outbound`操作。

<img src="/images/resiliency_pubsub.png" width=1000 alt="显示服务调用弹性的图示">

```yaml
spec:
  targets:
    components:
      myPubsub:
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
        inbound: # 入站仅适用于从sidecar到应用程序的传递
          timeout: general
          retry: general
          circuitBreaker: general
```

#### Actor

使用`actors`目标，您可以将`retry`、`timeout`和`circuitBreaker`策略应用于actor操作。

当为`actors`目标使用`circuitBreaker`策略时，您可以通过`circuitBreakerScope`指定电路断开的范围：

- `id`：单个actor ID
- `type`：给定actor类型的所有actor
- `both`：以上两者

您还可以使用`circuitBreakerCacheSize`属性指定要在内存中保留的电路断路器数量的缓存大小，提供一个整数值，例如`5000`。

示例

```yaml
spec:
  targets:
    actors:
      myActorType:
        timeout: general
        retry: general
        circuitBreaker: general
        circuitBreakerScope: both
        circuitBreakerCacheSize: 5000
```

## 下一步

尝试其中一个弹性快速入门：
- [弹性：服务到服务]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [弹性：状态管理]({{< ref resiliency-state-quickstart.md >}})
