---
type: docs
title: "Pub/sub API reference"
linkTitle: "Pub/Sub API"
description: "Detailed documentation on the pub/sub API"
weight: 300
---

## Publish a message to a given topic

This endpoint lets you publish data to multiple consumers who are listening on a `topic`. Dapr 保证此端点的至少一次语义。

### HTTP 请求

```
POST http://localhost:<daprPort>/v1.0/publish/<pubsubname>/<topic>[?<metadata>]
```

### HTTP 响应码

| 代码  | 说明                                   |
| --- | ------------------------------------ |
| 204 | Message delivered                    |
| 403 | Message forbidden by access controls |
| 404 | No pubsub name or topic given        |
| 500 | Delivery failed                      |

### URL 参数

| 参数           | 说明            |
| ------------ | ------------- |
| `daprPort`   | Dapr 端口。      |
| `pubsubname` | Pubsub 组件的名称  |
| `topic`      | Topic 名称      |
| `metadata`   | 元数据的查询参数，如下所述 |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

### Headers

The `Content-Type` header tells Dapr which content type your data adheres to when constructing a CloudEvent envelope. `Content-Type` 标头值在填充 CloudEvent 中的 `datacontenttype` 字段。

Unless specified, Dapr assumes `text/plain`. If your content type is JSON, use a `Content-Type` header with the value of `application/json`.

如果要发送自己的自定义 CloundEvent，请使用 `application/cloudevents+json` 作为 `Content-Type` 标头值。

#### Metadata

Metadata can be sent via query parameters in the request's URL. 必须以 `metadata.` 为前缀，如下所示。

| 参数                      | 说明                                                                           |
| ----------------------- | ---------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | 消息过期的秒数，如 [此处所述]({{< ref pubsub-message-ttl.md >}})                          |
| `metadata.rawPayload`   | 此为布尔值，用于确定 Dapr 是否应发布事件而不将其包装为 CloudEvent， [此处所述]({{< ref pubsub-raw.md >}}) |

> Additional metadata parameters are available based on each pubsub component.

## Optional Application (User Code) Routes

### Provide a route for Dapr to discover topic subscriptions

Dapr will invoke the following endpoint on user code to discover topic subscriptions:

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL 参数

| 参数        | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### HTTP Response body

一个 json 编码的字符串数组。

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

> Note, all subscription parameters are case-sensitive.

#### Metadata

Optionally, metadata can be sent via the request body.

| 参数           | 说明                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `rawPayload` | boolean to subscribe to events that do not comply with CloudEvent specification, as [described here]({{< ref pubsub-raw.md >}}) |

### Provide route(s) for Dapr to deliver topic events

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response.

The following example illustrates this point, considering a subscription for topic `newOrder` with route `orders` on port 3000: `POST http://localhost:3000/orders`

#### HTTP 请求

```
POST http://localhost:<appPort>/<path>
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### URL 参数

| 参数        | 说明         |
| --------- | ---------- |
| `appPort` | 应用程序端口     |
| `path`    | 订阅配置中的路由路径 |

#### Expected HTTP Response

An HTTP 2xx response denotes successful processing of message.

对于更丰富的响应处理，可以发送具有处理状态的 JSON 编码有效负载正文：

```json
{
  "status": "<status>"
}
```

| 状态        | 说明              |
| --------- | --------------- |
| `SUCCESS` | 消息已成功处理         |
| `RETRY`   | 将由Dapr重试的消息     |
| `DROP`    | 警告被记录下来，信息被删除   |
| Others    | 错误，消息将由 Dapr 重试 |

Dapr 假定没有 `status` 字段的JSON编码的有效载荷响应或带有HTTP 2xx的空有效载荷响应为`SUCCESS`。

HTTP 响应可能与 HTTP 2xx 不同。 以下是 Dapr 在不同 HTTP 状态下的行为：

| HTTP Status | 说明                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------- |
| 2xx         | message is processed as per status in payload (`SUCCESS` if empty; ignored if invalid payload). |
| 404         | error is logged and message is dropped                                                          |
| other       | warning is logged and message to be retried                                                     |

## Message envelope

Dapr pub/sub adheres to version 1.0 of CloudEvents.

## 相关链接

* [How to publish to and consume topics]({{< ref howto-publish-subscribe.md >}})
* [Sample for pub/sub](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)
