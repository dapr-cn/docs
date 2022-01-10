---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "关于Pulsar pubsub组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-pulsar/"
---

## 配置
要设置Pulsar pubsub，请创建一个`pubsub.pulsar`类型的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
```

## 元数据字段规范

| 字段        | 必填 | 详情                                         | 示例                  |
| --------- |:--:| ------------------------------------------ | ------------------- |
| host      | Y  | Pulsar broker. 地址， 默认值是 `"localhost:6650"` | `"localhost:6650"`  |
| enableTLS | N  | 启用TLS  默认值为 `"false"`                      | `"true"`, `"false"` |


### Delay queue

When invoking the Pulsar pub/sub, it's possible to provide an optional delay queue by using the `metadata` query parameters in the request url.

These optional parameter names are `metadata.deliverAt` or `metadata.deliverAfter`:
- `deliverAt`: Delay message to deliver at a specified time (RFC3339 format), e.g. `"2021-09-01T10:00:00Z"`
- `deliverAfter`: Delay message to deliver after a specified amount of time, e.g.`"4h5m3s"`

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

Or

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
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})
