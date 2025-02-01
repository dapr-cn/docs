---
type: docs
title: "Etcd"
linkTitle: "Etcd"
description: Etcd 状态存储组件的详细介绍
aliases:
- "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-etcd/"
---

## 组件格式

要配置 Etcd 状态存储，需创建一个类型为 `state.etcd` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.etcd
  # 支持 v1 和 v2。建议默认使用 v2。请注意，v1 和 v2 之间没有直接的迁移路径，详情请参见下文的 `版本控制`。
  version: v2
  metadata:
  - name: endpoints
    value: <CONNECTION STRING> # 必需。示例：192.168.0.1:2379,192.168.0.2:2379,192.168.0.3:2379
  - name: keyPrefixPath
    value: <KEY PREFIX STRING> # 可选。默认值：""。示例："dapr"
  - name: tlsEnable
    value: <ENABLE TLS> # 可选。示例："false"
  - name: ca
    value: <CA> # 可选。如果 tlsEnable 为 `true`，则必需。
  - name: cert
    value: <CERT> # 可选。如果 tlsEnable 为 `true`，则必需。
  - name: key
    value: <KEY> # 可选。如果 tlsEnable 为 `true`，则必需。
  # 如果希望将 Etcd 用作 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议按照[此处]({{< ref component-secrets.md >}})的说明使用 secret 存储。
{{% /alert %}}

### 版本控制

Dapr 提供了两个版本的 Etcd 状态存储组件：`v1` 和 `v2`。建议使用 `v2`，因为 `v1` 已被弃用。

虽然 `v1` 和 `v2` 使用相同的元数据字段，但在使用 Dapr v1.12 的 [actor TTLs]({{< ref "actors_api.md#ttl" >}}) 时，`v1` 可能会导致应用程序中的数据不一致。
`v1` 和 `v2` 之间不兼容，且在现有的 Etcd 集群和 `keyPrefixPath` 上没有从 `v1` 到 `v2` 的数据迁移路径。
如果您当前使用的是 `v1`，建议继续使用，直到您创建一个新的 Etcd 集群或使用不同的 `keyPrefixPath`。

## 规格元数据字段

| 字段              | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| `endpoints`        | Y        | Etcd 集群的连接字符串 | `"192.168.0.1:2379,192.168.0.2:2379,192.168.0.3:2379"`
| `keyPrefixPath`    | N        | Etcd 中的键前缀路径。默认没有前缀。 | `"dapr"`
| `tlsEnable`        | N        | 是否启用 TLS 连接到 Etcd。 | `"false"`
| `ca`               | N        | 连接到 Etcd 的 CA 证书，PEM 编码。可以是 `secretKeyRef` 以使用[secret 引用]({{< ref component-secrets.md >}})。| `"-----BEGIN CERTIFICATE-----\nMIIC9TCCA..."`
| `cert`             | N        | 连接到 Etcd 的 TLS 证书，PEM 编码。可以是 `secretKeyRef` 以使用[secret 引用]({{< ref component-secrets.md >}})。| `"-----BEGIN CERTIFICATE-----\nMIIDUTCC..."`
| `key`              | N        | 连接到 Etcd 的 TLS 密钥，PEM 编码。可以是 `secretKeyRef` 以使用[secret 引用]({{< ref component-secrets.md >}})。| `"-----BEGIN PRIVATE KEY-----\nMIIEpAIB..."`
| `actorStateStore`    | N        | 将此状态存储视为 actor 的状态存储。默认为 `"false"` | `"true"`, `"false"`

## 设置 Etcd

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}

您可以使用 Docker Compose 在本地运行 Etcd 数据库。创建一个名为 `docker-compose.yml` 的新文件，并添加以下内容作为示例：

```yaml
version: '2'
services:
  etcd:
    image: gcr.io/etcd-development/etcd:v3.4.20
    ports:
      - "2379:2379"
    command: etcd --listen-client-urls http://0.0.0.0:2379 --advertise-client-urls http://0.0.0.0:2379```
```

保存 `docker-compose.yml` 文件并运行以下命令以启动 Etcd 服务器：

```sh
docker-compose up -d
```

这将在后台启动 Etcd 服务器并暴露默认的 Etcd 端口 `2379`。然后，您可以使用 `etcdctl` 命令行客户端在 `localhost:12379` 上与服务器交互。例如：

```sh
etcdctl --endpoints=localhost:2379 put mykey myvalue
```

{{% /codetab %}}

{{% codetab %}}

使用 [Helm](https://helm.sh/) 快速在您的 Kubernetes 集群中创建一个 Etcd 实例。此方法需要[安装 Helm](https://github.com/helm/helm#install)。

按照 [Bitnami 指南](https://github.com/bitnami/charts/tree/main/bitnami/etcd)开始在 Kubernetes 中设置 Etcd。

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})