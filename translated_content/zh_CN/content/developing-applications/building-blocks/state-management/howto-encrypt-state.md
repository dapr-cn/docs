---
type: docs
title: "操作方法：加密应用程序状态"
linkTitle: "操作方法：加密状态"
weight: 450
description: "自动加密状态并管理密钥轮换"
---

{{% alert title="Preview feature" color="warning" %}}
状态存储加密目前为 [预览版]({{< ref preview-features.md >}})。
{{% /alert %}}

## 介绍

应用程序状态通常需要静态加密，以便在企业工作负载或受监管环境中提供更强的安全性。 Dapr 提供基于 AES256 [的自动客户端加密](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard)。

除了自动加密之外，Dapr 还支持主密钥和辅助加密密钥，使开发人员和运营团队能够更轻松地启用密钥轮换策略。 所有 Dapr 状态存储都支持此功能。

加密密钥是从密钥中提取的，不能作为明文值提供在 `metadata` 部分。

## 启用自动加密

1. 使用标准 [Dapr 配置]({{< ref configuration-overview.md >}})启用状态加密预览功能：

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

现在你有一个 Dapr 状态存储，它被配置为从一个名为 `mysecret` 的秘密中获取加密密钥，在一个名为 `mykey` 的密钥中包含实际的加密密钥。 实际的加密密钥 *必须* 是 AES256 加密密钥。 如果加密密钥无效，Dapr 将出错并退出。

*请注意，秘密存储不一定要支持keys*

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

当Dapr启动时，它将获取包含 `metadata` 部分中列出的加密密钥的秘密。 Dapr 知道哪个状态项已使用哪个密钥自动加密，因为它会将 `secretKeyRef.name` 字段附加到实际状态密钥的末尾。

要轮换密钥，只需将 `primaryEncryptionKey` 更改为指向包含新密钥的机密，然后将旧的主加密密钥移动到 `secondaryEncryptionKey`。 新数据将使用新密钥进行加密，检索到的旧数据将使用辅助密钥进行解密。 对使用旧密钥加密的数据项的任何更新都将使用新密钥重新加密。

## 相关链接
 - [安全性概述]({{< ref "security-concept.md" >}})
 - [状态存储查询 API 实现指南](https://github.com/dapr/components-contrib/blob/master/state/Readme.md#implementing-state-query-api)