---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "关于Pulsar pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## 配置
要设置 Apache Pulsar pubsub，请创建一个类型为 `pubsub.pulsar`的组件。 请参阅[本指南]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}})，了解如何创建和应用 pubsub 配置。 有关 Apache Pulsar的更多信息 [请阅读文档](https://pulsar.apache.org/docs/en/concepts-overview/)

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

| 字段                         | 必填 | 详情                                                                                                                                                                                                                                                                                                                                                                      | 示例                                                                                       |
| -------------------------- |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| host                       | 是  | Pulsar broker. 地址， 默认值是 `"localhost:6650"`                                                                                                                                                                                                                                                                                                                              | `"localhost:6650"` OR `"http://pulsar-pj54qwwdpz4b-pulsar.ap-sg.public.pulsar.com:8080"` |
| enableTLS                  | 否  | 启用TLS  默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                   | `"true"`, `"false"`                                                                      |
| token                      | 否  | 启动身份验证                                                                                                                                                                                                                                                                                                                                                                  | [如何创建pulsar token](https://pulsar.apache.org/docs/en/security-jwt/#generate-tokens)      |
| tenant                     | 否  | 实例中的主题租户。 租户对于 Pulsar 中的多租户至关重要，并且分布在集群中。  默认值： `“public”`                                                                                                                                                                                                                                                                                                              | `"public"`                                                                               |
| namespace                  | 否  | 将相关联的 topic 作为一个组来管理，是管理 Topic 的基本单元。  默认值为 `"default"`                                                                                                                                                                                                                                                                                                                 | `"default"`                                                                              |
| persistent                 | 否  | Pulsar 支持两种主题： [持久](https://pulsar.apache.org/docs/en/concepts-architecture-overview#persistent-storage) 和 [非持久](https://pulsar.apache.org/docs/en/concepts-messaging/#non-persistent-topics)。 对于持久化的主题，所有的消息都会被持久化的保存到磁盘当中(如果 broker 不是单机模式，消息会被持久化到多块磁盘)，而非持久化的主题的数据不会被保存到磁盘里面。 注意：默认的重试行为是重试直到成功，所以当你使用非持久主题时，可以通过定义 `backOffMaxRetries` 到 `0`来减少或禁止重试。 默认: `"true"` | `"true"`, `"false"`                                                                      |
| backOffPolicy              | 否  | 重试策略，`"constant"`是一个总是返回相同的退避延迟的退避策略。 `"exponential"` 是一种退避策略，它使用呈指数级增长的随机化函数增加每次重试尝试的退避周期。 默认为 `"constant"`。                                                                                                                                                                                                                                                           | `constant`、`exponential`                                                                 |
| backOffDuration            | 否  | 固定间隔仅在 `backOffPolicy` 为 `"constant"`时生效。 有两种有效的格式，一种是带有单位后缀格式的分数，另一种是以毫秒为单位处理的纯数字格式。 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"5s"`。                                                                                                                                                                                                                            | `"5s"`、`"5000"`                                                                          |
| backOffInitialInterval     | 否  | 重试时的回退初始间隔。 仅在 `backOffPolicy` 为 `"exponential"`时生效。 有两种有效的格式，一种是带有单位后缀格式的分数，另一种是以毫秒为单位处理的纯数字格式。 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认值为 `"500"`                                                                                                                                                                                                                | `"50"`                                                                                   |
| backOffMaxInterval         | 否  | 重试时的回退初始间隔。 仅在 `backOffPolicy` 为 `"exponential"`时生效。 有两种有效的格式，一种是带有单位后缀格式的分数，另一种是以毫秒为单位处理的纯数字格式。 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"60s"`                                                                                                                                                                                                                 | `"60000"`                                                                                |
| backOffMaxRetries          | 否  | 返回错误前重试处理消息的最大次数。 默认为 `"0"` 这意味着组件不会重试处理消息。 `"-1"` 将无限期重试，直到处理完消息或关闭应用程序。 任何正数都被视为最大重试计数。                                                                                                                                                                                                                                                                               | `"3"`                                                                                    |
| backOffRandomizationFactor | 否  | 随机系数，介于 1 和 0 之间，包括 0 但不是 1。 随机间隔 = 重试间隔 * （1 ±backOffRandomizationFactor）。 默认值为 `"0.5"`.                                                                                                                                                                                                                                                                               | `"0.5"`                                                                                  |
| backOffMultiplier          | 否  | 策略的退避倍数。 通过将间隔乘以倍数来递增间隔。 默认值为 `"1.5"`                                                                                                                                                                                                                                                                                                                                   | `"1.5"`                                                                                  |
| backOffMaxElapsedTime      | 否  | 在 MaxElapsedTime 之后，ExponentialBackOff 返回 Stop。 有两种有效的格式，一种是带有单位后缀格式的分数，另一种是以毫秒为单位处理的纯数字格式。 有效的时间单位为"ns"、"us"（或"μs"）、"ms"、"s"、"m"、"h"。 默认为 `"15m"`                                                                                                                                                                                                                      | `"15m"`                                                                                  |
| disableBatching            | 否  | 禁用批处理。 默认值为 `"false"`                                                                                                                                                                                                                                                                                                                                                   | `"true"`, `"false"`                                                                      |

### 延迟队列

当调用 Pulsar 发布/订阅时，在请求 url 中使用 `metadata` 查询参数来提供一个可选的延迟队列时可行的。

可选参数的名称为 `metadata.deliverAt` 或 `metadata.deliverAfter`
- `deliverAt`: 延迟消息以在指定的时间投递 (RFC3339 格式)，例如 `"2021-09-01T10:00:00Z"`
- `deliverAfter`:延迟消息在指定的时间后进行投递，例如 `"4h5m3s"`

示例:

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
