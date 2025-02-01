---
type: docs
title: "操作指南：使用HTTP调用服务"
linkTitle: "操作指南：使用HTTP调用"
description: "通过服务调用实现服务之间的通信"
weight: 20
---

本文演示了如何部署服务，每个服务都有一个唯一的应用程序ID，以便其他服务可以通过HTTP进行服务调用来发现并调用它们的端点。

<img src="/images/building-block-service-invocation-example.png" width=1000 height=500 alt="示例服务的服务调用图示">

{{% alert title="注意" color="primary" %}}
如果您还没有尝试过，[请先查看服务调用快速入门]({{< ref serviceinvocation-quickstart.md >}})，以快速了解如何使用服务调用API。

{{% /alert %}}

## 为服务选择一个ID

Dapr允许您为应用程序分配一个全局唯一的ID。无论应用程序有多少实例，该ID都代表应用程序的状态。

{{< tabs Python JavaScript ".NET" Java Go Kubernetes >}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 checkout/app.py

dapr run --app-id order-processor --app-port 8001  --app-protocol http --dapr-http-port 3501 -- python3 order-processor/app.py
```

如果您的应用程序使用TLS，您可以通过设置`--app-protocol https`来告诉Dapr通过TLS连接调用您的应用程序：

```bash
dapr run --app-id checkout --app-protocol https --dapr-http-port 3500 -- python3 checkout/app.py

dapr run --app-id order-processor --app-port 8001 --app-protocol https --dapr-http-port 3501 -- python3 order-processor/app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start

dapr run --app-id order-processor --app-port 5001  --app-protocol http --dapr-http-port 3501 -- npm start
```

如果您的应用程序使用TLS，您可以通过设置`--app-protocol https`来告诉Dapr通过TLS连接调用您的应用程序：

```bash
dapr run --app-id checkout --dapr-http-port 3500 --app-protocol https -- npm start

dapr run --app-id order-processor --app-port 5001 --dapr-http-port 3501 --app-protocol https -- npm start
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run

dapr run --app-id order-processor --app-port 7001 --app-protocol http --dapr-http-port 3501 -- dotnet run
```

如果您的应用程序使用TLS，您可以通过设置`--app-protocol https`来告诉Dapr通过TLS连接调用您的应用程序：

```bash
dapr run --app-id checkout --dapr-http-port 3500 --app-protocol https -- dotnet run

dapr run --app-id order-processor --app-port 7001 --dapr-http-port 3501 --app-protocol https -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar

dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

如果您的应用程序使用TLS，您可以通过设置`--app-protocol https`来告诉Dapr通过TLS连接调用您的应用程序：

```bash
dapr run --app-id checkout --dapr-http-port 3500 --app-protocol https -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar

dapr run --app-id order-processor --app-port 9001 --dapr-http-port 3501 --app-protocol https -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --dapr-http-port 3500 -- go run .

dapr run --app-id order-processor --app-port 6006 --app-protocol http --dapr-http-port 3501 -- go run .
```

如果您的应用程序使用TLS，您可以通过设置`--app-protocol https`来告诉Dapr通过TLS连接调用您的应用程序：

```bash
dapr run --app-id checkout --dapr-http-port 3500 --app-protocol https -- go run .

dapr run --app-id order-processor --app-port 6006 --dapr-http-port 3501 --app-protocol https -- go run .
```

{{% /codetab %}}

{{% codetab %}}

### 在Kubernetes中部署时设置app-id

在Kubernetes中，在您的pod上设置`dapr.io/app-id`注解：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <language>-app
  namespace: default
  labels:
    app: <language>-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <language>-app
  template:
    metadata:
      labels:
        app: <language>-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "order-processor"
        dapr.io/app-port: "6001"
...
```

如果您的应用程序使用TLS连接，您可以通过`app-protocol: "https"`注解告诉Dapr通过TLS调用您的应用程序（完整列表[在此]({{< ref arguments-annotations-overview.md >}})）。请注意，Dapr不会验证应用程序提供的TLS证书。

{{% /codetab %}}

{{< /tabs >}}

## 调用服务

要使用Dapr调用应用程序，您可以在任何Dapr实例上使用`invoke` API。sidecar编程模型鼓励每个应用程序与其自己的Dapr实例交互。Dapr的sidecar会自动发现并相互通信。

以下是利用Dapr SDK进行服务调用的代码示例。

{{< tabs Python JavaScript ".NET" Java  Go >}}

{{% codetab %}}

```python
# 依赖
import random
from time import sleep
import logging
import requests

# 代码
logging.basicConfig(level = logging.INFO) 
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    # 调用服务
    result = requests.post(
       url='%s/orders' % (base_url),
       data=json.dumps(order),
       headers=headers
    )    
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
```

{{% /codetab %}}

{{% codetab %}}

```javascript
// 依赖
import axios from "axios";

// 代码
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

// 调用服务
const result = await axios.post('order-processor' , "orders/" + orderId , axiosConfig);
console.log("Order requested: " + orderId);
console.log("Result: " + result.config.data);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

{{% /codetab %}}

{{% codetab %}}

```csharp
// 依赖
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

// 代码
namespace EventService
{
  class Program
   {
       static async Task Main(string[] args)
       {
          while(true) {
               await Task.Delay(5000);
               var random = new Random();
               var orderId = random.Next(1,1000);

               // 使用Dapr SDK调用方法
               var order = new Order(orderId.ToString());

               var httpClient = DaprClient.CreateInvokeHttpClient();
               var response = await httpClient.PostAsJsonAsync("http://order-processor/orders", order);               
               var result = await response.Content.ReadAsStringAsync();
               
               Console.WriteLine("Order requested: " + orderId);
               Console.WriteLine("Result: " + result);
   	    }
       }
   }
}
```

{{% /codetab %}}

{{% codetab %}}

```java
// 依赖
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

// 代码
@SpringBootApplication
public class CheckoutServiceApplication {
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static void main(String[] args) throws InterruptedException, IOException {
        while (true) {
            TimeUnit.MILLISECONDS.sleep(5000);
            Random random = new Random();
            int orderId = random.nextInt(1000 - 1) + 1;

            // 创建一个Map来表示请求体
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("orderId", orderId);
            // 根据需要向requestBody Map添加其他字段

            HttpRequest request = HttpRequest.newBuilder()
                    .POST(HttpRequest.BodyPublishers.ofString(new JSONObject(requestBody).toString()))
                    .uri(URI.create(dapr_url))
                    .header("Content-Type", "application/json")
                    .header("dapr-app-id", "order-processor")
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Order passed: " + orderId);
            TimeUnit.MILLISECONDS.sleep(1000);

            log.info("Order requested: " + orderId);
            log.info("Result: " + response.body());
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"os"
	"time"
)

func main() {
	daprHttpPort := os.Getenv("DAPR_HTTP_PORT")
	if daprHttpPort == "" {
		daprHttpPort = "3500"
	}

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	for i := 0; i < 10; i++ {
		time.Sleep(5000)
		orderId := rand.Intn(1000-1) + 1

		url := fmt.Sprintf("http://localhost:%s/checkout/%v", daprHttpPort, orderId)
		req, err := http.NewRequest(http.MethodGet, url, nil)
		if err != nil {
			panic(err)
		}

		// 将目标应用程序ID添加为头的一部分
		req.Header.Add("dapr-app-id", "order-processor")

		// 调用服务
		resp, err := client.Do(req)
		if err != nil {
			log.Fatal(err.Error())
		}

		b, err := io.ReadAll(resp.Body)
		if err != nil {
			panic(err)
		}

		fmt.Println(string(b))
	}
}
```

{{% /codetab %}}

{{< /tabs >}}

### 其他URL格式

要调用'GET'端点：

```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

为了尽量减少URL路径的更改，Dapr提供了以下方式来调用服务API：

1. 将URL中的地址更改为`localhost:<dapr-http-port>`。
2. 添加一个`dapr-app-id`头来指定目标服务的ID，或者通过HTTP基本认证传递ID：`http://dapr-app-id:<service-id>@localhost:3602/path`。

例如，以下命令：

```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

等同于：

```bash
curl -H 'dapr-app-id: checkout' 'http://localhost:3602/checkout/100' -X POST
```

或：

```bash
curl 'http://dapr-app-id:checkout@localhost:3602/checkout/100' -X POST
```

使用CLI：

```bash
dapr invoke --app-id checkout --method checkout/100
```

#### 在URL中包含查询字符串

您还可以在URL末尾附加查询字符串或片段，Dapr将其原样传递。这意味着如果您需要在服务调用中传递一些不属于有效负载或路径的附加参数，可以通过在URL末尾附加一个`?`，然后是用`=`号分隔的键/值对，并用`&`分隔。例如：

```bash
curl 'http://dapr-app-id:checkout@localhost:3602/checkout/100?basket=1234&key=abc' -X POST
```

### 命名空间

在[支持命名空间的平台]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})上运行时，您可以在应用程序ID中包含目标应用程序的命名空间。例如，按照`<app>.<namespace>`格式，使用`checkout.production`。

在此示例中，使用命名空间调用服务将如下所示：

```bash
curl http://localhost:3602/v1.0/invoke/checkout.production/method/checkout/100 -X POST
```

有关命名空间的更多信息，请参阅[跨命名空间API规范]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}})。

## 查看跟踪和日志

我们上面的示例向您展示了如何直接调用本地或Kubernetes中运行的不同服务。Dapr：

- 输出指标、跟踪和日志信息，
- 允许您可视化服务之间的调用图并记录错误，
- 可选地，记录有效负载体。

有关跟踪和日志的更多信息，请参阅[可观察性]({{< ref observability-concept.md >}})文章。

## 相关链接

- [服务调用概述]({{< ref service-invocation-overview.md >}})
- [服务调用API规范]({{< ref service_invocation_api.md >}})
