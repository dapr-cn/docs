---
type: docs
title: "弹性说明"
linkTitle: "弹性"
weight: 3000
description: "Dapr 弹性资源的基本说明"
---

Dapr 的弹性资源使您能够定义和应用容错策略。这些弹性说明会在 Dapr sidecar 启动时生效。

{{% alert title="注意" color="primary" %}}
任何弹性资源都可以限制在特定的[命名空间]({{< ref isolation-concept.md >}})中，并通过作用域限制对特定应用程序集的访问。
{{% /alert %}}

## 格式

```yml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: <替换为资源名称>
version: v1alpha1
scopes:
  - <替换为作用域应用程序ID>
spec:
  policies: # 必需
    timeouts:
      timeoutName: <替换为时间值> # 使用唯一名称替换
    retries:
      retryName: # 使用唯一名称替换
        policy: <替换为策略值>
        duration: <替换为持续时间>
        maxInterval: <替换为最大间隔>
        maxRetries: <替换为最大重试次数>
        matching:
          httpStatusCodes: <替换为HTTP状态码>
          gRPCStatusCodes: <替换为gRPC状态码>
    circuitBreakers:
      circuitBreakerName: # 使用唯一名称替换
        maxRequests: <替换为最大请求数>
        timeout: <替换为超时时间> 
        trip: <替换为连续失败次数>
targets: # 必需
    apps:
      appID: # 替换为应用程序ID
        timeout: <替换为超时名称>
        retry: <替换为重试名称>
        circuitBreaker: <替换为断路器名称>
    actors:
      myActorType: 
        timeout: <替换为超时名称>
        retry: <替换为重试名称>
        circuitBreaker: <替换为断路器名称>
        circuitBreakerCacheSize: <替换为缓存大小>
    components:
      componentName: # 替换为组件名称
        outbound:
          timeout: <替换为超时名称>
          retry: <替换为重试名称>
          circuitBreaker: <替换为断路器名称>
```

## 说明字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| policies | Y | 弹性策略的配置，包括： <br><ul><li>`timeouts`</li><li>`retries`</li><li>`circuitBreakers`</li></ul> <br> [查看所有内置策略的更多示例]({{< ref policies.md >}}) | timeout: `general`<br>retry: `retryForever`<br>circuit breaker: `simpleCB` |
| targets | Y | 使用弹性策略的应用程序、actor 或组件的配置。 <br>[在弹性目标指南中查看更多示例]({{< ref targets.md >}})  | `apps` <br>`components`<br>`actors` |

## 相关链接
[了解更多关于弹性策略和目标的信息]({{< ref resiliency-overview.md >}})
