---
type: docs
title: "NATS Streaming"
linkTitle: "NATS Streaming"
description: "NATS Streaming pubsub 组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-nats-streaming/"
---

## 配置
要设置NATS Streaming pubsub，请创建类型为 `pubsub.natsstreaming` 的组件。 See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: natsstreaming-pubsub
  namespace: default
spec:
  type: pubsub.natsstreaming
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: natsStreamingClusterID
    value: "clusterId"
    # below are subscription configuration.
  - name: subscriptionType
    value: <REPLACE-WITH-SUBSCRIPTION-TYPE> # Required. Allowed values: topic, queue.
  - name: ackWaitTime
    value: "" # Optional.
  - name: maxInFlight
    value: "" # Optional.
  - name: durableSubscriptionName
    value: "" # Optional.
  # following subscription options - only one can be used
  - name: deliverNew
    value: <bool>
  - name: startAtSequence
    value: 1
  - name: startWithLastReceived
    value: false
  - name: deliverAll
    value: false
  - name: startAtTimeDelta
    value: ""
  - name: startAtTime
    value: ""
  - name: startAtTimeFormat
    value: ""
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

{{% alert title="Warning" color="warning" %}}
NATS Streaming has been [deprecated](https://github.com/nats-io/nats-streaming-server/#warning--deprecation-notice-warning). Please consider using [NATS JetStream]({{< ref setup-jetstream >}}) going forward.
{{% /alert %}}

## 元数据字段规范

| 字段                      | 必填 | 详情                                                                               | Example                         |
| ----------------------- |:--:| -------------------------------------------------------------------------------- | ------------------------------- |
| natsURL                 | Y  | NATS 服务器地址 URL                                                                   | "`nats://localhost:4222`"       |
| natsStreamingClusterID  | Y  | NATS cluster ID                                                                  | `"clusterId"`                   |
| subscriptionType        | Y  | 订阅类型， 订阅类型， 允许的值`"topic"`，`"queue"`                                              | `"topic"`                       |
| ackWaitTime             | N  | 见[这里](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements) | `"300ms"`                       |
| maxInFlight             | N  | 见[这里](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements) | `"25"`                          |
| durableSubscriptionName | N  | [持久订阅](https://docs.nats.io/developing-with-nats-streaming/durables)识别名称         | `"my-durable"`                  |
| deliverNew              | N  | 订阅策略： 只能使用一个， 订阅策略： 只能使用一个， 只发送新消息                                               | `"true"`, `"false"`             |
| startAtSequence         | N  | 订阅策略： 只能使用一个， 设置期望的起始序列位置和状态                                                     | `"100000"`, `"230420"`          |
| startWithLastReceived   | N  | 订阅策略： 只能使用一个， 将起始位置设置为最后接收的位置                                                    | `"true"`, `"false"`             |
| deliverAll              | N  | 订阅策略： 只能使用一个， 传递所有可用消息                                                           | `"true"`, `"false"`             |
| startAtTimeDelta        | N  | 订阅策略： 只能使用一个， 使用增量设置所需的起始时间位置和状态                                                 | `"10m"`, `"23s"`                |
| startAtTime             | N  | 订阅策略： 只能使用一个， 设置所需的起始时间位置和状态                                                     | `"Feb 3, 2013 at 7:54pm (PST)"` |
| startAtTimeDelta        | N  | 必须与`startAtTime`一起使用， 设置时间的格式 设置时间的格式                                            | `"Jan 2, 2006 at 3:04pm (MST)"` |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以在本地使用 Docker运行NATS 服务器：

```bash
docker run -d --name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming
```

然后，您可以使用 `localhost:4222` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
使用 [kubectl](https://docs.nats.io/nats-on-kubernetes/minimal-setup) 在 Kubernetes 上安装 NATS:

```bash
# Single server NATS

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-streaming-server/single-server-stan.yml
```

这将单个NATS-Streaming和Nats安装到`default`命名空间。 要与NATS进行交互，请使用以下方法找到服务：`kubectl get svc stan`.

例如，如果使用上面的例子安装， NATS Streaming地址是：

`<YOUR-HOST>:4222`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [发布/订阅构建块]({{< ref pubsub >}})
- [NATS Streaming Deprecation Notice](https://github.com/nats-io/nats-streaming-server/#warning--deprecation-notice-warning)
