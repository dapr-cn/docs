---
type: docs
title: "指南：发布消息并订阅主题"
linkTitle: "How-To: Publish & subscribe"
weight: 2000
description: "了解如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题"
---

## 介绍

Pub/Sub 是一个分布式系统中的常见模式，它有许多服务用于解偶、异步消息传递。 使用Pub/Sub，您可以在事件消费者与事件生产者解偶的场景中启用。

Dapr 提供了一个可扩展的 Pub/Sub 系统（保证消息至少传递一次），允许开发者发布和订阅主题。 Dapr 为 Pub/Sub 提供组件，使操作者能够使用他们所喜欢的基础设施，例如 Redis Streams 和 Kafka 等。

## 步骤 1: 设置 Pub/Sub 组件

当发布消息时，必须指定所发送数据的内容类型。 除非指定, Dapr 将假定类型为 `text/plain`。 当使用 Dapr 的 HTTP API时，内容类型可以设置在 `Content-Type` 头中。 gRPC 客户端和 SDK 有一个专用的内容类型参数。

## 示例︰

以下的示例简述了一个订单处理程序。 当前示例中，存两项服务：订单处理服务和结账服务。 这两项服务都有Dapr sidecar。 订单处理服务使用 Dapr 向 RabbitMQ 发布消息，结账服务订阅消息队列中的主题。

<img src="/images/building-block-pub-sub-example.png" width=1000 alt="Diagram showing state management of example service">

## 步骤 1: 设置 Pub/Sub 组件
然后发布一条消息给 `orders` 主题：

第一步是设置 Pub/Sub 组件：

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
默认情况下，pubsub.yaml 是在本地计算机上运行` dapr init`时 创建的。 在 Linux/MacOS 上打开 `~/.dapr/components/pubsub.yam` 或在 Windows 上打开`%UserProfile%\.dapr\components\pubsub.yaml` 组件文件以验证.

在此示例中，RabbitMQ 用于发布和订阅。 将 `pubsub.yaml` 文件内容替换为以下内容。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
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

您可以重写这个文件以使用另一个 Redis 实例或者另一个 [pubsub component]({{< ref setup-pubsub >}}) ，通过创建 `components` 文件夹（文件夹中包含重写的文件）并在 `dapr run` 命令行界面使用 `--components-path` 标志。
{{% /codetab %}}

{{% codetab %}}
要将其部署到 Kubernetes 群集中，请为你想要的[ pubsub 组件]({{< ref setup-pubsub >}}) 在下面的 yaml `metadata` 中填写链接详情，保存为 `pubsub.yaml`，然后运行 `kubectl apply -f pubsub.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: order_pub_sub
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


## 步骤 2: 订阅主题

Dapr 允许两种方法订阅主题：

- **声明式**，其中定义在外部文件中。
- **编程方式**，订阅在用户代码中定义

{{% alert title="Note" color="primary" %}}
 声明和编程方式都支持相同的功能。 声明的方式从用户代码中移除对 Dapr 的依赖性，并允许使用现有应用程序订阅主题。 编程方法在用户代码中实现订阅。

{{% /alert %}}

### 声明式订阅

您可以使用以下自定义资源定义 （CRD） 订阅主题。 创建名为 `subscription.yaml` 的文件并粘贴以下内容:

```yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: order_pub_sub
spec:
  topic: orders
  route: /checkout
  pubsubname: order_pub_sub
scopes:
- orderprocessing
- checkout
```

上面的示例显示了对主题 `orders`的事件订阅，用于 pubsub 组件 `order_pub_sub`。
- `route` 告诉 Dapr 将所有主题消息发送到应用程序中的 `/checkout` 端点。
- `scopes` 字段为具有 ID 的应用启用此订阅， `orderprocessing` 和 `checkout`。

设置组件：

将 CRD 放在 `./components` 目录中。 当 Dapr 启动时，它将加载组件和订阅。

注意：默认情况下，在 MacOS/Linux 上从 `$HOME/.dapr/components` 加载组件，以及 `%USERPROFILE%\.dapr\components` 在Windows上。

还可以通过将 Dapr CLI 指向组件路径来覆盖默认目录：

{{< tabs Dotnet Java Python Go Javascript Kubernetes>}}

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

{{% codetab %}}
在 Kubernetes 中，将 CRD 保存到文件中并将其应用于群集：
```bash
kubectl apply -f subscription.yaml
```
{{% /codetab %}}

{{< /tabs >}}

下面是利用 Dapr SDK 订阅主题的代码示例。

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
        [Topic("order_pub_sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Subscriber received : " + orderId);
        }
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    @Topic(name = "orders", pubsubName = "order_pub_sub")
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
@app.subscribe(pubsub_name='order_pub_sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('Subscriber received: ' + str(data))

app.run(6002)
```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    PubsubName: "order_pub_sub",
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    await server.pubsub.subscribe("order_pub_sub", "orders", async (orderId) => {
        console.log(`Subscriber received: ${JSON.stringify(orderId)}`)
    });
    await server.startServer();
}
```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start
```

{{% /codetab %}}

{{< /tabs >}}

`/checkout` 终结点与订阅中定义的 `route` 相匹配，这是 Dapr 将所有主题消息发送至的位置。

## 步骤 3: 发布主题

用名为 `orderprocessing` 的 app-id 启动一个 Dapr 实例：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```
{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

然后发布一条消息给 `orders` 主题：

```bash
dapr publish --publish-app-id orderprocessing --pubsub order_pub_sub --topic orders --data '{"orderId": "100"}'
```
{{% /codetab %}}

{{% codetab %}}
然后发布一条消息给 `orders` 主题：
```bash
curl -X POST http://localhost:3601/v1.0/publish/order_pub_sub/orders -H "Content-Type: application/json" -d '{"orderId": "100"}'
```
{{% /codetab %}}

{{% codetab %}}
然后发布一条消息给 `orders` 主题：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"orderId": "100"}' -Uri 'http://localhost:3601/v1.0/publish/order_pub_sub/orders'
```
{{% /codetab %}}

{{< /tabs >}}

Dapr 将在符合 Cloud Events v1.0 的信封中自动包装用户有效负载，对 `datacontenttype` 属性使用 `Content-Type` 头值。

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
           string PUBSUB_NAME = "order_pub_sub";
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
        String PUBSUB_NAME = "order_pub_sub";

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    PUBSUB_NAME = 'order_pub_sub'
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    PUBSUB_NAME = "order_pub_sub"
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
    const PUBSUB_NAME = "order_pub_sub"
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 步骤 4: ACK-ing 消息

为了告诉Dapr 消息处理成功，返回一个 `200 OK` 响应。 如果 Dapr 收到超过 `200` 的返回状态代码，或者你的应用崩溃，Dapr 将根据 At-Least-Once 语义尝试重新传递消息。

## 发送自定义 CloudEvent

Dapr 自动接收发布请求上发送的数据，并将其包装在CloudEvent 1.0 信封中。 如果您想使用自己自定义的 CloudEvent，请确保指定内容类型为 `application/ cloudevents+json`。

[请在此处阅读有关内容类型](#content-types)，以及有关 [ Cloud Events 消息格式]({{< ref "pubsub-overview.md#cloud-events-message-format" >}})。

#### 示例

{{< tabs "Dapr CLI" "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
将自定义 CloudEvent 发布到 `orders` 主题：
```bash
dapr publish --publish-app-id orderprocessing --pubsub order_pub_sub --topic orders --data '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```
{{% /codetab %}}

{{% codetab %}}
将自定义 CloudEvent 发布到 `orders` 主题：
```bash
curl -X POST http://localhost:3601/v1.0/publish/order_pub_sub/orders -H "Content-Type: application/cloudevents+json" -d '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}'
```
{{% /codetab %}}

{{% codetab %}}
将自定义 CloudEvent 发布到 `orders` 主题：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/cloudevents+json' -Body '{"specversion" : "1.0", "type" : "com.dapr.cloudevent.sent", "source" : "testcloudeventspubsub", "subject" : "Cloud Events Test", "id" : "someCloudEventId", "time" : "2021-08-02T09:00:00Z", "datacontenttype" : "application/cloudevents+json", "data" : {"orderId": "100"}}' -Uri 'http://localhost:3601/v1.0/publish/order_pub_sub/orders'
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 试试 [Pub/Sub 快速启动示例](https://github.com/dapr/quickstarts/tree/master/pub-sub)
- 了解 [PubSub 路由]({{< ref howto-route-messages >}})
- 了解 [Topic 作用域]({{< ref pubsub-scopes.md >}})
- 了解 [消息存活时间]({{< ref pubsub-message-ttl.md >}})
- 学习 [如何配置具有多个命名空间的 Pub/Sub 组件]({{< ref pubsub-namespaces.md >}})
- Pub/sub组件是可扩展的， [这里]({{< ref setup-pubsub >}})有支持的pub/sub组件列表，实现可以在[components-contrib repo](https://github.com/dapr/components-contrib)中找到。
- 阅读 [API 引用]({{< ref pubsub_api.md >}})
