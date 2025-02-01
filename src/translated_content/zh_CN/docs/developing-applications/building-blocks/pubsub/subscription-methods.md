---
type: docs
title: "声明式、流式和编程式订阅类型"
linkTitle: "订阅类型"
weight: 3000
description: "了解更多关于允许您订阅消息主题的订阅类型。"
---

## 发布/订阅 API 订阅类型

Dapr 应用程序可以通过三种订阅类型来订阅已发布的主题，这三种类型支持相同的功能：声明式、流式和编程式。

| 订阅类型 | 描述 |
| ------------------- | ----------- |
| [**声明式**]({{< ref "subscription-methods.md#declarative-subscriptions" >}}) | 订阅在**外部文件**中定义。声明式方法将 Dapr 的依赖从代码中移除，允许现有应用程序无需更改代码即可订阅主题。 |
| [**流式**]({{< ref "subscription-methods.md#streaming-subscriptions" >}}) | 订阅在**应用程序代码**中定义。流式订阅是动态的，允许在运行时添加或删除订阅。它们不需要在应用程序中设置订阅端点（这是编程式和声明式订阅所需的），使其在代码中易于配置。流式订阅也不需要应用程序配置 sidecar 来接收消息。 |
| [**编程式**]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) | 订阅在**应用程序代码**中定义。编程式方法实现了静态订阅，并需要在代码中设置一个端点。 |

下面的示例演示了通过 `orders` 主题在 `checkout` 应用程序和 `orderprocessing` 应用程序之间的发布/订阅消息。示例首先以声明式，然后以编程式演示了相同的 Dapr 发布/订阅组件。

### 声明式订阅

{{% alert title="注意" color="primary" %}}
此功能目前处于预览状态。
Dapr 可以实现“热重载”声明式订阅，从而在不需要重启的情况下自动获取更新。
这通过 [`HotReload` 功能门控]({{< ref "support-preview-features.md" >}})启用。
为了防止重新处理或丢失未处理的消息，在 Dapr 和您的应用程序之间的飞行消息在热重载事件期间不受影响。
{{% /alert %}}

您可以使用外部组件文件声明性地订阅一个主题。此示例使用名为 `subscription.yaml` 的 YAML 组件文件：

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  routes:
    default: /orders
  pubsubname: pubsub
scopes:
- orderprocessing
```

这里的订阅名为 `order`：
- 使用名为 `pubsub` 的发布/订阅组件订阅名为 `orders` 的主题。
- 设置 `route` 字段以将所有主题消息发送到应用程序中的 `/orders` 端点。
- 设置 `scopes` 字段以将此订阅的访问范围仅限于 ID 为 `orderprocessing` 的应用程序。

运行 Dapr 时，设置 YAML 组件文件路径以指向 Dapr 的组件。

{{< tabs ".NET" Java Python JavaScript Go Kubernetes>}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- python3 app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- npm start
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- go run app.go
```

{{% /codetab %}}

{{% codetab %}}

在 Kubernetes 中，将组件应用到集群：

```bash
kubectl apply -f subscription.yaml
```

{{% /codetab %}}

{{< /tabs >}}

在您的应用程序代码中，订阅 Dapr 发布/订阅组件中指定的主题。

{{< tabs ".NET" Java Python JavaScript Go >}}

{{% codetab %}}

```csharp
 //订阅一个主题 
[HttpPost("orders")]
public void getCheckout([FromBody] int orderId)
{
    Console.WriteLine("Subscriber received : " + orderId);
}
```

{{% /codetab %}}

{{% codetab %}}

```java
import io.dapr.client.domain.CloudEvent;

 //订阅一个主题
@PostMapping(path = "/orders")
public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
    return Mono.fromRunnable(() -> {
        try {
            log.info("Subscriber received: " + cloudEvent.getData());
        } 
    });
}
```

{{% /codetab %}}

{{% codetab %}}

```python
from cloudevents.sdk.event import v1

#订阅一个主题 
@app.route('/orders', methods=['POST'])
def checkout(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + str(data))
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

// 监听声明式路由
app.post('/orders', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
```

{{% /codetab %}}

{{% codetab %}}

```go
//订阅一个主题
var sub = &common.Subscription{
	PubsubName: "pubsub",
	Topic:      "orders",
	Route:      "/orders",
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
}
```

{{% /codetab %}}

{{< /tabs >}}

`/orders` 端点与订阅中定义的 `route` 匹配，这是 Dapr 发送所有主题消息的地方。

### 流式订阅

流式订阅是在应用程序代码中定义的订阅，可以在运行时动态停止和启动。
消息由应用程序从 Dapr 拉取。这意味着不需要端点来订阅主题，并且可以在没有任何应用程序配置在 sidecar 上的情况下进行订阅。
可以同时订阅任意数量的发布/订阅和主题。
由于消息被发送到给定的消息处理代码，因此没有路由或批量订阅的概念。

> **注意：** 每个应用程序一次只能订阅一个发布/订阅/主题对。

下面的示例展示了不同的流式订阅主题的方法。

{{< tabs Python Go >}}

{{% codetab %}}

您可以使用 `subscribe` 方法，该方法返回一个 `Subscription` 对象，并允许您通过调用 `next_message` 方法从流中拉取消息。这在主线程中运行，并可能在等待消息时阻塞主线程。

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc.subscription import StreamInactiveError

counter = 0


def process_message(message):
    global counter
    counter += 1
    # 在此处处理消息
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return 'success'


def main():
    with DaprClient() as client:
        global counter

        subscription = client.subscribe(
            pubsub_name='pubsub', topic='orders', dead_letter_topic='orders_dead'
        )

        try:
            while counter < 5:
                try:
                    message = subscription.next_message()

                except StreamInactiveError as e:
                    print('Stream is inactive. Retrying...')
                    time.sleep(1)
                    continue
                if message is None:
                    print('No message received within timeout period.')
                    continue

                # 处理消息
                response_status = process_message(message)

                if response_status == 'success':
                    subscription.respond_success(message)
                elif response_status == 'retry':
                    subscription.respond_retry(message)
                elif response_status == 'drop':
                    subscription.respond_drop(message)

        finally:
            print("Closing subscription...")
            subscription.close()


if __name__ == '__main__':
    main()

```

您还可以使用 `subscribe_with_handler` 方法，该方法接受一个回调函数，该函数为从流中接收到的每条消息执行。此方法在单独的线程中运行，因此不会阻塞主线程。

```python
import time

from dapr.clients import DaprClient
from dapr.clients.grpc._response import TopicEventResponse

counter = 0


def process_message(message):
    # 在此处处理消息
    global counter
    counter += 1
    print(f'Processing message: {message.data()} from {message.topic()}...')
    return TopicEventResponse('success')


def main():
    with (DaprClient() as client):
        # 这将启动一个新线程，该线程将监听消息
        # 并在 `process_message` 函数中处理它们
        close_fn = client.subscribe_with_handler(
            pubsub_name='pubsub', topic='orders', handler_fn=process_message,
            dead_letter_topic='orders_dead'
        )

        while counter < 5:
            time.sleep(1)

        print("Closing subscription...")
        close_fn()


if __name__ == '__main__':
    main()
```

[了解更多关于使用 Python SDK 客户端的流式订阅。]({{< ref "python-client.md#streaming-message-subscription" >}})

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/go-sdk/client"
)

func main() {
	cl, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	sub, err := cl.Subscribe(context.Background(), client.SubscriptionOptions{
		PubsubName: "pubsub",
		Topic:      "orders",
	})
	if err != nil {
		panic(err)
	}
	// 必须始终调用 Close。
	defer sub.Close()

	for {
		msg, err := sub.Receive()
		if err != nil {
			panic(err)
		}

		// 处理事件

		// 我们 _必须_ 始终表示消息处理的结果，否则
		// 消息将不会被视为已处理，并将被重新传递或
		// 死信。
		// msg.Retry()
		// msg.Drop()
		if err := msg.Success(); err != nil {
			panic(err)
		}
	}
}
```

或

```go
package main

import (
	"context"
	"log"

	"github.com/dapr/go-sdk/client"
	"github.com/dapr/go-sdk/service/common"
)

func main() {
	cl, err := client.NewClient()
	if err != nil {
		log.Fatal(err)
	}

	stop, err := cl.SubscribeWithHandler(context.Background(),
		client.SubscriptionOptions{
			PubsubName: "pubsub",
			Topic:      "orders",
		},
		eventHandler,
	)
	if err != nil {
		panic(err)
	}

	// 必须始终调用 Stop。
	defer stop()

	<-make(chan struct{})
}

func eventHandler(e *common.TopicEvent) common.SubscriptionResponseStatus {
	// 在此处处理消息
    // common.SubscriptionResponseStatusRetry
    // common.SubscriptionResponseStatusDrop
			common.SubscriptionResponseStatusDrop, status)
	}

	return common.SubscriptionResponseStatusSuccess
}
```

{{% /codetab %}}

{{< /tabs >}}

## 演示

观看 [此视频以了解流式订阅的概述](https://youtu.be/57l-QDwgI-Y?t=841)：

<iframe width="560" height="315" src="https://www.youtube.com/embed/57l-QDwgI-Y?si=EJj3uo306vBUvl3Y&amp;start=841" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

### 编程式订阅

动态编程式方法在代码中返回 `routes` JSON 结构，与声明式方法的 `route` YAML 结构不同。

> **注意：** 编程式订阅仅在应用程序启动时读取一次。您不能 _动态_ 添加新的编程式订阅，只能在编译时添加新的。

在下面的示例中，您在应用程序代码中定义了在上面的[声明式 YAML 订阅](#declarative-subscriptions)中找到的值。

{{< tabs ".NET" Java Python JavaScript Go>}}

{{% codetab %}}

```csharp
[Topic("pubsub", "orders")]
[HttpPost("/orders")]
public async Task<ActionResult<Order>>Checkout(Order order, [FromServices] DaprClient daprClient)
{
    // 逻辑
    return order;
}
```

或

```csharp
// Dapr 订阅在 [Topic] 中将 orders 主题路由到此路由
app.MapPost("/orders", [Topic("pubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});
```

上面定义的两个处理程序还需要映射以配置 `dapr/subscribe` 端点。这是在定义端点时在应用程序启动代码中完成的。

```csharp
app.UseEndpoints(endpoints =>
{
    endpoints.MapSubscribeHandler();
});
```

{{% /codetab %}}

{{% codetab %}}

```java
private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

@Topic(name = "orders", pubsubName = "pubsub")
@PostMapping(path = "/orders")
public Mono<Void> handleMessage(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
  return Mono.fromRunnable(() -> {
    try {
      System.out.println("Subscriber received: " + cloudEvent.getData());
      System.out.println("Subscriber received: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  });
}
```

{{% /codetab %}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'orders',
        'routes': {
          'rules': [
            {
              'match': 'event.type == "order"',
              'path': '/orders'
            },
          ],
          'default': '/orders'
        }
      }]
    return jsonify(subscriptions)

@app.route('/orders', methods=['POST'])
def ds_subscriber():
    print(request.json, flush=True)
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
app.run()
```

{{% /codetab %}}

{{% codetab %}}

```javascript
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json({ type: 'application/*+json' }));

const port = 3000

app.get('/dapr/subscribe', (req, res) => {
  res.json([
    {
      pubsubname: "pubsub",
      topic: "orders",
      routes: {
        rules: [
          {
            match: 'event.type == "order"',
            path: '/orders'
          },
        ],
        default: '/products'
      }
    }
  ]);
})

app.post('/orders', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`consumer app listening on port ${port}!`))
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/mux"
)

const appPort = 3000

type subscription struct {
	PubsubName string            `json:"pubsubname"`
	Topic      string            `json:"topic"`
	Metadata   map[string]string `json:"metadata,omitempty"`
	Routes     routes            `json:"routes"`
}

type routes struct {
	Rules   []rule `json:"rules,omitempty"`
	Default string `json:"default,omitempty"`
}

type rule struct {
	Match string `json:"match"`
	Path  string `json:"path"`
}

// 处理 /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "orders",
			Routes: routes{
				Rules: []rule{
					{
						Match: `event.type == "order"`,
						Path:  "/orders",
					},
				},
				Default: "/orders",
			},
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(t)
}

func main() {
	router := mux.NewRouter().StrictSlash(true)
	router.HandleFunc("/dapr/subscribe", configureSubscribeHandler).Methods("GET")
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%d", appPort), router))
}
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步

* 试用 [发布/订阅快速入门]({{< ref pubsub-quickstart.md >}})
* 关注：[如何：配置具有多个命名空间的发布/订阅组件]({{< ref pubsub-namespaces.md >}})
* 了解更多关于[声明式和编程式订阅方法]({{< ref subscription-methods >}})。
* 了解[主题范围]({{< ref pubsub-scopes.md >}})
* 了解[消息 TTL]({{< ref pubsub-message-ttl.md >}})
* 了解更多关于[带有和不带有 CloudEvent 的发布/订阅]({{< ref pubsub-cloudevents.md >}})
* [发布/订阅组件列表]({{< ref supported-pubsub.md >}})
* 阅读 [发布/订阅 API 参考]({{< ref pubsub_api.md >}})