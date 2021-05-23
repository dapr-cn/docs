---
type: docs
title: "Secret store component specs"
linkTitle: "Secret stores（密钥存储）"
weight: 4000
description: Dapr支持对接的密钥仓库
aliases:
  - "/zh-hans/operations/components/setup-secret-store/supported-secret-stores/"
no_list: true
---

表格标题：

> `状态`: [组件认证]({{X29X}}) 状态
  - [Alpha]({{X18X}})
  - [Beta]({{X20X}})
  - [GA]({{X22X}}) > `自从`: 定义了当前组件从哪个Dapr Runtime版本开始支持

> `组件版本`：代表组件的版本

### 通用

| Name                                                              | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ----------------------------------------------------------------- | ----------- | ----------------------- | --------- |
| [Local environment variables]({{< ref envvar-secret-store.md >}}) | Beta        | v1                      | 1.0       |
| [Local file]({{< ref file-secret-store.md >}})                    | Beta        | v1                      | 1.0       |
| [HashiCorp Vault]({{< ref hashicorp-vault.md >}})                 | Alpha       | v1                      | 1.0       |
| [Kubernetes secrets]({{< ref kubernetes-secret-store.md >}})      | GA          | v1                      | 1.0       |

### Amazon Web Services (AWS)

| Name                                                          | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ------------------------------------------------------------- | ----------- | ----------------------- | --------- |
| [AWS Secrets Manager]({{< ref aws-secret-manager.md >}})      | Alpha       | v1                      | 1.0       |
| [AWS SSM Parameter Store]({{< ref aws-parameter-store.md >}}) | Alpha       | v1                      | 1.1       |

### Google Cloud Platform (GCP)

| Name                                                    | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ------------------------------------------------------- | ----------- | ----------------------- | --------- |
| [GCP Secret Manager]({{< ref gcp-secret-manager.md >}}) | Alpha       | v1                      | 1.0       |

### Microsoft Azure

| Name                                                                                  | 状态 （Status） | 组件版本(Component version) | 自从(Since) |
| ------------------------------------------------------------------------------------- | ----------- | ----------------------- | --------- |
| [Azure Key Vault w/ Managed Identity]({{< ref azure-keyvault-managed-identity.md >}}) | Alpha       | v1                      | 1.0       |
| [Azure Key Vault]({{< ref azure-keyvault.md >}})                                      | GA          | v1                      | 1.0       |
