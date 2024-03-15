---
type: docs
title: "How-To: Limit the secrets that can be read from secret stores"
linkTitle: Limit secret store access
weight: 3000
description: To limit the secrets to which the Dapr application has access, users can define secret scopes by augmenting existing configuration resource with restrictive permissions.
---

In addition to scoping which applications can access a given component, for example a secret store component (see [Scoping components]({{< ref "component-scopes.md">}})), a named secret store component itself can be scoped to one or more secrets for an application. By defining `allowedSecrets` and/or `deniedSecrets` list, applications can be restricted to access only specific secrets.

Follow [these instructions]({{< ref "configuration-overview\.md" >}}) to define a configuration resource.

## Configure secrets access

The `secrets` section under the `Configuration` spec contains the following properties:

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

The following table lists the properties for secret scopes:

| Property  | Type   | Description                                                                     |
| --------- | ------ | ------------------------------------------------------------------------------- |
| storeName | string | Name of the secret store component. storeName must be unique within the list    |
| 默认权限      | string | Access modifier. Accepted values "allow" (default) or "deny" |
| 允许的密钥     | list   | List of secret keys that can be accessed                                        |
| 被拒绝的密钥    | list   | List of secret keys that cannot be accessed                                     |

When an `allowedSecrets` list is present with at least one element, only those secrets defined in the list can be accessed by the application.

## 权限优先级

The `allowedSecrets` and `deniedSecrets` list values take priorty over the `defaultAccess`.

| Scenarios                          | 默认权限  | 允许的密钥                                                      | 被拒绝的密钥                                                     | 权限         |
| ---------------------------------- | ----- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| 1 - 仅默认访问                          | 拒绝/允许 | 为空                                                         | 为空                                                         | 拒绝/允许      |
| 2 - 默认为拒绝的允许列表                     | 拒绝    | ["s1"] | 为空                                                         | 只能访问"s1"   |
| 3 - Default allow with denied list | 允许    | 为空                                                         | ["s1"] | 仅限"s1"无法访问 |
| 4 - 默认允许的允许列表                      | 允许    | ["s1"] | 为空                                                         | 只能访问"s1"   |
| 5 - 默认拒绝的拒绝列表                      | 拒绝    | 为空                                                         | ["s1"] | 拒绝         |
| 6 - 默认拒绝/允许的两个列表                   | 拒绝/允许 | ["s1"] | ["s2"] | 只能访问"s1"   |

## 示例

### 场景1：拒绝访问密钥存储中的所有密钥

In Kubernetes cluster, the native Kubernetes secret store is added to Dapr application by default. In some scenarios it may be necessary to deny access to Dapr secrets for a given application. To add this configuration follow the steps below:

Define the following `appconfig.yaml` and apply it to the Kubernetes cluster using the command `kubectl apply -f appconfig.yaml`.

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

With this defined, the application no longer has access to Kubernetes secret store.

### 场景2：只允许访问密钥仓库中的某些密钥

To allow a Dapr application to have access to only certain secrets, define the following `config.yaml`:

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

This example defines configuration for secret store named vault. The default access to the secret store is `deny`, whereas some secrets are accessible by the application based on the `allowedSecrets` list. Follow [these instructions]({{< ref configuration-overview\.md >}}) to apply configuration to the sidecar.

### 场景3：拒绝访问密钥仓库中的某些敏感密钥

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

The above configuration explicitly denies access to `secret1` and `secret2` from the secret store named vault while allowing access to all other secrets. Follow [these instructions]({{< ref configuration-overview\.md >}}) to apply configuration to the sidecar.
