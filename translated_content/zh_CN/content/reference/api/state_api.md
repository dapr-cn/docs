---
type: docs
title: "State management API reference"
linkTitle: "状态管理 API"
description: "Detailed documentation on the state management API"
weight: 200
---

## Component file

Dapr `statestore.yaml` 组件文件具有以下结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.<TYPE>
  version: v1
  metadata:
  - name:<KEY>
    value:<VALUE>
  - name: <KEY>
    value: <VALUE>
```

| Setting         | 说明                       |
| --------------- | ------------------------ |
| `metadata.name` | 状态存储的名称。                 |
| `spec/metadata` | 一个开放的键值对元数据，它允许绑定定义连接属性。 |

## Key scheme

Dapr state stores are key/value stores. To ensure data compatibility, Dapr requires these data stores follow a fixed key scheme. For general states, the key format is:

```
<App ID>||<state key>
```

For Actor states, the key format is:

```
<App ID>||<Actor type>||<Actor id>||<state key>
```

## Save state

This endpoint lets you save an array of state objects.

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL 参数

| 参数          | 说明                                                                                            |
| ----------- | --------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                      |
| `storename` | 用户配置的 `statestore.yaml` 组件文件中的 `metadata.name`  字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0/state/myStore?metadata.contentType=application/json
```
> 所有的 URL 参数都是大小写敏感的。

#### Request Body

A JSON array of state objects. Each state object is comprised with the following fields:

| 字段         | 说明                                             |
| ---------- | ---------------------------------------------- |
| `key`      | 状态键                                            |
| `value`    | 状态值，可以是任何字节数组                                  |
| `etag`     | (可选) 状态ETag                                    |
| `metadata` | (可选) 要传递给状态存储的额外键值对                            |
| `options`  | (可选) 状态操作选项, 请参阅 [状态操作选项](#optional-behaviors) |

> **ETag 格式:** Dapr 运行时将ETags视为不透明字符串。 The exact ETag format is defined by the corresponding data store.

#### Metadata

Metadata can be sent via query parameters in the request's URL. 必须以 `metadata.` 为前缀，如下所示。

| 参数                      | 说明                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref state-store-ttl.md >}}) |

> **TTL:** Only certain state stores support the TTL option, according the [supported state stores]({{< ref supported-state-stores.md >}}).

### HTTP Response

#### Response Codes

| 代码    | 说明                                                           |
| ----- | ------------------------------------------------------------ |
| `204` | State saved                                                  |
| `400` | State store is missing or misconfigured or malformed request |
| `500` | Failed to save state                                         |

#### Response Body

None.

### 示例

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars?metadata.contentType=application/json \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "weapon",
          "value": "DeathStar",
          "etag": "1234"
        },
        {
          "key": "planet",
          "value": {
            "name": "Tatooine"
          }
        }
      ]'
```

## Get state

This endpoint lets you get the state for a specific key.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| 参数            | 说明                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------ |
| `daprPort`    | Dapr 端口。                                                                                   |
| `storename`   | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |
| `key`         | 所需状态的键                                                                                     |
| `consistency` | (可选) 读取一致性模式，请参阅 [状态操作选项](#optional-behaviors)                                             |
| `metadata`    | (可选) 作为状态存储的查询参数的元数据                                                                       |

The optional request metadata is passed via URL query parameters. For example,
```
GET http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP Response

#### Response Codes

| 代码    | 说明                                      |
| ----- | --------------------------------------- |
| `200` | Get state successful                    |
| `204` | Key is not found                        |
| `400` | State store is missing or misconfigured |
| `500` | Get state failed                        |

#### Response Headers

| Header | 说明                     |
| ------ | ---------------------- |
| `ETag` | ETag of returned value |

#### Response Body

JSON-encoded value

### 示例

```shell
curl http://localhost:3500/v1.0/state/starwars/planet?metadata.contentType=application/json
```

> 以上命令将返回状态:

```json
{
  "name": "Tatooine"
}
```

将元数据作为查询参数传递：

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey&metadata.contentType=application/json
```

## Get bulk state

This endpoint lets you get a list of values for a given list of keys.

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL 参数

| 参数          | 说明                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------ |
| `daprPort`  | Dapr 端口。                                                                                   |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |
| `metadata`  | (可选) 作为状态存储的查询参数的元数据                                                                       |

The optional request metadata is passed via URL query parameters. For example,
```
POST/PUT http://localhost:3500/v1.0/state/myStore/bulk?metadata.partitionKey=mypartitionKey
```

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP Response

#### Response Codes

| 代码    | 说明                                      |
| ----- | --------------------------------------- |
| `200` | Get state successful                    |
| `400` | State store is missing or misconfigured |
| `500` | Get bulk state failed                   |

#### Response Body

An array of JSON-encoded values

### 示例

```shell
curl http://localhost:3500/v1.0/state/myRedisStore/bulk \
  -H "Content-Type: application/json" \
  -d '{
          "keys": [ "key1", "key2" ],
          "parallelism": 10
      }'
```

> The above command returns an array of key/value objects:

```json
[
  {
    "key": "key1",
    "data": "value1",
    "etag": "1"
  },
  {
    "key": "key2",
    "data": "value2",
    "etag": "1"
  }
]
```

将元数据作为查询参数传递：

```
POST http://localhost:3500/v1.0/state/myRedisStore/bulk?metadata.partitionKey=mypartitionKey
```

## Delete state

This endpoint lets you delete the state for a specific key.

### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| 参数            | 说明                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------ |
| `daprPort`    | Dapr 端口。                                                                                   |
| `storename`   | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |
| `key`         | 所需状态的键                                                                                     |
| `concurrency` | (可选) *first-write* 或者 *last-write*；请参阅 [状态操作选项](#optional-behaviors)                       |
| `consistency` | (可选) *strong* 或者 *eventual*；请参阅 [状态操作选项](#optional-behaviors)                              |

The optional request metadata is passed via URL query parameters. For example,
```
DELETE http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Headers

| Header   | 说明                                                    |
| -------- | ----------------------------------------------------- |
| If-Match | (Optional) ETag associated with the key to be deleted |

### HTTP Response

#### Response Codes

| 代码    | 说明                                      |
| ----- | --------------------------------------- |
| `204` | Delete state successful                 |
| `400` | State store is missing or misconfigured |
| `500` | Delete state failed                     |

#### Response Body

None.

### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
```

## 查询状态

此终结点允许您查询键/值状态。

{{% alert title="alpha" color="warning" %}}
此 API 处于 Alpha 阶段。
{{% /alert %}}

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0-alpha1/state/<storename>/query
```

#### URL 参数

| 参数          | 说明                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------ |
| `daprPort`  | Dapr 端口。                                                                                   |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |
| `metadata`  | (可选) 作为状态存储的查询参数的元数据                                                                       |

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### Response Codes

| 代码    | 说明                                      |
| ----- | --------------------------------------- |
| `200` | 状态查询成功                                  |
| `400` | State store is missing or misconfigured |
| `500` | 状态查询失败                                  |

#### Response Body

An array of JSON-encoded values

### 示例

```shell
curl -X POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json \
  -H "Content-Type: application/json" \
  -d '{
        "filter": {
          "OR": [
            {
              "EQ": { "person.org": "Dev Ops" }
            },
            {
              "AND": [
                {
                  "EQ": { "person.org": "Finance" }
                },
                {
                  "IN": { "state": [ "CA", "WA" ] }
                }
              ]
            }
          ]
        },
        "sort": [
          {
            "key": "state",
            "order": "DESC"
          },
          {
            "key": "person.id"
          }
        ],
        "page": {
          "limit": 3
        }
      }'
```

> 上述命令返回一个对象数组以及令牌：

```json
{
  "results": [
    {
      "key": "1",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1036
        },
        "city": "Seattle",
        "state": "WA"
      },
      "etag": "6f54ad94-dfb9-46f0-a371-e42d550adb7d"
    },
    {
      "key": "4",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1042
        },
        "city": "Spokane",
        "state": "WA"
      },
      "etag": "7415707b-82ce-44d0-bf15-6dc6305af3b1"
    },
    {
      "key": "10",
      "data": {
        "person": {
          "org": "Dev Ops",
          "id": 1054
        },
        "city": "New York",
        "state": "NY"
      },
      "etag": "26bbba88-9461-48d1-8a35-db07c374e5aa"
    }
  ],
  "token": "3"
}
```

将元数据作为查询参数传递：

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## State transactions

Persists the changes to the state store as a [transactional operation]({{< ref "state-management-overview.md#transactional-operations" >}}).

> This API depends on a state store component that supports transactions.

有关支持事务的状态存储的完整当前列表，请参阅 [状态存储组件规范]({{< ref "supported-state-stores.md" >}})。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP 响应码

| 代码    | 说明                                                           |
| ----- | ------------------------------------------------------------ |
| `204` | 请求成功                                                         |
| `400` | State store is missing or misconfigured or malformed request |
| `500` | 请求失败                                                         |

#### URL 参数

| 参数          | 说明                                                                                         |
| ----------- | ------------------------------------------------------------------------------------------ |
| `daprPort`  | Dapr 端口。                                                                                   |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr状态存储配置结构](#component-file) 。 |

The optional request metadata is passed via URL query parameters. For example,
```
POST http://localhost:3500/v1.0/state/myStore/transaction?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Body

| 字段           | 说明                                                                           |
| ------------ | ---------------------------------------------------------------------------- |
| `operations` | A JSON array of state `operation`                                            |
| `metadata`   | (optional) The `metadata` for the transaction that applies to all operations |

All transactional databases implement the following required operations:

| Operation | 说明                        |
| --------- | ------------------------- |
| `upsert`  | Adds or updates the value |
| `delete`  | Deletes the value         |

Each operation has an associated `request` that is comprised of the following fields:

| 请求         | 说明                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `key`      | 状态键                                                                                                 |
| `value`    | 状态值，可以是任何字节数组                                                                                       |
| `etag`     | (可选) 状态ETag                                                                                         |
| `metadata` | (optional) Additional key-value pairs to be passed to the state store that apply for this operation |
| `options`  | (可选) 状态操作选项, 请参阅 [状态操作选项](#optional-behaviors)                                                      |

#### 示例
The example below shows an `upsert` operation for `key1` and a `delete` operation for `key2`. This is applied to the partition named 'planet' in the state store. Both operations either succeed or fail in the transaction.

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars/transaction \
  -H "Content-Type: application/json" \
  -d '{
        "operations": [
          {
            "operation": "upsert",
            "request": {
              "key": "key1",
              "value": "myData"
            }
          },
          {
            "operation": "delete",
            "request": {
              "key": "key2"
            }
          }
        ],
        "metadata": {
          "partitionKey": "planet"
        }
      }'
```

## Configuring state store for actors

Actors don't support multiple state stores and require a transactional state store to be used with Dapr. [查看当前哪些服务实现了事务状态存储接口]({{< ref "supported-state-stores.md" >}})．

通过在组件文件 `statestore.yaml`的元数据部分，将属性`actorStateStore`的值设置为`true`，来指定该state store可以被actors所使用。 例如，以下组件文件将会被用来配置被Actors state store所使用的Redis。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: <redis host>
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"

```

## Optional behaviors

### Key scheme

A Dapr-compatible state store shall use the following key scheme:

* *\<App ID>||\<state key>* key format for general states
* *\<App ID>||\<Actor type>||\<Actor id>||\<state key>* key format for Actor states.

### 并发（Concurrency）

Dapr使用Etags优化并发控制(OCC)。 Dapr 将以下state store配置项设置为可选项：

* Dapr-compatible 状态存储可以使用ETags来支持乐观并发控制。 该状态存储允许在ETag发生如下变化时去更新：
  * 与 *保存* 或 *删除* 请求相关联。
  * 与数据库中最新版本的ETag相匹配。
* 当在写入请求的数据中缺少ETag时，状态存储将会使用*last-write-wins* 机制来处理这次请求。 在数据具有很低的偶然性或者几乎没有负面影响的高吞吐写入场景，这将产生明显的优化效果。
* 当返回状态数据给调用者时，状态存储将*总是*会附带返回ETags。

### Consistency

Dapr允许客户端在*get*, *set* 和 *delete* 操作上附加一致性标识。 Dapr支持两种一致性级别： **强一致性** 和 **最终一致性**。

#### 最终一致性

Dapr默认数据存储都是最终一致性的。 一个状态应该：

* 对于*读* 请求，从任何一个副本中返回数据。
* 对于 *写* 请求，在更新请求确认后，异步复制更新到已配置的仲裁副本中。

#### 强一致性

当附加强一致性标识时，一个状态存储应该：

* 对于 *读* 请求，返回集群中大多数副本最新且状态值一致的数据。
* 对于 *写*/*删除* 请求，在写请求完成之前，异步复制更新数据到配置的仲裁副本中。

### 示例：完成的请求选项示例

如下是一个带有完整 `选项` 定义的 *set* 请求实例:

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars \
  -H "Content-Type: application/json" \
  -d '[
        {
          "key": "weapon",
          "value": "DeathStar",
          "etag": "xxxxx",
          "options": {
            "concurrency": "first-write",
            "consistency": "strong"
          }
        }
      ]'
```

### 示例：ETag的使用

如下是在一个状态存储中去 *设置*/*删除* 一个对象时，演示使用ETag用法的示例。 这个示例使用Redis来定义 `statestore`。

1. 在一个状态存储中存储一个对象：

   ```shell
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
               {
                   "key": "sampleData",
                   "value": "1"
               }
       ]'
   ```

1. 读取该对象，去验证状态存储自动设置的Etag：

   ```shell
   curl http://localhost:3500/v1.0/state/statestore/sampleData -v
   * Connected to localhost (127.0.0.1) port 3500 (#0)
   > GET /v1.0/state/statestore/sampleData HTTP/1.1
   > Host: localhost:3500
   > User-Agent: curl/7.64.1
   > Accept: */*
   >
   < HTTP/1.1 200 OK
   < Server: fasthttp
   < Date: Sun, 14 Feb 2021 04:51:50 GMT
   < Content-Type: application/json
   < Content-Length: 3
   < Etag: 1
   < Traceparent: 00-3452582897d134dc9793a244025256b1-b58d8d773e4d661d-01
   <
   * Connection #0 to host localhost left intact
   "1"* Closing connection 0
   ```

   上述请求返回的ETag值为1。 如果你使用一个错误的ETag发送新请求去更新或者删除这个数据，它将会返回一个错误： 省略 ETag 将允许请求。

   ```shell
   # Update
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
               {
                   "key": "sampleData",
                   "value": "2",
                   "etag": "2"
               }
       ]'
   {"errorCode":"ERR_STATE_SAVE","message":"failed saving state in state store statestore: possible etag mismatch. error from state store: ERR Error running script (call to f_83e03ec05d6a3b6fb48483accf5e594597b6058f): @user_script:1: user_script:1: failed to set key nodeapp||sampleData"}

   # Delete
   curl -X DELETE -H 'If-Match: 5' http://localhost:3500/v1.0/state/statestore/sampleData
   {"errorCode":"ERR_STATE_DELETE","message":"failed deleting state with key sampleData: possible etag mismatch. error from state store: ERR Error running script (call to f_9b5da7354cb61e2ca9faff50f6c43b81c73c0b94): @user_script:1: user_script:1: failed to delete node
   app||sampleData"}
   ```

1. 通过简单的匹配请求正文(更新操作) 或者请求头(删除操作) `If-Match` 中传递的ETag值来更新或者删除该对象。 当该状态被更新时，该请求会接收到一个新的Etag以便后续的更新或者删除操作使用。

   ```shell
   # Update
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
           {
               "key": "sampleData",
               "value": "2",
               "etag": "1"
           }
       ]'

   # Delete
   curl -X DELETE -H 'If-Match: 1' http://localhost:3500/v1.0/state/statestore/sampleData
   ```

## 下一步

- [状态管理概览]({{< ref state-management-overview.md >}})
- [指南：如何保存和获取状态]({{< ref howto-get-save-state.md >}})
