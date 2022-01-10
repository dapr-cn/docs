---
type: docs
title: "Aerospike"
linkTitle: "Aerospike"
description: 关于Aerospike状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-aerospike/"
---

## 配置

要设置Aerospike 状态存储，请创建一个类型为`state.Aerospike`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.Aerospike
  version: v1
  metadata:
  - name: hosts
    value: <REPLACE-WITH-HOSTS> # Required. 逗号分隔的服务器地址 Example: "aerospike:3000,aerospike2:3000"
  - name: namespace
    value: <REPLACE-WITH-NAMESPACE> # Required. The aerospike namespace.
  - name: set
    value: <REPLACE-WITH-SET> # Optional
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段        | 必填 | 详情              | 示例                                                     |
| --------- |:--:| --------------- | ------------------------------------------------------ |
| hosts     | Y  | 数据库服务器主机名/端口    | `"localhost:3000"`, `"aerospike:3000,aerospike2:3000"` |
| namespace | Y  | Aerospike 命名空间。 | `"namespace"`                                          |
| set       | N  | 数据库中的 setname   | `"myset"`                                              |

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
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
