---
type: docs
title: "Kubernetes 密钥"
linkTitle: "Kubernetes 密钥"
description: 详细介绍了关于 Kubernetes密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## Default Kubernetes secret store component
When Dapr is deployed to a Kubernetes cluster, a secret store with the name `kubernetes` is automatically provisioned. This pre-provisioned secret store allows you to use the native Kubernetes secret store with no need to author, deploy or maintain a component configuration file for the secret store and is useful for developers looking to simply access secrets stored natively in a Kubernetes cluster.

仍然可以为 Kubernetes 密钥仓库配置一个自定义的组件定义文件（详见下文）。 使用自定义方式可以使你的代码中引用的密钥仓库与托管平台解耦，因为密钥仓库不是固定的，可以自定义，从而使你的代码更加通用和便携。 此外，通过显式定义 Kubernetes 密钥仓库组件，您可以从本地 Dapr 自承载安装连接到 Kubernetes 密钥仓库。 这需要一个有效的 [`kubeconfig`](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/) 文件。

{{% alert title="Scoping secret store access" color="warning" %}}
当使用 [secret scopes]({{<ref secrets-scopes.md>}}) 限制访问应用程序中 Secret 的时，请务必在作用域定义中包含默认密钥仓库，以便对其进行限制。
{{% /alert %}}

## 创建自定义 Kubernetes 密钥仓库组件

要设置 Kubernetes 密钥仓库，请创建一个类型为 `secretstores.kubernetes`的组件。 有关如何创建和应用密钥库配置，请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})。 请参阅本指南 [引用密钥]({{< ref component-secrets.md >}}) 来检索和使用Dapr组件的密钥。

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

## 元数据字段规范

| Field              | Required | 详情                                                                                                                                                       | 示例                      |
| ------------------ |:--------:| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `defaultNamespace` |    否     | Default namespace to retrieve secrets from. If unset, the `namespace` must be specified in each request metadata or via environment variable `NAMESPACE` | `"default-ns"`          |
| `kubeconfigPath`   |    否     | The path to the kubeconfig file. If not specified, the store uses the default in-cluster config value                                                    | `"/path/to/kubeconfig"` |


## Optional per-request metadata properties

The following [optional query parameters]({{< ref "secrets_api#query-parameters" >}}) can be provided to Kubernetes secret store component:

| Query Parameter      | 说明                                                                               |
| -------------------- | -------------------------------------------------------------------------------- |
| `metadata.namespace` | The namespace of the secret. If not specified, the namespace of the pod is used. |

## 相关链接
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
- [How To: Use secret scoping]({{<ref secrets-scopes.md>}})
