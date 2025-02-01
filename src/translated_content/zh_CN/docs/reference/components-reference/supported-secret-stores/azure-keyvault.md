---
type: docs
title: "Azure Key Vault 密钥存储"
linkTitle: "Azure Key Vault"
description: 有关 Azure Key Vault 密钥存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

## 组件格式

要设置 Azure Key Vault 密钥存储，创建一个类型为 `secretstores.azure.keyvault` 的组件。
- 请参阅[密钥存储组件指南]({{< ref "setup-secret-store.md#apply-the-configuration" >}})以了解如何创建和应用密钥存储配置。
- 请参阅[引用密钥的指南]({{< ref component-secrets.md >}})以使用 Dapr 组件检索和使用密钥。
- 请参阅下面的[配置组件部分](#configure-the-component)。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName # 必需
    value: [your_keyvault_name]
  - name: azureEnvironment # 可选，默认为 AZUREPUBLICCLOUD
    value: "AZUREPUBLICCLOUD"
  # 请参阅下面的身份验证部分以获取所有选项
  - name: azureTenantId
    value: "[your_service_principal_tenant_id]"
  - name: azureClientId
    value: "[your_service_principal_app_id]"
  - name: azureCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```

## 通过 Microsoft Entra ID 进行身份验证

Azure Key Vault 密钥存储组件仅支持通过 Microsoft Entra ID 进行身份验证。在启用此组件之前，请确保：
1. 阅读[Azure 身份验证]({{< ref authenticating-azure.md >}})文档。
2. 创建一个 Microsoft Entra ID 应用程序（也称为服务主体）。
3. 或者，为您的应用程序平台创建一个托管身份。

## 规范元数据字段

| 字段              | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| `vaultName` | Y | Azure Key Vault 的名称 | `"mykeyvault"` |
| `azureEnvironment` | N | 如果使用不同的 Azure 云，则为 Azure 环境的可选名称 | `"AZUREPUBLICCLOUD"`（默认值），`"AZURECHINACLOUD"`，`"AZUREUSGOVERNMENTCLOUD"`，`"AZUREGERMANCLOUD"` |
| 身份验证元数据 | | 有关更多信息，请参阅[Azure 身份验证]({{< ref authenticating-azure.md >}})

此外，您必须提供[Azure 身份验证]({{< ref authenticating-azure.md >}})文档中解释的身份验证字段。

## 可选的每请求元数据属性

从此密钥存储检索密钥时，可以提供以下[可选查询参数]({{< ref "secrets_api#query-parameters" >}})：

查询参数 | 描述
--------- | -----------
`metadata.version_id` | 给定密钥的版本。
`metadata.maxresults` | （仅适用于批量请求）要返回的密钥数量，超过此数量后请求将被截断。

## 示例

### 先决条件

- Azure 订阅
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- 您正在使用 bash 或 zsh shell
- 您已根据[Azure 身份验证]({{< ref authenticating-azure.md >}})中的说明创建了一个 Microsoft Entra ID 应用程序（服务主体）。您将需要以下值：

   | 值 | 描述 |
   | ----- | ----------- |
   | `SERVICE_PRINCIPAL_ID` | 您为给定应用程序创建的服务主体的 ID |

### 创建 Azure Key Vault 并授权服务主体

1. 使用您创建的服务主体设置一个变量：

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. 设置一个变量，指定创建所有资源的位置：

  ```sh
  LOCATION="[your_location]"
  ```

  （您可以使用以下命令获取完整的选项列表：`az account list-locations --output tsv`）

3. 创建一个资源组，给它任何您喜欢的名称：

  ```sh
  RG_NAME="[resource_group_name]"
  RG_ID=$(az group create \
    --name "${RG_NAME}" \
    --location "${LOCATION}" \
    | jq -r .id)
  ```

4. 创建一个使用 Azure RBAC 进行授权的 Azure Key Vault：

  ```sh
  KEYVAULT_NAME="[key_vault_name]"
  az keyvault create \
    --name "${KEYVAULT_NAME}" \
    --enable-rbac-authorization true \
    --resource-group "${RG_NAME}" \
    --location "${LOCATION}"
  ```

5. 使用 RBAC，为 Microsoft Entra ID 应用程序分配一个角色，以便它可以访问 Key Vault。
  在这种情况下，分配“Key Vault Secrets User”角色，该角色具有对 Azure Key Vault 的“获取密钥”权限。

  ```sh
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Key Vault Secrets User" \
    --scope "${RG_ID}/providers/Microsoft.KeyVault/vaults/${KEYVAULT_NAME}"
  ```

根据您的应用程序，您可以使用其他限制较少的角色，例如“Key Vault Secrets Officer”和“Key Vault Administrator”。[有关 Key Vault 的 Azure 内置角色的更多信息，请参阅 Microsoft 文档](https://docs.microsoft.com/azure/key-vault/general/rbac-guide?tabs=azure-cli#azure-built-in-roles-for-key-vault-data-plane-operations)。

### 配置组件

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}

#### 使用客户端密钥

要使用**客户端密钥**，请在组件目录中创建一个名为 `azurekeyvault.yaml` 的文件。使用以下模板，填写[您创建的 Microsoft Entra ID 应用程序]({{< ref authenticating-azure.md >}})：

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

#### 使用证书

如果您想使用保存在本地磁盘上的**证书**，请使用以下模板。填写[您创建的 Microsoft Entra ID 应用程序]({{< ref authenticating-azure.md >}})的详细信息：

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
在 Kubernetes 中，您将客户端密钥或证书存储到 Kubernetes 密钥存储中，然后在 YAML 文件中引用它们。在开始之前，您需要[您创建的 Microsoft Entra ID 应用程序]({{< ref authenticating-azure.md >}})的详细信息。

#### 使用客户端密钥

1. 使用以下命令创建一个 Kubernetes 密钥：

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-literal=[your_k8s_secret_key]=[your_client_secret]
   ```

    - `[your_client_secret]` 是上面生成的应用程序的客户端密钥
    - `[your_k8s_secret_name]` 是 Kubernetes 密钥存储中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥键

2. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 使用 `auth` 属性引用 Kubernetes 密钥存储，并且 `secretKeyRef` 引用存储在 Kubernetes 密钥存储中的客户端密钥。

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

3. 应用 `azurekeyvault.yaml` 组件：

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

#### 使用证书

1. 使用以下命令创建一个 Kubernetes 密钥：

   ```bash
   kubectl create secret generic [your_k8s_secret_name] --from-file=[your_k8s_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

    - `[pfx_certificate_file_fully_qualified_local_path]` 是您之前获得的 PFX 文件的路径
    - `[your_k8s_secret_name]` 是 Kubernetes 密钥存储中的密钥名称
    - `[your_k8s_secret_key]` 是 Kubernetes 密钥存储中的密钥键

2. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 使用 `auth` 属性引用 Kubernetes 密钥存储，并且 `secretKeyRef` 引用存储在 Kubernetes 密钥存储中的证书。

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

3. 应用 `azurekeyvault.yaml` 组件：

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```

#### 使用 Azure 托管身份

1. 确保您的 AKS 集群已启用托管身份，并按照[使用托管身份的指南](https://docs.microsoft.com/azure/aks/use-managed-identity)进行操作。
2. 创建一个 `azurekeyvault.yaml` 组件文件。

    组件 yaml 引用特定的 KeyVault 名称。您将在后续步骤中使用的托管身份必须被授予对此特定 KeyVault 实例的读取访问权限。

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

3. 应用 `azurekeyvault.yaml` 组件：

    ```bash
    kubectl apply -f azurekeyvault.yaml
    ```
4. 通过以下方式在 pod 级别创建并分配托管身份：
   - [Microsoft Entra ID 工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview)（首选方法）
   - [Microsoft Entra ID pod 身份](https://docs.microsoft.com/azure/aks/use-azure-ad-pod-identity#create-a-pod-identity)  

   **重要**：虽然 Microsoft Entra ID pod 身份和工作负载身份都处于预览状态，但目前计划将 Microsoft Entra ID 工作负载身份推向普遍可用（稳定状态）。

5. 创建工作负载身份后，授予其 `read` 权限：
   - [在您期望的 KeyVault 实例上](https://docs.microsoft.com/azure/key-vault/general/assign-access-policy?tabs=azure-cli#assign-the-access-policy)
   - 在您的应用程序部署中。通过标签注释注入 pod 身份，并通过指定与期望的工作负载身份关联的 Kubernetes 服务帐户

   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: mydaprdemoapp
     labels:
       aadpodidbinding: $POD_IDENTITY_NAME
   ```

#### 直接使用 Azure 托管身份与通过 Microsoft Entra ID 工作负载身份

当直接使用**托管身份**时，您可以为应用程序关联多个身份，需要 `azureClientId` 来指定应使用哪个身份。

然而，当通过 Microsoft Entra ID 工作负载身份使用**托管身份**时，`azureClientId` 是不必要的且无效。要使用的 Azure 身份是从与 Azure 身份关联的服务帐户推断出来的。

{{% /codetab %}}

{{< /tabs >}}

## 参考

- [Azure 身份验证]({{< ref authenticating-azure.md >}})
- [Azure CLI: keyvault 命令](https://docs.microsoft.com/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [密钥构建块]({{< ref secrets >}})
- [如何：检索密钥]({{< ref "howto-secrets.md" >}})
- [如何：在 Dapr 组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
