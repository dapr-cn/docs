---
type: docs
title: "发布/订阅 API 参考"
linkTitle: "发布/订阅 API"
description: "关于发布/订阅 API 的详细文档"
weight: 200
---

## 向指定主题发布消息

此端点允许您将数据发布到多个正在监听某个 `topic` 的消费者。Dapr 保证此端点至少会被调用一次。

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>[?<metadata>]
```

### HTTP 响应代码

代码 | 描述
---- | -----------
204  | 消息已送达
403  | 访问控制禁止消息
404  | 未提供 pubsub 名称或主题
500  | 传递失败

### URL 参数

参数 | 描述
--------- | -----------
`daprPort` | Dapr 端口
`pubsubname` | pubsub 组件的名称
`topic` | 主题的名称
`metadata` | 查询参数，用于元数据，如下所述

> 注意，所有 URL 参数区分大小写。

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

### 头部

`Content-Type` 头部告知 Dapr 在构建 CloudEvent 信封时您的数据遵循哪种内容类型。`Content-Type` 头部的值填充 CloudEvent 中的 `datacontenttype` 字段。

除非指定，否则 Dapr 假定为 `text/plain`。如果您的内容类型是 JSON，请使用值为 `application/json` 的 `Content-Type` 头部。

如果您想发送自定义的 CloudEvent，请为 `Content-Type` 头部使用 `application/cloudevents+json` 值。

#### 元数据

元数据可以通过请求 URL 中的查询参数发送。它必须以 `metadata.` 为前缀，如下所示。

参数 | 描述
--------- | -----------
`metadata.ttlInSeconds` | 消息过期的秒数，如[此处所述]({{< ref pubsub-message-ttl.md >}})
`metadata.rawPayload` | 布尔值，决定 Dapr 是否应在不将事件包装为 CloudEvent 的情况下发布事件，如[此处所述]({{< ref pubsub-raw.md >}})

> 根据每个 pubsub 组件，还可以使用其他元数据参数。

## 向指定主题发布多条消息

此端点允许您将多条消息发布到正在监听某个 `topic` 的消费者。

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0-alpha1/publish/bulk/<pubsubname>/<topic>[?<metadata>]
```

请求体应包含一个 JSON 数组，其中包含：
- 唯一的条目 ID
- 要发布的事件
- 事件的内容类型

如果事件的内容类型不是 `application/cloudevents+json`，则会自动包装为 CloudEvent（除非 `metadata.rawPayload` 设置为 `true`）。

示例：

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/publish/bulk/pubsubName/deathStarStatus \
  -H 'Content-Type: application/json' \
  -d '[
        {
            "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
            "event":  "first text message",
            "contentType": "text/plain"
        },
        {
            "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
            "event":  {
                "message": "second JSON message"   
            },
            "contentType": "application/json"
        },
      ]'
```

### 头部

由于请求体是一个 JSON 数组，因此 `Content-Type` 头部应始终设置为 `application/json`。

### URL 参数

|**参数**|**描述**|
|--|--|
|`daprPort`|Dapr 端口|
|`pubsubname`|发布/订阅组件的名称|
|`topic`|主题的名称|
|`metadata`|[元数据]({{< ref "pubsub_api.md#metadata" >}})的查询参数|

### 元数据

元数据可以通过请求 URL 中的查询参数发送。它必须以 `metadata.` 为前缀，如下表所示。

|**参数**|**描述**|
|--|--|
|`metadata.rawPayload`|布尔值，决定 Dapr 是否应在不将消息包装为 CloudEvent 的情况下发布消息。|
|`metadata.maxBulkPubBytes`|批量发布请求中要发布的最大字节数。|

#### HTTP 响应

|**HTTP 状态**|**描述**|
|--|--|
|204|所有消息已送达|
|400|发布/订阅不存在|
|403|访问控制禁止|
|500|至少一条消息未能送达|

如果状态码为 500，响应体将包含一个 JSON 对象，其中包含未能送达的条目列表。例如，在我们上面的请求中，如果事件 `"first text message"` 的条目未能送达，响应将包含其条目 ID 和来自底层 pub/sub 组件的错误消息。

```json
{
  "failedEntries": [
    {
      "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
      "error": "some error message"
    },
  ],
  "errorCode": "ERR_PUBSUB_PUBLISH_MESSAGE"
}
```

## 可选应用程序（用户代码）路由

### 提供一个路由以供 Dapr 发现主题订阅

Dapr 将调用用户代码上的以下端点以发现主题订阅：

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口

#### HTTP 响应体

一个 JSON 编码的字符串数组。

示例：

```json
[
  {
    "pubsubname": "pubsub",
    "topic": "newOrder",
    "routes": {
      "rules": [
        {
          "match": "event.type == order",
          "path": "/orders"
        }
      ]
      "default" : "/otherorders"
    },
    "metadata": {
      "rawPayload": "true"
    }
  }
]
```

> 注意，所有订阅参数区分大小写。

#### 元数据

可选地，元数据可以通过请求体发送。

参数 | 描述
--------- | -----------
`rawPayload` | 布尔值，订阅不符合 CloudEvent 规范的事件，如[此处所述]({{< ref pubsub-raw.md >}})

### 提供路由以供 Dapr 传递主题事件

为了传递主题事件，将使用订阅响应中指定的路由对用户代码进行 `POST` 调用。在 `routes` 下，您可以提供[在接收到消息主题时匹配特定条件到特定路径的规则。]({{< ref "howto-route-messages.md" >}}) 您还可以为没有特定匹配的任何规则提供默认路由。

以下示例说明了这一点，考虑到主题 `newOrder` 的订阅和端口 3000 上的路由 `orders`：`POST http://localhost:3000/orders`

#### HTTP 请求

```
POST http://localhost:<appPort>/<path>
```

> 注意，所有 URL 参数区分大小写。

#### URL 参数

参数 | 描述
--------- | -----------
`appPort` | 应用程序端口
`path` | 订阅配置中的路由路径

#### 预期的 HTTP 响应

HTTP 2xx 响应表示消息处理成功。

为了更丰富的响应处理，可以发送一个带有处理状态的 JSON 编码的负载体：

```json
{
  "status": "<status>"
}
```

状态 | 描述
--------- | -----------
`SUCCESS` | 消息处理成功
`RETRY` | 消息由 Dapr 重试
`DROP` | 记录警告并丢弃消息
其他 | 错误，消息由 Dapr 重试

Dapr 假定没有 `status` 字段的 JSON 编码负载响应或带有 HTTP 2xx 的空负载响应为 `SUCCESS`。

HTTP 响应可能与 HTTP 2xx 不同。以下是 Dapr 在不同 HTTP 状态下的行为：

HTTP 状态 | 描述
--------- | -----------
2xx | 消息根据负载中的状态处理（如果为空则为 `SUCCESS`；如果负载无效则忽略）。
404 | 记录错误并丢弃消息
其他 | 记录警告并重试消息

## 从指定主题订阅多条消息

这允许您在监听某个 `topic` 时从代理订阅多条消息。

为了以批量方式接收主题订阅中的消息，应用程序：

- 需要在发送要订阅的主题列表时选择 `bulkSubscribe`
- 可选地，可以配置 `maxMessagesCount` 和/或 `maxAwaitDurationMs`
有关如何选择的更多详细信息，请参阅[批量发送和接收消息]({{< ref pubsub-bulk.md >}})指南。

#### 批量订阅的预期 HTTP 响应

HTTP 2xx 响应表示应用程序已处理此批量消息中的条目（单个消息），Dapr 现在将检查每个 EntryId 状态。
需要发送一个带有每个条目处理状态的 JSON 编码负载体：

```json
{
  "statuses": 
  [ 
    {
    "entryId": "<entryId1>",
    "status": "<status>"
    }, 
    {
    "entryId": "<entryId2>",
    "status": "<status>"
    } 
  ]
}
```

> 注意：如果 Dapr 在从应用程序接收到的响应中找不到 EntryId 状态，则该条目的状态被视为 `RETRY`。

状态 | 描述
--------- | -----------
`SUCCESS` | 消息处理成功
`RETRY` | 消息由 Dapr 重试
`DROP` | 记录警告并丢弃消息

HTTP 响应可能与 HTTP 2xx 不同。以下是 Dapr 在不同 HTTP 状态下的行为：

HTTP 状态 | 描述
--------- | -----------
2xx | 消息根据负载中的状态处理。
404 | 记录错误并丢弃所有消息
其他 | 记录警告并重试所有消息

## 消息信封

Dapr 发布/订阅遵循 [CloudEvents 1.0 版本](https://github.com/cloudevents/spec/blob/v1.0/spec.md)。

## 相关链接

* [如何发布和消费主题]({{< ref howto-publish-subscribe.md >}})
* [发布/订阅示例](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
