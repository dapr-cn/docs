---
type: docs
title: "Oracle Database"
linkTitle: "Oracle Database"
description: Oracle Database 状态存储组件的详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-oracledatabase/"
---

## 配置

创建一个组件属性 yaml 文件，例如称为 `oracle.yaml` （但它可以命名为任何内容），粘贴以下内容并将 `<CONNECTION STRING>` 值替换为连接字符串。 连接字符串是标准的 Oracle 数据库连接字符串，由以下形式组成： `“oracle://user/password@host:port/servicename”` 例如 `“oracle://demo:demo@localhost:1521/xe”`。

如果您使用Oracle钱包连接到数据库，则应为 `oracleWalletLocation` 属性指定一个值，例如： `“/home/app/state/Wallet_daprDB/”`;这应该是指包含从 Oracle 钱包存档文件中提取的文件 `cwallet.sso` 的本地文件系统目录。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.oracledatabase
  version: v1
  metadata:
  - name: connectionString
    value: "<CONNECTION STRING>"
  - name: oracleWalletLocation
    value: "<FULL PATH TO DIRECTORY WITH ORACLE WALLET CONTENTS >"  # Optional, no default
  - name: tableName
    value: "<NAME OF DATABASE TABLE TO STORE STATE IN >" # Optional, defaults to STATE
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                   | 必填 | 详情                                  | 示例                                                                                                                                                                                                                                                        |
| -------------------- |:--:| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| connectionString     | 是  | Oracle 数据库的连接字符串                    | `"oracle://user/password@host:port/servicename"` for example `"oracle://demo:demo@localhost:1521/xe"` or for Autonomous Database `"oracle://states_schema:State12345pw@adb.us-ashburn-1.oraclecloud.com:1522/k8j2agsqjsw_daprdb_low.adb.oraclecloud.com"` |
| oracleWalletLocation | 否  | Oracle 钱包文件内容的位置（连接到 OCI 上的自治数据库需要） | `"/home/app/state/Wallet_daprDB/"`                                                                                                                                                                                                                        |
| tableName            | 否  | 此状态存储实例记录默认数据数据库表的名称 `“STATE”`      | `"MY_APP_STATE_STORE"`                                                                                                                                                                                                                                    |

## 运行时会发生什么？
当状态存储组件初始化时，连接到Oracle数据库并检查`tableName`指定的表是否存在。 如果不存在，就创建这个表（使用Key, Value, Binary_YN, ETag, Creation_Time, Update_Time, Expiration_time列）。

每个状态条目都由数据表中的一条记录表示。 在请求中提供属性`key`用来决定在KEY列中存储的对象的名称。 `value` 作为对象内容存储。 二进制内容存储为Base64编码文本。 每当创建或更新时，每个对象都会为分配一个唯一的 ETag 值。

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

在 STATE表 中创建以下记录：

| KEY     | VALUE | CREATION_TIME       | BINARY_YN | ETAG                                 |
| ------- | ----- | ------------------- | --------- | ------------------------------------ |
| nihilus | darth | 2022-02-14T22:11:00 | 否         | 79dfb504-5b27-43f6-950f-d55d5ae0894f |


Dapr使用固定键模式使用*composite keys* 去区分跨应用程序状态。 对于常规状态，关键格式为： `App-ID||state key`。 Oracle 数据库状态存储将此密钥完整映射到 KEY 列。

您可以轻松地根据 ` tableName ` 表（例如 STATE 表）使用 SQL 查询存储的所有状态。


## 生存时间和状态过期
Oracle 数据库状态存储组件支持 Dapr 的生存时间逻辑，该逻辑可确保状态过期后无法检索。 有关详细信息，请参阅 [如何设置状态生存时间]({{< ref "state-store-ttl.md" >}})。

Oracle 数据库没有对设置生存时间的原生支持。 此组件中的实现是使用名为 `EXPIRATION_TIME` 的列来保存一个时间，超过该时间后记录被视为 * 过期 *。 该列的值只有在`Set` 请求指定了TTL时设置。 它以当前UTC时间戳来计算，并添加了TTL周期。 当通过调用</code>Get`检索状态时，此组件会检查它是否设置了 <code>EXPIRATION_TIME` ，如果是，则检查它是否是过期的。 在这种情况下，不会返回任何状态。

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

| KEY       | VALUE     | CREATION_TIME       | EXPIRATION_TIME     | BINARY_YN | ETAG                                 |
| --------- | --------- | ------------------- | ------------------- | --------- | ------------------------------------ |
| temporary | ephemeral | 2022-03-31T22:11:00 | 2022-03-31T22:13:00 | 否         | 79dfb504-5b27-43f6-950f-d55d5ae0894f |

将EXPIRATION_TIME设置为一个时间戳 2 分钟（120 秒）（晚于CREATION_TIME）

请注意，此组件不会从状态存储中删除过期状态。 应用程序operator可能决定运行执行某种形式的垃圾回收的定时任务，以便显式删除所有具有EXPIRATION_TIME并且已经过期的状态记录。 用于收集过期垃圾记录的 SQL 语句：
   ```SQL
    delete dapr_state 
    where  expiration_time < SYS_EXTRACT_UTC(SYSTIMESTAMP);
   ```

## 并发（Concurrency）

Oracle 数据库状态存储中的并发是通过使用 `ETag`实现的。 在创建或更新 Oracle 数据库状态存储中记录的每个状态片段时，都会为其分配一个唯一的 ETag（存储在列 ETag 中的生成的唯一字符串）。 注： 每当对现有记录执行 `Set` 操作时，也会更新UPDATE_TIME列。

仅当对该状态存储的 `Set` 和 `Delete` 请求指定 *FirstWrite* 并发策略时，请求需要提供实际的 ETag 值，以便请求成功写入或删除状态。 如果指定了不同的并发策略或未指定并发策略，则不会对 ETag 值执行检查。

## 一致性

Oracle 数据库状态存储支持事务。 多个 `Set` 和 `Delete`命令可以合并到一个单个原子事务处理的请求中。

注意：简单的 `Set` 和 `Delete` 操作本身就是一个事务; 当 `Set` 或 `Delete` 请求返回 HTTP-20X 结果时，数据库事务已成功提交。

## 查询

Oracle 数据库状态存储当前不支持查询 API。



## 创建 Oracle 数据库和用户架构

{{< tabs "Self-Hosted" "Autonomous Database on OCI">}}

{{% codetab %}}

1. 运行 Oracle 数据库的实例。 您可以使用以下命令在Docker CE中运行Oracle数据库的本地实例 - 或者当然可以使用现有的Oracle数据库：
     ```bash
     docker run -d -p 1521:1521 -e ORACLE_PASSWORD=TheSuperSecret1509! gvenzl/oracle-xe
     ```
    此示例不描述生产配置，因为它为 用户`SYS` 和`SYSTEM` 以纯文本格式设置密码。

     当 conmmand 的输出指示容器正在运行时，请使用 `docker ps` 命令查询容器 Id。 然后使用以下命令启动 shell 会话：
     ```bash
     docker exec -it <container id> /bin/bash
     ```
     并随后运行 SQL*Plus 客户端，以 SYS 用户身份连接到数据库：
     ```bash
     sqlplus sys/TheSuperSecret1509! as sysdba
     ```

2. 为状态数据创建数据库架构。 创建一个新的用户架构（例如，称为 *dapr* ）来存储状态数据。 授予此用户（schema）创建表和在关联的表空间中存储数据的特权。

    若要在 Oracle 数据库中创建新的用户架构，请运行以下 SQL 命令：

    ```SQL
    create user dapr identified by DaprPassword4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr;
    ```

3. （可选）创建用于存储状态记录的表。 Oracle 数据库状态存储组件检查用于存储状态的表是否已存在于它连接到的数据库用户架构中，如果没有，它将创建该表。 但是，您也可以提前创建表，而不是让 Oracle 数据库状态存储组件在运行时创建用于存储状态记录的表。 这使您（或数据库的 DBA）能够更好地控制表的物理配置。 这也意味着您不必给用户架构授予 *create table* 权限。

    运行以下 DDL 语句以创建用于在 *dapr* 数据库用户架构中存储状态的表：

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

1. 在 Oracle 云基础设施上创建免费（或付费）自治事务处理 （ATP） 或 ADW（自治数据仓库）实例，如 [OCI 文档适用于始终免费的自治数据库](https://docs.oracle.com/en/cloud/paas/autonomous-database/adbsa/autonomous-always-free.html#GUID-03F9F3E8-8A98-4792-AB9C-F0BACF02DC3E)文档中所述。

    您需要为用户 ADMIN 提供密码。 您使用将此账户用于数据库管理活动（至少在开始时）。 您可以在基于Web的SQL Developer工具中，从其桌面对应工具或从大量数据库开发工具中的任何一个中工作。

2. 为状态数据创建架构。 在 Oracle 数据库中创建新的用户架构以存储状态数据 - 例如，使用 ADMIN 账户。 授予此新用户（schema）创建表和在关联的表空间中存储数据的特权。

    若要在 Oracle 数据库中创建新的用户架构，请运行以下 SQL 命令：

    ```SQL
    create user dapr identified by DaprPassword4239 default tablespace users quota unlimited on users;
    grant create session, create table to dapr;
    ```

3. （可选）创建用于存储状态记录的表。 Oracle 数据库状态存储组件检查用于存储状态的表是否已存在于它连接到的数据库用户架构中，如果没有，它将创建该表。 但是，您也可以提前创建表，而不是让 Oracle 数据库状态存储组件在运行时创建用于存储状态记录的表。 这使您（或数据库的 DBA）能够更好地控制表的物理配置。 这也意味着您不必给用户架构授予 *create table* 权限。

    运行以下 DDL 语句以创建用于在 *dapr* 数据库用户架构中存储状态的表：

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
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
