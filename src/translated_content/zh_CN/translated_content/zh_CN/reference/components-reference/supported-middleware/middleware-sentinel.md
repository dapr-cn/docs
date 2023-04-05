---
type: docs
title: "Sentinel 容错中间件组件"
linkTitle: "Sentinel"
description: "Use Sentinel middleware to guarantee the reliability and resiliency of your application"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-sentinel/
---

[Sentinel](https://github.com/alibaba/sentinel-golang) is a powerful fault-tolerance component that takes "flow" as the breakthrough point and covers multiple fields including flow control, traffic shaping, concurrency limiting, circuit breaking, and adaptive system protection to guarantee the reliability and resiliency of microservices.

The Sentinel [HTTP middleware]({{< ref middleware.md >}}) enables Dapr to facilitate Sentinel's powerful abilities to protect your application. 您可以参考 [Sentinel Wiki](https://github.com/alibaba/sentinel-golang/wiki) 来了解更多关于 Sentinel 的信息。

## Component format

In the following definition, the maximum requests per second are set to 10:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sentinel
spec:
  type: middleware.http.sentinel
  version: v1
  metadata:
  - name: appName
    value: "nodeapp"
  - name: logDir
    value: "/var/tmp"
  - name: flowRules
    value: >-
      [
        {
          "resource": "POST:/v1.0/invoke/nodeapp/method/neworder",
          "threshold": 10,
          "tokenCalculateStrategy": 0,
          "controlBehavior": 0
        }
      ]
```

## 元数据字段规范

| Field               | 详情                                  | 示例                                                                                          |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------- |
| appName             | the name of current running service | `nodeapp`                                                                                   |
| logDir              | 日志目录路径                              | `/var/tmp/sentinel`                                                                         |
| flowRules           | 哨兵流量控制规则 json 数组                    | [流量控制规则](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)          |
| circuitBreakerRules | 哨兵断路器规则 json 数组                     | [断路器规则](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go) |
| hotSpotParamRules   | 哨兵热点参数流控制规则 json 数组                 | [热点规则](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)         |
| isolationRules      | 哨兵隔离规则 json 数组                      | [隔离规则](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)       |
| systemRules         | 哨兵系统规则 json 数组                      | [系统规则](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)          |

Once the limit is reached, the request will return *HTTP Status code 429: Too Many Requests*.

特别注意每个规则定义中 `resource` 领域。 在 Dapr 中，它遵循以下格式：

```
POST/GET/PUT/DELETE:Dapr HTTP API Request Path
```

所有具体的 HTTP API 信息都可以从 \[Dapr API Reference\]({{< ref "api" >}}) 中找到. 在上述示例配置中， `resource` 字段设置为 **POST:/v1.0/invoke/nodeapp/method/neworder**。

## Dapr 配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
spec:
  httpPipeline:
    handlers:
      - name: sentinel
        type: middleware.http.sentinel
```

## 相关链接

- [Sentinel Github](https://github.com/alibaba/sentinel-golang)
- [中间件]({{< ref middleware.md >}})
- [Dapr 配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
