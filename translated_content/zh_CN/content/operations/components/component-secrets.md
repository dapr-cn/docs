---
type: docs
title: "指南：在组件中引用密钥"
linkTitle: "在组件中引用密钥"
weight: 400
description: "如何从组件定义中安全地引用密钥"
---

## 概述

组件可以在组件定义中为 `spec.metadata` 部分引用密钥。

为了引用密钥，您需要设置 `auth.secretStore` 字段以指定密钥存储的名称。

在 Kubernetes 运行时，如果 `auth.secretStore` 为空，则假定使用Kubernetes 密钥存储。

### 支持的密钥存储

跳转到 [此]({{< ref "howto-secrets.md" >}}) 链接来查看Dapr 支持的所有密钥存储，以及如何配置和使用这些存储的信息。

## 引用密钥

虽然您可以选择使用纯文本密钥，但不建议用于生产：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: MyPassword
```

相反，在您应该在密钥存储中创建密钥，并在组件定义中引用它：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    secretKeyRef:
        name: redis-secret
        key:  redis-password
auth:
  secretStore: <SECRET_STORE_NAME>
```

`SECRET_STORE_NAME` 是已配置的 [密钥存储组件]({{< ref supported-secret-stores >}}) 当在 Kubernetes 中运行并使用 Kubernetes 密钥存储时，字段 `auth.SecretStore` 默认为 `kubernetes` 并且可以留空。

上面的组件定义让Dapr从定义的秘密存储中提取一个名为 `redis-secret` 的密钥，并将密钥的值分配给组件中的 `redis-password` 密钥中的 `redisPassword` 欄位。

## 示例

### Referencing a Kubernetes secret

The following example shows you how to create a Kubernetes secret to hold the connection string for an Event Hubs binding.

1. First, create the Kubernetes secret:
    ```bash
     kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
    ```

2. Next, reference the secret in your binding:
    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: eventhubs
      namespace: default
    spec:
      type: bindings.azure.eventhubs
      version: v1
      metadata:
      - name: connectionString
        secretKeyRef:
          name: eventhubs-secret
          key: connectionString
    ```

3. Finally, apply the component to the Kubernetes cluster:
    ```bash
    kubectl apply -f ./eventhubs.yaml
    ```

## Scoping access to secrets

Dapr can restrict access to secrets in a secret store using its configuration. Read [How To: Use secret scoping]({{< ref "secrets-scopes.md" >}}) and  [How-To: Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}}) for more information. This is the recommended way to limit access to secrets using Dapr.

## Kubernetes permissions

### Default namespace

When running in Kubernetes, Dapr, during installtion, defines default Role and RoleBinding for secrets access from Kubernetes secret store in the `default` namespace. For Dapr enabled apps that fetch secrets from `default` namespace, a secret can be defined and referenced in components as shown in the example above.

### Non-default namespaces

If your Dapr enabled apps are using components that fetch secrets from non-default namespaces, apply the following resources to that namespace:

```yaml
---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: secret-reader
  namespace: <NAMESPACE>
rules:
- apiGroups: [""]
  resources: ["secrets"]
  verbs: ["get", "list"]
---

kind: RoleBinding
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: dapr-secret-reader
  namespace: <NAMESPACE>
subjects:
- kind: ServiceAccount
  name: default
roleRef:
  kind: Role
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

These resources grant Dapr permissions to get secrets from the Kubernetes secret store for the namespace defined in the Role and RoleBinding.

{{% alert title="Note" color="warning" %}}
In production scenario to limit Dapr's access to certain secret resources alone, you can use the `resourceNames` field. See this [link](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources) for further explanation.
{{% /alert %}}

## 相关链接

- [使用密钥作用域]({{< ref "secrets-scopes.md" >}})
- [限制可以从密钥仓库中读取的密钥]({{< ref "secret-scope.md" >}})
