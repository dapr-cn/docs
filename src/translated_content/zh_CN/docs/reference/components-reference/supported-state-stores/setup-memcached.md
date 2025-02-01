---
type: docs
title: "Memcached"
linkTitle: "Memcached"
description: Memcached 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-memcached/"
---

## 组件格式

要配置 Memcached 状态存储，需创建一个类型为 `state.memcached` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})以了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.memcached
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-COMMA-DELIMITED-ENDPOINTS> # 必需。示例: "memcached.default.svc.cluster.local:11211"
  - name: maxIdleConnections
    value: <REPLACE-WITH-MAX-IDLE-CONNECTIONS> # 可选。默认值: "2"
  - name: timeout
    value: <REPLACE-WITH-TIMEOUT> # 可选。默认值: "1000"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段               | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| hosts              | Y    | 逗号分隔的端点 | `"memcached.default.svc.cluster.local:11211"`
| maxIdleConnections | N    | 最大空闲连接数。默认为 `"2"` | `"3"`
| timeout            | N    | 调用的超时时间（毫秒）。默认为 `"1000"` | `"1000"`

## 设置 Memcached

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Memcached：

```
docker run --name my-memcache -d memcached
```

然后可以通过 `localhost:11211` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Memcached 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/memcached)：

```
helm install memcached stable/memcached
```

这会将 Memcached 安装到 `default` 命名空间中。
要与 Memcached 交互，请使用以下命令查找服务：`kubectl get svc memcached`。

例如，如果使用上述示例进行安装，Memcached 主机地址将是：

`memcached.default.svc.cluster.local:11211`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
