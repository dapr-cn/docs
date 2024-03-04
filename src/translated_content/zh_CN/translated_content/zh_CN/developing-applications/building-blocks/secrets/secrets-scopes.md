---
type: docs
title: "操作方法: 使用秘钥的作用域限定"
linkTitle: "How To: Use secret scoping"
weight: 3000
description: "应用程序从秘钥存储介质中读取时，需要使用作用域来限定"
---

一旦 [为应用程序配置了秘密存储空间]({{< ref setup-secret-store >}})， *，在该存储空间中定义的任何* 密钥默认都可从 Dapr 应用程序访问。

您可以通过定义密钥范围来限制 Dapr 应用程序对特定密钥的访问。 只需在应用程序配置 中添加一个[密钥范围策略 ]({{< ref configuration-concept.md >}})，并设置严格的权限。

密钥范围策略适用于任何 [密钥存储]({{< ref supported-secret-stores.md >}})，包括：

- 本地密钥存储
- 一个Kubernetes密钥存储
- 一个公共云密钥存储

关于如何设置一个 [密钥存储]({{< ref setup-secret-store.md >}}), 查看 [指南：获取密钥]({{< ref howto-secrets.md >}}).

观看 [这个视频](https://youtu.be/j99RN_nxExA?start=2272) 以了解如何在应用程序中使用密钥范围。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 场景1：拒绝访问密钥存储中的所有密钥

在这个例子中，运行在 Kubernetes 集群上的应用程序的所有秘密访问都被拒绝，该集群有一个配置名为 `mycustomsecretstore`的 [Kubernetes 秘密存储]({{< ref kubernetes-secret-store>}}) 。 除了用户定义的自定义存储之外，该示例还配置了Kubernetes默认存储（命名为 `kubernetes`），以确保所有密钥都被拒绝访问。 [了解有关 Kubernetes 默认密钥存储]({{< ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component" >}})的更多信息。

定义下面 `appconfig.yaml` 配置，并使用命令 `kubectl apply -f appconfig.yaml` 到 Kubernetes 集群。

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

对于需要拒绝访问 Kubernetes 密钥仓库的应用程序， 按照 [这些说明]({{< ref kubernetes-overview.md >}})，并将以下注释添加到应用程序 pod 中。

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 密钥仓库的任何密钥。

## 场景2：只允许访问秘密仓库中的某些秘密

这个示例使用一个名为 `vault` 的密钥仓库。 这可能是已经设置在您的应用程序上的Hashicorp密钥存储组件。 允许 Dapr 应用程序只访问在 `vault` 密钥仓库的 `secret1` 和 `secret2` 密钥， 需要定义下面的 `appconfig.yaml`:

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

密钥仓库的默认访问权限是`deny`，而有些密钥可以通过应用程序基于`allowedSecrets`列表访问。 [学习如何将配置应用到 sidecar]（{{< ref configuration-concept.md >}}）。

## 场景3：拒绝访问秘密仓库中的某些敏感秘密

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

上面的配置明确禁止从名为 vault 的密钥仓库访问 `secret1` 和 `secret2` ，但允许访问所有其他密钥。 [学习如何将配置应用到 sidecar]（{{< ref configuration-concept.md >}}）。

## 权限优先级

`allowedSecrets`和`deniedSecrets`列表值优先于`defaultAccess`策略。

| 场景               | 默认权限  | 允许的密钥  | 被拒绝的密钥 | 权限         |
| ---------------- | ----- | ------ | ------ | ---------- |
| 1 - 仅默认访问        | 拒绝/允许 | 为空     | 为空     | 拒绝/允许      |
| 2 - 默认为拒绝的允许列表   | deny  | ["s1"] | 为空     | 只能访问"s1"   |
| 3 - 默认为允许的拒绝列表   | allow | 为空     | ["s1"] | 仅限"s1"无法访问 |
| 4 - 默认允许的允许列表    | allow | ["s1"] | 为空     | 只能访问"s1"   |
| 5 - 默认拒绝的拒绝列表    | deny  | 为空     | ["s1"] | deny       |
| 6 - 默认拒绝/允许的两个列表 | 拒绝/允许 | ["s1"] | ["s2"] | 只能访问"s1"   |

## 相关链接

- [密钥存储]({{< ref supported-secret-stores.md >}}) 列表
- [密钥存储]({{< ref setup-secret-store.md >}}) 概述