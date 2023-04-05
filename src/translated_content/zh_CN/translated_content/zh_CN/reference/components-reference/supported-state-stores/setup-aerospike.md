---
type: docs
title: "Aerospike"
linkTitle: "Aerospike"
description: 关于Aerospike状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-aerospike/"
---

## Component format

To setup Aerospike state store create a component of type `state.Aerospike`. See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

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
    value: <REPLACE-WITH-HOSTS> # Required. A comma delimited string of hosts. Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field     | 必填 | 详情                                | 示例                                                     |
| --------- |:--:| --------------------------------- | ------------------------------------------------------ |
| hosts     | 是  | Host name/port of database server | `"localhost:3000"`, `"aerospike:3000,aerospike2:3000"` |
| namespace | 是  | Aerospike 命名空间。                   | `"namespace"`                                          |
| set       | 否  | 数据库中的 setName                     | `"myset"`                                              |

## 安装Aerospike

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
您可以使用 Docker 在本地运行 Aerospike ：

```
docker run -d --name aerospike -p 3000:3000 -p 3001:3001 -p 3002:3002 -p 3003:3003 aerospike
```

然后您可以使用 `localhost:3000` 与服务器交互。
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 上安装Aerospike 最简单的方法是使用[Helm chart](https://github.com/helm/charts/tree/master/stable/aerospike)：

```
helm repo add incubator http://storage.googleapis.com/kubernetes-charts-incubator
helm install --name my-aerospike --namespace aerospike stable/aerospike
```

这将把Aerospike安装到`aerospike`命名空间。 要与Aerospike交互，请使用以下方法找到服务：`kubectl get svc aerospike -n aerospike`。

例如，如果使用上面的例子安装，Aerospike 主机地址将是：

`aerospike-my-aerospike.aerospike.svc.cluster.local:3000`
{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
