---
type: docs
title: "本地存储"
linkTitle: "本地存储"
description: 本地存储加密组件的详细信息
---

## 组件格式

该组件用于从本地目录加载密钥。

组件接受文件夹名称作为输入，并从该文件夹加载密钥。每个密钥存储在单独的文件中，当用户请求某个名称的密钥时，Dapr 会加载对应名称的文件。

支持的文件格式：

- 包含公钥和私钥的 PEM（支持：PKCS#1, PKCS#8, PKIX）
- 包含公钥、私钥或对称密钥的 JSON Web Key (JWK)
- 对称密钥的原始密钥数据

{{% alert title="注意" color="primary" %}}
此组件使用 Dapr 的加密引擎进行操作。尽管密钥从未直接暴露给您的应用程序，但 Dapr 可以访问原始密钥数据。
{{% /alert %}}

一个 Dapr `crypto.yaml` 组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mycrypto
spec:
  type: crypto.dapr.localstorage
  metadata:
    version: v1
    - name: path
      value: /path/to/folder/
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保存密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `path`             | Y    | 包含要加载的密钥的文件夹。加载密钥时，密钥的名称将用作此文件夹中文件的名称。  | `/path/to/folder` |

**示例**

假设您设置了 `path=/mnt/keys`，其中包含以下文件：

- `/mnt/keys/mykey1.pem`
- `/mnt/keys/mykey2`

使用组件时，您可以将密钥引用为 `mykey1.pem` 和 `mykey2`。

## 相关链接
[加密构建块]({{< ref cryptography >}})
