---
type: docs
title: "使用输出绑定调用不同的资源"
linkTitle: "How-To: 绑定"
description: "使用 Dapr 输出绑定调用外部系统"
weight: 300
---

使用绑定，可以调用外部资源，而无需绑定到特定的 SDK 或库。 有关显示输出绑定的完整示例，请访问此 [链接](https://github.com/dapr/quickstarts/tree/master/bindings)。

## 示例︰

The below code example loosely describes an application that processes orders. In the example, there is an order processing service which has a Dapr sidecar. The order processing service uses Dapr to invoke external resources, in this case a Kafka, via an output binding.

<img src="/images/building-block-output-binding-example.png" width=1000 alt="Diagram showing bindings of example service">

## 1. 创建绑定

输出绑定表示 Dapr 将使用调用和向其发送消息的资源。

就本指南的目的，您将使用 Kafka 绑定。 您可以在 [此处]({{< ref setup-bindings >}}) 找到不同绑定规范的列表。

Create a new binding component with the name of `checkout`.

在 `metadata` 部分中，配置 Kafka 相关属性，如要将消息发布到其的topics和代理。

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

创建以下 YAML 文件，名为 binding.yaml，并将其保存到应用程序的 `components` 子文件夹中。 （使用具有 `--components-path` 标记 的 `dapr run` 命令来指向自定义组件目录）

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

{{% /codetab %}}

{{% codetab %}}

要将其部署到 Kubernetes 群集中，请为你想要的[ 绑定 组件]({{< ref setup-bindings >}}) 在下面的 yaml `metadata` 中填写链接详情，保存为 `binding.yaml(在这里为kafka)`，然后运行 `kubectl apply -f binding.yaml`。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka broker connection setting
  - name: brokers
    value: localhost:9092
  # consumer configuration: topic and consumer group
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # publisher configuration: topic
  - name: publishTopic
    value: sample
  - name: authRequired
    value: "false"
```

{{% /codetab %}}

{{< /tabs >}}

## 2. Send an event (Output binding)

Below are code examples that leverage Dapr SDKs to interact with an output binding.

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
           string BINDING_NAME = "checkout";
           string BINDING_OPERATION = "create";
           while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                using var client = new DaprClientBuilder().Build();
                //Using Dapr SDK to invoke output binding
                await client.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, orderId);
                Console.WriteLine("Sending message: " + orderId);
            }
        }
    }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 --app-ssl dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
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
        String BINDING_NAME = "checkout";
        String BINDING_OPERATION = "create";
        while(true) {
            TimeUnit.MILLISECONDS.sleep(5000);
            Random random = new Random();
            int orderId = random.nextInt(1000-1) + 1;
            DaprClient client = new DaprClientBuilder().build();
          //Using Dapr SDK to invoke output binding
            client.invokeBinding(BINDING_NAME, BINDING_OPERATION, orderId).block();
            log.info("Sending message: " + orderId);
        }
    }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

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
BINDING_NAME = 'checkout'
BINDING_OPERATION = 'create' 
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to invoke output binding
        resp = client.invoke_binding(BINDING_NAME, BINDING_OPERATION, json.dumps(orderId))
    logging.basicConfig(level = logging.INFO)
    logging.info('Sending message: ' + str(orderId))

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

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
func main() {
    BINDING_NAME := "checkout";
    BINDING_OPERATION := "create";
    for i := 0; i < 10; i++ {
        time.Sleep(5000)
        orderId := rand.Intn(1000-1) + 1
        client, err := dapr.NewClient()
        if err != nil {
            panic(err)
        }
        defer client.Close()
        ctx := context.Background()
        //Using Dapr SDK to invoke output binding
        in := &dapr.InvokeBindingRequest{ Name: BINDING_NAME, Operation: BINDING_OPERATION , Data: []byte(strconv.Itoa(orderId))}
        err = client.InvokeOutputBinding(ctx, in)
        log.Println("Sending message: " + strconv.Itoa(orderId))
    }
}

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies

import { DaprServer, DaprClient, CommunicationProtocolEnum } from 'dapr-client'; 

//code
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
    const BINDING_NAME = "checkout";
    const BINDING_OPERATION = "create";
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    //Using Dapr SDK to invoke output binding
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, { orderId: orderId });
    console.log("Sending message: " + orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();

```

Navigate to the directory containing the above code, then run the following command to launch a Dapr sidecar and run the application:

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{< /tabs >}}

注: 在 Kubernetes 中运行时，使用 `kubectl apply -f binding.yaml` 将此文件应用于您的集群

You can also invoke the output bindings endpoint using HTTP:

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3601/v1.0/bindings/checkout -d '{ "data": { "orderId": "100" }, "operation": "create" }'
```

As seen above, you invoked the `/binding` endpoint with the name of the binding to invoke, in our case its `checkout`. 有效载荷位于必需的 `data` 字段中，并且可以是任何 JSON 可序列化的值。

您还会注意到，有一个 `operation` 字段告诉绑定您需要它执行的操作。 您可以查看 [这里]({{< ref supported-bindings >}}) 查看每个输出绑定都支持的操作。

观看如何使用双向输出绑定的 [视频](https://www.bilibili.com/video/BV1EA411W71L?p=3&t=1960) 。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/ysklxm81MTs?start=1960" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 参考资料

- [Binding API]({{< ref bindings_api.md >}})
- [绑定组件]({{< ref bindings >}})
- [绑定详细规范]({{< ref supported-bindings >}})
