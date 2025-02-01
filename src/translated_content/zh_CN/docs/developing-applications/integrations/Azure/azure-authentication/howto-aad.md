---
type: docs
title: "如何创建新的 Microsoft Entra ID 应用程序和服务主体"
linkTitle: "如何创建 Microsoft Entra ID 应用程序和服务主体"
weight: 30000
description: "了解如何创建 Microsoft Entra ID 应用程序并将其用作服务主体"
---

## 先决条件

- [一个 Azure 订阅](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL（默认包含在所有 Linux 和 macOS 系统中，以及 WSL 中）
- 确保您使用的是 bash 或 zsh shell

## 使用 Azure CLI 登录 Azure

在新终端中，运行以下命令：

```sh
az login
az account set -s [your subscription id]
```

### 创建 Microsoft Entra ID 应用程序

使用以下命令创建 Microsoft Entra ID 应用程序：

```sh
# 应用程序 / 服务主体的友好名称
APP_NAME="dapr-application"

# 创建应用程序
APP_ID=$(az ad app create --display-name "${APP_NAME}"  | jq -r .appId)
```

选择传递凭据的方式。

{{< tabs "客户端密钥" "PFX 证书">}}

{{% codetab %}}

要创建一个**客户端密钥**，运行以下命令。

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2
```

这将生成一个基于 `base64` 字符集的随机40字符长的密码。此密码有效期为2年，之后需要更新。

请保存返回的输出值；您将需要它们来让 Dapr 通过 Azure 进行身份验证。预期输出：

```json
{
  "appId": "<your-app-id>",
  "password": "<your-password>",
  "tenant": "<your-azure-tenant>"
}
```

在将返回的值添加到您的 Dapr 组件的元数据时：

- `appId` 是 `azureClientId` 的值
- `password` 是 `azureClientSecret` 的值（这是随机生成的）
- `tenant` 是 `azureTenantId` 的值

{{% /codetab %}}

{{% codetab %}}
对于 **PFX (PKCS#12) 证书**，运行以下命令以创建自签名证书：

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> **注意：** 自签名证书仅建议用于开发环境。在生产环境中，您应使用由 CA 签名并通过 `--cert` 标志导入的证书。

上述命令的输出应如下所示：

请保存返回的输出值；您将需要它们来让 Dapr 通过 Azure 进行身份验证。预期输出：

```json
{
  "appId": "<your-app-id>",
  "fileWithCertAndPrivateKey": "<file-path>",
  "password": null,
  "tenant": "<your-azure-tenant>"
}
```

在将返回的值添加到您的 Dapr 组件的元数据时：

- `appId` 是 `azureClientId` 的值
- `tenant` 是 `azureTenantId` 的值
- `fileWithCertAndPrivateKey` 表示自签名 PFX 证书和私钥的位置。使用该文件的内容作为 `azureCertificate`（或将其写入服务器上的文件并使用 `azureCertificateFile`）

> **注意：** 虽然生成的文件具有 `.pem` 扩展名，但它包含编码为 PFX (PKCS#12) 的证书和私钥。

{{% /codetab %}}

{{< /tabs >}}

### 创建服务主体

一旦您创建了 Microsoft Entra ID 应用程序，为该应用程序创建一个服务主体。通过此服务主体，您可以授予其访问 Azure 资源的权限。

要创建服务主体，运行以下命令：

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .id)
echo "服务主体 ID: ${SERVICE_PRINCIPAL_ID}"
```

预期输出：

```text
服务主体 ID: 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

上面返回的值是**服务主体 ID**，它与 Microsoft Entra ID 应用程序 ID（客户端 ID）不同。服务主体 ID 在 Azure 租户内定义，用于授予应用程序访问 Azure 资源的权限。  
您将使用服务主体 ID 授予应用程序访问 Azure 资源的权限。

同时，**客户端 ID** 由您的应用程序用于身份验证。您将在 Dapr 清单中使用客户端 ID 来配置与 Azure 服务的身份验证。

请记住，刚刚创建的服务主体默认没有访问任何 Azure 资源的权限。需要根据需要为每个资源授予访问权限，如组件文档中所述。

## 下一步

{{< button text="使用托管身份" page="howto-mi.md" >}}
