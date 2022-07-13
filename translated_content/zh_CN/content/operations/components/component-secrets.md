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

Go to [this]({{< ref "howto-secrets.md" >}}) link to see all the secret stores supported by Dapr, along with information on how to configure and use them.

## 引用密钥

While you have the option to use plain text secrets (like MyPassword), as shown in the yaml below for the `value` of `redisPassword`, this is not recommended for production:

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

Instead create the secret in your secret store and reference it in the component definition.  There are two cases for this shown below -- the "Secret contains an embedded key" and the "Secret is a string".

The "Secret contains an embedded key" case applies when there is a key embedded within the secret, i.e. the secret is **not** an entire connection string. This is shown in the following component definition yaml.

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

`SECRET_STORE_NAME` 是已配置的 [秘钥存储组件]({{< ref supported-secret-stores >}}) 的名称。 当在 Kubernetes 中运行并使用 Kubernetes 密钥存储时，字段 `auth.SecretStore` 默认为 `kubernetes` 并且可以留空。

The above component definition tells Dapr to extract a secret named `redis-secret` from the defined `secretStore` and assign the value associated with the `redis-password` key embedded in the secret to the `redisPassword` field in the component. One use of this case is when your code is constructing a connection string, for example putting together a URL, a secret, plus other information as necessary, into a string.

On the other hand, the below "Secret is a string" case applies when there is NOT a key embedded in the secret. Rather, the secret is just a string. Therefore, in the `secretKeyRef` section both the secret `name` and the secret `key` will be identical. This is the case when the secret itself is an entire connection string with no embedded key whose value needs to be extracted. Typically a connection string consists of connection information, some sort of secret to allow connection, plus perhaps other information and does not require a separate "secret". This case is shown in the below component definition yaml.

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
The above "Secret is a string" case yaml tells Dapr to extract a connection string named `asbNsConnstring` from the defined `secretStore` and assign the value to the `connectionString` field in the component since there is no key embedded in the "secret" from the `secretStore` because it is a plain string. This requires the secret `name` and secret `key` to be identical.

## 示例

### 引用一个Kubernetes密钥

下面的示例向您展示如何创建 Kubernetes 密钥来保持 Event Hubs 绑定的连接字符串。

1. 首先，创建Kubernetes密钥：
    ```bash
     kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
    ```

2. 接下来，在您的绑定中引用该密钥：
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

Dapr 可以使用其配置限制对密钥存储中的密钥的访问。 Read [How To: Use secret scoping]({{< ref "secrets-scopes.md" >}}) and  [How-To: Limit the secrets that can be read from secret stores]({{< ref "secret-scope.md" >}}) for more information. 这是推荐的使用 Dapr 限制访问密钥的方式。

## Kubernetes 权限

### 默认命名空间

当在 Kubernetes 中运行时，Dapr 在安装过程中定义了默认的 Role 和 RoleBinding ，用于在 `default` 命名空间中从 Kubernetes 密钥存储中获取密钥。 对于启用了 Dapr 的应用程序，从`default`命名空间获取密钥，可以在组件中定义和引用一个密钥，如上例所示。

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

这些资源给予了 Dapr 权限，从Kubernetes 密钥商店获取角色和 RoleBinding 定义的命名空间的密钥。

{{% alert title="Note" color="warning" %}}
在生产场景中，仅限Dapr访问某些秘密资源时，您可以使用 `resourceNames` 字段。 请参阅此 [链接](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources) 获取更多解释。
{{% /alert %}}

## 相关链接

- [使用密钥作用域]({{< ref "secrets-scopes.md" >}})
- [限制可以从密钥仓库中读取的密钥]({{< ref "secret-scope.md" >}})
