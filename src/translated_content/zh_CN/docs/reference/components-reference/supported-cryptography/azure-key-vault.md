---
type: docs
title: "Azure Key Vault"
linkTitle: "Azure Key Vault"
description: Azure Key Vault 加密组件的详细信息
---

## 组件格式

一个 Dapr `crypto.yaml` 组件文件具有以下结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: crypto.azure.keyvault
  metadata:
  - name: vaultName
    value: mykeyvault
  # 请参阅下文的身份验证部分以了解所有配置选项
  - name: azureTenantId
    value: ${{AzureKeyVaultTenantId}}
  - name: azureClientId
    value: ${{AzureKeyVaultServicePrincipalClientId}}
  - name: azureClientSecret
    value: ${{AzureKeyVaultServicePrincipalClientSecret}}
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来表示密钥。建议使用密钥存储来保护密钥，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 通过 Microsoft Entra ID 进行身份验证

Azure Key Vault 加密组件仅支持通过 Microsoft Entra ID 进行身份验证。在启用此组件之前：

1. 阅读 [Azure 身份验证]({{< ref "authenticating-azure.md" >}}) 文档。
2. 创建一个 [Microsoft Entra ID 应用程序]({{< ref "howto-aad.md" >}})（也称为服务主体）。
3. 或者，为您的应用程序平台创建一个 [托管身份]({{< ref "howto-mi.md" >}})。

## 元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `vaultName`   | 是 | Azure Key Vault 的名称  | `"mykeyvault"` |
| 身份验证元数据 | 是 | 更多信息请参阅 [Azure 身份验证]({{< ref "authenticating-azure.md" >}})  |  |

## 相关链接

- [加密构建块]({{< ref cryptography >}})
- [Azure 身份验证]({{< ref azure-authentication >}})
