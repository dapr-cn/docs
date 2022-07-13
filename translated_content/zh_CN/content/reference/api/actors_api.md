---
type: docs
title: "Actors API 参考"
linkTitle: "Actors API"
description: "关于 Actors API 的详细文档"
weight: 500
---

Dapr 提供原生、跨平台和跨语言的 virtual actors 功能。 Besides the [language specific SDKs]({{<ref sdks>}}), a developer can invoke an actor using the API endpoints below.

## 业务应用调用dapr

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

你可以在请求正文中提供方法参数和值，例如，在 curl 中使用 `-d "{\"param\":\"value\"}"`. 在 actor 上调用带参数的方法的示例：

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d '{
        "destination": "Hoth"
      }'
```

or

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d "{\"destination\":\"Hoth\"}"
```

被调用方法的返回值将会从响应正文中返回。

### Actor 状态事务

将 actor 的状态变更以 multi-item transaction 的方式持久化。

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
  -H "Content-Type: application/json" \
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

A JSON object with the following fields:

| 字段        | 说明                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| `dueTime` | 指定在该时间之后 Remider 被调用 格式应该为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration)                             |
| `period`  | 指定不同调用之间的时间间隔。 格式应该为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 或者 ISO 8601 持续时间格式并带有一个可选的重复调用参数。 |

`period` 字段支持 `time.Duration` 格式和 ISO 8601 格式，但有一些限制。 对于 `period`, 仅支持 ISO 8601 持续时间格式 `Rn/PnYnMnWnDTnHnMnS`。 `Rn/` 指定 Reminder 将会被调用 `n` 次。

- `n` 应该是大于 0 的正整数。
- 如果某些值为0， ` peroid ` 可以缩短；例如，10秒可以在 ISO 8601 持续时间中指定为 `PT10S`。

如果未指定 `Rn/`，Reminder 将会无限次的运行，直到删除。

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

要将 reminders 配置为仅触发一次，应将 period 设置为空字符串。 The following specifies a `dueTime` of 3 seconds with a period of empty string, which means the reminder will fire in 3 seconds and then never fire again.

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

| 参数          | 说明                                  |
| ----------- | ----------------------------------- |
| `daprPort`  | Dapr 端口。                            |
| `actorType` | Actor 类型。                           |
| `actorId`   | Actor ID                            |
| `name`      | The name of the reminder to create. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json" \
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

| 参数          | 说明                               |
| ----------- | -------------------------------- |
| `daprPort`  | Dapr 端口。                         |
| `actorType` | Actor 类型。                        |
| `actorId`   | Actor ID                         |
| `name`      | The name of the reminder to get. |

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

| 参数          | 说明                                  |
| ----------- | ----------------------------------- |
| `daprPort`  | Dapr 端口。                            |
| `actorType` | Actor 类型。                           |
| `actorId`   | Actor ID                            |
| `name`      | The name of the reminder to delete. |

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

| 参数          | 说明                               |
| ----------- | -------------------------------- |
| `daprPort`  | Dapr 端口。                         |
| `actorType` | Actor 类型。                        |
| `actorId`   | Actor ID                         |
| `name`      | The name of the timer to create. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
    -H "Content-Type: application/json" \
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

| 参数          | 说明                               |
| ----------- | -------------------------------- |
| `daprPort`  | Dapr 端口。                         |
| `actorType` | Actor 类型。                        |
| `actorId`   | Actor ID                         |
| `name`      | The name of the timer to delete. |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr 调用用户服务

### 获取注册的 Actors

获取此应用程序注册的 Actors 类型和 Dapr actor 配置。

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

| 参数        | 说明                    |
| --------- | --------------------- |
| `appPort` | The application port. |

#### 示例

Example of getting the registered actors:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

The above command returns the config (all fields are optional):

| 参数                        | 说明                                                                                                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `entities`                | The actor types this app supports.                                                                                                                                              |
| `actorIdleTimeout`        | Specifies how long to wait before deactivating an idle actor.  An actor is idle if no actor method calls and no reminders have fired on it.                                     |
| `actorScanInterval`       | A duration which specifies how often to scan for actors to deactivate idle actors.  Actors that have been idle longer than the actorIdleTimeout will be deactivated.            |
| `drainOngoingCallTimeout` | A duration used when in the process of draining rebalanced actors.  This specifies how long to wait for the current active actor method to finish.  如果没有当前 actor 方法调用，那么将忽略此时间。 |
| `drainRebalancedActors`   | A bool.  If true, Dapr will wait for `drainOngoingCallTimeout` to allow a current actor call to complete before trying to deactivate an actor.  If false, do not wait.          |
| `可重入性`                    | A configuration object that holds the options for actor reentrancy.                                                                                                             |
| `enabled`                 | A flag in the reentrancy configuration that is needed to enable reentrancy.                                                                                                     |
| `maxStackDepth`           | A value in the reentrancy configuration that controls how many reentrant calls be made to the same actor.                                                                       |
| `entitiesConfig`          | Array of entity configurations that allow per actor type settings. Any configuration defined here must have an entity that maps back into the root level entities.              |

```json
{
  "entities":["actorType1", "actorType2"],
  "actorIdleTimeout": "1h",
  "actorScanInterval": "30s",
  "drainOngoingCallTimeout": "30s",
  "drainRebalancedActors": true,
  "reentrancy": {
    "enabled": true,
    "maxStackDepth": 32
  },
  "entitiesConfig": [
      {
          "entities": ["actorType1"],
          "actorIdleTimeout": "1m",
          "drainOngoingCallTimeout": "10s",
          "reentrancy": {
              "enabled": false
          }
      }
  ]
}
```

### 停用 actor

通过将 指定 actor Id 的 actor 保留到状态存储与来停用 actor.

#### HTTP 请求

```
DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>
```

#### HTTP 响应码

| 代码  | 说明        |
| --- | --------- |
| 200 | 请求成功      |
| 400 | 未找到 Actor |
| 500 | 请求失败      |

#### URL 参数

| 参数          | 说明                    |
| ----------- | --------------------- |
| `appPort`   | The application port. |
| `actorType` | Actor 类型。             |
| `actorId`   | Actor ID              |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下示例停用 `actorId` 为 50 类型为`stormtrooper` 的Actor。

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

用指定的 `methodName` 调用 Actor 的方法，其中：

- 该方法的参数在请求消息的正文中传递。
- 返回值在响应消息的正文中提供。

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

| 参数           | 说明                    |
| ------------ | --------------------- |
| `appPort`    | The application port. |
| `actorType`  | Actor 类型。             |
| `actorId`    | Actor ID              |
| `methodName` | 要调用的方法的名称。            |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用方法 `performAction`。

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

| 参数             | 说明                                  |
| -------------- | ----------------------------------- |
| `appPort`      | The application port.               |
| `actorType`    | Actor 类型。                           |
| `actorId`      | Actor ID                            |
| `reminderName` | The name of the reminder to invoke. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用方法 `checkRebels`。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用 timer

为具有指定 `timerName` 的 actor 调用 timer。 If the actor is not already running, the app side should [activate](#activating-an-actor) it.

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

| 参数          | 说明                               |
| ----------- | -------------------------------- |
| `appPort`   | The application port.            |
| `actorType` | Actor 类型。                        |
| `actorId`   | Actor ID                         |
| `timerName` | The name of the timer to invoke. |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用timer方法 `checkRebels`。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

Probes the application for a response to signal to Dapr that the app is healthy and running. 除了 `200` 以外的任何其他响应状态代码将被视为不健康的响应。

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

| 参数        | 说明                    |
| --------- | --------------------- |
| `appPort` | The application port. |

#### 示例

Example of getting a health check response from the app:

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 Actor

在概念上，激活 actor 意味着创建 actor 的对象并将 actor 添加到跟踪表。 [查看.NET SDK 中的示例](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199)。

## 外部查询 actor 状态

为了启用对 actor 状态的可见性并允许复杂的方案（如状态聚合），Dapr 在外部状态存储（如数据库）中保存 actor 状态。 As such, it is possible to query for an actor state externally by composing the correct key or query.

The state namespace created by Dapr for actors is composed of the following items:

- App ID: 表示给 Dapr 应用程序的唯一 ID。
- Actor Type: 表示 actor 的类型。
- Actor ID: 代表 actor 类型的 actor 实例的唯一ID。
- Key: 特定状态值的键。 Actor ID 标识可以保存多个状态键。

下面的例子展示了如何为 `myapp` App ID命名空间下的actor实例的状态构建一个Key。

`myapp||cat||hobbit||food`

In the example above, we are getting the value for the state key `food`, for the actor ID `hobbit` with an actor type of `cat`, under the App ID namespace of `myapp`.
