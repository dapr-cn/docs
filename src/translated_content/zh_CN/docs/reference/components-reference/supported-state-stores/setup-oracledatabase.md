---
type: docs
title: "Oracle 数据库"
linkTitle: "Oracle 数据库"
description: Oracle 数据库状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-oracledatabase/"
---

## 组件格式

创建一个组件属性的 yaml 文件，例如 `oracle.yaml`（名称可以随意），然后粘贴以下内容，并将 `<CONNECTION STRING>` 替换为您的连接字符串。连接字符串是标准的 Oracle 数据库连接字符串，格式为：`"oracle://user/password@host:port/servicename"`，例如 `"oracle://demo:demo@localhost:1521/xe"`。

如果您通过 Oracle Wallet 连接数据库，则应为 `oracleWalletLocation` 属性指定一个值，例如：`"/home/app/state/Wallet_daprDB/"`；这应该指向本地文件系统目录，该目录包含从 Oracle Wallet 压缩文件中提取的 `cwallet.sso` 文件。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.oracledatabase
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: oracleWalletLocation
    value: "<FULL PATH TO DIRECTORY WITH ORACLE WALLET CONTENTS >"  # 可选，无默认值
  - name: tableName
    value: "<NAME OF DATABASE TABLE TO STORE STATE IN >" # 可选，默认为 STATE
  # 如果您希望使用 Oracle 数据库作为 actor 的状态存储，请取消注释此行（可选）
  #- name: actorStateStore
  #  value: "true"
```
{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| connectionString   | Y        | Oracle 数据库的连接字符串 | `"oracle://user/password@host:port/servicename"` 例如 `"oracle://demo:demo@localhost:1521/xe"` 或对于 Autonomous Database `"oracle://states_schema:State12345pw@adb.us-ashburn-1.oraclecloud.com:1522/k8j2agsqjsw_daprdb_low.adb.oraclecloud.com"`
| oracleWalletLocation    | N         | Oracle Wallet 文件内容的位置（连接到 OCI 上的 Autonomous Database 时需要）| `"/home/app/state/Wallet_daprDB/"`
| tableName    | N         | 此状态存储实例记录数据的数据库表的名称，默认 `"STATE"`| `"MY_APP_STATE_STORE"`
| actorStateStore    | N        | 考虑此状态存储用于 actor。默认为 `"false"` | `"true"`, `"false"`

## 运行时会发生什么？
当状态存储组件初始化时，它会连接到 Oracle 数据库并检查是否存在指定 `tableName` 的表。如果不存在，它会创建此表（包含列 Key, Value, Binary_YN, ETag, Creation_Time, Update_Time, Expiration_time）。

每个状态条目由数据库表中的一条记录表示。请求中提供的 `key` 属性用于确定存储在 KEY 列中的对象名称。`value` 作为对象的内容存储。二进制内容以 Base64 编码文本存储。每个对象在创建或更新时都会分配一个唯一的 ETag 值。

例如，以下操作

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

在表 STATE 中创建以下记录：

| KEY | VALUE | CREATION_TIME  | BINARY_YN | ETAG |
| ------------ | ------- | ----- | ----- | ---- |
| nihilus | darth | 2022-02-14T22:11:00 | N | 79dfb504-5b27-43f6-950f-d55d5ae0894f |

Dapr 使用固定的键方案和*复合键*来跨应用程序分区状态。对于一般状态，键格式为：`App-ID||state key`。Oracle 数据库状态存储将此键完整映射到 KEY 列。

您可以通过对 `tableName` 表（例如 STATE 表）进行 SQL 查询轻松检查所有存储的状态。

## 生存时间和状态过期
Oracle 数据库状态存储组件支持 Dapr 的生存时间逻辑，确保状态在过期后无法检索。有关详细信息，请参阅[此处关于设置状态生存时间的指南]({{< ref "state-store-ttl.md" >}})。

Oracle 数据库本身不支持生存时间设置。此组件的实现使用名为 `EXPIRATION_TIME` 的列来保存记录被视为*过期*的时间。仅当在 `Set` 请求中指定了 TTL 时，才会设置此列中的值。它被计算为当前 UTC 时间戳加上 TTL 时间段。当通过 `Get` 调用检索状态时，此组件会检查是否设置了 `EXPIRATION_TIME`，如果是，则检查它是否在过去。在这种情况下，不会返回状态。

以下操作：

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "temporary",
          "value": "ephemeral",
          "metadata": {"ttlInSeconds": "120"}}
        }
      ]'
```

创建以下对象：

| KEY | VALUE | CREATION_TIME  |EXPIRATION_TIME  | BINARY_YN | ETAG |
| ------------ | ------- | ----- | ----- | ---- |---- |
| temporary | ephemeral | 2022-03-31T22:11:00 |2022-03-31T22:13:00 | N | 79dfb504-5b27-43f6-950f-d55d5ae0894f |

其中 EXPIRATION_TIME 设置为比 CREATION_TIME 晚 2 分钟（120 秒）的时间戳。

请注意，此组件不会从状态存储中删除过期的状态。应用程序操作员可以决定运行一个定期的 job，以某种形式的垃圾收集来显式删除所有具有过去 EXPIRATION_TIME 的状态记录。用于收集过期垃圾记录的 SQL 语句：
   ```SQL
    delete dapr_state 
    where  expiration_time < SYS_EXTRACT_UTC(SYSTIMESTAMP);
   ```

## 并发

Oracle 数据库状态存储中的并发通过使用 `ETag` 实现。每个记录在 Oracle 数据库状态存储中的状态都在创建或更新时分配一个唯一的 ETag - 一个存储在 ETag 列中的生成的唯一字符串。注意：每当对现有记录执行 `Set` 操作时，UPDATE_TIME 列也会更新。

只有当此状态存储的 `Set` 和 `Delete` 请求指定 *FirstWrite* 并发策略时，请求才需要提供要写入或删除的状态的实际 ETag 值，以使请求成功。如果指定了不同的或没有并发策略，则不会对 ETag 值进行检查。

## 一致性

Oracle 数据库状态存储支持事务。多个 `Set` 和 `Delete` 命令可以组合在一个请求中，该请求作为单个原子事务处理。

注意：简单的 `Set` 和 `Delete` 操作本身就是一个事务；当 `Set` 或 `Delete` 请求返回 HTTP-20X 结果时，数据库事务已成功提交。

## 查询

Oracle 数据库状态存储当前不支持查询 API。

## 创建 Oracle 数据库和用户模式

{{< tabs "Self-Hosted" "Autonomous Database on OCI">}}

{{% codetab %}}

1. 运行一个 Oracle 数据库实例。您可以使用以下命令在 Docker CE 中运行一个本地 Oracle 数据库实例 - 或者当然使用现有的 Oracle 数据库：
     ```bash
     docker run -d -p 1521:1521 -e ORACLE_PASSWORD=TheSuperSecret1509! gvenzl/oracle-xe
     ```
    此示例未描述生产配置，因为它以明文设置了用户 `SYS` 和 `SYSTEM` 的密码。

     当命令的输出表明容器正在运行时，使用 `docker ps` 命令了解容器 ID。然后使用以下命令启动一个 shell 会话：
     ```bash
     docker exec -it <container id> /bin/bash
     ```
     然后使用 SQL*Plus 客户端连接到数据库，作为 SYS 用户：
     ```bash
     sqlplus sys/TheSuperSecret1509! as sysdba
     ```

2. 为状态数据创建一个数据库模式。创建一个新的用户模式 - 例如称为 *dapr* - 用于存储状态数据。授予此用户（模式）创建表和在关联表空间中存储数据的权限。

    要在 Oracle 数据库中创建一个新的用户模式，运行以下 SQL 命令：

    ```SQL
    create user dapr identified by DaprPassword4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr;
    ```

3. （可选）创建用于存储状态记录的表。
Oracle 数据库状态存储组件会检查连接到的数据库用户模式中是否已经存在用于存储状态的表，如果不存在，它会创建该表。然而，您也可以在运行时之前创建用于存储状态记录的表。这使您 - 或数据库管理员 - 可以更好地控制表的物理配置。这也意味着您不必授予用户模式 *create table* 权限。

    运行以下 DDL 语句以在 *dapr* 数据库用户模式中创建用于存储状态的表：

    ```SQL
    CREATE TABLE dapr_state (
			key varchar2(2000) NOT NULL PRIMARY KEY,
			value clob NOT NULL,
			binary_yn varchar2(1) NOT NULL,
			etag varchar2(50)  NOT NULL,
			creation_time TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL ,
			expiration_time TIMESTAMP WITH TIME ZONE NULL,
			update_time TIMESTAMP WITH TIME ZONE NULL
      )
    ```
{{% /codetab %}}

{{% codetab %}}

1. 在 Oracle 云基础设施上创建一个免费的（或付费的）Autonomous Transaction Processing (ATP) 或 ADW (Autonomous Data Warehouse) 实例，如 [OCI 文档中的始终免费自治数据库](https://docs.oracle.com/en/cloud/paas/autonomous-database/adbsa/autonomous-always-free.html#GUID-03F9F3E8-8A98-4792-AB9C-F0BACF02DC3E) 所述。

    您需要为用户 ADMIN 提供密码。您使用此帐户（至少最初）进行数据库管理活动。您可以在基于 Web 的 SQL Developer 工具中工作，也可以在其桌面版本或众多数据库开发工具中工作。

2. 为状态数据创建一个模式。
在 Oracle 数据库中创建一个新的用户模式以存储状态数据 - 例如使用 ADMIN 帐户。授予此新用户（模式）创建表和在关联表空间中存储数据的权限。

    要在 Oracle 数据库中创建一个新的用户模式，运行以下 SQL 命令：

    ```SQL
    create user dapr identified by DaprPassword4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr;
    ```

3. （可选）创建用于存储状态记录的表。
Oracle 数据库状态存储组件会检查连接到的数据库用户模式中是否已经存在用于存储状态的表，如果不存在，它会创建该表。然而，您也可以在运行时之前创建用于存储状态记录的表。这使您 - 或数据库管理员 - 可以更好地控制表的物理配置。这也意味着您不必授予用户模式 *create table* 权限。

    运行以下 DDL 语句以在 *dapr* 数据库用户模式中创建用于存储状态的表：

    ```SQL
    CREATE TABLE dapr_state (
			key varchar2(2000) NOT NULL PRIMARY KEY,
			value clob NOT NULL,
			binary_yn varchar2(1) NOT NULL,
			etag varchar2(50)  NOT NULL,
			creation_time TIMESTAMP WITH TIME ZONE DEFAULT SYSTIMESTAMP NOT NULL ,
			expiration_time TIMESTAMP WITH TIME ZONE NULL,
			update_time TIMESTAMP WITH TIME ZONE NULL
      )
    ```

{{% /codetab %}}

{{% /tabs %}}

## 相关链接
- [Dapr 组件的基本模式]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
