---
type: docs
title: "Hazelcast"
linkTitle: "Hazelcast"
description: Hazelcast 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-hazelcast/"
---

## 创建一个 Dapr 组件

要配置 Hazelcast 状态存储，请创建一个类型为 `state.hazelcast` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.hazelcast
  version: v1
  metadata:
  - name: hazelcastServers
    value: <REPLACE-WITH-HOSTS> # 必需。服务器地址的逗号分隔字符串。例如："hazelcast:3000,hazelcast2:3000"
  - name: hazelcastMap
    value: <REPLACE-WITH-MAP> # 必需。Hazelcast map 的配置。
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示 secret。建议使用 secret 存储来保护这些信息，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段               | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| hazelcastServers   | 是   | 服务器地址的逗号分隔字符串 | `"hazelcast:3000,hazelcast2:3000"`
| hazelcastMap       | 是   | Hazelcast map 的配置 | `"foo-map"`

## 设置 Hazelcast

{{< tabs "自托管" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Hazelcast：

```
docker run -e JAVA_OPTS="-Dhazelcast.local.publicAddress=127.0.0.1:5701" -p 5701:5701 hazelcast/hazelcast
```

然后您可以使用 `127.0.0.1:5701` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Hazelcast 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/hazelcast)。
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
