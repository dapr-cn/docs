---
type: docs
title: "指南：保存和获取状态"
linkTitle: "指南：如何保存和获取状态"
weight: 200
description: "使用键值对来持久化状态"
---

## 介绍

状态管理是任何应用程序最常见的需求之一：无论是新是旧，是单体还是微服务。 与不同的数据库库打交道，进行测试，处理重试和故障是很费时费力的。

Dapr提供的状态管理功能包括一致性和并发选项。 在本指南中，我们将从基础知识开始。使用键/值状态API来允许应用程序保存，获取和删除状态。

## 前提

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})

## 示例:

下面的代码例子粗略地描述了一个处理订单的应用程序。 在这个例子中，有一个订单处理服务，它有一个Dapr sidecar。 订单处理服务使用Dapr在Redis状态存储中存储状态。

<img src="/images/building-block-state-management-example.png" width=1000 alt="显示示例服务的状态管理的图示">

## 第一步：设置状态存储

状态存储组件代表Dapr用来与数据库进行通信的资源。

本手册演示使用Redis状态存储，在[支持列表]({{< ref supported-state-stores >}})中的所有状态存储均可使用。

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
当在单机模式下使用`dapr init`时，Dapr CLI会自动提供一个状态存储(Redis)，并在`components`目录中创建相关的YAML，在Linux/MacOS上位于`$HOME/.dapr/components`，在Windows上位于`%USERPROFILE%/.dapr/components`。

如果需要切换使用的状态存储引擎，用你选择的文件替换`/components`下的YAML文件`statestore.yaml`。
{{% /codetab %}}

{{% codetab %}}

若要部署在Kubernetes集群中，请在以下所示的yaml文件中对[期望状态存储组件]({{< ref supported-state-stores >}})的`metadata`进行连接信息填充，保存为`statestore.yaml`，然后运行`kubectl apply -f statestore.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```
如何在Kubernetes中设置状态存储，请查阅[这里]({{< ref "setup-state-store" >}})。

{{% /codetab %}}

{{< /tabs >}}

## 第二步：保存和检索单个状态

下面的例子显示了如何使用Dapr状态构建块来保存和检索单个的键/值对。

{{% alert title="Note" color="warning" %}}
设置一个app-id是很重要的，因为状态键是以这个值为前缀的。 如果你不设置，就会在运行期间为你自动生成一个值，而到下次运行命令时又会生成一个新的值，你将因此无法再访问以前保存的状态。
{{% /alert %}}

下面是利用 Dapr SDK 保存和检索单个状态的代码示例。

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
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
    for i := 0; i < 10; i++ {
        time.Sleep(5000)
        orderId := rand.Intn(1000-1) + 1
        client, err := dapr.NewClient()
        STATE_STORE_NAME := "statestore"
        if err != nil {
            panic(err)
        }
        defer client.Close()
        ctx := context.Background()
        //Using Dapr SDK to save and get state
        if err := client.SaveState(ctx, STATE_STORE_NAME, "order_1", []byte(strconv.Itoa(orderId))); err != nil {
            panic(err)
        }   
        result, err := client.GetState(ctx, STATE_STORE_NAME, "order_2")
        if err != nil {
            panic(err)
        }
        log.Println("Result after get: ")
        log.Println(result)
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

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
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}


{{% codetab %}}
首先启动一个Dapr sidecar：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

然后在一个单独的终端中保存一个键/值对到你的statestore中：
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "order_1", "value": "250"}]' http://localhost:3601/v1.0/state/statestore
```

现在获取你刚才保存的状态：
```bash
curl http://localhost:3601/v1.0/state/statestore/order_1
```

你也可以重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。
{{% /codetab %}}

{{% codetab %}}

首先启动一个Dapr sidecar：

```bash
dapr --app-id orderprocessing --dapr-http-port 3601 run
```

然后在一个单独的终端中保存一个键/值对到你的statestore中：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "order_1", "value": "250"}]' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

现在获取你刚才保存的状态：
```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```

你也可以重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。

{{% /codetab %}}

{{< /tabs >}}


## 第三步：删除状态

下面是利用Dapr SDKs删除状态的代码例子。

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 go run OrderProcessingService.go
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    //Using Dapr SDK to save and get state
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
    await client.state.delete(STATE_STORE_NAME, "order_1"); 
}

main();
```

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 npm start
```

{{% /codetab %}}

{{% codetab %}}
用上面运行的同一个Dapr实例运行：
```bash
curl -X DELETE 'http://localhost:3601/v1.0/state/statestore/order_1'
```
再尝试获取状态，注意没有返回任何值。
{{% /codetab %}}

{{% codetab %}}
用上面运行的同一个Dapr实例运行：
```powershell
Invoke-RestMethod -Method Delete -Uri 'http://localhost:3601/v1.0/state/statestore/order_1'
```
再尝试获取状态，注意没有返回任何值。
{{% /codetab %}}

{{< /tabs >}}

## 第四步：保存和检索多个状态

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

//code
const daprHost = "127.0.0.1"; 
var main = function() {
    const STATE_STORE_NAME = "statestore";
    var orderId = 100;
    //Using Dapr SDK to save and retrieve multiple states
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

## 第五步：执行状态事务性操作

{{% alert title="Note" color="warning" %}}
状态事务性操作需要一个支持multi-item transactions的状态存储引擎。 完整列表请查阅[受支持的状态存储]({{< ref supported-state-stores >}})。 请注意，在自托管环境中创建的默认Redis容器是支持的。
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

```bash
dapr run --app-id orderprocessing --app-port 6001 --dapr-http-port 3601 --dapr-grpc-port 60001 -- python3 OrderProcessingService.py
```

{{% /codetab %}}


{{% codetab %}}

```javascript
//dependencies
import { DaprClient, HttpMethod, CommunicationProtocolEnum } from 'dapr-client'; 

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
    const client = new DaprClient(daprHost, process.env.DAPR_HTTP_PORT, CommunicationProtocolEnum.HTTP);
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

导航到包含上述代码的目录，然后运行以下命令以启动 Dapr sidecar 并运行该应用程序：

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
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"operations": [{"operation":"upsert", "request": {"key": "order_1", "value": "250"}}, {"operation":"delete", "request": {"key": "order_2"}}]}' -Uri 'http://localhost:3601/v1.0/state/statestore'
```

现在可以看到你的状态事务操作的结果:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["order_1", "order_2"]}' -Uri 'http://localhost:3601/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 请查阅[状态API参考手册]({{< ref state_api.md >}})
- 尝试一个 [Dapr SDKs]({{< ref sdks >}})
- 构建一个 [状态服务]({{< ref howto-stateful-service.md >}})