---
type: docs
title: "概述"
linkTitle: "概述"
weight: 100
description: "配置 Dapr 的重试、超时和断路器"
---

Dapr 提供了一种通过[弹性规范]({{< ref "resiliency-overview.md#complete-example-policy" >}})来定义和应用容错策略的功能。弹性规范与组件规范存放在同一位置，并在 Dapr sidecar 启动时生效。sidecar 决定如何将这些策略应用于您的 Dapr API 调用。在自托管模式下，弹性规范文件必须命名为 `resiliency.yaml`。在 Kubernetes 中，Dapr 会找到您的应用程序使用的命名弹性规范。在弹性规范中，您可以定义常见的弹性模式策略，例如：

- [超时]({{< ref "policies.md#timeouts" >}})
- [重试/退避]({{< ref "policies.md#retries" >}})
- [断路器]({{< ref "policies.md#circuit-breakers" >}})

这些策略可以应用于[目标]({{< ref "targets.md" >}})，包括：

- 通过服务调用的[应用程序]({{< ref "targets.md#apps" >}})
- [组件]({{< ref "targets.md#components" >}})
- [actor]({{< ref "targets.md#actors" >}})

此外，弹性策略还可以[限定到特定应用程序]({{< ref "component-scopes.md#application-access-to-components-with-scopes" >}})。

## 演示视频

了解更多关于[如何使用 Dapr 编写弹性微服务](https://youtu.be/uC-4Q5KFq98?si=JSUlCtcUNZLBM9rW)。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/uC-4Q5KFq98?si=JSUlCtcUNZLBM9rW" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 弹性策略结构

以下是弹性策略的一般结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
scopes:
  # 可选地将策略限定到特定应用程序
spec:
  policies:
    timeouts:
      # 超时策略定义

    retries:
      # 重试策略定义

    circuitBreakers:
      # 断路器策略定义

  targets:
    apps:
      # 应用程序及其应用的策略

    actors:
      # actor 类型及其应用的策略

    components:
      # 组件及其应用的策略
```

## 完整示例策略

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
# 类似于订阅和配置规范，scopes 列出了可以使用此弹性规范的 Dapr 应用程序 ID。
scopes:
  - app1
  - app2
spec:
  # policies 是定义超时、重试和断路器策略的地方。
  # 每个策略都有一个名称，以便可以在弹性规范的 targets 部分引用。
  policies:
    # 超时是简单的命名持续时间。
    timeouts:
      general: 5s
      important: 60s
      largeResponse: 10s

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

      important:
        policy: constant
        duration: 5s
        maxRetries: 30

      someOperation:
        policy: exponential
        maxInterval: 15s

      largeResponse:
        policy: constant
        duration: 5s
        maxRetries: 3

    # 断路器会自动为每个组件和应用实例创建。
    # 断路器维护的计数器在 Dapr sidecar 运行期间存在。它们不会被持久化。
    circuitBreakers:
      simpleCB:
        maxRequests: 1
        timeout: 30s 
        trip: consecutiveFailures >= 5

      pubsubCB:
        maxRequests: 1
        interval: 8s
        timeout: 45s
        trip: consecutiveFailures > 8

  # targets 是应用命名策略的对象。Dapr 支持 3 种目标类型 - 应用程序、组件和 actor
  targets:
    apps:
      appB:
        timeout: general
        retry: important
        # 服务的断路器是按应用实例限定的。
        # 当断路器被触发时，该路由将从负载均衡中移除，持续配置的 `timeout` 时间。
        circuitBreaker: simpleCB

    actors:
      myActorType: # 自定义 actor 类型名称
        timeout: general
        retry: important
        # actor 的断路器可以按类型、ID 或两者限定。
        # 当断路器被触发时，该类型或 ID 将从配置表中移除，持续配置的 `timeout` 时间。
        circuitBreaker: simpleCB
        circuitBreakerScope: both ## 
        circuitBreakerCacheSize: 5000

    components:
      # 对于状态存储，策略适用于保存和检索状态。
      statestore1: # 任何组件名称 -- 这里是一个状态存储
        outbound:
          timeout: general
          retry: retryForever
          # 组件的断路器是按组件配置/实例限定的。例如 myRediscomponent。
          # 当此断路器被触发时，所有与该组件的交互将在配置的 `timeout` 时间内被阻止。
          circuitBreaker: simpleCB

      pubsub1: # 任何组件名称 -- 这里是一个 pubsub broker
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB

      pubsub2: # 任何组件名称 -- 这里是另一个 pubsub broker
        outbound:
          retry: pubsubRetry
          circuitBreaker: pubsubCB
        inbound: # inbound 仅适用于从 sidecar 到应用程序的传递
          timeout: general
          retry: important
          circuitBreaker: pubsubCB
```

## 相关链接

观看此视频以了解如何使用[弹性](https://www.youtube.com/watch?t=184&v=7D6HOU3Ms6g&feature=youtu.be)：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/7D6HOU3Ms6g?start=184" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>

## 下一步
了解更多关于弹性策略和目标：
 - [策略]({{< ref "policies.md" >}})
 - [目标]({{< ref "targets.md" >}})
尝试其中一个弹性快速入门：
- [弹性：服务到服务]({{< ref resiliency-serviceinvo-quickstart.md >}})
- [弹性：状态管理]({{< ref resiliency-state-quickstart.md >}})