---
type: docs
title: 声明式和编程式订阅方法
linkTitle: 订阅方法
weight: 3000
description: 了解 Dapr 允许您订阅主题的方法。
---

## Pub/sub API订阅方法

Dapr 应用程序可以通过两种方法订阅发布的主题，这两种方法支持相同的功能：声明式和编程式。

| 订阅方法                                                                                                                                               | 说明                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [**声明式**]({{< ref "subscription-methods.md#declarative-subscriptions" >}})  | 订阅定义在一个**外部文件**中。 声明式方法会从您的代码中移除 Dapr 依赖，并允许现有的应用程序订阅 topics，而无需更改代码。 |
| [**编程式**]({{< ref "subscription-methods.md#programmatic-subscriptions" >}}) | 订阅定义在**应用程序代码**中。 编程式方法在代码中实现订阅。                                      |

以下示例演示了`checkout`应用程序和`orderprocessing`应用程序通过`orders`主题进行pub/sub消息传递。 示例演示了相同的 Dapr 发布/订阅组件，首先以声明方式使用，然后以编程方式使用。

### 声明式订阅

您可以使用外部组件文件来声明式地订阅主题。 这个示例使用一个名为 `subscription.yaml` 的YAML组件文件：

```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: order
spec:
  topic: orders
  routes:
    default: /checkout
  pubsubname: pubsub
scopes:
- orderprocessing
- checkout
```

这里的订阅称为 `order`:

- 使用Pub/sub（发布/订阅）组件`pubsub`订阅名为`orders`的主题。
- 将`route`字段设置为将所有主题消息发送到应用程序中的`/checkout`端点。
- 将 `scopes` 字段设置为仅限具有 `orderprocessing` 和 `checkout` 的应用程序访问此订阅。

在运行 Dapr 时，将 YAML 组件文件路径设置为指向组件的 Dapr。

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

在 Kubernetes 中，将该组件应用到集群中:

```bash
kubectl apply -f subscription.yaml
```

{{% /codetab %}}

{{< /tabs >}}

在您的应用程序代码中，订阅 Dapr pub/sub 组件中指定的主题。

{{< tabs ".NET" Java Python JavaScript Go >}}

{{% codetab %}}

```csharp
 //Subscribe to a topic 
[HttpPost("checkout")]
public void getCheckout([FromBody] int orderId)
{
    Console.WriteLine("Subscriber received : " + orderId);
}
```

{{% /codetab %}}

{{% codetab %}}

```java
import io.dapr.client.domain.CloudEvent;

 //Subscribe to a topic
@PostMapping(path = "/checkout")
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

#Subscribe to a topic 
@app.route('/checkout', methods=['POST'])
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

// listen to the declarative route
app.post('/checkout', (req, res) => {
  console.log(req.body);
  res.sendStatus(200);
});
```

{{% /codetab %}}

{{% codetab %}}

```go
//Subscribe to a topic
var sub = &common.Subscription{
	PubsubName: "pubsub",
	Topic:      "orders",
	Route:      "/checkout",
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("Subscriber received: %s", e.Data)
	return false, nil
}
```

{{% /codetab %}}

{{< /tabs >}}

`/checkout` 端点与订阅中定义的 `route` 相匹配，这是 Dapr 将所有主题消息发送至的位置。

### 编程方式订阅

动态编程方法返回 `routes` 代码中的 JSON 结构，与声明式方法的 `route` YAML 结构相对应。

> **注意：** 编程订阅只在应用程序启动时读取一次。 你不能_动态_添加新的编程订阅，仅在编译时添加新的编程订阅。

在下面的示例中，您将在应用程序代码中定义在[声明性YAML订阅](#declarative-subscriptions)上方找到的值。

{{< tabs ".NET" Java Python JavaScript Go>}}

{{% codetab %}}

```csharp
[Topic("pubsub", "orders")]
[HttpPost("/checkout")]
public async Task<ActionResult<Order>>Checkout(Order order, [FromServices] DaprClient daprClient)
{
    // Logic
    return order;
}
```

or

```csharp
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/checkout", [Topic("pubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});
```

上面定义的这两个处理程序还需要映射到配置 `dapr/subscribe` 端点。 这是在定义端点时在应用程序启动代码中完成的。

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

@Topic(name = "checkout", pubsubName = "pubsub")
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
```

{{% /codetab %}}

{{% codetab %}}

```python
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [
      {
        'pubsubname': 'pubsub',
        'topic': 'checkout',
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
      topic: "checkout",
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

// This handles /dapr/subscribe
func configureSubscribeHandler(w http.ResponseWriter, _ *http.Request) {
	t := []subscription{
		{
			PubsubName: "pubsub",
			Topic:      "checkout",
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

- 尝试[Pub/Sub快速入门]({{< ref pubsub-quickstart.md >}})
- 跟随：[操作方法：使用多个命名空间配置pub/sub组件]({{< ref pubsub-namespaces.md >}})
- 详细了解[声明式和程序化订阅方法]({{< ref subscription-methods >}})。
- 了解[topic范围]({{< ref pubsub-scopes.md >}})
- 了解关于[消息TTL]({{< ref pubsub-message-ttl.md >}})
- 详细了解 [Pub/sub（发布/订阅）与CloudEvent的发布/订阅]({{< ref pubsub-cloudevents.md >}})
- 支持的[发布/订阅组件]({{< ref supported-pubsub.md >}})
- 阅读[pub/sub API参考]({{< ref pubsub_api.md >}})
