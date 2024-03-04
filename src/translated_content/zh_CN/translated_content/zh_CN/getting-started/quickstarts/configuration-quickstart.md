---
type: docs
title: "快速入门：配置"
linkTitle: 配置
weight: 77
description: 开始使用 Dapr 的配置构建块
---

让我们来看看 Dapr 的 [配置构建块]({{< ref configuration-api-overview.md >}})。 配置项目通常具有动态性质，并且与消费它的应用程序的需求紧密耦合。 配置项是包含配置数据的键/值对，例如
- App ids
- Partition keys
- 数据库名称等

在本快速入门中，你将运行 `order-processor` 利用配置 API 的微服务。 该服务：
1. 从配置存储中获取配置项。
1. 订阅配置更新。

<img src="/images/configuration-quickstart/configuration-quickstart-flow.png" width=1000 alt="该图演示了使用键/值对的配置 API 快速入门的流程。">

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [Python 3.7+ 已安装](https://www.python.org/downloads/).
<!-- IGNORE_LINKS --> 
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/configuration)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

克隆后，打开一个新的终端并运行以下命令来设置配置项的值 `orderId1` 和 `orderId2`。

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### 第2步：运行 `order-processor` 服务

从快速入门克隆目录的根目录导航到 `order-processor` 目录。

```bash
cd configuration/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-port 6001 -- python3 app.py
```

> **注意：** 由于Python3.exe在Windows中未定义，您可能需要使用 `python app.py` 替代 `python3 app.py`。

预期输出：

```
== APP == Configuration for orderId1 : value: "101"
== APP ==
== APP == Configuration for orderId2 : value: "102"
== APP ==
== APP == App unsubscribed from config changes
```

### （可选）步骤 3：更新配置项值

应用程序取消订阅后，请尝试更新配置项的值。 使用以下命令更改 `orderId1` 和 `orderId2` 的值：

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

再次运行 `order-processo` 服务：

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-port 6001 -- python3 app.py
```

> **注意：** 由于Python3.exe在Windows中未定义，您可能需要使用 `python app.py` 替代 `python3 app.py`。

该应用程序将返回更新后的配置值：

```
== APP == Configuration for orderId1 : value: "103"
== APP ==
== APP == Configuration for orderId2 : value: "104"
== APP ==
```

### `order-processor` 服务

`order-processo` 服务包括以下代码：
- 从配置存储中获取配置项
- 订阅配置更新（您之前在命令行工具中进行的更新）
- 在20秒不活动后，取消订阅配置更新并退出应用程序。

获取配置项目:

```python
# Get config items from the config store
for config_item in CONFIGURATION_ITEMS:
    config = client.get_configuration(store_name=DAPR_CONFIGURATION_STORE, keys=[config_item], config_metadata={})
    print(f"Configuration for {config_item} : {config.items[config_item]}", flush=True)
```

订阅配置更新:

```python
# Subscribe for configuration changes
configuration = await client.subscribe_configuration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS)
```

取消订阅配置更新并退出应用程序：

```python
# Unsubscribe from configuration updates
unsubscribed = True
for config_item in CONFIGURATION_ITEMS:
    unsub_item = client.unsubscribe_configuration(DAPR_CONFIGURATION_STORE, config_item)
    #...
if unsubscribed == True:
    print("App unsubscribed from config changes", flush=True)
```


{{% /codetab %}}


<!-- JavaScript -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [Python 3.7+ 已安装](https://www.python.org/downloads/).
<!-- IGNORE_LINKS --> 
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/configuration)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

克隆后，打开一个新的终端并运行以下命令来设置配置项的值 `orderId1` 和 `orderId2`。

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### 第2步：运行 `order-processor` 服务

从快速入门克隆目录的根目录导航到 `order-processor` 目录。

```bash
cd configuration/javascript/sdk/order-processor
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

预期输出：

```
== APP == Configuration for orderId1: {"key":"orderId1","value":"101","version":"","metadata":{}}
== APP == Configuration for orderId2: {"key":"orderId2","value":"102","version":"","metadata":{}}
== APP == App unsubscribed to config changes
```

### （可选）步骤 3：更新配置项值

应用程序取消订阅后，请尝试更新配置项的值。 使用以下命令更改 `orderId1` 和 `orderId2` 的值：

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

再次运行 `order-processo` 服务：

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-protocol grpc --dapr-grpc-port 3500 -- node index.js
```

该应用程序将返回更新后的配置值：

```
== APP == Configuration for orderId1: {"key":"orderId1","value":"103","version":"","metadata":{}}
== APP == Configuration for orderId2: {"key":"orderId2","value":"104","version":"","metadata":{}}
```

### `order-processor` 服务

`order-processo` 服务包括以下代码：
- 从配置存储中获取配置项
- 订阅配置更新（您之前在命令行工具中进行的更新）
- 在20秒不活动后，取消订阅配置更新并退出应用程序。

获取配置项目:

```javascript
// Get config items from the config store
//...
  const config = await client.configuration.get(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
  Object.keys(config.items).forEach((key) => {
    console.log("Configuration for " + key + ":", JSON.stringify(config.items[key]));
  });
```

订阅配置更新:

```javascript
// Subscribe to config updates
try {
  const stream = await client.configuration.subscribeWithKeys(
    DAPR_CONFIGURATION_STORE,
    CONFIGURATION_ITEMS,
    (config) => {
      console.log("Configuration update", JSON.stringify(config.items));
    }
  );
```

取消订阅配置更新并退出应用程序：

```javascript
// Unsubscribe to config updates and exit app after 20 seconds
setTimeout(() => {
  stream.stop();
  console.log("App unsubscribed to config changes");
  process.exit(0);
},
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/configuration)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

克隆后，打开一个新的终端并运行以下命令来设置配置项的值 `orderId1` 和 `orderId2`。

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### 第2步：运行 `order-processor` 服务

从快速入门克隆目录的根目录导航到 `order-processor` 目录。

```bash
cd configuration/csharp/sdk/order-processor
```

还原 NuGet 包：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor-http --resources-path ../../../components/ --app-port 7001 -- dotnet run --project .
```

预期输出：

```
== APP == Configuration for orderId1: {"Value":"101","Version":"","Metadata":{}}
== APP == Configuration for orderId2: {"Value":"102","Version":"","Metadata":{}}
== APP == App unsubscribed from config changes
```

### （可选）步骤 3：更新配置项值

应用程序取消订阅后，请尝试更新配置项的值。 使用以下命令更改 `orderId1` 和 `orderId2` 的值：

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

再次运行 `order-processo` 服务：

```bash
dapr run --app-id order-processor-http --resources-path ../../../components/ --app-port 7001 -- dotnet run --project .
```

该应用程序将返回更新后的配置值：

```
== APP == Configuration for orderId1: {"Value":"103","Version":"","Metadata":{}}
== APP == Configuration for orderId2: {"Value":"104","Version":"","Metadata":{}}
```

### `order-processor` 服务

`order-processo` 服务包括以下代码：
- 从配置存储中获取配置项
- 订阅配置更新（您之前在命令行工具中进行的更新）
- 在20秒不活动后，取消订阅配置更新并退出应用程序。

获取配置项目:

```csharp
// Get config from configuration store
GetConfigurationResponse config = await client.GetConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
foreach (var item in config.Items)
{
  var cfg = System.Text.Json.JsonSerializer.Serialize(item.Value);
  Console.WriteLine("Configuration for " + item.Key + ": " + cfg);
}
```

订阅配置更新:

```csharp
// Subscribe to config updates
SubscribeConfigurationResponse subscribe = await client.SubscribeConfiguration(DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS);
```

取消订阅配置更新并退出应用程序：

```csharp
// Unsubscribe to config updates and exit the app
try
{
  client.UnsubscribeConfiguration(DAPR_CONFIGURATION_STORE, subscriptionId);
  Console.WriteLine("App unsubscribed from config changes");
  Environment.Exit(0);
}
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/configuration)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

克隆后，打开一个新的终端并运行以下命令来设置配置项的值 `orderId1` 和 `orderId2`。

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### 第2步：运行 `order-processor` 服务

从快速入门克隆目录的根目录导航到 `order-processor` 目录。

```bash
cd configuration/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

预期输出：

```
== APP == Configuration for orderId1: {'value':'101'}
== APP == Configuration for orderId2: {'value':'102'}
== APP == App unsubscribed to config changes
```

### （可选）步骤 3：更新配置项值

应用程序取消订阅后，请尝试更新配置项的值。 使用以下命令更改 `orderId1` 和 `orderId2` 的值：

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

再次运行 `order-processo` 服务：

```bash
dapr run --app-id order-processor --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

该应用程序将返回更新后的配置值：

```
== APP == Configuration for orderId1: {'value':'103'}
== APP == Configuration for orderId2: {'value':'104'}
```

### `order-processor` 服务

`order-processo` 服务包括以下代码：
- 从配置存储中获取配置项
- 订阅配置更新（您之前在命令行工具中进行的更新）
- 在20秒不活动后，取消订阅配置更新并退出应用程序。

获取配置项目:

```java
// Get config items from the config store
try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
    for (String configurationItem : CONFIGURATION_ITEMS) {
        ConfigurationItem item = client.getConfiguration(DAPR_CONFIGURATON_STORE, configurationItem).block();
        System.out.println("Configuration for " + configurationItem + ": {'value':'" + item.getValue() + "'}");
    }
```

订阅配置更新:

```java
// Subscribe for config changes
Flux<SubscribeConfigurationResponse> subscription = client.subscribeConfiguration(DAPR_CONFIGURATON_STORE,
        CONFIGURATION_ITEMS.toArray(String[]::new));
```

取消订阅配置更新并退出应用程序：

```java
// Unsubscribe from config changes
UnsubscribeConfigurationResponse unsubscribe = client
        .unsubscribeConfiguration(subscriptionId, DAPR_CONFIGURATON_STORE).block();
if (unsubscribe.getIsUnsubscribed()) {
    System.out.println("App unsubscribed to config changes");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/configuration)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

克隆后，打开一个新的终端并运行以下命令来设置配置项的值 `orderId1` 和 `orderId2`。

```bash
docker exec dapr_redis redis-cli MSET orderId1 "101" orderId2 "102"
```

### 第2步：运行 `order-processor` 服务

从快速入门克隆目录的根目录导航到 `order-processor` 目录。

```bash
cd configuration/go/sdk/order-processor
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --app-port 6001 --resources-path ../../../components -- go run .
```

预期输出：

```
== APP == Configuration for orderId1: {"Value":"101","Version":"","Metadata":null}
== APP == Configuration for orderId2: {"Value":"102","Version":"","Metadata":null}
== APP == dapr configuration subscribe finished.
== APP == App unsubscribed to config changes
```

### （可选）步骤 3：更新配置项值

应用程序取消订阅后，请尝试更新配置项的值。 使用以下命令更改 `orderId1` 和 `orderId2` 的值：

```bash
docker exec dapr_redis redis-cli MSET orderId1 "103" orderId2 "104"
```

再次运行 `order-processo` 服务：

```bash
dapr run --app-id order-processor --app-port 6001 --resources-path ../../../components -- go run .
```

该应用程序将返回更新后的配置值：

```
== APP == Configuration for orderId1: {"Value":"103","Version":"","Metadata":null}
== APP == Configuration for orderId2: {"Value":"104","Version":"","Metadata":null}
```

### `order-processor` 服务

`order-processo` 服务包括以下代码：
- 从配置存储中获取配置项
- 订阅配置更新（您之前在命令行工具中进行的更新）
- 在20秒不活动后，取消订阅配置更新并退出应用程序。

获取配置项目:

```go
// Get config items from config store
for _, item := range CONFIGURATION_ITEMS {
    config, err := client.GetConfigurationItem(ctx, DAPR_CONFIGURATION_STORE, item)
    //...
    c, _ := json.Marshal(config)
    fmt.Println("Configuration for " + item + ": " + string(c))
}
```

订阅配置更新:

```go
// Subscribe for config changes
err = client.SubscribeConfigurationItems(ctx, DAPR_CONFIGURATION_STORE, CONFIGURATION_ITEMS, func(id string, config map[string]*dapr.ConfigurationItem) {
    // First invocation when app subscribes to config changes only returns subscription id
    if len(config) == 0 {
        fmt.Println("App subscribed to config changes with subscription id: " + id)
        subscriptionId = id
        return
    }
})
```

取消订阅配置更新并退出应用程序：

```go
// Unsubscribe to config updates and exit app after 20 seconds
select {
case <-ctx.Done():
    err = client.UnsubscribeConfigurationItems(context.Background(), DAPR_CONFIGURATION_STORE, subscriptionId)
    //...
    {
        fmt.Println("App unsubscribed to config changes")
    }
```

{{% /codetab %}}

{{< /tabs >}}

## 例子

观看此视频 [演示配置 API 快速入门](https://youtu.be/EcE6IGuX9L8?t=94):

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/EcE6IGuX9L8?start=94" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

- 使用 HTTP 而不是 SDK 的 Dapr 配置。
  - [Python](https://github.com/dapr/quickstarts/tree/master/configuration/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/configuration/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/configuration/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/configuration/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/configuration/go/http)
- 详细了解 [配置构建基块]({{< ref configuration-api-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
