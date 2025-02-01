---
type: docs
title: "操作指南：限制从 secret 存储中读取的 secret"
linkTitle: "限制 secret 存储访问"
weight: 3000
description: "通过在现有配置资源中增加限制性权限来定义 secret 范围。"
---

除了[定义哪些应用程序可以访问特定组件]({{< ref "component-scopes.md">}})之外，您还可以将命名的 secret 存储组件限制为应用程序的一个或多个 secret。通过定义 `allowedSecrets` 和/或 `deniedSecrets` 列表，可以限制应用程序仅访问特定的 secret。

有关配置资源的更多信息：
- [Configuration 概述]({{< ref configuration-overview.md >}})
- [Configuration 模式]({{< ref configuration-schema.md >}})

## 配置 secret 访问

`Configuration` 规范下的 `secrets` 部分包含以下属性：

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

下表列出了 secret 范围的属性：

| 属性            | 类型   | 描述 |
|----------------|--------|-------------|
| storeName      | string | secret 存储组件的名称。storeName 在列表中必须是唯一的 |
| defaultAccess  | string | 访问修饰符。接受的值为 "allow"（默认）或 "deny" |
| allowedSecrets | list   | 可以访问的 secret 键列表 |
| deniedSecrets  | list   | 不能访问的 secret 键列表 |

当 `allowedSecrets` 列表中存在至少一个元素时，应用程序只能访问列表中定义的那些 secret。

## 权限优先级

`allowedSecrets` 和 `deniedSecrets` 列表的优先级高于 `defaultAccess`。请参阅以下示例场景了解其工作原理：

|  | 场景 | `defaultAccess` | `allowedSecrets` | `deniedSecrets` | `permission`
|--| ----- | ------- | -----------| ----------| ------------
| 1 | 仅默认访问  | `deny`/`allow` | 空 | 空 | `deny`/`allow`
| 2 | 默认拒绝并允许列表 | `deny` | [`"s1"`] | 空 | 仅 `"s1"` 可以访问
| 3 | 默认允许并拒绝列表 | `allow` | 空 | [`"s1"`] | 仅 `"s1"` 不能访问
| 4 | 默认允许并允许列表  | `allow` | [`"s1"`] | 空 | 仅 `"s1"` 可以访问
| 5 | 默认拒绝并拒绝列表  | `deny` | 空 | [`"s1"`] | `deny`
| 6 | 默认拒绝/允许并同时有列表  | `deny`/`allow` | [`"s1"`] | [`"s2"`] | 仅 `"s1"` 可以访问

## 示例

### 场景 1：拒绝对 secret 存储中所有 secret 的访问

在 Kubernetes 集群中，原生的 Kubernetes secret 存储默认会添加到您的 Dapr 应用程序中。在某些场景中，可能需要拒绝某个应用程序对 Dapr secret 的访问。要添加此配置：

1. 定义以下 `appconfig.yaml`。

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

1. 使用以下命令将其应用到 Kubernetes 集群：

   ```bash
   kubectl apply -f appconfig.yaml
   ```

对于需要拒绝访问 Kubernetes secret 存储的应用程序，请按照[Kubernetes 指南]({{< ref kubernetes-overview >}})，在应用程序 pod 中添加以下注释。

```yaml
dapr.io/config: appconfig
```

定义此项后，应用程序将不再能访问 Kubernetes secret 存储。

### 场景 2：仅允许访问 secret 存储中的某些 secret

要允许 Dapr 应用程序仅访问某些 secret，请定义以下 `config.yaml`：

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

此示例为名为 `vault` 的 secret 存储定义了配置。对 secret 存储的默认访问为 `deny`。同时，应用程序可以根据 `allowedSecrets` 列表访问某些 secret。请按照[sidecar 配置指南]({{< ref "configuration-overview.md#sidecar-configuration" >}})将配置应用到 sidecar。

### 场景 3：拒绝访问 secret 存储中的某些敏感 secret

定义以下 `config.yaml`：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  secrets:
    scopes:
      - storeName: vault
        defaultAccess: allow # 这是默认值，可以省略此行
        deniedSecrets: ["secret1", "secret2"]
```

此配置明确拒绝访问名为 `vault` 的 secret 存储中的 `secret1` 和 `secret2`，同时允许访问所有其他 secret。请按照[sidecar 配置指南]({{< ref "configuration-overview.md#sidecar-configuration" >}})将配置应用到 sidecar。

## 下一步

{{< button text="服务调用访问控制" page="invoke-allowlist" >}}