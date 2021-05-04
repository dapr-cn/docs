---
type: docs
title: "HashiCorp Vault"
linkTitle: "HashiCorp Vault"
description: 详细介绍了关于 HashiCorp Vault密钥仓库组件的信息
aliases:
  - "/operations/components/setup-secret-store/supported-secret-stores/hashicorp-vault/"
---

## 创建 Vault 组件

要设置HashiCorp Vault密钥仓库，请创建一个类型为`secretstores.hashicorp.vault`的组件。 请参阅 [本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})，了解如何创建和应用 secretstore 配置。 请参阅本指南 [引用密钥]({{< ref component-secrets.md >}}) 来检索和使用Dapr组件的密钥。

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
以上示例将 Secret 明文存储。 建议将密钥存储在本地，如 [Kubernetes密钥仓库]({{< ref kubernetes-secret-store.md >}})或 [本地文件]({{< ref file-secret-store.md >}})来安全地存储密钥。
{{% /alert %}}

## 元数据字段规范

| 字段                  | 必填 | 详情                                               | 示例                         |
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