---
type: docs
title: "快速入门：服务到组件的弹性"
linkTitle: "Resiliency: Service-to-component"
weight: 110
description: "通过状态管理API开始使用Dapr的弹性能力"
---

通过模拟系统故障来观察 Dapr 的弹性能力。 在本快速入门中，您将：

- 执行一个微服务应用程序，通过 Dapr 的状态管理 API 持续地存储和检索状态。
- 通过模拟系统故障来触发弹性策略。
- 解决故障，微服务应用程序将恢复。

<img src="/images/resiliency-quickstart-svc-component.png" width="1000" alt="显示应用于 Dapr API 的弹性的图示" />

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/resiliency)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd ../state_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt 
```

### 步骤 2：运行应用程序

与 Dapr sidecar 一起运行 `order-processor` 服务。 然后 Dapr sidecar 加载位于资源目录中的弹性规范：


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


```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3
```

应用程序启动后， `order-processor`服务写入和读取 `orderId` 键/值对 `状态存储` Redis 实例 [定义于 `statestore.yaml` 元件]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```

### 步骤 3：引入故障

在执行 `dapr init` 时，通过停止在开发机器上初始化的 Redis 容器实例来模拟故障。 实例停止后，从 `order-processor` 服务开始失败。

由于 `resiliency.yaml` 规范将 `statestore` 定义为组件目标，所有失败的请求都将应用重试和断路器策略：

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

在新的终端窗口中，运行以下命令以停止Redis：

```bash
docker stop dapr_redis
```

一旦停止Redis，请求将开始失败，并应用名为 `retryForever` 的重试策略。 下面的输出显示了来自 `order-processor` 服务：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据 `retryForever` 策略，每个失败的请求都会无限期地重试，间隔为5秒。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续失败5次重试，断路器策略， `simpleCB`，将被触发，断路器打开，停止所有请求：

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

超过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。 如果请求继续失败，将会跳回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要停止 Redis 容器，这种半开/开放行为将继续下去。

### 第3步：移除故障

一旦您重新启动您机器上的Redis容器，应用程序将无缝恢复，继续接受订单请求。

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新的Node.js已安装](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/resiliency)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd ../state_management/javascript/sdk/order-processor
```

安装依赖项：

```bash
npm install
```

### 步骤 2：运行应用程序

与 Dapr sidecar 一起运行 `order-processor` 服务。 然后 Dapr sidecar 加载位于资源目录中的弹性规范：


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

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- npm start
```

应用程序启动后， `order-processor`服务写入和读取 `orderId` 键/值对 `状态存储` Redis 实例 [定义于 `statestore.yaml` 元件]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```

### 步骤 3：引入故障

在执行 `dapr init` 时，通过停止在开发机器上初始化的 Redis 容器实例来模拟故障。 实例停止后，从 `order-processor` 服务开始失败。

由于 `resiliency.yaml` 规范将 `statestore` 定义为组件目标，所有失败的请求都将应用重试和断路器策略：

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

在新的终端窗口中，运行以下命令以停止Redis：

```bash
docker stop dapr_redis
```

一旦停止Redis，请求将开始失败，并应用名为 `retryForever` 的重试策略。 下面的输出显示了来自 `order-processor` 服务：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据 `retryForever` 策略，每个失败的请求都会无限期地重试，间隔为5秒。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续失败5次重试，断路器策略， `simpleCB`，将被触发，断路器打开，停止所有请求：

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

超过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。 如果请求继续失败，将会跳回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要停止 Redis 容器，这种半开/开放行为将继续下去。

### 第3步：移除故障

一旦您重新启动您机器上的Redis容器，应用程序将无缝恢复，继续接受订单请求。

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/resiliency)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd ../state_management/csharp/sdk/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

### 步骤 2：运行应用程序

与 Dapr sidecar 一起运行 `order-processor` 服务。 然后 Dapr sidecar 加载位于资源目录中的弹性规范：

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

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```

应用程序启动后， `order-processor`服务写入和读取 `orderId` 键/值对 `状态存储` Redis 实例 [定义于 `statestore.yaml` 元件]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```

### 步骤 3：引入故障

在执行 `dapr init` 时，通过停止在开发机器上初始化的 Redis 容器实例来模拟故障。 实例停止后，从 `order-processor` 服务开始失败。

由于 `resiliency.yaml` 规范将 `statestore` 定义为组件目标，所有失败的请求都将应用重试和断路器策略：

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

在新的终端窗口中，运行以下命令以停止Redis：

```bash
docker stop dapr_redis
```

一旦停止Redis，请求将开始失败，并应用名为 `retryForever` 的重试策略。 下面的输出显示了来自 `order-processor` 服务：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据 `retryForever` 策略，每个失败的请求都会无限期地重试，间隔为5秒。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续失败5次重试，断路器策略， `simpleCB`，将被触发，断路器打开，停止所有请求：

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

超过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。 如果请求继续失败，将会跳回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要停止 Redis 容器，这种半开/开放行为将继续下去。

### 第3步：移除故障

一旦您重新启动您机器上的Redis容器，应用程序将无缝恢复，继续接受订单请求。

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads), 或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/resiliency)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd ../state_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

### 步骤 2：运行应用程序

与 Dapr sidecar 一起运行 `order-processor` 服务。 然后 Dapr sidecar 加载位于资源目录中的弹性规范：

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

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

应用程序启动后， `order-processor`服务写入和读取 `orderId` 键/值对 `状态存储` Redis 实例 [定义于 `statestore.yaml` 元件]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```

### 步骤 3：引入故障

在执行 `dapr init` 时，通过停止在开发机器上初始化的 Redis 容器实例来模拟故障。 实例停止后，从 `order-processor` 服务开始失败。

由于 `resiliency.yaml` 规范将 `statestore` 定义为组件目标，所有失败的请求都将应用重试和断路器策略：

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

在新的终端窗口中，运行以下命令以停止Redis：

```bash
docker stop dapr_redis
```

一旦停止Redis，请求将开始失败，并应用名为 `retryForever` 的重试策略。 下面的输出显示了来自 `order-processor` 服务：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据 `retryForever` 策略，每个失败的请求都会无限期地重试，间隔为5秒。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续失败5次重试，断路器策略， `simpleCB`，将被触发，断路器打开，停止所有请求：

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

超过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。 如果请求继续失败，将会跳回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要停止 Redis 容器，这种半开/开放行为将继续下去。

### 第3步：移除故障

一旦您重新启动您机器上的Redis容器，应用程序将无缝恢复，继续接受订单请求。

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/resiliency)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd ../state_management/go/sdk/order-processor
```

安装依赖项：

```bash
go build .
```

### 步骤 2：运行应用程序

与 Dapr sidecar 一起运行 `order-processor` 服务。 然后 Dapr sidecar 加载位于资源目录中的弹性规范：

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

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- go run .
```

应用程序启动后， `order-processor`服务写入和读取 `orderId` 键/值对 `状态存储` Redis 实例 [定义于 `statestore.yaml` 元件]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}}).

```bash
== APP == Saving Order:  { orderId: '1' }
== APP == Getting Order:  { orderId: '1' }
== APP == Saving Order:  { orderId: '2' }
== APP == Getting Order:  { orderId: '2' }
== APP == Saving Order:  { orderId: '3' }
== APP == Getting Order:  { orderId: '3' }
== APP == Saving Order:  { orderId: '4' }
== APP == Getting Order:  { orderId: '4' }
```

### 步骤 3：引入故障

在执行 `dapr init` 时，通过停止在开发机器上初始化的 Redis 容器实例来模拟故障。 实例停止后，从 `order-processor` 服务开始失败。

由于 `resiliency.yaml` 规范将 `statestore` 定义为组件目标，所有失败的请求都将应用重试和断路器策略：

```yaml
  targets:
    components:
      statestore:
        outbound:
          retry: retryForever
          circuitBreaker: simpleCB
```

在新的终端窗口中，运行以下命令以停止Redis：

```bash
docker stop dapr_redis
```

一旦停止Redis，请求将开始失败，并应用名为 `retryForever` 的重试策略。 下面的输出显示了来自 `order-processor` 服务：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据 `retryForever` 策略，每个失败的请求都会无限期地重试，间隔为5秒。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦连续失败5次重试，断路器策略， `simpleCB`，将被触发，断路器打开，停止所有请求：

```bash
INFO[0026] Circuit breaker "simpleCB-statestore" changed state from closed to open
```

```yaml
circuitBreakers:
  simpleCB:
  maxRequests: 1
  timeout: 5s 
  trip: consecutiveFailures >= 5
```

超过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。 如果请求继续失败，将会跳回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要停止 Redis 容器，这种半开/开放行为将继续下去。

### 第3步：移除故障

一旦您重新启动您机器上的Redis容器，应用程序将无缝恢复，继续接受订单请求。

```bash
docker start dapr_redis
```

```bash
INFO[0036] Recovered processing operation component[statestore] output.  
== APP == Saving Order:  { orderId: '5' }
== APP == Getting Order:  { orderId: '5' }
== APP == Saving Order:  { orderId: '6' }
== APP == Getting Order:  { orderId: '6' }
== APP == Saving Order:  { orderId: '7' }
== APP == Getting Order:  { orderId: '7' }
== APP == Saving Order:  { orderId: '8' }
== APP == Getting Order:  { orderId: '8' }
== APP == Saving Order:  { orderId: '9' }
== APP == Getting Order:  { orderId: '9' }
```

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法
我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

了解有关的 [弹性功能]({{< ref resiliency-overview.md >}}) 以及它如何与Dapr的构建块API一起工作。

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
