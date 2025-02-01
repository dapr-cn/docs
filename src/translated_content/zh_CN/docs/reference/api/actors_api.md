---
type: docs
title: "Actors API 参考"
linkTitle: "Actors API"
description: "关于 actor API 的详细文档"
weight: 600
---

Dapr 提供了原生、跨平台和跨语言的虚拟 actor 功能。
除了[特定语言的 SDK]({{<ref sdks>}})，开发者还可以使用以下 API 端点来调用 actor。

## 用户服务代码调用 Dapr

### 调用 actor 方法

使用 Dapr 调用 actor 方法。

#### HTTP 请求

```
POST/GET/PUT/DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/method/<method>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败
XXX  | 上游调用的状态码

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`method` | 要调用的方法名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

调用 actor 上的方法示例：

```shell
curl -X POST http://localhost:3500/v1.0/actors/stormtrooper/50/method/shoot \
  -H "Content-Type: application/json"
```

您可以在请求体中提供方法参数和值，例如在 curl 中使用 `-d "{\"param\":\"value\"}"`。调用带参数的 actor 方法示例：

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d '{
        "destination": "Hoth"
      }'
```

或

```shell
curl -X POST http://localhost:3500/v1.0/actors/x-wing/33/method/fly \
  -H "Content-Type: application/json" \
  -d "{\"destination\":\"Hoth\"}"
```

远程端点的响应（方法返回值）将包含在响应体中。

### actor 状态事务

以多项事务的方式持久化 actor 状态的更改。

***请注意，此操作依赖于支持多项事务的状态存储组件。***

#### TTL

启用 [`ActorStateTTL` 功能]({{< ref "support-preview-features.md" >}})后，actor 客户端可以在事务元数据中设置 `ttlInSeconds` 字段，以便状态在指定秒数后过期。如果未设置 `ttlInSeconds` 字段，状态将不会过期。

在构建启用此功能的 actor 应用程序时请记住；目前，所有 actor SDK 都会在本地缓存中保留 actor 状态，即使状态已过期。这意味着即使 TTL 已过期，actor 状态也不会从本地缓存中移除，直到 actor 重新启动或停用。此行为将在未来版本中更改。

有关 actor 状态 TTL 的更多详细信息，请参阅 Dapr 社区电话会议 80 的录音。
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/kVpQYkGemRc?start=28" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/state
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 请求成功
400  | 未找到 actor
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。

> 注意，所有 URL 参数区分大小写。

#### 示例

> 注意，以下示例使用了 `ttlInSeconds` 字段，这需要启用 [`ActorStateTTL` 功能]({{< ref "support-preview-features.md" >}})。

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

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
204  | 未找到键，响应将为空
400  | 未找到 actor
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`key` | 状态值的键。

> 注意，所有 URL 参数区分大小写。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/state/location \
  -H "Content-Type: application/json"
```

上述命令返回状态：

```json
{
  "location": "Alderaan"
}
```

### 创建 actor 提醒

为 actor 创建一个持久化的提醒。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### 提醒请求体

一个包含以下字段的 JSON 对象：

| 字段 | 描述 |
|-------|--------------|
| `dueTime` | 指定提醒被调用的时间。其格式应为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration)
| `period` | 指定不同调用之间的周期。其格式应为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 或带有可选重复的 ISO 8601 持续时间格式。
| `ttl` | 设置计时器或提醒将在何时或间隔后过期并被删除。其格式应为 [time.ParseDuration 格式](https://pkg.go.dev/time#ParseDuration)、RFC3339 日期格式或 ISO 8601 持续时间格式。
| `data` | 一个字符串值，可以是任何相关内容。内容在提醒过期时返回。例如，这可能用于返回 URL 或与内容相关的任何内容。

`period` 字段支持 `time.Duration` 格式和 ISO 8601 格式，但有一些限制。对于 `period`，仅支持 ISO 8601 持续时间格式 `Rn/PnYnMnWnDTnHnMnS`。`Rn/` 指定提醒将被调用 `n` 次。

- `n` 应为大于 0 的正整数。
- 如果某些值为 0，则可以缩短 `period`；例如，10 秒可以在 ISO 8601 持续时间中指定为 `PT10S`。

如果未指定 `Rn/`，则提醒将无限次运行，直到被删除。

如果仅设置了 `ttl` 和 `dueTime`，则提醒将被接受。然而，只有 `dueTime` 生效。例如，提醒在 `dueTime` 触发，`ttl` 被忽略。

如果设置了 `ttl`、`dueTime` 和 `period`，则提醒首先在 `dueTime` 触发，然后根据 `period` 和 `ttl` 重复触发并过期。

以下示例指定了 3 秒的 `dueTime` 和 7 秒的周期。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为 0 表示立即触发。以下请求体表示立即触发，然后每 9 秒触发一次。

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

要配置提醒仅触发一次，周期应设置为空字符串。以下指定了 3 秒的 `dueTime` 和空字符串的周期，这意味着提醒将在 3 秒后触发，然后不再触发。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":""
}
```

当您在 `period` 和 `ttl` 中同时指定重复次数时，当任一条件满足时，计时器/提醒将停止。以下示例中，计时器的 `period` 为 3 秒（ISO 8601 持续时间格式），`ttl` 为 20 秒。此计时器在注册后立即触发，然后每 3 秒触发一次，持续 20 秒，之后由于 `ttl` 满足而不再触发。

```json
{
  "period":"PT3S",
  "ttl":"20s"
}
```

需要对数据进行描述。

```json
{
  "data": "someData",
  "dueTime": "1m",
  "period": "20s"
}
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 请求成功
500  | 请求失败
400  | 未找到 actor 或请求格式错误

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`name` | 要创建的提醒名称。

> 注意，所有 URL 参数区分大小写。

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

### 获取 actor 提醒

获取 actor 的提醒。

#### HTTP 请求

```
GET http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`name` | 要获取的提醒名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

```shell
curl http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  "Content-Type: application/json"
```

上述命令返回提醒：

```json
{
  "dueTime": "1s",
  "period": "5s",
  "data": "0",
}
```

### 删除 actor 提醒

删除 actor 的提醒。

#### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/reminders/<name>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 请求成功
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`name` | 要删除的提醒名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/reminders/checkRebels \
  -H "Content-Type: application/json"
```

### 创建 actor 计时器

为 actor 创建一个计时器。

#### HTTP 请求

```
POST/PUT http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### 计时器请求体：
计时器请求体的格式与[actor 提醒]({{< ref "#reminder-request-body" >}})相同。例如：

以下指定了 3 秒的 `dueTime` 和 7 秒的周期。

```json
{
  "dueTime":"0h0m3s0ms",
  "period":"0h0m7s0ms"
}
```

`dueTime` 为 0 表示立即触发。以下请求体表示立即触发，然后每 9 秒触发一次。

```json
{
  "dueTime":"0h0m0s0ms",
  "period":"0h0m9s0ms"
}
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 请求成功
500  | 请求失败
400  | 未找到 actor 或请求格式错误

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`name` | 要创建的计时器名称。

> 注意，所有 URL 参数区分大小写。

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

### 删除 actor 计时器

删除 actor 的计时器。

#### HTTP 请求

```
DELETE http://localhost:<daprPort>/v1.0/actors/<actorType>/<actorId>/timers/<name>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 请求成功
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`name` | 要删除的计时器名称。

> 注意，所有 URL 参数区分大小写。

```shell
curl -X DELETE http://localhost:3500/v1.0/actors/stormtrooper/50/timers/checkRebels \
  -H "Content-Type: application/json"
```

## Dapr 调用用户服务代码

### 获取注册的 actor

获取此应用程序的注册 actor 类型和 Dapr actor 配置设置。

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/config
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。

#### 示例

获取注册 actor 的示例：

```shell
curl -X GET http://localhost:3000/dapr/config \
  -H "Content-Type: application/json"
```

上述命令返回配置（所有字段都是可选的）：

参数 | 描述
----------|------------
`entities`  | 此应用程序支持的 actor 类型。
`actorIdleTimeout` | 指定在停用空闲 actor 之前等待的时间。如果没有 actor 方法调用且没有提醒触发，则 actor 为空闲状态。
`actorScanInterval` | 指定扫描以停用空闲 actor 的频率。空闲时间超过 actorIdleTimeout 的 actor 将被停用。
`drainOngoingCallTimeout` | 在重新平衡 actor 的过程中使用的持续时间。指定等待当前活动的 actor 方法完成的时间。如果没有当前的 actor 方法调用，则忽略此项。
`drainRebalancedActors` | 一个布尔值。如果为 true，Dapr 将等待 `drainOngoingCallTimeout` 以允许当前 actor 调用完成，然后再尝试停用 actor。如果为 false，则不等待。
`reentrancy` | 一个配置对象，包含 actor 重入的选项。
`enabled` | 重入配置中启用重入所需的标志。
`maxStackDepth` | 重入配置中控制对同一 actor 进行的重入调用次数的值。
`entitiesConfig` | 允许每个 actor 类型设置的实体配置数组。此处定义的任何配置都必须有一个映射回根级别实体的实体。

{{% alert title="注意" color="primary" %}}
配置中的 actor 设置的超时和间隔使用 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 格式。您可以使用字符串格式表示持续时间。例如：
- `1h30m` 或 `1.5h`：1 小时 30 分钟的持续时间
- `1d12h`：1 天 12 小时的持续时间
- `500ms`：500 毫秒的持续时间
- `-30m`：负 30 分钟的持续时间

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

通过将 actor 的实例持久化到具有指定 actorId 的状态存储中来停用 actor。

#### HTTP 请求

```
DELETE http://localhost:<appPort>/actors/<actorType>/<actorId>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
400  | 未找到 actor
500  | 请求失败

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。
`actorType` | actor 类型。
`actorId` | actor ID。

> 注意，所有 URL 参数区分大小写。

#### 示例

以下示例停用了具有 `actorId` 为 50 的 `stormtrooper` actor 类型。

```shell
curl -X DELETE http://localhost:3000/actors/stormtrooper/50 \
  -H "Content-Type: application/json"
```

### 调用 actor 方法

调用具有指定 `methodName` 的 actor 方法，其中：

- 方法的参数在请求消息体中传递。
- 返回值在响应消息体中提供。

如果 actor 尚未运行，应用程序端应[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/<methodName>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败
404  | 未找到 actor

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`methodName` | 要调用的方法名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

以下示例调用了具有 `actorId` 为 50 的 `stormtrooper` actor 类型的 `performAction` 方法。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/performAction \
  -H "Content-Type: application/json"
```

### 调用提醒

调用具有指定 reminderName 的 actor 提醒。如果 actor 尚未运行，应用程序端应[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/remind/<reminderName>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败
404  | 未找到 actor

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`reminderName` | 要调用的提醒名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

以下示例调用了具有 `actorId` 为 50 的 `stormtrooper` actor 类型的 `checkRebels` 提醒方法。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/remind/checkRebels \
  -H "Content-Type: application/json"
```

### 调用计时器

调用具有指定 `timerName` 的 actor 计时器。如果 actor 尚未运行，应用程序端应[激活](#activating-an-actor)它。

#### HTTP 请求

```
PUT http://localhost:<appPort>/actors/<actorType>/<actorId>/method/timer/<timerName>
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 请求成功
500  | 请求失败
404  | 未找到 actor

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。
`actorType` | actor 类型。
`actorId` | actor ID。
`timerName` | 要调用的计时器名称。

> 注意，所有 URL 参数区分大小写。

#### 示例

以下示例调用了具有 `actorId` 为 50 的 `stormtrooper` actor 类型的 `checkRebels` 计时器方法。

```shell
curl -X POST http://localhost:3000/actors/stormtrooper/50/method/timer/checkRebels \
  -H "Content-Type: application/json"
```

### 健康检查

探测应用程序以响应信号，通知 Dapr 应用程序健康且正在运行。
任何非 `200` 的响应状态码都将被视为不健康的响应。

响应体不是必需的。

#### HTTP 请求

```
GET http://localhost:<appPort>/healthz
```

#### HTTP 响应代码

代码 | 描述
---- | -----------
200  | 应用程序健康

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口。

#### 示例

从应用程序获取健康检查响应的示例：

```shell
curl -X GET http://localhost:3000/healthz \
```

## 激活 actor

从概念上讲，激活 actor 意味着创建 actor 的对象并将 actor 添加到跟踪表中。[查看 .NET SDK 的示例](https://github.com/dapr/dotnet-sdk/blob/6c271262231c41b21f3ca866eb0d55f7ce8b7dbc/src/Dapr.Actors/Runtime/ActorManager.cs#L199)。

## 外部查询 actor 状态

为了使 actor 状态可见并允许复杂场景（如状态聚合），Dapr 将 actor 状态保存在外部状态存储中，例如数据库。因此，可以通过组合正确的键或查询来外部查询 actor 状态。

Dapr 为 actor 创建的状态命名空间由以下项目组成：

- 应用程序 ID：表示分配给 Dapr 应用程序的唯一 ID。
- actor 类型：表示 actor 的类型。
- actor ID：表示 actor 类型的 actor 实例的唯一 ID。
- 键：特定状态值的键。一个 actor ID 可以持有多个状态键。

以下示例显示了如何在 `myapp` 应用程序 ID 命名空间下构造 actor 实例状态的键：

`myapp||cat||hobbit||food`

在上述示例中，我们获取了 `myapp` 应用程序 ID 命名空间下，actor 类型为 `cat`，actor ID 为 `hobbit` 的状态键 `food` 的值。
