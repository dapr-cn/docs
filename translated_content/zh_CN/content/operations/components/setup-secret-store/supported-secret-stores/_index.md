---
type: docs
title: "Supported secret stores"
linkTitle: "Supported secret stores"
weight: 50000
description: The supported secret stores that interface with Dapr
no_list: true
---

Table captions:

> `Status`: [Component certification]({{X28X}}) status
  - [Alpha]({{X17X}})
  - [Beta]({{X19X}})
  - [GA]({{X21X}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `Component version`: defines the version of the component

### Generic

| 名称                                                                | 状态 （State） | Component version | Since |
| ----------------------------------------------------------------- | ---------- | ----------------- | ----- |
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | Beta       | v1                | 1.0   |
| [Local file]({{< ref file-secret-store.md >}})                    | Beta       | v1                | 1.0   |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | Alpha      | v1                | 1.0   |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | GA         | v1                | 1.0   |

### Amazon Web Services (AWS)

| Name                                                     | Status | Component version | Since |
| -------------------------------------------------------- | ------ | ----------------- | ----- |
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}}) | Alpha  | v1                | 1.0   |

### Google Cloud Platform (GCP)

| Name                                                    | Status | Component version | Since |
| ------------------------------------------------------- | ------ | ----------------- | ----- |
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}}) | Alpha  | v1                | 1.0   |

### Microsoft Azure

| Name                                                                                  | Status | Component version | Since |
| ------------------------------------------------------------------------------------- | ------ | ----------------- | ----- |
| [Azure Key Vault w/ Managed Identity]({{< ref azure-keyvault-managed-identity.md >}}) | Alpha  | v1                | 1.0   |
| [Azure Key Vault]({{< ref azure-keyvault.md >}})                                      | GA     | v1                | 1.0   |
