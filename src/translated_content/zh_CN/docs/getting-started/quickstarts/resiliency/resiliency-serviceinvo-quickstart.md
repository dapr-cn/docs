---
type: docs
title: "入门指南：服务间的弹性"
linkTitle: "弹性：服务间"
weight: 120
description: "通过服务调用API开始使用Dapr的弹性功能"
---

通过模拟系统故障来测试Dapr的弹性功能。在本入门指南中，您将会：

- 运行两个微服务应用程序：`checkout`和`order-processor`。`checkout`将持续向`order-processor`发起Dapr服务调用请求。
- 通过模拟系统故障来触发弹性机制。
- 移除故障以让微服务应用程序恢复。

<img src="/images/resiliency-quickstart-svc-invoke.png" width="1000" alt="显示应用于Dapr API的弹性图示">

在继续入门指南之前，选择您偏好的Dapr SDK语言版本。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装Python 3.7+](https://www.python.org/downloads/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[入门指南仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation/python/http)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：运行`order-processor`服务

在终端窗口中，从入门指南目录的根目录导航到`order-processor`目录。

```bash
cd service_invocation/python/http/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-port 8001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

### 步骤3：运行`checkout`服务应用程序

在新的终端窗口中，从入门指南目录的根目录导航到`checkout`目录。

```bash
cd service_invocation/python/http/checkout
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

运行`checkout`服务及其Dapr sidecar。

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- python3 app.py
```

Dapr sidecar随后加载位于资源目录中的弹性配置：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

### 步骤4：查看服务调用输出
当两个服务和sidecar都在运行时，注意订单如何通过Dapr服务调用从`checkout`服务传递到`order-processor`服务。

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### 步骤5：引入故障
通过停止`order-processor`服务来模拟故障。一旦实例停止，来自`checkout`服务的服务调用操作将开始失败。

由于`resiliency.yaml`配置将`order-processor`服务定义为弹性目标，所有失败的请求将应用重试和断路器策略：

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

在`order-processor`窗口中，停止服务：

```script
CTRL + C
```

一旦第一个请求失败，名为`retryForever`的重试策略将被应用：

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

重试将以5秒的间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续5次重试失败，断路器策略`simpleCB`将被触发，断路器打开，停止所有请求：

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

这种半开/打开行为将持续到`order-processor`服务停止为止。

### 步骤6：移除故障

一旦您重新启动`order-processor`服务，应用程序将无缝恢复，继续接受订单请求。

在`order-processor`服务终端中，重新启动应用程序：

```bash
dapr run --app-port 8001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- python3 app.py
```

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor`服务输出：

```
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

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装最新的Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[入门指南仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation/javascript/http)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：运行`order-processor`服务

在终端窗口中，从入门指南目录的根目录导航到`order-processor`目录。

```bash
cd service_invocation/javascript/http/order-processor
```

安装依赖项：

```bash
npm install
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-port 5001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- npm start
```

### 步骤3：运行`checkout`服务应用程序

在新的终端窗口中，从入门指南目录的根目录导航到`checkout`目录。

```bash
cd service_invocation/javascript/http/checkout
```

安装依赖项：

```bash
npm install
```

运行`checkout`服务及其Dapr sidecar。

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- npm start
```

Dapr sidecar随后加载位于资源目录中的弹性配置：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

### 步骤4：查看服务调用输出
当两个服务和sidecar都在运行时，注意订单如何通过Dapr服务调用从`checkout`服务传递到`order-processor`服务。

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### 步骤5：引入故障
通过停止`order-processor`服务来模拟故障。一旦实例停止，来自`checkout`服务的服务调用操作将开始失败。

由于`resiliency.yaml`配置将`order-processor`服务定义为弹性目标，所有失败的请求将应用重试和断路器策略：

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

在`order-processor`窗口中，停止服务：

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


一旦第一个请求失败，名为`retryForever`的重试策略将被应用：

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

重试将以5秒的间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续5次重试失败，断路器策略`simpleCB`将被触发，断路器打开，停止所有请求：

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

这种半开/打开行为将持续到`order-processor`服务停止为止。

### 步骤6：移除故障

一旦您重新启动`order-processor`服务，应用程序将无缝恢复，继续接受订单请求。

在`order-processor`服务终端中，重新启动应用程序：

```bash
dapr run --app-port 5001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- npm start
```

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor`服务输出：

```
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

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [.NET SDK或.NET 6 SDK已安装](https://dotnet.microsoft.com/download)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[入门指南仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation/csharp/http)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：运行`order-processor`服务

在终端窗口中，从入门指南目录的根目录导航到`order-processor`目录。

```bash
cd service_invocation/csharp/http/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-port 7001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- dotnet run
```

### 步骤3：运行`checkout`服务应用程序

在新的终端窗口中，从入门指南目录的根目录导航到`checkout`目录。

```bash
cd service_invocation/csharp/http/checkout
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

运行`checkout`服务及其Dapr sidecar。

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- dotnet run
```

Dapr sidecar随后加载位于资源目录中的弹性配置：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

### 步骤4：查看服务调用输出
当两个服务和sidecar都在运行时，注意订单如何通过Dapr服务调用从`checkout`服务传递到`order-processor`服务。

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### 步骤5：引入故障
通过停止`order-processor`服务来模拟故障。一旦实例停止，来自`checkout`服务的服务调用操作将开始失败。

由于`resiliency.yaml`配置将`order-processor`服务定义为弹性目标，所有失败的请求将应用重试和断路器策略：

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

在`order-processor`窗口中，停止服务：

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


一旦第一个请求失败，名为`retryForever`的重试策略将被应用：

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

重试将以5秒的间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续5次重试失败，断路器策略`simpleCB`将被触发，断路器打开，停止所有请求：

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

这种半开/打开行为将持续到`order-processor`服务停止为止。

### 步骤6：移除故障

一旦您重新启动`order-processor`服务，应用程序将无缝恢复，继续接受订单请求。

在`order-processor`服务终端中，重新启动应用程序：

```bash
dapr run --app-port 7001 --app-id order-processor --app-protocol http --dapr-http-port 3501 -- dotnet run
```

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- Java JDK 17（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[入门指南仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation/java/http)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：运行`order-processor`服务

在终端窗口中，从入门指南目录的根目录导航到`order-processor`目录。

```bash
cd service_invocation/java/http/order-processor
```

安装依赖项：

```bash
mvn clean install
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

### 步骤3：运行`checkout`服务应用程序

在新的终端窗口中，从入门指南目录的根目录导航到`checkout`目录。

```bash
cd service_invocation/java/http/checkout
```

安装依赖项：

```bash
mvn clean install
```

运行`checkout`服务及其Dapr sidecar。

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- java -jar target/CheckoutService-0.0.1-SNAPSHOT.jar
```

Dapr sidecar随后加载位于资源目录中的弹性配置：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

### 步骤4：查看服务调用输出
当两个服务和sidecar都在运行时，注意订单如何通过Dapr服务调用从`checkout`服务传递到`order-processor`服务。

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### 步骤5：引入故障
通过停止`order-processor`服务来模拟故障。一旦实例停止，来自`checkout`服务的服务调用操作将开始失败。

由于`resiliency.yaml`配置将`order-processor`服务定义为弹性目标，所有失败的请求将应用重试和断路器策略：

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

在`order-processor`窗口中，停止服务：

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


一旦第一个请求失败，名为`retryForever`的重试策略将被应用：

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

重试将以5秒的间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续5次重试失败，断路器策略`simpleCB`将被触发，断路器打开，停止所有请求：

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

这种半开/打开行为将持续到`order-processor`服务停止为止。

### 步骤6：移除故障

一旦您重新启动`order-processor`服务，应用程序将无缝恢复，继续接受订单请求。

在`order-processor`服务终端中，重新启动应用程序：

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ --app-port 9001 --app-protocol http --dapr-http-port 3501 -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[入门指南仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/service_invocation/go/http)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：运行`order-processor`服务

在终端窗口中，从入门指南目录的根目录导航到`order-processor`目录。

```bash
cd service_invocation/go/http/order-processor
```

安装依赖项：

```bash
go build .
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-port 6001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- go run .
```

### 步骤3：运行`checkout`服务应用程序

在新的终端窗口中，从入门指南目录的根目录导航到`checkout`目录。

```bash
cd service_invocation/go/http/checkout
```

安装依赖项：

```bash
go build .
```

运行`checkout`服务及其Dapr sidecar。

```bash
dapr run --app-id checkout --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3500 -- go run .
```

Dapr sidecar随后加载位于资源目录中的弹性配置：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - checkout
   
   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           maxInterval: 5s
           maxRetries: -1 
   
       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s 
           trip: consecutiveFailures >= 5
   
     targets:
       apps:
         order-processor:
           retry: retryForever
           circuitBreaker: simpleCB
   ```

### 步骤4：查看服务调用输出
当两个服务和sidecar都在运行时，注意订单如何通过Dapr服务调用从`checkout`服务传递到`order-processor`服务。

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 1}
== APP == Order passed: {"orderId": 2}
== APP == Order passed: {"orderId": 3}
== APP == Order passed: {"orderId": 4}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 1}
== APP == Order received: {"orderId": 2}
== APP == Order received: {"orderId": 3}
== APP == Order received: {"orderId": 4}
```

### 步骤5：引入故障
通过停止`order-processor`服务来模拟故障。一旦实例停止，来自`checkout`服务的服务调用操作将开始失败。

由于`resiliency.yaml`配置将`order-processor`服务定义为弹性目标，所有失败的请求将应用重试和断路器策略：

```yaml
  targets:
    apps:
      order-processor:
        retry: retryForever
        circuitBreaker: simpleCB
```

在`order-processor`窗口中，停止服务：

{{< tabs "MacOs" "Windows" >}}

 <!-- MacOS -->

{{% codetab %}}

```script
CMD + C
```

{{% /codetab %}}

 <!-- Windows -->

{{% codetab %}}

```script
CTRL + C
```

{{% /codetab %}}

{{< /tabs >}}


一旦第一个请求失败，名为`retryForever`的重试策略将被应用：

```bash
INFO[0005] Error processing operation endpoint[order-processor, order-processor:orders]. Retrying...  
```

重试将以5秒的间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续5次重试失败，断路器策略`simpleCB`将被触发，断路器打开，停止所有请求：

```bash
INFO[0025] Circuit breaker "order-processor:orders" changed state from closed to open  
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open   
INFO[0030] Circuit breaker "order-processor:orders" changed state from open to half-open  
INFO[0030] Circuit breaker "order-processor:orders" changed state from half-open to open     
```

这种半开/打开行为将持续到`order-processor`服务停止为止。

### 步骤6：移除故障

一旦您重新启动`order-processor`服务，应用程序将无缝恢复，继续接受订单请求。

在`order-processor`服务终端中，重新启动应用程序：

```bash
dapr run --app-port 6001 --app-id order-processor --resources-path ../../../resources/ --app-protocol http --dapr-http-port 3501 -- go run .
```

`checkout`服务输出：

```
== APP == Order passed: {"orderId": 5}
== APP == Order passed: {"orderId": 6}
== APP == Order passed: {"orderId": 7}
== APP == Order passed: {"orderId": 8}
== APP == Order passed: {"orderId": 9}
== APP == Order passed: {"orderId": 10}
```

`order-processor`服务输出：

```
== APP == Order received: {"orderId": 5}
== APP == Order received: {"orderId": 6}
== APP == Order received: {"orderId": 7}
== APP == Order received: {"orderId": 8}
== APP == Order received: {"orderId": 9}
== APP == Order received: {"orderId": 10}
```

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法！
我们正在不断努力改进我们的入门指南示例，重视您的反馈。您觉得这个入门指南有帮助吗？您有改进建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)讨论。

## 下一步
访问[此链接](https://docs.dapr.io/operations/resiliency/resiliency-overview//)以获取有关Dapr弹性的更多信息。

{{< button text="探索Dapr教程  >>" page="getting-started/tutorials/_index.md" >}}