---
type: docs
title: "状态管理API参考"
linkTitle: "状态管理API"
description: "关于状态管理API的详细文档"
weight: 400
---

## 组件文件

Dapr的`statestore.yaml`组件文件结构如下：

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

| 设置 | 描述 |
| ------- | ----------- |
| `metadata.name` | 状态存储的名称。 |
| `spec/metadata` | 一个开放的键值对元数据，允许绑定定义连接属性。 |

## 键方案

Dapr状态存储是键/值存储。Dapr要求这些数据存储遵循固定的键方案，以确保数据兼容性。对于一般状态，键格式为：

```
<App ID>||<state key>
```

对于actor状态，键格式为：

```
<App ID>||<Actor type>||<Actor id>||<state key>
```

## 保存状态

通过该端点可以保存一组状态对象。

### HTTP请求

```
POST http://localhost:<daprPort>/v1.0/state/<storename>
```

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的`statestore.yaml`组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。

可选的请求元数据通过URL查询参数传递。例如，
```
POST http://localhost:3500/v1.0/state/myStore?metadata.contentType=application/json
```
> 所有URL参数区分大小写。

> 由于`||`是用作键方案中的分隔符，因此不能在`<state key>`字段中使用。

#### 请求体

状态对象的JSON数组，每个状态对象包含以下字段：

字段 | 描述
---- | -----------
`key` | 状态键
`value` | 状态值，可以是任何字节数组
`etag` | （可选）状态ETag
`metadata` | （可选）要传递给状态存储的附加键值对
`options` | （可选）状态操作选项；请参阅[状态操作选项](#optional-behaviors)

> **ETag格式：** Dapr运行时将ETags视为不透明字符串。确切的ETag格式由相应的数据存储定义。

#### 元数据

元数据可以通过请求的URL中的查询参数发送。它必须以`metadata.`为前缀，如下所示。

参数 | 描述
--------- | -----------
`metadata.ttlInSeconds` | 消息过期的秒数，如[此处所述]({{< ref state-store-ttl.md >}})

> **TTL：** 只有某些状态存储支持TTL选项，根据[支持的状态存储]({{< ref supported-state-stores.md >}})。

### HTTP响应

#### 响应代码

代码 | 描述
---- | -----------
`204`  | 状态已保存
`400`  | 状态存储缺失或配置错误或请求格式错误
`500`  | 保存状态失败

#### 响应体

无。

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

通过该端点可以获取特定键的状态。

### HTTP请求

```
GET http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的statestore.yaml组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。
`key` | 所需状态的键
`consistency` | （可选）读取一致性模式；请参阅[状态操作选项](#optional-behaviors)
`metadata` | （可选）作为查询参数传递给状态存储的元数据

可选的请求元数据通过URL查询参数传递。例如，
```
GET http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意，所有URL参数区分大小写。

### HTTP响应

#### 响应代码

代码 | 描述
---- | -----------
`200`  | 获取状态成功
`204`  | 找不到键
`400`  | 状态存储缺失或配置错误
`500`  | 获取状态失败

#### 响应头

头 | 描述
--------- | -----------
`ETag` | 返回值的ETag

#### 响应体

JSON编码的值

### 示例

```shell
curl http://localhost:3500/v1.0/state/starwars/planet?metadata.contentType=application/json
```

> 上述命令返回状态：

```json
{
  "name": "Tatooine"
}
```

要将元数据作为查询参数传递：

```
GET http://localhost:3500/v1.0/state/starwars/planet?metadata.partitionKey=mypartitionKey&metadata.contentType=application/json
```

## 获取批量状态

通过该端点可以获取给定键列表的值列表。

### HTTP请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/bulk
```

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的statestore.yaml组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。
`metadata` | （可选）作为查询参数传递给状态存储的元数据

可选的请求元数据通过URL查询参数传递。例如，
```
POST/PUT http://localhost:3500/v1.0/state/myStore/bulk?metadata.partitionKey=mypartitionKey
```

> 注意，所有URL参数区分大小写。

### HTTP响应

#### 响应代码

代码 | 描述
---- | -----------
`200`  | 获取状态成功
`400`  | 状态存储缺失或配置错误
`500`  | 获取批量状态失败

#### 响应体

一个JSON编码的值数组

### 示例

```shell
curl http://localhost:3500/v1.0/state/myRedisStore/bulk \
  -H "Content-Type: application/json" \
  -d '{
          "keys": [ "key1", "key2" ],
          "parallelism": 10
      }'
```

> 上述命令返回一个键/值对象数组：

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

要将元数据作为查询参数传递：

```
POST http://localhost:3500/v1.0/state/myRedisStore/bulk?metadata.partitionKey=mypartitionKey
```

## 删除状态

通过该端点可以删除特定键的状态。

### HTTP请求

```
DELETE http://localhost:<daprPort>/v1.0/state/<storename>/<key>
```

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的statestore.yaml组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。
`key` | 所需状态的键
`concurrency` | （可选）*first-write*或*last-write*；请参阅[状态操作选项](#optional-behaviors)
`consistency` | （可选）*strong*或*eventual*；请参阅[状态操作选项](#optional-behaviors)

可选的请求元数据通过URL查询参数传递。例如，
```
DELETE http://localhost:3500/v1.0/state/myStore/myKey?metadata.contentType=application/json
```

> 注意，所有URL参数区分大小写。

#### 请求头

头 | 描述
--------- | -----------
If-Match | （可选）与要删除的键关联的ETag

### HTTP响应

#### 响应代码

代码 | 描述
---- | -----------
`204`  | 删除状态成功
`400`  | 状态存储缺失或配置错误
`500`  | 删除状态失败

#### 响应体

无。

### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/state/starwars/planet -H "If-Match: xxxxxxx"
```

## 查询状态

通过该端点可以查询键/值状态。

{{% alert title="alpha" color="warning" %}}
此API处于alpha阶段。
{{% /alert %}}

### HTTP请求

```
POST/PUT http://localhost:<daprPort>/v1.0-alpha1/state/<storename>/query
```

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的statestore.yaml组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。
`metadata` | （可选）作为查询参数传递给状态存储的元数据

可选的请求元数据通过URL查询参数传递。例如，
```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.contentType=application/json
```

> 注意，所有URL参数区分大小写。

#### 响应代码

代码 | 描述
---- | -----------
`200`  | 状态查询成功
`400`  | 状态存储缺失或配置错误
`500`  | 状态查询失败

#### 响应体

一个JSON编码的值数组

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

> 上述命令返回一个对象数组以及一个令牌：

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

要将元数据作为查询参数传递：

```
POST http://localhost:3500/v1.0-alpha1/state/myStore/query?metadata.partitionKey=mypartitionKey
```

## 状态事务

将更改持久化到状态存储作为[事务操作]({{< ref "state-management-overview.md#transactional-operations" >}})。

> 此API依赖于支持事务的状态存储组件。

请参阅[状态存储组件规范]({{< ref "supported-state-stores.md" >}})以获取支持事务的状态存储的完整、当前列表。

#### HTTP请求

```
POST/PUT http://localhost:<daprPort>/v1.0/state/<storename>/transaction
```

#### HTTP响应代码

代码 | 描述
---- | -----------
`204`  | 请求成功
`400`  | 状态存储缺失或配置错误或请求格式错误
`500`  | 请求失败

#### URL参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr端口
`storename` | 用户配置的statestore.yaml组件文件中的`metadata.name`字段。请参阅上面提到的[Dapr状态存储配置结构](#component-file)。

可选的请求元数据通过URL查询参数传递。例如，
```
POST http://localhost:3500/v1.0/state/myStore/transaction?metadata.contentType=application/json
```

> 注意，所有URL参数区分大小写。

#### 请求体

字段 | 描述
---- | -----------
`operations` | 状态`operation`的JSON数组
`metadata` | （可选）适用于所有操作的事务`metadata`

所有事务性数据库实现以下必需操作：

操作 | 描述
--------- | -----------
`upsert` | 添加或更新值
`delete` | 删除值

每个操作都有一个关联的`request`，由以下字段组成：

请求 | 描述
---- | -----------
`key` | 状态键
`value` | 状态值，可以是任何字节数组
`etag` | （可选）状态ETag
`metadata` | （可选）要传递给状态存储的附加键值对，适用于此操作
`options` | （可选）状态操作选项；请参阅[状态操作选项](#optional-behaviors)

#### 示例
下面的示例显示了`key1`的`upsert`操作和`key2`的`delete`操作。这适用于状态存储中名为'planet'的分区。两个操作在事务中要么成功要么失败。

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

## 为actor配置状态存储

actor不支持多个状态存储，并且需要使用事务性状态存储与Dapr一起使用。[查看当前实现事务性状态存储接口的服务]({{< ref "supported-state-stores.md" >}})。

在`statestore.yaml`组件文件的元数据部分中为属性`actorStateStore`指定一个`true`值，以指定用于actor的状态存储。
例如，以下组件yaml将配置Redis用作actor的状态存储。

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

一个Dapr兼容的状态存储应使用以下键方案：

* *\<App ID>||\<state key>* 键格式用于一般状态
* *\<App ID>||\<Actor type>||\<Actor id>||\<state key>* 键格式用于actor状态。

### 并发

Dapr使用带有ETags的乐观并发控制（OCC）。Dapr对状态存储提出以下可选要求：

* 一个Dapr兼容的状态存储可以支持使用ETags的乐观并发控制。存储允许在ETag：
  * 与*保存*或*删除*请求相关联时。
  * 匹配数据库中的最新ETag时。
* 当写请求中缺少ETag时，状态存储应以*最后写入优先*的方式处理请求。这允许对高吞吐量写入场景进行优化，其中数据争用较低或没有负面影响。
* 存储在返回状态给调用者时应*始终*返回ETags。

### 一致性

Dapr允许客户端将一致性提示附加到*获取*、*设置*和*删除*操作。Dapr支持两种一致性级别：**强一致性**和**最终一致性**。

#### 最终一致性

Dapr假定数据存储默认是最终一致的。状态应：

* 对于*读取*请求，从任何副本返回数据。
* 对于*写入*请求，在确认更新请求后异步复制更新到配置的法定人数。

#### 强一致性

当附加了强一致性提示时，状态存储应：

* 对于*读取*请求，始终返回跨副本一致的最新数据。
* 对于*写入*/*删除*请求，在完成写入请求之前同步复制更新的数据到配置的法定人数。

### 示例：完整选项请求示例

以下是一个带有完整`options`定义的*设置*请求示例：

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

### 示例：使用ETags

以下是一个在兼容状态存储中*设置*/*删除*对象时使用ETag的示例演练。此示例将Redis定义为`statestore`。

1. 在状态存储中存储一个对象：

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

1. 获取对象以查找由状态存储自动设置的ETag：

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

   上述返回的ETag为1。如果您发送一个新的请求以错误的ETag更新或删除数据，它将返回错误。省略ETag将允许请求。

   ```shell
   # 更新
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
   
   # 删除
   curl -X DELETE -H 'If-Match: 5' http://localhost:3500/v1.0/state/statestore/sampleData
   {"errorCode":"ERR_STATE_DELETE","message":"failed deleting state with key sampleData: possible etag mismatch. error from state store: ERR Error running script (call to f_9b5da7354cb61e2ca9faff50f6c43b81c73c0b94): @user_script:1: user_script:1: failed to delete node
   app||sampleData"}
   ```

1. 通过简单地在请求体（更新）或`If-Match`头（删除）中匹配ETag来更新或删除对象。当状态更新时，它会接收一个新的ETag，未来的更新或删除将需要使用。

   ```shell
   # 更新
   curl -X POST http://localhost:3500/v1.0/state/statestore \
       -H "Content-Type: application/json" \
       -d '[
           {
               "key": "sampleData",
               "value": "2",
               "etag": "1"
           }
       ]'
   
   # 删除
   curl -X DELETE -H 'If-Match: 1' http://localhost:3500/v1.0/state/statestore/sampleData
   ```

## 下一步

- [状态管理概述]({{< ref state-management-overview.md >}})
- [如何：保存和获取状态]({{< ref howto-get-save-state.md >}})
