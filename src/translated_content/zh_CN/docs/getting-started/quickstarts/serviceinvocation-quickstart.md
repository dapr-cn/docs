---
type: docs
title: 快速入门：服务调用
linkTitle: 服务调用
weight: 71
description: 开始使用 Dapr 的服务调用构建块
---

通过[Dapr的服务调用构建块](https://docs.dapr.io/developing-applications/building-blocks/service-invocation)，你的应用程序可以与其他应用程序进行可靠和安全的通信。

<img src="/images/serviceinvocation-quickstart/service-invocation-overview.png" width=800 alt="Diagram showing the steps of service invocation" style="padding-bottom:25px;">

Dapr 提供了几种服务调用方法，你可以根据你的方案选择这些方法。 在本快速入门中，你将启用 checkout 服务以HTTP 代理调用 order-processo 服务中的方法并且通过以下方式之一：

- [使用 Multi-App Run 模板文件同时运行此示例中的所有应用程序]({{< ref "#run-using-multi-app-run" >}})，或者
- [一次只运行一个应用程序]({{< ref "#run-one-application-at-a-time" >}})

在[概述文章]({{< ref service-invocation-overview.md >}})中了解更多关于Dapr的服务调用方法。

## 使用多应用程序运行

在继续快速入门之前，请选择您首选的语言。

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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstart 克隆目录的根目录导航到 quickstart 目录。

```bash
cd service_invocation/python/http
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
pip3 install -r requirements.txt
cd ../checkout
pip3 install -r requirements.txt
cd ..
```

### 第3步：运行 `order-processor` 和 `checkout` 服务

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 服务
- `checkout`服务

```bash
dapr run -f .
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要在运行`dapr run -f .`之前，将`python3`更改为`python`，请参考[`dapr.yaml`]({{< ref "#dapryaml-multi-app-run-template-file" >}})文件。

**预期输出**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### 发生了什么？

在此快速入门中运行 `dapr run -f .`，使用 `dapr.yaml` Multi-App Run 模板文件同时启动[订阅者]({{< ref "#order-processor-service" >}})和[发布者]({{< ref "#checkout-service" >}})应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 8001
    command: ["python3", "app.py"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["python3", "app.py"]
```

##### `order-processor` 服务

`order-processor`服务接收来自`checkout`服务的调用：

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=8001)
```

#### `checkout`服务

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```

{{% /codetab %}}

 <!-- JavaScript -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstart 克隆目录的根目录导航到 quickstart 目录。

```bash
cd service_invocation/javascript/http
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
npm install
cd ../checkout
npm install
cd ..
```

### 第3步：运行 `order-processor` 和 `checkout` 服务

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 服务
- `checkout`服务

```bash
dapr run -f .
```

**预期输出**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### 发生了什么？

在此快速入门中运行 `dapr run -f .`，使用 `dapr.yaml` Multi-App Run 模板文件同时启动[订阅者]({{< ref "#order-processor-service" >}})和[发布者]({{< ref "#checkout-service" >}})应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 5001
    command: ["npm", "start"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["npm", "start"]
```

##### `order-processor` 服务

`order-processor`服务接收来自`checkout`服务的调用：

```javascript
app.post('/orders', (req, res) => {
    console.log("Order received:", req.body);
    res.sendStatus(200);
});
```

##### `checkout`服务

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
console.log("Order passed: " + res.config.data);
```

{{% /codetab %}}

 <!-- .NET -->

{{% codetab %}}

### 第1步：先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 7 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstart 克隆目录的根目录导航到 quickstart 目录。

```bash
cd service_invocation/csharp/http
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

### 第3步：运行 `order-processor` 和 `checkout` 服务

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 服务
- `checkout`服务

```bash
dapr run -f .
```

**预期输出**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### 发生了什么？

在此快速入门中运行 `dapr run -f .`，使用 `dapr.yaml` Multi-App Run 模板文件同时启动[订阅者]({{< ref "#order-processor-service" >}})和[发布者]({{< ref "#checkout-service" >}})应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 7001
    command: ["dotnet", "run"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["dotnet", "run"]
```

##### `order-processor` 服务

`order-processor`服务接收来自`checkout`服务的调用：

```csharp
app.MapPost("/orders", (Order order) =>
{
    Console.WriteLine("Order received : " + order);
    return order.ToString();
});
```

##### `checkout`服务

在`checkout`服务的Program.cs文件中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstart 克隆目录的根目录导航到 quickstart 目录。

```bash
cd service_invocation/java/http
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
mvn clean install
cd ../checkout
mvn clean install
cd ..
```

### 第3步：运行 `order-processor` 和 `checkout` 服务

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 服务
- `checkout`服务

```bash
dapr run -f .
```

**预期输出**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### 发生了什么？

在此快速入门中运行 `dapr run -f .`，使用 `dapr.yaml` Multi-App Run 模板文件同时启动[订阅者]({{< ref "#order-processor-service" >}})和[发布者]({{< ref "#checkout-service" >}})应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 9001
    command: ["java", "-jar", "target/OrderProcessingService-0.0.1-SNAPSHOT.jar"]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["java", "-jar", "target/CheckoutService-0.0.1-SNAPSHOT.jar"]
```

##### `order-processor` 服务

`order-processor`服务接收来自`checkout`服务的调用：

```java
public String processOrders(@RequestBody Order body) {
        System.out.println("Order received: "+ body.getOrderId());
        return "CID" + body.getOrderId();
    }
```

##### `checkout`服务

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

从 Quickstart 克隆目录的根目录导航到 quickstart 目录。

```bash
cd service_invocation/go/http
```

安装 `order-processor` 和 `checkout` 应用的依赖项：

```bash
cd ./order-processor
go build .
cd ../checkout
go build .
cd ..
```

### 第3步：运行 `order-processor` 和 `checkout` 服务

通过以下命令，同时运行以下服务，并在其自己的 Dapr sidecar 旁边运行：

- `order-processor` 服务
- `checkout`服务

```bash
dapr run -f .
```

**预期输出**

```
== APP - order-processor == Order received : Order { orderId = 1 }
== APP - checkout == Order passed: Order { OrderId = 1 }
== APP - order-processor == Order received : Order { orderId = 2 }
== APP - checkout == Order passed: Order { OrderId = 2 }
== APP - order-processor == Order received : Order { orderId = 3 }
== APP - checkout == Order passed: Order { OrderId = 3 }
== APP - order-processor == Order received : Order { orderId = 4 }
== APP - checkout == Order passed: Order { OrderId = 4 }
== APP - order-processor == Order received : Order { orderId = 5 }
== APP - checkout == Order passed: Order { OrderId = 5 }
== APP - order-processor == Order received : Order { orderId = 6 }
== APP - checkout == Order passed: Order { OrderId = 6 }
== APP - order-processor == Order received : Order { orderId = 7 }
== APP - checkout == Order passed: Order { OrderId = 7 }
== APP - order-processor == Order received : Order { orderId = 8 }
== APP - checkout == Order passed: Order { OrderId = 8 }
== APP - order-processor == Order received : Order { orderId = 9 }
== APP - checkout == Order passed: Order { OrderId = 9 }
== APP - order-processor == Order received : Order { orderId = 10 }
== APP - checkout == Order passed: Order { OrderId = 10 }
== APP - order-processor == Order received : Order { orderId = 11 }
== APP - checkout == Order passed: Order { OrderId = 11 }
== APP - order-processor == Order received : Order { orderId = 12 }
== APP - checkout == Order passed: Order { OrderId = 12 }
== APP - order-processor == Order received : Order { orderId = 13 }
== APP - checkout == Order passed: Order { OrderId = 13 }
== APP - order-processor == Order received : Order { orderId = 14 }
== APP - checkout == Order passed: Order { OrderId = 14 }
== APP - order-processor == Order received : Order { orderId = 15 }
== APP - checkout == Order passed: Order { OrderId = 15 }
== APP - order-processor == Order received : Order { orderId = 16 }
== APP - checkout == Order passed: Order { OrderId = 16 }
== APP - order-processor == Order received : Order { orderId = 17 }
== APP - checkout == Order passed: Order { OrderId = 17 }
== APP - order-processor == Order received : Order { orderId = 18 }
== APP - checkout == Order passed: Order { OrderId = 18 }
== APP - order-processor == Order received : Order { orderId = 19 }
== APP - checkout == Order passed: Order { OrderId = 19 }
== APP - order-processor == Order received : Order { orderId = 20 }
== APP - checkout == Order passed: Order { OrderId = 20 }
Exited App successfully
```

### 发生了什么？

在此快速入门中运行 `dapr run -f .`，使用 `dapr.yaml` Multi-App Run 模板文件同时启动[订阅者]({{< ref "#order-processor-service" >}})和[发布者]({{< ref "#checkout-service" >}})应用程序。

##### `dapr.yaml` 多应用运行模板文件

使用 `dapr run -f .` 运行[多应用运行模板文件]({{< ref multi-app-dapr-run >}})，启动项目中的所有应用程序。 在这个快速入门中，`dapr.yaml`文件包含以下内容：

```yml
version: 1
apps:
  - appDirPath: ./order-processor/
    appID: order-processor
    appPort: 6006
    command: ["go", "run", "."]
  - appID: checkout
    appDirPath: ./checkout/
    command: ["go", "run", "."]
```

##### `order-processor` 服务

在`order-processo`服务中，每个订单都通过HTTP POST请求接收，并由`getOrder`函数处理。

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
}
```

##### `checkout`服务

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

{{% /codetab %}}

{{% /tabs %}}

## 一次只运行一个应用程序

在继续快速入门之前，请选择您首选的语言。

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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从 Quickstart 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd service_invocation/python/http/order-processor
```

安装依赖项并构建应用程序：

```bash
pip3 install -r requirements.txt 
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

```py
@app.route('/orders', methods=['POST'])
def getOrder():
    data = request.json
    print('Order received : ' + json.dumps(data), flush=True)
    return json.dumps({'success': True}), 200, {
        'ContentType': 'application/json'}


app.run(port=8001)
```

### 步骤4：运行`checkout`服务

在新的终端窗口中，从 Quickstart 克隆目录的根目录导航到 `checkout` 目录。

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

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```python
headers = {'dapr-app-id': 'order-processor'}

result = requests.post(
    url='%s/orders' % (base_url),
    data=json.dumps(order),
    headers=headers
)
```

### 第5步：与多应用程序运行一起使用

您可以使用[Dapr多应用程序运行模板]({{< ref multi-app-dapr-run >}}) 在此快速入门中运行Dapr应用程序。 而不是运行两个单独的 `dapr run` 命令 `order-processor` 和 `checkout` 应用程序，请运行以下命令：

```sh
dapr run -f .
```

要停止所有应用程序，请运行：

```sh
dapr stop -f .
```

### 第6步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout`服务输出：

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

`order-processor`服务输出：

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

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从 Quickstart 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd service_invocation/javascript/http/order-processor
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 5001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- npm start
```

```javascript
app.post('/orders', (req, res) => {
    console.log("Order received:", req.body);
    res.sendStatus(200);
});
```

### 步骤4：运行`checkout`服务

在新的终端窗口中，从 Quickstart 克隆目录的根目录导航到 `checkout` 目录。

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

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```javascript
let axiosConfig = {
  headers: {
      "dapr-app-id": "order-processor"
  }
};
const res = await axios.post(`${DAPR_HOST}:${DAPR_HTTP_PORT}/orders`, order , axiosConfig);
console.log("Order passed: " + res.config.data);
```

### 第5步：与多应用程序运行一起使用

您可以使用[Dapr多应用程序运行模板]({{< ref multi-app-dapr-run >}}) 在此快速入门中运行Dapr应用程序。 而不是运行两个单独的 `dapr run` 命令 `order-processor` 和 `checkout` 应用程序，请运行以下命令：

```sh
dapr run -f .
```

要停止所有应用程序，请运行：

```sh
dapr stop -f .
```

### 第6步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout`服务输出：

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

`order-processor`服务输出：

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

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 7 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从 Quickstart 克隆目录的根目录
导航到 `order-processor` 目录。

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

下面是订单处理器的工作代码块 `Program.cs` 文件。

```csharp
app.MapPost("/orders", (Order order) =>
{
    Console.WriteLine("Order received : " + order);
    return order.ToString();
});
```

### 步骤4：运行`checkout`服务

在新的终端窗口中，从 Quickstart 克隆目录的根目录导航到 `checkout` 目录。

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

在`checkout`服务的Program.cs文件中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```csharp
var client = new HttpClient();
client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));

client.DefaultRequestHeaders.Add("dapr-app-id", "order-processor");

var response = await client.PostAsync($"{baseURL}/orders", content);
    Console.WriteLine("Order passed: " + order);
```

### 第5步：与多应用程序运行一起使用

您可以使用[Dapr多应用程序运行模板]({{< ref multi-app-dapr-run >}}) 在此快速入门中运行Dapr应用程序。 而不是运行两个单独的 `dapr run` 命令 `order-processor` 和 `checkout` 应用程序，请运行以下命令：

```sh
dapr run -f .
```

要停止所有应用程序，请运行：

```sh
dapr stop -f .
```

### 第6步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout`服务输出：

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

`order-processor`服务输出：

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

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或者
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，3.x版本。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从 Quickstart 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd service_invocation/java/http/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

```java
public String processOrders(@RequestBody Order body) {
        System.out.println("Order received: "+ body.getOrderId());
        return "CID" + body.getOrderId();
    }
```

### 步骤4：运行`checkout`服务

在新的终端窗口中，从 Quickstart 克隆目录的根目录导航到 `checkout` 目录。

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

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```java
.header("Content-Type", "application/json")
.header("dapr-app-id", "order-processor")

HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Order passed: "+ orderId)
```

### 第5步：与多应用程序运行一起使用

您可以使用[Dapr多应用程序运行模板]({{< ref multi-app-dapr-run >}}) 在此快速入门中运行Dapr应用程序。 而不是运行两个单独的 `dapr run` 命令 `order-processor` 和 `checkout` 应用程序，请运行以下命令：

```sh
dapr run -f .
```

要停止所有应用程序，请运行：

```sh
dapr stop -f .
```

### 第6步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout`服务输出：

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

`order-processor`服务输出：

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

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Go的最新版本](https://go.dev/dl/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第2步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第3步：运行 `order-processor` 服务

在终端窗口中，从 Quickstart 克隆目录的根目录
导航到 `order-processor` 目录。

```bash
cd service_invocation/go/http/order-processor
```

安装依赖项：

```bash
go build .
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-port 6006 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- go run .
```

每个订单都通过HTTP POST请求接收，并由
`getOrder`函数处理。

```go
func getOrder(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Order received : %s", string(data))
}
```

### 步骤4：运行`checkout`服务

在新的终端窗口中，从 Quickstart 克隆目录的根目录导航到 `checkout` 目录。

```bash
cd service_invocation/go/http/checkout
```

安装依赖项：

```bash
go build .
```

与 Dapr sidecar 一起运行 `checkout` 服务。

```bash
dapr run --app-id checkout --app-protocol http --dapr-http-port 3500 -- go run .
```

在`checkout`服务中，您会注意到无需重写您的应用程序代码即可使用Dapr的服务调用。 您可以通过简单地添加 `dapr-app-id` 标头来启用服务调用，该标头指定目标服务的ID。

```go
req.Header.Add("dapr-app-id", "order-processor")

response, err := client.Do(req)
```

### 第5步：与多应用程序运行一起使用

您可以使用[Dapr多应用程序运行模板]({{< ref multi-app-dapr-run >}}) 在此快速入门中运行Dapr应用程序。 而不是运行两个单独的 `dapr run` 命令 `order-processor` 和 `checkout` 应用程序，请运行以下命令：

```sh
dapr run -f .
```

要停止所有应用程序，请运行：

```sh
dapr stop -f .
```

### 第6步：查看服务调用输出

Dapr 在任何 Dapr 实例上调用应用程序。 在代码中，Sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话通信。 Dapr 实例随后会相互发现并进行通信。

`checkout`服务输出：

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

`order-processor`服务输出：

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

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)参与讨论。

## 下一步

- 在[概述文章]({{< ref service-invocation-overview.md >}})中了解更多关于Dapr的服务调用方法。
- 了解更多关于如何调用 Dapr 的服务调用：
  - [HTTP]({{< ref howto-invoke-discover-services.md >}}), or
  - [gRPC]({{< ref howto-invoke-services-grpc.md >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
