---
type: docs
title: "Actors API 参考"
linkTitle: "Actors API"
description: "关于 Actors API 的详细文档"
weight: 500
---

Dapr provides native, cross-platform, and cross-language virtual actor capabilities. 除了 [特定语言的 SDK]({{< ref sdks>}})，开发人员还可以使用下面的 API 端点调用 Actor。

## User service code calling Dapr

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

| 参数          | 说明         |
| ----------- | ---------- |
| `daprPort`  | Dapr 端口。   |
| `actorType` | Actor 类型。  |
| `actorId`   | Actor ID   |
| `method`    | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

对 actor 调用方法的示例:

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/method/shoot \
  -H "Content-Type: application/json"
```

You can provide the method parameters and values in the body of the request, for example in curl using `-d "{\"param\":\"value\"}"`. Example of invoking a method on an actor that takes parameters:

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

Persists the change to the state for an actor as a multi-item transaction.

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

| 参数          | 说明        |
| ----------- | --------- |
| `daprPort`  | Dapr 端口。  |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |

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

| 参数          | 说明        |
| ----------- | --------- |
| `daprPort`  | Dapr 端口。  |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |
| `key`       | 状态的 key   |

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

JSON 对象将具有以下字段：

| 字段        | 说明                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `dueTime` | Specifies the time after which the reminder is invoked. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration)                                                   |
| `period`  | Specifies the period between different invocations. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) or ISO 8601 duration format with optional recurrence. |

`period` field supports `time.Duration` format and ISO 8601 format with some limitations. For `period`, only duration format of ISO 8601 duration `Rn/PnYnMnWnDTnHnMnS` is supported. `Rn/` specifies that the reminder will be invoked `n` number of times.

- `n` should be a positive integer greater than 0.
- If certain values are 0, the `period` can be shortened; for example, 10 seconds can be specified in ISO 8601 duration as `PT10S`.

If `Rn/` is not specified, the reminder will run an infinite number of times until deleted.

The following specifies a `dueTime` of 3 seconds and a period of 7 seconds.

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

A `dueTime` of 0 means to fire immediately. The following body means to fire immediately, then every 9 seconds.

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

To configure the reminder to fire only once, the period should be set to empty string. The following specifies a `dueTime` of 3 seconds with a period of empty string, which means the reminder will fire in 3 seconds and then never fire again.

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

| 参数          | 说明                 |
| ----------- | ------------------ |
| `daprPort`  | Dapr 端口。           |
| `actorType` | Actor 类型。          |
| `actorId`   | Actor ID           |
| `name`      | 要创建 reminders 的名称。 |

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

| 参数          | 说明                 |
| ----------- | ------------------ |
| `daprPort`  | Dapr 端口。           |
| `actorType` | Actor 类型。          |
| `actorId`   | Actor ID           |
| `name`      | 要获取 reminders 的名称。 |

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

| 参数          | 说明                |
| ----------- | ----------------- |
| `daprPort`  | Dapr 端口。          |
| `actorType` | Actor 类型。         |
| `actorId`   | Actor ID          |
| `name`      | 要删除 reminder 的名称。 |

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

| 代码  | 说明                  |
| --- | ------------------- |
| 204 | 请求成功                |
| 500 | 请求失败                |
| 400 | 未找到 Actor 或格式不正确的请求 |

#### URL 参数

| 参数          | 说明             |
| ----------- | -------------- |
| `daprPort`  | Dapr 端口。       |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `name`      | 要创建 timer 的名称。 |

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

| 参数          | 说明             |
| ----------- | -------------- |
| `daprPort`  | Dapr 端口。       |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `name`      | 要删除 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr 调用用户服务

### 获取注册的 Actors

Get the registered actors types for this app and the Dapr actor configuration settings.

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

| 参数        | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### 示例

Example of getting the registered actors:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

The above command returns the config (all fields are optional):

| 参数                        | 说明                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `entities`                | 此应用程序支持的 actor 类型。                                                                                       |
| `actorIdleTimeout`        | 指定在释放空闲 actor 之前要等待的时间。  如果没有 actor 方法被调用，并且没有触发任何 reminders ，那么 actor 将处于空闲状态。                          |
| `actorScanInterval`       | 指定扫描 actors 以释放空闲 actors 的频率时间间隔。  Actors 时间超过 actorIdleTimeout 的 Actors 将被释放。                           |
| `drainOngoingCallTimeout` | 在进行安全排干 actors 时的超时时间。  该值指定了在排干发生时，最长能等待active方法完成的时间。  如果没有当前 actor 方法调用，那么将忽略此时间。                     |
| `drainRebalancedActors`   | 布尔值。  如果为 true ，那么 Dapr 将等待 `drainOngoingCallTimeout` 以允许当前 actor 调用完成，然后再尝试停用 actor。  如果为 false ，则不会等待。 |

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

Deactivates an actor by persisting the instance of the actor to the state store with the specified actorId.

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

| 参数          | 说明        |
| ----------- | --------- |
| `appPort`   | 应用程序端口    |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

The following example deactivates the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

Invokes a method for an actor with the specified `methodName` where:

- Parameters to the method are passed in the body of the request message.
- Return values are provided in the body of the response message.

If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数           | 说明         |
| ------------ | ---------- |
| `appPort`    | 应用程序端口     |
| `actorType`  | Actor 类型。  |
| `actorId`    | Actor ID   |
| `methodName` | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

The following example calls the `performAction` method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### 调用 reminders

Invokes a reminder for an actor with the specified reminderName. 如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

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

| 参数             | 说明                |
| -------------- | ----------------- |
| `appPort`      | 应用程序端口            |
| `actorType`    | Actor 类型。         |
| `actorId`      | Actor ID          |
| `reminderName` | 要调用 reminder 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

The following example calls the `checkRebels` reminder method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用 timer

Invokes a timer for an actor with the specified `timerName`. If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数          | 说明             |
| ----------- | -------------- |
| `appPort`   | 应用程序端口         |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `timerName` | 要调用 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

The following example calls the `checkRebels` timer method on the actor type `stormtrooper` that has `actorId` of 50.

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

Probes the application for a response to signal to Dapr that the app is healthy and running. Any response status code other than `200` will be considered an unhealthy response.

A response body is not required.

#### HTTP 请求

```
GET http://localhost:<appPort>/healthz
```

#### HTTP 响应码

| 代码  | 说明       |
| --- | -------- |
| 200 | 应用程序是健康的 |

#### URL 参数

| 参数        | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### 示例

Example of getting a health check response from the app:

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 Actor

Conceptually, activating an actor means creating the actor's object and adding the actor to a tracking table. [Review an example from the .NET SDK](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199).

## 外部查询 actor 状态

To enable visibility into the state of an actor and allow for complex scenarios like state aggregation, Dapr saves actor state in external state stores, such as databases. As such, it is possible to query for an actor state externally by composing the correct key or query.

The state namespace created by Dapr for actors is composed of the following items:

- App ID: Represents the unique ID given to the Dapr application.
- Actor Type: Represents the type of the actor.
- Actor ID: Represents the unique ID of the actor instance for an actor type.
- Key: A key for the specific state value. Actor ID 标识可以保存多个状态键。

The following example shows how to construct a key for the state of an actor instance under the `myapp` App ID namespace:

`myapp||cat||hobbit||food`

In the example above, we are getting the value for the state key `food`, for the actor ID `hobbit` with an actor type of `cat`, under the App ID namespace of `myapp`.
