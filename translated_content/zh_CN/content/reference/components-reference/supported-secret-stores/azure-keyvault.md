---
type: docs
title: "Azure Key Vault 密钥仓库"
linkTitle: "Azure Key Vault"
description: 详细介绍了关于 Azure Key Vault密钥仓库组件的信息
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/azure-keyvault/"
---

{{% alert title="Note" color="primary" %}}
Azure Managed Identity 可用于 Kubernetes 上的 Azure Key Vault 访问， 在 [这里]({{< ref azure-keyvault-managed-identity.md >}})查看说明。 Instructions [here]({{< ref azure-keyvault-managed-identity.md >}}).
{{% /alert %}}

## 配置

要设置Azure Key Vault密钥仓库，请创建一个类型为`secretstores.azure.keyvault`的组件。 See [this guide]({{< ref "setup-secret-store.md#apply-the-configuration" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

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
  - name: vaultName
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
    value : "[pfx_certificate_contents]"
  - name: spnCertificateFile
    value : "[pfx_certificate_file_fully_qualified_local_path]"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a local secret store such as [Kubernetes secret store]({{< ref kubernetes-secret-store.md >}}) or a [local file]({{< ref file-secret-store.md >}}) to bootstrap secure key storage.
{{% /alert %}}

## 元数据字段规范

### 自托管

| 字段                 | 必填 | 详情                                                                                                                                                                                                                                                                                                                                                                                                                    | Example                                                                         |
| ------------------ |:--:| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| vaultName          | Y  | Azure Key Vault名称. If you only provide a name, it will covert to `[your_keyvault_name].vault.azure.net` in Dapr. If your URL uses another suffix, please provide the entire URI, such as `test.vault.azure.cn`.                                                                                                                                                                                                       | `"mykeyvault"`, `"mykeyvault.value.azure.cn"`                                   |
| spnTenantId        | Y  | Service Principal Tenant Id                                                                                                                                                                                                                                                                                                                                                                                           | `"spnTenantId"`                                                                 |
| spnClientId        | Y  | Service Principal App Id                                                                                                                                                                                                                                                                                                                                                                                              | `"spnAppId"`                                                                    |
| spnCertificateFile | Y  | PFX证书文件路径， <br></br> For Windows the `[pfx_certificate_file_fully_qualified_local_path]` value must use escaped backslashes, i.e. double backslashes. 例如 `"C:\\folder1\\folder2\\certfile.pfx"` <br></br> 对于Linux，你可以使用单斜杠。 <br></br> 对于Linux，你可以使用单斜杠。 例如 `"/folder1/folder2/certfile.pfx"`  例如 `"/folder1/folder2/certfile.pfx"`  <br></br> 请参阅[配置组件](#configure-the-component)了解更多详情 | `"C:\\folder1\\folder2\\certfile.pfx"`, `"/folder1/folder2/certfile.pfx"` |


### Kubernetes

| 字段             | 必填 | 详情                                                                                                                                                     | Example                                                                                                        |
| -------------- |:--:| ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| vaultName      | Y  | Azure Key Vault名称                                                                                                                                      | `"mykeyvault"`                                                                                                 |
| spnTenantId    | Y  | Service Principal Tenant Id                                                                                                                            | `"spnTenantId"`                                                                                                |
| spnClientId    | Y  | Service Principal App Id                                                                                                                               | `"spnAppId"`                                                                                                   |
| spnCertificate | Y  | PKCS 12 encoded bytes of the certificate. See [configure the component](#configure-the-component) for details on encoding this in a Kubernetes secret. | `secretKeyRef: ...` <br /> See [configure the component](#configure-the-component) for more information. |


## 设置Key Vault和服务主体

### 先决条件

- [Azure Subscription](https://azure.microsoft.com/en-us/free/)
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

### 步骤

1. 登录到 Azure 并设置默认订阅

    ```bash
    # Log in Azure
    az login

    # Set your subscription to the default subscription
    az account set -s [your subscription id]
    ```

2. 在一个区域中创建 Azure Key Vault

     ```bash
     az keyvault create --location [region] --name [your_keyvault] --resource-group [your resource group]
     ```

3. 创建一个服务主体

    使用新的证书创建一个服务主体，并将为期1年的证书存储在keyvault的证书库中。 如果你想为keyvault使用现有的服务主体，而不是创建新的服务主体，你可以跳过这一步。

    ```bash
    az ad sp create-for-rbac --name [your_service_principal_name] --create-cert --cert [certificate_name] --keyvault [your_keyvault] --skip-assignment --years 1

    {
       "appId": "a4f90000-0000-0000-0000-00000011d000",
       "displayName": "[your_service_principal_name]",
       "name": "http://[your_service_principal_name]",
       "password": null,
       "tenant": "34f90000-0000-0000-0000-00000011d000"
    }
    ```

    **Save both the appId and tenant from the output which will be used in the next step**

4. 获取 [your_service_principal_name] 的对象ID

    ```bash
    az ad sp show --id [service_principal_app_id]

    {
        ...
        "objectId": "[your_service_principal_object_id]",
        "objectType": "ServicePrincipal",
        ...
    }
    ```

5. 授予服务主体对你的 Azure Key Vault 的 GET 权限

    ```bash
    az keyvault set-policy --name [your_keyvault] --object-id [your_service_principal_object_id] --secret-permissions get
    ```

    现在，你的服务主体已经可以访问你的keyvault，你可以配置密钥仓库组件，以使用存储在keyvault中的密钥来安全地访问其他组件。

6. 使用 Azure 门户或 Azure CLI 从 Azure Key Vault 下载 PFX 格式的证书：

- **使用 Azure 门户：**

  转到 Azure 门户上的密钥库，然后导航到 *Certificates*标签下的 *Settings*。 找到服务主体创建时创建的证书，命名为[certificate_name]，点击它。

  点击*以PFX/PEM格式下载*下载证书。

- **使用 Azure CLI:**

   ```bash
   az keyvault secret download --vault-name [your_keyvault] --name [certificate_name] --encoding base64 --file [certificate_name].pfx
   ```

## 配置组件

{{< tabs "Self-Hosted" "Kubernetes">}}

{{% codetab %}}
1. 将下载的 PFX 证书从 Azure Keyvault 复制到你的组件目录或本地磁盘上的安全位置。

2. 在组件目录下创建一个名为`azurekeyvault.yaml`的文件

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
        value: [your_keyvault_name]
      - name: spnTenantId
        value: "[your_service_principal_tenant_id]"
      - name: spnClientId
        value: "[your_service_principal_app_id]"
      - name: spnCertificateFile
        value : "[pfx_certificate_file_fully_qualified_local_path]"
    ```

在元数据字段中填写上述设置过程中密钥库的详细信息。
{{% /codetab %}}

{{% codetab %}}
在Kubernetes中，将服务主体的证书存储到Kubernetes Secret Store中，然后用Kubernetes secretstore中的这个证书启用Azure Key Vault密钥仓库。

1. 使用以下命令创建一个kubernetes密钥:

   ```bash
   kubectl create secret generic [your_k8s_spn_secret_name] --from-file=[your_k8s_spn_secret_key]=[pfx_certificate_file_fully_qualified_local_path]
   ```

- `[pfx_certificate_file_fully_qualified_local_path]`是你在上面下载的PFX证书文件的路径
- `[your_k8s_spn_secret_name]`是Kubernetes密钥仓库中的密钥名称
- `[your_k8s_spn_secret_key]` is secret key in Kubernetes secret store

2. 创建一个`azurekeyvault.yaml`组件文件

组件yaml使用`auth`属性引用Kubernetes secretstore，`secretKeyRef`引用存储在Kubernetes secret store中的证书。

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
    value: [your_keyvault_name]
  - name: spnTenantId
    value: "[your_service_principal_tenant_id]"
  - name: spnClientId
    value: "[your_service_principal_app_id]"
  - name: spnCertificate
    secretKeyRef:
      name: [your_k8s_spn_secret_name]
      key: [your_k8s_spn_secret_key]
auth:
    secretStore: kubernetes
```

3. 应用`azurekeyvault.yaml`组件

```bash
kubectl apply -f azurekeyvault.yaml
```
{{% /codetab %}}

{{< /tabs >}}

## 参考资料

- [Azure CLI Keyvault CLI](https://docs.microsoft.com/en-us/cli/azure/keyvault?view=azure-cli-latest#az-keyvault-create)
- [使用 Azure CLI 创建 Azure 服务主体](https://docs.microsoft.com/en-us/cli/azure/create-an-azure-service-principal-azure-cli?view=azure-cli-latest)
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
