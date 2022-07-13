---
type: docs
title: "JetStream KV"
linkTitle: "JetStream KV"
description: Detailed information on the JetStream KV state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-nats-jetstream-kv/"
---

## 配置

To setup a JetStream KV state store create a component of type `state.jetstream`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.jetstream
  version: v1
  metadata:
  - name: natsURL
    value: "nats://localhost:4222"
  - name: jwt
    value: "eyJhbGciOiJ...6yJV_adQssw5c" # Optional. Used for decentralized JWT authentication
  - name: seedKey
    value: "SUACS34K232O...5Z3POU7BNIL4Y" # Optional. Used for decentralized JWT authentication
  - name: bucket
    value: "<bucketName>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## Spec metadatafield

| 字段      | 必填 | 详情                                         | 示例                               |
| ------- |:--:| ------------------------------------------ | -------------------------------- |
| natsURL | Y  | NATS 服务器地址 URL                             | "`nats://localhost:4222`"        |
| jwt     | N  | NATS decentralized authentication JWT      | "`eyJhbGciOiJ...6yJV_adQssw5c`"  |
| seedKey | N  | NATS decentralized authentication seed key | "`SUACS34K232O...5Z3POU7BNIL4Y`" |
| bucket  | Y  | JetStream KV bucket name                   | `"<bucketName>"`           |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
You can run a NATS Server with JetStream enabled locally using Docker:

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以使用 `localhost:4222` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
Install NATS JetStream on Kubernetes by using the [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream):

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats
```

This installs a single NATS server into the `default` namespace. To interact with NATS, find the service with: `kubectl get svc my-nats`.
{{% /codetab %}}

{{< /tabs >}}

## Creating a JetStream KV bucket

It is necessary to create a key value bucket, this can easily done via NATS CLI.

```bash
nats kv add <bucketName>
```

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [JetStream Documentation](https://docs.nats.io/nats-concepts/jetstream)
- [Key Value Store Documentation](https://docs.nats.io/nats-concepts/jetstream/key-value-store)
- [NATS CLI](https://github.com/nats-io/natscli)
