---
type: docs
title: "Azure认证"
linkTitle: "Azure认证"
description: "如何使用Azure AD和/或托管身份认证Azure组件"
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault-managed-identity/"
  - "/zh-hans/reference/components-reference/supported-secret-stores/azure-keyvault-managed-identity/"
weight: 1000
---

## 通用 Azure 身份验证层

某些适用于 Dapr 的 Azure 组件支持 *通用 Azure 身份验证层*，这使得应用程序能够通过使用 Azure AD 进行身份验证来访问存储在 Azure 资源中的数据。 因此，管理员可以通过 RBAC（基于角色的访问控制）利用微调权限的所有优势，并且在某些 Azure 服务（如 Azure VM、Azure Kubernetes Service 或许多 Azure 平台服务）上运行的应用程序可以利用 [托管服务身份 （MSI）](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)。

有些 Azure 组件提供替代身份验证方法，例如基于"主密钥"或"共享密钥"的系统。 在可能的情况下，建议你使用 Azure AD 对 Dapr 组件进行身份验证，以提高安全性和易管理性，并且如果你的应用在受支持的 Azure 服务上运行，同时能够利用 MSI。

> 目前，只有适用于 Dapr 的 Azure 组件的子集提供对此身份验证方法的支持。 随着时间的推移，支持将扩展到 Dapr 的所有其他 Azure 组件。 您可以在 [这个 issue](https://github.com/dapr/components-contrib/issues/1103) 上跟踪各个组件工作进度。

### 关于使用 Azure AD 进行身份验证

Azure AD 是 Azure 的身份和访问管理 （IAM） 解决方案，用于对用户和服务进行身份验证和授权。

Azure AD 构建在开放标准（如 OAuth 2.0）之上，该标准允许服务（应用程序）获取访问令牌以向 Azure 服务（包括 Azure 存储、Azure Key Vault、Cosmos DB 等）发出请求。 在 Azure 术语中，应用程序也称为"服务主体"。

上面列出的许多服务还支持使用其他系统进行身份验证，例如"主密钥"或"共享密钥"。 尽管这些方法始终是验证应用程序的有效方法（并且 Dapr 继续支持它们，如每个组件的参考页中所述），但尽可能使用 Azure AD 具有多种优势，包括：

- 能够利用托管服务标识，这允许应用程序使用 Azure AD 进行身份验证，并获取访问令牌以向 Azure 服务发出请求，而无需使用任何凭据。 当应用程序在受支持的 Azure 服务（包括但不限于 Azure VM、Azure Kubernetes 服务、Azure Web 应用等）上运行时，可以在基础结构级别分配应用程序的身份。  
  这样，您的代码就不必处理任何类型的凭据，消除了安全管理凭据带来的挑战，允许在开发和运营团队之间更好地分离关注点，并减少有权访问凭据的人数，最后简化操作方面 - 特别是在使用多个环境时。
- 将 RBAC（基于角色的访问控制）与受支持的服务（如 Azure 存储和 Cosmos DB）结合使用时，可以微调授予应用程序的权限，例如允许限制对数据子集的访问或将其设置为只读。
- 更好的访问审核。
- 能够使用证书进行身份验证（可选）。

## 凭据元数据字段

若要使用 Azure AD 进行身份验证，需要将以下凭据添加为 Dapr 组件的元数据中的值（请阅读下一部分，了解如何创建它们）。 有多种选择，具体取决于您选择将凭据传递给 Dapr 服务的方式。

**使用客户端凭据进行身份验证：**

| 字段                  | 必填 | 详情              | 示例                                           |
| ------------------- | -- | --------------- | -------------------------------------------- |
| `azureTenantId`     | Y  | Azure AD 租户ID   | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`     |
| `azureClientId`     | Y  | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`     |
| `azureClientSecret` | Y  | 客户端密码（应用程序密码）   | `"Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E"` |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes 秘密的引用。

**使用 PFX 证书进行身份验证：**

| 字段                         | 必填                                                   | 详情                         | 示例                                                                                                                                                      |
| -------------------------- | ---------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `azureTenantId`            | Y                                                    | Azure AD 租户的 ID            | `"cd4b2887-304c-47e1-b4d5-65447fdd542b"`                                                                                                                |
| `azureClientId`            | Y                                                    | 客户端 ID（应用程序 ID）            | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"`                                                                                                                |
| `azureCertificate`         | One of `azureCertificate` and `azureCertificateFile` | 证书和私钥（PFX/PKCS#12 格式）      | `"-----BEGIN PRIVATE KEY-----\n MIIEvgI... \n -----END PRIVATE KEY----- \n -----BEGIN CERTIFICATE----- \n MIICoTC... \n -----END CERTIFICATE-----` |
| `azureCertificateFile`     | One of `azureCertificate` and `azureCertificateFile` | 包含证书和私钥的 PFX/PKCS#12 文件的路径 | `"/path/to/file.pem"`                                                                                                                                   |
| `azureCertificatePassword` | N                                                    | 证书的密码（如果已加密）               | `"password"`                                                                                                                                            |

在 Kubernetes 上运行时，您还可以对上述任何或所有值使用对 Kubernetes 秘密的引用。

**Authenticating with Managed Service Identities (MSI):**

| 字段              | 必填 | 详情              | 示例                                       |
| --------------- | -- | --------------- | ---------------------------------------- |
| `azureClientId` | N  | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-4ba2-a905-acd4d3f8f08b"` |

使用 MSI 时，不需要指定任何值，但如果需要，可以选择 `azureClientId` 。

### Aliases

For backwards-compatibility reasons, the following values in the metadata are supported as aliases, although their use is discouraged.

| Metadata key               | Aliases (supported but deprecated) |
| -------------------------- | ---------------------------------- |
| `azureTenantId`            | `spnTenantId`, `tenantId`          |
| `azureClientId`            | `spnClientId`, `clientId`          |
| `azureClientSecret`        | `spnClientSecret`, `clientSecret`  |
| `azureCertificate`         | `spnCertificate`                   |
| `azureCertificateFile`     | `spnCertificateFile`               |
| `azureCertificatePassword` | `spnCertificatePassword`           |

## Generating a new Azure AD application and Service Principal

To start, create a new Azure AD application, which will also be used as Service Principal.

前期准备:

- [Azure Subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL (included by default on all Linux and macOS systems, as well as on WSL)
- The scripts below are optimized for a bash or zsh shell

> If you haven't already, start by logging in to Azure using the Azure CLI:
> 
> ```sh
> # Log in Azure
> az login
> # Set your default subscription
> az account set -s [your subscription id]
> ```

### Creating an Azure AD application

First, create the Azure AD application with:

```sh
# Friendly name for the application / Service Principal
APP_NAME="dapr-application"

# Create the app
APP_ID=$(az ad app create \
  --display-name "${APP_NAME}" \
  --available-to-other-tenants false \
  --oauth2-allow-implicit-flow false \
  | jq -r .appId)
```

{{< tabs "Client secret" "Certificate">}}

{{% codetab %}}

To create a **client secret**, then run this command. This will generate a random password based on the base64 charset and 40-characters long. Additionally, it will make the password valid for 2 years, before it will need to be rotated:

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2 \
  --password $(openssl rand -base64 30)
```

The ouput of the command above will be similar to this:

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "name": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "password": "Ecy3XG7zVZK3/vl/a2NSB+a1zXLa8RnMum/IgD0E",
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

Take note of the values above, which you'll need to use in your Dapr components' metadata, to allow Dapr to authenticate with Azure:

- `appId` is the value for `azureClientId`
- `password` is the value for `azureClientSecret` (this was randomly-generated)
- `tenant` is the value for `azureTenantId`

{{% /codetab %}}

{{% codetab %}}
If you'd rather use a **PFX (PKCS#12) certificate**, run this command which will create a self-signed certificate:

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> Note: self-signed certificates are recommended for development only. For production, you should use certificates signed by a CA and imported with the `--cert` flag.

The output of the command above should look like:

```json
{
  "appId": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "fileWithCertAndPrivateKey": "/Users/alessandro/tmpgtdgibk4.pem",
  "name": "c7dd251f-811f-4ba2-a905-acd4d3f8f08b",
  "password": null,
  "tenant": "cd4b2887-304c-47e1-b4d5-65447fdd542b"
}
```

Take note of the values above, which you'll need to use in your Dapr components' metadata:

- `appId` is the value for `azureClientId`
- `tenant` is the value for `azureTenantId`
- The self-signed PFX certificate and private key are written in the file at the path specified in `fileWithCertAndPrivateKey`.  
  Use the contents of that file as `azureCertificate` (or write it to a file on the server and use `azureCertificateFile`)

> While the generated file has the `.pem` extension, it contains a certificate and private key encoded as PFX (PKCS#12).

{{% /codetab %}}

{{< /tabs >}}

### Creating a Service Principal

Once you have created an Azure AD application, create a Service Principal for that application, which will allow us to grant it access to Azure resources. 运行：

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .objectId)
echo "Service Principal ID: ${SERVICE_PRINCIPAL_ID}"
```

The output will be similar to:

```text
Service Principal ID: 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

Note that the value above is the ID of the **Service Principal** which is different from the ID of application in Azure AD (client ID)! The former is defined within an Azure tenant and is used to grant access to Azure resources to an application. The client ID instead is used by your application to authenticate. To sum things up:

- You'll use the client ID in Dapr manifests to configure authentication with Azure services
- You'll use the Service Principal ID to grant permissions to an application to access Azure resources

Keep in mind that the Service Principal that was just created does not have access to any Azure resource by default. Access will need to be granted to each resource as needed, as documented in the docs for the components.

> Note: this step is different from the [official documentation](https://docs.microsoft.com/cli/azure/create-an-azure-service-principal-azure-cli) as the short-hand commands included there create a Service Principal that has broad read-write access to all Azure resources in your subscription.  
> Not only doing that would grant our Service Principal more access than you are likely going to desire, but this also applies only to the Azure management plane (Azure Resource Manager, or ARM), which is irrelevant for Dapr anyways (all Azure components are designed to interact with the data plane of various services, and not ARM).

### Example usage in a Dapr component

In this example, you will set up an Azure Key Vault secret store component that uses Azure AD to authenticate.

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the details from the above setup process:

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

If you want to use a **certificate** saved on the local disk, instead, use:

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

To use a **client secret**:

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

To use a **certificate**:

1. Create a Kubernetes secret using the following command:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path to the PFX file you obtained earlier
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

## Using Managed Service Identities

Using MSI, authentication happens automatically by virtue of your application running on top of an Azure service that has an assigned identity. For example, when you create an Azure VM or an Azure Kubernetes Service cluster and choose to enable a managed identity for that, an Azure AD application is created for you and automatically assigned to the service. Your Dapr services can then leverage that identity to authenticate with Azure AD, transparently and without you having to specify any credential.

To get started with managed identities, first you need to assign an identity to a new or existing Azure resource. The instructions depend on the service use. Below are links to the official documentation:

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) (including Azure Web Apps and Azure Functions)
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

Other Azure application services may offer support for MSI; please check the documentation for those services to understand how to configure them.

After assigning a managed identity to your Azure resource, you will have credentials such as:

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

From the list above, take note of **`principalId`** which is the ID of the Service Principal that was created. You'll need that to grant access to Azure resources to your Service Principal.

## Support for other Azure environments

By default, Dapr components are configured to interact with Azure resources in the "public cloud". If your application is deployed to another cloud, such as Azure China, Azure Government, or Azure Germany, you can enable that for supported components by setting the `azureEnvironment` metadata property to one of the supported values:

- Azure public cloud (default): `"AZUREPUBLICCLOUD"`
- Azure China: `"AZURECHINACLOUD"`
- Azure Government: `"AZUREUSGOVERNMENTCLOUD"`
- Azure Germany: `"AZUREGERMANCLOUD"`

## 参考资料

- [Azure AD app credential: Azure CLI reference](https://docs.microsoft.com/cli/azure/ad/app/credential)
- [Azure Managed Service Identity (MSI) overview](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/overview)
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
