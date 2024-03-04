---
type: docs
title: "NATS Streaming"
linkTitle: "NATS Streaming"
description: "NATS Streaming pubsub 组件详细文档"
aliases:
  - "/zh-hans/operations/components/setup-pubsub/supported-pubsub/setup-nats-streaming/"
---

## ⚠️ Deprecation notice

{{% alert title="Warning" color="warning" %}}
This component is **deprecated** because the [NATS Streaming Server](https://nats-io.gitbook.io/legacy-nats-docs/nats-streaming-server-aka-stan/developing-with-stan) was deprecated in June 2023 and no longer receives updates. Users are encouraged to switch to using [JetStream]({{< ref setup-jetstream >}}) as an alternative.

This component will be **removed in the Dapr v1.13 release**.
{{% /alert %}}

## Component format

要设置NATS Streaming pubsub，请创建类型为 `pubsub.natsstreaming` 的组件。 See the [pub/sub broker component file]({{< ref setup-pubsub.md >}}) to learn how ConsumerID is automatically generated. Read the [How-to: Publish and Subscribe guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pub/sub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: natsstreaming-pubsub
spec:
  type: pubsub.natsstreaming
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: natsStreamingClusterID
    value: "clusterId"
  - name: concurrencyMode
    value: parallel
  - name: consumerID # Optional. If not supplied, runtime will create one.
    value: "channel1" 
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
以上示例将密钥明文存储， 建议 [为秘钥使用secret store]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                   | Required | 详情                                                                                                                                                                                                                                                                                                                                      | 示例                              |
| ----------------------- |:--------:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| natsURL                 |    是     | NATS server address URL                                                                                                                                                                                                                                                                                                                 | "`nats://localhost:4222`"       |
| natsStreamingClusterID  |    是     | NATS 集群 ID                                                                                                                                                                                                                                                                                                                              | `"clusterId"`                   |
| subscriptionType        |    是     | 订阅类型， 订阅类型， 允许的值`"topic"`，`"queue"`                                                                                                                                                                                                                                                                                                     | `"topic"`                       |
| consumerID              |    否     | Consumer ID (consumer tag) organizes one or more consumers into a group. Consumers with the same consumer ID work as one virtual consumer; for example, a message is processed only once by one of the consumers in the group. If the `consumerID` is not provided, the Dapr runtime set it to the Dapr application ID (`appID`) value. | `"channel1"`                    |
| ackWaitTime             |    否     | 见[这里](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements)                                                                                                                                                                                                                                                        | `"300ms"`                       |
| maxInFlight             |    否     | 见[这里](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements)                                                                                                                                                                                                                                                        | `"25"`                          |
| durableSubscriptionName |    否     | [持久订阅](https://docs.nats.io/developing-with-nats-streaming/durables)识别名称                                                                                                                                                                                                                                                                | `"my-durable"`                  |
| deliverNew              |    否     | 订阅策略： 只能使用一个， 订阅策略： 只能使用一个， 只发送新消息                                                                                                                                                                                                                                                                                                      | `"true"`, `"false"`             |
| startAtSequence         |    否     | 订阅策略： 只能使用一个， 设置期望的起始序列位置和状态                                                                                                                                                                                                                                                                                                            | `"100000"`, `"230420"`          |
| startWithLastReceived   |    否     | 订阅策略： 只能使用一个， 将起始位置设置为最后接收的位置                                                                                                                                                                                                                                                                                                           | `"true"`, `"false"`             |
| deliverAll              |    否     | 订阅策略： 只能使用一个， 传递所有可用消息                                                                                                                                                                                                                                                                                                                  | `"true"`, `"false"`             |
| startAtTimeDelta        |    否     | 订阅策略： 只能使用一个， 使用增量设置所需的起始时间位置和状态                                                                                                                                                                                                                                                                                                        | `"10m"`, `"23s"`                |
| startAtTime             |    否     | 订阅策略： 只能使用一个， 设置所需的起始时间位置和状态                                                                                                                                                                                                                                                                                                            | `"Feb 3, 2013 at 7:54pm (PST)"` |
| startAtTimeFormat       |    否     | 必须与`startAtTime`一起使用， 设置时间的格式 设置时间的格式                                                                                                                                                                                                                                                                                                   | `"Jan 2, 2006 at 3:04pm (MST)"` |
| concurrencyMode         |    否     | Call the subscriber sequentially (“single” message at a time), or concurrently (in “parallel”). Default: `"parallel"`                                                                                                                                                                                                                   | `"single"`, `"parallel"`        |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
在本地使用 Docker运行NATS 服务器：

```bash
docker run -d --name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming
```

使用客户端端口与服务器交互： `localhost:4222`。
{{% /codetab %}}

{{% codetab %}}
Install NATS on Kubernetes by using the [kubectl](https://docs.nats.io/running-a-nats-service/introduction/running/nats-kubernetes/):

```bash
# Single server NATS

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-server/single-server-nats.yml

kubectl apply -f https://raw.githubusercontent.com/nats-io/k8s/master/nats-streaming-server/single-server-stan.yml
```

这将单个NATS-Streaming和Nats安装到`default`命名空间。 要与 NATS 交互，请使用以下命令查找服务：

```bash
kubectl get svc stan
```

例如，如果使用上面的例子安装， NATS Streaming地址是：

`<YOUR-HOST>:4222`

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})。
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components.
- [Pub/Sub 构建块]({{< ref pubsub >}})。
- [NATS 流式处理弃用通知](https://github.com/nats-io/nats-streaming-server/#warning--deprecation-notice-warning)。
