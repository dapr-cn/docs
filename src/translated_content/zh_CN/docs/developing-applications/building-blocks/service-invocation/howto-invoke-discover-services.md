---
type: docs
title: 操作方法：使用 HTTP 调用服务
linkTitle: 操作方法：使用 HTTP 调用
description: 使用 servcie invocation 在服务之间调用
weight: 20
---

本文介绍如何使用唯一的应用程序 ID 部署每个服务，以便其他服务可以使用服务调用 API 发现和调用这些端点。

<img src="/images/building-block-service-invocation-example.png" width=1000 height=500 alt="Diagram showing service invocation of example service">

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用服务调用快速入门]({{< ref serviceinvocation-quickstart.md >}})快速了解如何使用服务调用 API。

{{% /alert %}}

## 为您的服务选择一个ID

Dapr 允许您为您的应用分配一个全局唯一ID。 此 ID 为您的应用程序封装了状态，不管它可能有多少实例。

{{< tabs Python JavaScript ".NET" Java Go Kubernetes >}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 checkout/app.py

dapr run --app-id order-processor --app-port 8001  --app-protocol http --dapr-http-port 3501 -- python3 order-processor/app.py
```

如果您的应用程序使用TLS，您可以通过设置 `--app-protocol https`，告诉Dapr通过TLS连接调用您的应用程序。

```bash
dapr run  --app-id checkout --app-protocol https --dapr-http-port 3500 -- python3 checkout/app.py

dapr run --app-id order-processor --app-port 8001 --app-protocol https --dapr-http-port 3501 -- python3 order-processor/app.py
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start

dapr run --app-id order-processor --app-port 5001  --app-protocol http --dapr-http-port 3501 -- npm start
```

如果您的应用程序使用TLS，您可以通过设置 `--app-protocol https`，告诉Dapr通过TLS连接调用您的应用程序。

```bash
dapr run  --app-id checkout --dapr-http-port 3500 --app-protocol https -- npm start

dapr run --app-id order-processor --app-port 5001 --dapr-http-port 3501 --app-protocol https -- npm start
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run  --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run

dapr run --app-id order-processor --app-port 7001 --app-protocol http --dapr-http-port 3501 -- dotnet run
```

如果您的应用程序使用TLS，您可以通过设置 `--app-protocol https`，告诉Dapr通过TLS连接调用您的应用程序。

```bash
dapr run  --app-id checkout --dapr-http-port 3500 --app-protocol https -- dotnet run

dapr run --app-id order-processor --app-port 7001 --dapr-http-port 3501 --app-protocol https -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar

dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

如果您的应用程序使用TLS，您可以通过设置 `--app-protocol https`，告诉Dapr通过TLS连接调用您的应用程序。

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

如果您的应用程序使用TLS，您可以通过设置 `--app-protocol https`，告诉Dapr通过TLS连接调用您的应用程序。

```bash
dapr run --app-id checkout --dapr-http-port 3500 --app-protocol https -- go run .

dapr run --app-id order-processor --app-port 6006 --dapr-http-port 3501 --app-protocol https -- go run .
```

{{% /codetab %}}

{{% codetab %}}

### 在部署到 Kubernetes 时设置一个应用程序的 ID

在 Kubernetes 中，在您的pod上设置`dapr.io/app-id`注解：

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

如果您的应用程序使用TLS连接，您可以使用`app-protocol: "https"`注解告知Dapr通过TLS调用您的应用程序（完整列表[在这里]({{< ref arguments-annotations-overview\.md >}})）。 请注意，Dapr 不会验证应用程序提供的 TLS 证书。

{{% /codetab %}}

{{< /tabs >}}

## 调用服务

要使用 Dapr 调用应用程序，您可以在任意 Dapr 实例中使用 `invoke` API。 Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例交互。 Dapr sidecar 之间相互发现并进行通信。

下面是利用 Dapr SDK 进行服务调用的代码示例。

{{< tabs Python JavaScript ".NET" Java  Go >}}

{{% codetab %}}

```python
#dependencies
import random
from time import sleep
import logging
import requests

#code
logging.basicConfig(level = logging.INFO) 
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
        #Invoke a service
        result = requests.post(
           url='%s/orders' % (base_url),
           data=json.dumps(order),
           headers=headers
        )    
    logging.basicConfig(level = logging.INFO)
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import axios from "axios";

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

    //Invoke a service
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
//dependencies
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

//code
namespace EventService
{
  class Program
   {
       static async Task Main(string[] args)
       {
          while(true) {
               await Task.Delay(5000)
               var random = new Random();
               var orderId = random.Next(1,1000);

               //Using Dapr SDK to invoke a method
               var order = new Order("1");
               var orderJson = JsonSerializer.Serialize<Order>(order);
               var content = new StringContent(orderJson, Encoding.UTF8, "application/json");

               var httpClient = DaprClient.CreateInvokeHttpClient();
               await httpClient.PostAsJsonAsync($"http://order-processor/orders", content);               
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
//dependencies
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

//code
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

            // Create a Map to represent the request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("orderId", orderId);
            // Add other fields to the requestBody Map as needed

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

		// Adding target app id as part of the header
		req.Header.Add("dapr-app-id", "order-processor")

		// Invoking a service
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

### 其他 URL 格式

要调用 'GET' 端点:

```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

为了尽可能避免改变 URL 路径，Dapr 提供了以下方式来调用服务调用API：

1. 将 URL 中的地址改为 `localhost:<dapr-http-port>`。
2. 添加一个 `dapr-app-id` header 来指定目标服务的ID，或者通过 HTTP Basic Auth 传递 ID：`http://dapr-app-id:<service-id>@localhost:3602/path`。

例如，以下命令:

```bash
curl http://localhost:3602/v1.0/invoke/checkout/method/checkout/100
```

等同于：

```bash
curl -H 'dapr-app-id: checkout' 'http://localhost:3602/checkout/100' -X POST
```

或者:

```bash
curl 'http://dapr-app-id:checkout@localhost:3602/checkout/100' -X POST
```

使用 CLI：

```bash
dapr invoke --app-id checkout --method checkout/100
```

### 命名空间

当在[支持命名空间的平台]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})上运行时，您需要在应用ID中包含目标应用的命名空间。 例如，按照 `<app>.<namespace>` 格式，使用 `checkout.production`。

使用此示例，调用带有命名空间的服务将如下所示:

```bash
curl http://localhost:3602/v1.0/invoke/checkout.production/method/checkout/100 -X POST
```

查看有关命名空间的更多信息，请参阅[跨命名空间API规范]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}})。

## 查看跟踪和日志

上面的示例显示了如何直接调用本地或 Kubernetes 中运行的其他服务。 Dapr:

- 输出指标、追踪和日志信息，
- 允许您可视化服务之间的调用图并记录错误日志，以及
- （可选）记录有效负载正文。

了解有关跟踪和日志的更多信息，请参阅[可观测性]({{< ref observability-concept.md >}})文章。

## 相关链接

- [服务调用概述]({{< ref service-invocation-overview\.md >}})
- [服务调用API规范]({{< ref service_invocation_api.md >}})
