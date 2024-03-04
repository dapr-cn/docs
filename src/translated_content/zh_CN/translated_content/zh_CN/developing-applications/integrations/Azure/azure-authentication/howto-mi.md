---
type: docs
title: "如何使用 Managed Identities"
linkTitle: "How to: Use MI"
weight: 40000
aliases:
  - "/zh-hans/developing-applications/integrations/azure/azure-authentication/howto-msi/"
description: "学习如何使用Managed Identities"
---

使用 Managed Identities (MI)，通过您的应用程序在具有已分配身份的 Azure 服务之上运行，认证将自动发生。

例如，假设您为Azure VM、Azure Container Apps或Azure Kubernetes Service集群启用了托管服务标识。 当您这样做时，将为您创建一个Microsoft Entra ID应用程序，并自动分配给该服务。 然后，Dapr 服务可以透明地利用该身份向 Microsoft Entra ID 进行身份验证，而无需指定任何凭据。

要开始使用托管标识，您需要将标识分配给新的或现有的 Azure 资源。 说明取决于服务使用情况。 请查阅以下官方文档以获取最合适的说明：

- [Azure Kubernetes Service (AKS)](https://docs.microsoft.com/azure/aks/use-managed-identity)
- [Azure Container Apps (ACA)](https://learn.microsoft.com/azure/container-apps/dapr-overview?tabs=bicep1%2Cyaml#using-managed-identity)
- [Azure App Service](https://docs.microsoft.com/azure/app-service/overview-managed-identity) （包括 Azure Web Apps 和 Azure Functions）
- [Azure Virtual Machines (VM)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vm)
- [Azure Virtual Machines Scale Sets (VMSS)](https://docs.microsoft.com/azure/active-directory/managed-identities-azure-resources/qs-configure-cli-windows-vmss)
- [Azure Container Instance (ACI)](https://docs.microsoft.com/azure/container-instances/container-instances-managed-identity)

Dapr 支持系统分配和用户分配的身份。

在为您的Azure资源分配身份后，您将拥有以下凭据：

```json
{
    "principalId": "<object-id>",
    "tenantId": "<tenant-id>",
    "type": "SystemAssigned",
    "userAssignedIdentities": null
}
```

从返回的值中，记下 **`principalId`**，这是创建的 Service Principal 的 ID。 您将使用它来向您的身份授予对Azure资源的访问权限。

## 下一步

{{< button text="Refer to Azure component specs >>" page="components-reference" >}}
