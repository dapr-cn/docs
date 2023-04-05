---
type: docs
title: "JetStream KV"
linkTitle: "JetStream KV"
description: 关于JetStream KV状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-nats-jetstream-kv/"
---

## Component format

要设置 JetStream KV 状态储存，请创建一个类型为 `state.jetstream`的组件。 See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field   | 必填 | 详情                      | 示例                               |
| ------- |:--:| ----------------------- | -------------------------------- |
| natsURL | 是  | NATS server address URL | "`nats://localhost:4222`"        |
| jwt     | 否  | NATS 去中心化身份验证 JWT       | "`eyJhbGciOiJ...6yJV_adQssw5c`"  |
| seedKey | 否  | NATS 去中心化身份验证秘钥种子。      | "`SUACS34K232O...5Z3POU7BNIL4Y`" |
| bucket  | 是  | JetStream KV 桶名称        | `"<bucketName>"`           |

## 创建NATS服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用 Docker 在本地启用 JetStream 运行 NATS 服务器：

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以使用 `localhost:4222` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
使用 [helm](https://github. com/nats-io/k8s/tree/main/helm/charts/nats#jetstream)在 Kubernetes 上安装 NATS JetStream：

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats
```

在`default` 命名空间安装单进程NATS服务。 要与NATS进行交互，请使用以下方法找到服务：`kubectl get svc my-nats`.
{{% /codetab %}}

{{< /tabs >}}

## 创建 JetStream KV 存储桶

有必要创建一个键值存储桶，这可以通过 NATS CLI 轻松完成。

```bash
nats kv add <bucketName>
```

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [JetStream 文档](https://docs.nats.io/nats-concepts/jetstream)
- [键值对存储温度](https://docs.nats.io/nats-concepts/jetstream/key-value-store)
- [NATCLI](https://github.com/nats-io/natscli)
