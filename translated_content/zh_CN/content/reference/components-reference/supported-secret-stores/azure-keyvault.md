---
type: docs
title: "Azure Key Vault 密钥仓库"
linkTitle: "Azure Key Vault"
description: 详细介绍了关于 Azure Key Vault密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

## 配置

要设置Azure Key Vault密钥仓库，请创建一个类型为`secretstores.azure.keyvault`的组件。 有关如何创建和应用 secretstore 配置，请参阅[本指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})。 有关如何在 Dapr 组件中检索和使用 secret，请参阅 [引用 secrets]({{< ref component-secrets.md >}}) 指南。

也请参见本页面中的[配置组件](#configure-the-component)指南。

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

| 字段                 | 必填 | 详情                                                                                      | 示例                                                                                                          |
| ------------------ |:--:| --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `vaultName`        | Y  | Azure Key Vault名称                                                                       | `"mykeyvault"`                                                                                              |
| `azureEnvironment` | 否  | Azure 环境的可选名称（如果使用其他 Azure 云）                                                           | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| Auth metadata      |    | See [Authenticating to Azure]({{< ref authenticating-azure.md >}}) for more information |                                                                                                             |

Additionally, you must provide the authentication fields as explained in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

## Example: Create an Azure Key Vault and authorize a Service Principal

### 先决条件

- [Azure Subscription](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- 下面的脚本针对 bash 或 zsh shell 进行了优化

Make sure you have followed the steps in the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document to create  an Azure AD application (also called Service Principal). You will need the following values:

- `SERVICE_PRINCIPAL_ID`：为给定应用程序创建的服务主体的 ID

### 步骤

1. 使用创建的服务主体设置变量：

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. 设置一个变量，其中包含创建所有资源的位置：

  ```sh
  LOCATION="[your_location]"
  ```

  （您可以通过以下方式获得完整的选项列表： `az account list-locations --output tsv`）

3. 创建资源组，为其指定所需的任何名称：

  ```sh
  RG_NAME="[resource_group_name]"
  RG_ID=$(az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    | jq -r .id)
  ```

4. 创建 Azure Key Vault（使用 Azure RBAC 进行授权）：

  ```sh
  KEYVAULT_NAME="[key_vault_name]"
  az keyvault create \
    --name "${KEYVAULT_NAME}" \
    --enable-rbac-authorization true \
    --resource-group "${RG_NAME}" \
    --location "${LOCATION}"
  ```

5. Using RBAC, assign a role to the Azure AD application so it can access the Key Vault.  
   In this case, assign the "Key Vault Secrets User" role, which has the "Get secrets" permission over Azure Key Vault.

  ```sh
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Key Vault Secrets User" \
    --scope "${RG_ID}/providers/Microsoft.KeyVault/vaults/${KEYVAULT_NAME}"
  ```

Other less restrictive roles like "Key Vault Secrets Officer" and "Key Vault Administrator" can be used as well, depending on your application. For more information about Azure built-in roles for Key Vault see the [Microsoft docs](https://docs.microsoft.com/azure/key-vault/general/rbac-guide?tabs=azure-cli#azure-built-in-roles-for-key-vault-data-plane-operations).

## 配置组件

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

To use a **client secret**, create a file called `azurekeyvault.yaml` in the components directory, filling in with the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

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

If you want to use a **certificate** saved on the local disk, instead, use this template, filling in with details of the Azure AD application that you created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document:

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
In Kubernetes, you store the client secret or the certificate into the Kubernetes Secret Store and then refer to those in the YAML file. You will need the details of the Azure AD application that was created following the [Authenticating to Azure]({{< ref authenticating-azure.md >}}) document.

To use a **client secret**:

1. 使用以下命令创建一个kubernetes密钥:

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` 是上面生成的应用程序的客户端密钥
    - `[your_k8s_secret_name]`是Kubernetes密钥仓库中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥


2. 创建一个`azurekeyvault.yaml`组件文件.

    组件yaml使用`auth`属性引用Kubernetes secretstore，`secretKeyRef`引用存储在Kubernetes secret store中的客户端密钥。

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

To use a **certificate**:

1. 使用以下命令创建 Kubernetes 秘密：

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` 是您之前获得的 PFX 文件路径
    - `[your_k8s_secret_name]` 是 Kubernetes 密钥存储中的秘密名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中秘密的键

2. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 使用 `auth` 属性引用 Kubernetes secretstore，`secretKeyRef` 引用存储在 Kubernetes 密钥存储中的证书。

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

使用 **Azure managed identity**:

1. 确保您的AKS集群启用了托管标识，并遵照了 [使用托管标识指南](https://docs.microsoft.com/azure/aks/use-managed-identity)。
2. 创建 `azurekeyvault.yaml` 组件文件。

    组件yaml应用特定的 KeyVault 名称。 在后续步骤中使用的托管标识必须被授予该 KeyVault 实例的读权限。

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

## 参考资料

- [Authenticating to Azure]({{< ref authenticating-azure.md >}})
- [Azure CLI: keyvault commands](https://docs.microsoft.com/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
