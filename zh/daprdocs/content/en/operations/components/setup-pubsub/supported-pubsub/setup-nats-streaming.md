---
type: docs
title: "NATS Streaming"
linkTitle: "NATS Streaming"
description: "Detailed documentation on the NATS Streaming pubsub component"
---

## Component format
To setup NATS Streaming pubsub create a component of type `pubsub.natsstreaming`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

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
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段                      | Required | Details                                                                                                                                                | 示例                              |
| ----------------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| natsURL                 |    Y     | NATS server address URL                                                                                                                                | "`nats://localhost:4222`"       |
| natsStreamingClusterID  |    Y     | NATS cluster ID                                                                                                                                        | `"clusterId"`                   |
| subscriptionType        |    Y     | Subscription type. Subscription type. Allowed values `"topic"`, `"queue"`                                                                              | `"topic"`                       |
| ackWaitTime             |    N     | See [here](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements)                                                                  | `"300ms"`                       |
| maxInFlight             |    N     | See [here](https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements)                                                                  | `"25"`                          |
| durableSubscriptionName |    N     | [Durable subscriptions](https://docs.nats.io/developing-with-nats-streaming/durables) identification name.                                             | `"my-durable"`                  |
| deliverNew              |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Deliver new messages only                                      | `"true"`, `"false"`             |
| startAtSequence         |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Sets the desired start sequence position and state             | `"100000"`, `"230420"`          |
| startWithLastReceived   |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Sets the start position to last received.                      | `"true"`, `"false"`             |
| deliverAll              |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Deliver all available messages                                 | `"true"`, `"false"`             |
| startAtTimeDelta        |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Sets the desired start time position and state using the delta | `"10m"`, `"23s"`                |
| startAtTime             |    N     | Subscription Options. Only one can be used. Subscription Options. Only one can be used. Sets the desired start time position and state                 | `"Feb 3, 2013 at 7:54pm (PST)"` |
| startAtTimeDelta        |    N     | Must be used with `startAtTime`. Sets the format for the time Sets the format for the time                                                             | `"Jan 2, 2006 at 3:04pm (MST)"` |

## Create a NATS server

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以在本地使用 Docker运行NATS 服务器：

```bash
docker run -d -name nats-streaming -p 4222:4222 -p 8222:8222 nats-streaming
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

This installs a single NATS-Streaming and Nats into the `default` namespace. To interact with NATS, find the service with: `kubectl get svc stan`. To interact with NATS, find the service with: `kubectl get svc stan`.

如果使用上面的示例进行安装，那么 NATS Streaming 的请求地址将是:

`<YOUR-HOST>:4222`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})
