---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: 详细介绍了关于 HashiCorp Vault密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## 创建 Vault 组件

要设置HashiCorp Vault密钥仓库，请创建一个类型为`secretstores.hashicorp.vault`的组件。 See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: vault
  namespace: default
spec:
  type: secretstores.hashicorp.vault
  version: v1
  metadata:
  - name: vaultAddr
    value: [vault_address] # Optional. Default: "https://127.0.0.1:8200"
  - name: caCert # Optional. This or caPath or caPem
    value: "[ca_cert]"
  - name: caPath # Optional. This or CaCert or caPem
    value: "[path_to_ca_cert_file]"
  - name: caPem # Optional. This or CaCert or CaPath
    value : "[encoded_ca_cert_pem]"
  - name: skipVerify # Optional. Default: false
    value : "[skip_tls_verification]"
  - name: tlsServerName # Optional.
    value : "[tls_config_server_name]"
  - name: vaultTokenMountPath # Required. Path to token file.
    value : "[path_to_file_containing_token]"
  - name: vaultKVPrefix # Optional. Default: "dapr"
    value : "[vault_prefix]"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## 元数据字段规范

| 字段                  | 必填 | 详情                                               | Example                    |
| ------------------- |:--:| ------------------------------------------------ | -------------------------- |
| vaultAddr           | N  | Vault服务器的地址 默认值为 `"https://127.0.0.1:8200"`      | `"https://127.0.0.1:8200"` |
| caCert              | N  | Certificate Authority只使用其中一个选项。 要使用的加密cacerts    | `"cacerts"`                |
| caPath              | N  | Certificate Authority只使用其中一个选项。 CA证书文件的路径        | `"path/to/cacert/file"`    |
| caPem               | N  | Certificate Authority只使用其中一个选项。 要是用的加密cacert pem | `"encodedpem"`             |
| skipVerify          | N  | 跳过 TLS 验证。 默认值为 `"false"`                        | `"true"`, `"false"`        |
| tlsServerName       | N  | TLS 配置服务器名称                                      | `"tls-server"`             |
| vaultTokenMountPath | Y  | 包含token的文件路径                                     | `"path/to/file"`           |
| vaultKVPrefix       | N  | 仓库前缀 默认值为 `"dapr"`                               | `"dapr"`, `"myprefix"`     |
## 设置 Hashicorp Vault实例

{{< tabs "Self-Hosted" "Kubernetes" >}}

{{% codetab %}}
参考Vault文档设置Hashicorp Vault：https://www.vaultproject.io/docs/install/index.html。
{{% /codetab %}}

{{% codetab %}}
对于Kubernetes，你可以使用Helm Chart：<https://github.com/hashicorp/vault-helm>。
{{% /codetab %}}

{{< /tabs >}}
## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
