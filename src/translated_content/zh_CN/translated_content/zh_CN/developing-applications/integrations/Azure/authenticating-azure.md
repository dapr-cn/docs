---
type: docs
title: "Azure 认证"
linkTitle: "Azure 认证"
description: "如何使用 Azure AD 和/或托管身份认证 Azure 组件"
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/zh-hans/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
weight: 1000
---

## Common Azure authentication layer

Certain Azure components for Dapr offer support for the *common Azure authentication layer*, which enables applications to access data stored in Azure resources by authenticating with Azure AD. Thanks to this, administrators can leverage all the benefits of fine-tuned permissions with RBAC (Role-Based Access Control), and applications running on certain Azure services such as Azure VMs, Azure Kubernetes Service, or many Azure platform services can leverage [Managed Service Identities (MSI)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview).

有些 Azure 组件提供替代身份验证方法，例如基于"主密钥"或"共享密钥"的系统。 在可能的情况下，建议你使用 Azure AD 对 Dapr 组件进行身份验证，以提高安全性和易管理性，并且如果你的应用在受支持的 Azure 服务上运行，同时能够利用 MSI。

> Currently, only a subset of Azure components for Dapr offer support for this authentication method. Over time, support will be expanded to all other Azure components for Dapr. You can track the progress of the work, component-by-component, on [this issue](https://github.com/dapr/components-contrib/issues/1103).

### About authentication with Azure AD

Azure AD 是 Azure 的身份和访问管理 （IAM） 解决方案，用于对用户和服务进行身份验证和授权。

Azure AD 构建在开放标准（如 OAuth 2.0）之上，该标准允许服务（应用程序）获取访问令牌以向 Azure 服务（包括 Azure 存储、Azure Key Vault、Cosmos DB 等）发出请求。 在 Azure 术语中，应用程序也称为"服务主体"。

上面列出的许多服务还支持使用其他系统进行身份验证，例如"主密钥"或"共享密钥"。 尽管这些方法始终是验证应用程序的有效方法（并且 Dapr 继续支持它们，如每个组件的参考页中所述），但尽可能使用 Azure AD 具有多种优势，包括：

- The ability to leverage Managed Service Identities, which allow your application to authenticate with Azure AD, and obtain an access token to make requests to Azure services, without the need to use any credential. When your application is running on a supported Azure service (including, but not limited to, Azure VMs, Azure Kubernetes Service, Azure Web Apps, etc), an identity for your application can be assigned at the infrastructure level.  
  This way, your code does not have to deal with credentials of any kind, removing the challenge of safely managing credentials, allowing greater separation of concerns between development and operations teams and reducing the number of people with access to credentials, and lastly simplifying operational aspects–especially when multiple environments are used.
- Using RBAC (Role-Based Access Control) with supported services (such as Azure Storage and Cosmos DB), permissions given to an application can be fine-tuned, for example allowing restricting access to a subset of data or making it read-only.
- Better auditing for access.
- Ability to authenticate using certificates (optional).

## 凭据元数据字段

若要使用 Azure AD 进行身份验证，需要将以下凭据添加为 Dapr 组件的元数据中的值（请阅读下一部分，了解如何创建它们）。 有多种选择，具体取决于您选择将凭据传递给 Dapr 服务的方式。

**使用客户端凭据进行身份验证：**

| Field               | 必填 | 详情                                   | 示例                                           |
| ------------------- | -- | ------------------------------------ | -------------------------------------------- |
| `azureTenantId`     | 是  | ID of the Azure AD tenant            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | 是  | Client ID (application ID)           | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | 是  | Client secret (application password) | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes secret 的引用。

**使用 PFX 证书进行身份验证：**

| Field                      | 必填                                              | 详情                         | 示例                                                                                                                                                      |
| -------------------------- | ----------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `azureTenantId`            | 是                                               | ID of the Azure AD tenant  | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`                                                                                                                |
| `azureClientId`            | 是                                               | 客户端 ID（应用程序 ID）            | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`                                                                                                                |
| `azureCertificate`         | `azureCertificate` 和 `azureCertificateFile` 二选一 | 证书和私钥（PFX/PKCS#12 格式）      | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile`     | `azureCertificate` 和 `azureCertificateFile` 二选一 | 包含证书和私钥的 PFX/PKCS#12 文件的路径 | `"/path/to/file.pem"`                                                                                                                                   |
| `azureCertificatePassword` | 否                                               | 证书的密码（如果已加密）               | `"password"`                                                                                                                                            |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes secret 的引用。

**使用托管服务标识 （MSI） 进行身份验证：**

| Field           | 必填 | 详情              | 示例                                       |
| --------------- | -- | --------------- | ---------------------------------------- |
| `azureClientId` | 否  | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

使用 MSI 时，不需要指定任何值，但如果需要，可以选择 `azureClientId` 。

### 别名

出于向后兼容性的原因，支持将元数据中的以下值作为别名，但不建议使用它们。

| Metadata key               | 别名（支持但已弃用）                        |
| -------------------------- | --------------------------------- |
| `azureTenantId`            | `spnTenantId`, `tenantId`         |
| `azureClientId`            | `spnClientId`, `clientId`         |
| `azureClientSecret`        | `spnClientSecret`, `clientSecret` |
| `azureCertificate`         | `spnCertificate`                  |
| `azureCertificateFile`     | `spnCertificateFile`              |
| `azureCertificatePassword` | `spnCertificatePassword`          |

## 生成新的 Azure AD 应用程序和服务主体

首先，请创建一个新的 Azure AD 应用程序，该应用程序也将用作服务主体。

Prerequisites:

- Azure Subscription
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL（默认包含在所有 Linux 和 macOS 系统以及 WSL 上）
- 下面的脚本针对 bash 或 zsh shell 进行了优化

> 如果尚未登录，请先使用 Azure CLI 登录到 Azure：
> 
> ```sh
> # Log in Azure
> az login
> # Set your default subscription
> az account set -s [your subscription id]
> ```

### 创建 Azure AD 应用程序

首先，使用以下命令创建 Azure AD 应用程序：

```sh
# Friendly name for the application / Service Principal
APP_NAME="dapr-application"

# Create the app
APP_ID=$(az ad app create --display-name "${APP_NAME}"  | jq -r .appId)
```

{{< tabs "Client secret" "Certificate">}}

{{% codetab %}}

若要创建 **客户端密钥**，请运行此命令。 这将基于 base64 字符集和 40 个字符长生成随机密码。 此外，它将使密码有效期为2年，然后才需要轮换：

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2
```

The output of the command above will be similar to this:

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "password": "Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E",
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

记下上述值，你需要在 Dapr 组件的元数据中使用这些值，以允许 Dapr 向 Azure 进行身份验证：

- `appId` is the value for `azureClientId`
- `password` 是 `azureClientSecret` 的值 (这是随机生成的)
- `tenant` 是 `azureTenantId` 的值

{{% /codetab %}}

{{% codetab %}}
如果要使用 **PFX （PKCS#12） 证书**，请运行以下命令，该命令将创建自签名证书：

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> 注意：建议仅将自签名证书用于开发。 对于生产环境，应使用由 CA 签名并使用 `--cert` 标志导入的证书。

上述命令的输出应如下所示：

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "fileWithCertAndPrivateKey": "/Users/alessandro/tmpgtdgibk4.pem",
  "password": null,
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

记下上述值，您需要在 Dapr 组件的元数据中使用这些值：

- `appId` is the value for `azureClientId`
- `tenant` 是 `azureTenantId` 的值
- 自签名 PFX 证书和私钥写入文件中，位于 `fileWithCertAndPrivateKey`。  
  将该文件的内容用作 `azureCertificate` （或将其写入服务器上的文件并使用 `azureCertificateFile`）

> 虽然生成的文件有 `.pem` 扩展名，但它包含了一个编码为PFX（PKCS#12）的证书和私钥。

{{% /codetab %}}

{{< /tabs >}}

### 创建服务主体

创建 Azure AD 应用程序后，请为该应用程序创建服务主体，这将允许我们授予其对 Azure 资源的访问权限。 Run:

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .id)
echo "Service Principal ID: ${SERVICE_PRINCIPAL_ID}"
```

输出将类似于：

```text
服务主体 ID： 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

请注意，上面的值是 **服务主体** 的 ID，它与 Azure AD 中的应用程序 ID（客户端 ID）不同！ 前者在 Azure 租户中定义，用于向应用程序授予对 Azure 资源的访问权限。 客户端ID反而被你的应用程序用来验证。 总结一下：

- You'll use the client ID in Dapr manifests to configure authentication with Azure services
- 你将使用服务主体 ID 向应用程序授予访问 Azure 资源的权限

请记住，默认情况下，刚创建的服务主体无权访问任何 Azure 资源。 需要根据需要授予对每个资源的访问权限，如组件的文档中所述。

> 注意：此步骤与 [官方文档](https://docs.microsoft.com/cli/azure/create-an-azure-service-principal-azure-cli) 不同，因为其中包含的速记命令会创建一个服务主体，该服务主体对订阅中的所有 Azure 资源具有广泛的读写访问权限。  
> 这样做不仅会授予我们的服务主体比你可能需要的更多的访问权限，而且这也适用于 Azure 管理平面（Azure 资源管理器或 ARM），这与 Dapr 无关（所有 Azure 组件都设计为与各种服务的数据平面进行交互， 而不是 ARM）。

### Dapr 组件中的用法示例

在此示例中，将设置使用 Azure AD 进行身份验证的 Azure Key Vault 机密存储组件。

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

若要使用 **客户端密钥**，请在组件目录中创建一个名为 `azurekeyvault.yaml` 的文件，并填写上述设置过程中的详细信息：

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

如果要使用保存在本地磁盘上的 **证书** ，请改用：

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
在 Kubernetes 中，您将客户端密钥或证书存储到 Kubernetes 密钥存储中，然后引用 YAML 文件中的那些内容。

使用 **客户端密钥**：

1. 使用以下命令创建一个kubernetes密钥:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` is the application's client secret as generated above
    - `[your_k8s_secret_name]`是Kubernetes密钥仓库中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥

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

3. 应用`azurekeyvault.yaml`组件:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

要使用 **证书**：

1. 使用以下命令创建一个kubernetes密钥:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path to the PFX file you obtained earlier
    - `[your_k8s_secret_name]`是Kubernetes密钥仓库中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥

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

3. 应用`azurekeyvault.yaml`组件:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

{{% /codetab %}}

{{< /tabs >}}

## 使用托管服务标识

使用 MSI，认证会自动发生，因为应用程序运行在具有已分配身份的 Azure 服务之上。 例如，当你创建 Azure VM 或 Azure Kubernetes 服务群集并选择为其启用托管身份时，将为你创建一个 Azure AD 应用程序并自动分配给该服务。 然后，Dapr 服务可以透明地利用该身份向 Azure AD 进行身份验证，而无需指定任何凭据。

若要开始使用托管标识，首先需要将标识分配给新的或现有的 Azure 资源。 说明取决于服务使用情况。 以下是官方文档的链接：

- [Azure Kubernetes Service （AKS）](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) （包括 Azure Web Apps 和 Azure Functions）
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

其他 Azure 应用程序服务可能提供对 MSI 的支持; 请查看这些服务的文档，了解如何配置它们。

将托管身份分配给 Azure 资源后，你将拥有以下凭据：

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

从上面的列表中，记下 **`principalId`** 这是创建的服务主体的 ID。 需要它才能向服务主体授予对 Azure 资源的访问权限。

## 支持其他 Azure 环境

默认情况下，Dapr 组件配置为与"公有云"中的 Azure 资源进行交互。 如果你的应用程序已部署到其他云（如 Azure 中国、Azure 政府或 Azure 德国），则可以通过将 `azureEnvironment` 元数据属性设置为受支持的值，为支持的组件启用该值：

- Azure public cloud (default): `"AZUREPUBLICCLOUD"`
- Azure 中国: `"AZURECHINACLOUD"`
- Azure Government: `"AZUREUSGOVERNMENTCLOUD"`
- Azure Germany: `"AZUREGERMANCLOUD"`

## 参考

- [Azure AD app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure 托管服务标识 （MSI） 概述](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
