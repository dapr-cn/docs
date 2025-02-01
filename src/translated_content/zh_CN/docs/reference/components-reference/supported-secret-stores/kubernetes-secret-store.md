---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: 详细介绍 Kubernetes secret 存储组件
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## 默认 Kubernetes secret 存储组件

在 Dapr 部署到 Kubernetes 集群时，系统会自动配置一个名为 `kubernetes` 的 secret 存储。这个预配置的 secret 存储允许开发人员直接使用 Kubernetes 的原生 secret 存储，而无需编写、部署或维护额外的组件配置文件，这对于希望简单地访问 Kubernetes 集群中 secret 的开发人员非常有用。

您仍然可以配置一个自定义的 Kubernetes secret 存储组件定义文件（详见下文）。通过自定义定义，您可以将代码中对 secret 存储的引用与托管平台解耦，因为存储名称可以自定义，不是固定的，这样可以使代码更通用和可移植。此外，通过显式定义 Kubernetes secret 存储组件，您可以从本地 Dapr 自托管安装连接到 Kubernetes secret 存储。这需要一个有效的 [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 文件。

{{% alert title="限制 secret 存储访问" color="warning" %}}
当使用 [secret 范围]({{<ref secrets-scopes.md>}}) 限制应用程序中对 secret 的访问时，重要的是在范围定义中包含默认的 secret 存储以进行限制。
{{% /alert %}}

## 创建自定义 Kubernetes secret 存储组件

要设置 Kubernetes secret 存储，请创建一个类型为 `secretstores.kubernetes` 的组件。请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})了解如何创建和应用 secretstore 配置。请参阅本指南了解如何[引用 secret]({{< ref component-secrets.md >}})以检索和使用 Dapr 组件的 secret。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mycustomsecretstore
spec:
  type: secretstores.kubernetes
  version: v1
  metadata:[]
```

## 配置元数据字段

| 字段              | 必需 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `defaultNamespace` | 否 | 默认命名空间以检索 secret。如果未设置，则必须在每个请求元数据中或通过环境变量 `NAMESPACE` 指定 `namespace` | `"default-ns"` |
| `kubeconfigPath` | 否 | kubeconfig 文件的路径。如果未指定，存储将使用默认的集群内配置值 | `"/path/to/kubeconfig"`


## 可选的每请求元数据参数

可以为 Kubernetes secret 存储组件提供以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.namespace`| secret 的命名空间。如果未指定，则使用 pod 的命名空间。

## 相关链接
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索 secret]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用 secret]({{< ref component-secrets.md >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
- [操作指南：使用 secret 范围]({{<ref secrets-scopes.md>}})
