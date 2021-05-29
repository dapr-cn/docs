---
type: docs
title: "Pub/sub API reference"
linkTitle: "Pub/Sub API"
description: "Detailed documentation on the pub/sub API"
weight: 300
---

## Publish a message to a given topic

This endpoint lets you publish data to multiple consumers who are listening on a `topic`. Dapr guarantees at least once semantics for this endpoint.

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

| 参数         | 说明                                               |
| ---------- | ------------------------------------------------ |
| daprPort   | dapr 端口。                                         |
| pubsubname | the name of pubsub component                     |
| topic      | the name of the topic                            |
| metadata   | query parameters for metadata as described below |

> 注意：所有的 URL 参数都是大小写敏感的。

```shell
curl -X POST http://localhost:3500/v1.0/publish/pubsubName/deathStarStatus \
  -H "Content-Type: application/json" \
 -d '{
       "status": "completed"
     }'
```

### Headers

The `Content-Type` header tells Dapr which content type your data adheres to when constructing a CloudEvent envelope. The value of the `Content-Type` header populates the `datacontenttype` field in the CloudEvent. Unless specified, Dapr assumes `text/plain`. If your content type is JSON, use a `Content-Type` header with the value of `application/json`.

If you want to send your own custom CloundEvent, use the `application/cloudevents+json` value for the `Content-Type` header.

#### 元数据（Metadata）

Metadata can be sent via query parameters in the request's URL. It must be prefixed with `metadata.` as shown below.

| 参数                    | 说明                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| metadata.ttlInSeconds | the number of seconds for the message to expire as [described here]({{< ref pubsub-message-ttl.md >}})                                 |
| metadata.rawPayload   | boolean to determine if Dapr should publish the event without wrapping it as CloudEvent as [described here]({{< ref pubsub-raw.md >}}) |

> Additional metadata parameters are available based on each pubsub component.

## Optional Application (User Code) Routes

### Provide a route for Dapr to discover topic subscriptions

Dapr will invoke the following endpoint on user code to discover topic subscriptions:

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL 参数

| 参数      | 说明     |
| ------- | ------ |
| appPort | 应用程序端口 |

#### HTTP Response body

A json encoded array of strings.

You can run Kafka locally using [this](https://github.com/wurstmeister/kafka-docker) Docker image. To run without Docker, see the getting started guide [here](https://kafka.apache.org/quickstart).

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

#### 元数据（Metadata）

Optionally, metadata can be sent via the request body.

| 参数         | 说明                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------- |
| rawPayload | boolean to subscribe to events that do not comply with CloudEvent specification, as [described here]({{< ref pubsub-raw.md >}}) |

### Provide route(s) for Dapr to deliver topic events

In order to deliver topic events, a `POST` call will be made to user code with the route specified in the subscription response.

The following example illustrates this point, considering a subscription for topic `newOrder` with route `orders` on port 3000: `POST http://localhost:3000/orders`

#### HTTP 请求

```
POST http://localhost:<appPort>/<path>
```

> 注意：所有的 URL 参数都是大小写敏感的。

#### URL 参数

| 参数      | 说明                                             |
| ------- | ---------------------------------------------- |
| appPort | 应用程序端口                                         |
| path    | route path from the subscription configuration |

#### Expected HTTP Response

An HTTP 2xx response denotes successful processing of message. For richer response handling, a JSON encoded payload body with the processing status can be sent:

```json
{
  "status": "<status>"
}
```

| 状态      | 说明                                       |
| ------- | ---------------------------------------- |
| SUCCESS | message is processed successfully        |
| RETRY   | message to be retried by Dapr            |
| DROP    | warning is logged and message is dropped |
| Others  | error, message to be retried by Dapr     |

Dapr assumes a JSON encoded payload response without `status` field or an empty payload responses with HTTP 2xx, as `SUCCESS`.

The HTTP response might be different from HTTP 2xx, the following are Dapr's behavior in different HTTP statuses:

| HTTP Status | 说明                                                                                              |
| ----------- | ----------------------------------------------------------------------------------------------- |
| 2xx         | message is processed as per status in payload (`SUCCESS` if empty; ignored if invalid payload). |
| 404         | error is logged and message is dropped                                                          |
| other       | warning is logged and message to be retried                                                     |


## Message envelope

Dapr Pub/Sub adheres to version 1.0 of Cloud Events.

## 相关链接

* [How to publish to and consume topics]({{< ref howto-publish-subscribe.md >}})
* [Sample for pub/sub](https://github.com/dapr/quickstarts/tree/master/pub-sub)
