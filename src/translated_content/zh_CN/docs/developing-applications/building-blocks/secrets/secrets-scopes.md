---
type: docs
title: "如何使用：配置 secret 访问范围"
linkTitle: "如何使用：配置 secret 访问范围"
weight: 3000
description: "通过设置访问范围限制应用程序从 secret 存储中读取的 secret"
---

当您[为应用程序配置了 secret 存储]({{< ref setup-secret-store >}})后，Dapr 应用程序默认可以访问该存储中定义的*所有* secret。

您可以通过在[应用程序配置]({{< ref configuration-concept.md >}})中定义 secret 访问范围策略，来限制 Dapr 应用程序对特定 secret 的访问权限。

secret 访问范围策略适用于任何[secret 存储]({{< ref supported-secret-stores.md >}})，包括：

- 本地 secret 存储
- Kubernetes secret 存储
- 公有云 secret 存储

有关如何设置[secret 存储]({{< ref setup-secret-store.md >}})的详细信息，请阅读[如何：检索 secret]({{< ref howto-secrets.md >}})。

观看[此视频](https://youtu.be/j99RN_nxExA?start=2272)以了解如何在应用程序中使用 secret 访问范围的演示。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 场景 1：拒绝访问 secret 存储中的所有 secret

在此示例中，所有 secret 访问都被拒绝给运行在 Kubernetes 集群上的应用程序，该集群配置了名为 `mycustomsecretstore` 的[Kubernetes secret 存储]({{< ref kubernetes-secret-store >}})。除了用户定义的自定义存储外，示例还配置了 Kubernetes 默认存储（名为 `kubernetes`），以确保所有 secret 都被拒绝访问。[了解有关 Kubernetes 默认 secret 存储的更多信息]({{< ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component" >}})。

定义以下 `appconfig.yaml` 配置，并使用命令 `kubectl apply -f appconfig.yaml` 将其应用于 Kubernetes 集群。

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
      - storeName: mycustomsecreststore
        defaultAccess: deny
```

对于需要拒绝访问 Kubernetes secret 存储的应用程序，请按照[这些说明]({{< ref kubernetes-overview.md >}})，并将以下注释添加到应用程序 pod：

```yaml
dapr.io/config: appconfig
```

配置完成后，应用程序将无法访问 Kubernetes secret 存储中的任何 secret。

## 场景 2：仅允许访问 secret 存储中的某些 secret

此示例使用名为 `vault` 的 secret 存储。这可以是设置在应用程序上的 Hashicorp secret 存储组件。要允许 Dapr 应用程序仅访问 `vault` secret 存储中的 `secret1` 和 `secret2`，请定义以下 `appconfig.yaml`：

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

对 `vault` secret 存储的默认访问是 `deny`，但应用程序可以根据 `allowedSecrets` 列表访问特定的 secret。[了解如何将配置应用于 sidecar]({{< ref configuration-concept.md >}})。

## 场景 3：拒绝访问 secret 存储中的某些敏感 secret

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
        defaultAccess: allow # 这是默认值，可以省略
        deniedSecrets: ["secret1", "secret2"]
```

此示例配置明确拒绝访问名为 `vault` 的 secret 存储中的 `secret1` 和 `secret2`，同时允许访问所有其他 secret。[了解如何将配置应用于 sidecar]({{< ref configuration-concept.md >}})。

## 权限优先级

`allowedSecrets` 和 `deniedSecrets` 列表的设置优先于 `defaultAccess` 策略。

场景 | defaultAccess | allowedSecrets | deniedSecrets | 权限
---- | ------- | -----------| ----------| ------------
1 - 仅默认访问  | deny/allow | 空 | 空 | deny/allow
2 - 默认拒绝并允许列表 | deny | ["s1"] | 空 | 仅 "s1" 可访问
3 - 默认允许并拒绝列表 | allow | 空 | ["s1"] | 仅 "s1" 不可访问
4 - 默认允许并允许列表  | allow | ["s1"] | 空 | 仅 "s1" 可访问
5 - 默认拒绝并拒绝列表  | deny | 空 | ["s1"] | deny
6 - 默认拒绝/允许并同时有列表  | deny/allow | ["s1"] | ["s2"] | 仅 "s1" 可访问

## 相关链接

- [secret 存储]({{< ref supported-secret-stores.md >}})列表
- [secret 存储]({{< ref setup-secret-store.md >}})概述
