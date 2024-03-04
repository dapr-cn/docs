---
type: docs
title: "发布 & 订阅 Cloudevents 消息"
linkTitle: "Messages with Cloudevents"
weight: 2100
description: "了解 Dapr 为何使用 CloudEvents，它们如何在 Dapr 发布/订阅中工作，以及如何创建 CloudEvents。"
---

为了启用消息路由并为每条消息提供其他上下文，Dapr 使用 [cloudEvents 1.0](https://github.com/cloudevents/spec/tree/v1.0) 规范作为其消息格式。 应用程序使用 Dapr 发送到主题的任何消息都会自动包装在 CloudEvents 信封中，使用 [`Content-Type` 标头值]({{< ref "pubsub-overview.md#content-types" >}}) 为 `datacontenttype` 属性。

Dapr 使用 CloudEvents 为事件负载提供额外的上下文，从而启用以下功能：

- 追踪
- 用于正确反序列化事件数据的 Content-type
- 发送方应用程序的验证

您可以选择三种方法之一通过发布/订阅来发布 CloudEvent:

1. 发送一个发布/订阅事件，然后由 Dapr 封装在 CloudEvent 包裹中。
1. 通过覆盖标准 CloudEvent 属性，替换 Dapr 提供的特定 CloudEvents 属性。
1. 作为发布/订阅事件的一部分，编写自己的CloudEvent信封。

## Dapr生成的CloudEvents示例

自动将发布操作发送到 Dapr 时，会自动将其包装在一个包含以下字段的 CloudEvent 包裹中：

- `id`
- `source`
- `specversion`
- `type`
- `traceparent`
- `traceid`
- `tracestate`
- `topic`
- `pubsubname`
- `time`
- `datacontenttype` (可选)

以下示例演示了由Dapr生成的CloudEvent，用于发布操作到包含 `orders` 的主题：
- 一种唯一标识消息的 W3C `traceid`
- `data` 以及云事件的字段，其中数据内容被序列化为JSON

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
  "time": "2020-09-23T06:23:21Z",
  "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

作为v1.0 CloudEvent的另一个示例，以下展示了将数据作为XML内容以JSON序列化的CloudEvent消息:

```json
{
  "topic": "orders",
  "pubsubname": "order_pub_sub",
  "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
  "tracestate": "",
  "data" : "<note><to></to><from>user2</from><message>Order</message></note>",
  "id" : "id-1234-5678-9101",
  "specversion" : "1.0",
  "datacontenttype" : "text/xml",
  "subject" : "Test XML Message",
  "source" : "https://example.com/message",
  "type" : "xml.message",
   "time" : "2020-09-23T06:23:21Z"
}
```

## 替换 Dapr 生成的 CloudEvents 值

Dapr 会自动生成多个 CloudEvent 属性。 您可以通过提供以下可选的元数据键/值来替换这些生成的 CloudEvent 属性:

- `cloudevent.id`：重写 `id`
- `cloudevent.source`: 重写 `source`
- `cloudevent.type`：重写 `type`
- `cloudevent.traceid`：重写 `traceid`
- `cloudevent.tracestate`: 覆盖 `tracestate`
- `cloudevent.traceparent`：覆盖 `traceparent`

使用这些元数据属性替换CloudEvents属性的能力适用于所有发布/订阅组件。

### 示例

例如，要将 `source/code> 和 <code>id` 值从 [上面的 CloudEvent 示例]({{< ref "#cloudevents-example" >}}) 在代码中：

{{< tabs "Python" ".NET" >}}
 <!-- Python -->
{{% codetab %}}

```python
with DaprClient() as client:
    order = {'orderId': i}
    # Publish an event/message using Dapr PubSub
    result = client.publish_event(
        pubsub_name='order_pub_sub',
        topic_name='orders',
        publish_metadata={'cloudevent.id': 'd99b228f-6c73-4e78-8c4d-3f80a043d317', 'cloudevent.source': 'payment'}
    )
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

```csharp
var order = new Order(i);
using var client = new DaprClientBuilder().Build();

// Override cloudevent metadata
var metadata = new Dictionary<string,string>() {
    { "cloudevent.source", "payment" },
    { "cloudevent.id", "d99b228f-6c73-4e78-8c4d-3f80a043d317" }
}

// Publish an event/message using Dapr PubSub
await client.PublishEventAsync("order_pub_sub", "orders", order, metadata);
Console.WriteLine("Published data: " + order);

await Task.Delay(TimeSpan.FromSeconds(1));
```

{{% /codetab %}}

{{< /tabs >}}


然后，JSON 有效负载会反映新的 `source` 和 `ID` 值：


```json
{
  "topic": "orders",
  "pubsubname": "order_pub_sub",
  "traceid": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01",
  "tracestate": "",
  "data": {
    "orderId": 1
  },
  "id": "d99b228f-6c73-4e78-8c4d-3f80a043d317",
  "specversion": "1.0",
  "datacontenttype": "application/json; charset=utf-8",
  "source": "payment",
  "type": "com.dapr.event.sent",
  "time": "2020-09-23T06:23:21Z",
  "traceparent": "00-113ad9c4e42b27583ae98ba698d54255-e3743e35ff56f219-01"
}
```

{{% alert title="Important" color="warning" %}}
虽然你可以将 `traceid`/`traceparent` 和 `tracestate`，否则可能会干扰跟踪事件，并在跟踪工具中报告不一致的结果。 推荐使用Open Telemetry进行分布式跟踪。 [了解有关分布式跟踪的更多信息。]({{< ref tracing-overview.md >}})

{{% /alert %}}


## 发布您自己的 CloudEvent

如果您想使用自己自定义的 CloudEvent，请确保指定[`datacontenttype`]({{< ref "pubsub-overview.md#setting-message-content-types" >}}) 为 `application/cloudevents+json`.

如果由应用程序创建的CloudEvent不包含CloudEvent规范中的 [个最低要求字段](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#required-attributes) ，则该消息将被拒绝。 如果缺少以下字段，Dapr将添加到CloudEvent中：

- `time`
- `traceid`
- `traceparent`
- `tracestate`
- `topic`
- `pubsubname`
- `source`
- `type`
- `specversion`

您可以向自定义 CloudEvent 添加不属于官方 CloudEvent 规范的附加字段。 Dapr 将按原样传递这些字段。

### 示例

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

将 CloudEvent 发布到 `orders` 主题：

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{\"orderId\": \"100\"}'
```

{{% /codetab %}}

{{% codetab %}}

将 CloudEvent 发布到 `orders` 主题：

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

将 CloudEvent 发布到 `orders` 主题：

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## 事件去重

使用 Dapr 创建的CloudEvent时，信封包含一个 `id` 字段，该字段可供应用程序用于执行消息重复数据删除。 Dapr 不会自动处理去重。 Dapr 支持使用原生支持消息去重的消息代理。

## 下一步

- 了解为什么您可能 [不需要使用CloudEvents]({{< ref pubsub-raw.md >}})
- 尝试 [发布/订阅快速入门]({{< ref pubsub-quickstart.md >}})
- [pub/sub 组件列表]({{< ref setup-pubsub >}})
- 阅读 [API 参考文档]({{< ref pubsub_api.md >}})

