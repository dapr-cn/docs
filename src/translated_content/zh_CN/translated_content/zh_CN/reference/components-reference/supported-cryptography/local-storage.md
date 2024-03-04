---
type: docs
title: "Local storage"
linkTitle: "Local storage"
description: Detailed information on the local storage cryptography component
---

## Component format

The purpose of this component is to load keys from a local directory.

The component accepts as input the name of a folder, and loads keys from there. Each key is in its own file, and when users request a key with a given name, Dapr loads the file with that name.

Supported file formats:

- PEM with public and private keys (supports: PKCS#1, PKCS#8, PKIX)
- JSON Web Key (JWK) containing a public, private, or symmetric key
- Raw key data for symmetric keys

{{% alert title="Note" color="primary" %}}
This component uses the cryptographic engine in Dapr to perform operations. Although keys are never exposed to your application, Dapr has access to the raw key material.

{{% /alert %}}


A Dapr `crypto.yaml` component file has the following structure:

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

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field  | Required | 详情                                                                                                                                | 示例                |
| ------ |:--------:| --------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `path` |    是     | Folder containing the keys to be loaded. When loading a key, the name of the key will be used as name of the file in this folder. | `/path/to/folder` |

**示例**

Let's say you've set `path=/mnt/keys`, which contains the following files:

- `/mnt/keys/mykey1.pem`
- `/mnt/keys/mykey2`

When using the component, you can reference the keys as `mykey1.pm` and `mykey2`.

## 相关链接
[Cryptography building block]({{< ref cryptography >}})
