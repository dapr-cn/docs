---
type: docs
title: "快速入门：服务调用"
linkTitle: "服务调用"
weight: 70
description: "开始使用 Dapr 的服务调用构建块"
---

通过 [Dapr的服务调用构建块](https://docs.dapr.io/developing-applications/building-blocks/service-invocation)，你的应用程序可以与其他应用程序进行可靠和安全的通信。

<img src="/images/serviceinvocation-quickstart/service-invocation-overview.png" width=800 alt="显示服务调用步骤的图表" style="padding-bottom:25px;">

Dapr 提供了几种服务调用方法，你可以根据你的方案选择这些方法。 在本快速入门中，你将启用 checkout 服务以HTTP 代理调用 order-processor 服务中的方法。

在 [概述文章]({{< ref service-invocation-overview.md >}}) 中了解更多关于 Dapr 的服务调用方法。

在继续快速入门之前，请选择您首选的语言。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [Python 3.7+ 已安装](https://www.python.org/downloads/).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd service_invocation/python/http/order-processor
```

安装依赖项并构建应用程序：

```bash
pip3 install -r requirements.txt 
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=7001)
```

### 第4步：运行 `checkout` 服务

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/python/http/checkout
```

安装依赖项并构建应用程序：

```bash
pip3 install -r requirements.txt 
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

在 `checkout` 服务中，您会注意到无需重写您的应用程序代码即可使用 Dapr 的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的 ID。

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```
### 第5步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout` 服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` 服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新的Node.js已安装](https://nodejs.org/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd service_invocation/javascript/http/order-processor
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 6001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

```javascript
app.post('/orders', (req, res) => {
    console.log("Order received:", req.body);
    res.sendStatus(200);
});
```

### 第4步：运行 `checkout` 服务

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/javascript/http/checkout
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- npm start
```

在 `checkout` 服务中，您会注意到无需重写您的应用程序代码即可使用 Dapr 的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的 ID。

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
  const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
  console.log("Order passed: " + res.config.data);
```

### 第5步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout` 服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor` 服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd service_invocation/csharp/http/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

```csharp
app.MapPost("/orders", async context => {
    var data = await context.Request.ReadFromJsonAsync<Order>();
    Console.WriteLine("Order received : " + data);
    await context.Response.WriteAsync(data.ToString());
});
```

### 第4步：运行 `checkout` 服务

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/csharp/http/checkout
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- dotnet run
```

在 `checkout` 服务中，您会注意到无需重写您的应用程序代码即可使用 Dapr 的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的 ID。

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

### 第5步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout` 服务输出：

```
== APP == Order passed: Order { OrderId: 1 }
== APP == Order passed: Order { OrderId: 2 }
== APP == Order passed: Order { OrderId: 3 }
== APP == Order passed: Order { OrderId: 4 }
== APP == Order passed: Order { OrderId: 5 }
== APP == Order passed: Order { OrderId: 6 }
== APP == Order passed: Order { OrderId: 7 }
== APP == Order passed: Order { OrderId: 8 }
== APP == Order passed: Order { OrderId: 9 }
== APP == Order passed: Order { OrderId: 10 }
```

`order-processor` 服务输出：

```
== APP == Order received: Order { OrderId: 1 }
== APP == Order received: Order { OrderId: 2 }
== APP == Order received: Order { OrderId: 3 }
== APP == Order received: Order { OrderId: 4 }
== APP == Order received: Order { OrderId: 5 }
== APP == Order received: Order { OrderId: 6 }
== APP == Order received: Order { OrderId: 7 }
== APP == Order received: Order { OrderId: 8 }
== APP == Order received: Order { OrderId: 9 }
== APP == Order received: Order { OrderId: 10 }
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)，或
  - [OpenJDK](https://jdk.java.net/13/)
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd service_invocation/java/http/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --app-port 6001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

```java
public String processOrders(@RequestBody Order body) {
        System.out.println("Order received: "+ body.getOrderId());
        return "CID" + body.getOrderId();
    }
```

### 第4步：运行 `checkout` 服务

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/java/http/checkout
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

在 `checkout` 服务中，您会注意到无需重写您的应用程序代码即可使用 Dapr 的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的 ID。

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
```

### 第5步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout` 服务输出：

```
== APP == Order passed: 1
== APP == Order passed: 2
== APP == Order passed: 3
== APP == Order passed: 4
== APP == Order passed: 5
== APP == Order passed: 6
== APP == Order passed: 7
== APP == Order passed: 8
== APP == Order passed: 9
== APP == Order passed: 10
```

`order-processor` 服务输出：

```
== APP == Order received: 1
== APP == Order received: 2
== APP == Order received: 3
== APP == Order received: 4
== APP == Order received: 5
== APP == Order received: 6
== APP == Order received: 7
== APP == Order received: 8
== APP == Order received: 9
== APP == Order received: 10
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第2步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。


```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从快速入门克隆目录的根目录 导航到 `order-processor` 目录。

```bash
cd service_invocation/go/http/order-processor
```

安装依赖项：

```bash
go build app.go
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run app.go
```

每个订单都通过 HTTP POST 请求接收并由 `getOrder` 函数处理。

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
    data, err := ioutil.ReadAll(r.Body)
    if err != nil {
        log.Fatal(err)
    }
    log.Printf("Order received : %s", string(data))
```

### 第4步：运行 `checkout` 服务

在新终端窗口中，从快速入门克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/go/http/checkout
```

安装依赖项：

```bash
go build app.go
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run app.go
```

在 `checkout` 服务中，您会注意到无需重写您的应用程序代码即可使用 Dapr 的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的 ID。

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

### 第5步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout` 服务输出：

```
== APP == Order passed:  {"orderId":1}
== APP == Order passed:  {"orderId":2}
== APP == Order passed:  {"orderId":3}
== APP == Order passed:  {"orderId":4}
== APP == Order passed:  {"orderId":5}
== APP == Order passed:  {"orderId":6}
== APP == Order passed:  {"orderId":7}
== APP == Order passed:  {"orderId":8}
== APP == Order passed:  {"orderId":9}
== APP == Order passed:  {"orderId":10}
```

`order-processor` 服务输出：

```
== APP == Order received :  {"orderId":1}
== APP == Order received :  {"orderId":2}
== APP == Order received :  {"orderId":3}
== APP == Order received :  {"orderId":4}
== APP == Order received :  {"orderId":5}
== APP == Order received :  {"orderId":6}
== APP == Order received :  {"orderId":7}
== APP == Order received :  {"orderId":8}
== APP == Order received :  {"orderId":9}
== APP == Order received :  {"orderId":10}
```

{{% /codetab %}}

{{% /tabs %}}

## 告诉我们您的想法
我们一直在努力改进我们的快速入门示例，并重视你的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.gg/22ZtJrNe)中的讨论。

## 下一步

- 了解更多关于 [服务调用作为 Dapr 构建块]({{< ref service-invocation-overview.md >}})
- 了解更多关于如何调用 Dapr 的服务调用：
    - [HTTP]({{< ref howto-invoke-discover-services.md >}}), 或
    - [gRPC]({{< ref howto-invoke-services-grpc.md >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
