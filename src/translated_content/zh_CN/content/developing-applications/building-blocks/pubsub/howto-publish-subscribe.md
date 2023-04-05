---
type: docs
title: "How to: Publish a message and subscribe to a topic"
linkTitle: "How to: Publish & subscribe to topics"
weight: 2000
description: "了解如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题"
---

现在，你已了解 Dapr 发布/订阅 构建块提供的功能，请了解它如何在你的服务中工作。 下面的示例代码粗略地描述了一个使用两个服务处理订单的应用程序，每个服务都使用 Dapr sidecars：

- 使用 Dapr 订阅消息队列中主题的结帐服务。
- 使用 Dapr 向 RabbitMQ 发布消息的订单处理服务。


<img src="/images/building-block-pub-sub-example.png" width=1000 alt="显示示例服务的状态管理的图示">

Dapr automatically wraps the user payload in a CloudEvents v1.0 compliant envelope, using `Content-Type` header value for `datacontenttype` attribute. [了解有关使用 CloudEvents消息的更多信息。]({{< ref pubsub-cloudevents.md >}})

下面的示例演示应用程序如何发布和订阅名为 `orders`的主题。

{{% alert title="Note" color="primary" %}}
 If you haven't already, [try out the pub/sub quickstart]({{< ref pubsub-quickstart.md >}}) for a quick walk-through on how to use pub/sub.

{{% /alert %}}

## 设置 发布/订阅 组件

第一步是设置 发布/订阅 组件：

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。 在此示例中，我们使用 RabbitMQ。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order-pub-sub
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: reconnectWait
    value: "0"
  - name: concurrency
    value: parallel
scopes:
  - orderprocessing
  - checkout
```

You can override this file with another [pubsub component]({{< ref setup-pubsub >}}) by creating a components directory (in this example, `myComponents`) containing the file and using the flag `--components-path` with the `dapr run` CLI command.

{{< tabs Dotnet Java Python Go Javascript >}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- python3 app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- go run app.go
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --components-path ./myComponents -- npm start
```
{{% /codetab %}}

{{< /tabs >}}

{{% /codetab %}}

{{% codetab %}}
To deploy this into a Kubernetes cluster, fill in the `metadata` connection details of the [pub/sub component]({{< ref setup-pubsub >}}) in the YAML below, save as `pubsub.yaml`, and run `kubectl apply -f pubsub.yaml`.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order-pub-sub
  namespace: default
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: host
    value: "amqp://localhost:5672"
  - name: durable
    value: "false"
  - name: deletedWhenUnused
    value: "false"
  - name: autoAck
    value: "false"
  - name: reconnectWait
    value: "0"
  - name: concurrency
    value: parallel
scopes:
  - orderprocessing
  - checkout
```

{{% /codetab %}}

{{< /tabs >}}

## Subscribe to topics

Dapr provides two methods by which you can subscribe to topics:

- **声明式**，其中定义在外部文件中。
- **编程方式**，订阅在用户代码中定义

Learn more in the [declarative and programmatic subscriptions doc]({{< ref subscription-methods.md >}}). This example demonstrates a **declarative** subscription.

创建名为 `subscription.yaml` 的文件并粘贴以下内容:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order-pub-sub
spec:
  topic: orders
  route: /checkout
  pubsubname: order-pub-sub
scopes:
- orderprocessing
- checkout
```

The example above shows an event subscription to topic `orders`, for the pubsub component `order-pub-sub`.

- `route` 告诉 Dapr 将所有主题消息发送到应用程序中的 `/checkout` 端点。
- `scopes` 字段为具有 ID 的应用启用此订阅， `orderprocessing` 和 `checkout`。

Place `subscription.yaml` in the same directory as your `pubsub.yaml` component. When Dapr starts up, it loads subscriptions along with the components.

Below are code examples that leverage Dapr SDKs to subscribe to the topic you defined in `subscription.yaml`.

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp
//dependencies 
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using Dapr;
using Dapr.Client;

//code
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
         //Subscribe to a topic 
        [Topic("order-pub-sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

//code
@RestController
public class CheckoutServiceController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
     //Subscribe to a topic
    @Topic(name = "orders", pubsubName = "order-pub-sub")
    @PostMapping(path = "/checkout")
    public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
        return Mono.fromRunnable(() -> {
            try {
                log.info("Subscriber received: " + cloudEvent.getData());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import logging
import json

#code
app = App()
logging.basicConfig(level = logging.INFO)
#Subscribe to a topic 
@app.subscribe(pubsub_name='order-pub-sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + str(data))

app.run(6002)
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc -- python3 CheckoutService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
    "log"
    "net/http"
    "context"

    "github.com/dapr/go-sdk/service/common"
    daprd "github.com/dapr/go-sdk/service/http"
)

//code
var sub = &common.Subscription{
    PubsubName: "order-pub-sub",
    Topic:      "orders",
    Route:      "/checkout",
}

func main() {
    s := daprd.NewService(":6002")
   //Subscribe to a topic
    if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
        log.Fatalf("error adding topic subscription: %v", err)
    }
    if err := s.Start(); err != nil && err != http.ErrServerClosed {
        log.Fatalf("error listenning: %v", err)
    }
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    log.Printf("Subscriber received: %s", e.Data)
    return false, nil
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprServer, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start(orderId) {
    const server = new DaprServer(
        serverHost, 
        serverPort, 
        daprHost, 
        process.env.DAPR_HTTP_PORT, 
        CommunicationProtocolEnum.HTTP
    );
    //Subscribe to a topic
    await server.pubsub.subscribe("order-pub-sub", "orders", async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    });
    await server.startServer();
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the subscriber application:

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## Publish a message

用名为 `orderprocessing` 的 app-id 启动一个 Dapr 实例：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

然后发布一条消息给 `orders` 主题：

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
dapr publish --publish-app-id orderprocessing --pubsub order-pub-sub --topic orders --data '{"orderId": "100"}'
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -X POST http://localhost:3601/v1.0/publish/order-pub-sub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"orderId": "100"}' -Uri 'http://localhost:3601/v1.0/publish/order-pub-sub/orders'
```

{{% /codetab %}}

{{< /tabs >}}

下面是利用 Dapr SDK 发布主题的代码示例。

{{< tabs Dotnet Java Python Go Javascript>}}

{{% codetab %}}

```csharp
//dependencies
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
           string PUBSUB_NAME = "order-pub-sub";
           string TOPIC_NAME = "orders";
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;
                using var client = new DaprClientBuilder().Build();
                //Using Dapr SDK to publish a topic
                await client.PublishEventAsync(PUBSUB_NAME, TOPIC_NAME, orderId, cancellationToken);
                Console.WriteLine("Published data: " + orderId);
                }
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the publisher application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;
import static java.util.Collections.singletonMap;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

    public static void main(String[] args) throws InterruptedException{
        String MESSAGE_TTL_IN_SECONDS = "1000";
        String TOPIC_NAME = "orders";
        String PUBSUB_NAME = "order-pub-sub";

        while(true) {
            TimeUnit.MILLISECONDS.sleep(5000);
            Random random = new Random();
            int orderId = random.nextInt(1000-1) + 1;
            DaprClient client = new DaprClientBuilder().build();
      //Using Dapr SDK to publish a topic
            client.publishEvent(
                    PUBSUB_NAME,
                    TOPIC_NAME,
                    orderId,
                    singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
            log.info("Published data:" + orderId);
        }
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the publisher application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies  
import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

#code
logging.basicConfig(level = logging.INFO)
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    PUBSUB_NAME = 'order-pub-sub'
    TOPIC_NAME = 'orders'
    with DaprClient() as client:
        #Using Dapr SDK to publish a topic
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
        )
    logging.info('Published data: ' + str(orderId))
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the publisher application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --app-protocol grpc python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
    "context"
    "log"
    "math/rand"
    "time"
    "strconv"
    dapr "github.com/dapr/go-sdk/client"
)

//code
var (
    PUBSUB_NAME = "order-pub-sub"
    TOPIC_NAME  = "orders"
)

func main() {
    for i := 0; i < 10; i++ {
        time.Sleep(5000)
        orderId := rand.Intn(1000-1) + 1
        client, err := dapr.NewClient()
        if err != nil {
            panic(err)
        }
        defer client.Close()
        ctx := context.Background()
    //Using Dapr SDK to publish a topic
        if err := client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId))); 
        err != nil {
            panic(err)
        }

        log.Println("Published data: " + strconv.Itoa(orderId))
    }
}
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the publisher application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

const daprHost = "127.0.0.1"; 

var main = function() {
    for(var i=0;i<10;i++) {
        sleep(5000);
        var orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        start(orderId).catch((e) => {
            console.error(e);
            process.exit(1);
        });
    }
}

async function start(orderId) {
    const PUBSUB_NAME = "order-pub-sub"
    const TOPIC_NAME  = "orders"
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    console.log("Published data:" + orderId)
    //Using Dapr SDK to publish a topic
    await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

Navigate to the directory containing the above code, then run the following command to launch both a Dapr sidecar and the publisher application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 消息确认和重试

为了告诉Dapr 消息处理成功，返回一个 `200 OK` 响应。 如果 Dapr 收到超过 `200` 的返回状态代码，或者你的应用崩溃，Dapr 将根据 At-Least-Once 语义尝试重新传递消息。

## 下一步

- Try the [pub/sub tutorial](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub).
- Learn about [messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}}) and when you might want to [send messages without CloudEvents]({{< ref pubsub-raw.md >}}).
- 查看 [发布/订阅 组件列表]({{< ref setup-pubsub >}})。
- 阅读 [API 参考手册]({{< ref pubsub_api.md >}})。
