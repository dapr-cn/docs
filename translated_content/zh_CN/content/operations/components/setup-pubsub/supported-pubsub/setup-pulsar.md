---
type: docs
title: "Pulsar"
linkTitle: "Pulsar"
description: "关于Pulsar pubsub组件的详细文档"
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

| 字段        | 必填 | 详情                                         | Example             |
| --------- |:--:| ------------------------------------------ | ------------------- |
| host      | Y  | Pulsar broker. 地址， 默认值是 `"localhost:6650"` | `"localhost:6650"`  |
| enableTLS | Y  | 启用TLS  默认值为 `"false"`                      | `"true"`, `"false"` |


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