---
type: docs
title: "如何：生成新的 Microsoft Entra ID 应用程序和 Service Principal"
linkTitle: "How to: Generate Microsoft Entra ID and Service Principal"
weight: 50000
description: "了解如何生成Microsoft Entra ID并将其用作Service Principal"
---

## 前期准备

- [Azure 订阅](https://azure.microsoft.com/free/)
- [Azure CLI](https://docs.microsoft.com/cli/azure/install-azure-cli)
- [jq](https://stedolan.github.io/jq/download/)
- OpenSSL（默认包含在所有 Linux 和 macOS 系统以及 WSL 上）
- 确保您正在使用 bash 或 zsh shell

## 使用 Azure CLI 登录到 Azure

在一个新的终端中，运行以下命令：

```sh
az login
az account set -s [your subscription id]
```

### 创建 Microsoft Entra ID 应用程序

使用以下命令创建 Microsoft Entra ID 应用程序：

```sh
# Friendly name for the application / Service Principal
APP_NAME="dapr-application"

# Create the app
APP_ID=$(az ad app create --display-name "${APP_NAME}"  | jq -r .appId)
```

选择您更喜欢的凭据传递方式。

{{< tabs "Client secret" "PFX certificate">}}

{{% codetab %}}

要创建一个**客户端密钥**，请运行以下命令。

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --years 2
```

这将基于`base64`字符集生成一个随机的40个字符长的密码。 此密码将在2年后过期，请在此之前进行更换。

保存返回的输出值；您将需要它们来使 Dapr 与 Azure 进行身份验证。 预期输出：

```json
{
  "appId": "<your-app-id>",
  "password": "<your-password>",
  "tenant": "<your-azure-tenant>"
}
```

将返回的值添加到您的 Dapr 组件的元数据中：

- `appId` 是 `azureClientId` 的值
- `password` 是 `azureClientSecret` 的值 (这是随机生成的)
- `tenant` 是 `azureTenantId` 的值

{{% /codetab %}}

{{% codetab %}}
如果要使用 **PFX （PKCS#12） 证书**，请运行以下命令创建自签名证书：

```sh
az ad app credential reset \
  --id "${APP_ID}" \
  --create-cert
```

> **注意：**仅建议将自签名证书用于开发。 对于生产环境，应使用由 CA 签名并使用 `--cert` 标志导入的证书。

上述命令的输出应如下所示：

保存返回的输出值；您将需要它们来使 Dapr 与 Azure 进行身份验证。 预期输出：

```json
{
  "appId": "<your-app-id>",
  "fileWithCertAndPrivateKey": "<file-path>",
  "password": null,
  "tenant": "<your-azure-tenant>"
}
```

将返回的值添加到您的 Dapr 组件的元数据中：

- `appId` 是 `azureClientId` 的值
- `tenant` 是 `azureTenantId` 的值
- `fileWithCertAndPrivateKey`指示自签名PFX证书和私钥的位置。 将该文件的内容用作`azureCertificate`（或将其写入服务器上的文件并使用`azureCertificateFile`）

> **注意：**虽然生成的文件有`.pem`扩展名，但它包含了一个编码为PFX（PKCS#12）的证书和私钥。

{{% /codetab %}}

{{< /tabs >}}

### 创建一个 Service Principal

一旦您创建了一个Microsoft Entra ID应用程序，请为该应用程序创建一个Service Principal。 通过这个 Service Principal，您可以授予它访问Azure资源的权限。

要创建Service Principal，请运行以下命令：

```sh
SERVICE_PRINCIPAL_ID=$(az ad sp create \
  --id "${APP_ID}" \
  | jq -r .id)
echo "Service Principal ID: ${SERVICE_PRINCIPAL_ID}"
```

预期输出：

```text
服务主体 ID： 1d0ccf05-5427-4b5e-8eb4-005ac5f9f163
```

上面返回的值是**Service Principal ID**，它与Microsoft Entra ID 应用程序 ID（客户端ID）不同。 Service Principal ID在Azure租户中定义，并用于向应用程序授予访问Azure资源的权限  
您将使用Service Principal ID来授予应用程序访问Azure资源的权限。

与此同时，**客户端ID**被您的应用程序用于验证身份。 您将在 Dapr 清单中使用客户端 ID 来配置与 Azure 服务的身份验证。

请记住，默认情况下，刚创建的服务主体无权访问任何 Azure 资源。 需要根据需要授予对每个资源的访问权限，如组件的文档中所述。

## 下一步

{{< button text="Use Managed Identities >>" page="howto-mi.md" >}}
