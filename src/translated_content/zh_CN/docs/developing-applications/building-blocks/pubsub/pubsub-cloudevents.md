---
type: docs
title: "使用 CloudEvents 进行消息传递"
linkTitle: "CloudEvents 消息传递"
weight: 2100
description: "了解 Dapr 使用 CloudEvents 的原因，它们在 Dapr 发布订阅中的工作原理，以及如何创建 CloudEvents。"
---

为了实现消息路由并为每条消息提供额外的上下文，Dapr 采用 [CloudEvents 1.0 规范](https://github.com/cloudevents/spec/tree/v1.0) 作为其消息格式。通过 Dapr 发送到主题的任何消息都会自动被包装在 CloudEvents 信封中，使用 [`Content-Type` 头部值]({{< ref "pubsub-overview.md#content-types" >}}) 作为 `datacontenttype` 属性。

Dapr 使用 CloudEvents 为事件负载提供额外的上下文，从而实现以下功能：

- 跟踪
- 事件数据的正确反序列化的内容类型
- 发送应用程序的验证

您可以选择以下三种方法之一通过发布订阅发布 CloudEvent：

1. 发送一个发布订阅事件，然后由 Dapr 包装在 CloudEvent 信封中。
2. 通过覆盖标准 CloudEvent 属性来替换 Dapr 提供的特定 CloudEvents 属性。
3. 将您自己的 CloudEvent 信封作为发布订阅事件的一部分编写。

## Dapr 生成的 CloudEvents 示例

向 Dapr 发送发布操作会自动将其包装在一个包含以下字段的 CloudEvent 信封中：

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

以下示例演示了 Dapr 为发布到 `orders` 主题的操作生成的 CloudEvent，其中包括：
- 一个 W3C `traceid`，唯一标识消息
- `data` 和 CloudEvent 的字段，其中数据内容被序列化为 JSON

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

作为另一个 v1.0 CloudEvent 的示例，以下显示了在 CloudEvent 消息中以 JSON 序列化的 XML 内容的数据：

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

Dapr 自动生成多个 CloudEvent 属性。您可以通过提供以下可选元数据键/值来替换这些生成的 CloudEvent 属性：

- `cloudevent.id`: 覆盖 `id`
- `cloudevent.source`: 覆盖 `source`
- `cloudevent.type`: 覆盖 `type`
- `cloudevent.traceid`: 覆盖 `traceid`
- `cloudevent.tracestate`: 覆盖 `tracestate`
- `cloudevent.traceparent`: 覆盖 `traceparent`

使用这些元数据属性替换 CloudEvents 属性的能力适用于所有发布订阅组件。

### 示例

例如，要替换代码中[上述 CloudEvent 示例]({{< ref "#cloudevents-example" >}})中的 `source` 和 `id` 值：

{{< tabs "Python" ".NET" >}}
 <!-- Python -->
{{% codetab %}}

```python
with DaprClient() as client:
    order = {'orderId': i}
    # 使用 Dapr 发布订阅发布事件/消息
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

// 覆盖 cloudevent 元数据
var metadata = new Dictionary<string,string>() {
    { "cloudevent.source", "payment" },
    { "cloudevent.id", "d99b228f-6c73-4e78-8c4d-3f80a043d317" }
}

// 使用 Dapr 发布订阅发布事件/消息
await client.PublishEventAsync("order_pub_sub", "orders", order, metadata);
Console.WriteLine("Published data: " + order);

await Task.Delay(TimeSpan.FromSeconds(1));
```

{{% /codetab %}}

{{< /tabs >}}

然后 JSON 负载反映新的 `source` 和 `id` 值：

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

{{% alert title="重要" color="warning" %}}
虽然您可以替换 `traceid`/`traceparent` 和 `tracestate`，但这样做可能会干扰事件跟踪并在跟踪工具中报告不一致的结果。建议使用 Open Telemetry 进行分布式跟踪。[了解更多关于分布式跟踪的信息。]({{< ref tracing-overview.md >}})  

{{% /alert %}}

## 发布您自己的 CloudEvent

如果您想使用自己的 CloudEvent，请确保将 [`datacontenttype`]({{< ref "pubsub-overview.md#setting-message-content-types" >}}) 指定为 `application/cloudevents+json`。

如果应用程序编写的 CloudEvent 不包含 CloudEvent 规范中[最低要求的字段](https://github.com/cloudevents/spec/blob/v1.0.2/cloudevents/spec.md#required-attributes)，则消息将被拒绝。如果缺少，Dapr 会将以下字段添加到 CloudEvent 中：

- `time`
- `traceid`
- `traceparent`
- `tracestate`
- `topic`
- `pubsubname`
- `source`
- `type`
- `specversion`

您可以向自定义 CloudEvent 添加不属于官方 CloudEvent 规范的其他字段。Dapr 将按原样传递这些字段。

### 示例

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

发布一个 CloudEvent 到 `orders` 主题：

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{\"orderId\": \"100\"}'
```

{{% /codetab %}}

{{% codetab %}}

发布一个 CloudEvent 到 `orders` 主题：

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```

{{% /codetab %}}

{{% codetab %}}

发布一个 CloudEvent 到 `orders` 主题：

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

## 事件去重

使用 Dapr 创建的 CloudEvents 时，信封中包含一个 `id` 字段，应用程序可以使用该字段执行消息去重。Dapr 不会自动进行去重处理。Dapr 支持使用本身具备消息去重功能的消息代理。

## 下一步

- 了解为什么您可能[不想使用 CloudEvents]({{< ref pubsub-raw.md >}})
- 试用 [发布订阅快速入门]({{< ref pubsub-quickstart.md >}})
- [发布订阅组件列表]({{< ref setup-pubsub >}})
- 阅读 [API 参考]({{< ref pubsub_api.md >}})
