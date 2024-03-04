---
type: docs
title: "操作方法：使用输出绑定连接外部资源"
linkTitle: "操作方法：输出绑定"
description: "通过输出绑定调用外部系统"
weight: 300
---


使用输出绑定，您可以调用外部资源。 调用请求可发送可选的有效载荷和元数据。

<img src="/images/howto-bindings/kafka-output-binding.png" width=1000 alt="示例服务绑定示意图">

本指南以 Kafka 绑定为例。 您可以从 [绑定组件列表]({{< ref setup-bindings >}})中找到自己喜欢的绑定规范。 在本指南中

1. 该示例调用了 `/binding` 端点，其中 `checkout`，即要调用的绑定名称。
1. 有效载荷位于必需的 `data` 字段中，并且可以是任何 JSON 可序列化的值。
1. `operation` 字段告诉绑定需要采取什么操作。 例如， [，Kafka 绑定支持 `create` 操作]({{< ref "kafka.md#binding-support" >}})。
   - 您可以查看 [，了解每个输出绑定]({{< ref supported-bindings >}})支持哪些操作（针对每个组件）。

{{% alert title="Note" color="primary" %}}
 如果您还没有， [尝试使用绑定快速入门]({{< ref bindings-quickstart.md >}}) ，快速了解如何使用绑定 API。

{{% /alert %}}

## 创建绑定

创建 `binding.yaml` 文件，并保存到应用程序目录下的 `components` 子文件夹中。

创建一个新的绑定组件，名为 `checkout`。 在 `元数据` 部分，配置以下 Kafka 相关属性：

- 您要发布信息的主题
- Broker

创建绑定组件时， [指定绑定的支持 `direction`]({{< ref "bindings_api.md#binding-direction-optional" >}})。

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

使用 `--resources-path` 标志和 `dapr run` 指向自定义资源目录。

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
    value: false
  - name: direction
    value: output
```

{{% /codetab %}}

{{% codetab %}}

要将以下 `binding.yaml` 文件部署到 Kubernetes 集群，请运行 `kubectl apply -f binding.yaml`。

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
    value: false
  - name: direction
    value: output
```

{{% /codetab %}}

{{< /tabs >}}

## 发送事件（输出绑定）

下面的代码示例利用 Dapr SDK 在运行中的 Dapr 实例上调用输出绑定端点。

{{< tabs Dotnet Java Python Go JavaScript>}}

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
            while(true)
            {
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

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

//code
const daprHost = "127.0.0.1";

(async function () {
    for (var i = 0; i < 10; i++) {
        await sleep(2000);
        const orderId = Math.floor(Math.random() * (1000 - 1) + 1);
        try {
            await sendOrder(orderId)
        } catch (err) {
            console.error(e);
            process.exit(1);
        }
    }
})();

async function sendOrder(orderId) {
    const BINDING_NAME = "checkout";
    const BINDING_OPERATION = "create";
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    //Using Dapr SDK to invoke output binding
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, orderId);
    console.log("Sending message: " + orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

{{% /codetab %}}

{{< /tabs >}}

还可以使用 HTTP 调用输出绑定端点：

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3601/v1.0/bindings/checkout -d '{ "data"：100, "operation"："create" }'
```

观看如何使用双向输出绑定的 [视频](https://www.bilibili.com/video/Bv1EA411W71L?p=3&t=1960) 。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ysklxm81MTs?start=1960" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 参考

- [Binding API]({{< ref bindings_api.md >}})
- [绑定组件]({{< ref bindings >}})
- [绑定详细规范]({{< ref supported-bindings >}})
