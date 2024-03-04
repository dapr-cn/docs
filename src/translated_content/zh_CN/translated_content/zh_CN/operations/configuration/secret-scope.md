---
type: docs
title: "指南：限制密钥存储访问"
linkTitle: "限制密钥存储的访问"
weight: 3000
description: "To limit the secrets to which the Dapr application has access, users can define secret scopes by augmenting existing configuration resource with restrictive permissions."
---

In addition to scoping which applications can access a given component, for example a secret store component (see [Scoping components]({{< ref "component-scopes.md">}})), a named secret store component itself can be scoped to one or more secrets for an application. By defining `allowedSecrets` and/or `deniedSecrets` list, applications can be restricted to access only specific secrets.

Follow [these instructions]({{< ref "configuration-overview.md" >}}) to define a configuration resource.

## Configure secrets access

`Configuration` spec下的 `secrets` 部分包含以下属性：

```yml
secrets:
  scopes:
    - storeName: kubernetes
      defaultAccess: allow
      allowedSecrets: ["redis-password"]
    - storeName: localstore
      defaultAccess: allow
      deniedSecrets: ["redis-password"]
```

下面的表格列出了密钥作用域的属性：

| Property       | 数据类型   | 说明                                                                           |
| -------------- | ------ | ---------------------------------------------------------------------------- |
| storeName      | string | Name of the secret store component. storeName must be unique within the list |
| defaultAccess  | string | Access modifier. Accepted values "allow" (default) or "deny"                 |
| allowedSecrets | list   | List of secret keys that can be accessed                                     |
| deniedSecrets  | list   | List of secret keys that cannot be accessed                                  |

当 `allowedSecrets` 列表中至少存在一个元素时，应用程序只能访问列表中定义的那些密钥。

## 权限优先级

`allowedSecrets` 和 `deniedSecrets` 列表值优先于 `defaultAccess`。

| Scenarios                              | defaultAccess | allowedSecrets | deniedSecrets | 权限         |
| -------------------------------------- | ------------- | -------------- | ------------- | ---------- |
| 1 - Only default access                | deny/allow    | empty          | empty         | deny/allow |
| 2 - Default deny with allowed list     | deny          | ["s1"]         | 空             | 只能访问"s1"   |
| 3 - Default allow with denied list     | allow         | 空              | ["s1"]        | 仅限"s1"无法访问 |
| 4 - Default allow with allowed list    | allow         | ["s1"]         | 空             | 只能访问"s1"   |
| 5 - Default deny with denied list      | deny          | 空              | ["s1"]        | deny       |
| 6 - Default deny/allow with both lists | deny/allow    | ["s1"]         | ["s2"]        | 只能访问"s1"   |

## 示例

### Scenario 1 : Deny access to all secrets for a secret store

在 Kubernetes 集群中，原生的 Kubernetes 密钥存储默认被添加到 Dapr 应用程序中。 在某些情况下，可能需要拒绝某个应用程序访问 Dapr 密钥。 请按照下面的步骤添加此配置：

定义下面的 `appconfig.yaml`，并使用命令 `kubectl apply -f appconfig.yaml` 应用到 Kubernetes 集群。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: kubernetes
        defaultAccess: deny
```

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview >}}), and add the following annotation to the application pod.

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 秘密存储。

### 场景2：只允许访问秘密仓库中的某些秘密

要允许 Dapr 应用程序仅访问某些秘密，请定义以下 `config.yaml`：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAccess: deny
        allowedSecrets: ["secret1", "secret2"]
```

此示例定义了名为 vault 的秘密仓库配置。 密钥仓库的默认访问权限是`deny`，而有些密钥可以通过应用程序基于`allowedSecrets`列表访问。 按照 [这些说明]({{< ref configuration-overview.md >}}) 将配置应用到 sidecar。

### 场景3：拒绝访问秘密仓库中的某些敏感秘密

定义以下 `config.yaml`:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAccess: allow # this is the default value, line can be omitted
        deniedSecrets: ["secret1", "secret2"]
```

上面的配置明确禁止从名为 vault 的密钥仓库访问 `secret1` 和 `secret2` ，但允许访问所有其他密钥。 按照 [这些说明]({{< ref configuration-overview.md >}}) 将配置应用到 sidecar。
