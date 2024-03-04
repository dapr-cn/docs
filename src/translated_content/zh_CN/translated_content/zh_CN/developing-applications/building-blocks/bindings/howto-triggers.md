---
type: docs
title: "操作方法：使用输入绑定来触发应用程序"
linkTitle: "操作方法： 输入绑定"
description: "使用 Dapr 输入绑定来触发由事件驱动的程序"
weight: 200
---

通过输入绑定，您可以在外部资源发生事件时触发应用程序。 一个外部资源可以是队列、消息管道、云服务、文件系统等。 可选择随请求发送有效载荷和元数据。

输入绑定对于事件驱动的处理，数据管道或通常对事件作出反应并执行进一步处理非常理想。 Dapr 输入绑定允许您:

- 接收不包含特定 SDK 或库的事件
- 在不更改代码的情况下替换绑定
- 关注业务逻辑而不是事件资源实现

<img src="/images/howto-triggers/kafka-input-binding.png" width=1000 alt="显示示例服务绑定的图示">

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

使用 `--resources-path` 标志与 `dapr run` 命令一起使用，指向您的自定义资源目录。

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
    value: input
```

{{% /codetab %}}

{{% codetab %}}

要将部署到 Kubernetes 集群中，请运行 `kubectl apply -f binding.yaml`。

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
    value: input
```

{{% /codetab %}}

{{< /tabs >}}

## 监听传入事件 (输入绑定)

现在配置您的应用程序来接收传入事件。 如果您正在使用HTTP，您需要：
- 收听 `POST` 终结点替换为绑定的名称，如 `metadata.name` 在 `binding.yaml` 文件。
- 验证您的应用程序允许 Dapr 为此端点进行 `OPTIONS` 请求。

下面是利用 Dapr SDK 展示输出绑定的代码示例。

{{< tabs Dotnet Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
//dependencies
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Mvc;

//code
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
//dependencies
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;

//code
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
#dependencies
import logging
from dapr.ext.grpc import App, BindingRequest

#code
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
//dependencies
import (
    "encoding/json"
    "log"
    "net/http"
    "github.com/gorilla/mux"
)

//code
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
//dependencies 
import { DaprServer, CommunicationProtocolEnum } from '@dapr/dapr'; 

//code
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

### ACK一个事件

通过从您的 HTTP 处理程序返回一个 `200 OK` 响应，告诉 Dapr 您已成功处理了应用程序中的事件。

### 拒绝事件

告诉 Dapr 事件在您的应用程序中未正确处理，并通过返回任何与 `200 OK`不同的响应来安排重新交付。 例如，一个 `500 错误`。

### 指定自定义路由

默认情况下，传入事件将发送到与输入绑定的名称对应的 HTTP 端点。 您可以通过在 `binding.yaml`中设置以下元数据属性来覆盖此设置：

```yaml
name: mybinding
spec:
  type: binding.rabbitmq
  metadata:
  - name: route
    value: /onevent
```

### 事件传递保证

事件传递保证由绑定实现控制。 根据绑定实现，事件传递可以正好一次或至少一次。

## 参考

- [绑定构建块]({{< ref bindings >}})
- [Bindings API]({{< ref bindings_api.md >}})
- [组件概念]({{< ref components-concept.md >}})
- [Supported bindings]({{< ref supported-bindings >}})
