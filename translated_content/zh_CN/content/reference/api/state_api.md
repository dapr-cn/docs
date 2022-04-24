---
type: docs
title: "状态管理 API 参考"
linkTitle: "状态管理 API"
description: "有关状态管理 API 的详细文档"
weight: 200
---

## 组件文件

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

| 设置              | 说明                                                                                     |
| --------------- | -------------------------------------------------------------------------------------- |
| `metadata.name` | The name of the state store.                                                           |
| `spec/metadata` | An open key value pair metadata that allows a binding to define connection properties. |

## 关键方案

Dapr 状态存储是键/值存储。 为了确保数据兼容性，Dapr 要求这些数据存储遵循固定的键方案。 对于常规状态，键格式为：

```
<App ID>||<state key>
```

对于 Actor 状态，键格式为：

```
<App ID>||<Actor type>||<Actor id>||<state key>
```

## 保存状态

此终结点允许您保存状态对象数组。

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL 参数

| 参数          | 说明                                                                                                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                                                                                                     |
| `storename` | The `metadata.name` field in the user-configured `statestore.yaml` component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |

> All URL parameters are case-sensitive.

#### 请求正文

状态对象的 JSON 数组。 每个状态对象都包含以下字段：

| 字段         | 说明                                                                                     |
| ---------- | -------------------------------------------------------------------------------------- |
| `key`      | State key                                                                              |
| `value`    | State value, which can be any byte array                                               |
| `etag`     | (optional) State ETag                                                                  |
| `metadata` | (optional) Additional key-value pairs to be passed to the state store                  |
| `options`  | (optional) State operation options; see [state operation options](#optional-behaviors) |

> **ETag format:** Dapr runtime treats ETags as opaque strings. 确切的 ETag 格式由相应的数据存储定义。

### HTTP 响应

#### 响应代码

| 代码    | 说明                  |
| ----- | ------------------- |
| `204` | 状态已保存               |
| `400` | 状态存储丢失、配置错误或请求格式不正确 |
| `500` | 无法保存状态              |

#### 响应正文

None.

### 示例

```shell
curl -X POST http://localhost:3500/v1.0/state/starwars \
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

此终结点允许你获取特定键的状态。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| 参数            | 说明                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`    | Dapr 端口。                                                                                                                                                               |
| `storename`   | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |
| `key`         | The key of the desired state                                                                                                                                           |
| `consistency` | (optional) Read consistency mode; see [state operation options](#optional-behaviors)                                                                                   |
| `metadata`    | (optional) Metadata as query parameters to the state store                                                                                                             |

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应代码

| 代码    | 说明          |
| ----- | ----------- |
| `200` | 获得状态成功      |
| `204` | 找不到键        |
| `400` | 状态存储丢失或配置错误 |
| `500` | 获取状态失败      |

#### 响应标头

| Header | 说明       |
| ------ | -------- |
| `ETag` | 返回值的ETag |

#### 响应正文

JSON 编码的值

### 示例

```shell
curl http://localhost:3500/v1.0/state/starwars/planet \
  -H "Content-Type: application/json"
```

> 以上命令将返回状态:

```json
{
  "name": "Tatooine"
}
```

To pass metadata as query parameter:

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey
```

## 获取批量状态

使用此终结点，可以获取给定键列表的值列表。

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL 参数

| 参数          | 说明                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                                                                                               |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |
| `metadata`  | (optional) Metadata as query parameters to the state store                                                                                                             |

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应代码

| 代码    | 说明          |
| ----- | ----------- |
| `200` | 获得状态成功      |
| `400` | 状态存储丢失或配置错误 |
| `500` | 获取批量状态失败    |

#### 响应正文

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

> 上面的命令返回一个键/值对象数组：

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

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0/state/myRedisStore/bulk?metadata.partitionKey=mypartitionKey
```

## 删除状态

此终结点允许你删除特定键的状态。

### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| 参数                | 说明                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`        | Dapr 端口。                                                                                                                                                               |
| `storename`       | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |
| `key`             | The key of the desired state                                                                                                                                           |
| `并发（Concurrency）` | (optional) Either *first-write* or *last-write*; see [state operation options](#optional-behaviors)                                                                    |
| `consistency`     | (optional) Either *strong* or *eventual*; see [state operation options](#optional-behaviors)                                                                           |

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Headers

| Header | 说明                  |
| ------ | ------------------- |
| 如果匹配   | (可选) ETag与要删除的键相关联。 |

### HTTP 响应

#### 响应代码

| 代码    | 说明          |
| ----- | ----------- |
| `204` | 删除状态成功      |
| `400` | 状态存储丢失或配置错误 |
| `500` | 删除状态失败      |

#### 响应正文

None.

### 示例

```shell
curl -X "DELETE" http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
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

| 参数          | 说明                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                                                                                               |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |
| `metadata`  | (optional) Metadata as query parameters to the state store                                                                                                             |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 响应代码

| 代码    | 说明          |
| ----- | ----------- |
| `200` | 状态查询成功      |
| `400` | 状态存储丢失或配置错误 |
| `500` | 状态查询失败      |

#### 响应正文

JSON 编码值的数组

### 示例

```shell
curl http://localhost:3500/v1.0-alpha1/state/myStore/query \
  -H "Content-Type: application/json" \
  -d '{
        "filter": {
          "OR": [
            {
              "EQ": { "value.person.org": "Dev Ops" }
            },
            {
              "AND": [
                {
                  "EQ": { "value.person.org": "Finance" }
                },
                {
                  "IN": { "value.state": [ "CA", "WA" ] }
                }
              ]
            }
          ]
        },
        "sort": [
          {
            "key": "value.state",
            "order": "DESC"
          },
          {
            "key": "value.person.id"
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

To pass metadata as query parameter:

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## 状态事务

将状态存储变成以 multi-item transaction 的方式持久化

> This operation depends on a state store component that supports multi-item transactions.

Refer to the [state store component spec]({{< ref "supported-state-stores.md" >}}) for a full, current list of state stores that support transactions.

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP 响应码

| 代码    | 说明                  |
| ----- | ------------------- |
| `204` | 请求成功                |
| `400` | 状态存储丢失、配置错误或请求格式不正确 |
| `500` | 请求失败                |

#### URL 参数

| 参数          | 说明                                                                                                                                                                     |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                                                                                               |
| `storename` | `metadata.name` field in the user-configured statestore.yaml component file. Refer to the [Dapr state store configuration structure](#component-file) mentioned above. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Body

| 字段           | 说明                                                                     |
| ------------ | ---------------------------------------------------------------------- |
| `operations` | 状态操作的 JSON 数组                                                          |
| `metadata`   | (optional) The metadata for transaction that applies to all operations |

每个状态操作都包含以下字段：

| 字段         | 说明                                                                                     |
| ---------- | -------------------------------------------------------------------------------------- |
| `key`      | State key                                                                              |
| `值`        | State value, which can be any byte array                                               |
| `etag`     | (optional) State ETag                                                                  |
| `metadata` | (optional) Additional key-value pairs to be passed to the state store                  |
| `options`  | (optional) State operation options; see [state operation options](#optional-behaviors) |

#### 示例

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

Actor 不支持多个状态存储，并且需要将事务性的状态存储与 Dapr 一起使用。 [View which services currently implement the transactional state store interface]({{< ref "supported-state-stores.md" >}}).

Specify which state store to be used for actors with a `true` value for the property `actorStateStore` in the metadata section of the `statestore.yaml` component file. For example, the following components yaml will configure Redis to be used as the state store for Actors.

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

## 可选行为

### 关键方案

与 Dapr 兼容的状态存储应使用以下键方案：

* *\<App ID>||\<state key>* key format for general states
* *\<App ID>||\<Actor type>||\<Actor id>||\<state key>* key format for Actor states.

### 并发（Concurrency）

Dapr uses Optimized Concurrency Control (OCC) with ETags. Dapr makes the following requirements optional on state stores:

* A Dapr-compatible state store may support optimistic concurrency control using ETags. The store allows the update when an ETag:
  * Is associated with an *save* or *delete* request.
  * Matches the latest ETag in the database.
* When ETag is missing in the write requests, the state store shall handle the requests in a *last-write-wins* fashion. This allows optimizations for high-throughput write scenarios, in which data contingency is low or has no negative effects.
* A store shall *always* return ETags when returning states to callers.

### 一致性

Dapr allows clients to attach a consistency hint to *get*, *set*, and *delete* operation. Dapr supports two consistency levels: **strong** and **eventual**.

#### Eventual Consistency

Dapr assumes data stores are eventually consistent by default. A state should:

* For *read* requests, return data from any of the replicas.
* For *write* requests, asynchronously replicate updates to configured quorum after acknowledging the update request.

#### Strong Consistency

When a strong consistency hint is attached, a state store should:

* For *read* requests, return the most up-to-date data consistently across replicas.
* For *write*/*delete* requests, synchronously replicate updated data to configured quorum before completing the write request.

### Example: Complete options request example

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

### Example: Working with ETags

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

   The returned ETag above was 1. If you send a new request to update or delete the data with the wrong ETag, it will return an error. Omitting the ETag will allow the request.

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

1. Update or delete the object by simply matching the ETag in either the request body (update) or the `If-Match` header (delete). When the state is updated, it receives a new ETag that future updates or deletes will need to use.

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
