---
type: docs
title: "指南：在组件中引用 Secret"
linkTitle: "在组件中引用 Secret"
weight: 400
description: "如何从组件定义中安全地引用 Secret"
---

## 概述

组件可以在组件定义中为 `spec.metadata` 部分引用密钥。

为了引用密钥，您需要设置 `auth.secretStore` 字段以指定密钥存储的名称。

在 Kubernetes 运行时，如果 `auth.secretStore` 为空，则假定使用Kubernetes 密钥存储。

### 支持的 Secret stores

转到 [此]({{< ref " howto-secrets. md" >}}) 链接，以查看 Dapr 支持的所有 secret stores，以及有关如何配置和使用它们的信息。

## 引用 Secret

虽然您可以选择使用明文密钥（如 MyPassword），如下面的 yaml 所示，用于 `redisPassword`的 `value` ，但不建议将其用于生产：

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

相反，在您应该在 secret store 中创建 Secret，并在组件定义中引用它：  这有两种情况，如下所示 -- " Secret 包含一个嵌入的键 "和 " Secret 是一个字符串"。

" Secret 包含一个嵌入的键"的情况适用于在 Secret 中嵌入一个键，即 Secret **不是**整个连接字符串。 这显示在以下组件定义 yaml 中。

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

`SECRET_STORE_NAME` 是已配置的 [ secret store 组件]({{< ref supported-secret-stores >}}) 的名称。 当在 Kubernetes 中运行并使用 Kubernetes secret store 时，字段 `auth.SecretStore` 默认为 `kubernetes` 并且可以留空。

上面的组件定义告诉 Dapr 从定义的 `secretStore` 中提取名为 `redis-secret` 的Secret，并将与Secret中嵌入的 `redis-password` 值分配给组件中的 `redisPassword` 字段。 这种情况的一个用法是，当代码构造连接字符串时，例如，将 URL、Secret 以及其他必要信息组合到字符串中。

另一方面，当 Secret 中没有嵌入键值时，以下"Secret是字符串"情况就适用。 相反，这个 Secret 只是一个字符串。 因此，在" `secretKeyRef` "部分中，Secret 的 `name` 和 `key` 将完全相同。 当Secret本身是一个完整的连接字符串，没有需要提取其值的嵌入的键时，就是这种情况。 通常，连接字符串由连接信息、某种允许连接的机密以及可能的其他信息组成，不需要单独的"Secret"。 这种情况如下面的组件定义 yaml 所示。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicec-inputq-azkvsecret-asbqueue
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  -name: connectionString
  secretKeyRef:
      name: asbNsConnString
      key: asbNsConnString
  -name: queueName
   value: servicec-inputq
auth:
secretStore: <SECRET_STORE_NAME>

```
上面的"Secret 是一个字符串"情况 yaml 告诉 Dapr 从定义的 `secretStore` 中提取名为 `asbNsConnstring` 的连接字符串，并将该值分配给组件中的 `connectionString` 字段，因为"Secret"中没有嵌入 `secretStore` 的键，因为它是纯字符串。 这要求 Secret `name` 和 `key` 相同。

## Example

### 引用一个Kubernetes密钥

下面的示例向您展示如何创建 Kubernetes 密钥来保持 Event Hubs 绑定的连接字符串。

1. 首先，创建Kubernetes密钥：
    ```bash
     kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
    ```

2. 接下来，在您的绑定中引用该 Secret：
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

3. 最后，将组件应用到 Kubernetes 集群：
    ```bash
    kubectl apply -f ./eventhubs.yaml
    ```

## 访问密钥的范围

Dapr 可以使用其配置限制对 secret store 中的 Secret 的访问。 有关详细信息，请阅读 [如何：使用 Secret 范围]({{< ref "secrets-scopes.md" >}}) 和  [如何：限制可从 secret stores 读取的 Secret]({{< ref "secret-scope.md" >}})。 这是使用 Dapr 限制对 Secret 的访问的推荐方法。

## Kubernetes 权限

### 默认命名空间

当在 Kubernetes 中运行时，Dapr 在安装过程中定义了默认的 Role 和 RoleBinding ，用于在 `default` 命名空间中从 Kubernetes secret store 中获取 Secret。 对于启用了 Dapr 的应用程序，从`default`命名空间获取密钥，可以在组件中定义和引用一个密钥，如上例所示。

### 非默认命名空间

如果您的 Dapr 启用的应用正在使用从非默认命名空间获取密钥的组件，在该命名空间应用以下资源：

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

这些资源给予了 Dapr 权限，从 Kubernetes 密钥商店获取角色和 RoleBinding 定义的命名空间的 Secret。

{{% alert title="Note" color="warning" %}}
在生产场景中，仅限Dapr访问某些秘密资源时，您可以使用 `resourceNames` 字段。 请参阅此 [链接](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources) 获取更多解释。
{{% /alert %}}

## 相关链接

- [使用密钥作用域]({{< ref "secrets-scopes.md" >}})
- [限制可以从密钥仓库中读取的密钥]({{< ref "secret-scope.md" >}})
