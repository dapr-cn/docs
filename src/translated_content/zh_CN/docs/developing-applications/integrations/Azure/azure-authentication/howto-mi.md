---
type: docs
title: "如何使用托管身份"
linkTitle: "如何使用托管身份"
weight: 40000
aliases:
  - "/zh-hans/developing-applications/integrations/azure/azure-authentication/howto-msi/"
description: "学习如何使用托管身份"
---

托管身份可以自动进行身份验证，因为您的应用程序运行在具有系统分配或用户分配身份的 Azure 服务上。

要开始使用，您需要在各种 Azure 服务中启用托管身份作为服务选项/功能，这与 Dapr 无关。启用后，会在后台为 Microsoft Entra ID（以前称为 Azure Active Directory ID）创建一个身份（或应用程序）。

然后，您的 Dapr 服务可以利用该身份与 Microsoft Entra ID 进行认证，过程是透明的，您无需指定任何凭据。

在本指南中，您将学习如何：
- 通过官方 Azure 文档将您的身份授予您正在使用的 Azure 服务
- 在您的组件中设置系统管理或用户分配身份

以上是全部内容。

{{% alert title="注意" color="primary" %}}
在您的组件 YAML 中，如果使用用户分配身份，您只需要 [`azureClientId` 属性]({{< ref "authenticating-azure.md#authenticating-with-managed-identities-mi" >}})。否则，您可以省略此属性，默认使用系统管理身份。
{{% /alert %}}

## 授予服务访问权限

为特定 Azure 资源（由资源范围标识）设置必要的 Microsoft Entra ID 角色分配或自定义权限给您的系统管理或用户分配身份。

您可以为新的或现有的 Azure 资源设置托管身份。说明取决于所使用的服务。请查看以下官方文档以获取最合适的说明：

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure Container Apps (ACA)](https://learn.microsoft.com/azure/container-apps/dapr-components?tabs=yaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity)（包括 Azure Web Apps 和 Azure Functions）
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

在为您的 Azure 资源分配系统管理身份后，您将获得如下信息：

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

请注意 **`principalId`** 值，这是为您的身份创建的 [服务主体 ID]({{< ref "howto-aad.md#create-a-service-principal" >}})。使用它来授予您的 Azure 资源组件访问权限。

{{% alert title="Azure Container Apps 中的托管身份" color="primary" %}}
每个容器应用都有一个完全不同的系统管理身份，这使得在多个应用之间处理所需的角色分配非常难以管理。

因此，_强烈建议_ 使用用户分配身份并将其附加到所有应加载组件的应用中。然后，您应将组件范围限定在这些相同的应用上。
{{% /alert %}}

## 在您的组件中设置身份

默认情况下，Dapr Azure 组件会查找其运行环境的系统管理身份并以此进行认证。通常，对于给定组件，除了服务名称、存储帐户名称和 Azure 服务所需的任何其他属性（在文档中列出）外，没有使用系统管理身份的必需属性。

对于用户分配身份，除了您正在使用的服务所需的基本属性外，您还需要在组件中指定 `azureClientId`（用户分配身份 ID）。确保用户分配身份已附加到 Dapr 运行的 Azure 服务上，否则您将无法使用该身份。

{{% alert title="注意" color="primary" %}}
如果 sidecar 加载的组件未指定 `azureClientId`，它只会尝试系统分配身份。如果组件指定了 `azureClientId` 属性，它只会尝试具有该 ID 的特定用户分配身份。
{{% /alert %}}

以下示例演示了在 Azure KeyVault secrets 组件中设置系统管理或用户分配身份。

{{< tabs "系统管理" "用户分配" "Kubernetes" >}}

 <!-- system managed -->
{{% codetab %}}

如果您使用 Azure KeyVault 组件设置系统管理身份，YAML 将如下所示：

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

在此示例中，系统管理身份查找服务身份并与 `mykeyvault` 保管库通信。接下来，授予您的系统管理身份访问所需服务的权限。

{{% /codetab %}}

 <!-- user assigned -->
{{% codetab %}}

如果您使用 Azure KeyVault 组件设置用户分配身份，YAML 将如下所示：

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

一旦您在组件 YAML 中设置了 `azureClientId` 属性，您就可以授予您的用户分配身份访问您的服务。

{{% /codetab %}}

 <!-- k8s -->
{{% codetab %}}

有关 Kubernetes 或 AKS 中的组件配置，请参阅 [工作负载身份指南。](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)

{{% /codetab %}}

{{< /tabs >}}

## 故障排除

如果您收到错误或托管身份未按预期工作，请检查以下项目是否为真：

- 系统管理身份或用户分配身份没有目标资源的所需权限。
- 用户分配身份未附加到您加载组件的 Azure 服务（容器应用或 pod）。这尤其可能发生在：
  - 您有一个未限定范围的组件（由环境中的所有容器应用或 AKS 集群中的所有部署加载的组件）。
  - 您仅将用户分配身份附加到 AKS 中的一个容器应用或一个部署（使用 [Azure 工作负载身份](https://learn.microsoft.com/azure/aks/workload-identity-overview?tabs=dotnet)）。

  在这种情况下，由于身份未附加到 AKS 中的每个其他容器应用或部署，引用用户分配身份的组件通过 `azureClientId` 失败。

> **最佳实践：** 使用用户分配身份时，请确保将您的组件范围限定在特定应用上！

## 下一步

{{< button text="参考 Azure 组件规范 >>" page="components-reference" >}}
