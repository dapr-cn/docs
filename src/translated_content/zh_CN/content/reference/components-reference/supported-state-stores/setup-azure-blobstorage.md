---
type: docs
title: "Azure Blob Storage"
linkTitle: "Azure Blob Storage"
description: 关于Azure Blob Store状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-azure-blobstorage/"
---

## 配置

要设置 Azure Blob Storage 状态存储，请创建一个类型为`state.azure.blobstorage`的组件。 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: "[your_account_name]"
  - name: accountKey
    value: "[your_account_key]"
  - name: containerName
    value: "[your_container_name]"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                 |        必填        | 详情                            | 示例                                                                                                          |
| ------------------ |:----------------:| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| accountName        |        是         | 存储帐户名称                        | `"mystorageaccount"`.                                                                                       |
| accountKey         | 是（除非使用 Azure AD） | 主要或次要存储密钥                     | `"key"`                                                                                                     |
| containerName      |        是         | Dapr 状态的容器名称， 如果容器不存在，将会自动创建. | `"container"`                                                                                               |
| `azureEnvironment` |        否         | Azure 环境的可选名称（如果使用其他 Azure 云） | `"AZUREPUBLICCLOUD"` (default value), `"AZURECHINACLOUD"`, `"AZUREUSGOVERNMENTCLOUD"`, `"AZUREGERMANCLOUD"` |
| ContentType        |        否         | Blob 的内容类型                    | `"text/plain"`                                                                                              |
| ContentMD5         |        否         | Blob 的 MD5 哈希                 | `"vZGKbMRDAnMs4BIwlXaRvQ=="`                                                                                |
| ContentEncoding    |        否         | Blob 的内容编码                    | `"UTF-8"`                                                                                                   |
| ContentLanguage    |        否         | Blob 的内容语言                    | `"en-us"`                                                                                                   |
| ContentDisposition |        否         | Blob 的内容处置。 传达有关如何处理响应负载的额外信息 | `"attachment"`                                                                                              |
| CacheControl       |        否         | Blob 的缓存控制                    | `"no-cache"`                                                                                                |

## 设置 Azure Blob Storage

[请遵循 Azure 文档中关于如何创建 Azure Storage Account的说明](https://docs.microsoft.com/azure/storage/common/storage-account-create?tabs=azure-portal)。

如果你想创建一个容器供Dapr使用，你可以事先这样做。 然而，如果它不存在，Blob Storage 提供程序将会为您自动创建一个。

要将 Azure Blob Storage配置为状态存储，你需要如下属性：

- **AccountName**：存储账户名称 举例：**mystorageaccount** 举例：**mystorageaccount**
- **accountKey**: 主要或者次要的的存储账号密钥。
- **ContainerName**：用于Dapr状态的容器名称。 如果容器不存在，将会自动创建.

### 使用 Azure AD 进行身份验证

此组件支持使用 Azure AD 进行身份验证，作为使用账号密钥的替代方法。 为了利用更好的安全性、微调的访问控制以及在 Azure 上运行的引用程序使用托管表示的功能，建议您在生产系统中使用 Azure AD 进行身份验证。

> 以下的脚本针对 base 和 zsh 进行了优化，并且需要安装以下应用程序：
> 
> - [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
> - [jq](https://stedolan.github.io/jq/download/)
> 
> 您还必须在 Azure CLI 中通过 Azure 身份验证。

1. 若要开始使用 Azure AD 对 Blob 存储状态存储组件进行身份验证，请确保已创建 Azure AD 应用程序和服务主体，如 [向 Azure]({{< ref authenticating-azure.md >}}) 身份验证文档中所述。  
   完成后，使用创建的服务主体的 ID 设置一个变量：

  ```sh
  SERVICE_PRINCIPAL_ID="[your_service_principal_object_id]"
  ```

2. 使用 Azure 存储帐户的名称及其所在资源组的名称设置以下变量：

  ```sh
  STORAGE_ACCOUNT_NAME="[your_storage_account_name]"
  RG_NAME="[your_resource_group_name]"
  ```

3. 使用 RBAC，将角色分配给服务主体，以便它可以访问存储帐户内的数据。  
   在这种情况下，将分配"Storage blob Data Contributor"角色，该角色具有广泛的访问权限。也可以使用其他限制性更强的角色，具体取决于您的应用程序。

  ```sh
  RG_ID=$(az group show --resource-group ${RG_NAME} | jq -r ".id")
  az role assignment create \
    --assignee "${SERVICE_PRINCIPAL_ID}" \
    --role "Storage blob Data Contributor" \
    --scope "${RG_ID}/providers/Microsoft.Storage/storageAccounts/${STORAGE_ACCOUNT_NAME}"
  ```

使用 Azure AD 对组件进行身份验证时，不需要 `accountKey` 字段。 相反，请根据 [向 Azure进行身份验证]({{< ref authenticating-azure.md >}}) 文档，在组件的元数据 (如果有) 中指定所需的凭据。

例如:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.azure.blobstorage
  version: v1
  metadata:
  - name: accountName
    value: "[your_account_name]"
  - name: containerName
    value: "[your_container_name]"
  - name: azureTenantId
    value: "[your_tenant_id]"
  - name: azureClientId
    value: "[your_client_id]"
  - name: azureClientSecret
    value : "[your_client_secret]"
```

## 应用配置

### 在Kubernetes中

要将 Azure Blob Storage状态存储应用到Kubernetes，请执行如下`kubectl` CLI：

```sh
kubectl apply -f azureblob.yaml
```

### 本地运行

要在本地运行，创建一个包含YAML文件的`components`目录，并提供`dapr run`命令的路径，标志为`--components-path`。

这个状态存储在容器中创建一个blob文件，并将原始状态放在里面。

例如，以下操作来自于名为`myservice`的服务:

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

这将在容器中创建文件名为 `key`，`value` 为内容的 blob 文件。

## 并发（Concurrency）

根据[Azure Blob Storage文档](https://docs.microsoft.com/azure/storage/common/storage-concurrency#managing-concurrency-in-blob-storage)，通过使用`ETag`实现Azure Blob Storage状态并发。

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
