---
type: docs
title: "Publishing & subscribing messages with Cloudevents"
linkTitle: "Messages with Cloudevents"
weight: 2100
description: "Learn why Dapr uses CloudEvents, how they work in Dapr pub/sub, and how to create CloudEvents."
---

为了启用消息路由并为每条消息提供其他上下文，Dapr 使用 [cloudEvents 1.0](https://github.com/cloudevents/spec/tree/v1.0) 规范作为其消息格式。 Any message sent by an application to a topic using Dapr is automatically wrapped in a CloudEvents envelope, using the [`Content-Type` header value]({{< ref "pubsub-overview.md#content-types" >}}) for `datacontenttype` attribute.

Dapr 使用 CloudEvents 为事件负载提供额外的上下文，从而启用以下功能：

- 追踪
- 按消息 Id 进行重复数据删除
- Content-type for proper deserialization of event data

## CloudEvents example

Dapr implements the following CloudEvents fields when creating a message topic.

- `id`
- `source`
- `specversion`
- `type`
- `traceparent`
- `datacontenttype` (optional)

以下示例演示了 Dapr 发送的 `orders` 主题的消息，其中包括消息独有的 W3C `traceid` 、 `data` 以及将数据内容序列化为 JSON 的 CloudEvent 的字段。

```json
{
    "topic": "orders",
    "pubsubname": "order_pub_sub",
    "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
    "tracestate": "",
    "data": {
    "orderId": 1
    },
    "id": "5929aaac-a5e2-4ca1-859c-edfe73f11565",
    "specversion": "1.0",
    "datacontenttype": "application/json; charset=utf-8",
    "source": "checkout",
    "type": "com.dapr.event.sent",
    "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

As another example of a v1.0 CloudEvent, the following shows data as XML content in a CloudEvent message serialized as JSON:

```json
{
    "specversion" : "1.0",
    "type" : "xml.message",
    "source" : "https://example.com/message",
    "subject" : "Test XML Message",
    "id" : "id-1234-5678-9101",
    "time" : "2020-09-23T06:23:21Z",
    "datacontenttype" : "text/xml",
    "data" : "<note><to>User1</to><from>user2</from><message>hi</message></note>"
}
```

## Publish your own CloudEvent

如果您想使用自己自定义的 CloudEvent，请确保指定[`datacontenttype`]({{< ref "pubsub-overview.md#setting-message-content-types" >}}) 为 `application/cloudevents+json`.

### 示例

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

Publish a CloudEvent to the `orders` topic:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 了解为什么您可能 [不需要使用CloudEvents]({{< ref pubsub-raw.md >}})
- 尝试 [发布/订阅快速入门]({{< ref pubsub-quickstart.md >}})
- Pub/sub组件是可扩展的， [这里]({{< ref setup-pubsub >}})有支持的pub/sub组件列表，实现可以在[components-contrib repo](https://github.com/dapr/components-contrib)中找到。
- 阅读 [API 引用]({{< ref pubsub_api.md >}})

