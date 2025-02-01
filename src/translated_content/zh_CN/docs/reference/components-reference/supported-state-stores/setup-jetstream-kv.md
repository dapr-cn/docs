---
type: docs
title: "JetStream KV"
linkTitle: "JetStream KV"
description: JetStream KV 状态存储组件的详细介绍
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-nats-jetstream-kv/"
---

## 组件格式

要设置 JetStream KV 状态存储，请创建一个类型为 `state.jetstream` 的组件。有关如何创建和应用状态存储配置的详细步骤，请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})。

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
    value: "eyJhbGciOiJ...6yJV_adQssw5c" # 可选。用于分布式 JWT 认证
  - name: seedKey
    value: "SUACS34K232O...5Z3POU7BNIL4Y" # 可选。用于分布式 JWT 认证
  - name: bucket
    value: "<bucketName>"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为 secret。建议使用 secret 存储来保护这些信息，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| natsURL            |  是  | NATS 服务器地址 URL | "`nats://localhost:4222`"|
| jwt                |  否  | 用于分布式认证的 NATS JWT | "`eyJhbGciOiJ...6yJV_adQssw5c`"|
| seedKey            |  否  | 用于分布式认证的 NATS 种子密钥 | "`SUACS34K232O...5Z3POU7BNIL4Y`"|
| bucket             |  是  | JetStream KV 桶名称 | `"<bucketName>"`|

## 创建 NATS 服务器

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
您可以使用 Docker 在本地运行启用 JetStream 的 NATS 服务器：

```bash
docker run -d -p 4222:4222 nats:latest -js
```

然后，您可以通过客户端端口与服务器交互：`localhost:4222`。
{{% /codetab %}}

{{% codetab %}}
通过使用 [helm](https://github.com/nats-io/k8s/tree/main/helm/charts/nats#jetstream) 在 Kubernetes 上安装 NATS JetStream：

```bash
helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install my-nats nats/nats
```

这会在 `default` 命名空间中安装 NATS 服务器。要与 NATS 交互，请使用以下命令查找服务：`kubectl get svc my-nats`。
{{% /codetab %}}

{{< /tabs >}}

## 创建 JetStream KV 桶

需要创建一个键值桶，这可以通过 NATS CLI 轻松完成。

```bash
nats kv add <bucketName>
```

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [JetStream 文档](https://docs.nats.io/nats-concepts/jetstream)
- [键值存储文档](https://docs.nats.io/nats-concepts/jetstream/key-value-store)
- [NATS CLI](https://github.com/nats-io/natscli)