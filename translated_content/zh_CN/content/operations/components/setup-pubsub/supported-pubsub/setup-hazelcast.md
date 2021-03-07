---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: "Detailed documentation on the Hazelcast pubsub component"
---

## Component format
To setup hazelcast pubsub create a component of type `pubsub.hazelcast`. To setup Redis Streams pubsub create a component of type `pubsub.redis`. See [this guide]({{< ref "howto-publish-subscribe.md#step-1-setup-the-pubsub-component" >}}) on how to create and apply a pubsub configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: hazelcast-pubsub
  namespace: default
spec:
  type: pubsub.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: "hazelcast:3000,hazelcast2:3000"
```

{{% alert title="Warning" color="warning" %}}
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段               | Required | Details                                                                                                                  | Example                            |
| ---------------- |:--------:| ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------- |
| connectionString |    Y     | A comma delimited string of servers. Example: "hazelcast:3000,hazelcast2:3000" Example: "hazelcast:3000,hazelcast2:3000" | `"hazelcast:3000,hazelcast2:3000"` |


## Create a Hazelcast instance

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run Hazelcast locally using Docker:

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

You can then interact with the server using the `127.0.0.1:5701`.
{{% /codetab %}}

{{% codetab %}}
The easiest way to install Hazelcast on Kubernetes is by using the [Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast).
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- Read [this guide]({{< ref "howto-publish-subscribe.md#step-2-publish-a-topic" >}}) for instructions on configuring pub/sub components
- [Pub/Sub building block]({{< ref pubsub >}})