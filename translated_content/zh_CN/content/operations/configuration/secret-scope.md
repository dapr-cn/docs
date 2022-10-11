---
type: docs
title: "指南：限制密钥存储访问"
linkTitle: "限制密钥存储的访问"
weight: 3000
description: "要限制 Dapr 应用程序可访问的密钥，用户可以通过使用secret scopes扩充现有的 CRD 来定义密钥作用域。"
---

除了确定哪些应用程序可以访问给定的组件外，例如密钥存储组件 (见 [作用域组件]({{< ref "component-scopes.md">}})) ，一个被命名的密钥存储组件本身还可以确定应用程序的一个或多个密钥的范围。 通过定义 `allowedSecrets` 和/或 `deniedSecrets` 列表， 可以将应用程序限制为仅访问特定的密钥。

按照 [这些说明]({{< ref "configuration-overview.md" >}}) 来定义配置 CRD。

## 配置密钥访问

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

| 属性             | 类型     | 说明                                  |
| -------------- | ------ | ----------------------------------- |
| storeName      | string | 密钥存储组件的名称。 storeName 在列表中必须是唯一的     |
| defaultAccess  | string | 访问修饰符。 接受的值为 "allow" (默认值) 或 "deny" |
| allowedSecrets | list   | 可访问的密钥列表                            |
| deniedSecrets  | list   | 无法访问的密钥列表                           |

当 `allowedSecrets` 列表中至少存在一个元素时，应用程序只能访问列表中定义的那些密钥。

## 权限优先级

`allowedSecrets` 和 `deniedSecrets` 列表值优先于 `defaultAccess`。

| 场景                   | defaultAccess | allowedSecrets | deniedSecrets | 权限         |
| -------------------- | ------------- | -------------- | ------------- | ---------- |
| 1 - 仅默认访问            | deny/allow    | 空              | 空             | 拒绝/允许      |
| 2 - 默认为拒绝，并配置允许列表    | deny          | ["s1"]         | 空             | 只能访问"s1"   |
| 3 - 默认为允许，并配置拒绝列表    | allow         | 空              | ["s1"]        | 仅限"s1"无法访问 |
| 4 - 默认为允许，并配置允许列表    | allow         | ["s1"]         | 空             | 只能访问"s1"   |
| 5 - 默认为拒绝，并配置拒绝列表    | deny          | 空              | ["s1"]        | 拒绝         |
| 6 - 默认为拒绝/允许，并配置两个列表 | deny/allow    | ["s1"]         | ["s2"]        | 只能访问"s1"   |

## 示例

### 场景1：拒绝访问所有密钥仓库

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

For applications that need to be deined access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview >}}), and add the following annotation to the application pod.

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

This example defines configuration for secret store named vault. 密钥仓库的默认访问权限是`deny`，而有些密钥可以通过应用程序基于`allowedSecrets`列表访问。 按照 [这些说明]({{< ref configuration-overview.md >}}) 将配置应用到 sidecar。

### Scenario 3: Deny access to certain senstive secrets in a secret store

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
