---
type: docs
title: "操作方法：从存储管理配置"
linkTitle: "操作方法：从存储管理配置"
weight: 2000
description: "了解如何获取应用程序配置并订阅更改"
---

This example uses the Redis configuration store component to demonstrate how to retrieve a configuration item.

{{% alert title="Note" color="primary" %}}
*此 API 目前在 `Alpha` 并且只能在 gRPC 上使用。 在将 API 认证为 `Stable` 状态之前，将提供具有此 URL 语法 `/v1.0/configuration` 的 HTTP1.1 支持版本。

{{% /alert %}}

<img src="/images/building-block-configuration-example.png" width=1000 alt="显示获取示例服务配置的图示">

## Create a configuration item in store

Create a configuration item in a supported configuration store. 这可以是一个简单的键值项，具有您选择的任何键。 As mentioned earlier, this example uses the Redis configuration store component.

### 使用 Docker 运行 Redis

```
docker run --name my-redis -p 6379:6379 -d redis
```

### 保存项目

使用 [Redis CLI](https://redis.com/blog/get-redis-cli-without-installing-redis-server/)连接到 Redis 实例：

```
redis-cli -p 6379 
```

保存配置项目：

```
MSET orderId1 "101||1" orderId2 "102||1"
```

### 配置 Dapr 配置存储

Save the following component file to the [default components folder]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}) on your machine. You can use this as the Dapr component YAML:

- For Kubernetes using `kubectl`.
- When running with the Dapr CLI.

{{% alert title="Note" color="primary" %}}
 Since the Redis configuration component has identical metadata to the Redis `statestore.yaml` component, you can simply copy/change the Redis state store component type if you already have a Redis `statestore.yaml`.

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

### 使用 Dapr SDK 获取配置项

{{< tabs Dotnet Java Python>}}

{{% codetab %}}

```csharp
//dependencies
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Dapr.Client;

//code
namespace ConfigurationApi
{
    public class Program
    {
        private static readonly string CONFIG_STORE_NAME = "configstore";

        [Obsolete]
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
//dependencies
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

//code
private static final String CONFIG_STORE_NAME = "configstore";

public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
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
#dependencies
from dapr.clients import DaprClient
#code
with DaprClient() as d:
        CONFIG_STORE_NAME = 'configstore'
        keys = ['orderId1', 'orderId2']
        #Startup time for dapr
        d.wait(20)
        configuration = d.get_configuration(store_name=CONFIG_STORE_NAME, keys=[keys], config_metadata={})
        print(f"Got key={configuration.items[0].key} value={configuration.items[0].value} version={configuration.items[0].version}")
```

{{% /codetab %}}

{{< /tabs >}}

### 使用 gRPC API 获取配置项目

使用您 [喜欢的语言](https://grpc.io/docs/languages/)，从 [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto)创建一个 Dapr gRPC 客户端。 以下示例显示了 Java、C#、Python 和 Javascript 客户端。

{{< tabs Java Dotnet Python Javascript >}}

{{% codetab %}}

```java

Dapr.ServiceBlockingStub stub = Dapr.newBlockingStub(channel);
stub.GetConfigurationAlpha1(new GetConfigurationRequest{ StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```

{{% /codetab %}}

{{% codetab %}}

```csharp

var call = client.GetConfigurationAlpha1(new GetConfigurationRequest { StoreName = "redisconfigstore", Keys = new String[]{"myconfig"} });
```

{{% /codetab %}}

{{% codetab %}}

```python
response = stub.GetConfigurationAlpha1(request={ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```

{{% /codetab %}}

{{% codetab %}}

```javascript
client.GetConfigurationAlpha1({ StoreName: 'redisconfigstore', Keys = ['myconfig'] })
```

{{% /codetab %}}

{{< /tabs >}}

#### 监视配置项目

使用您的[首选语言](https://grpc.io/docs/languages/)从 [Dapr proto](https://github.com/dapr/dapr/blob/master/dapr/proto/runtime/v1/dapr.proto) 创建 Dapr gRPC 客户端。 Use the `SubscribeConfigurationAlpha1` proto method on your client stub to start subscribing to events. 该方法接受以下请求对象：

```proto
message SubscribeConfigurationRequest {
  // The name of configuration store.
  string store_name = 1;

  // Optional. The key of the configuration item to fetch.
  // If set, only query for the specified configuration items.
  // Empty list means fetch all.
  repeated string keys = 2;

  // The metadata which will be sent to configuration store components.
  map<string,string> metadata = 3;
}
```

使用此方法，您可以订阅给定配置存储的特定密钥中的更改。 gRPC 流因语言而异 - 有关用法，请参阅此处的 [gRPC 示例](https://grpc.io/docs/languages/) 。

Below are the examples in sdks:

{{< tabs Python>}}

{{% codetab %}}
```python
#dependencies
import asyncio
from dapr.clients import DaprClient
#code
async def executeConfiguration():
    with DaprClient() as d:
        CONFIG_STORE_NAME = 'configstore'
        key = 'orderId'
        # Subscribe to configuration by key.
        configuration = await d.subscribe_configuration(store_name=CONFIG_STORE_NAME, keys=[key], config_metadata={})
        if configuration != None:
            items = configuration.get_items()
            for item in items:
                print(f"Subscribe key={item.key} value={item.value} version={item.version}", flush=True)
        else:
            print("Nothing yet")
asyncio.run(executeConfiguration())
```

```bash
dapr run --app-id orderprocessing --components-path components/ -- python3 OrderProcessingService.py
```

{{% /codetab %}}

{{< /tabs >}}

#### 停止监视配置项

After you've subscribed to watch configuration items, the gRPC-server stream starts. Since this stream thread does not close itself, you have to explicitly call the `UnSubscribeConfigurationRequest` API to unsubscribe. 此方法接受以下请求对象：

```proto
// UnSubscribeConfigurationRequest is the message to stop watching the key-value configuration.
message UnSubscribeConfigurationRequest {
  // The name of configuration store.
  string store_name = 1;
  // Optional. The keys of the configuration item to stop watching.
  // Store_name and keys should match previous SubscribeConfigurationRequest's keys and store_name.
  // Once invoked, the subscription that is watching update for the key-value event is stopped
  repeated string keys = 2;
}
```

使用此取消订阅方法，可以停止监视配置更新事件。 Dapr 根据 `store_name` 和提供的任何可选密钥查找订阅流并将其关闭。

## 下一步

* 阅读 [配置 API 概述]({{< ref configuration-api-overview.md >}})