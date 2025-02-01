---
type: docs
title: "如何：发布消息并订阅主题"
linkTitle: "如何：发布 & 订阅主题"
weight: 2000
description: "学习如何使用一个服务向主题发送消息，并在另一个服务中订阅该主题"
---

既然您已经了解了Dapr pubsub构建块的功能，接下来我们来看看如何在您的服务中应用它。下面的代码示例描述了一个使用两个服务处理订单的应用程序，每个服务都有Dapr sidecar：

- 一个结账服务，使用Dapr订阅消息队列中的主题。
- 一个订单处理服务，使用Dapr向RabbitMQ发布消息。

<img src="/images/pubsub-howto-overview.png" width=1000 alt="示例服务的状态管理图">

Dapr会自动将用户的负载封装在符合CloudEvents v1.0的格式中，并使用`Content-Type`头的值作为`datacontenttype`属性。[了解更多关于CloudEvents的消息。]({{< ref pubsub-cloudevents.md >}})

以下示例展示了如何在您的应用程序中发布和订阅名为`orders`的主题。

{{% alert title="注意" color="primary" %}}
如果您还没有，请[尝试pubsub快速入门]({{< ref pubsub-quickstart.md >}})，快速了解如何使用pubsub。

{{% /alert %}}

## 设置Pub/Sub组件

第一步是设置pubsub组件：

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
当您运行`dapr init`时，Dapr会创建一个默认的Redis `pubsub.yaml`并在您的本地机器上运行一个Redis容器，位置如下：

- 在Windows上，位于`%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，位于`~/.dapr/components/pubsub.yaml`

使用`pubsub.yaml`组件，您可以轻松地更换底层组件而无需更改应用程序代码。在此示例中，使用RabbitMQ。

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

您可以通过创建一个包含该文件的组件目录（在此示例中为`myComponents`）并使用`dapr run` CLI命令的`--resources-path`标志来覆盖此文件。

{{< tabs ".NET" Java Python Go JavaScript >}}

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
要将其部署到Kubernetes集群中，请填写以下YAML中的[pub/sub组件]({{< ref setup-pubsub >}})的`metadata`连接详细信息，保存为`pubsub.yaml`，然后运行`kubectl apply -f pubsub.yaml`。

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

Dapr提供了三种方法来订阅主题：

- **声明式**，在外部文件中定义订阅。
- **流式**，在用户代码中定义订阅。
- **编程式**，在用户代码中定义订阅。

在[声明式、流式和编程式订阅文档]({{< ref subscription-methods.md >}})中了解更多信息。此示例演示了**声明式**订阅。

创建一个名为`subscription.yaml`的文件并粘贴以下内容：

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

上面的示例显示了对主题`orders`的事件订阅，针对pubsub组件`order-pub-sub`。

- `route`字段指示Dapr将所有主题消息发送到应用程序中的`/checkout`端点。
- `scopes`字段指定此订阅适用于ID为`orderprocessing`和`checkout`的应用程序。

将`subscription.yaml`放在与您的`pubsub.yaml`组件相同的目录中。当Dapr启动时，它会加载订阅和组件。

{{% alert title="注意" color="primary" %}}
此功能目前处于预览阶段。
Dapr可以实现“热重载”声明式订阅，从而在不需要重启的情况下自动拾取更新。
这通过[`HotReload`功能门]({{< ref "support-preview-features.md" >}})启用。
为了防止重新处理或丢失未处理的消息，在Dapr和您的应用程序之间的飞行消息在热重载事件期间不受影响。
{{% /alert %}}

以下是利用Dapr SDK订阅您在`subscription.yaml`中定义的主题的代码示例。

{{< tabs ".NET" Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
//依赖项 
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;
using Dapr;
using Dapr.Client;

//代码
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
         //订阅一个主题 
        [Topic("order-pub-sub", "orders")]
        [HttpPost("checkout")]
        public void getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("订阅者接收到 : " + orderId);
        }
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-protocol https dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//依赖项
import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

//代码
@RestController
public class CheckoutServiceController {

    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
     //订阅一个主题
    @Topic(name = "orders", pubsubName = "order-pub-sub")
    @PostMapping(path = "/checkout")
    public Mono<Void> getCheckout(@RequestBody(required = false) CloudEvent<String> cloudEvent) {
        return Mono.fromRunnable(() -> {
            try {
                log.info("订阅者接收到: " + cloudEvent.getData());
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#依赖项
from cloudevents.sdk.event import v1
from dapr.ext.grpc import App
import logging
import json

#代码
app = App()
logging.basicConfig(level = logging.INFO)
#订阅一个主题 
@app.subscribe(pubsub_name='order-pub-sub', topic='orders')
def mytopic(event: v1.Event) -> None:
    data = json.loads(event.Data())
    logging.info('订阅者接收到: ' + str(data))

app.run(6002)
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc -- python3 CheckoutService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//依赖项
import (
	"log"
	"net/http"
	"context"

	"github.com/dapr/go-sdk/service/common"
	daprd "github.com/dapr/go-sdk/service/http"
)

//代码
var sub = &common.Subscription{
	PubsubName: "order-pub-sub",
	Topic:      "orders",
	Route:      "/checkout",
}

func main() {
	s := daprd.NewService(":6002")
   //订阅一个主题
	if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
		log.Fatalf("添加主题订阅时出错: %v", err)
	}
	if err := s.Start(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("监听时出错: %v", err)
	}
}

func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("订阅者接收到: %s", e.Data)
	return false, nil
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 go run CheckoutService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//依赖项
import { DaprServer, CommunicationProtocolEnum } from '@dapr/dapr'; 

//代码
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
    //订阅一个主题
    await server.pubsub.subscribe("order-pub-sub", "orders", async (orderId) => {
        console.log(`订阅者接收到: ${JSON.stringify(orderId)}`)
    });
    await server.start();
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 发布消息

启动一个名为`orderprocessing`的Dapr实例：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

然后向`orders`主题发布消息：

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

以下是利用Dapr SDK发布主题的代码示例。

{{< tabs ".NET" Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
//依赖项
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

//代码
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
                //使用Dapr SDK发布主题
                await client.PublishEventAsync(PUBSUB_NAME, TOPIC_NAME, orderId, cancellationToken);
                Console.WriteLine("发布的数据: " + orderId);
		        }
        }
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和发布者应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-protocol https dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//依赖项
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;
import static java.util.Collections.singletonMap;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//代码
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
      //使用Dapr SDK发布主题
			client.publishEvent(
					PUBSUB_NAME,
					TOPIC_NAME,
					orderId,
					singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
			log.info("发布的数据:" + orderId);
		}
	}
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和发布者应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#依赖项  
import random
from time import sleep    
import requests
import logging
import json
from dapr.clients import DaprClient

#代码
logging.basicConfig(level = logging.INFO)
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    PUBSUB_NAME = 'order-pub-sub'
    TOPIC_NAME = 'orders'
    with DaprClient() as client:
        #使用Dapr SDK发布主题
        result = client.publish_event(
            pubsub_name=PUBSUB_NAME,
            topic_name=TOPIC_NAME,
            data=json.dumps(orderId),
            data_content_type='application/json',
        )
    logging.info('发布的数据: ' + str(orderId))
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和发布者应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --app-protocol grpc python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//依赖项
import (
	"context"
	"log"
	"math/rand"
	"time"
	"strconv"
	dapr "github.com/dapr/go-sdk/client"
)

//代码
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
    //使用Dapr SDK发布主题
		if err := client.PublishEvent(ctx, PUBSUB_NAME, TOPIC_NAME, []byte(strconv.Itoa(orderId))); 
		err != nil {
			panic(err)
		}

		log.Println("发布的数据: " + strconv.Itoa(orderId))
	}
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和发布者应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//依赖项
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
    console.log("发布的数据:" + orderId)
    //使用Dapr SDK发布主题
    await client.pubsub.publish(PUBSUB_NAME, TOPIC_NAME, orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和发布者应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

## 消息确认和重试

为了告诉Dapr消息已成功处理，返回`200 OK`响应。如果Dapr收到的返回状态码不是`200`，或者您的应用程序崩溃，Dapr将尝试根据至少一次语义重新传递消息。

## 演示视频

观看[此演示视频](https://youtu.be/1dqe1k-FXJQ?si=s3gvWxRxeOsmXuE1)以了解更多关于Dapr的pubsub消息传递。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/1dqe1k-FXJQ?si=s3gvWxRxeOsmXuE1" title="YouTube视频播放器" style="padding-bottom:25px;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 下一步

- 尝试[pubsub教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)。
- 了解[使用CloudEvents进行消息传递]({{< ref pubsub-cloudevents.md >}})以及何时可能需要[发送不带CloudEvents的消息]({{< ref pubsub-raw.md >}})。
- 查看[pubsub组件]({{< ref setup-pubsub >}})列表。
- 阅读[API参考]({{< ref pubsub_api.md >}})。
