---
type: docs
title: "如何: 使用秘钥的作用域限定"
linkTitle: "如何 : 使用秘钥的作用域限定"
weight: 3000
description: "应用程序从秘钥存储介质中读取时，需要使用作用域来限定"
---

您可以阅读 [设置密钥仓库组件指南]({{< ref setup-secret-store >}}) 以配置应用程序的密钥仓库。 一旦配置完毕，默认情况下 *任何* 该仓库内定义的密钥都可以从 Dapr 应用程序访问。

To limit the secrets to which the Dapr application has access to, you can can define secret scopes by adding a secret scope policy to the application configuration with restrictive permissions. 按照 [这些说明]({{< ref configuration-concept.md >}}) 来定义应用程序配置。

密钥作用域适用于任何 [密钥仓库]({{< ref supported-secret-stores.md >}})， 是否是本地密钥仓库、Kubernetes 密钥仓库或公共云密钥仓库。 关于如何设置一个 [密钥仓库]({{< ref setup-secret-store.md >}}) 查看 [指南：获取密钥]({{< ref howto-secrets.md >}})

观看这个 [视频](https://youtu.be/j99RN_nxExA?start=2272) 演示如何让你的应用程序使用密钥作用域。
<iframe width="688" height="430" src="https://www.youtube.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 场景1：拒绝访问所有密钥仓库

This example uses Kubernetes. The native Kubernetes secret store is added to you Dapr application by default. 在某些情况下，可能有必要拒绝某个应用程序访问 Dapr 密钥。 要添加此配置，请按照下面的步骤：

Define the following `appconfig.yaml` configuration and apply it to the Kubernetes cluster using the command `kubectl apply -f appconfig.yaml`.

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

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview.md >}}), and add the following annotation to the application pod.

```yaml
dapr.io/config: appconfig
```

With this defined, the application no longer has access to any secrets in the Kubernetes secret store.

## 场景2：只允许访问密钥仓库中的某些密钥

This example uses a secret store that is named `vault`. For example this could be a Hashicorp secret store component that has been set on your application. To allow a Dapr application to have access to only certain secrets `secret1` and `secret2` in the `vault` secret store, define the following `appconfig.yaml`:

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

This example defines configuration for secret store named `vault`. 密钥仓库的默认访问权限是`deny`，而有些密钥可以通过应用程序基于`allowedSecrets`列表访问。 Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

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

This example uses a secret store that is named `vault`. 上面的配置明确禁止从名为 vault 的密钥仓库访问 `secret1` 和 `secret2` ，但允许访问所有其他密钥。 Follow [these instructions]({{< ref configuration-concept.md >}}) to apply configuration to the sidecar.

## 权限优先级

The `allowedSecrets` and `deniedSecrets` list values take priority over the `defaultAccess` policy.

| 场景               | 默认权限  | allowedSecrets | deniedSecrets | 权限         |
| ---------------- | ----- | -------------- | ------------- | ---------- |
| 1 - 仅默认访问        | 拒绝/允许 | 为空             | 为空            | 拒绝/允许      |
| 2 - 默认拒绝允许列表     | 拒绝    | ["s1"]         | 为空            | 只能访问"s1"   |
| 3 - 默认允许拒绝列表     | 允许    | 为空             | ["s1"]        | 仅限"s1"无法访问 |
| 4 - 默认允许允许列表     | 允许    | ["s1"]         | 为空            | 只能访问"s1"   |
| 5 - 默认拒绝拒绝列表     | 拒绝    | 为空             | ["s1"]        | 拒绝         |
| 6 - 两个列表的默认拒绝/允许 | 拒绝/允许 | ["s1"]         | ["s2"]        | 只能访问"s1"   |

## 相关链接
* [密钥存储]({{< ref supported-secret-stores.md >}}) 列表
* [密钥存储]({{< ref setup-secret-store.md >}}) 概述

howto-secrets/