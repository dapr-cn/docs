---
type: docs
title: "操作方法：加密应用程序状态"
linkTitle: "操作方法：加密状态"
weight: 450
description: "自动加密状态并管理密钥轮换"
---

Encrypt application state at rest to provide stronger security in enterprise workloads or regulated environments. Dapr offers automatic client-side encryption based on [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) in [Galois/Counter Mode (GCM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode), supporting keys of 128, 192, and 256-bits.

除了自动加密之外，Dapr 还支持主密钥和辅助加密密钥，使开发人员和运营团队能够更轻松地启用密钥轮换策略。 所有 Dapr 状态存储都支持此功能。

The encryption keys are always fetched from a secret, and cannot be supplied as plaintext values on the `metadata` section.

## 启用自动加密

将以下 `metadata` 部分添加到任何 Dapr 支持的状态存储中：

```yaml
metadata:
- name: primaryEncryptionKey
  secretKeyRef:
    name: mysecret
    key: mykey # key is optional.
```

例如，这是 Redis 加密状态存储的完整 YAML:

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

You now have a Dapr state store configured to fetch the encryption key from a secret named `mysecret`, containing the actual encryption key in a key named `mykey`.

The actual encryption key *must* be a valid, hex-encoded encryption key. While 192-bit and 256-bit keys are supported, it's recommended you use 128-bit encryption keys. Dapr errors and exists if the encryption key is invalid.

For example, you can generate a random, hex-encoded 128-bit (16-byte) key with:

```sh
openssl rand 16 | hexdump -v -e '/1 "%02x"'
# Result will be similar to "cb321007ad11a9d23f963bff600d58e0"
```

*请注意，秘密存储不一定要支持keys.*

## 密钥轮换

为了支持密钥轮换，Dapr 提供了一种指定辅助加密密钥的方法：

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

When Dapr starts, it fetches the secrets containing the encryption keys listed in the `metadata` section. Dapr automatically knows which state item has been encrypted with which key, as it appends the `secretKeyRef.name` field to the end of the actual state key.

To rotate a key,

1. Change the `primaryEncryptionKey` to point to a secret containing your new key.
1. Move the old primary encryption key to the `secondaryEncryptionKey`.

New data will be encrypted using the new key, and any retrieved old data  will be decrypted using the secondary key.

Any updates to data items encrypted with the old key will be re-encrypted using the new key.

{{% alert title="Note" color="primary" %}}
when you rotate a key, data encrypted with the old key is not automatically re-encrypted unless your application writes it again. If you remove the rotated key (the now-secondary encryption key), you will not be able to access data that was encrypted with that.

{{% /alert %}}

## 相关链接

- [安全性概述]({{< ref "security-concept.md" >}})
- [状态存储查询 API 实现指南](https://github.com/dapr/components-contrib/blob/master/state/Readme.md#implementing-state-query-api)
- [State store components]({{< ref "supported-state-stores.md" >}})
