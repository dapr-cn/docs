---
type: docs
title: "Actors API 参考"
linkTitle: "Actors API"
description: "关于 Actors API 的详细文档"
weight: 500
---

Dapr 提供原生、跨平台和跨语言 virtual actors 功能。 Besides the [language specific SDKs]({{<ref sdks>}}), a developer can invoke an actor using the API endpoints below.

## 调用 dapr 的服务代码

### 调用 actor 方法

通过 Dapr 调用 actor 方法。

#### HTTP 请求

```
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/method/<method>
```

#### HTTP 响应码

| 代码  | 说明          |
| --- | ----------- |
| 200 | 请求成功        |
| 500 | 请求失败        |
| XXX | 来自上游调用的状态代码 |

#### URL 参数

| 参数        | 说明         |
| --------- | ---------- |
| daprPort  | Dapr 端口。   |
| actorType | Actor 类型。  |
| actorId   | Actor ID   |
| method    | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

对 actor 调用方法的示例:

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/method/shoot \
  -H "Content-Type: application/json"
```

若 Actor 方法具备参数：您可以在请求正文中提供方法参数和值，例如使用 -d "{\"param\":\"value\"}"


```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json"
  -d '{
        "destination": "Hoth"
      }'
```
or

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json"
  -d "{\"destination\":\"Hoth\"}"
```
被调用方法的返回值将会从响应正文中返回。

### Actor 状态事务

将 Actor 状态的变成以 multi-item transaction 的方式持久化

***请注意，此操作取决于支持 multi-item transactions 的状态存储组件。***

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 204 | 请求成功      |
| 400 | 未找到 Actor |
| 500 | 请求失败      |



#### URL 参数

| 参数        | 说明        |
| --------- | --------- |
| daprPort  | Dapr 端口。  |
| actorType | Actor 类型。 |
| actorId   | Actor ID  |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/state \
  -H "Content-Type: application/json"
  -d '[
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
      ]'
```

### 获取 actor 状态

使用指定的键获取 actor 的状态。

#### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state/<key>
```

#### HTTP 响应码

| 代码  | 说明          |
| --- | ----------- |
| 200 | 请求成功        |
| 204 | 找不到键值，响应将为空 |
| 400 | 未找到 Actor   |
| 500 | 请求失败        |


#### URL 参数

| 参数        | 说明        |
| --------- | --------- |
| daprPort  | Dapr 端口。  |
| actorType | Actor 类型。 |
| actorId   | Actor ID  |
| key       | 状态的 key   |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
  -H "Content-Type: application/json"
```

以上命令将返回状态:

```json
{
  "location": "Alderaan"
}
```

### 创建 actor reminders

为 actor 创建一个持久化的 reminders。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

Body:

以下指定 `dueTime` 的 3 秒和 7 秒的句点。
```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为0表示立即执行。  以下正文是指立即执行，然后每 9 秒钟再执行一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

要将 reminders 配置为仅触发一次，应将 period 设置为空字符串。  以下指定一个 `dueTime` 3 秒，period 为空字符串，这意味着 reminders 将在 3 秒后立即执行，然后永远不会再次触发。
```json
{
  "dueTime":"0h0m3s0ms",
  "period":""
}
```

#### HTTP 响应码

| 代码  | 说明                  |
| --- | ------------------- |
| 204 | 请求成功                |
| 500 | 请求失败                |
| 400 | 未找到 Actor 或格式不正确的请求 |

#### URL 参数

| 参数        | 说明                 |
| --------- | ------------------ |
| daprPort  | Dapr 端口。           |
| actorType | Actor 类型。          |
| actorId   | Actor ID           |
| name      | 要创建 reminders 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json"
-d '{
      "data": "someData",
      "dueTime": "1m",
      "period": "20s"
    }'
```

### 获取 actor reminders

获取一个 actor 的 reminders。

#### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP 响应码

| 代码  | 说明   |
| --- | ---- |
| 200 | 请求成功 |
| 500 | 请求失败 |

#### URL 参数

| 参数        | 说明                 |
| --------- | ------------------ |
| daprPort  | Dapr 端口。           |
| actorType | Actor 类型。          |
| actorId   | Actor ID           |
| name      | 要获取 reminders 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  "Content-Type: application/json"
```

以上命令将返回 reminders:

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### 删除 actor reminders

删除一个 actor 的 reminders。

#### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP 响应码

| 代码  | 说明   |
| --- | ---- |
| 204 | 请求成功 |
| 500 | 请求失败 |

#### URL 参数

| 参数        | 说明                 |
| --------- | ------------------ |
| daprPort  | Dapr 端口。           |
| actorType | Actor 类型。          |
| actorId   | Actor ID           |
| name      | 要删除 reminders 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -X "Content-Type: application/json"
```

### 创建 Actor timers

创建一个 actor 的 reminders。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Body:

以下指定 `dueTime` 的 3 秒和period 为 7 秒。
```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为0表示立即执行。  以下正文是指立即执行，然后每 9 秒钟再执行一次。
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

#### HTTP 响应码

| 代码  | 说明                  |
| --- | ------------------- |
| 204 | 请求成功                |
| 500 | 请求失败                |
| 400 | 未找到 Actor 或格式不正确的请求 |

#### URL 参数

| 参数        | 说明             |
| --------- | -------------- |
| daprPort  | Dapr 端口。       |
| actorType | Actor 类型。      |
| actorId   | Actor ID       |
| name      | 要创建 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
    -H "Content-Type: application/json"
-d '{
      "data": "someData",
      "dueTime": "1m",
      "period": "20s",
      "callback": "myEventHandler"
    }'
```

### 删除 Actor timers

删除一个 actor 的 timer。

#### HTTP 请求

```http
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### HTTP 响应码

| 代码  | 说明   |
| --- | ---- |
| 204 | 请求成功 |
| 500 | 请求失败 |

#### URL 参数

| 参数        | 说明             |
| --------- | -------------- |
| daprPort  | Dapr 端口。       |
| actorType | Actor 类型。      |
| actorId   | Actor ID       |
| name      | 要删除 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -X "Content-Type: application/json"
```

## Dapr 调用用户服务

### 获取注册的 Actors

获取此应用程序的注册的 Actors 类型和 Dapr actor 配置。

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/config
```

#### HTTP 响应码

| 代码  | 说明   |
| --- | ---- |
| 200 | 请求成功 |
| 500 | 请求失败 |

#### URL 参数

| 参数      | 说明     |
| ------- | ------ |
| appPort | 应用程序端口 |

#### 示例

获取注册的 Actors 的示例:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

以上命令返回配置 ( 所有字段都是可选的):


| 参数                      | 说明                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| entities                | 此应用程序支持的 actor 类型。                                                                                       |
| actorIdleTimeout        | 指定在取消激活空闲 actor 之前要等待的时间。  如果没有 actor 方法被调用，并且没有触发任何 reminders ，那么 actor 将处于空闲状态。                        |
| actorScanInterval       | 指定扫描 Actors 以停用空闲 Actors 的频率时间间隔。  Actors 时间超过 actorIdleTimeout 的 Actors 将被取消激活。                         |
| drainOngoingCallTimeout | 在进行 Actor 重定位时使用的时间间隔。  这指定等待当前活动 actor 方法完成多长时间。  如果没有当前 actor 方法调用，那么将忽略此时间。                           |
| drainRebalancedActors   | 布尔值。  如果为 true ，那么 Dapr 将等待 `drainOngoingCallTimeout` 以允许当前 actor 调用完成，然后再尝试停用 actor。  如果为 false ，则不会等待。 |

```json
{
  "entities":["actorType1", "actorType2"],
  "actorIdleTimeout": "1h",
  "actorScanInterval": "30s",
  "drainOngoingCallTimeout": "30s",
  "drainRebalancedActors": true
}
```

### 停用 actor

通过将 指定 actor Id 的 actor 保留到状态存储与来停用 actor

#### HTTP 请求

```
DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 200 | 请求成功      |
| 500 | 请求失败      |
| 404 | 未找到 Actor |

#### URL 参数

| 参数        | 说明        |
| --------- | --------- |
| appPort   | 应用程序端口    |
| actorType | Actor 类型。 |
| actorId   | Actor ID  |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

取消激活 actor 的示例: 该示例取消激活 actorId 为 50 的 actor 类型为 stormtrooper

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

调用具有指定 methodName 的 actor 的方法，其中方法的参数传递到请求消息的主体中，并在响应消息的主体中提供返回值。  如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/<methodName>
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 200 | 请求成功      |
| 500 | 请求失败      |
| 404 | 未找到 Actor |

#### URL 参数

| 参数         | 说明         |
| ---------- | ---------- |
| appPort    | 应用程序端口     |
| actorType  | Actor 类型。  |
| actorId    | Actor ID   |
| methodName | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

对 actor 调用方法的示例: 该示例调用 actorId 为 50 的 actor 类型 stormtrooper上的 performAction 方法

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### 调用 reminders

调用具有指定的 reminderName 的 actor 的 reminders。  如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/remind/<reminderName>
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 200 | 请求成功      |
| 500 | 请求失败      |
| 404 | 未找到 Actor |

#### URL 参数

| 参数           | 说明                 |
| ------------ | ------------------ |
| appPort      | 应用程序端口             |
| actorType    | Actor 类型。          |
| actorId      | Actor ID           |
| reminderName | 要调用 reminders 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

对 actor 调用 reminders 的示例: 该示例调用 actorId 为 50 的参与者类型 stormtrooper 上的 checkRebels reminders 方法

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用 timer

为具有指定 timerName 的 actor 调用 timer。  如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/timer/<timerName>
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 200 | 请求成功      |
| 500 | 请求失败      |
| 404 | 未找到 Actor |

#### URL 参数

| 参数        | 说明             |
| --------- | -------------- |
| appPort   | 应用程序端口         |
| actorType | Actor 类型。      |
| actorId   | Actor ID       |
| timerName | 要调用 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

为 actor 调用 timer 的示例: 该示例调用 actorId 为 50 的 actor 类型 stormtrooper 上的 checkRebels timer 方法

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

探测应用程序以响应向 Dapr 发送的信号，用于表征该应用程序运行正常与否。 除了 `200` 以外的任何其他响应状态代码将被视为不健康的响应。

不需要响应主体。

#### HTTP 请求

```
GET http://localhost:<appPort>/healthz
```

#### HTTP 响应码

| 代码  | 说明       |
| --- | -------- |
| 200 | 应用程序是健康的 |

#### URL 参数

| 参数      | 说明     |
| ------- | ------ |
| appPort | 应用程序端口 |

#### 示例

从应用程序获取健康检查响应的示例：

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 Actor

在概念上，激活 actor 意味着创建 actor 的对象并将 actor 添加到跟踪表。  下面是一个 [.NET SDK](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199) 的一个示例。

## 外部查询 actor 状态

为了启用对 actor 状态的可见性并允许复杂的方案（如状态聚合），Dapr 在外部状态存储（如数据库）中保存 actor 状态。 因此，可以通过组成正确的键或查询来外部查询 actor 状态。

由 Dapr 为 Actors 创建的状态名称空间由以下项组成:
- App ID - 表示给 Dapr 应用程序的唯一 ID。
- Actor 类型 - 表示 actor 的类型。
- Actor ID - 代表 actor 类型的 actor 实例的唯一ID。
- Key - 特定状态值的键。 Actor ID 标识可以保存多个状态键。

下面的示例演示如何在 `myapp` 应用程序 ID 命名空间下为 actor 实例的状态构造状态名称空间： `myapp||cat||hobbit||food`

在以上示例中，我们在 `myapp` 的应用标识名称空间下，为 actor ID 为 `hobbit` ( actor 类型为 `cat`) 获取状态键 `food`的值。
