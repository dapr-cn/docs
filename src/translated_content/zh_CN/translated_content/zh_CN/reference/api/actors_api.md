---
type: docs
title: "Actors API 参考"
linkTitle: "Actors API"
description: "关于 Actors API 的详细文档"
weight: 500
---

Dapr provides native, cross-platform, and cross-language virtual actor capabilities. Besides the [language specific SDKs]({{<ref sdks>}}), a developer can invoke an actor using the API endpoints below.

## User service code calling Dapr

### Invoke actor method

通过 Dapr 调用 actor 方法。

#### HTTP Request

```
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/method/<method>
```

#### HTTP 响应码

| Code | 说明                             |
| ---- | ------------------------------ |
| 200  | Request successful             |
| 500  | Request failed                 |
| XXX  | Status code from upstream call |

#### URL 参数

| Parameter   | 说明         |
| ----------- | ---------- |
| `daprPort`  | Dapr 端口    |
| `actorType` | Actor 类型。  |
| `actorId`   | Actor ID   |
| `method`    | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

使用 actor 调用方法的示例:

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

***请注意，该具体操作取决于支持多项事务的状态存储组件。***

#### TTL

With the [`ActorStateTTL` feature enabled]({{< ref "support-preview-features.md" >}}), actor clients can set the `ttlInSeconds` field in the transaction metadata to have the state expire after that many seconds. If the `ttlInSeconds` field is not set, the state will not expire.

Keep in mind when building actor applications with this feature enabled; Currently, all actor SDKs will preserve the actor state in their local cache even after the state has expired. This means that the actor state will not be removed from the local cache if the TTL has expired until the actor is restarted or deactivated. This behaviour will be changed in a future release.

See the Dapr Community Call 80 recording for more details on actor state TTL.
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/kVpQYkGemRc?start=28" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
```

#### HTTP 响应码

| Code | 说明                 |
| ---- | ------------------ |
| 204  | Request successful |
| 400  | Actor not found    |
| 500  | 请求失败               |

#### URL 参数

| Parameter   | 说明        |
| ----------- | --------- |
| `daprPort`  | Dapr 端口   |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

> Note, the following example uses the `ttlInSeconds` field, which requires the [`ActorStateTTL` feature enabled]]({{< ref "support-preview-features.md" >}}).

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/state \
  -H "Content-Type: application/json" \
  -d '[
       {
         "operation": "upsert",
         "request": {
           "key": "key1",
           "value": "myData",
           "metadata": {
             "ttlInSeconds": "3600"
           }
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

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 204  | 找不到键值，响应将为空        |
| 400  | Actor not found    |
| 500  | 请求失败               |

#### URL 参数

| Parameter   | 说明        |
| ----------- | --------- |
| `daprPort`  | Dapr 端口   |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |
| `key`       | 状态的键      |

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

### 创建 actor reminder

为 actor 创建一个持久化的 reminder。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### Reminder request body

JSON 对象将具有以下字段：

| Field     | 说明                                                                                                                                       |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `dueTime` | Specifies the time after which the reminder is invoked. Its format should be [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) |
| `period`  | 指定不同调用之间的时间间隔。 格式应该为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 或者 ISO 8601 持续时间格式并带有一个可选的重复调用参数。                       |

`period` 字段支持 `time.Duration` 格式和 ISO 8601 格式，但有一些限制。 对于 `period`, 仅支持 ISO 8601 持续时间格式 `Rn/PnYnMnWnDTnHnMnS`。 `Rn/` 指定 Reminder 将会被调用 `n` 次。

- `n` should be a positive integer greater than 0.
- If certain values are 0, the `period` can be shortened; for example, 10 seconds can be specified in ISO 8601 duration as `PT10S`.

如果未指定 `Rn/`，Reminder 将会无限次的运行，直到删除。

以下指定 `dueTime` 为 3 秒， period 为 7 秒。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为 0 表示立即执行。 以下正文是指立即执行，然后每 9 秒钟再执行一次。

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

要将 reminders 配置为仅触发一次，应将 period 设置为空字符串。 以下指定一个 `dueTime` 3 秒，period 为空字符串，这意味着 reminders 将在 3 秒后立即执行，然后永远不会再次触发。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":""
}
```

#### HTTP Response Codes

| Code | 说明                  |
| ---- | ------------------- |
| 204  | Request successful  |
| 500  | Request failed      |
| 400  | 未找到 Actor 或格式不正确的请求 |

#### URL 参数

| Parameter   | 说明                 |
| ----------- | ------------------ |
| `daprPort`  | Dapr 端口            |
| `actorType` | Actor 类型。          |
| `actorId`   | Actor ID           |
| `name`      | 要创建 reminders 的名称。 |

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

### 获取 actor reminder

获取 actor 的 reminder。

#### HTTP Request

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |

#### URL 参数

| Parameter   | 说明                |
| ----------- | ----------------- |
| `daprPort`  | Dapr 端口           |
| `actorType` | Actor 类型。         |
| `actorId`   | Actor ID          |
| `name`      | 要获取 reminder 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  "Content-Type: application/json"
```

以上命令将返回 reminder:

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### 删除 actor reminders

删除 actor 的 reminder。

#### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 204  | Request successful |
| 500  | Request failed     |

#### URL 参数

| Parameter   | 说明                |
| ----------- | ----------------- |
| `daprPort`  | Dapr 端口           |
| `actorType` | Actor 类型。         |
| `actorId`   | Actor ID          |
| `name`      | 要删除 reminder 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json"
```

### 创建 Actor timer

为 actor 创建 timer。

#### HTTP Request

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### Timer request body:
The format for the timer request body is the same as for [actor reminders]({{< ref "#reminder-request-body" >}}). For example:

以下指定 `dueTime` 为 3 秒， period 为 7 秒。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为 0 表示立即执行。  以下正文是指立即执行，然后每 9 秒钟再执行一次。

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

#### HTTP Response Codes

| Code | 说明                  |
| ---- | ------------------- |
| 204  | Request successful  |
| 500  | Request failed      |
| 400  | 未找到 Actor 或格式不正确的请求 |

#### URL 参数

| Parameter   | 说明             |
| ----------- | -------------- |
| `daprPort`  | Dapr 端口        |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `name`      | 要创建 timer 的名称。 |

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

### 删除 Actor timer

删除 actor 的 timer。

#### HTTP Request

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 204  | Request successful |
| 500  | Request failed     |

#### URL 参数

| Parameter   | 说明             |
| ----------- | -------------- |
| `daprPort`  | Dapr 端口        |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `name`      | 要删除 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr 调用业务的应用服务

### 获取注册的 Actors

获取此应用程序注册的 Actors 类型和 Dapr actor 配置。

#### HTTP Request

```
GET http://localhost:<appPort>/dapr/config
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |

#### URL 参数

| Parameter | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### 示例

获取注册的 Actor 的示例:

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

以上命令返回配置 ( 所有字段都是可选的):

| Parameter                 | 说明                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| `entities`                | The actor types this app supports.                                                                       |
| `actorIdleTimeout`        | 指定在释放空闲 actor 之前要等待的时间。  如果没有 actor 方法被调用，并且没有触发任何 reminders ，那么 actor 将处于空闲状态。                          |
| `actorScanInterval`       | 指定扫描 actors 以释放空闲 actor 的频率时间间隔。  空闲时间超过 actorIdleTimeout 的 Actor 将被停用。                                  |
| `drainOngoingCallTimeout` | 在进行安全排干 actors 时的超时时间。  该值指定了在排干发生时，最长能等待active方法完成的时间。  如果没有当前 actor 方法被调用，那么将忽略此时间。                    |
| `drainRebalancedActors`   | 布尔值。  如果为 true ，那么 Dapr 将等待 `drainOngoingCallTimeout` 以允许当前 actor 调用完成，然后再尝试停用 actor。  如果为 false ，则不会等待。 |
| `可重入性`                    | 一个配置对象，包含actor重入的选项。                                                                                     |
| `enabled`                 | 启用可重入所需的重入配置中的标志。                                                                                        |
| `maxStackDepth`           | 可重入配置中的一个值，用于控制对同一actor进行多少次可重入调用。                                                                       |
| `entitiesConfig`          | 允许每个actor类型设置的实体配置数组。 此处定义的任何配置都必须具有映射回根级实体的实体。                                                          |


{{% alert title="Note" color="primary" %}}
Actor settings in configuration for timeouts and intervals use [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) format. You can use string formats to represent durations. For example:
- `1h30m` or `1.5h`: A duration of 1 hour and 30 minutes
- `1d12h`: A duration of 1 day and 12 hours
- `500ms`: A duration of 500 milliseconds
- `-30m`: A negative duration of 30 minutes

{{% /alert %}}

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

#### HTTP Request

```
DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 400  | Actor not found    |
| 500  | Request failed     |

#### URL 参数

| Parameter   | 说明        |
| ----------- | --------- |
| `appPort`   | 应用程序端口    |
| `actorType` | Actor 类型。 |
| `actorId`   | Actor ID  |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下示例停用 `actorId` 为 50 类型为`stormtrooper` 的Actor。

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

用指定的 `methodName` 调用 Actor 的方法，其中：

- Parameters to the method are passed in the body of the request message.
- 返回值在响应消息的正文中提供。

如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/<methodName>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |
| 404  | Actor not found    |

#### URL 参数

| Parameter    | 说明         |
| ------------ | ---------- |
| `appPort`    | 应用程序端口     |
| `actorType`  | Actor 类型。  |
| `actorId`    | Actor ID   |
| `methodName` | 要调用的方法的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用方法 `performAction`。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### 调用 reminder

调用具有指定的 reminderName 的 actor 的 reminder。 如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/remind/<reminderName>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |
| 404  | Actor not found    |

#### URL 参数

| Parameter      | 说明                |
| -------------- | ----------------- |
| `appPort`      | 应用程序端口            |
| `actorType`    | Actor 类型。         |
| `actorId`      | Actor ID          |
| `reminderName` | 要调用 reminder 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用方法 `checkRebels`。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用 timer

为具有指定 `timerName` 的 actor 调用 timer。 如果 actor 尚未运行，那么应用程序方应先[激活](#activating-an-actor)它。

#### HTTP Request

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/timer/<timerName>
```

#### HTTP Response Codes

| Code | 说明                 |
| ---- | ------------------ |
| 200  | Request successful |
| 500  | Request failed     |
| 404  | Actor not found    |

#### URL 参数

| Parameter   | 说明             |
| ----------- | -------------- |
| `appPort`   | 应用程序端口         |
| `actorType` | Actor 类型。      |
| `actorId`   | Actor ID       |
| `timerName` | 要调用 timer 的名称。 |

> 注意：所有的 URL 参数都是大小写敏感的。

#### 示例

以下的示例在类型为 `stormtrooper`，`actorId` 为50的Actor上调用timer方法 `checkRebels`。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

探测应用程序以响应向 Dapr 发送的信号，用于表征该应用程序运行正常与否。 除了 `200` 以外的任何其他响应状态代码将被视为不健康的响应。

不需要响应主体。

#### HTTP Request

```
GET http://localhost:<appPort>/healthz
```

#### HTTP Response Codes

| Code | 说明       |
| ---- | -------- |
| 200  | 应用程序是健康的 |

#### URL 参数

| Parameter | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### 示例

从应用程序获取健康检查响应的示例：

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 Actor

在概念上，激活 actor 意味着创建 actor 的对象并将 actor 添加到跟踪表。 [查看.NET SDK 中的示例](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199)。

## 外部查询 actor 状态

为了启用对 actor 状态的可见性并允许复杂的方案（如状态聚合），Dapr 在外部状态存储（如数据库）中保存 actor 状态。 因此，可以通过组成正确的键或查询来外部查询 actor 状态。

由 Dapr 为 Actor 创建的状态名称空间由以下项组成:

- App ID: Represents the unique ID given to the Dapr application.
- Actor Type: 表示 actor 的类型。
- Actor ID: 代表 actor 类型的 actor 实例的唯一ID。
- Key: 特定状态值的键。 An actor ID can hold multiple state keys.

下面的例子展示了如何为 `myapp` App ID命名空间下的actor实例的状态构建一个Key。

`myapp||cat||hobbit||food`

在以上示例中，我们在 `myapp` 的应用标识名称空间下，为 actor ID 为 `hobbit` ( actor 类型为 `cat`) 获取状态键 `food`的值。
