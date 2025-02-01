---
type: docs
title: "操作指南：从存储中管理配置"
linkTitle: "操作指南：从存储中管理配置"
weight: 2000
description: "学习如何获取应用程序配置并订阅更改"
---

本示例使用Redis配置存储组件来演示如何检索配置项。

<img src="/images/building-block-configuration-example.png" width=1000 alt="示例服务获取配置的图示">

{{% alert title="注意" color="primary" %}}
如果您还没有试过，请尝试[配置快速入门]({{< ref configuration-quickstart.md >}})，快速了解如何使用配置API。

{{% /alert %}}

## 在存储中创建配置项

在支持的配置存储中创建一个配置项。这可以是一个简单的键值项，使用您选择的任何键。本示例使用Redis配置存储组件。

### 使用Docker运行Redis

```
docker run --name my-redis -p 6379:6379 -d redis:6
```

### 保存一个配置项

使用[Redis CLI](https://redis.com/blog/get-redis-cli-without-installing-redis-server/)，连接到Redis实例：

```
redis-cli -p 6379
```

保存一个配置项：

```
MSET orderId1 "101||1" orderId2 "102||1"
```

## 配置Dapr配置存储

将以下组件文件保存到您机器上的[默认组件文件夹]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}})。您可以将其用作Dapr组件YAML：

- 对于Kubernetes使用`kubectl`。
- 使用Dapr CLI运行时。

{{% alert title="注意" color="primary" %}}
由于Redis配置组件与Redis `statestore.yaml`组件具有相同的元数据，如果您已经有Redis `statestore.yaml`，可以直接复制或修改Redis状态存储组件类型。

{{% /alert %}}

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: configstore
spec:
  type: configuration.redis
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: <PASSWORD>
```

## 检索配置项
### 获取配置项

以下示例展示了如何使用Dapr配置API获取已保存的配置项。

{{< tabs ".NET" Java Python Go JavaScript "HTTP API (BASH)" "HTTP API (Powershell)">}}

{{% codetab %}}

```csharp
//依赖项
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

//代码
namespace ConfigurationApi
{
    public class Program
    {
        private static readonly string CONFIG_STORE_NAME = "configstore";

        public static async Task Main(string[] args)
        {
            using var client = new DaprClientBuilder().Build();
            var configuration = await client.GetConfiguration(CONFIG_STORE_NAME, new List<string>() { "orderId1", "orderId2" });
            Console.WriteLine($"Got key=\n{configuration[0].Key} -> {configuration[0].Value}\n{configuration[1].Key} -> {configuration[1].Value}");
        }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```java
//依赖项
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//代码
private static final String CONFIG_STORE_NAME = "configstore";

public static void main(String[] args) throws Exception {
    try (DaprClient client = (new DaprClientBuilder()).build()) {
      List<String> keys = new ArrayList<>();
      keys.add("orderId1");
      keys.add("orderId2");
      GetConfigurationRequest req = new GetConfigurationRequest(CONFIG_STORE_NAME, keys);
      try {
        Mono<List<ConfigurationItem>> items = client.getConfiguration(req);
        items.block().forEach(ConfigurationClient::print);
      } catch (Exception ex) {
        System.out.println(ex.getMessage());
      }
    }
}
```

{{% /codetab %}}

{{% codetab %}}

```python
#依赖项
from dapr.clients import DaprClient
#代码
with DaprClient() as d:
        CONFIG_STORE_NAME = 'configstore'
        keys = ['orderId1', 'orderId2']
        #Dapr启动时间
        d.wait(20)
        configuration = d.get_configuration(store_name=CONFIG_STORE_NAME, keys=[keys], config_metadata={})
        print(f"Got key={configuration.items[0].key} value={configuration.items[0].value} version={configuration.items[0].version}")
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"context"
  "fmt"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
	items, err := client.GetConfigurationItems(ctx, "configstore", ["orderId1","orderId2"])
	if err != nil {
		panic(err)
	}
  for key, item := range items {
    fmt.Printf("get config: key = %s value = %s version = %s",key,(*item).Value, (*item).Version)
  }
}
```

{{% /codetab %}}

{{% codetab %}}

```js
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

// JS SDK尚不支持通过HTTP协议的配置API
const protocol = CommunicationProtocolEnum.GRPC;
const host = process.env.DAPR_HOST ?? "localhost";
const port = process.env.DAPR_GRPC_PORT ?? 3500;

const DAPR_CONFIGURATION_STORE = "configstore";
const CONFIGURATION_ITEMS = ["orderId1", "orderId2"];

async function main() {
  const client = new DaprClient(host, port, protocol);
  // 从配置存储中获取配置项
  try {
    const config = await client.configuration.get(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
    Object.keys(config.items).forEach((key) => {
      console.log("Configuration for " + key + ":", JSON.stringify(config.items[key]));
    });
  } catch (error) {
    console.log("Could not get config item, err:" + error);
    process.exit(1);
  }
}

main().catch((e) => console.error(e));
```

{{% /codetab %}}

{{% codetab %}}

启动一个Dapr sidecar：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

在另一个终端中，获取之前保存的配置项：

```bash
curl http://localhost:3601/v1.0/configuration/configstore?key=orderId1
```

{{% /codetab %}}

{{% codetab %}}

启动一个Dapr sidecar：

```bash
dapr run --app-id orderprocessing --dapr-http-port 3601
```

在另一个终端中，获取之前保存的配置项：

```powershell
Invoke-RestMethod -Uri 'http://localhost:3601/v1.0/configuration/configstore?key=orderId1'
```

{{% /codetab %}}

{{< /tabs >}}

### 订阅配置项更新

以下是利用SDK订阅使用`configstore`存储组件的键`[orderId1, orderId2]`的代码示例。

{{< tabs ".NET" "ASP.NET Core" Java Python Go JavaScript>}}

{{% codetab %}}

```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

const string DAPR_CONFIGURATION_STORE = "configstore";
var CONFIGURATION_KEYS = new List<string> { "orderId1", "orderId2" };
var client = new DaprClientBuilder().Build();

// 订阅配置更改
SubscribeConfigurationResponse subscribe = await client.SubscribeConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);

// 打印配置更改
await foreach (var items in subscribe.Source)
{
  // 应用程序订阅配置更改时的首次调用仅返回订阅ID
  if (items.Keys.Count == 0)
  {
    Console.WriteLine("App subscribed to config changes with subscription id: " + subscribe.Id);
    subscriptionId = subscribe.Id;
    continue;
  }
  var cfg = System.Text.Json.JsonSerializer.Serialize(items);
  Console.WriteLine("Configuration update " + cfg);
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```csharp
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Dapr.Client;
using Dapr.Extensions.Configuration;
using System.Collections.Generic;
using System.Threading;

namespace ConfigurationApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Console.WriteLine("Starting application.");
            CreateHostBuilder(args).Build().Run();
            Console.WriteLine("Closing application.");
        }

        /// <summary>
        /// 创建WebHost Builder。
        /// </summary>
        /// <param name="args">参数。</param>
        /// <returns>返回IHostbuilder。</returns>
        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            var client = new DaprClientBuilder().Build();
            return Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration(config =>
                {
                    // 获取初始值并继续监视其更改。
                    config.AddDaprConfigurationStore("configstore", new List<string>() { "orderId1","orderId2" }, client, TimeSpan.FromSeconds(20));
                    config.AddStreamingDaprConfigurationStore("configstore", new List<string>() { "orderId1","orderId2" }, client, TimeSpan.FromSeconds(20));

                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
        }
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing -- dotnet run
```

{{% /codetab %}}

{{% codetab %}}

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//代码
private static final String CONFIG_STORE_NAME = "configstore";
private static String subscriptionId = null;

public static void main(String[] args) throws Exception {
    try (DaprClient client = (new DaprClientBuilder()).build()) {
      // 订阅配置更改
      List<String> keys = new ArrayList<>();
      keys.add("orderId1");
      keys.add("orderId2");
      Flux<SubscribeConfigurationResponse> subscription = client.subscribeConfiguration(DAPR_CONFIGURATON_STORE,keys);

      // 读取配置更改20秒
      subscription.subscribe((response) -> {
          // 首次响应包含订阅ID
          if (response.getItems() == null || response.getItems().isEmpty()) {
              subscriptionId = response.getSubscriptionId();
              System.out.println("App subscribed to config changes with subscription id: " + subscriptionId);
          } else {
              response.getItems().forEach((k, v) -> {
                  System.out.println("Configuration update for " + k + ": {'value':'" + v.getValue() + "'}");
              });
          }
      });
      Thread.sleep(20000);
    }
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing -- -- mvn spring-boot:run
```

{{% /codetab %}}

{{% codetab %}}

```python
#依赖项
from dapr.clients import DaprClient
#代码

def handler(id: str, resp: ConfigurationResponse):
    for key in resp.items:
        print(f"Subscribed item received key={key} value={resp.items[key].value} "
              f"version={resp.items[key].version} "
              f"metadata={resp.items[key].metadata}", flush=True)

def executeConfiguration():
    with DaprClient() as d:
        storeName = 'configurationstore'
        keys = ['orderId1', 'orderId2']
        id = d.subscribe_configuration(store_name=storeName, keys=keys,
                          handler=handler, config_metadata={})
        print("Subscription ID is", id, flush=True)
        sleep(20)

executeConfiguration()
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{% codetab %}}

```go
package main

import (
	"context"
  "fmt"
  "time"

	dapr "github.com/dapr/go-sdk/client"
)

func main() {
	ctx := context.Background()
	client, err := dapr.NewClient()
	if err != nil {
		panic(err)
	}
  subscribeID, err := client.SubscribeConfigurationItems(ctx, "configstore", []string{"orderId1", "orderId2"}, func(id string, items map[string]*dapr.ConfigurationItem) {
  for k, v := range items {
    fmt.Printf("get updated config key = %s, value = %s version = %s \n", k, v.Value, v.Version)
  }
  })
	if err != nil {
		panic(err)
	}
	time.Sleep(20*time.Second)
}
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing -- go run main.go
```

{{% /codetab %}}

{{% codetab %}}

```js
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

// JS SDK尚不支持通过HTTP协议的配置API
const protocol = CommunicationProtocolEnum.GRPC;
const host = process.env.DAPR_HOST ?? "localhost";
const port = process.env.DAPR_GRPC_PORT ?? 3500;

const DAPR_CONFIGURATION_STORE = "configstore";
const CONFIGURATION_ITEMS = ["orderId1", "orderId2"];

async function main() {
  const client = new DaprClient(host, port, protocol);
  // 订阅配置更新
  try {
    const stream = await client.configuration.subscribeWithKeys(
      DAPR_CONFIGURATION_STORE,
      CONFIGURATION_ITEMS,
      (config) => {
        console.log("Configuration update", JSON.stringify(config.items));
      }
    );
    // 取消订阅配置更新并在20秒后退出应用程序
    setTimeout(() => {
      stream.stop();
      console.log("App unsubscribed to config changes");
      process.exit(0);
    }, 20000);
  } catch (error) {
    console.log("Error subscribing to config updates, err:" + error);
    process.exit(1);
  }
}
main().catch((e) => console.error(e));
```

导航到包含上述代码的目录，然后运行以下命令以启动Dapr sidecar和订阅者应用程序：

```bash
dapr run --app-id orderprocessing --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

{{% /codetab %}}

{{< /tabs >}}

### 取消订阅配置项更新

在您订阅监视配置项后，您将收到所有订阅键的更新。要停止接收更新，您需要显式调用取消订阅API。

以下是展示如何使用取消订阅API取消订阅配置更新的代码示例。

{{< tabs ".NET" Java Python Go JavaScript "HTTP API (BASH)" "HTTP API (Powershell)">}}

{{% codetab %}}
```csharp
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

const string DAPR_CONFIGURATION_STORE = "configstore";
var client = new DaprClientBuilder().Build();

// 取消订阅配置更新并退出应用程序
async Task unsubscribe(string subscriptionId)
{
  try
  {
    await client.UnsubscribeConfiguration(DAPR_CONFIGURATION_STORE, subscriptionId);
    Console.WriteLine("App unsubscribed from config changes");
    Environment.Exit(0);
  }
  catch (Exception ex)
  {
    Console.WriteLine("Error unsubscribing from config updates: " + ex.Message);
  }
}
```
{{% /codetab %}}

{{% codetab %}}
```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//代码
private static final String CONFIG_STORE_NAME = "configstore";
private static String subscriptionId = null;

public static void main(String[] args) throws Exception {
    try (DaprClient client = (new DaprClientBuilder()).build()) {
      // 取消订阅配置更改
      UnsubscribeConfigurationResponse unsubscribe = client
              .unsubscribeConfiguration(subscriptionId, DAPR_CONFIGURATON_STORE).block();
      if (unsubscribe.getIsUnsubscribed()) {
          System.out.println("App unsubscribed to config changes");
      } else {
          System.out.println("Error unsubscribing to config updates, err:" + unsubscribe.getMessage());
      }
    } catch (Exception e) {
        System.out.println("Error unsubscribing to config updates," + e.getMessage());
        System.exit(1);
    }
}
```
{{% /codetab %}}

{{% codetab %}}
```python
import asyncio
import time
import logging
from dapr.clients import DaprClient
subscriptionID = ""

with DaprClient() as d:
  isSuccess = d.unsubscribe_configuration(store_name='configstore', id=subscriptionID)
  print(f"Unsubscribed successfully? {isSuccess}", flush=True)
```
{{% /codetab %}}

{{% codetab %}}
```go
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	dapr "github.com/dapr/go-sdk/client"
)

var DAPR_CONFIGURATION_STORE = "configstore"
var subscriptionID = ""

func main() {
	client, err := dapr.NewClient()
	if err != nil {
		log.Panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
  if err := client.UnsubscribeConfigurationItems(ctx, DAPR_CONFIGURATION_STORE , subscriptionID); err != nil {
    panic(err)
  }
}
```
{{% /codetab %}}

{{% codetab %}}
```js
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";

// JS SDK尚不支持通过HTTP协议的配置API
const protocol = CommunicationProtocolEnum.GRPC;
const host = process.env.DAPR_HOST ?? "localhost";
const port = process.env.DAPR_GRPC_PORT ?? 3500;

const DAPR_CONFIGURATION_STORE = "configstore";
const CONFIGURATION_ITEMS = ["orderId1", "orderId2"];

async function main() {
  const client = new DaprClient(host, port, protocol);

  try {
    const stream = await client.configuration.subscribeWithKeys(
      DAPR_CONFIGURATION_STORE,
      CONFIGURATION_ITEMS,
      (config) => {
        console.log("Configuration update", JSON.stringify(config.items));
      }
    );
    setTimeout(() => {
      // 取消订阅配置更新
      stream.stop();
      console.log("App unsubscribed to config changes");
      process.exit(0);
    }, 20000);
  } catch (error) {
    console.log("Error subscribing to config updates, err:" + error);
    process.exit(1);
  }
}

main().catch((e) => console.error(e));
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl 'http://localhost:<DAPR_HTTP_PORT>/v1.0/configuration/configstore/<subscription-id>/unsubscribe'
```
{{% /codetab %}}

{{% codetab %}}
```powershell
Invoke-RestMethod -Uri 'http://localhost:<DAPR_HTTP_PORT>/v1.0/configuration/configstore/<subscription-id>/unsubscribe'
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步

* 阅读[配置API概述]({{< ref configuration-api-overview.md >}})
