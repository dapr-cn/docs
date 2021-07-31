---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: PostgreSQL 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-postgresql/"
---

## 创建 Dapr 组件

创建一个名为 `postgres.yaml`的文件，粘贴以下文件并用您的连接字符串替换 `<CONNECTION STRING>` 值。 连接字符串是一个标准 PostgreSQL 连接字符串。 例如， `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=dapr_test"`。 查看 PostgreSQL 的[数据库连接文档](https://www.postgresql.org/docs/current/libpq-connect.html) ，特别是关键字/值连接字符串，了解如何定义连接字符串的信息。

如果您也想要配置 PostgreSQL 来存储 Actor，请在下面添加 `actorStateStore` 配置元素。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.postgresql
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， It is recommended to use a secret store for the secrets as described [here]({{< ref component-secrets.md >}}).
{{% /alert %}}

## 元数据字段规范

| 字段               | 必填 | 详情                                 | Example                                                                                           |
| ---------------- |:--:| ---------------------------------- | ------------------------------------------------------------------------------------------------- |
| connectionString | Y  | PostgreSQL 的连接字符串                  | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=dapr_test"` |
| actorStateStore  | N  | 是否将此状态存储给 Actor 使用。 默认值为 `"false"` | `"true"`, `"false"`                                                                               |


如果您想要使用 PostgreSQL 作为 Actor 存储，请在 yaml 上附上以下内容。

```yaml
  - name: actorStateStore
    value: "true"
```


## 创建 PostgreSQL

{{< tabs "Self-Hosted" >}}

{{% codetab %}}

1. 运行 PostgreSQL 实例。 您可以在Docker CE 中运行一个本地的 PostgreSQL 实例，并使用以下命令：

     此示例没有描述生产配置，因为它用纯文本设置了密码，用户名保留为“postgres”默认值。

     ```bash
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=example postgres
     ```

2. 为状态数据创建数据库。 可以使用默认的 "postgres" 数据库，或者创建一个新的数据库来存储状态数据。

    要在 PostgreSQL 中创建一个新的数据库，请运行以下SQL 命令：

    ```SQL
    create database dapr_test
    ```
{{% /codetab %}}

{{% /tabs %}}

## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
