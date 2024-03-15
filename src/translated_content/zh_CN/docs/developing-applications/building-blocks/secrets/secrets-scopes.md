---
type: docs
title: "操作方法: 使用秘钥的作用域限定"
linkTitle: "操作方法: 使用秘钥的作用域限定"
weight: 3000
description: 应用程序从秘钥存储介质中读取时，需要使用作用域来限定
---

一旦你[为应用程序配置了密钥存储]({{< ref setup-secret-store >}})，_任何_在该存储中定义的密钥都可以默认从Dapr应用程序中访问。

您可以通过定义密钥范围来限制 Dapr 应用程序对特定密钥的访问。 只需将机密范围策略 [添加到应用程序配置]({{< ref configuration-concept.md >}})中，即可获得限制性权限。

密钥范围策略适用于任何 [密钥存储]({{< ref supported-secret-stores.md >}})，包括：

- 本地密钥存储
- 一个Kubernetes密钥存储
- 一个公共云密钥存储

要了解如何设置[密钥存储]({{< ref setup-secret-store.md >}})，请阅读[如何：检索秘密]({{< ref howto-secrets.md >}})。

观看 [this video](https://youtu.be/j99RN_nxExA?start=2272) 以了解如何在您的应用程序中使用密钥范围。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Scenario 1 : Deny access to all secrets for a secret store

在这个例子中，运行在 Kubernetes 集群上的应用程序的所有秘密访问都被拒绝，该集群有一个配置名为 mycustomsecretstore 的 [Kubernetes 秘密存储]({{< ref kubernetes-secret-store >}})。 除了用户定义的自定义存储之外，该示例还配置了Kubernetes默认存储（命名为 `kubernetes`），以确保所有密钥都被拒绝访问。 [了解有关Kubernetes默认密钥存储]({{< ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component" >}})的更多信息。

定义下面的 `appconfig.yaml` 配置，并使用命令 `kubectl apply -f appconfig.yaml` 应用到 Kubernetes 集群。

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

对于需要拒绝访问Kubernetes密钥存储的应用程序，请按照[这些说明]({{< ref kubernetes-overview\.md >}})，并将以下注解添加到应用程序pod中：

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 密钥仓库的任何密钥。

## Scenario 2 : Allow access to only certain secrets in a secret store

这个示例使用一个名为 `vault` 的密钥存储。 这可能是已经设置在您的应用程序上的Hashicorp密钥存储组件。 为了让 Dapr 应用程序只能访问 `vault` 密钥存储中的 `secret1` 和 `secret2`，请定义以下 `appconfig.yaml`：

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

默认访问`vault`密钥存储是`deny`，而一些密钥可以根据`allowedSecrets`列表由应用程序访问。 [学习如何将配置应用到 sidecar]（{{< ref configuration-concept.md >}}）。

## Scenario 3: Deny access to certain sensitive secrets in a secret store

Define the following `config.yaml`:

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

这个示例配置明确禁止从名为`vault`的密钥存储访问`secret1`和`secret2`，同时允许访问所有其他密钥。 [学习如何将配置应用到 sidecar]（{{< ref configuration-concept.md >}}）。

## Permission priority

`allowedSecrets`和`deniedSecrets`列表值优先于`defaultAccess`策略。

| Scenarios                              | defaultAccess | allowedSecrets                                             | deniedSecrets                                              | permission                   |
| -------------------------------------- | ------------- | ---------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| 1 - Only default access                | deny/allow    | empty                                                      | empty                                                      | deny/allow                   |
| 2 - Default deny with allowed list     | deny          | ["s1"] | empty                                                      | only "s1" can be accessed    |
| 3 - 默认为允许的拒绝列表                         | allow         | empty                                                      | ["s1"] | only "s1" cannot be accessed |
| 4 - Default allow with allowed list    | allow         | ["s1"] | empty                                                      | only "s1" can be accessed    |
| 5 - Default deny with denied list      | deny          | empty                                                      | ["s1"] | deny                         |
| 6 - Default deny/allow with both lists | deny/allow    | ["s1"] | ["s2"] | only "s1" can be accessed    |

## 相关链接

- [密钥存储列表]({{< ref supported-secret-stores.md >}})
- [密钥存储]({{< ref setup-secret-store.md >}})概述
