---
type: docs
title: 发布和订阅批量消息
linkTitle: 发布和订阅批量消息
weight: 7100
description: 了解如何在 Dapr 中使用批量发布和订阅 API。
---

{{% alert title="alpha" color="warning" %}}批量发布和订阅API目前处于**alpha**阶段。
{{% /alert %}}

使用批量发布和订阅API，您可以在一个请求中发布和订阅多个消息。 当编写需要发送或接收大量消息的应用程序时，使用批量操作可以通过减少 Dapr sidecar、应用程序和底层发布/订阅代理之间的请求总数来实现高吞吐量。

## 批量发布消息

### 批量发布消息时的限制

批量发布API允许您在单个请求中发布多条消息到一个主题。 它是_非事务性_，即从一个单一的批量请求中，一些消息可以成功，一些消息可以失败。 如果任何消息发布失败，批量发布操作将返回一个失败消息列表。

批量发布操作也不能保证消息的顺序。

### 如何使用Dapr扩展来开发和运行Dapr应用程序



{{% codetab %}}

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.BulkPublishResponse;
import io.dapr.client.domain.BulkPublishResponseFailedEntry;
import java.util.ArrayList;
import java.util.List;

class BulkPublisher {
  private static final String PUBSUB_NAME = "my-pubsub-name";
  private static final String TOPIC_NAME = "topic-a";

  public void publishMessages() {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      // Create a list of messages to publish
      List<String> messages = new ArrayList<>();
      for (int i = 0; i < 10; i++) {
        String message = String.format("This is message #%d", i);
        messages.add(message);
      }

      // Publish list of messages using the bulk publish API
      BulkPublishResponse<String> res = client.publishEvents(PUBSUB_NAME, TOPIC_NAME, "text/plain", messages).block();
    }
  }
}
```



{{% codetab %}}

```typescript

import { DaprClient } from "@dapr/dapr";

const pubSubName = "my-pubsub-name";
const topic = "topic-a";

async function start() {
    const client = new DaprClient();

    // Publish multiple messages to a topic.
    await client.pubsub.publishBulk(pubSubName, topic, ["message 1", "message 2", "message 3"]);

    // Publish multiple messages to a topic with explicit bulk publish messages.
    const bulkPublishMessages = [
    {
      entryID: "entry-1",
      contentType: "application/json",
      event: { hello: "foo message 1" },
    },
    {
      entryID: "entry-2",
      contentType: "application/cloudevents+json",
      event: {
        specversion: "1.0",
        source: "/some/source",
        type: "example",
        id: "1234",
        data: "foo message 2",
        datacontenttype: "text/plain"
      },
    },
    {
      entryID: "entry-3",
      contentType: "text/plain",
      event: "foo message 3",
    },
  ];
  await client.pubsub.publishBulk(pubSubName, topic, bulkPublishMessages);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```



{{% codetab %}}

```csharp
using System;
using System.Collections.Generic;
using Dapr.Client;

const string PubsubName = "my-pubsub-name";
const string TopicName = "topic-a";
IReadOnlyList<object> BulkPublishData = new List<object>() {
    new { Id = "17", Amount = 10m },
    new { Id = "18", Amount = 20m },
    new { Id = "19", Amount = 30m }
};

using var client = new DaprClientBuilder().Build();

var res = await client.BulkPublishEventAsync(PubsubName, TopicName, BulkPublishData);
if (res == null) {
    throw new Exception("null response from dapr");
}
if (res.FailedEntries.Count > 0)
{
    Console.WriteLine("Some events failed to be published!");
    foreach (var failedEntry in res.FailedEntries)
    {
        Console.WriteLine("EntryId: " + failedEntry.Entry.EntryId + " Error message: " +
                          failedEntry.ErrorMessage);
    }
}
else
{
    Console.WriteLine("Published all events!");
}
```



{{% codetab %}}

```python
import requests
import json

base_url = "http://localhost:3500/v1.0-alpha1/publish/bulk/{}/{}"
pubsub_name = "my-pubsub-name"
topic_name = "topic-a"
payload = [
  {
    "entryId": "ae6bf7c6-4af2-11ed-b878-0242ac120002",
    "event": "first text message",
    "contentType": "text/plain"
  },
  {
    "entryId": "b1f40bd6-4af2-11ed-b878-0242ac120002",
    "event": {
      "message": "second JSON message"
    },
    "contentType": "application/json"
  }
]

response = requests.post(base_url.format(pubsub_name, topic_name), json=payload)
print(response.status_code)
```



{{% codetab %}}

```go
package main

import (
  "fmt"
  "strings"
  "net/http"
  "io/ioutil"
)

const (
  pubsubName = "my-pubsub-name"
  topicName = "topic-a"
  baseUrl = "http://localhost:3500/v1.0-alpha1/publish/bulk/%s/%s"
)

func main() {
  url := fmt.Sprintf(baseUrl, pubsubName, topicName)
  method := "POST"
  payload := strings.NewReader(`[
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
        }
]`)

  client := &http.Client {}
  req, _ := http.NewRequest(method, url, payload)

  req.Header.Add("Content-Type", "application/json")
  res, err := client.Do(req)
  // ...
}
```



{{% codetab %}}

```bash
curl -X POST http://localhost:3500/v1.0-alpha1/publish/bulk/my-pubsub-name/topic-a \
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



{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Uri 'http://localhost:3500/v1.0-alpha1/publish/bulk/my-pubsub-name/topic-a' `
-Body '[
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



{{< /tabs >}}

## 批量订阅消息

批量订阅API允许您在单个请求中从一个主题订阅多条消息。
正如我们从[如何：发布和订阅主题]({{< ref howto-publish-subscribe.md >}})中所了解的那样，有两种订阅主题的方式：

- **声明** - 订阅是在外部文件中定义的。
- **编程式** - 订阅在代码中定义。

要批量订阅主题，我们只需要使用`bulkSubscribe` spec属性，类似以下方式：

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  routes:
    default: /checkout
  pubsubname: order-pub-sub
  bulkSubscribe:
    enabled: true
    maxMessagesCount: 100
    maxAwaitDurationMs: 40
scopes:
- orderprocessing
- checkout
```

在上面的示例中，`bulkSubscribe`是_可选的_。 如果您使用 `bulkSubscribe`，那么:

- `enabled` 是必填的，并且在此主题上启用或禁用批量订阅
- 您可以选择配置每个批量消息中传递的最大消息数（`maxMessagesCount`）。
  不支持批量订阅的组件的 `maxMessagesCount` 的默认值为100，即默认情况下 App 和 Dapr 之间的批量事件。 请参考[组件如何处理发布和订阅批量消息]({{< ref pubsub-bulk >}})。
  如果组件支持批量订阅，则可以在该组件文档中找到此参数的默认值。
- 您可以选择提供最长等待时间（`maxAwaitDurationMs`）在批量消息发送到应用程序之前。
  不支持批量订阅的组件的 `maxAwaitDurationMs` 的默认值为1000，即默认情况下 App 和 Dapr 之间的批量事件。 请参考[组件如何处理发布和订阅批量消息]({{< ref pubsub-bulk >}})。
  如果组件支持批量订阅，则可以在该组件文档中找到此参数的默认值。

应用程序收到一个 `EntryId` 与批量消息中的每个条目（单个消息）相关联。 这 `EntryId` 必须由应用程序用于传达该特定条目的状态。 如果应用程序在 `EntryId` 的状态上未能通知，那么它将被视为 `RETRY`。

需要发送一个带有每个条目处理状态的JSON编码的负载主体：

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

可能的状态值:

| 状态        | 说明            |
| --------- | ------------- |
| `SUCCESS` | 消息已成功处理       |
| `RETRY`   | 将由 Dapr 重试的消息 |
| `DROP`    | 警告被记录下来，信息被删除 |

请参考[预期的批量订阅HTTP响应]({{< ref pubsub_api.md >}})以获取有关响应的更多见解。

### 如何使用Dapr扩展来开发和运行Dapr应用程序

有关如何使用批量订阅，请参阅以下代码示例：



{{% codetab %}}

```java
import io.dapr.Topic;
import io.dapr.client.domain.BulkSubscribeAppResponse;
import io.dapr.client.domain.BulkSubscribeAppResponseEntry;
import io.dapr.client.domain.BulkSubscribeAppResponseStatus;
import io.dapr.client.domain.BulkSubscribeMessage;
import io.dapr.client.domain.BulkSubscribeMessageEntry;
import io.dapr.client.domain.CloudEvent;
import io.dapr.springboot.annotations.BulkSubscribe;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import reactor.core.publisher.Mono;

class BulkSubscriber {
  @BulkSubscribe()
  // @BulkSubscribe(maxMessagesCount = 100, maxAwaitDurationMs = 40)
  @Topic(name = "topicbulk", pubsubName = "orderPubSub")
  @PostMapping(path = "/topicbulk")
  public Mono<BulkSubscribeAppResponse> handleBulkMessage(
          @RequestBody(required = false) BulkSubscribeMessage<CloudEvent<String>> bulkMessage) {
    return Mono.fromCallable(() -> {
      List<BulkSubscribeAppResponseEntry> entries = new ArrayList<BulkSubscribeAppResponseEntry>();
      for (BulkSubscribeMessageEntry<?> entry : bulkMessage.getEntries()) {
        try {
          CloudEvent<?> cloudEvent = (CloudEvent<?>) entry.getEvent();
          System.out.printf("Bulk Subscriber got: %s\n", cloudEvent.getData());
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.SUCCESS));
        } catch (Exception e) {
          e.printStackTrace();
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.RETRY));
        }
      }
      return new BulkSubscribeAppResponse(entries);
    });
  }
}
```



{{% codetab %}}

```typescript

import { DaprServer } from "@dapr/dapr";

const pubSubName = "orderPubSub";
const topic = "topicbulk";

const daprHost = process.env.DAPR_HOST || "127.0.0.1";
const daprPort = process.env.DAPR_HTTP_PORT || "3502";
const serverHost = process.env.SERVER_HOST || "127.0.0.1";
const serverPort = process.env.APP_PORT || 5001;

async function start() {
    const server = new DaprServer({
        serverHost,
        serverPort,
        clientOptions: {
            daprHost,
            daprPort,
        },
    });

    // Publish multiple messages to a topic with default config.
    await client.pubsub.bulkSubscribeWithDefaultConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)));

    // Publish multiple messages to a topic with specific maxMessagesCount and maxAwaitDurationMs.
    await client.pubsub.bulkSubscribeWithConfig(pubSubName, topic, (data) => console.log("Subscriber received: " + JSON.stringify(data)), 100, 40);
}

```



{{% codetab %}}

```csharp
using Microsoft.AspNetCore.Mvc;
using Dapr.AspNetCore;
using Dapr;

namespace DemoApp.Controllers;

[ApiController]
[Route("[controller]")]
public class BulkMessageController : ControllerBase
{
    private readonly ILogger<BulkMessageController> logger;

    public BulkMessageController(ILogger<BulkMessageController> logger)
    {
        this.logger = logger;
    }

    [BulkSubscribe("messages", 10, 10)]
    [Topic("pubsub", "messages")]
    public ActionResult<BulkSubscribeAppResponse> HandleBulkMessages([FromBody] BulkSubscribeMessage<BulkMessageModel<BulkMessageModel>> bulkMessages)
    {
        List<BulkSubscribeAppResponseEntry> responseEntries = new List<BulkSubscribeAppResponseEntry>();
        logger.LogInformation($"Received {bulkMessages.Entries.Count()} messages");
        foreach (var message in bulkMessages.Entries)
        {
            try
            {
                logger.LogInformation($"Received a message with data '{message.Event.Data.MessageData}'");
                responseEntries.Add(new BulkSubscribeAppResponseEntry(message.EntryId, BulkSubscribeAppResponseStatus.SUCCESS));
            }
            catch (Exception e)
            {
                logger.LogError(e.Message);
                responseEntries.Add(new BulkSubscribeAppResponseEntry(message.EntryId, BulkSubscribeAppResponseStatus.RETRY));
            }
        }
        return new BulkSubscribeAppResponse(responseEntries);
    }
    public class BulkMessageModel
    {
        public string MessageData { get; set; }
    }
}
```



{{< /tabs >}}

## 组件如何处理发布和订阅批量消息

对于事件发布/订阅，涉及到两种网络传输方式。

1. 从/到 _App_ 到/从 _Dapr_。
2. 从/到 _Dapr_ 到/从 _Pubsub Broker_。

这些是可以优化的机会。 当进行优化时，会进行批量请求，从而减少总的调用次数，提高吞吐量，提供更好的延迟。

启用批量发布和/或批量订阅后，应用程序与Dapr sidecar（上述第1点）之间的通信将得到优化，以便**所有组件**。

从 Dapr sidecar 到 pub/sub broker 的优化取决于多个因素，例如：

- Broker必须本质上支持批量发布/订阅
- 必须更新Dapr 组件以支持 broker 提供的批量 API

目前，以下组件已更新以支持此级别的优化：

|     Component    | 批量发布 | 批量订阅 |
| :--------------: | :--: | ---- |
|       Kafka      |  Yes | Yes  |
| Azure Servicebus |  Yes | Yes  |
|  Azure Eventhubs |  Yes | Yes  |

## 例子

观看以下关于批量发布/订阅的演示和介绍。

### [KubeCon Europe 2023 presentation](https://youtu.be/WMBAo-UNg6o)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/WMBAo-UNg6o" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

### [Dapr社区会议#77演示](https://youtu.be/BxiKpEmchgQ?t=1170)

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/BxiKpEmchgQ?start=1170" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 相关链接

- 支持的[发布/订阅组件列表]({{< ref supported-pubsub >}})
- Read the [API reference]({{< ref pubsub_api.md >}})
