---
type: docs
title: "操作方法：加密应用程序 state"
linkTitle: "操作方法：加密状态"
weight: 450
description: "自动加密状态并管理密钥轮换"
---

{{% alert title="Preview feature" color="warning" %}}
状态存储加密目前为 [预览版]({{< ref preview-features.md >}})。
{{% /alert %}}

## 介绍

应用程序状态通常需要静态加密，以便在企业工作负载或受监管环境中提供更强的安全性。 Dapr提供基于AES256[的自动客户端加密](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)。

除了自动加密之外，Dapr 还支持主密钥和辅助加密密钥，使开发人员和运营团队能够更轻松地启用密钥轮换策略。 所有 Dapr 状态存储都支持此功能。

加密密钥是从密钥中提取的，不能作为明文值提供在 `metadata` 部分。

## 启用自动加密

1. 使用标准 [Dapr配置]({{< ref configuration-overview.md >}})启用状态加密预览功能：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: stateconfig
spec:
  features:
    - name: State.Encryption
      enabled: true
```

2. 将以下 `metadata` 部分添加到任何 Dapr 支持的状态存储中：

```yaml
metadata:
- name: primaryEncryptionKey
  secretKeyRef:
    name: mysecret
    key: mykey # key is optional.
```

例如，这是 Redis 加密状态存储的完整 YAML

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: primaryEncryptionKey
    secretKeyRef:
      name: mysecret
      key: mykey
```

You now have a Dapr state store that's configured to fetch the encryption key from a secret named `mysecret`, containing the actual encryption key in a key named `mykey`. The actual encryption key *must* be an AES256 encryption key. Dapr will error and exit if the encryption key is invalid.

*Note that the secret store does not have to support keys*

## Key rotation

To support key rotation, Dapr provides a way to specify a secondary encryption key:

```yaml
metadata:
- name: primaryEncryptionKey
    secretKeyRef:
      name: mysecret
      key: mykey
- name: secondaryEncryptionKey
    secretKeyRef:
      name: mysecret2
      key: mykey2
```

When Dapr starts, it will fetch the secrets containing the encryption keys listed in the `metadata` section. Dapr knows which state item has been encrypted with which key automatically, as it appends the `secretKeyRef.name` field to the end of the actual state key.

To rotate a key, simply change the `primaryEncryptionKey` to point to a secret containing your new key, and move the old primary encryption key to the `secondaryEncryptionKey`. New data will be encrypted using the new key, and old data that's retrieved will be decrypted using the secondary key. Any updates to data items encrypted using the old key will be re-encrypted using the new key.
