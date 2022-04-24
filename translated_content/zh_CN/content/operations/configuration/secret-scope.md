---
type: docs
title: "操作方法：限制可从秘密存储读取的秘密"
linkTitle: "限制秘密存储的访问"
weight: 3000
description: "要限制 Dapr 应用程序可访问的秘密，用户可以通过使用限制性权限扩充现有的 CRD 来定义秘密作用域。"
---

除了对哪些应用程序可以访问一个给定的组件进行范围界定，例如一个秘密存储组件 (见 [对组件进行范围界定]({{< ref "component-scopes.md">}})) ，一个命名的秘密存储组件本身可以被范围界定为应用程序的一个或多个秘密。 通过定义 `allowedSecrets` 和/或 `deniedSecrets` 列表， 可以将应用程序限制为仅访问特定的秘密。

按照 [这些说明]({{< ref "configuration-overview.md" >}}) 来定义配置 CRD。

## 配置秘密访问

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

下面的表格给出了秘密作用域的属性：

| 属性        | 数据类型   | 说明                                                                                      |
| --------- | ------ | --------------------------------------------------------------------------------------- |
| storeName | string | 秘密存储组件的名称。 Name of the secret store component. storeName must be unique within the list |
| 默认权限      | string | 访问修饰符。 接受的值为 "allow" (默认值) 或 "deny"                                                     |
| 允许的密钥     | list   | 可访问的密钥列表                                                                                |
| 被拒绝的密钥    | list   | 无法访问的密钥列表                                                                               |

当 `allowedSecrets` 列表中至少存在一个元素时，应用程序只能访问列表中定义的那些秘密。

## 权限优先级

`allowedSecrets` 和 `deniedSecrets` 列表值优先于 `defaultAccess`。

| 场景               | 默认权限  | 允许的密钥  | 被拒绝的密钥 | 权限         |
| ---------------- | ----- | ------ | ------ | ---------- |
| 1 - 仅默认访问        | 拒绝/允许 | 为空     | 为空     | 拒绝/允许      |
| 2 - 默认拒绝允许列表     | 拒绝    | ["s1"] | 为空     | 只能访问"s1"   |
| 3 - 默认允许拒绝列表     | 允许    | 为空     | ["s1"] | 仅限"s1"无法访问 |
| 4 - 默认允许允许列表     | 允许    | ["s1"] | 为空     | 只能访问"s1"   |
| 5 - 默认拒绝拒绝列表     | 拒绝    | 为空     | ["s1"] | 拒绝         |
| 6 - 两个列表的默认拒绝/允许 | 拒绝/允许 | ["s1"] | ["s2"] | 只能访问"s1"   |

## 示例

### 场景1：拒绝访问所有密钥仓库

在 Kubernetes 集群中，默认情况下，本机 Kubernetes 密钥存储被添加到 Dapr 应用程序中。 在某些情况下，可能有必要拒绝某个应用程序访问 Dapr 密钥。 要添加此配置，请按照下面的步骤：

定义下面 `appconfig.yaml`，并使用命令 `kubectl apply -f appconfig.yaml` 应用到 Kubernetes 集群。

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

对于需要拒绝访问 Kubernetes 秘密仓库的应用程序， 按照[这些说明]({{< ref kubernetes-overview >}})，并将以下注解添加到应用程序 pod 中。

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 秘密存储。

### 场景2：只允许访问密钥仓库中的某些密钥

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

上面的配置明确禁止从名为 vault 的密钥仓库访问 `secret1` 和 `secret2` ，但允许访问所有其他密钥。 按照 [这些说明]({{< ref configuration-overview.md >}}) 将配置应用到 sidecar。
