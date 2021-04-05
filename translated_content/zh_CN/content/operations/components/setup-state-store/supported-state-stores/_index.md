---
type: docs
title: "支持的状态存储"
linkTitle: "支持的状态存储"
description: "Dapr支持的状态存储组件"
weight: 20000
no_list: true
---

表格标题：

> `Status`: [Component certification]({{X39X}}) status
  - [Alpha]({{X28X}})
  - [Beta]({{X30X}})
  - [GA]({{X32X}}) > `Since`: defines from which Dapr Runtime version, the component is in the current status

> `组件版本`：代表组件的版本


Dapr 状态管理组件不同程度地支持以下存储:

> 如果存储引擎同时支持事务性操作和etag，则状态存储可以用于 actors。

### 通用

| 名称                                                 | CRUD | 事务 | ETag | Actors | 状态    | 组件版本 | 自从  |
| -------------------------------------------------- | ---- | -- | ---- | ------ | ----- | ---- | --- |
| [Aerospike]({{< ref setup-aerospike.md >}})        | ✅    | ❌  | ✅    | ❌      | Alpha | v1   | 1.0 |
| [Apache Cassandra]({{< ref setup-cassandra.md >}}) | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |
| [Cloudstate]({{< ref setup-cloudstate.md >}})      | ✅    | ❌  | ✅    | ❌      | Alpha | v1   | 1.0 |
| [Couchbase]({{< ref setup-couchbase.md >}})        | ✅    | ❌  | ✅    | ❌      | Alpha | v1   | 1.0 |
| [Hashicorp Consul]({{< ref setup-consul.md >}})    | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |
| [Hazelcast]({{< ref setup-hazelcast.md >}})        | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |
| [Memcached]({{< ref setup-memcached.md >}})        | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |
| [MongoDB]({{< ref setup-mongodb.md >}})            | ✅    | ✅  | ✅    | ✅      | GA    | v1   | 1.0 |
| [MySQL]({{< ref setup-mysql.md >}})                | ✅    | ✅  | ✅    | ✅      | Alpha | v1   | 1.0 |
| [PostgrSQL]({{< ref setup-postgresql.md >}})       | ✅    | ✅  | ✅    | ✅      | Alpha | v1   | 1.0 |
| [Redis]({{< ref setup-redis.md >}})                | ✅    | ✅  | ✅    | ✅      | GA    | v1   | 1.0 |
| [RethinkDB]({{< ref setup-rethinkdb.md >}})        | ✅    | ✅  | ✅    | ✅      | Alpha | v1   | 1.0 |
| [Zookeeper]({{< ref setup-zookeeper.md >}})        | ✅    | ❌  | ✅    | ❌      | Alpha | v1   | 1.0 |


### Amazon Web Services (AWS)
| 名称                                           | CRUD | 事务 | ETag | Actors | 状态    | 组件版本 | 自从  |
| -------------------------------------------- | ---- | -- | ---- | ------ | ----- | ---- | --- |
| [AWS DynamoDB]({{< ref setup-dynamodb.md>}}) | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |

### Google Cloud Platform (GCP)
| 名称                                              | CRUD | 事务 | ETag | Actors | 状态    | 组件版本 | 自从  |
| ----------------------------------------------- | ---- | -- | ---- | ------ | ----- | ---- | --- |
| [GCP Firestore]({{< ref setup-firestore.md >}}) | ✅    | ❌  | ❌    | ❌      | Alpha | v1   | 1.0 |

### Microsoft Azure

| 名称                                                             | CRUD | 事务 | ETag | Actors | 状态    | 组件版本 | 自从  |
| -------------------------------------------------------------- | ---- | -- | ---- | ------ | ----- | ---- | --- |
| [Azure Blob Storage]({{< ref setup-azure-blobstorage.md >}})   | ✅    | ❌  | ✅    | ❌      | GA    | v1   | 1.0 |
| [Azure CosmosDB]({{< ref setup-azure-cosmosdb.md >}})          | ✅    | ✅  | ✅    | ✅      | GA    | v1   | 1.0 |
| [Azure SQL Server]({{< ref setup-sqlserver.md >}})             | ✅    | ✅  | ✅    | ✅      | Alpha | v1   | 1.0 |
| [Azure Table Storage]({{< ref setup-azure-tablestorage.md >}}) | ✅    | ❌  | ✅    | ❌      | Alpha | v1   | 1.0 |
