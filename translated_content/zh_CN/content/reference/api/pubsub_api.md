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
| `daprPort`   | The Dapr port                                    |
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

Unless specified, Dapr assumes `text/plain`. If your content type is JSON, use a `Content-Type` header with the value of `application/json`.

If you want to send your own custom CloudEvent, use the `application/cloudevents+json` value for the `Content-Type` header.

#### Metadata

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.`, as shown below.

| 参数                      | 说明                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | The number of seconds for the message to expire, as [described here]({{< ref pubsub-message-ttl.md >}})                                 |
| `metadata.rawPayload`   | Boolean to determine if Dapr should publish the event without wrapping it as CloudEvent, as [described here]({{< ref pubsub-raw.md >}}) |

> 其他元数据参数基于每个 pubsub 组件都是可用的。

## 可选应用程序（用户代码）路由

### 为 Dapr 提供发现 topic 订阅的路由

Dapr will invoke the following endpoint on user code to discover topic subscriptions:

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

#### Metadata

Optionally, metadata can be sent via the request body.

| 参数           | 说明                                                              |
| ------------ | --------------------------------------------------------------- |
| `rawPayload` | 为布尔值，用于订阅不符合 CloudEvent 规范的事件，[此处所述]({{< ref pubsub-raw.md >}}) |

### 为 Dapr 提供发布 topic 事件的路由

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response.

The following example illustrates this point, considering a subscription for topic `newOrder` with route `orders` on port 3000: `POST http://localhost:3000/orders`

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

An HTTP 2xx response denotes successful processing of message.

For richer response handling, a JSON-encoded payload body with the processing status can be sent:

```json
{
  "status": "<status>"
}
```

| 状态        | 说明                                       |
| --------- | ---------------------------------------- |
| `SUCCESS` | Message is processed successfully        |
| `RETRY`   | Message to be retried by Dapr            |
| `DROP`    | Warning is logged and message is dropped |
| Others    | Error, message to be retried by Dapr     |

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
