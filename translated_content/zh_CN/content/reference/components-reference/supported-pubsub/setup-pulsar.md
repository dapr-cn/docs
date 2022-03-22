---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "关于Pulsar pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## 配置
To setup Apache Pulsar pubsub create a component of type `pubsub.pulsar`. 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。 For more information on Apache Pulsar [read the docs](https://pulsar.apache.org/docs/en/concepts-overview/)

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pulsar-pubsub
  namespace: default
spec:
  type: pubsub.pulsar
  version: v1
  metadata:
  - name: host
    value: "localhost:6650"
  - name: enableTLS
    value: "false"
  - name: tenant
    value: "public"
  - name: token
    value: "eyJrZXlJZCI6InB1bHNhci1wajU0cXd3ZHB6NGIiLCJhbGciOiJIUzI1NiJ9.eyJzd"
  - name: namespace
    value: "default"
  - name: persistent
    value: "true"
  - name: backOffPolicy
    value: "constant"
  - name: backOffMaxRetries
    value: "-1"
  - name: disableBatching
    value: "false"
```
## 元数据字段规范

| 字段                         | 必填 | 详情                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | 示例                                                                                            |
| -------------------------- |:--:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| host                       | Y  | Pulsar broker. 地址， 默认值是 `"localhost:6650"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | `"localhost:6650"` OR `"http://pulsar-pj54qwwdpz4b-pulsar.ap-sg.public.pulsar.com:8080"`      |
| enableTLS                  | N  | 启用TLS  默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `"true"`, `"false"`                                                                           |
| token                      | N  | Enable Authentication.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | [How to create pulsar token](https://pulsar.apache.org/docs/en/security-jwt/#generate-tokens) |
| tenant                     | N  | The topic tenant within the instance. Tenants are essential to multi-tenancy in Pulsar, and spread across clusters.  Default: `"public"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `"public"`                                                                                    |
| namespace                  | N  | The administrative unit of the topic, which acts as a grouping mechanism for related topics.  Default: `"default"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | `"默认值"`                                                                                       |
| persistent                 | N  | Pulsar supports two kind of topics: [persistent](https://pulsar.apache.org/docs/en/concepts-architecture-overview#persistent-storage) and [non-persistent](https://pulsar.apache.org/docs/en/concepts-messaging/#non-persistent-topics). With persistent topics, all messages are durably persisted on disks (if the broker is not standalone, messages are durably persisted on multiple disks), whereas data for non-persistent topics is not persisted to storage disks. Note: the default retry behavior is to retry until it succeeds, so when you use a non-persistent theme, you can reduce or prohibit retries by defining `backOffMaxRetries` to `0`. 默认: `"true"` | `"true"`, `"false"`                                                                           |
| backOffPolicy              | N  | 重试策略，`"constant"`是一个总是返回相同的退避延迟的退避策略。 `"exponential"` 是一种退避策略，它使用呈指数级增长的随机化函数增加每次重试尝试的退避周期。 默认为 `"constant"`。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `constant`、`exponential`                                                                      |
| backOffDuration            | N  | The fixed interval only takes effect when the `backOffPolicy` is `"constant"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"5s"`。                                                                                                                                                                                                                                                                                                                                                                               | `"5s"`、`"5000"`                                                                               |
| backOffInitialInterval     | N  | 重试时的回退初始间隔。 Only takes effect when the `backOffPolicy` is `"exponential"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认值为 `"500"`                                                                                                                                                                                                                                                                                                                                                                                  | `"50"`                                                                                        |
| backOffMaxInterval         | N  | 重试时的回退初始间隔。 Only takes effect when the `backOffPolicy` is `"exponential"`. There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"60s"`                                                                                                                                                                                                                                                                                                                                                                                   | `"60000"`                                                                                     |
| backOffMaxRetries          | N  | 返回错误前重试处理消息的最大次数。 默认为 `"0"` 这意味着组件不会重试处理消息。 `"-1"` 将无限期重试，直到处理完消息或关闭应用程序。 任何正数都被视为最大重试计数。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `"3"`                                                                                         |
| backOffRandomizationFactor | N  | 随机系数，介于 1 和 0 之间，包括 0 但不是 1。 随机间隔 = 重试间隔 * （1 ±backOffRandomizationFactor）。 默认值为 `"0.5"`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `"0.5"`                                                                                       |
| backOffMultiplier          | N  | 策略的退避倍数。 通过将间隔乘以倍数来递增间隔。 默认值为 `"1.5"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `"1.5"`                                                                                       |
| backOffMaxElapsedTime      | N  | 在 MaxElapsedTime 之后，ExponentialBackOff 返回 Stop。 There are two valid formats, one is the fraction with a unit suffix format, and the other is the pure digital format that is processed as milliseconds. 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"15m"`                                                                                                                                                                                                                                                                                                                                                                                                              | `"15m"`                                                                                       |
| disableBatching            | N  | disable batching. 默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `"true"`, `"false"`                                                                           |

### 延迟队列

当调用 Pulsar 发布/订阅时，在请求 url 中使用 `metadata` 查询参数来提供一个可选的延迟队列时可行的。

可选参数的名称为 `metadata.deliverAt` 或 `metadata.deliverAfter`
- `deliverAt`: 延迟消息以在指定的时间投递 (RFC3339 格式)，例如 `"2021-09-01T10:00:00Z"`
- `deliverAfter`:延迟消息在指定的时间后进行投递，例如 `"4h5m3s"`

Examples:

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAt='2021-09-01T10:00:00Z' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

或者

```shell
curl -X POST http://localhost:3500/v1.0/publish/myPulsar/myTopic?metadata.deliverAfter='4h5m3s' \
  -H "Content-Type: application/json" \
  -d '{
        "data": {
          "message": "Hi"
        }
      }'
```

## 创建 Pulsar 实例

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
```
docker run -it \
  -p 6650:6650 \
  -p 8080:8080 \
  --mount source=pulsardata,target=/pulsar/data \
  --mount source=pulsarconf,target=/pulsar/conf \
  apachepulsar/pulsar:2.5.1 \
  bin/pulsar standalone

```
{{% /codetab %}}

{{% codetab %}}
请参考以下[Helm chart](https://pulsar.apache.org/docs/en/kubernetes-helm/)文档。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}})，了解配置 发布/订阅组件的说明
- [发布/订阅构建块]({{< ref pubsub >}})
