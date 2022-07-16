---
type: docs
title: "Pub/sub API 参考"
linkTitle: "Pub/Sub API"
description: "有关发布/订阅 API 的详细文档"
weight: 300
---

## 将消息发布到给定主题

此终结点允许您将数据发布到正在侦听 `topic` 的多个消费者。 Dapr 保证此端点的至少一次语义。

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

`Content-Type` 标头告诉 Dapr 在构建 CloudEvent 信封时，您的数据遵循哪种内容类型。 `Content-Type` 标头值在填充 CloudEvent 中的 `datacontenttype` 字段。

不指定情况下， Dapr内容类型为 `text/plain`。 如果内容类型为 JSON，请使用值为 `application/json`的 `Content-Type` 标头。

如果要发送自己的自定义 CloundEvent，请使用 `application/cloudevents+json` 作为 `Content-Type` 标头值。

#### 元数据

元数据可以通过请求 URL 中的查询参数发送。 必须以 `metadata.` 为前缀，如下所示。

| 参数                      | 说明                                                                           |
| ----------------------- | ---------------------------------------------------------------------------- |
| `metadata.ttlInSeconds` | 消息过期的秒数，如 [此处所述]({{< ref pubsub-message-ttl.md >}})                          |
| `metadata.rawPayload`   | 此为布尔值，用于确定 Dapr 是否应发布事件而不将其包装为 CloudEvent， [此处所述]({{< ref pubsub-raw.md >}}) |

> 其他元数据参数基于每个 pubsub 组件都是可用的。

## 可选应用程序（用户代码）路由

### 为 Dapr 提供发现 topic 订阅的路由

Dapr 将在用户代码上调用以下终结点以发现 topic 订阅：

#### HTTP 请求

```
GET http://localhost:<appPort>/dapr/subscribe
```

#### URL 参数

| 参数        | 说明     |
| --------- | ------ |
| `appPort` | 应用程序端口 |

#### HTTP 响应正文

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

> 请注意，所有订阅参数都是大小写敏感的。

#### 元数据

（可选）元数据可以通过请求正文发送。

| 参数           | 说明                                                              |
| ------------ | --------------------------------------------------------------- |
| `rawPayload` | 为布尔值，用于订阅不符合 CloudEvent 规范的事件，[此处所述]({{< ref pubsub-raw.md >}}) |

### 为 Dapr 提供发布 topic 事件的路由

为了发布 topic 事件，将使用订阅响应中指定的路由对用户代码进行 `POST` 调用。

下面的例子说明了这一点，考虑 topic 为 `newOrder`，路由为 `orders`，端口为 3000 的订阅： `POST http://localhost:3000/orders`

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

#### 预期响应

HTTP 2xx 响应表示消息处理成功。

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

| HTTP Status | 说明                                              |
| ----------- | ----------------------------------------------- |
| 2xx         | 消息按照有效载荷中的状态进行处理（如果为空为`SUCCESS` ；如果无效的有效载荷则忽略）。 |
| 404         | 错误被记录下来，信息被删除                                   |
| other       | 警告被记录并重试消息                                      |

## 消息信封

Dapr Pub/Sub 遵循 CloudEvents 1.0 版。

## 相关链接

* [如何发布和消费主题]({{< ref howto-publish-subscribe.md >}})
* [发布/订阅示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)
