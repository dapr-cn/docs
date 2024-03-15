---
type: docs
title: 如何使用Managed Identities
linkTitle: 如何使用Managed Identities
weight: 40000
aliases:
  - /zh-hans/developing-applications/integrations/azure/azure-authentication/howto-msi/
description: 了解如何使用Managed Identities
---

使用托管标识，认证会自动发生，因为您的应用程序运行在具有系统管理或用户分配身份的 Azure 服务之上。

要开始使用，您需要在各种Azure服务中启用托管标识作为一个独立于Dapr的服务选项/功能。 启用此功能会在幕后为Microsoft Entra ID（以前是Azure Active Directory ID）创建一个身份（或应用程序）。

然后，Dapr 服务可以透明地利用该身份向 Microsoft Entra ID 进行身份验证，而无需指定任何凭据。

在本指南中，您将学习如何：

- 通过官方Azure文档向您正在使用的Azure服务授予身份
- 在您的组件中设置系统管理或用户分配的身份

这就是它的全部内容。

{{% alert title="注意" color="primary" %}}
在您的组件YAML中，只有在使用用户分配的标识时，您才需要[`azureClientId`属性]({{< ref "authenticating-azure.md#authenticating-with-managed-identities-mi" >}})。 否则，您可以省略此属性，以默认使用系统管理的身份。
{{% /alert %}}

## 授予对服务的访问权限

为特定的Azure资源（由资源范围标识）设置必要的Microsoft Entra ID角色分配或自定义权限，以供系统管理的身份或用户分配的身份使用。

您可以为新的或现有的Azure资源设置 Managed Identities。 说明取决于服务使用情况。 请查阅以下官方文档以获取最合适的说明：

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure容器应用（ACA）](https://learn.microsoft.com/azure/container-apps/dapr-overview?tabs=bicep1%2Cyaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity)（包括 Azure Web 应用程序和 Azure 函数）
- [Azure虚拟机（VM）](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure虚拟机规模集（VMSS）](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure容器实例（ACI）](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

在为您的Azure资源分配系统管理的身份后，您将拥有以下凭据：

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

从返回的值中，注意\*\*`principalId`\*\*的值，这是[为您的身份创建的Service Principal ID]({{< ref "howto-aad.md#create-a-service-principal" >}})。 使用该组件来授予访问权限，使其能够访问身份标识。

{{% alert title="Azure Container Apps中的托管身份" color="primary" %}}
每个容器应用都有一个完全不同的系统托管身份，这使得在多个应用程序之间处理所需的角色分配非常难以管理。

相反，_强烈建议_使用用户分配的身份，并将其附加到所有应加载该组件的应用程序。 然后，您应该将组件范围限定为这些相同的应用程序。
{{% /alert %}}

## 在您的组件中设置身份

默认情况下，Dapr Azure 组件会查找它们运行的环境的系统托管标识，并以该标识进行身份验证。 通常情况下，对于给定的组件，除了服务名称、存储账户名称和Azure服务所需的其他属性（在文档中列出）之外，没有必需的属性来使用系统托管标识。

对于用户分配的标识，除了服务所需的基本属性外，您还需要在组件中指定 `azureClientId`（用户分配的标识 ID）。 确保用户分配的身份已附加到运行Dapr的Azure服务上，否则您将无法使用该身份。

{{% alert title="注意" color="primary" %}}
如果侧车加载的组件没有指定 `azureClientId`，它只会尝试使用系统分配的身份。 如果组件指定了 `azureClientId` 属性，则只尝试具有该 ID 的特定用户分配的标识。
{{% /alert %}}

以下示例演示在Azure KeyVault secrets组件中设置系统管理或用户分配的身份。

{{< tabs "System-managed" "User-assigned" "Kubernetes" >}}

 <!-- system managed -->

{{% codetab %}}

如果您使用 Azure KeyVault 组件设置系统管理的身份，则 YAML 将如下所示：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: mykeyvault
```

在这个示例中，系统管理的身份查找服务身份并与`mykeyvault`保险库进行通信。 接下来，将您的系统托管标识授予所需服务的访问权限。

{{% /codetab %}}

 <!-- user assigned -->

{{% codetab %}}

如果您使用 Azure KeyVault 组件设置用户分配的身份，则 YAML 将如下所示：

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: azurekeyvault
spec:
  type: secretstores.azure.keyvault
  version: v1
  metadata:
  - name: vaultName
    value: mykeyvault
  - name: azureClientId
    value: someAzureIdentityClientIDHere
```

一旦您在组件的YAML中设置了`azureClientId`属性，您可以授予您的用户分配的身份对您的服务的访问权限。

{{% /codetab %}}

 <!-- k8s -->

{{% codetab %}}

对于在Kubernetes或AKS中的组件配置，请参考[Workload Identity指南](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)。

{{% /codetab %}}

{{< /tabs >}}

## 疑难解答

如果您收到错误消息或者您的托管身份无法正常工作，请检查以下事项是否正确：

- 系统管理的标识或用户分配的标识在目标资源上没有所需的权限。
- 用户分配的标识未附加到您正在加载组件的 Azure 服务（容器应用程序或 Pod）。 这种情况特别容易发生，如果：
  - 您有一个未作用域限定的组件（一个由环境中所有容器应用或您的 AKS 群集中所有部署加载的组件）。
  - 您将用户分配的身份仅附加到了 AKS 中的一个容器应用程序或一个部署中（使用 [Azure Workload Identity](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)）。
  在这种情况下，由于身份验证未附加到AKS中的每个其他容器应用程序或部署，因此通过`azureClientId`引用用户分配的身份的组件将失败。

> \*\*最佳实践：\*\*在使用用户分配的身份时，请确保将您的组件范围限定在特定的应用程序中！

## 下一步

{{< button text="参考 Azure 组件规格 >>" page="components-reference" >}}
