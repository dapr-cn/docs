---
type: docs
title: "操作指南：在组件中引用secret"
linkTitle: "在组件中引用secret"
weight: 500
description: "如何在组件定义中安全地引用secret"
---

## 概述

在组件定义的`spec.metadata`部分中，可以引用secret。

要引用secret，你需要设置`auth.secretStore`字段来指定保存secret的secret存储的名称。

在Kubernetes中运行时，如果`auth.secretStore`为空，则默认使用Kubernetes secret存储。

### 支持的secret存储

访问[此链接]({{< ref "howto-secrets.md" >}})查看Dapr支持的所有secret存储，以及如何配置和使用它们的信息。

## 引用secret

虽然你可以选择使用纯文本secret（如MyPassword），如下面yaml中`redisPassword`的`value`所示，但这不建议用于生产环境：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: MyPassword
```

相反，建议在你的secret存储中创建secret并在组件定义中引用它。下面展示了两种情况——“secret包含嵌入的key”和“secret是一个字符串”。

“secret包含嵌入的key”适用于secret中嵌入了一个key的情况，即secret**不是**一个完整的连接字符串。这在以下组件定义yaml中展示。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
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

`SECRET_STORE_NAME`是配置的[secret存储组件]({{< ref supported-secret-stores >}})的名称。在Kubernetes中运行并使用Kubernetes secret存储时，字段`auth.SecretStore`默认为`kubernetes`，可以留空。

上述组件定义告诉Dapr从定义的`secretStore`中提取名为`redis-secret`的secret，并将secret中嵌入的`redis-password` key关联的值分配给组件中的`redisPassword`字段。此情况的一个用途是当你的代码正在构建一个连接字符串时，例如将URL、secret以及其他必要信息组合成一个字符串。

另一方面，下面的“secret是一个字符串”适用于secret中没有嵌入key的情况。相反，secret只是一个字符串。因此，在`secretKeyRef`部分中，secret的`name`和secret的`key`将是相同的。这种情况是当secret本身是一个完整的连接字符串，没有需要提取值的嵌入key时。通常，连接字符串由连接信息、某种允许连接的secret以及可能的其他信息组成，不需要单独的“secret”。这种情况在下面的组件定义yaml中展示。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: servicec-inputq-azkvsecret-asbqueue
spec:
  type: bindings.azure.servicebusqueues
  version: v1
  metadata:
  - name: connectionString
    secretKeyRef:
      name: asbNsConnString
      key: asbNsConnString
  - name: queueName
    value: servicec-inputq
auth:
  secretStore: <SECRET_STORE_NAME>
```

上述“secret是一个字符串”情况的yaml告诉Dapr从定义的`secretStore`中提取名为`asbNsConnstring`的连接字符串，并将值分配给组件中的`connectionString`字段，因为从`secretStore`中提取的“secret”是一个纯字符串，没有嵌入的key。这要求secret的`name`和secret的`key`相同。

## 示例

### 引用Kubernetes secret

以下示例展示了如何创建一个Kubernetes secret来保存Event Hubs绑定的连接字符串。

1. 首先，创建Kubernetes secret：
    ```bash
    kubectl create secret generic eventhubs-secret --from-literal=connectionString=*********
    ```

2. 接下来，在你的绑定中引用secret：
    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: eventhubs
    spec:
      type: bindings.azure.eventhubs
      version: v1
      metadata:
      - name: connectionString
        secretKeyRef:
          name: eventhubs-secret
          key: connectionString
    ```

3. 最后，将组件应用到Kubernetes集群：
    ```bash
    kubectl apply -f ./eventhubs.yaml
    ```

## 限制对secret的访问

Dapr可以使用其配置限制对secret存储中secret的访问。阅读[如何使用secret范围]({{< ref "secrets-scopes.md" >}})和[如何限制从secret存储中读取的secret]({{< ref "secret-scope.md" >}})以获取更多信息。这是使用Dapr限制对secret访问的推荐方法。

## Kubernetes权限

### 默认命名空间

在Kubernetes中运行时，Dapr在安装期间为从Kubernetes secret存储访问secret定义了默认的Role和RoleBinding在`default`命名空间中。对于从`default`命名空间获取secret的Dapr启用的应用程序，可以如上例所示定义和引用secret。

### 非默认命名空间

如果你的Dapr启用的应用程序使用从非默认命名空间获取secret的组件，请将以下资源应用到该命名空间：

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

这些资源授予Dapr从Role和RoleBinding中定义的命名空间的Kubernetes secret存储中获取secret的权限。

{{% alert title="注意" color="warning" %}}
在生产环境中，为了仅限制Dapr对某些secret资源的访问，你可以使用`resourceNames`字段。参见此[链接](https://kubernetes.io/docs/reference/access-authn-authz/rbac/#referring-to-resources)以获取进一步的解释。
{{% /alert %}}

## 相关链接

- [使用secret范围]({{< ref "secrets-scopes.md" >}})
- [限制从secret存储中读取的secret]({{< ref "secret-scope.md" >}})
