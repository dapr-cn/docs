---
type: docs
title: "Secret store component specs"
linkTitle: "Secret stores（密钥仓库）"
weight: 4000
description: Dapr支持对接的密钥仓库
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/"
no_list: true
---

表格标题：

> `Status`: [Component certification]({{<ref "certification-lifecycle.md">}}) status
  - [Alpha]({{<ref "certification-lifecycle.md#alpha">}})
  - [Beta]({{<ref "certification-lifecycle.md#beta">}})
  - [GA]({{<ref "certification-lifecycle.md#general-availability-ga">}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `组件版本`：代表组件的版本

### 通用

| Name                                                              | 状态    | 组件版本 | 自从  |
| ----------------------------------------------------------------- | ----- | ---- | --- |
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | Beta  | v1   | 1.0 |
| [Local file]({{< ref file-secret-store.md >}})                    | Beta  | v1   | 1.0 |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | Alpha | v1   | 1.0 |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | GA    | v1   | 1.0 |

### Amazon Web Services (AWS)

| Name                                                          | 状态    | 组件版本 | 自从  |
| ------------------------------------------------------------- | ----- | ---- | --- |
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}})      | Alpha | v1   | 1.0 |
| [AWS SSM Parameter Store]({{< ref aws-parameter-store.md >}}) | Alpha | v1   | 1.1 |

### Google Cloud Platform (GCP)

| Name                                                    | 状态    | 组件版本 | 自从  |
| ------------------------------------------------------- | ----- | ---- | --- |
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}}) | Alpha | v1   | 1.0 |

### Microsoft Azure

| Name                                             | 状态 | 组件版本 | 自从  |
| ------------------------------------------------ | -- | ---- | --- |
| [Azure Key Vault]({{< ref azure-keyvault.md >}}) | GA | v1   | 1.0 |
