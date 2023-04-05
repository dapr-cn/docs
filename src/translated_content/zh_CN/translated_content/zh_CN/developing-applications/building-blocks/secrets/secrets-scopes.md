---
type: docs
title: "How To: Use secret scoping"
linkTitle: "How To: Use secret scoping"
weight: 3000
description: "Use scoping to limit the secrets that can be read by your application from secret stores"
---

Once you [configure a secret store for your application]({{< ref setup-secret-store >}}), *any* secret defined within that store is accessible by default from the Dapr application.

You can limit the Dapr application's access to specific secrets by defining secret scopes. Simply add a secret scope policy [to the application configuration]({{< ref configuration-concept.md >}}) with restrictive permissions.

The secret scoping policy applies to any [secret store]({{< ref supported-secret-stores.md >}}), including:

- A local secret store
- A Kubernetes secret store
- A public cloud secret store

For details on how to set up a [secret store]({{< ref setup-secret-store.md >}}), read [How To: Retrieve a secret]({{< ref howto-secrets.md >}}).

Watch [this video](https://youtu.be/j99RN_nxExA?start=2272) for a demo on how to use secret scoping with your application.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="688" height="430" src="https://www.youtube-nocookie.com/embed/j99RN_nxExA?start=2272" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## Scenario 1 : Deny access to all secrets for a secret store

In this example, all secret access is denied to an application running on a Kubernetes cluster, which has a configured [Kubernetes secret store]({{< ref kubernetes-secret-store >}}) named `mycustomsecretstore`. Aside from the user-defined custom store, the example also configures the Kubernetes default store (named `kubernetes`) to ensure all secrets are denied access. [Learn more about the Kubernetes default secret store]({{< ref "kubernetes-secret-store.md#default-kubernetes-secret-store-component" >}}).

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

For applications that need to be denied access to the Kubernetes secret store, follow [these instructions]({{< ref kubernetes-overview.md >}}), and add the following annotation to the application pod:

```yaml
dapr.io/config: appconfig
```

定义后，应用程序不再能访问 Kubernetes 密钥仓库的任何密钥。

## 场景2：只允许访问秘密仓库中的某些秘密

This example uses a secret store named `vault`. This could be a Hashicorp secret store component set on your application. To allow a Dapr application to have access to only `secret1` and `secret2` in the `vault` secret store, define the following `appconfig.yaml`:

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

The default access to the `vault` secret store is `deny`, while some secrets are accessible by the application, based on the `allowedSecrets` list. \[Learn how to apply configuration to the sidecar]\]({{< ref configuration-concept.md >}}).

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

This example configuration explicitly denies access to `secret1` and `secret2` from the secret store named `vault` while allowing access to all other secrets. \[Learn how to apply configuration to the sidecar]\]({{< ref configuration-concept.md >}}).

## 权限优先级

`allowedSecrets`和`deniedSecrets`列表值优先于`defaultAccess`策略。

| Scenarios                              | 默认权限       | 允许的密钥  | 被拒绝的密钥 | 权限         |
| -------------------------------------- | ---------- | ------ | ------ | ---------- |
| 1 - Only default access                | deny/allow | empty  | empty  | deny/allow |
| 2 - Default deny with allowed list     | deny       | ["s1"] | 为空     | 只能访问"s1"   |
| 3 - Default allow with deneied list    | allow      | 为空     | ["s1"] | 仅限"s1"无法访问 |
| 4 - Default allow with allowed list    | allow      | ["s1"] | 为空     | 只能访问"s1"   |
| 5 - Default deny with denied list      | deny       | 为空     | ["s1"] | deny       |
| 6 - Default deny/allow with both lists | 拒绝/允许      | ["s1"] | ["s2"] | 只能访问"s1"   |

## 相关链接

- List of [secret stores]({{< ref supported-secret-stores.md >}})
- Overview of [secret stores]({{< ref setup-secret-store.md >}})