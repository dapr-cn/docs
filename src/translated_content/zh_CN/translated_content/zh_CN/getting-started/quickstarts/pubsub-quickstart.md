---
type: docs
title: "快速入门：发布和订阅"
linkTitle: "发布与订阅"
weight: 73
description: "开始使用 Dapr 的发布和订阅构建块"
---

Let's take a look at Dapr's [Publish and Subscribe (Pub/sub) building block]({{< ref pubsub >}}). In this Quickstart, you will run a publisher microservice and a subscriber microservice to demonstrate how Dapr enables a Pub/sub pattern.

1. Using a publisher service, developers can repeatedly publish messages to a topic.
1. [Pub/sub 组件](https://docs.dapr.io/concepts/components-concept/#pubsub-brokers)对这些消息进行排队或代理。 我们下面的例子使用Redis，你可以使用RabbitMQ、Kafka等。
1. 该topic的订阅者从队列中提取消息并对其进行处理。

<img src="/images/pubsub-quickstart/pubsub-diagram.png" width=800 style="padding-bottom:15px;">

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### Step 1: Pre-requisites

对于此示例，您将需要：

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [Python 3.7+ installed](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd pub_sub/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `order-processor` 订阅者服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ --app-port 5001 -- python3 app.py
```

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

In the `order-processor` subscriber, we're subscribing to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

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

在新的终端窗口中，导航到 `checkout` 目录。

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

> **Note**: Since Python3.exe is not defined in Windows, you may need to use `python app.py` instead of `python3 app.py`.

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 一旦服务启动，它就会循环发布：

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

请注意，正如上面代码中所指定的，发布者向Dapr sidecar推送一个随机数 ，而订阅者接收它。

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

#### `pubsub.yaml` component file

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

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

- `metadata/name` is how your application talks to the component.
- `spec/metadata` 定义与组件实例的连接。
- `scopes` 指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### Step 1: Pre-requisites

对于此示例，您将需要：

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [最新的Node.js已安装](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd pub_sub/javascript/sdk/order-processor
```

Install dependencies, which will include the `@dapr/dapr` package from the JavaScript SDK:

```bash
npm install
```

验证服务目录中是否包含以下文件：

- `package.json`
- `package-lock.json`

与 Dapr sidecar 一起运行 `order-processor` 订阅者服务。

```bash
dapr run --app-port 5001 --app-id order-processing --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- npm run start
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```js
server.pubsub.subscribe("orderpubsub", "orders", (data) => console.log("Subscriber received: " + JSON.stringify(data)));
```

### 第4步：发布topic

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/javascript/sdk/checkout
```

Install dependencies, which will include the `@dapr/dapr` package from the JavaScript SDK:

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

In the `checkout` publisher service, we're publishing the orderId message to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 一旦服务启动，它就会循环发布：

```js
const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT);

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

#### `pubsub.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

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

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` 定义与组件实例的连接。
- `scopes` 指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd pub_sub/csharp/sdk/order-processor
```

还原 NuGet 包：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `order-processor` 订阅者服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components --app-port 7002 -- dotnet run
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```cs
// Dapr subscription in [Topic] routes orders topic to this route
app.MapPost("/orders", [Topic("orderpubsub", "orders")] (Order order) => {
    Console.WriteLine("Subscriber received : " + order);
    return Results.Ok(order);
});

public record Order([property: JsonPropertyName("orderId")] int OrderId);
```

### 第4步：发布topic

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/csharp/sdk/checkout
```

Recall NuGet packages:

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --resources-path ../../../components -- dotnet run
```

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 一旦服务启动，它就会循环发布：

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

#### `pubsub.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

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

- `metadata/name` is how your application talks to the component.
- `spec/metadata` 定义与组件实例的连接。
- `scopes` 指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), or
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd pub_sub/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 订阅者服务。

```bash
dapr run --app-port 8080 --app-id order-processor --resources-path ../../../components -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

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

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

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

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 一旦服务启动，它就会循环发布：

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

#### `pubsub.yaml` component file

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

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

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` 定义与组件实例的连接。
- `scopes` 指定哪个应用程序可以使用该组件。

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### Step 1: Pre-requisites

对于此示例，您将需要：

- [Dapr CLI and initialized environment](https://docs.dapr.io/getting-started).
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/pub_sub)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：订阅topic

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd pub_sub/go/sdk/order-processor
```

安装依赖项并构建应用程序：

```bash
go build .
```

与 Dapr sidecar 一起运行 `order-processor` 订阅者服务。

```bash
dapr run --app-port 6002 --app-id order-processor-sdk --app-protocol http --dapr-http-port 3501 --resources-path ../../../components -- go run .
```

In the `order-processor` subscriber, we're subscribing to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 这使你的应用代码能够通过 Dapr sidecar 与 Redis 组件实例通信。

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    fmt.Println("Subscriber received: ", e.Data)
    return false, nil
}
```

### 第4步：发布topic

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd pub_sub/go/sdk/checkout
```

Install the dependencies and build the application:

```bash
go build .
```

与 Dapr sidecar 一起运行 `checkout` 发布者服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 --resources-path ../../../components -- go run .
```

In the `checkout` publisher, we're publishing the orderId message to the Redis instance called `orderpubsub` [(as defined in the `pubsub.yaml` component)]({{< ref "#pubsubyaml-component-file" >}}) and topic `orders`. 一旦服务启动，它就会循环发布：

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

#### `pubsub.yaml` component file

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `pubsub.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- On Windows, under `%UserProfile%\.dapr\components\pubsub.yaml`
- On Linux/MacOS, under `~/.dapr/components/pubsub.yaml`

使用 `pubsub.yaml` 组件，您可以轻松更换底层组件，而无需更改应用程序代码。

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

In the YAML file:

- `metadata/name` is how your application talks to the component.
- `spec/metadata` 定义与组件实例的连接。
- `scopes` 指定哪个应用程序可以使用该组件。

{{% /codetab %}}

{{< /tabs >}}

## Tell us what you think!
我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

Join the discussion in our [discord channel](https://discord.com/channels/778680217417809931/953427615916638238).

## 下一步

- Set up Pub/sub using HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/pub_sub/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/pub_sub/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/pub_sub/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/pub_sub/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/pub_sub/go/http)
- 了解更多关于 [Pub/sub 作为 Dapr 构建块]({{< ref pubsub-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
