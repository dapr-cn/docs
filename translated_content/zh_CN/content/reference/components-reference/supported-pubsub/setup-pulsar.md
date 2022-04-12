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
  - name: token
    value: "eyJrZXlJZCI6InB1bHNhci1wajU0cXd3ZHB6NGIiLCJhbGciOiJIUzI1NiJ9.eyJzd"
```

## 元数据字段规范

| 字段        | 必填 | 详情                                         | 示例                                                                                            |
| --------- |:--:| ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| host      | Y  | Pulsar broker. 地址， 默认值是 `"localhost:6650"` | `"localhost:6650"` OR `"http://pulsar-pj54qwwdpz4b-pulsar.ap-sg.public.pulsar.com:8080"`      |
| enableTLS | 否  | 启用TLS  默认值为 `"false"`                      | `"true"`, `"false"`                                                                           |
| token     | 否  | Enable Authentication.                     | [How to create pulsar token](https://pulsar.apache.org/docs/en/security-jwt/#generate-tokens) |


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
