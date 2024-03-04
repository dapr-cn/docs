---
type: docs
title: "Azure Key Vault"
linkTitle: "Azure Key Vault"
description: Detailed information on the Azure Key Vault cryptography component
---

## Component format

A Dapr `crypto.yaml` component file has the following structure:

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
  # See authentication section below for all options
  - name: azureTenantId
    value: ${{AzureKeyVaultTenantId}}
  - name: azureClientId
    value: ${{AzureKeyVaultServicePrincipalClientId}}
  - name: azureClientSecret
    value: ${{AzureKeyVaultServicePrincipalClientSecret}}
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## Authenticating with Microsoft Entra ID

The Azure Key Vault cryptography component supports authentication with Microsoft Entra ID only. Before you enable this component:

1. Read the [Authenticating to Azure]({{< ref "authenticating-azure.md" >}}) document.
1. Create an [Microsoft Entra ID application]({{< ref "howto-aad.md" >}}) (also called a Service Principal).
1. Alternatively, create a [managed identity]({{< ref "howto-mi.md" >}}) for your application platform.

## 元数据字段规范

| Field         | Required | 详情                                                                                        | 示例             |
| ------------- |:--------:| ----------------------------------------------------------------------------------------- | -------------- |
| `vaultName`   |    是     | Azure Key Vault name                                                                      | `"mykeyvault"` |
| Auth metadata |    是     | See [Authenticating to Azure]({{< ref "authenticating-azure.md" >}}) for more information |                |

## 相关链接

- [Cryptography building block]({{< ref cryptography >}})
- [Authenticating to Azure]({{< ref azure-authentication >}})