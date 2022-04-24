---
type: docs
title: "Pub/sub API 参考"
linkTitle: "Pub/Sub API"
description: "有关发布/订阅 API 的详细文档"
weight: 300
---

## 将消息发布到给定主题

此终结点允许您将数据发布到正在侦听 `topic` 的多个消费者。 Dapr guarantees At-Least-Once semantics for this endpoint.

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>[?<metadata>]
```

### HTTP 响应码

| 代码  | 说明                      |
| --- | ----------------------- |
| 204 | 消息已发送                   |
| 403 | 消息被访问控制禁止               |
| 404 | 没有给定的 pubsubb 名称或 topic |
| 500 | 发送失败                    |

### URL 参数

| 参数           | 说明                                               |
| ------------ | ------------------------------------------------ |
| `daprPort`   | Dapr 端口。                                         |
| `pubsubname` | The name of pubsub component                     |
| `topic`      | The name of the topic                            |
| `metadata`   | Query parameters for metadata as described below |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

### Headers

`Content-Type` 标头告诉 Dapr 在构建 CloudEvent 信封时，您的数据遵循哪种内容类型。 The `Content-Type` header value populates the `datacontenttype` field in the CloudEvent.

不指定情况下， Dapr内容类型为 `text/plain`。 如果内容类型为 JSON，请使用值为 `application/json`的 `Content-Type` 标头。

If you want to send your own custom CloudEvent, use the `application/cloudevents+json` value for the `Content-Type` header.

#### 元数据

元数据可以通过请求 URL 中的查询参数发送。 It must be prefixed with `metadata.`, as shown below.

| 参数                      | 说明                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref pubsub-message-ttl.md >}})                                 |
| `metadata.rawPayload`   | Boolean to determine if Dapr should publish the event without wrapping it as CloudEvent, as [described here]({{< ref pubsub-raw.md >}}) |

> 其他元数据参数基于每个 pubsub 组件都是可用的。

## 可选应用程序（用户代码）路由

### 为 Dapr 提供发现 topic 订阅的路由

Dapr 将在用户代码上调用以下终结点以发现 topic 订阅：

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL 参数

| 参数        | 说明                   |
| --------- | -------------------- |
| `appPort` | The application port |

#### HTTP Response body

A JSON-encoded array of strings.

示例:

```json
[
  {
    "pubsubname": "pubsub",
    "topic": "newOrder",
    "route": "/orders",
    "metadata": {
      "rawPayload": "true",
    }
  }
]
```

> 请注意，所有订阅参数都是大小写敏感的。

#### 元数据

（可选）元数据可以通过请求正文发送。

| 参数           | 说明                                                              |
| ------------ | --------------------------------------------------------------- |
| `rawPayload` | 为布尔值，用于订阅不符合 CloudEvent 规范的事件，[此处所述]({{< ref pubsub-raw.md >}}) |

### 为 Dapr 提供发布 topic 事件的路由

为了发布 topic 事件，将使用订阅响应中指定的路由对用户代码进行 `POST` 调用。

下面的例子说明了这一点，考虑到 topic `newOrder` 的订阅，`orders` 的路由为端口3000 ： `POST http://localhost:3000/orders`

#### HTTP 请求

```
POST http://localhost:<appPort>/<path>
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### URL 参数

| 参数        | 说明                                             |
| --------- | ---------------------------------------------- |
| `appPort` | The application port                           |
| `path`    | Route path from the subscription configuration |

#### Expected HTTP Response

HTTP 2xx 响应表示消息处理成功。

For richer response handling, a JSON-encoded payload body with the processing status can be sent:

```json
{
  "status": "<status>"
}
```

| 状态        | 说明                                       |
| --------- | ---------------------------------------- |
| `SUCCESS` | Message is processed successfully        |
| `RETRY`   | 将由Dapr重试的消息                              |
| `DROP`    | Warning is logged and message is dropped |
| Others    | 错误，消息将由 Dapr 重试                          |

Dapr assumes that a JSON-encoded payload response without `status` field or an empty payload responses with HTTP 2xx is a `SUCCESS`.

The HTTP response might be different from HTTP 2xx. The following are Dapr's behavior in different HTTP statuses:

| HTTP Status | 说明                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------- |
| 2xx         | message is processed as per status in payload (`SUCCESS` if empty; ignored if invalid payload). |
| 404         | 错误被记录下来，信息被删除                                                                                   |
| other       | 警告被记录并重试消息                                                                                      |

## Message envelope

Dapr Pub/Sub adheres to version 1.0 of Cloud Events.

## 相关链接

* [如何发布和消费主题]({{< ref howto-publish-subscribe.md >}})
* [发布/订阅示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)
