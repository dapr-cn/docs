---
type: docs
title: "状态管理 API 参考文档"
linkTitle: "状态管理 API"
description: "有关状态管理 API 的详细文档"
weight: 200
---

## Component file

A Dapr `statestore.yaml` component file has the following structure:

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

| Setting         | 说明                                                                                     |
| --------------- | -------------------------------------------------------------------------------------- |
| `metadata.name` | The name of the state store.                                                           |
| `spec/metadata` | An open key value pair metadata that allows a binding to define connection properties. |

## 键方案

Dapr 状态存储是键/值存储。 为了确保数据兼容性，Dapr 要求这些数据存储遵循固定的键方案。 对于常规状态，键格式为：

```
<App ID>||<state key>
```

对于 Actor 状态，键格式为：

```
<App ID>||<Actor type>||<Actor id>||<state key>
```

## 保存状态

此端点允许您保存状态对象数组。

### HTTP Request

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL 参数

| Parameter   | 说明                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `daprPort`  | The Dapr port                                                                                  |
| `storename` | 用户配置的 `statestore.yaml` 组件文件中的 `metadata.name`  字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
POST http://localhost:3500/v1.0/state/myStore?metadata.contentType=application/json
```
> All URL parameters are case-sensitive.

#### 请求正文

A JSON array of state objects. Each state object is comprised with the following fields:

| Field      | 说明                                             |
| ---------- | ---------------------------------------------- |
| `key`      | State key                                      |
| `value`    | 状态值，可以是任何字节数组                                  |
| `etag`     | (可选) 状态 ETag                                   |
| `metadata` | (可选) 要传递给状态存储的额外键值对                            |
| `options`  | (可选) 状态操作选项, 请参阅 [状态操作选项](#optional-behaviors) |

> **ETag 格式:** Dapr 运行时将ETags视为不透明字符串。 确切的 ETag 格式由相应的数据存储定义。

#### Metadata

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.`, as shown below.

| Parameter               | 说明                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref state-store-ttl.md >}}) |

> **TTL:** 只有某些状态存储支持 TTL 选项，根据 [支持的状态存储]({{< ref supported-state-stores.md >}})。

### HTTP 响应

#### 响应码

| Code  | 说明                                                           |
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

## 获取状态

This endpoint lets you get the state for a specific key.

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| Parameter     | 说明                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `daprPort`    | The Dapr port                                                                                                           |
| `storename`   | `metadata.name` field in the user-configured statestore.yaml component file. 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `key`         | The key of the desired state                                                                                            |
| `consistency` | (optional) Read consistency mode; see [state operation options](#optional-behaviors)                                    |
| `metadata`    | (optional) Metadata as query parameters to the state store                                                              |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
GET http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应码

| Code  | 说明                                      |
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

> The above command returns the state:

```json
{
  "name": "Tatooine"
}
```

To pass metadata as query parameter:

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey&metadata.contentType=application/json
```

## 获取批量状态

This endpoint lets you get a list of values for a given list of keys.

### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL 参数

| Parameter   | 说明                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | The Dapr port                                                                                                           |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `metadata`  | (optional) Metadata as query parameters to the state store                                                              |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
POST/PUT http://localhost:3500/v1.0/state/myStore/bulk?metadata.partitionKey=mypartitionKey
```

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应码

| Code  | 说明                                      |
| ----- | --------------------------------------- |
| `200` | Get state successful                    |
| `400` | State store is missing or misconfigured |
| `500` | Get bulk state failed                   |

#### Response Body

JSON 编码值的数组

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
    "value": "value1",
    "etag": "1"
  },
  {
    "key": "key2",
    "value": "value2",
    "etag": "1"
  }
]
```

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0/state/myRedisStore/bulk?metadata.partitionKey=mypartitionKey
```

## 删除状态

此终结点允许你删除特定键的状态。

### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| Parameter     | 说明                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `daprPort`    | The Dapr port                                                                                                           |
| `storename`   | `metadata.name` field in the user-configured statestore.yaml component file. 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `key`         | The key of the desired state                                                                                            |
| `concurrency` | (optional) Either *first-write* or *last-write*; see [state operation options](#optional-behaviors)                     |
| `consistency` | (optional) Either *strong* or *eventual*; see [state operation options](#optional-behaviors)                            |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
DELETE http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Headers

| Header   | 说明                                                    |
| -------- | ----------------------------------------------------- |
| If-Match | (Optional) ETag associated with the key to be deleted |

### HTTP 响应

#### 响应码

| Code  | 说明                      |
| ----- | ----------------------- |
| `204` | Delete state successful |
| `400` | 状态存储丢失或配置错误             |
| `500` | Delete state failed     |

#### Response Body

None.

### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
```

## 查询状态

This endpoint lets you query the key/value state.

{{% alert title="alpha" color="warning" %}}
This API is in alpha stage.
{{% /alert %}}

### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0-alpha1/state/<storename>/query
```

#### URL 参数

| Parameter   | 说明                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | The Dapr port                                                                                                           |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `metadata`  | (optional) Metadata as query parameters to the state store                                                              |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### 响应码

| Code  | 说明                                      |
| ----- | --------------------------------------- |
| `200` | State query successful                  |
| `400` | State store is missing or misconfigured |
| `500` | State query failed                      |

#### Response Body

JSON 编码值的数组

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

> The above command returns an array of objects along with a token:

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

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## 状态事务

将状态存储的更改持久化为 [事务操作]({{< ref "state-management-overview.md#transactional-operations" >}})。

> 此 API 依赖于支持事务的状态存储组件。

Refer to the [state store component spec]({{< ref "supported-state-stores.md" >}}) for a full, current list of state stores that support transactions.

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP Response Codes

| Code  | 说明                                                           |
| ----- | ------------------------------------------------------------ |
| `204` | Request successful                                           |
| `400` | State store is missing or misconfigured or malformed request |
| `500` | Request failed                                               |

#### URL 参数

| Parameter   | 说明                                                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | The Dapr port                                                                                                           |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |

通过 URL 查询参数传递可选的请求元数据。 For example,
```
POST http://localhost:3500/v1.0/state/myStore/transaction?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### 请求正文

| Field        | 说明                        |
| ------------ | ------------------------- |
| `operations` | 状态 `operation`的 JSON 数组   |
| `metadata`   | (可选) 适用于所有操作的事务`metadata` |

所有事务数据库都实现以下必需的操作：

| 操作       | 说明     |
| -------- | ------ |
| `upsert` | 添加或更新值 |
| `delete` | 删除此值   |

每个操作都有一个关联的 `request` ，它由以下字段组成：

| Request    | 说明                                             |
| ---------- | ---------------------------------------------- |
| `key`      | State key                                      |
| `value`    | 状态值，可以是任何字节数组                                  |
| `etag`     | (可选) 状态 ETag                                   |
| `metadata` | （可选）要传递给应用此操作的状态存储的附加键值对                       |
| `options`  | (可选) 状态操作选项, 请参阅 [状态操作选项](#optional-behaviors) |

#### 示例
下面的示例显示了 `key1` 的 `upsert` 操作和 `key2`的 `delete` 操作。 这适用于状态存储中名为“planet”的分区。 两个操作在事务中要么成功要么失败。

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

## 为 Actor 配置状态存储

Actors don't support multiple state stores and require a transactional state store to be used with Dapr. [View which services currently implement the transactional state store interface]({{< ref "supported-state-stores.md" >}}).

Specify which state store to be used for actors with a `true` value for the property `actorStateStore` in the metadata section of the `statestore.yaml` component file. For example, the following components yaml will configure Redis to be used as the state store for Actors.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
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

## 可选行为

### 键方案

A Dapr-compatible state store shall use the following key scheme:

* *\<App ID>||\<state key>* key format for general states
* *\<App ID>||\<Actor type>||\<Actor id>||\<state key>* key format for Actor states.

### 并发

Dapr uses Optimized Concurrency Control (OCC) with ETags. Dapr makes the following requirements optional on state stores:

* A Dapr-compatible state store may support optimistic concurrency control using ETags. The store allows the update when an ETag:
  * Is associated with an *save* or *delete* request.
  * Matches the latest ETag in the database.
* 当在写入请求的数据中缺少ETag时，状态存储将会使用 *last-write-wins* 机制来处理这次请求。 在数据具有很低的偶然性或者几乎没有负面影响的高吞吐写入场景，这将产生明显的优化效果。
* 当返回状态数据给调用者时，状态存储将*总是*会附带返回 ETags。

### 一致性

Dapr allows clients to attach a consistency hint to *get*, *set*, and *delete* operation. Dapr supports two consistency levels: **strong** and **eventual**.

#### Eventual Consistency

Dapr assumes data stores are eventually consistent by default. A state should:

* For *read* requests, return data from any of the replicas.
* 对于 *写* 请求，在更新请求确认后，异步复制更新到已配置的仲裁副本中。

#### Strong Consistency

When a strong consistency hint is attached, a state store should:

* For *read* requests, return the most up-to-date data consistently across replicas.
* 对于 *写*/*删除* 请求，在写请求完成之前，异步复制更新数据到配置的仲裁副本中。

### 示例：完成的请求选项示例

The following is an example *set* request with a complete `options` definition:

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

### 示例：ETag 的使用

The following is an example walk-through of an ETag usage when *setting*/*deleting* an object in a compatible state store. This sample defines Redis as `statestore`.

1. Store an object in a state store:

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

1. Get the object to find the ETag set automatically by the state store:

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

   上述请求返回的 ETag 值为1。 如果你使用一个错误的 ETag 发送新请求去更新或者删除这个数据，它将会返回一个错误： 省略 ETag 将允许请求。

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

1. 通过简单的匹配请求正文(更新操作) 或者请求头(删除操作) `If-Match` 中传递的ETag值来更新或者删除该对象。 当该状态被更新时，该请求会接收到一个新的 Etag 以便后续的更新或者删除操作使用。

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

## Next Steps

- [State management overview]({{< ref state-management-overview.md >}})
- [操作方法：如何保存和获取状态]({{< ref howto-get-save-state.md >}})
