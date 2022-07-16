---
type: docs
title: "How-To: 使用输入绑定来触发应用程序"
linkTitle: "How-To: 输入绑定"
description: "使用 Dapr 输入绑定来触发由事件驱动的程序"
weight: 200
---

使用绑定，代码可以被来自不同资源的传入事件触发，这些事件可以是任何内容：队列、消息传递管道、云服务、文件系统等。

这对于事件驱动的处理，数据管道或只是对事件作出反应并进一步处理都很理想。

Dapr 绑定允许您 :

* 接收不包含特定 SDK 或库的事件
* 在不更改代码的情况下替换绑定
* 关注业务逻辑而不是事件资源实现

更多关于绑定的信息，请查阅[概览]({{<ref bindings-overview.md>}})

## 示例:

以下的示例简述了一个订单处理程序。 在示例中，有一个订单处理服务，它具有 Dapr sidecar。 checkout 服务使用 Dapr 通过输入绑定触发应用程序。

<img src="/images/building-block-input-binding-example.png" width=1000 alt="显示示例服务绑定的图示">

## 1. 创建绑定

输入绑定表示 Dapr 用于从中读取事件并推送到应用程序的资源。

就本指南的目的，您将使用 Kafka 绑定。 您可以在[此处]({{< ref setup-bindings >}})找到支持的绑定组件列表。

创建一个名称为 `checkout`的新绑定组件。

在 `metadata` 部分中，配置与 Kafka 相关的属性，例如要将消息发布到的主题和代理。

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

## 2. 监听传入事件（输入绑定）

现在配置您的应用程序来接收传入事件。 如果使用 HTTP ，那么需要监听在文件 `metadata.name` 中指定的绑定名称所对应的`POST` 终结点。

下面是利用 Dapr SDK 演示输出绑定的代码示例。

{{< tabs Dotnet Java Python Go Javascript>}}

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 --app-ssl dotnet run
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 mvn spring-boot:run
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --app-protocol grpc -- python3 CheckoutService.py
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
const daprPort = "3602"; 

start().catch((e) => {
    console.error(e);
    process.exit(1);
});

async function start() {
    const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, CommunicationProtocolEnum.HTTP);
    await server.binding.receive('checkout', async (orderId) => console.log(`Received Message: ${JSON.stringify(orderId)}`));
    await server.startServer();
}

```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id checkout --app-port 6002 --dapr-http-port 3602 --dapr-grpc-port 60002 dotnet npm start
```

{{% /codetab %}}

{{< /tabs >}}

### 确认事件

为了告诉 Dapr 您成功处理了应用程序中的事件，请从 http 处理程序 返回 `200 OK` 响应。

### 拒绝事件

为了告诉 Dapr 您的应用程序中未正确处理该事件并安排重新传递，请返回除 `200 OK`以外的任何响应。 例如， `500 Error`。

### 指定自定义路由

默认情况下，传入事件将发送到与输入绑定的名称对应的 HTTP 终结点。 您可以通过设置以下元数据属性来覆盖此属性：

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

## 参考资料

* [绑定构建块]({{< ref bindings >}})
* [绑定 API]({{< ref bindings_api.md >}})
* [Components concept]({{< ref components-concept.md >}})
* [Supported bindings]({{< ref supported-bindings >}})
