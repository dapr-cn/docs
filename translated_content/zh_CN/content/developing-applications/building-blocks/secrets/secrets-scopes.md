---
type: docs
title: "如何: 使用秘钥的作用域限定"
linkTitle: "如何: 使用秘钥的作用域限定"
weight: 3000
description: "应用程序从秘钥存储介质中读取时，需要使用作用域来限定"
---

您可以阅读 [设置密钥仓库组件指南]({{< ref setup-secret-store >}}) 以配置应用程序的密钥仓库。 一旦配置完毕，默认情况下 *任何* 该仓库内定义的密钥都可以从 Dapr 应用程序访问。

要限制 Dapr 应用程序访问密钥的话， 您可以通过向应用程序配置添加密钥作用域政策并限制权限来定义密钥作用域。 按照 [这些说明]({{< ref configuration-concept.md >}}) 来定义应用程序配置。

密钥作用域适用于任何 [密钥仓库]({{< ref supported-secret-stores.md >}})， 是否是本地密钥仓库、Kubernetes 密钥仓库或公共云密钥仓库。 关于如何设置一个 [密钥仓库]({{< ref secret-stores-overview.md >}}) 查看 [指南：获取密钥]({{< ref howto-secrets.md >}})

观看这个 [视频](https://youtu.be/j99RN_nxExA?start=2272) 演示如何让你的应用程序使用密钥作用域。 <iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen mark="crwd-mark"></iframe>

## 场景1：拒绝访问所有密钥仓库

此示例使用 Kubernetes。 默认 Kubernetes 的密钥仓库会添加到您的 Dapr 应用程序。 在某些情况下，可能有必要拒绝某个应用程序访问 Dapr 密钥。 要添加此配置，请按照下面的步骤：

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
```

对于需要拒绝访问 Kubernetes 密钥仓库的应用程序， 按照 [这些说明]({{< ref kubernetes-overview.md >}})，并将以下注释添加到应用程序 pod 中。

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 密钥仓库的任何密钥。

## 场景2：只允许访问密钥仓库中的某些密钥

这个示例使用一个名为 `vault` 的密钥仓库。 例如，这可能是已经设置在您的应用程序上的 Hashicorp 密钥仓库组件。 允许 Dapr 应用程序只访问在 `vault` 密钥仓库的 `secret1` 和 `secret2` 密钥， 需要定义下面的 `appconfig.yaml`:

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

此示例定义了名为 `vault` 的密钥仓库配置。 密钥仓库的默认访问权限是`deny`，而有些密钥可以通过应用程序基于`allowedSecrets`列表访问。 按照 [这些说明]({{< ref configuration-concept.md >}}) 将配置应用到 sidecar。

## 场景3：拒绝访问密钥仓库中的某些敏感密钥

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

这个示例使用一个名为 `vault` 的密钥仓库。 上面的配置明确禁止从名为 vault 的密钥仓库访问 `secret1` 和 `secret2` ，但允许访问所有其他密钥。 按照 [这些说明]({{< ref configuration-concept.md >}}) 将配置应用到 sidecar。

## 权限优先级

`allowedSecrets`和`deniedSecrets`列表值优先于`defaultAccess`策略。

| 场景               | 默认权限  | 允许的密钥  | 被拒绝的密钥 | 权限         |
| ---------------- | ----- | ------ | ------ | ---------- |
| 1 - 仅默认访问        | 拒绝/允许 | 为空     | 为空     | 拒绝/允许      |
| 2 - 默认拒绝允许列表     | 拒绝    | ["s1"] | 为空     | 只能访问"s1"   |
| 3 - 默认允许拒绝列表     | 允许    | 为空     | ["s1"] | 仅限"s1"无法访问 |
| 4 - 默认允许允许列表     | 允许    | ["s1"] | 为空     | 只能访问"s1"   |
| 5 - 默认拒绝拒绝列表     | 拒绝    | 为空     | ["s1"] | 拒绝         |
| 6 - 两个列表的默认拒绝/允许 | 拒绝/允许 | ["s1"] | ["s2"] | 只能访问"s1"   |

## 相关链接
* [密钥存储]({{< ref supported-secret-stores.md >}}) 列表
* [密钥存储]({{< ref secret-stores-overview.md >}}) 概述

howto-secrets/