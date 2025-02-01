---
type: docs
title: "Azure 身份验证"
linkTitle: "概述"
description: "如何使用 Microsoft Entra ID 和/或托管身份验证 Azure 组件"
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/zh-hans/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
weight: 10000
---

大多数 Dapr 的 Azure 组件支持使用 Microsoft Entra ID 进行身份验证。通过这种方式：

- 管理员可以充分利用 Azure 基于角色的访问控制 (RBAC) 的精细权限。
- 在 Azure 服务（如 Azure 容器应用、Azure Kubernetes 服务、Azure 虚拟机或其他 Azure 平台服务）上运行的应用程序可以使用 [托管身份 (MI)](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) 和 [工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview)。这些功能使您的应用程序能够在不需要管理敏感凭据的情况下进行身份验证。

## 关于 Microsoft Entra ID 的身份验证

Microsoft Entra ID 是 Azure 的身份和访问管理 (IAM) 解决方案，用于对用户和服务进行身份验证和授权。

Microsoft Entra ID 基于 OAuth 2.0 等开放标准，允许服务（应用程序）获取访问令牌以请求 Azure 服务，包括 Azure 存储、Azure 服务总线、Azure 密钥保管库、Azure Cosmos DB、Azure PostgreSQL 数据库、Azure SQL 等。

> 在 Azure 术语中，应用程序也被称为“服务主体”。

一些 Azure 组件提供其他身份验证方法，例如基于“共享密钥”或“访问令牌”的系统。尽管这些方法在 Dapr 中是有效且受支持的，但建议尽可能使用 Microsoft Entra ID 对 Dapr 组件进行身份验证，以利用其众多优势，包括：

- [托管身份和工作负载身份](#托管身份和工作负载身份)
- [基于角色的访问控制](#基于角色的访问控制)
- [审计](#审计)
- [（可选）使用证书进行身份验证](#可选使用证书进行身份验证)

### 托管身份和工作负载身份

使用托管身份 (MI)，您的应用程序可以通过 Microsoft Entra ID 进行身份验证并获取访问令牌以请求 Azure 服务。当您的应用程序在支持的 Azure 服务（如 Azure 虚拟机、Azure 容器应用、Azure Web 应用等）上运行时，可以在基础设施级别为您的应用程序分配一个身份。

使用 MI 后，您的代码无需处理凭据，这样可以：

- 消除安全管理凭据的挑战
- 允许开发和运营团队之间更好的职责分离
- 减少有权访问凭据的人员数量
- 简化操作，尤其是在使用多个环境时

在 Azure Kubernetes 服务上运行的应用程序可以类似地利用 [工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview) 自动为单个 pod 提供身份。

### 基于角色的访问控制

使用支持服务的 Azure 基于角色的访问控制 (RBAC) 时，可以对应用程序授予的权限进行精细调整。例如，您可以限制对数据子集的访问或将访问权限设为只读。

### 审计

使用 Microsoft Entra ID 提供了改进的访问审计体验。租户的管理员可以查阅审计日志以跟踪身份验证请求。

### （可选）使用证书进行身份验证

虽然 Microsoft Entra ID 允许您使用 MI，但您仍然可以选择使用证书进行身份验证。

## 对其他 Azure 环境的支持

默认情况下，Dapr 组件配置为与“公共云”中的 Azure 资源交互。如果您的应用程序部署到其他云（如 Azure 中国或 Azure 政府“主权云”），您可以通过将 `azureEnvironment` 元数据属性设置为以下支持的值之一来启用该功能：

- Azure 公共云（默认）：`"AzurePublicCloud"`
- Azure 中国：`"AzureChinaCloud"`
- Azure 政府：`"AzureUSGovernmentCloud"`

> 对主权云的支持是实验性的。

## 凭据元数据字段

要使用 Microsoft Entra ID 进行身份验证，您需要将以下凭据作为值添加到您的 [Dapr 组件](#在-dapr-组件中的示例用法) 的元数据中。

### 元数据选项

根据您向 Dapr 服务传递凭据的方式，您有多种元数据选项。

- [使用客户端凭据](#使用客户端凭据进行身份验证)
- [使用证书](#使用证书进行身份验证)
- [使用托管身份 (MI)](#使用托管身份-mi进行身份验证)
- [在 AKS 上使用工作负载身份](#在-aks-上使用工作负载身份进行身份验证)
- [使用 Azure CLI 凭据（仅限开发）](#使用-azure-cli-凭据进行身份验证仅限开发)

#### 使用客户端凭据进行身份验证

| 字段               | 必需 | 详情                              | 示例                                      |
|---------------------|----------|--------------------------------------|----------------------------------------------|
| `azureTenantId`     | Y        | Microsoft Entra ID 租户的 ID            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y        | 客户端 ID（应用程序 ID）           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y        | 客户端密钥（应用程序密码） | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

在 Kubernetes 上运行时，您还可以使用对 Kubernetes secret 的引用来获取上述任何或所有值。

#### 使用证书进行身份验证

| 字段 | 必需 | 详情 | 示例 |
|--------|--------|--------|--------|
| `azureTenantId` | Y | Microsoft Entra ID 租户的 ID | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"` |
| `azureClientId` | Y | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |
| `azureCertificate` | `azureCertificate` 和 `azureCertificateFile` 之一 | 证书和私钥（PFX/PKCS#12 格式） | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile` | `azureCertificate` 和 `azureCertificateFile` 之一 | 包含证书和私钥的 PFX/PKCS#12 文件的路径 | `"/path/to/file.pem"` |
| `azureCertificatePassword` | N | 如果加密，证书的密码 | `"password"` |

在 Kubernetes 上运行时，您还可以使用对 Kubernetes secret 的引用来获取上述任何或所有值。

#### 使用托管身份 (MI) 进行身份验证

| 字段           | 必需 | 详情                    | 示例                                  |
|-----------------|----------|----------------------------|------------------------------------------|
| `azureClientId` | N        | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

[使用托管身份]({{< ref howto-mi.md >}})，通常推荐使用 `azureClientId` 字段。使用系统分配的身份时该字段是可选的，但使用用户分配的身份时可能是必需的。

#### 在 AKS 上使用工作负载身份进行身份验证

在 Azure Kubernetes 服务 (AKS) 上运行时，您可以使用工作负载身份对组件进行身份验证。请参阅 Azure AKS 文档以了解如何为您的 Kubernetes 资源 [启用工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview)。

#### 使用 Azure CLI 凭据进行身份验证（仅限开发）

> **重要提示：** 此身份验证方法仅推荐用于 **开发**。

此身份验证方法在本地机器上开发时可能很有用。您将需要：

- 安装 [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli)
- 使用 `az login` 命令成功进行身份验证

当 Dapr 在主机上运行时，如果 Azure CLI 有可用的凭据，组件可以自动使用这些凭据进行身份验证，而无需配置其他身份验证方法。

使用此身份验证方法不需要设置任何元数据选项。

### 在 Dapr 组件中的示例用法

在此示例中，您将设置一个使用 Microsoft Entra ID 进行身份验证的 Azure 密钥保管库 secret 存储组件。

{{< tabs "自托管" "Kubernetes">}}

{{% codetab %}}

要使用 **客户端密钥**，请在组件目录中创建一个名为 `azurekeyvault.yaml` 的文件，并填写上述设置过程中的详细信息：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

如果您想使用保存在本地磁盘上的 **证书**，请改用：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
  namespace: default
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: "[your_keyvault_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```
{{% /codetab %}}

{{% codetab %}}
在 Kubernetes 中，您将客户端密钥或证书存储到 Kubernetes Secret Store 中，然后在 YAML 文件中引用它们。

要使用 **客户端密钥**：

1. 使用以下命令创建一个 Kubernetes secret：

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` 是上面生成的应用程序客户端密钥
    - `[your_k8s_secret_name]` 是 Kubernetes secret store 中的 secret 名称
    - `[your_k8s_secret_key]` 是 Kubernetes secret store 中的 secret 键

1. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 使用 `auth` 属性引用 Kubernetes secretstore，并且 `secretKeyRef` 引用存储在 Kubernetes secret store 中的客户端密钥。

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureClientSecret
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. 应用 `azurekeyvault.yaml` 组件：

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

要使用 **证书**：

1. 使用以下命令创建一个 Kubernetes secret：

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` 是您之前获取的 PFX 文件的路径
    - `[your_k8s_secret_name]` 是 Kubernetes secret store 中的 secret 名称
    - `[your_k8s_secret_key]` 是 Kubernetes secret store 中的 secret 键

1. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 使用 `auth` 属性引用 Kubernetes secretstore，并且 `secretKeyRef` 引用存储在 Kubernetes secret store 中的证书。

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
      namespace: default
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
      - name: azureTenantId
        value: "[your_tenant_id]"
      - name: azureClientId
        value: "[your_client_id]"
      - name: azureCertificate
        secretKeyRef:
          name: "[your_k8s_secret_name]"
          key: "[your_k8s_secret_key]"
    auth:
      secretStore: kubernetes
    ```

1. 应用 `azurekeyvault.yaml` 组件：

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="生成新的 Microsoft Entra ID 应用程序和服务主体 >>" page="howto-aad.md" >}}

## 参考资料

- [Microsoft Entra ID 应用凭据：Azure CLI 参考](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure 托管服务身份 (MSI) 概述](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets 构建块]({{< ref secrets >}})
- [操作指南：检索 secret]({{< ref "howto-secrets.md" >}})
- [操作指南：在 Dapr 组件中引用 secret]({{< ref component-secrets.md >}})
- [Secrets API 参考]({{< ref secrets_api.md >}})
`