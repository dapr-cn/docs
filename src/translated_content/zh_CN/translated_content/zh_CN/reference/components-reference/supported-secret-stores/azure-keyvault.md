---
type: docs
title: "Azure Key Vault 密钥仓库"
linkTitle: "Azure Key Vault"
description: 详细介绍了关于 Azure Key Vault密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

## Component format

To setup Azure Key Vault secret store create a component of type `secretstores.azure.keyvault`. See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

See also [configure the component](#configure-the-component) guide in this page.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName # Required
    value: [your_keyvault_name]
  - name: azureEnvironment # Optional, defaults to AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # See authentication section below for all options
  - name: azureTenantId
    value: "[your_service_principal_tenant_id]"
  - name: azureClientId
    value: "[your_service_principal_app_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```

## 使用 Azure AD 进行身份验证

The Azure Key Vault secret store component supports authentication with Azure AD only. Before you enable this component, make sure you've read the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document and created an Azure AD application (also called Service Principal). Alternatively, make sure you have created a managed identity for your application platform.

## 元数据字段规范

| Field              | 必填 | 详情                                                              | 示例                                                                                                          |
| ------------------ |:--:| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `vaultName`        | 是  | The name of the Azure Key Vault                                 | `"mykeyvault"`                                                                                              |
| `azureEnvironment` | 否  | Azure 环境的可选名称（如果使用其他 Azure 云）                                   | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| Auth metadata      |    | 有关详细信息，请参阅 [向 Azure进行身份验证]({{< ref authenticating-azure.md >}}) |                                                                                                             |

Additionally, you must provide the authentication fields as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

## 示例：创建 Azure Key Vault 并授权服务主体

### Prerequisites

- Azure Subscription
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- The scripts below are optimized for a bash or zsh shell

Make sure you have followed the steps in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document to create  an Azure AD application (also called Service Principal). You will need the following values:

- `SERVICE_PRINCIPAL_ID`：为给定应用程序创建的服务主体的 ID

### 步骤

1. Set a variable with the Service Principal that you created:

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. Set a variable with the location where to create all resources:

  ```sh
  LOCATION="[your_location]"
  ```

  (You can get the full list of options with: `az account list-locations --output tsv`)

3. Create a Resource Group, giving it any name you'd like:

  ```sh
  RG_NAME="[resource_group_name]"
  RG_ID=$(az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    | jq -r .id)
  ```

4. Create an Azure Key Vault (that uses Azure RBAC for authorization):

  ```sh
  KEYVAULT_NAME="[key_vault_name]"
  az keyvault create \
    --name "${KEYVAULT_NAME}" \
    --enable-rbac-authorization true \
    --resource-group "${RG_NAME}" \
    --location "${LOCATION}"
  ```

5. 使用 RBAC，为 Azure AD 应用程序分配一个角色，以便它可以访问 Key Vault。  
   在这种情况下，分配“Key Vault Secrets User”角色，该角色对 Azure Key Vault 具有“获取secrets”权限。

  ```sh
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Key Vault Secrets User" \
    --scope "${RG_ID}/providers/Microsoft.KeyVault/vaults/${KEYVAULT_NAME}"
  ```

根据您的应用程序，也可以使用限制性较小的角色，例如“Key Vault Secrets Officer”和“Key Vault Administrator”。 有关 Key Vault 的 Azure 内置角色的详细信息，请参阅 [Microsoft 文档](https://docs.microsoft.com/azure/key-vault/general/rbac-guide?tabs=azure-cli#azure-built-in-roles-for-key-vault-data-plane-operations)。

## Configure the component

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
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

If you want to use a **certificate** saved on the local disk, instead, use this template, filling in with details of the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
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
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file. You will need the details of the Azure AD application that was created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

To use a **client secret**:

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

To use a **certificate**:

1. 使用以下命令创建一个kubernetes密钥:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` is the path of PFX file you obtained earlier
    - `[your_k8s_secret_name]`是Kubernetes密钥仓库中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥

2. Create an `azurekeyvault.yaml` component file.

    The component yaml refers to the Kubernetes secretstore using `auth` property and  `secretKeyRef` refers to the certificate stored in the Kubernetes secret store.

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
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

To use **Azure managed identity**:

1. Ensure your AKS cluster has managed identity enabled and follow the [guide for using managed identities](https://docs.microsoft.com/azure/aks/use-managed-identity).
2. Create an `azurekeyvault.yaml` component file.

    组件yaml应用特定的 KeyVault 名称。 在后续步骤中使用的托管标识必须被授予该 KeyVault 实例的读权限。

    ```yaml
    apiVersion: dapr.io/v1alpha1
    kind: Component
    metadata:
      name: azurekeyvault
    spec:
      type: secretstores.azure.keyvault
      version: v1
      metadata:
      - name: vaultName
        value: "[your_keyvault_name]"
    ```

3. 应用`azurekeyvault.yaml`组件:

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```
4. 按照 [本指南](https://docs.microsoft.com/azure/aks/use-azure-ad-pod-identity#create-a-pod-identity) 创建和使用托管标识/Pod标识。 创建 AKS Pod 标识后，[ 授予该标识对所需的 KeyVault 实例的读权限](https://docs.microsoft.com/azure/key-vault/general/assign-access-policy?tabs=azure-cli#assign-the-access-policy)，最后，在您的应用程序 deployment 中通过标签注解注入 Pod 标识：

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: mydaprdemoapp
     labels:
       aadpodidbinding: $POD_IDENTITY_NAME
   ```

{{% /codetab %}}

{{< /tabs >}}

## 参考

- [Authenticating to Azure]({{< ref authenticating-azure.md >}})
- [Azure CLI：keyvault 命令](https://docs.microsoft.com/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [Secrets building block]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [Secret API 参考]({{< ref secrets_api.md >}})
