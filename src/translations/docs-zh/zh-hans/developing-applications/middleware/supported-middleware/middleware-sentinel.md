---
type: docs
title: "Sentinel fault-tolerance middleware component"
linkTitle: "Sentinel"
weight: 7000
description: "Use Sentinel middleware to guarantee the reliability and resiliency of your application"
---

[Sentinel](https://github.com/alibaba/sentinel-golang) is a powerful fault-tolerance component that takes "flow" as the breakthrough point and covers multiple fields including flow control, traffic shaping, concurrency limiting, circuit breaking, and adaptive system protection to guarantee the reliability and resiliency of microservices.

The Sentinel [HTTP middleware]({{< ref middleware-concept.md >}}) enables Dapr to facilitate Sentinel's powerful abilities to protect your application. You can refer to [Sentinel Wiki](https://github.com/alibaba/sentinel-golang/wiki) for more details on Sentinel.

## 配置

根据下述定义，请求正文转换为大写字母：

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

| 字段                  | 详情                                                          | Example                                                                                                    |
| ------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| appName             | the name of current running service                         | `nodeapp`                                                                                                  |
| logDir              | the log directory path                                      | `/var/tmp/sentinel`                                                                                        |
| flowRules           | json array of sentinel flow control rules                   | [flow control rule](https://github.com/alibaba/sentinel-golang/blob/master/core/flow/rule.go)              |
| circuitBreakerRules | json array of sentinel circuit breaker rules                | [circuit breaker rule](https://github.com/alibaba/sentinel-golang/blob/master/core/circuitbreaker/rule.go) |
| hotSpotParamRules   | json array of sentinel hotspot parameter flow control rules | [hotspot rule](https://github.com/alibaba/sentinel-golang/blob/master/core/hotspot/rule.go)                |
| isolationRules      | json array of sentinel isolation rules                      | [isolation rule](https://github.com/alibaba/sentinel-golang/blob/master/core/isolation/rule.go)            |
| systemRules         | json array of sentinel system rules                         | [system rule](https://github.com/alibaba/sentinel-golang/blob/master/core/system/rule.go)                  |

一旦达到上限，请求将返回 *HTTP Status code 429: Too Many Requests*。

Special note to `resource` field in each rule's definition. In Dapr, it follows the following format:

```
POST/GET/PUT/DELETE:Dapr HTTP API Request Path
```

All concrete HTTP API information can be found from [Dapr API Reference]{{< ref "api" >}}. In the above sample config, the `resource` field is set to **POST:/v1.0/invoke/nodeapp/method/neworder**.

## Dapr配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

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
- [中间件概念]({{< ref middleware-concept.md >}})
- [Dapr配置]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
