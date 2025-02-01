---
type: docs
title: "操作指南：使用输入绑定触发应用程序"
linkTitle: "操作指南：输入绑定"
description: "使用Dapr输入绑定触发事件驱动的应用程序"
weight: 200
---

当外部资源发生事件时，您可以通过输入绑定来触发您的应用程序。外部资源可以是队列、消息管道、云服务、文件系统等。请求中可以发送可选的负载和元数据。

输入绑定非常适合用于事件驱动的处理、数据管道或一般的事件响应和后续处理。Dapr输入绑定允许您：

- 在不需要特定SDK或库的情况下接收事件
- 在不更改代码的情况下替换绑定
- 专注于业务逻辑而不是事件资源的实现

<img src="/images/howto-triggers/kafka-input-binding.png" width=1000 alt="示例服务的绑定图示">

本指南使用Kafka绑定作为示例。您可以从[绑定组件列表]({{< ref setup-bindings >}})中找到您偏好的绑定规范。在本指南中：

1. 示例调用`/binding`端点，使用`checkout`作为要调用的绑定名称。
1. 负载需要放在`data`字段中，可以是任何可序列化为JSON的值。
1. `operation`字段指定绑定需要执行的操作。例如，[Kafka绑定支持`create`操作]({{< ref "kafka.md#binding-support" >}})。
   - 您可以查看[每个输出绑定支持的操作（特定于每个组件）]({{< ref supported-bindings >}})。

{{% alert title="注意" color="primary" %}}
 如果您还没有尝试过，[试试绑定快速入门]({{< ref bindings-quickstart.md >}})，快速了解如何使用绑定API。

{{% /alert %}}

## 创建绑定

创建一个`binding.yaml`文件，并保存到应用程序目录中的`components`子文件夹中。

创建一个名为`checkout`的新绑定组件。在`metadata`部分中，配置以下与Kafka相关的属性：

- 您将发布消息的主题
- 代理

在创建绑定组件时，[指定绑定的支持`direction`]({{< ref "bindings_api.md#binding-direction-optional" >}})。

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}

使用`dapr run`命令的`--resources-path`标志指向您的自定义资源目录。

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
    value: input
```

{{% /codetab %}}

{{% codetab %}}

要部署到Kubernetes集群中，运行`kubectl apply -f binding.yaml`。

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
    value: input
```

{{% /codetab %}}

{{< /tabs >}}

## 监听传入事件（输入绑定）

配置您的应用程序以接收传入事件。如果您使用HTTP，您需要：
- 监听一个`POST`端点，其名称与`binding.yaml`文件中的`metadata.name`指定的绑定名称相同。
- 确保您的应用程序允许Dapr对该端点进行`OPTIONS`请求。

以下是利用Dapr SDK展示输入绑定的代码示例。

{{< tabs ".NET" Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
//依赖项
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;

//代码
namespace CheckoutService.controller
{
    [ApiController]
    public class CheckoutServiceController : Controller
    {
        [HttpPost("/checkout")]
        public ActionResult<string> getCheckout([FromBody] int orderId)
        {
            Console.WriteLine("Received Message: " + orderId);
            return "CID" + orderId;
        }
    }
}

```

{{% /codetab %}}

{{% codetab %}}

```java
//依赖项
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

//代码
@RestController
@RequestMapping("/")
public class CheckoutServiceController {
    private static final Logger log = LoggerFactory.getLogger(CheckoutServiceController.class);
        @PostMapping(path = "/checkout")
        public Mono<String> getCheckout(@RequestBody(required = false) byte[] body) {
            return Mono.fromRunnable(() ->
                    log.info("Received Message: " + new String(body)));
        }
}

```

{{% /codetab %}}

{{% codetab %}}

```python
#依赖项
import logging
from dapr.ext.grpc import App, BindingRequest

#代码
app = App()

@app.binding('checkout')
def getCheckout(request: BindingRequest):
    logging.basicConfig(level = logging.INFO)
    logging.info('Received Message : ' + request.text())

app.run(6002)

```

{{% /codetab %}}

{{% codetab %}}

```go
//依赖项
import (
	"encoding/json"
	"log"
	"net/http"
	"github.com/gorilla/mux"
)

//代码
func getCheckout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var orderId int
	err := json.NewDecoder(r.Body).Decode(&orderId)
	log.Println("Received Message: ", orderId)
	if err != nil {
		log.Printf("error parsing checkout input binding payload: %s", err)
		w.WriteHeader(http.StatusOK)
		return
	}
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/checkout", getCheckout).Methods("POST", "OPTIONS")
	http.ListenAndServe(":6002", r)
}

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
const daprPort = "3602"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start() {
    const server = new DaprServer({
        serverHost,
        serverPort,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
        clientOptions: {
            daprHost,
            daprPort, 
        }
    });
    await server.binding.receive('checkout', async (orderId) => console.log(`Received Message: ${JSON.stringify(orderId)}`));
    await server.start();
}

```

{{% /codetab %}}

{{< /tabs >}}

### 确认事件

通过从HTTP处理程序返回`200 OK`响应，告知Dapr您已成功处理应用程序中的事件。

### 拒绝事件

通过返回`200 OK`以外的任何响应，告知Dapr事件在您的应用程序中未正确处理，并安排重新投递。例如，`500 Error`。

### 指定自定义路由

默认情况下，传入事件将被发送到与输入绑定名称对应的HTTP端点。您可以通过在`binding.yaml`中设置以下元数据属性来覆盖此设置：

```yaml
name: mybinding
spec:
  type: binding.rabbitmq
  metadata:
  - name: route
    value: /onevent
```

### 事件投递保证

事件投递保证由绑定实现控制。根据绑定实现，事件投递可以是精确一次或至少一次。

## 参考资料

- [绑定构建块]({{< ref bindings >}})
- [绑定API]({{< ref bindings_api.md >}})
- [组件概念]({{< ref components-concept.md >}})
- [支持的绑定]({{< ref supported-bindings >}})
