---
type: docs
title: "状态管理 API 参考文档"
linkTitle: "状态管理 API"
description: "有关状态管理 API 的详细文档"
weight: 200
---

## 组件文件

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

| 设置              | 说明                       |
| --------------- | ------------------------ |
| `metadata.name` | 状态存储的名称。                 |
| `spec/metadata` | 一个开放的键值对元数据，它允许绑定定义连接属性。 |

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

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL 参数

| 参数          | 说明                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                       |
| `storename` | 用户配置的 `statestore.yaml` 组件文件中的 `metadata.name`  字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
POST http://localhost:3500/v1.0/state/myStore?metadata.contentType=application/json
```
> 所有的 URL 参数都是大小写敏感的。

#### 请求正文

状态对象的 JSON 数组。 每个状态对象都包含以下字段：

| 字段         | 说明                                             |
| ---------- | ---------------------------------------------- |
| `key`      | 状态键                                            |
| `value`    | 状态值，可以是任何字节数组                                  |
| `etag`     | (可选) 状态 ETag                                   |
| `metadata` | (可选) 要传递给状态存储的额外键值对                            |
| `options`  | (可选) 状态操作选项, 请参阅 [状态操作选项](#optional-behaviors) |

> **ETag 格式:** Dapr 运行时将ETags视为不透明字符串。 确切的 ETag 格式由相应的数据存储定义。

#### 元数据

元数据可以通过请求 URL 中的查询参数发送。 必须以 `metadata.` 为前缀，如下所示。

| 参数                      | 说明                                               |
| ----------------------- | ------------------------------------------------ |
| `metadata.ttlInSeconds` | 消息过期的秒数，如 [此处所述]({{< ref state-store-ttl.md >}}) |

> **TTL:** 只有某些状态存储支持 TTL 选项，根据 [支持的状态存储]({{< ref supported-state-stores.md >}})。

### HTTP 响应

#### 响应码

| 代码    | 说明                  |
| ----- | ------------------- |
| `204` | 状态已保存               |
| `400` | 状态存储丢失、配置错误或请求格式不正确 |
| `500` | 无法保存状态              |

#### 响应正文

无

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

此终结点允许你获取特定键的状态。

### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL 参数

| 参数            | 说明                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------- |
| `daprPort`    | Dapr 端口。                                                                                    |
| `storename`   | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `key`         | 所需状态的键                                                                                      |
| `consistency` | (可选) 读取一致性模式，请参阅 [状态操作选项](#optional-behaviors)                                              |
| `metadata`    | (可选) 作为状态存储的查询参数的元数据                                                                        |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
GET http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

### HTTP 响应

#### 响应码

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

## 获取批量状态

使用此终结点，可以获取给定键列表的值列表。

### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL 参数

| 参数          | 说明                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                    |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `metadata`  | (可选) 作为状态存储的查询参数的元数据                                                                        |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
POST/PUT http://localhost:3500/v1.0/state/myStore/bulk?metadata.partitionKey=mypartitionKey
```

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

将元数据作为查询参数传递：

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

| 参数            | 说明                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------- |
| `daprPort`    | Dapr 端口。                                                                                    |
| `storename`   | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `key`         | 所需状态的键                                                                                      |
| `concurrency` | (可选) *first-write* 或者 *last-write*；请参阅 [状态操作选项](#optional-behaviors)                        |
| `consistency` | (可选) *strong* 或者 *eventual*；请参阅 [状态操作选项](#optional-behaviors)                               |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
DELETE http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

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

无

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

| 参数          | 说明                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                    |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |
| `metadata`  | (可选) 作为状态存储的查询参数的元数据                                                                        |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json
```

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

## 状态事务

将状态存储的更改持久化为 [事务操作]({{< ref "state-management-overview.md#transactional-operations" >}})。

> 此 API 依赖于支持事务的状态存储组件。

有关支持事务的状态存储的完整当前列表，请参阅 [状态存储组件规范]({{< ref "supported-state-stores.md" >}})。

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

| 参数          | 说明                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------- |
| `daprPort`  | Dapr 端口。                                                                                    |
| `storename` | 用户配置的 statestore.yaml 组件文件中的 `metadata.name` 字段。 参考上面提到的 [Dapr 状态存储配置结构](#component-file) 。 |

通过 URL 查询参数传递可选的请求元数据。 例如,
```
POST http://localhost:3500/v1.0/state/myStore/transaction?metadata.contentType=application/json
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### Request Body

| 字段           | 说明                        |
| ------------ | ------------------------- |
| `operations` | 状态 `operation`的 JSON 数组   |
| `metadata`   | (可选) 适用于所有操作的事务`metadata` |

所有事务数据库都实现以下必需的操作：

| 操作       | 说明     |
| -------- | ------ |
| `upsert` | 添加或更新值 |
| `delete` | 删除此值   |

每个操作都有一个关联的 `request` ，它由以下字段组成：

| 请求         | 说明                                             |
| ---------- | ---------------------------------------------- |
| `key`      | 状态键                                            |
| `值`        | 状态值，可以是任何字节数组                                  |
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

Actor 不支持多个状态存储，并且需要将事务性的状态存储与 Dapr 一起使用。 [查看当前哪些服务实现了事务状态存储接口]({{< ref "supported-state-stores.md" >}})．

通过在组件文件 `statestore.yaml`的元数据部分，将属性`actorStateStore`的值设置为`true`，来指定该 state store 可以被 actor 所使用。 例如，以下组件文件将会被用来配置被 Actors state store 所使用的 Redis。

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

Dapr 使用 Etags 优化并发控制(OCC)。 Dapr 将以下 state store 配置项设置为可选项：

* Dapr-compatible 状态存储可以使用 ETags 来支持乐观并发控制。 该状态存储允许在 ETag 发生如下变化时去更新：
  * 与 *保存* 或 *删除* 请求相关联。
  * 与数据库中最新版本的 ETag 相匹配。
* 当在写入请求的数据中缺少ETag时，状态存储将会使用 *last-write-wins* 机制来处理这次请求。 在数据具有很低的偶然性或者几乎没有负面影响的高吞吐写入场景，这将产生明显的优化效果。
* 当返回状态数据给调用者时，状态存储将*总是*会附带返回 ETags。

### 一致性

Dapr 允许客户端在 *get*, *set* 和 *delete* 操作上附加一致性标识。 Dapr 支持两种一致性级别： **强一致性** 和 **最终一致性**。

#### 最终一致性

Dapr 默认数据存储都是最终一致性的。 状态应该：

* 对于*读* 请求，从任何一个副本中返回数据。
* 对于 *写* 请求，在更新请求确认后，异步复制更新到已配置的仲裁副本中。

#### 强一致性

当附加强一致性标识时，状态存储应该：

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

### 示例：ETag 的使用

如下是在一个状态存储中去 *设置*/*删除* 一个对象时，演示使用 ETag 用法的示例。 这个示例使用 Redis 来定义 `statestore`。

1. 在状态存储中存储对象：

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

1. 读取该对象，去验证状态存储自动设置的 Etag：

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

## 下一步

- [状态管理概览]({{< ref state-management-overview.md >}})
- [指南：如何保存和获取状态]({{< ref howto-get-save-state.md >}})
