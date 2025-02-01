---
type: docs
title: "操作指南：加密应用程序状态"
linkTitle: "操作指南：加密状态"
weight: 450
description: "自动加密应用程序状态并管理密钥轮换"

---

对静态应用程序状态进行加密，以在企业工作负载或受监管环境中提供更强的安全性。Dapr 提供基于 [AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard) 的自动客户端加密，采用 [Galois/Counter Mode (GCM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)，支持 128、192 和 256 位的密钥。

除了自动加密，Dapr 还支持主加密密钥和次加密密钥，使开发人员和运维团队更容易启用密钥轮换策略。此功能由所有 Dapr 状态存储支持。

加密密钥始终从 secret 中获取，不能在 `metadata` 部分中以明文形式提供。

## 启用自动加密

将以下 `metadata` 部分添加到任何 Dapr 支持的状态存储中：

```yaml
metadata:
- name: primaryEncryptionKey
  secretKeyRef:
    name: mysecret
    key: mykey # key 是可选的。
```

例如，这是一个 Redis 加密状态存储的完整 YAML：

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

现在，您已配置了一个 Dapr 状态存储，以从名为 `mysecret` 的 secret 中获取加密密钥，其中包含名为 `mykey` 的实际加密密钥。

实际的加密密钥*必须*是有效的、十六进制编码的加密密钥。虽然支持 192 位和 256 位密钥，但建议使用 128 位加密密钥。如果加密密钥无效，Dapr 会报错并退出。

例如，您可以使用以下命令生成一个随机的、十六进制编码的 128 位（16 字节）密钥：

```sh
openssl rand 16 | hexdump -v -e '/1 "%02x"'
# 结果将类似于 "cb321007ad11a9d23f963bff600d58e0"
```

*注意，secret 存储不必支持密钥。*

## 密钥轮换

为了支持密钥轮换，Dapr 提供了一种指定次加密密钥的方法：

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

当 Dapr 启动时，它会获取 `metadata` 部分中列出的包含加密密钥的 secrets。Dapr 自动识别哪个状态项是用哪个密钥加密的，因为它会将 `secretKeyRef.name` 字段附加到实际状态密钥的末尾。

要轮换密钥，

1. 更改 `primaryEncryptionKey` 以指向包含新密钥的 secret。
2. 将旧的主加密密钥移至 `secondaryEncryptionKey`。

新数据将使用新密钥加密，任何检索到的旧数据将使用次密钥解密。

使用旧密钥加密的数据项的任何更新都将使用新密钥重新加密。

{{% alert title="注意" color="primary" %}}
当您轮换密钥时，除非您的应用程序再次写入，否则不会自动重新加密使用旧密钥加密的数据。如果您删除了轮换的密钥（即现在的次加密密钥），您将无法访问使用该密钥加密的数据。

{{% /alert %}}

## 相关链接

- [安全概述]({{< ref "security-concept.md" >}})
- [状态存储查询 API 实现指南](https://github.com/dapr/components-contrib/blob/master/state/README.md#implementing-state-query-api)
- [状态存储组件]({{< ref "supported-state-stores.md" >}})