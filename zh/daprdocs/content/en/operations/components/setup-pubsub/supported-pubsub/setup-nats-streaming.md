---
type: docs
title: "NATS streaming"
linkTitle: "NATS streaming"
description: "NATS pubsub 组件详细文档"
---

## 安装 NATS

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

这将把一个 NATS-Streaming 和 NATS 安装到 `default` 命名空间。 To interact with NATS, find the service with: `kubectl get svc stan`.

如果使用上面的示例进行安装，那么 NATS Streaming 的请求地址将是:

`<YOUR-HOST>:4222`
{{% /codetab %}}

{{< /tabs >}}

## 创建 Dapr 组件

下一步是该 NATS - Streaming 创建 Dapr 组件描述的 Yaml 文件, 以供 Dapr 装载该 pubsub 组件。

创建 `nats-stan.yaml` YAML 文件, 内容如下:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: pubsub.natsstreaming
  version: v1
  metadata:
  - name: natsURL
    value: <REPLACE-WITH-NATS-SERVER-ADDRESS> # Required. example nats://localhost:4222
  - name: natsStreamingClusterID
    value: <REPLACE-WITH-NATS-CLUSTERID> # Required.
    # blow are subscription configuration.
  - name: subscriptionType
    value: <REPLACE-WITH-SUBSCRIPTION-TYPE> # Required. Allowed values: topic, queue.
  # - name: ackWaitTime
    # value: "" # Optional. See: https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements
  # - name: maxInFlight
    # value: "" # Optional. See: https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements
  # - name: durableSubscriptionName
  #   value: ""
  # following subscription options - only one can be used
  # - name: startAtSequence
    # value: 1
  # - name: startWithLastReceived
    # value: false
  - name: deliverAll
    value: true
  # - name: deliverNew
  #   value: false
  # - name: startAtTimeDelta
  #   value: ""
  # - name: startAtTime
  #   value: ""
  # - name: startAtTimeFormat
  #   value: "" example nats://localhost:4222
  - name: natsStreamingClusterID
    value: <REPLACE-WITH-NATS-CLUSTERID> # Required.
    # blow are subscription configuration.
  - name: subscriptionType
    value: <REPLACE-WITH-SUBSCRIPTION-TYPE> # Required. Allowed values: topic, queue.
  # - name: ackWaitTime
    # value: "" # Optional. See: https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements
  # - name: maxInFlight
    # value: "" # Optional. See: https://docs.nats.io/developing-with-nats-streaming/acks#acknowledgements
  # - name: durableSubscriptionName
  #   value: ""
  # following subscription options - only one can be used
  # - name: startAtSequence
    # value: 1
  # - name: startWithLastReceived
    # value: false
  - name: deliverAll
    value: true
  # - name: deliverNew
  #   value: false
  # - name: startAtTimeDelta
  #   value: ""
  # - name: startAtTime
  #   value: ""
  # - name: startAtTimeFormat
  #   value: ""
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## 应用配置

请访问 [本指南]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) ，了解如何配置 pub/sub 组件。

## 相关链接
- [Pub/Sub building block]({{< ref pubsub >}})
