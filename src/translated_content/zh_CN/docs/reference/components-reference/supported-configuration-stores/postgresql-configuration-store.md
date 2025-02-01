---
type: docs
title: "PostgreSQL"
linkTitle: "PostgreSQL"
description: PostgreSQL 配置存储组件的详细说明
aliases:
  - "/zh-hans/operations/components/setup-configuration-store/supported-configuration-stores/setup-postgresql/"
  - "/zh-hans/operations/components/setup-configuration-store/supported-configuration-stores/setup-postgres/"
---

## 组件格式

要配置 PostgreSQL 作为配置存储，您需要创建一个类型为 `configuration.postgresql` 的组件。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: configuration.postgresql
  version: v1
  metadata:
    # 连接字符串
    - name: connectionString
      value: "host=localhost user=postgres password=example port=5432 connect_timeout=10 database=config"
    # 存储配置信息的表名
    - name: table
      value: "[your_configuration_table_name]" 
    # 数据库操作的超时时间，以秒为单位（可选）
    #- name: timeoutInSeconds
    #  value: 20
    # 存储状态的表名（可选）
    #- name: tableName
    #  value: "state"
    # 存储 Dapr 使用的元数据的表名（可选）
    #- name: metadataTableName
    #  value: "dapr_metadata"
    # 清理过期行的间隔时间，以秒为单位（可选）
    #- name: cleanupIntervalInSeconds
    #  value: 3600
    # 该组件池化的最大连接数（可选）
    #- name: maxConns
    #  value: 0
    # 连接关闭前的最大空闲时间（可选）
    #- name: connectionMaxIdleTime
    #  value: 0
    # 控制查询执行的默认模式。（可选）
    #- name: queryExecMode
    #  value: ""
    # 如果希望使用 PostgreSQL 作为 actor 的状态存储，请取消注释此项（可选）
    #- name: actorStateStore
    #  value: "true"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储 secret。建议使用 secret 存储来保护这些信息，具体方法请参阅[这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

### 使用连接字符串进行身份验证

以下元数据选项是通过 PostgreSQL 连接字符串进行身份验证时**必需**的。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。有关如何定义连接字符串的信息，请参阅 PostgreSQL [数据库连接文档](https://www.postgresql.org/docs/current/libpq-connect.html)。 | `"host=localhost user=postgres password=example port=5432 connect_timeout=10 database=my_db"`

### 使用 Microsoft Entra ID 进行身份验证

使用 Microsoft Entra ID 进行身份验证支持 Azure Database for PostgreSQL。Dapr 支持的所有身份验证方法都可以使用，包括客户端凭据（"服务主体"）和托管身份。

| 字段  | 必需 | 详情 | 示例 |
|--------|:--------:|---------|---------|
| `useAzureAD` | Y | 必须设置为 `true` 以使组件能够从 Microsoft Entra ID 检索访问令牌。 | `"true"` |
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。<br>这必须包含用户，该用户对应于 PostgreSQL 内部创建的用户的名称，该用户映射到 Microsoft Entra ID 身份；这通常是相应主体的名称（例如 Microsoft Entra ID 应用程序的名称）。此连接字符串不应包含任何密码。  | `"host=mydb.postgres.database.azure.com user=myapplication port=5432 database=my_db sslmode=require"` |
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
| `connectionString` | Y | PostgreSQL 数据库的连接字符串。<br>这必须包含一个已存在的用户，该用户对应于 PostgreSQL 内部创建的用户的名称，该用户映射到 AWS IAM 策略。此连接字符串不应包含任何密码。请注意，数据库名称字段由 AWS 中的 dbname 表示。 | `"host=mydb.postgres.database.aws.com user=myapplication port=5432 dbname=my_db sslmode=require"`|
| `awsRegion` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'region'。AWS Relational Database Service 部署到的 AWS 区域。 | `"us-east-1"` |
| `awsAccessKey` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'accessKey'。与 IAM 帐户关联的 AWS 访问密钥 | `"AKIAIOSFODNN7EXAMPLE"` |
| `awsSecretKey` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'secretKey'。与访问密钥关联的 secret 密钥 | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| `awsSessionToken` | N | 这保持与现有字段的向后兼容性。它将在 Dapr 1.17 中被弃用。请改用 'sessionToken'。要使用的 AWS 会话令牌。仅当您使用临时安全凭证时才需要会话令牌。 | `"TOKEN"` |

### 其他元数据选项

| 字段 | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `table` | Y | 配置信息的表名，必须小写。 | `configtable`
| `timeout` | N | 数据库操作的超时时间，作为 [Go duration](https://pkg.go.dev/time#ParseDuration)。整数被解释为秒数。默认为 `20s` | `"30s"`, `30` |
| `maxConns` | N | 该组件池化的最大连接数。设置为 0 或更低以使用默认值，默认值为 4 或 CPU 数量中的较大者。 | `"4"`
| `connectionMaxIdleTime` | N | 在连接池中未使用的连接自动关闭之前的最大空闲时间。默认情况下，没有值，这由数据库驱动程序选择。 | `"5m"`
| `queryExecMode` | N | 控制查询执行的默认模式。默认情况下，Dapr 使用扩展协议并自动准备和缓存准备好的语句。然而，这可能与代理如 PGBouncer 不兼容。在这种情况下，可能更适合使用 `exec` 或 `simple_protocol`。 | `"simple_protocol"`

## 设置 PostgreSQL 作为配置存储

1. 启动 PostgreSQL 数据库。
2. 连接到 PostgreSQL 数据库并设置具有以下模式的配置表：

    | 字段              | 数据类型 | 可为空 | 详情 |
    |--------------------|:--------:|---------|---------|
    | KEY | VARCHAR | N |持有配置属性的 `"Key"` |
    | VALUE | VARCHAR | N |持有配置属性的值 |
    | VERSION | VARCHAR | N | 持有配置属性的版本 |
    | METADATA | JSON | Y | 以 JSON 形式持有元数据 |

    ```sql
    CREATE TABLE IF NOT EXISTS table_name (
      KEY VARCHAR NOT NULL,
      VALUE VARCHAR NOT NULL,
      VERSION VARCHAR NOT NULL,
      METADATA JSON
    );
    ```

3. 在配置表上创建一个 TRIGGER。创建 TRIGGER 的示例函数如下：

   ```sh
   CREATE OR REPLACE FUNCTION notify_event() RETURNS TRIGGER AS $$
       DECLARE 
           data json;
           notification json;

       BEGIN

           IF (TG_OP = 'DELETE') THEN
               data = row_to_json(OLD);
           ELSE
               data = row_to_json(NEW);
           END IF;

           notification = json_build_object(
                             'table',TG_TABLE_NAME,
                             'action', TG_OP,
                             'data', data);
           PERFORM pg_notify('config',notification::text);
           RETURN NULL; 
       END;
   $$ LANGUAGE plpgsql;
   ```

4. 使用标记为 `data` 的字段封装数据创建触发器：

   ```sql
   notification = json_build_object(
     'table',TG_TABLE_NAME,
     'action', TG_OP,
     'data', data
   );
   ```

5. 在订阅配置通知时，应使用作为 `pg_notify` 属性提到的通道。
6. 由于这是一个通用创建的触发器，将此触发器映射到 `configuration table`。

   ```sql
   CREATE TRIGGER config
   AFTER INSERT OR UPDATE OR DELETE ON configtable
       FOR EACH ROW EXECUTE PROCEDURE notify_event();
   ```

7. 在订阅请求中添加一个额外的元数据字段，键为 `pgNotifyChannel`，值应设置为在 `pg_notify` 中提到的相同 `channel name`。从上面的示例中，它应设置为 `config`。

{{% alert title="注意" color="primary" %}}
调用 `subscribe` API 时，应使用 `metadata.pgNotifyChannel` 指定从 PostgreSQL 配置存储中监听通知的通道名称。

可以向订阅请求添加任意数量的键。每个订阅使用一个独占的数据库连接。强烈建议在单个订阅中订阅多个键。这有助于优化与数据库的连接数量。

订阅 HTTP API 示例：

```sh
curl -l 'http://<host>:<dapr-http-port>/configuration/mypostgresql/subscribe?key=<keyname1>&key=<keyname2>&metadata.pgNotifyChannel=<channel name>'
```
{{% /alert %}}

## 相关链接

- [Dapr 组件的基本模式]({{< ref component-schema >}})
- [配置构建块]({{< ref configuration-api-overview >}})
