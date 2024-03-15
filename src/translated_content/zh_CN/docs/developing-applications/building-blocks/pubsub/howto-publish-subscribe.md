---
type: docs
title: 指南：发布消息并订阅主题
linkTitle: 操作方法：发布和订阅主题
weight: 2000
description: 了解如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题
---

现在，你已了解 Dapr 发布/订阅 构建块提供的功能，请了解它如何在你的服务中工作。 下面的示例代码粗略地描述了一个使用两个服务处理订单的应用程序，每个服务都使用 Dapr sidecars：

- 使用 Dapr 订阅消息队列中主题的结帐服务。
- 使用 Dapr 向 RabbitMQ 发布消息的订单处理服务。

<img src="/images/pubsub-howto-overview.png" width=1000 alt="Diagram showing state management of example service">

Dapr 将在符合 CloudEvents v1.0 的信封中自动包装用户有效负载，对 `Content-Type` 头值使用 `datacontenttype` 属性。 [了解更多关于使用CloudEvents的消息。]({{< ref pubsub-cloudevents.md >}})

下面的示例演示了您的应用程序如何发布和订阅名为`orders`的主题。

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用发布/订阅快速入门]({{< ref pubsub-quickstart.md >}})快速了解如何使用发布/订阅。

{{% /alert %}}

## 设置 发布/订阅 组件

第一步是设置 发布/订阅 组件：

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
When you run `dapr init`, Dapr creates a default Redis `pubsub.yaml` and runs a Redis container on your local machine, located:

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。 在此示例中，我们使用 RabbitMQ。

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

您可以通过创建一个包含该文件的组件目录（在此示例中为`myComponents`），并在使用`dapr run`命令行界面时使用`--resources-path`标志，来使用另一个[pubsub component]({{< ref setup-pubsub >}})来覆盖此文件。

{{< tabs Dotnet Java Python Go Javascript >}}

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
dapr run --app-id myapp --resources-path ./myComponents -- go run app.go
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id myapp --resources-path ./myComponents -- npm start
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
spec:
  type: pubsub.rabbitmq
  version: v1
  metadata:
  - name: connectionString
    value: "amqp://localhost:5672"
  - name: protocol
    value: amqp  
  - name: hostname
    value: localhost 
  - name: username
    value: username
  - name: password
    value: password 
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

## 订阅主题

Dapr 允许您的应用程序有两种方法来订阅 topics：

- **声明**，其中订阅是在外部文件中定义的。
- **编程式**，订阅在用户代码中定义。

详细了解[声明式和程序化订阅方法文档]({{< ref subscription-methods.md >}})。 这个示例演示了一个**声明式**订阅。

创建一个名为`subscription.yaml`的文件，并粘贴以下内容：

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
scopes:
- orderprocessing
- checkout
```

上面的示例显示了对主题 `orders` 的事件订阅，用于 pubsub 组件 `order-pub-sub`。

- `route`字段告诉Dapr将所有主题消息发送到应用程序中的`/checkout`端点。
- `scopes` 字段使得此订阅适用于具有 `orderprocessing` 和 `checkout` 的应用程序。

将 `subscription.yaml` 放在与你的 `pubsub.yaml` 组件相同的目录中。 当 Dapr 启动时，它将加载组件和订阅。

下面是利用 Dapr SDK 订阅你在 `subscription.yaml` 中定义的主题的代码示例。

{{< tabs Dotnet Java Python Go JavaScript>}}

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和订阅程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-protocol https dotnet run
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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和订阅程序：

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和订阅程序：

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和订阅程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprServer, CommunicationProtocolEnum } from '@dapr/dapr'; 

//code
const daprHost = "127.0.0.1"; 
const serverHost = "127.0.0.1";
const serverPort = "6002"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start(orderId) {
    const server = new DaprServer({
        serverHost,
        serverPort,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
        clientOptions: {
          daprHost,
          daprPort: process.env.DAPR_HTTP_PORT,
        },
    });
    //Subscribe to a topic
    await server.pubsub.subscribe("order-pub-sub", "orders", async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    });
    await server.start();
}
```

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和订阅程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 发布消息

用名为 `orderprocessing` 的 app-id 启动一个 Dapr 实例：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

然后发布一条消息给 `orders` 主题:

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和发布程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-protocol https dotnet run
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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和发布程序：

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和发布程序：

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

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和发布程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprServer, DaprClient, CommunicationProtocolEnum } from '@dapr/dapr'; 

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
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT, 
        communicationProtocol: CommunicationProtocolEnum.HTTP
    });
    console.log("Published data:" + orderId)
    //Using Dapr SDK to publish a topic
    await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

导航到包含上述代码的目录，然后运行以下命令启动 Dapr sidecar 和发布程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 消息确认和重试

为了告诉Dapr消息处理成功，返回一个`200 OK`响应。 如果 Dapr 收到超过 `200` 的返回状态代码，或者你的应用崩溃，Dapr 将根据 At-Least-Once 语义尝试重新传递消息。

## 演示视频

观看[此演示视频](https://youtu.be/1dqe1k-FXJQ?si=s3gvWxRxeOsmXuE1)以了解使用Dapr进行发布/订阅消息传递的更多信息。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/1dqe1k-FXJQ?si=s3gvWxRxeOsmXuE1" title="YouTube video player" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

- 尝试一下[pub/sub（发布/订阅）教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)。
- 了解[messaging with CloudEvents]({{< ref pubsub-cloudevents.md >}})以及您可能想要[在没有CloudEvents的情况下发送消息]({{< ref pubsub-raw.md >}})。
- 查看列表 [发布/订阅组件]({{< ref setup-pubsub >}})。
- 阅读[API参考]({{< ref pubsub_api.md >}})。
