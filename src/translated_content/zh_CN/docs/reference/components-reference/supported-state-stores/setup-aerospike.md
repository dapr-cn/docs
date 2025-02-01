---
type: docs
title: "Aerospike"
linkTitle: "Aerospike"
description: 详细介绍 Aerospike 状态存储组件
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-aerospike/"
---

## 组件格式

要配置 Aerospike 状态存储，请创建一个类型为 `state.Aerospike` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.Aerospike
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS> # 必需。以逗号分隔的主机字符串。例如："aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # 必需。Aerospike 命名空间。
  - name: set
    value: <REPLACE-WITH-SET> # 可选
```

{{% alert title="警告" color="warning" %}}
上述示例使用未加密的字符串作为 secret。建议使用 secret 存储来保护 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 配置元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| hosts              | Y        | 数据库服务器的主机名/端口  | `"localhost:3000"`, `"aerospike:3000,aerospike2:3000"`
| namespace          | Y        | Aerospike 命名空间 | `"namespace"`
| set                | N        | 数据库中的 setName  | `"myset"`

## 设置 Aerospike

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Aerospike：

```
docker run -d --name aerospike -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 aerospike
```

然后，您可以通过 `localhost:3000` 与服务器进行交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装 Aerospike 的最简单方法是使用 [Helm chart](https://github.com/helm/charts/tree/master/stable/aerospike)：

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install --name my-aerospike --namespace aerospike stable/aerospike
```

这将把 Aerospike 安装到 `aerospike` 命名空间中。
要与 Aerospike 交互，请使用以下命令查找服务：`kubectl get svc aerospike -n aerospike`。

例如，如果使用上述示例进行安装，Aerospike 主机地址将是：

`aerospike-my-aerospike.aerospike.svc.cluster.local:3000`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
