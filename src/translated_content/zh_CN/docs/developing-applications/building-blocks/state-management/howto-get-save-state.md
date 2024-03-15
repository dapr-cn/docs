---
type: docs
title: 指南：保存和获取状态
linkTitle: 操作方法：保存和获取状态
weight: 200
description: 使用键值对来持久化状态
---

状态管理是任何应用程序最常见的需求之一：无论是新是旧，是单体还是微服务。 处理和测试不同的数据库库，并处理重试和故障可能既困难又耗时。

在本指南中，您将学习如何使用键/值状态 API 的基础知识，以允许应用程序保存、获取和删除状态。

## 如何使用Dapr扩展来开发和运行Dapr应用程序

下面的代码示例 _大致_ 描述了一个使用具有 Dapr sidecar 的订单处理服务来处理订单的应用程序。 订单处理服务使用 Dapr 在 Redis 状态存储中存储状态。

<img src="/images/building-block-state-management-example.png" width=1000 alt="Diagram showing state management of example service">

## 建立一个状态存储

状态存储组件代表Dapr用来与数据库进行通信的资源。

为了本指南的目的，我们将使用一个Redis状态存储，但是来自[支持列表]({{< ref supported-state-stores >}})的任何状态存储都可以使用。

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}

当你在自托管模式下运行`dapr init`时，Dapr会创建一个默认的Redis`statestore.yaml`并在你的本地机器上运行一个Redis状态存储，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/statestore.yaml`下

通过 `statestore.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

{{% /codetab %}}

{{% codetab %}}

要将其部署到Kubernetes集群中，请在下面的YAML中填写您的[状态存储组件]({{< ref supported-state-stores >}})的`metadata`连接详细信息，另存为`statestore.yaml`，然后运行`kubectl apply -f statestore.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

请参阅 [如何在 Kubernetes 上设置不同的状态存储]({{< ref "setup-state-store" >}})。

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="重要" color="warning" %}}
设置一个`app-id`，因为状态键是以这个值为前缀的。 如果您不设置`app-id`，系统会在运行时为您生成一个。 下次运行该命令时，将生成一个新的`app-id`，您将不再能访问先前保存的状态。
{{% /alert %}}

## 保存和检索单个状态

以下示例演示如何使用 Dapr 状态管理 API 保存和检索单个键/值对。

{{< tabs Dotnet Java Python Go Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

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
using System.Text.Json;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            while(true) {
                System.Threading.Thread.Sleep(5000);
                using var client = new DaprClientBuilder().Build();
                Random random = new Random();
                int orderId = random.Next(1,1000);
                //Using Dapr SDK to save and get state
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_1", orderId.ToString());
                await client.SaveStateAsync(DAPR_STORE_NAME, "order_2", orderId.ToString());
                var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, "order_1");
                Console.WriteLine("Result after get: " + result);
            }
        }
    }
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.client.domain.TransactionalStateOperation;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	private static final String STATE_STORE_NAME = "statestore";

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
            //Using Dapr SDK to save and get state
			client.saveState(STATE_STORE_NAME, "order_1", Integer.toString(orderId)).block();
			client.saveState(STATE_STORE_NAME, "order_2", Integer.toString(orderId)).block();
			Mono<State<String>> result = client.getState(STATE_STORE_NAME, "order_1", String.class);
			log.info("Result after get" + result);
		}
	}

}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

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
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "statestore"
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to save and get state
        client.save_state(DAPR_STORE_NAME, "order_1", str(orderId)) 
        result = client.get_state(DAPR_STORE_NAME, "order_1")
        logging.info('Result after get: ' + result.data.decode('utf-8'))
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
// dependencies
import (
	"context"
	"log"
	"math/rand"
	"strconv"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

// code
func main() {
	const STATE_STORE_NAME = "statestore"
	rand.Seed(time.Now().UnixMicro())
	for i := 0; i < 10; i++ {
		orderId := rand.Intn(1000-1) + 1
		client, err := dapr.NewClient()
		if err != nil {
			panic(err)
		}
		defer client.Close()
		ctx := context.Background()
		err = client.SaveState(ctx, STATE_STORE_NAME, "order_1", []byte(strconv.Itoa(orderId)), nil)
		if err != nil {
			panic(err)
		}
		result, err := client.GetState(ctx, STATE_STORE_NAME, "order_1", nil)
		if err != nil {
			panic(err)
		}
		log.Println("Result after get:", string(result.Value))
		time.Sleep(2 * time.Second)
	}
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

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
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and get state
    await client.state.save(STATE_STORE_NAME, [
        {
            key: "order_1",
            value: orderId.toString()
        },
        {
            key: "order_2",
            value: orderId.toString()
        }
    ]);
    var result = await client.state.get(STATE_STORE_NAME, "order_1");
    console.log("Result after get: " + result);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}

启动 Dapr Sidecar：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

在一个单独的终端中，将一个键/值对保存到你的状态存储中：

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250"}]' http://localhost:3601/v1.0/state/statestore
```

现在获取你刚才保存的状态：

```bash
curl http://localhost:3601/v1.0/state/statestore/order_1
```

重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。

{{% /codetab %}}

{{% codetab %}}

启动 Dapr Sidecar：

```bash
dapr --app-id orderprocessing --dapr-http-port 3601 run
```

在一个单独的终端中，将一个键/值对保存到你的状态存储中：

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "order_1", "value": "250"}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

现在获取你刚才保存的状态：

```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```

重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。

{{% /codetab %}}

{{< /tabs >}}

## Delete state

下面是利用 Dapr SDKs 删除状态的代码例子。

{{< tabs Dotnet Java Python Go Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```csharp
//dependencies
using Dapr.Client;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            //Using Dapr SDK to delete the state
            using var client = new DaprClientBuilder().Build();
            await client.DeleteStateAsync(DAPR_STORE_NAME, "order_1", cancellationToken: cancellationToken);
        }
    }
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import org.springframework.boot.autoconfigure.SpringBootApplication;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {
	public static void main(String[] args) throws InterruptedException{
        String STATE_STORE_NAME = "statestore";

        //Using Dapr SDK to delete the state
        DaprClient client = new DaprClientBuilder().build();
        String storedEtag = client.getState(STATE_STORE_NAME, "order_1", String.class).block().getEtag();
        client.deleteState(STATE_STORE_NAME, "order_1", storedEtag, null).block();
	}
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "statestore"

#Using Dapr SDK to delete the state
with DaprClient() as client:
    client.delete_state(store_name=DAPR_STORE_NAME, key="order_1")
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
//dependencies
import (
	"context"
	dapr "github.com/dapr/go-sdk/client"

)

//code
func main() {
    STATE_STORE_NAME := "statestore"
    //Using Dapr SDK to delete the state
    client, err := dapr.NewClient()
    if err != nil {
        panic(err)
    }
    defer client.Close()
    ctx := context.Background()

    if err := client.DeleteState(ctx, STATE_STORE_NAME, "order_1"); err != nil {
        panic(err)
    }
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and get state
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });
    
    await client.state.delete(STATE_STORE_NAME, "order_1"); 
}

main();
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}

用上面运行的同一个Dapr实例运行：

```bash
curl -X DELETE 'http://localhost:3601/v1.0/state/statestore/order_1'
```

再次尝试获取状态。 请注意，不会返回任何值。

{{% /codetab %}}

{{% codetab %}}

用上面运行的同一个Dapr实例运行：

```powershell
Invoke-RestMethod -Method Delete -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```

再次尝试获取状态。 请注意，不会返回任何值。

{{% /codetab %}}

{{< /tabs >}}

## 保存和检索多个状态

下面是利用 Dapr SDK 保存和检索多个状态的代码示例。

{{< tabs Dotnet Java Python Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```csharp
//dependencies
using Dapr.Client;
//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            //Using Dapr SDK to retrieve multiple states
            using var client = new DaprClientBuilder().Build();
            IReadOnlyList<BulkStateItem> mulitpleStateResult = await client.GetBulkStateAsync(DAPR_STORE_NAME, new List<string> { "order_1", "order_2" }, parallelism: 1);
        }
    }
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

上面的示例返回一个`BulkStateItem`，其中包含您保存到状态中的值的序列化格式。 如果您希望该值在SDK中反序列化每个批量响应项时，请改用以下方法：

```csharp
//dependencies
using Dapr.Client;
//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            //Using Dapr SDK to retrieve multiple states
            using var client = new DaprClientBuilder().Build();
            IReadOnlyList<BulkStateItem<Widget>> mulitpleStateResult = await client.GetBulkStateAsync<Widget>(DAPR_STORE_NAME, new List<string> { "widget_1", "widget_2" }, parallelism: 1);
        }
    }

    class Widget
    {
        string Size { get; set; }
        string Color { get; set; }        
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import java.util.Arrays;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	public static void main(String[] args) throws InterruptedException{
        String STATE_STORE_NAME = "statestore";
        //Using Dapr SDK to retrieve multiple states
        DaprClient client = new DaprClientBuilder().build();
        Mono<List<State<String>>> resultBulk = client.getBulkState(STATE_STORE_NAME,
        Arrays.asList("order_1", "order_2"), String.class);
	}
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#dependencies
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem

#code
logging.basicConfig(level = logging.INFO)
DAPR_STORE_NAME = "statestore"
orderId = 100
#Using Dapr SDK to save and retrieve multiple states
with DaprClient() as client:
    client.save_bulk_state(store_name=DAPR_STORE_NAME, states=[StateItem(key="order_2", value=str(orderId))])
    result = client.get_bulk_state(store_name=DAPR_STORE_NAME, keys=["order_1", "order_2"], states_metadata={"metakey": "metavalue"}).items
    logging.info('Result after get bulk: ' + str(result)) 
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    var orderId = 100;
    //Using Dapr SDK to save and retrieve multiple states
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });

    await client.state.save(STATE_STORE_NAME, [
        {
            key: "order_1",
            value: orderId.toString()
        },
        {
            key: "order_2",
            value: orderId.toString()
        }
    ]);
    result = await client.state.getBulk(STATE_STORE_NAME, ["order_1", "order_2"]);
}

main();
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}

用上面运行的同一个Dapr实例将两个键/值对保存到你的状态存储中。

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250"}, { "key": "order_2", "value": "550"}]' http://localhost:3601/v1.0/state/statestore
```

现在获取你刚才保存的状态：

```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["order_1", "order_2"]}' http://localhost:3601/v1.0/state/statestore/bulk
```

{{% /codetab %}}

{{% codetab %}}

用上面运行的同一个Dapr实例将两个键/值对保存到你的状态存储中。

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "order_1", "value": "250"}, { "key": "order_2", "value": "550"}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

现在获取你刚才保存的状态：

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["order_1", "order_2"]}' -Uri 'http://localhost:3601/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

## 执行状态事务性操作

{{% alert title="注意" color="primary" %}}
状态事务性操作需要一个支持multi-item transactions的状态存储。 在[支持的状态存储引擎页面]({{< ref supported-state-stores >}})查看完整列表。
{{% /alert %}}

下面是利用 Dapr SDK 执行状态事务的代码示例。

{{< tabs Dotnet Java Python Javascript "HTTP API (Bash)" "HTTP API (PowerShell)">}}

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
using System.Text.Json;

//code
namespace EventService
{
    class Program
    {
        static async Task Main(string[] args)
        {
            string DAPR_STORE_NAME = "statestore";
            while(true) {
                System.Threading.Thread.Sleep(5000);
                Random random = new Random();
                int orderId = random.Next(1,1000);
                using var client = new DaprClientBuilder().Build();
                var requests = new List<StateTransactionRequest>()
                {
                    new StateTransactionRequest("order_3", JsonSerializer.SerializeToUtf8Bytes(orderId.ToString()), StateOperationType.Upsert),
                    new StateTransactionRequest("order_2", null, StateOperationType.Delete)
                };
                CancellationTokenSource source = new CancellationTokenSource();
                CancellationToken cancellationToken = source.Token;
                //Using Dapr SDK to perform the state transactions
                await client.ExecuteStateTransactionAsync(DAPR_STORE_NAME, requests, cancellationToken: cancellationToken);
                Console.WriteLine("Order requested: " + orderId);
                Console.WriteLine("Result: " + result);
            }
        }
    }
}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
//dependencies
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import io.dapr.client.domain.TransactionalStateOperation;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import reactor.core.publisher.Mono;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.TimeUnit;

//code
@SpringBootApplication
public class OrderProcessingServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(OrderProcessingServiceApplication.class);

	private static final String STATE_STORE_NAME = "statestore";

	public static void main(String[] args) throws InterruptedException{
		while(true) {
			TimeUnit.MILLISECONDS.sleep(5000);
			Random random = new Random();
			int orderId = random.nextInt(1000-1) + 1;
			DaprClient client = new DaprClientBuilder().build();
			List<TransactionalStateOperation<?>> operationList = new ArrayList<>();
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.UPSERT,
					new State<>("order_3", Integer.toString(orderId), "")));
			operationList.add(new TransactionalStateOperation<>(TransactionalStateOperation.OperationType.DELETE,
					new State<>("order_2")));
            //Using Dapr SDK to perform the state transactions
			client.executeStateTransaction(STATE_STORE_NAME, operationList).block();
			log.info("Order requested: " + orderId);
		}
	}

}
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

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
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

#code
logging.basicConfig(level = logging.INFO)    
DAPR_STORE_NAME = "statestore"
while True:
    sleep(random.randrange(50, 5000) / 1000)
    orderId = random.randint(1, 1000)
    with DaprClient() as client:
        #Using Dapr SDK to perform the state transactions
        client.execute_state_transaction(store_name=DAPR_STORE_NAME, operations=[
            TransactionalStateOperation(
                operation_type=TransactionOperationType.upsert,
                key="order_3",
                data=str(orderId)),
            TransactionalStateOperation(key="order_3", data=str(orderId)),
            TransactionalStateOperation(
                operation_type=TransactionOperationType.delete,
                key="order_2",
                data=str(orderId)),
            TransactionalStateOperation(key="order_2", data=str(orderId))
        ])

    client.delete_state(store_name=DAPR_STORE_NAME, key="order_1")
    logging.basicConfig(level = logging.INFO)
    logging.info('Order requested: ' + str(orderId))
    logging.info('Result: ' + str(result))
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from '@dapr/dapr'; 

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
    const client = new DaprClient({
        daprHost,
        daprPort: process.env.DAPR_HTTP_PORT,
        communicationProtocol: CommunicationProtocolEnum.HTTP,
    });

    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and retrieve multiple states
    await client.state.transaction(STATE_STORE_NAME, [
        {
        operation: "upsert",
        request: {
            key: "order_3",
            value: orderId.toString()
        }
        },
        {
        operation: "delete",
        request: {
            key: "order_2"
        }
        }
    ]);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main();
```

要启动上述示例应用程序的 Dapr sidecar，请运行类似以下命令：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}

在上面运行的同一个Dapr实例中，执行两个状态事务。

```bash
curl -X POST -H "Content-Type: application/json" -d '{"operations": [{"operation":"upsert", "request": {"key": "order_1", "value": "250"}}, {"operation":"delete", "request": {"key": "order_2"}}]}' http://localhost:3601/v1.0/state/statestore/transaction
```

现在可以看到你的状态事务操作的结果:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["order_1", "order_2"]}' http://localhost:3601/v1.0/state/statestore/bulk
```

{{% /codetab %}}

{{% codetab %}}

用上面运行的同一个Dapr实例将两个键/值对保存到你的状态存储中。

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"operations": [{"operation":"upsert", "request": {"key": "order_1", "value": "250"}}, {"operation":"delete", "request": {"key": "order_2"}}]}' -Uri 'http://localhost:3601/v1.0/state/statestore/transaction'
```

现在可以看到你的状态事务操作的结果:

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["order_1", "order_2"]}' -Uri 'http://localhost:3601/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 阅读完整的[State API参考]({{< ref state_api.md >}})
- 尝试使用其中一个[Dapr SDK]({{< ref sdks >}})
- 构建一个[stateful service]({{< ref howto-stateful-service.md >}})
