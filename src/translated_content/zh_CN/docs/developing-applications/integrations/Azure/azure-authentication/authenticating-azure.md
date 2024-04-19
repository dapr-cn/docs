---
type: docs
title: 向 Azure 进行身份验证
linkTitle: 概述
description: 如何使用 Microsoft Entra ID 和/或托管身份认证 Azure 组件
aliases:
  - /zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/
  - /zh-hans/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/
weight: 10000
---

大多数用于 Dapr 的 Azure 组件都支持使用 Microsoft Entra ID 进行身份验证。 多亏了这一点：

- 管理员可以利用Azure基于角色的访问控制（RBAC）的所有优势来进行细粒度权限管理。
- 在 Azure 服务（如 Azure Container Apps、Azure Kubernetes Service、Azure VM 或任何其他 Azure 平台服务）上运行的应用程序可以利用 [托管身份 (MI)](https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview) 和 [工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview)。 这些提供了在不必管理敏感凭据的情况下对您的应用程序进行身份验证的能力。

## 关于使用 Microsoft Entra ID 进行身份验证

Microsoft Entra ID 是 Azure 的身份和访问管理 （IAM） 解决方案，用于对用户和服务进行身份验证和授权。

Microsoft Entra ID 构建在开放标准（如 OAuth 2.0）之上，该标准允许服务（应用程序）获取访问令牌以向 Azure 服务（包括 Azure 存储、Azure Service Bus、Azure Key Vault、Azure Cosmos DB、Azure Database for Postgres、Azure SQL 等）发出请求。

> 在 Azure 术语中，一个应用程序也被称为"服务主体"。

一些Azure组件提供替代的身份验证方法，例如基于"共享密钥"或"访问令牌"的系统。 尽管这些是有效的并且受 Dapr 支持，但您应该尽可能使用 Microsoft Entra ID 对 Dapr 组件进行身份验证，以利用许多好处，包括：

- [托管身份和工作负载身份](#managed-identities-and-workload-identity)
- [基于角色的访问控制](#role-based-access-control)
- [审核](#auditing)
- [(可选) 使用证书进行身份验证](#optional-authentication-using-certificates)

### Managed Identities 和 Workload Identity

通过托管身份 (MI)，您的应用程序可以使用 Microsoft Entra ID 进行身份验证，并获取访问令牌以向 Azure 服务发送请求。 当您的应用程序在支持的Azure服务上运行（例如Azure VM、Azure容器应用程序、Azure Web应用程序等），可以在基础架构级别为您的应用程序分配标识。

使用 MI 后，您的代码不必处理凭据，即：

- 消除安全管理凭据的挑战
- 允许开发团队和运维团队更好地分离关注点
- 减少能够访问凭据的人数
- 简化操作方面 — 尤其是在使用多个环境时

在 Azure Kubernetes Service 上运行的应用程序可以类似地利用 [Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview) 为各个 pod 自动提供身份。

### 基于角色的访问控制

在使用支持的服务时，使用 Azure 基于角色的访问控制 (RBAC) 可以对应用程序授予的权限进行精细调整。 例如，您可以限制对数据子集的访问或将访问权限设置为只读。

### 安全审计

使用 Microsoft Entra ID 可以提供更好的访问审计体验。 租户管理员可以查看日志来跟踪身份验证请求。

### （可选）使用证书进行身份验证

虽然 Microsoft Entra ID 允许您使用 MI，但您仍然可以选择使用证书进行身份验证。

## 支持其他 Azure 环境

默认情况下，Dapr 组件配置为与"公有云"中的 Azure 资源进行交互。 如果你的应用程序已部署到其他云，如 Azure 中国或 Azure 政府（"主权云"），你可以通过将 `azureEnvironment` 元数据属性设置为受支持的值，为支持的组件启用该值：

- Azure 公有云 (默认): `"AzurePublicCloud"`
- Azure 中国: `"AzureChinaCloud"`
- Azure政府: `"AzureUSGovernmentCloud"`

> 支持主权云是实验性的。

## 凭据元数据字段

要使用Microsoft Entra ID进行身份验证，您需要将以下凭据作为值添加到元数据中的[Dapr组件](#example-usage-in-a-dapr-component)。

### 元数据选项

根据您将凭据传递给 Dapr 服务的方式，您有多个元数据选项。

- [使用客户端凭据](#authenticating-using-client-credentials)
- [使用证书进行身份验证](#authenticating-using-a-certificate)
- [使用托管标识 (MI)](#authenticating-with-managed-identities-mi)
- [在 AKS 上使用工作负载身份验证](#authenticating-with-workload-identity-on-aks)
- [使用 Azure CLI 凭据（仅限开发环境）](#authenticating-using-azure-cli-credentials-development-only)

#### 使用客户端凭据进行身份验证：

| 字段                  | 必填 | Details                  | 如何使用Dapr扩展来开发和运行Dapr应用程序                     |
| ------------------- | -- | ------------------------ | -------------------------------------------- |
| `azureTenantId`     | 是  | Microsoft Entra ID 租户的ID | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | 是  | 客户端 ID（应用程序 ID）          | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | 是  | 客户端 secret（应用程序密码）       | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes secret 的引用。

#### 使用证书进行身份验证

| 字段                         | 必填                                              | Details                    | 如何使用Dapr扩展来开发和运行Dapr应用程序                                                                                                                                |
| -------------------------- | ----------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `azureTenantId`            | 是                                               | Microsoft Entra ID 租户的ID   | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`                                                                                                                |
| `azureClientId`            | 是                                               | 客户端 ID（应用程序 ID）            | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`                                                                                                                |
| `azureCertificate`         | `azureCertificate` 和 `azureCertificateFile` 二选一 | 证书和私钥（PFX/PKCS#12 格式）      | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile`     | `azureCertificate` 和 `azureCertificateFile` 二选一 | 包含证书和私钥的 PFX/PKCS#12 文件的路径 | `"/path/to/file.pem"`                                                                                                                                   |
| `azureCertificatePassword` | 否                                               | 证书的密码（如果已加密）               | `"password"`                                                                                                                                            |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes secret 的引用。

#### 使用 Managed Identities (MI) 进行身份验证

| 字段              | 必填 | Details         | 如何使用Dapr扩展来开发和运行Dapr应用程序                 |
| --------------- | -- | --------------- | ---------------------------------------- |
| `azureClientId` | 否  | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

[使用 Managed Identities]({{< ref howto-mi.md >}})，通常建议使用`azureClientId`字段。 当使用系统分配的身份时，该字段是可选的，但当使用用户分配的身份时可能是必需的。

#### 在 AKS 上使用 Workload Identity 进行身份验证

在 Azure Kubernetes Service (AKS) 上运行时，您可以使用 Workload Identity 对组件进行身份验证。 请参考Azure AKS文档，了解如何为您的Kubernetes资源[启用Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview)。

#### 使用 Azure CLI 凭据进行身份验证（仅限开发）

> **重要:** 此身份验证方法仅推荐用于**开发**。

这种身份验证方法在本地开发时非常有用。 你将会需要：

- [Azure CLI已安装](https://learn.microsoft.com/cli/azure/install-azure-cli)
- 使用`az login`命令成功进行了身份验证

当 Dapr 在具有 Azure CLI 凭据的主机上运行时，如果没有其他配置的身份验证方法，组件可以使用这些凭据进行自动身份验证。

使用此身份验证方法不需要设置任何元数据选项。

### Dapr 组件中的用法示例

在此示例中，你将设置一个使用 Microsoft Entra ID 进行身份验证的 Azure Key Vault 机密存储组件。

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

要使用**客户端密钥**，请在组件目录中创建一个名为`azurekeyvault.yaml`的文件，并按照上述设置过程中的详细信息填写：

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

如果您想使用保存在本地磁盘上的**证书**，请改用：

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
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file.

使用**客户端密钥**：

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

   - `[your_client_secret]` is the application's client secret as generated above
   - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
   - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

2. Create an `azurekeyvault.yaml` component file.

   The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the client secret stored in the Kubernetes secret store.

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

3. Apply the `azurekeyvault.yaml` component:

   ```bash
   kubectl apply -f azurekeyvault.yaml
   ```

使用**证书:**

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

   - `[pfx_certificate_file_fully_qualified_local_path]` 是您之前获得的 PFX 文件路径
   - `[your_k8s_secret_name]` is secret name in the Kubernetes secret store
   - `[your_k8s_secret_key]` is secret key in the Kubernetes secret store

2. Create an `azurekeyvault.yaml` component file.

   The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in the Kubernetes secret store.

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

3. Apply the `azurekeyvault.yaml` component:

   ```bash
   kubectl apply -f azurekeyvault.yaml
   ```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="生成新的 Microsoft Entra ID 应用程序和 Service Principal >>" page="howto-aad.md" >}}

## 参考资料

- [Microsoft Entra ID app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure托管服务标识（MSI）概述](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{< ref secrets >}})
- [How-To: Retrieve a secret]({{< ref "howto-secrets.md" >}})
- [How-To: Reference secrets in Dapr components]({{< ref component-secrets.md >}})
- [Secrets API reference]({{< ref secrets_api.md >}})
