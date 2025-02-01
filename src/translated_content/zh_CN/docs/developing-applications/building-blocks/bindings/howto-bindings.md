---
type: docs
title: "操作指南：使用输出绑定与外部资源交互"
linkTitle: "操作指南：输出绑定"
description: "通过输出绑定调用外部系统"
weight: 300
---

使用输出绑定，您可以与外部资源进行交互。在调用请求中，您可以发送可选的负载和元数据。

<img src="/images/howto-bindings/kafka-output-binding.png" width=1000 alt="示例服务的绑定图示">

本指南以Kafka绑定为例。您可以从[绑定组件列表]({{< ref setup-bindings >}})中选择您偏好的绑定规范。在本指南中：

1. 示例中调用了`/binding`端点，使用`checkout`作为要调用的绑定名称。
2. 负载放在必需的`data`字段中，可以是任何JSON可序列化的值。
3. `operation`字段指定绑定需要执行的操作。例如，[Kafka绑定支持`create`操作]({{< ref "kafka.md#binding-support" >}})。
   - 您可以查看[每个输出绑定支持的操作（特定于每个组件）]({{< ref supported-bindings >}})。

{{% alert title="注意" color="primary" %}}
如果您还没有尝试过，[请尝试绑定快速入门]({{< ref bindings-quickstart.md >}})，以快速了解如何使用bindings API。

{{% /alert %}}

## 创建绑定

创建一个`binding.yaml`文件，并将其保存到应用程序目录中的`components`子文件夹中。

创建一个名为`checkout`的新绑定组件。在`metadata`部分中，配置以下与Kafka相关的属性：

- 您将发布消息的主题
- 代理

在创建绑定组件时，[指定绑定的支持`direction`]({{< ref "bindings_api.md#binding-direction-optional" >}})。

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

使用`dapr run`的`--resources-path`标志指向您的自定义资源目录。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka代理连接设置
  - name: brokers
    value: localhost:9092
  # 消费者配置：主题和消费者组
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # 发布者配置：主题
  - name: publishTopic
    value: sample
  - name: authRequired
    value: false
  - name: direction
    value: output
```

{{% /codetab %}}

{{% codetab %}}

要将以下`binding.yaml`文件部署到Kubernetes集群中，运行`kubectl apply -f binding.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: checkout
spec:
  type: bindings.kafka
  version: v1
  metadata:
  # Kafka代理连接设置
  - name: brokers
    value: localhost:9092
  # 消费者配置：主题和消费者组
  - name: topics
    value: sample
  - name: consumerGroup
    value: group1
  # 发布者配置：主题
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

下面的代码示例利用Dapr SDK在运行的Dapr实例上调用输出绑定端点。

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
            string BINDING_NAME = "checkout";
            string BINDING_OPERATION = "create";
            while(true)
            {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                using var client = new DaprClientBuilder().Build();
                //使用Dapr SDK调用输出绑定
                await client.InvokeBindingAsync(BINDING_NAME, BINDING_OPERATION, orderId);
                Console.WriteLine("发送消息: " + orderId);
            }
        }
    }
}

```

{{% /codetab %}}

{{% codetab %}}

```java
//依赖项
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.HttpExtension;
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
		String BINDING_NAME = "checkout";
		String BINDING_OPERATION = "create";
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
          //使用Dapr SDK调用输出绑定
			client.invokeBinding(BINDING_NAME, BINDING_OPERATION, orderId).block();
			log.info("发送消息: " + orderId);
		}
	}
}

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
BINDING_NAME = 'checkout'
BINDING_OPERATION = 'create' 
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #使用Dapr SDK调用输出绑定
        resp = client.invoke_binding(BINDING_NAME, BINDING_OPERATION, json.dumps(orderId))
    logging.basicConfig(level = logging.INFO)
    logging.info('发送消息: ' + str(orderId))
    
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
        //使用Dapr SDK调用输出绑定
		in := &dapr.InvokeBindingRequest{ Name: BINDING_NAME, Operation: BINDING_OPERATION , Data: []byte(strconv.Itoa(orderId))}
		err = client.InvokeOutputBinding(ctx, in)
		log.Println("发送消息: " + strconv.Itoa(orderId))
	}
}
    
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//依赖项
import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

//代码
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
    //使用Dapr SDK调用输出绑定
    const result = await client.binding.send(BINDING_NAME, BINDING_OPERATION, orderId);
    console.log("发送消息: " + orderId);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
```

{{% /codetab %}}

{{< /tabs >}}

您还可以使用HTTP调用输出绑定端点：

```bash
curl -X POST -H 'Content-Type: application/json' http://localhost:3601/v1.0/bindings/checkout -d '{ "data": 100, "operation": "create" }'
```

观看此[视频](https://www.youtube.com/watch?v=ysklxm81MTs&feature=youtu.be&t=1960)以了解如何使用双向输出绑定。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/ysklxm81MTs?start=1960" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 参考资料

- [绑定API]({{< ref bindings_api.md >}})
- [绑定组件]({{< ref bindings >}})
- [绑定详细规格]({{< ref supported-bindings >}})
