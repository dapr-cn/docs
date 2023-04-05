---
type: docs
title: "Kubernetes secrets"
linkTitle: "Kubernetes secrets"
description: 详细介绍了关于 Kubernetes密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/kubernetes-secret-store/"
---

## 默认 Kubernetes 密钥仓库组件
当 Dapr 部署到 Kubernetes 集群时，将自动预配名为 `kubernetes` 的密钥仓库。 此预配置的密钥仓库允许您使用原生 Kubernetes 密钥仓库，而无需为密钥仓库编写、部署或维护组件配置文件，对于希望简单地访问 Kubernetes 集群中原生密钥仓库的开发者来说非常有用。

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
  namespace: default
spec:
  type: secretstores.kubernetes
  version: v1
  metadata:
  - name: ""
```
## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
- [如何: 使用秘钥的作用域限定]({{<ref secrets-scopes.md>}})
