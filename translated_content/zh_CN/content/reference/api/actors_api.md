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

#### Request Body

A JSON object with the following fields:

| 字段      | 说明                                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dueTime | Specifies the time after which the reminder is invoked, its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format                                                   |
| period  | Specifies the period between different invocations, its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format or ISO 8601 duration format with optional recurrence. |

`period` field supports `time.Duration` format and ISO 8601 format (with some limitations). Only duration format of ISO 8601 duration `Rn/PnYnMnWnDTnHnMnS` is supported for `period`. Here `Rn/` specifies that the reminder will be invoked `n` number of times. It should be a positive integer greater than zero. If certain values are zero, the `period` can be shortened, for example 10 seconds can be specified in ISO 8601 duration as `PT10S`. If `Rn/` is not specified the reminder will run infinite number of times until deleted.

The following specifies a `dueTime` of 3 seconds and a period of 7 seconds.
```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

A `dueTime` of 0 means to fire immediately.  The following body means to fire immediately, then every 9 seconds.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

To configure the reminder to fire once only, the period should be set to empty string.  The following specifies a `dueTime` of 3 seconds with a period of empty string, which means the reminder will fire in 3 seconds and then never fire again.
```json
{
  "dueTime":"0h0m3s0ms",
  "period":""
}
```

#### HTTP 响应码

| 代码  | 说明                                   |
| --- | ------------------------------------ |
| 204 | 请求成功                                 |
| 500 | 请求失败                                 |
| 400 | Actor not found or malformed request |

#### URL 参数

| 参数        | 说明                                  |
| --------- | ----------------------------------- |
| daprPort  | Dapr 端口。                            |
| actorType | Actor 类型。                           |
| actorId   | Actor ID                            |
| name      | The name of the reminder to create. |

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

Gets a reminder for an actor.

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

| 参数        | 说明                               |
| --------- | -------------------------------- |
| daprPort  | Dapr 端口。                         |
| actorType | Actor 类型。                        |
| actorId   | Actor ID                         |
| name      | The name of the reminder to get. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  "Content-Type: application/json"
```

The above command returns the reminder:

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### 删除 actor reminders

Deletes a reminder for an actor.

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

| 参数        | 说明                                  |
| --------- | ----------------------------------- |
| daprPort  | Dapr 端口。                            |
| actorType | Actor 类型。                           |
| actorId   | Actor ID                            |
| name      | The name of the reminder to delete. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json"
```

### 创建 Actor timers

Creates a timer for an actor.

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

Body:

The following specifies a `dueTime` of 3 seconds and a period of 7 seconds.
```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

A `dueTime` of 0 means to fire immediately.  The following body means to fire immediately, then every 9 seconds.
```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

#### HTTP 响应码

| 代码  | 说明                                   |
| --- | ------------------------------------ |
| 204 | 请求成功                                 |
| 500 | 请求失败                                 |
| 400 | Actor not found or malformed request |

#### URL 参数

| 参数        | 说明                               |
| --------- | -------------------------------- |
| daprPort  | Dapr 端口。                         |
| actorType | Actor 类型。                        |
| actorId   | Actor ID                         |
| name      | The name of the timer to create. |

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

Deletes a timer for an actor.

#### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### HTTP 响应码

| 代码  | 说明   |
| --- | ---- |
| 204 | 请求成功 |
| 500 | 请求失败 |

#### URL 参数

| 参数        | 说明                               |
| --------- | -------------------------------- |
| daprPort  | Dapr 端口。                         |
| actorType | Actor 类型。                        |
| actorId   | Actor ID                         |
| name      | The name of the timer to delete. |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr 调用用户服务

### 获取注册的 Actors

Gets the registered actors types for this app and the Dapr actor configuration settings.

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

| 参数      | 说明                    |
| ------- | --------------------- |
| appPort | The application port. |

#### 示例

Example of getting the registered actors:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

The above command returns the config (all fields are optional):


| 参数                      | 说明                                                                                                                                                                              |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| entities                | The actor types this app supports.                                                                                                                                              |
| actorIdleTimeout        | Specifies how long to wait before deactivating an idle actor.  An actor is idle if no actor method calls and no reminders have fired on it.                                     |
| actorScanInterval       | A duration which specifies how often to scan for actors to deactivate idle actors.  Actors that have been idle longer than the actorIdleTimeout will be deactivated.            |
| drainOngoingCallTimeout | A duration used when in the process of draining rebalanced actors.  This specifies how long to wait for the current active actor method to finish.  如果没有当前 actor 方法调用，那么将忽略此时间。 |
| drainRebalancedActors   | A bool.  If true, Dapr will wait for `drainOngoingCallTimeout` to allow a current actor call to complete before trying to deactivate an actor.  If false, do not wait.          |

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

Deactivates an actor by persisting the instance of the actor to the state store with the specified actorId

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

| 参数        | 说明                    |
| --------- | --------------------- |
| appPort   | The application port. |
| actorType | Actor 类型。             |
| actorId   | Actor ID              |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

Example of deactivating an actor: The example deactives the actor type stormtrooper that has actorId of 50

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

Invokes a method for an actor with the specified methodName where parameters to the method are passed in the body of the request message and return values are provided in the body of the response message.  If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数         | 说明                    |
| ---------- | --------------------- |
| appPort    | The application port. |
| actorType  | Actor 类型。             |
| actorId    | Actor ID              |
| methodName | 要调用的方法的名称。            |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

Example of invoking a method for an actor: The example calls the performAction method on the actor type stormtrooper that has actorId of 50

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### 调用 reminders

Invokes a reminder for an actor with the specified reminderName. If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数           | 说明                                  |
| ------------ | ----------------------------------- |
| appPort      | The application port.               |
| actorType    | Actor 类型。                           |
| actorId      | Actor ID                            |
| reminderName | The name of the reminder to invoke. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

Example of invoking a reminder for an actor: The example calls the checkRebels reminder method on the actor type stormtrooper that has actorId of 50

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用 timer

Invokes a timer for an actor with the specified timerName. If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数        | 说明                               |
| --------- | -------------------------------- |
| appPort   | The application port.            |
| actorType | Actor 类型。                        |
| actorId   | Actor ID                         |
| timerName | The name of the timer to invoke. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

Example of invoking a timer for an actor: The example calls the checkRebels timer method on the actor type stormtrooper that has actorId of 50

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

Probes the application for a response to signal to Dapr that the app is healthy and running. Any other response status code other than `200` will be considered as an unhealthy response.

A response body is not required.

#### HTTP 请求

```
GET http://localhost:<appPort>/healthz
```

#### HTTP 响应码

| 代码  | 说明             |
| --- | -------------- |
| 200 | App is healthy |

#### URL 参数

| 参数      | 说明                    |
| ------- | --------------------- |
| appPort | The application port. |

#### 示例

Example of getting a health check response from the app:

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 Actor

Conceptually, activating an actor  means creating the actor's object and adding the actor to a tracking table.  Here is an [example](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199) from the .NET SDK.

## 外部查询 actor 状态

In order to enable visibility into the state of an actor and allow for complex scenarios such as state aggregation, Dapr saves actor state in external state stores such as databases. As such, it is possible to query for an actor state externally by composing the correct key or query.

The state namespace created by Dapr for actors is composed of the following items:
- App ID - 表示给 Dapr 应用程序的唯一 ID。
- Actor 类型 - 表示 actor 的类型。
- Actor ID - 代表 actor 类型的 actor 实例的唯一ID。
- Key - 特定状态值的键。 Actor ID 标识可以保存多个状态键。

The following example shows how to construct a key for the state of an actor instance under the `myapp` App ID namespace: `myapp||cat||hobbit||food`

In the example above, we are getting the value for the state key `food`, for the actor ID `hobbit` with an actor type of `cat`, under the App ID namespace of `myapp`.
