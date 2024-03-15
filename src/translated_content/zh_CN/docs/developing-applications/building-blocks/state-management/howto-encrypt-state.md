---
type: docs
title: 操作方法：加密应用程序状态
linkTitle: 操作方法：加密状态
weight: 450
description: 自动加密状态并管理密钥轮换
---

对应用程序静态状态进行加密，以在企业工作负载或受监管的环境中提供更强大的安全性。 Dapr提供基于[AES](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)的自动客户端端加密，使用[Galois/Counter Mode (GCM)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)，支持128、192和256位的密钥。

除了自动加密之外，Dapr 还支持主密钥和辅助加密密钥，使开发人员和运营团队能够更轻松地启用密钥轮换策略。 所有 Dapr 状态存储都支持此功能。

加密密钥始终从密钥中提取，不能作为明文值提供在`metadata`部分。

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

现在你有一个Dapr状态存储，它被配置为从一个名为`mysecret`的密钥中获取加密密钥，在一个名为`mykey`的密钥中包含实际的加密密钥。

实际的加密密钥 _必须_ 是一个有效的、十六进制编码的加密密钥。 虽然支持192位和256位密钥，但建议您使用128位加密密钥。 如果加密密钥无效，Dapr 将出错并退出。

例如，您可以使用以下方法生成一个随机的十六进制编码的128位（16字节）密钥：

```sh
openssl rand 16 | hexdump -v -e '/1 "%02x"'
# Result will be similar to "cb321007ad11a9d23f963bff600d58e0"
```

_请注意，密钥存储不一定要支持keys._

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

当Dapr启动时，它将获取包含在`metadata`部分中列出的加密密钥的秘密。 Dapr 自动知道哪个状态项已使用哪个密钥加密，因为它会将 `secretKeyRef.name` 字段附加到实际状态密钥的末尾。

要旋转密钥，

1. 将`primaryEncryptionKey`更改为指向包含您新密钥的秘密。
2. 将旧的主加密密钥移动到`secondaryEncryptionKey`。

新数据将使用新密钥进行加密，检索到的旧数据将使用辅助密钥进行解密。

对使用旧密钥加密的数据项的任何更新都将使用新密钥重新加密。

{{% alert title="注意" color="primary" %}}
当您旋转密钥时，使用旧密钥加密的数据不会自动重新加密，除非您的应用程序再次写入它。 如果您移除旋转的密钥（现在是次要的加密密钥），您将无法访问使用该密钥加密的数据。



## 相关链接

- [安全概述]({{< ref "security-concept.md" >}})
- [状态存储查询API实现指南](https://github.com/dapr/components-contrib/blob/master/state/README.md#implementing-state-query-api)
- [状态存储组件]({{< ref "supported-state-stores.md" >}})
