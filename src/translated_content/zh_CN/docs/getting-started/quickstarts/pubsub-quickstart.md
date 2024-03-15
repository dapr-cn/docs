---
type: docs
title: 快速入门：发布和订阅
linkTitle: 发布与订阅
weight: 73
description: 开始使用 Dapr 的发布和订阅构建块
---

让我们来看看Dapr的[发布和订阅（Pub/sub）构建块]({{< ref pubsub >}})。 在本快速入门中，您将运行发布者微服务和订阅者微服务，以演示 Dapr 如何启用发布/订阅模式。

1. 使用发布者服务，开发人员可以重复向topic发布消息。
2. [一个Pub/sub组件](https://docs.dapr.io/concepts/components-concept/#pubsub-brokers)将这些消息排队或传递给代理。 我们下面的例子使用Redis，你可以使用RabbitMQ、Kafka等。
3. 该topic的订阅者从队列中提取消息并对其进行处理。

<img src="/images/pubsub-quickstart/pubsub-diagram.png" width=800 style="padding-bottom:15px;">

您可以通过以下两种方式尝试此发布/订阅快速入门：

- [使用 Multi-App Run 模板文件同时运行此示例中的所有应用程序]({{< ref "#run-using-multi-app-run" >}})，或者
- [一次只运行一个应用程序]({{< ref "#run-one-application-at-a-time" >}})

## 使用多应用程序运行

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}

 <!-- Python -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装Python 3.7+](https://www.python.org/downloads/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstarts 目录的根目录导航到 pub/sub 目录：

```bash
cd pub_sub/python/sdk
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./checkout
pip3 install -r requirements.txt
cd ..
cd ./order-processor
pip3 install -r requirements.txt
cd ..
cd ./order-processor-fastapi
pip3 install -r requirements.txt
cd ..
```

### 步骤 3：运行发布者和订阅者

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 订阅者
- `checkout`发布者

```bash
dapr run -f .
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要在运行`dapr run -f .`之前，将`python3`更改为`python`，请参考[`dapr.yaml`]({{< ref "#dapryaml-multi-app-run-template-file" >}})文件。

**预期输出**

```
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor == Subscriber received : Order { OrderId = 10 }
Exited App successfully
```

### 发生了什么？

当您在安装 Dapr 期间运行 `dapr init` 时，以下 YAML 文件将在 `.dapr/components` 目录中生成：

- [`dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})
- [`pubsub.yaml`组件文件]({{< ref "#pubsubyaml-component-file" >}})

在此快速入门中运行 `dapr run -f .`，启动了[订阅者]({{< ref "#order-processor-subscriber" >}}) 和[发布者]({{< ref "#checkout-publisher" >}}) 应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: order-processor-sdk
    appDirPath: ./order-processor/
    appPort: 6001
    command: ["uvicorn", "app:app"]
  - appID: checkout-sdk
    appDirPath: ./checkout/
    command: ["python3", "app.py"]
```

##### `pubsub.yaml` 组件文件

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

##### `order-processor` 订阅者

在`order-processor`订阅者中，您订阅名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```py
# Register Dapr pub/sub subscriptions
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{
        'pubsubname': 'orderpubsub',
        'topic': 'orders',
        'route': 'orders'
    }]
    print('Dapr pub/sub is subscribed to: ' + json.dumps(subscriptions))
    return jsonify(subscriptions)


# Dapr subscription in /dapr/subscribe sets up this route
@app.route('/orders', methods=['POST'])
def orders_subscriber():
    event = from_http(request.headers, request.get_data())
    print('Subscriber received : ' + event.data['orderid'], flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=5001)
```

##### `checkout`发布者

在 `checkout` 发布者中，你将 orderId 消息发布到名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和 topic 为 `orders` 的 Redis 实例。 一旦服务启动，它就会循环发布：

```python
with DaprClient() as client:
    # Publish an event/message using Dapr PubSub
    result = client.publish_event(
        pubsub_name='orderpubsub',
        topic_name='orders',
        data=json.dumps(order),
        data_content_type='application/json',
    )
```

{{% /codetab %}}

 <!-- JavaScript -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/download/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstarts 目录的根目录导航到 pub/sub 目录：

```bash
cd pub_sub/javascript/sdk
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
npm install
cd ..
cd ./checkout
npm install
cd ..
```

### 步骤 3：运行发布者和订阅者

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 订阅者
- `checkout`发布者

```bash
dapr run -f .
```

**预期输出**

```
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor == Subscriber received : Order { OrderId = 10 }
Exited App successfully
```

### 发生了什么？

当您在安装 Dapr 期间运行 `dapr init` 时，以下 YAML 文件将在 `.dapr/components` 目录中生成：

- [`dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})
- [`pubsub.yaml`组件文件]({{< ref "#pubsubyaml-component-file" >}})

在此快速入门中运行 `dapr run -f .`，启动了[订阅者]({{< ref "#order-processor-subscriber" >}}) 和[发布者]({{< ref "#checkout-publisher" >}}) 应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    appPort: 5002
    command: ["npm", "run", "start"]
  - appID: checkout-sdk
    appDirPath: ./checkout/
    command: ["npm", "run", "start"]
```

##### `pubsub.yaml` 组件文件

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

##### `order-processor` 订阅者

在`order-processor`订阅者中，您订阅名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```js
server.pubsub.subscribe("orderpubsub", "orders", (data) => console.log("Subscriber received: " + JSON.stringify(data)));
```

##### `checkout`发布者

在`checkout`发布者服务中，您将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```js
const client = new DaprClient();

await client.pubsub.publish(PUBSUB_NAME, PUBSUB_TOPIC, order);
console.log("Published data: " + JSON.stringify(order));
```

{{% /codetab %}}

 <!-- .NET -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 6 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstarts 目录的根目录导航到 pub/sub 目录：

```bash
cd pub_sub/csharp/sdk
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
dotnet restore
dotnet build
cd ../checkout
dotnet restore
dotnet build
cd ..
```

### 步骤 3：运行发布者和订阅者

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 订阅者
- `checkout`发布者

```bash
dapr run -f .
```

**预期输出**

```
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor == Subscriber received : Order { OrderId = 10 }
Exited App successfully
```

### 发生了什么？

当您在安装 Dapr 期间运行 `dapr init` 时，以下 YAML 文件将在 `.dapr/components` 目录中生成：

- [`dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})
- [`pubsub.yaml`组件文件]({{< ref "#pubsubyaml-component-file" >}})

在此快速入门中运行 `dapr run -f .`，启动了[订阅者]({{< ref "#order-processor-subscriber" >}}) 和[发布者]({{< ref "#checkout-publisher" >}}) 应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    appPort: 7006
    command: ["dotnet", "run"]
  - appID: checkout-sdk
    appDirPath: ./checkout/
    command: ["dotnet", "run"]
```

##### `pubsub.yaml` 组件文件

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

##### `order-processor` 订阅者

在`order-processor`订阅者中，您订阅名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```cs
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/orders", [Topic("orderpubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});

public record Order([property: JsonPropertyName("orderId")] int OrderId);
```

##### `checkout`发布者

在 `checkout` 发布者中，你将 orderId 消息发布到名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和 topic 为 `orders` 的 Redis 实例。 一旦服务启动，它就会循环发布：

```cs
using var client = new DaprClientBuilder().Build();
await client.PublishEventAsync("orderpubsub", "orders", order);
Console.WriteLine("Published data: " + order);
```

{{% /codetab %}}

 <!-- Java -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或者
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，3.x版本。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstarts 目录的根目录导航到 pub/sub 目录：

```bash
cd pub_sub/java/sdk
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
mvn clean install
cd ..
cd ./checkout
mvn clean install
cd ..
```

### 步骤 3：运行发布者和订阅者

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 订阅者
- `checkout`发布者

```bash
dapr run -f .
```

**预期输出**

```
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor == Subscriber received : Order { OrderId = 10 }
Exited App successfully
```

### 发生了什么？

当您在安装 Dapr 期间运行 `dapr init` 时，以下 YAML 文件将在 `.dapr/components` 目录中生成：

- [`dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})
- [`pubsub.yaml`组件文件]({{< ref "#pubsubyaml-component-file" >}})

在此快速入门中运行 `dapr run -f .`，启动了[订阅者]({{< ref "#order-processor-subscriber" >}}) 和[发布者]({{< ref "#checkout-publisher" >}}) 应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: order-processor-sdk
    appDirPath: ./order-processor/target/
    appPort: 8080
    command: ["java", "-jar", "OrderProcessingService-0.0.1-SNAPSHOT.jar"]
  - appID: checkout-sdk
    appDirPath: ./checkout/target/
    command: ["java", "-jar", "CheckoutService-0.0.1-SNAPSHOT.jar"]
```

##### `pubsub.yaml` 组件文件

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

##### `order-processor` 订阅者

在`order-processor`订阅者中，您订阅名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```java
@Topic(name = "orders", pubsubName = "orderpubsub")
@PostMapping(path = "/orders", consumes = MediaType.ALL_VALUE)
public Mono<ResponseEntity> getCheckout(@RequestBody(required = false) CloudEvent<Order> cloudEvent) {
    return Mono.fromSupplier(() -> {
        try {
            logger.info("Subscriber received: " + cloudEvent.getData().getOrderId());
            return ResponseEntity.ok("SUCCESS");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    });
}
```

##### `checkout`发布者

在 `checkout` 发布者中，你将 orderId 消息发布到名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和 topic 为 `orders` 的 Redis 实例。 一旦服务启动，它就会循环发布：

```java
DaprClient client = new DaprClientBuilder().build();
client.publishEvent(
		PUBSUB_NAME,
		TOPIC_NAME,
		order).block();
logger.info("Published data: " + order.getOrderId());
```

{{% /codetab %}}

 <!-- Go -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Go的最新版本](https://go.dev/dl/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstarts 目录的根目录导航到 pub/sub 目录：

```bash
cd pub_sub/go/sdk
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
go build .
cd ../checkout
go build .
cd ..
```

### 步骤 3：运行发布者和订阅者

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 订阅者
- `checkout`发布者

```bash
dapr run -f .
```

**预期输出**

```
== APP - checkout-sdk == Published data: Order { OrderId = 1 }
== APP - order-processor == Subscriber received : Order { OrderId = 1 }
== APP - checkout-sdk == Published data: Order { OrderId = 2 }
== APP - order-processor == Subscriber received : Order { OrderId = 2 }
== APP - checkout-sdk == Published data: Order { OrderId = 3 }
== APP - order-processor == Subscriber received : Order { OrderId = 3 }
== APP - checkout-sdk == Published data: Order { OrderId = 4 }
== APP - order-processor == Subscriber received : Order { OrderId = 4 }
== APP - checkout-sdk == Published data: Order { OrderId = 5 }
== APP - order-processor == Subscriber received : Order { OrderId = 5 }
== APP - checkout-sdk == Published data: Order { OrderId = 6 }
== APP - order-processor == Subscriber received : Order { OrderId = 6 }
== APP - checkout-sdk == Published data: Order { OrderId = 7 }
== APP - order-processor == Subscriber received : Order { OrderId = 7 }
== APP - checkout-sdk == Published data: Order { OrderId = 8 }
== APP - order-processor == Subscriber received : Order { OrderId = 8 }
== APP - checkout-sdk == Published data: Order { OrderId = 9 }
== APP - order-processor == Subscriber received : Order { OrderId = 9 }
== APP - checkout-sdk == Published data: Order { OrderId = 10 }
== APP - order-processor == Subscriber received : Order { OrderId = 10 }
Exited App successfully
```

### 发生了什么？

当您在安装 Dapr 期间运行 `dapr init` 时，以下 YAML 文件将在 `.dapr/components` 目录中生成：

- [`dapr.yaml` 多应用运行模板文件]({{< ref "#dapryaml-multi-app-run-template-file" >}})
- [`pubsub.yaml`组件文件]({{< ref "#pubsubyaml-component-file" >}})

在此快速入门中运行 `dapr run -f .`，启动了[订阅者]({{< ref "#order-processor-subscriber" >}}) 和[发布者]({{< ref "#checkout-publisher" >}}) 应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../components/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    appPort: 6005
    command: ["go", "run", "."]
  - appID: checkout-sdk
    appDirPath: ./checkout/
    command: ["go", "run", "."]
```

##### `pubsub.yaml` 组件文件

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

##### `order-processor` 订阅者

在`order-processor`订阅者中，您订阅名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	fmt.Println("Subscriber received: ", e.Data)
	return false, nil
}
```

##### `checkout`发布者

在 `checkout` 发布者中，你将 orderId 消息发布到名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和 topic 为 `orders` 的 Redis 实例。 一旦服务启动，它就会循环发布：

```go
client, err := dapr.NewClient()

if err := client.PublishEvent(ctx, PUBSUB_NAME, PUBSUB_TOPIC, []byte(order)); err != nil {
    panic(err)
}

fmt.Println("Published data: ", order)
```

{{% /codetab %}}

{{< /tabs >}}

## 一次只运行一个应用程序

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}

 <!-- Python -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装Python 3.7+](https://www.python.org/downloads/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从 Quickstarts 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd pub_sub/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

在Dapr sidecar旁边运行`order-processor`订阅者服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-port 6002 -- python3 app.py
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

在 `order-processor` 订阅者中，我们订阅名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和topic为 `orders` 的 Redis 实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```py
# Register Dapr pub/sub subscriptions
@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{
        'pubsubname': 'orderpubsub',
        'topic': 'orders',
        'route': 'orders'
    }]
    print('Dapr pub/sub is subscribed to: ' + json.dumps(subscriptions))
    return jsonify(subscriptions)


# Dapr subscription in /dapr/subscribe sets up this route
@app.route('/orders', methods=['POST'])
def orders_subscriber():
    event = from_http(request.headers, request.get_data())
    print('Subscriber received : ' + event.data['orderid'], flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=5001)
```

### 第4步：发布topic

在一个新的终端窗口中，导航到 `checkout` 目录。

```bash
cd pub_sub/python/sdk/checkout
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --resources-path ../../../components/ -- python3 app.py
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

在`checkout`发布者中，我们将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```python
with DaprClient() as client:
    # Publish an event/message using Dapr PubSub
    result = client.publish_event(
        pubsub_name='orderpubsub',
        topic_name='orders',
        data=json.dumps(order),
        data_content_type='application/json',
    )
```

### 第5步：查看Pub/sub输出

发布者将订单发送给 Dapr sidecar，而订阅者接收这些订单。

发布者输出：

```
== APP == INFO:root:Published data: {"orderId": 1}
== APP == INFO:root:Published data: {"orderId": 2}
== APP == INFO:root:Published data: {"orderId": 3}
== APP == INFO:root:Published data: {"orderId": 4}
== APP == INFO:root:Published data: {"orderId": 5}
== APP == INFO:root:Published data: {"orderId": 6}
== APP == INFO:root:Published data: {"orderId": 7}
== APP == INFO:root:Published data: {"orderId": 8}
== APP == INFO:root:Published data: {"orderId": 9}
== APP == INFO:root:Published data: {"orderId": 10}
```

订阅者输出：

```
== APP == INFO:root:Subscriber received: {"orderId": 1}
== APP == INFO:root:Subscriber received: {"orderId": 2}
== APP == INFO:root:Subscriber received: {"orderId": 3}
== APP == INFO:root:Subscriber received: {"orderId": 4}
== APP == INFO:root:Subscriber received: {"orderId": 5}
== APP == INFO:root:Subscriber received: {"orderId": 6}
== APP == INFO:root:Subscriber received: {"orderId": 7}
== APP == INFO:root:Subscriber received: {"orderId": 8}
== APP == INFO:root:Subscriber received: {"orderId": 9}
== APP == INFO:root:Subscriber received: {"orderId": 10}
```

##### `pubsub.yaml` 组件文件

当你运行`dapr init`时，Dapr会创建一个默认的Redis`pubsub.yaml`并在你的本地机器上运行一个Redis容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- JavaScript -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/download/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从 Quickstarts 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd pub_sub/javascript/sdk/order-processor
```

安装依赖项，其中将包括 JavaScript SDK 中的 `@dapr/dapr` 包：

```bash
npm install
```

验证服务目录中是否包含以下文件：

- `package.json`
- `package-lock.json`

在Dapr sidecar旁边运行`order-processor`订阅者服务。

```bash
dapr run --app-port 5002 --app-id order-processing --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- npm run start
```

在 `order-processor` 订阅者中，我们订阅名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和topic为 `orders` 的 Redis 实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```js
server.pubsub.subscribe("orderpubsub", "orders", (data) => console.log("Subscriber received: " + JSON.stringify(data)));
```

### 第4步：发布topic

在新的终端窗口中，从 Quickstarts 克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/javascript/sdk/checkout
```

安装依赖项，其中将包括 JavaScript SDK 中的 `@dapr/dapr` 包：

```bash
npm install
```

验证服务目录中是否包含以下文件：

- `package.json`
- `package-lock.json`

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- npm run start
```

在`checkout`发布者服务中，我们将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```js
const client = new DaprClient();

await client.pubsub.publish(PUBSUB_NAME, PUBSUB_TOPIC, order);
console.log("Published data: " + JSON.stringify(order));
```

### 第5步：查看Pub/sub输出

请注意，正如上面代码中所指定的，发布者向Dapr sidecar推送一个随机数 ，而订阅者接收它。

发布者输出：

```cli
== APP == Published data: {"orderId":1}
== APP == Published data: {"orderId":2}
== APP == Published data: {"orderId":3}
== APP == Published data: {"orderId":4}
== APP == Published data: {"orderId":5}
== APP == Published data: {"orderId":6}
== APP == Published data: {"orderId":7}
== APP == Published data: {"orderId":8}
== APP == Published data: {"orderId":9}
== APP == Published data: {"orderId":10}

```

订阅者输出：

```cli
== APP == Subscriber received: {"orderId":1}
== APP == Subscriber received: {"orderId":2}
== APP == Subscriber received: {"orderId":3}
== APP == Subscriber received: {"orderId":4}
== APP == Subscriber received: {"orderId":5}
== APP == Subscriber received: {"orderId":6}
== APP == Subscriber received: {"orderId":7}
== APP == Subscriber received: {"orderId":8}
== APP == Subscriber received: {"orderId":9}
== APP == Subscriber received: {"orderId":10}

```

##### `pubsub.yaml` 组件文件

当你运行`dapr init`时，Dapr会创建一个默认的Redis`pubsub.yaml`并在你的本地机器上运行一个Redis容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- .NET -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 6 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从 Quickstarts 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd pub_sub/csharp/sdk/order-processor
```

还原 NuGet 包：

```bash
dotnet restore
dotnet build
```

在Dapr sidecar旁边运行`order-processor`订阅者服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components --app-port 7006 -- dotnet run
```

在 `order-processor` 订阅者中，我们订阅名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和topic为 `orders` 的 Redis 实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```cs
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/orders", [Topic("orderpubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});

public record Order([property: JsonPropertyName("orderId")] int OrderId);
```

### 第4步：发布topic

在新的终端窗口中，从 Quickstarts 克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/csharp/sdk/checkout
```

还原 NuGet 包：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --resources-path ../../../components -- dotnet run
```

在`checkout`发布者中，我们将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```cs
using var client = new DaprClientBuilder().Build();
await client.PublishEventAsync("orderpubsub", "orders", order);
Console.WriteLine("Published data: " + order);
```

### 第5步：查看Pub/sub输出

请注意，正如上面代码中所指定的，发布者向Dapr sidecar推送一个随机数 ，而订阅者接收它。

发布者输出：

```dotnetcli
== APP == Published data: Order { OrderId = 1 }
== APP == Published data: Order { OrderId = 2 }
== APP == Published data: Order { OrderId = 3 }
== APP == Published data: Order { OrderId = 4 }
== APP == Published data: Order { OrderId = 5 }
== APP == Published data: Order { OrderId = 6 }
== APP == Published data: Order { OrderId = 7 }
== APP == Published data: Order { OrderId = 8 }
== APP == Published data: Order { OrderId = 9 }
== APP == Published data: Order { OrderId = 10 }
```

订阅者输出：

```dotnetcli
== APP == Subscriber received: Order { OrderId = 1 }
== APP == Subscriber received: Order { OrderId = 2 }
== APP == Subscriber received: Order { OrderId = 3 }
== APP == Subscriber received: Order { OrderId = 4 }
== APP == Subscriber received: Order { OrderId = 5 }
== APP == Subscriber received: Order { OrderId = 6 }
== APP == Subscriber received: Order { OrderId = 7 }
== APP == Subscriber received: Order { OrderId = 8 }
== APP == Subscriber received: Order { OrderId = 9 }
== APP == Subscriber received: Order { OrderId = 10 }
```

##### `pubsub.yaml` 组件文件

当你运行`dapr init`时，Dapr会创建一个默认的Redis`pubsub.yaml`并在你的本地机器上运行一个Redis容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- Java -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或者
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，3.x版本。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从 Quickstarts 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd pub_sub/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

在Dapr sidecar旁边运行`order-processor`订阅者服务。

```bash
dapr run --app-port 8080 --app-id order-processor --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

在 `order-processor` 订阅者中，我们订阅名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和topic为 `orders` 的 Redis 实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```java
@Topic(name = "orders", pubsubName = "orderpubsub")
@PostMapping(path = "/orders", consumes = MediaType.ALL_VALUE)
public Mono<ResponseEntity> getCheckout(@RequestBody(required = false) CloudEvent<Order> cloudEvent) {
    return Mono.fromSupplier(() -> {
        try {
            logger.info("Subscriber received: " + cloudEvent.getData().getOrderId());
            return ResponseEntity.ok("SUCCESS");
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    });
}
```

### 第4步：发布topic

在新的终端窗口中，从 Quickstarts 克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/java/sdk/checkout
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --resources-path ../../../components -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

在`checkout`发布者中，我们将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```java
DaprClient client = new DaprClientBuilder().build();
client.publishEvent(
		PUBSUB_NAME,
		TOPIC_NAME,
		order).block();
logger.info("Published data: " + order.getOrderId());
```

### 第5步：查看Pub/sub输出

请注意，正如上面代码中所指定的，发布者向Dapr sidecar推送一个随机数 ，而订阅者接收它。

发布者输出：

```
== APP == 7194 [main] INFO com.service.CheckoutServiceApplication - Published data: 1
== APP == 12213 [main] INFO com.service.CheckoutServiceApplication - Published data: 2
== APP == 17233 [main] INFO com.service.CheckoutServiceApplication - Published data: 3
== APP == 22252 [main] INFO com.service.CheckoutServiceApplication - Published data: 4
== APP == 27276 [main] INFO com.service.CheckoutServiceApplication - Published data: 5
== APP == 32320 [main] INFO com.service.CheckoutServiceApplication - Published data: 6
== APP == 37340 [main] INFO com.service.CheckoutServiceApplication - Published data: 7
== APP == 42356 [main] INFO com.service.CheckoutServiceApplication - Published data: 8
== APP == 47386 [main] INFO com.service.CheckoutServiceApplication - Published data: 9
== APP == 52410 [main] INFO com.service.CheckoutServiceApplication - Published data: 10
```

订阅者输出：

```
== APP == 2022-03-07 13:31:19.551  INFO 43512 --- [nio-8080-exec-5] c.s.c.OrderProcessingServiceController   : Subscriber received: 1
== APP == 2022-03-07 13:31:19.552  INFO 43512 --- [nio-8080-exec-9] c.s.c.OrderProcessingServiceController   : Subscriber received: 2
== APP == 2022-03-07 13:31:19.551  INFO 43512 --- [nio-8080-exec-6] c.s.c.OrderProcessingServiceController   : Subscriber received: 3
== APP == 2022-03-07 13:31:19.552  INFO 43512 --- [nio-8080-exec-2] c.s.c.OrderProcessingServiceController   : Subscriber received: 4
== APP == 2022-03-07 13:31:19.553  INFO 43512 --- [nio-8080-exec-2] c.s.c.OrderProcessingServiceController   : Subscriber received: 5
== APP == 2022-03-07 13:31:19.553  INFO 43512 --- [nio-8080-exec-9] c.s.c.OrderProcessingServiceController   : Subscriber received: 6
== APP == 2022-03-07 13:31:22.849  INFO 43512 --- [nio-8080-exec-3] c.s.c.OrderProcessingServiceController   : Subscriber received: 7
== APP == 2022-03-07 13:31:27.866  INFO 43512 --- [nio-8080-exec-6] c.s.c.OrderProcessingServiceController   : Subscriber received: 8
== APP == 2022-03-07 13:31:32.895  INFO 43512 --- [nio-8080-exec-6] c.s.c.OrderProcessingServiceController   : Subscriber received: 9
== APP == 2022-03-07 13:31:37.919  INFO 43512 --- [nio-8080-exec-2] c.s.c.OrderProcessingServiceController   : Subscriber received: 10
```

##### `pubsub.yaml` 组件文件

当你运行`dapr init`时，Dapr会创建一个默认的Redis`pubsub.yaml`并在你的本地机器上运行一个Redis容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- Go -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Go的最新版本](https://go.dev/dl/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从 Quickstarts 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd pub_sub/go/sdk/order-processor
```

安装依赖项并构建应用程序：

```bash
go build .
```

在Dapr sidecar旁边运行`order-processor`订阅者服务。

```bash
dapr run --app-port 6005 --app-id order-processor-sdk --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- go run .
```

在 `order-processor` 订阅者中，我们订阅名为 `orderpubsub`（在 `pubsub.yaml` 组件中定义）和topic为 `orders` 的 Redis 实例。 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	fmt.Println("Subscriber received: ", e.Data)
	return false, nil
}
```

### 第4步：发布topic

在新的终端窗口中，从 Quickstarts 克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/go/sdk/checkout
```

安装依赖项并构建应用程序：

```bash
go build .
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- go run .
```

在`checkout`发布者中，我们将orderId消息发布到名为`orderpubsub`（如在`pubsub.yaml`组件中定义）和topic为`orders`的Redis实例。 一旦服务启动，它就会循环发布：

```go
client, err := dapr.NewClient()

if err := client.PublishEvent(ctx, PUBSUB_NAME, PUBSUB_TOPIC, []byte(order)); err != nil {
    panic(err)
}

fmt.Println("Published data: ", order)
```

### 第5步：查看Pub/sub输出

请注意，正如上面代码中所指定的，发布者向Dapr sidecar推送一条编号消息，而订阅者接收它。

发布者输出：

```
== APP == dapr client initializing for: 127.0.0.1:63293
== APP == Published data:  {"orderId":1}
== APP == Published data:  {"orderId":2}
== APP == Published data:  {"orderId":3}
== APP == Published data:  {"orderId":4}
== APP == Published data:  {"orderId":5}
== APP == Published data:  {"orderId":6}
== APP == Published data:  {"orderId":7}
== APP == Published data:  {"orderId":8}
== APP == Published data:  {"orderId":9}
== APP == Published data:  {"orderId":10}
```

订阅者输出：

```
== APP == Subscriber received:  {"orderId":1}
== APP == Subscriber received:  {"orderId":2}
== APP == Subscriber received:  {"orderId":3}
== APP == Subscriber received:  {"orderId":4}
== APP == Subscriber received:  {"orderId":5}
== APP == Subscriber received:  {"orderId":6}
== APP == Subscriber received:  {"orderId":7}
== APP == Subscriber received:  {"orderId":8}
== APP == Subscriber received:  {"orderId":9}
== APP == Subscriber received:  {"orderId":10}
```

注意：接收顺序可能会有所不同。

##### `pubsub.yaml` 组件文件

当你运行`dapr init`时，Dapr会创建一个默认的Redis`pubsub.yaml`并在你的本地机器上运行一个Redis容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在`~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件而无需更改应用程序代码。

本快速入门包含的 Redis `pubsub.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: orderpubsub
spec:
  type: pubsub.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
scopes:
  - orderprocessing
  - checkout
```

在 YAML 文件中：

- `metadata/name` 是应用程序与组件通信的方式。
- `spec/metadata`定义了组件实例的连接。
- `scopes`指定哪个应用程序可以使用该组件。

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)参与讨论。

## 下一步

- 使用 HTTP 而不是 SDK 设置 Pub/sub。
  - [Python](https://github.com/dapr/quickstarts/tree/master/pub_sub/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/pub_sub/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/pub_sub/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/pub_sub/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/pub_sub/go/http)
- 了解有关[Pub/sub作为Dapr构建块的更多信息]({{< ref pubsub-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
