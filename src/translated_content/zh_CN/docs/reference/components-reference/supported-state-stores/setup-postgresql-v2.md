---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: PostgreSQL 状态存储组件的详细介绍
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-postgresql-v2/"
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-postgres-v2/"
---

{{% alert title="注意" color="primary" %}}
这是 PostgreSQL 状态存储组件的 v2 版，包含了一些性能和可靠性方面的改进。建议新应用使用 v2。

PostgreSQL v2 状态存储组件与 [v1 组件]({{< ref setup-postgresql-v1.md >}}) 不兼容，数据无法在两个版本之间迁移。v2 组件不支持状态存储查询 API。

目前没有计划弃用 v1 组件。
{{% /alert %}}

此组件允许使用 PostgreSQL (Postgres) 作为 Dapr 的状态存储，采用 "v2" 组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.postgresql
  # 注意：设置 "version" 为 "v2" 是使用 v2 组件所必需的
  version: v2
  metadata:
    # 连接字符串
    - name: connectionString
      value: "<CONNECTION STRING>"
    # 数据库操作的超时时间，作为 Go duration 或秒数（可选）
    #- name: timeout
    #  value: 20
    # 存储数据的表的前缀（可选）
    #- name: tablePrefix
    #  value: ""
    # 存储 Dapr 使用的元数据的表名（可选）
    #- name: metadataTableName
    #  value: "dapr_metadata"
    # 清理过期行的间隔时间，以秒为单位（可选）
    #- name: cleanupInterval
    #  value: "1h"
    # 该组件池化的最大连接数（可选）
    #- name: maxConns
    #  value: 0
    # 连接在关闭前的最大空闲时间（可选）
    #- name: connectionMaxIdleTime
    #  value: 0
    # 控制执行查询的默认模式。（可选）
    #- name: queryExecMode
    #  value: ""
    # 如果希望使用 PostgreSQL 作为 actor 或 workflow 的状态存储，请取消注释此项（可选）
    #- name: actorStateStore
    #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议按照[此处]({{< ref component-secrets.md >}})所述使用 secret 存储。
{{% /alert %}}

## 规格元数据字段

### 使用连接字符串进行身份验证

以下元数据选项是使用 PostgreSQL 连接字符串进行身份验证所**必需**的。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。有关如何定义连接字符串的信息，请参阅 PostgreSQL [数据库连接文档](https://www.postgresql.org/docs/current/libpq-connect.html)。 | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"` |

### 使用 Microsoft Entra ID 进行身份验证

使用 Microsoft Entra ID 进行身份验证支持 Azure Database for PostgreSQL。Dapr 支持的所有身份验证方法都可以使用，包括客户端凭据（"服务主体"）和托管身份。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | 必须设置为 `true` 以使组件能够从 Microsoft Entra ID 检索访问令牌。 | `"true"` |
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。<br>这必须包含用户，该用户对应于 PostgreSQL 内创建的用户名称，该用户映射到 Microsoft Entra ID 身份。这通常是相应主体的名称（例如，Microsoft Entra ID 应用程序的名称）。此连接字符串不应包含任何密码。  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
| `azureTenantId` | N | Microsoft Entra ID 租户的 ID | `"cd4b2887-304c-…"` |
| `azureClientId` | N | 客户端 ID（应用程序 ID） | `"c7dd251f-811f-…"` |
| `azureClientSecret` | N | 客户端 secret（应用程序密码） | `"Ecy3X…"` |

### 使用 AWS IAM 进行身份验证

使用 AWS IAM 进行身份验证支持所有版本的 PostgreSQL 类型组件。
连接字符串中指定的用户必须是数据库中已存在的用户，并且是授予 `rds_iam` 数据库角色的 AWS IAM 启用用户。
身份验证基于 AWS 身份验证配置文件，或提供的 AccessKey/SecretKey。
AWS 身份验证令牌将在其到期时间之前动态旋转。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `useAWSIAM` | Y | 必须设置为 `true` 以使组件能够从 AWS IAM 检索访问令牌。此身份验证方法仅适用于 AWS Relational Database Service for PostgreSQL 数据库。 | `"true"` |
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。<br>这必须包含一个已存在的用户，该用户对应于 PostgreSQL 内创建的用户名称，该用户映射到 AWS IAM 策略。此连接字符串不应包含任何密码。请注意，数据库名称字段由 AWS 中的 dbname 表示。 | `"host=mydb.postgres.database.aws.com user=myapplication port=5432 dbname=my_db sslmode=require"`|
| `awsRegion` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中弃用。请改用 'region'。AWS 关系数据库服务部署到的 AWS 区域。 | `"us-east-1"` |
| `awsAccessKey` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中弃用。请改用 'accessKey'。与 IAM 帐户关联的 AWS 访问密钥 | `"AKIAIOSFODNN7EXAMPLE"` |
| `awsSecretKey` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中弃用。请改用 'secretKey'。与访问密钥关联的 secret 密钥 | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| `awsSessionToken` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中弃用。请改用 'sessionToken'。要使用的 AWS 会话令牌。仅当您使用临时安全凭证时才需要会话令牌。 | `"TOKEN"` |

### 其他元数据选项

| 字段 | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `tablePrefix` | N | 存储数据的表的前缀。可以选择性地将模式名称作为前缀，例如 `public.prefix_` | `"prefix_"`, `"public.prefix_"` |
| `metadataTableName` | N | Dapr 用于存储一些元数据属性的表名。默认为 `dapr_metadata`。可以选择性地将模式名称作为前缀，例如 `public.dapr_metadata` | `"dapr_metadata"`, `"public.dapr_metadata"` |
| `timeout` | N | 数据库操作的超时时间，作为 [Go duration](https://pkg.go.dev/time#ParseDuration)。整数被解释为秒数。默认为 `20s` | `"30s"`, `30` |
| `cleanupInterval` | N | 间隔时间，作为 Go duration 或秒数，用于清理具有过期 TTL 的行。默认值：`1h`（1 小时）。将此值设置为 <=0 可禁用定期清理。 | `"30m"`, `1800`, `-1` |
| `maxConns` | N | 该组件池化的最大连接数。设置为 0 或更低以使用默认值，默认值为 4 或 CPU 数量中的较大者。 | `"4"` |
| `connectionMaxIdleTime` | N | 在连接池中未使用的连接自动关闭之前的最大空闲时间。默认情况下，没有值，这由数据库驱动程序选择。 | `"5m"` |
| `queryExecMode` | N | 控制执行查询的默认模式。默认情况下，Dapr 使用扩展协议并自动准备和缓存准备好的语句。然而，这可能与代理如 PGBouncer 不兼容。在这种情况下，可能更适合使用 `exec` 或 `simple_protocol`。 | `"simple_protocol"` |
| `actorStateStore` | N | 将此状态存储视为 actor。默认为 `"false"` | `"true"`, `"false"` |

## 设置 PostgreSQL

{{< tabs "Self-Hosted" >}}

{{% codetab %}}

1. 运行一个 PostgreSQL 实例。您可以使用以下命令在 Docker 中运行本地 PostgreSQL 实例：

     ```bash
     docker run -p 5432:5432 -e POSTGRES_PASSWORD=example postgres
     ```

     > 此示例不描述生产配置，因为它以明文设置密码，并且用户名保留为 PostgreSQL 默认的 "postgres"。

2. 为状态数据创建一个数据库。  
    可以使用默认的 "postgres" 数据库，或者创建一个新数据库来存储状态数据。

    要在 PostgreSQL 中创建新数据库，请运行以下 SQL 命令：

    ```sql
    CREATE DATABASE my_dapr;
    ```
  
{{% /codetab %}}

{{% /tabs %}}

## 高级

### v1 和 v2 之间的差异

PostgreSQL 状态存储 v2 在 Dapr 1.13 中引入。[现有的 v1]({{< ref setup-postgresql-v1.md >}}) 仍然可用，并且没有被弃用。

在 v2 组件中，表结构发生了显著变化，目的是提高性能和可靠性。最显著的是，Dapr 存储的值现在是 _BYTEA_ 类型，这允许更快的查询，并且在某些情况下比以前使用的 _JSONB_ 列更节省空间。  
然而，由于此更改，v2 组件不支持 [Dapr 状态存储查询 API]({{< ref howto-state-query-api.md >}})。

此外，在 v2 组件中，ETags 现在是随机 UUID，这确保了与其他 PostgreSQL 兼容数据库（如 CockroachDB）的更好兼容性。

由于这些更改，v1 和 v2 组件无法从同一个表中读取或写入数据。在此阶段，也无法在两个版本的组件之间迁移数据。

### 以人类可读格式显示数据

PostgreSQL v2 组件将状态的值存储在 `value` 列中，该列是 _BYTEA_ 类型。大多数 PostgreSQL 工具，包括 pgAdmin，默认将值视为二进制，并不以人类可读的形式显示。

如果您想检查状态存储中的值，并且知道它不是二进制的（例如，JSON 数据），您可以使用如下查询以人类可读的形式显示值：

```sql
-- 将 "state" 替换为您环境中的状态表名称
SELECT *, convert_from(value, 'utf-8') FROM state;
```

### TTL 和清理

此状态存储支持 Dapr 存储的记录的 [生存时间 (TTL)]({{< ref state-store-ttl.md >}})。使用 Dapr 存储数据时，您可以设置 `ttlInSeconds` 元数据属性，以指示数据在多少秒后应被视为 "过期"。

由于 PostgreSQL 没有内置的 TTL 支持，这在 Dapr 中通过在状态表中添加一列来实现，该列指示数据何时应被视为 "过期"。即使它们仍然物理存储在数据库中，"过期" 的记录也不会返回给调用者。后台 "垃圾收集器" 定期扫描状态表以查找过期的行并删除它们。

您可以使用 `cleanupInterval` 元数据属性设置过期记录的删除间隔，默认为 3600 秒（即 1 小时）。

- 较长的间隔需要较少频繁地扫描过期行，但可能需要更长时间存储过期记录，可能需要更多的存储空间。如果您计划在状态表中存储许多记录，并且 TTL 较短，请考虑将 `cleanupInterval` 设置为较小的值；例如，`5m`（5 分钟）。
- 如果您不打算在 Dapr 和 PostgreSQL 状态存储中使用 TTL，您应该考虑将 `cleanupInterval` 设置为 <= 0 的值（例如，`0` 或 `-1`）以禁用定期清理并减少数据库的负载。

## 相关链接

- [Dapr 组件的基本模式]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
