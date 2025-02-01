---
type: docs
title: "快速入门：从服务到组件的弹性"
linkTitle: "弹性：从服务到组件"
weight: 110
description: "通过Dapr的状态管理API来了解其弹性功能"
---

通过模拟系统故障来了解Dapr的弹性功能。在本快速入门中，您将：

- 运行一个微服务应用程序，该应用程序通过Dapr的状态管理API持续保存和检索状态。
- 通过模拟系统故障来触发弹性策略。
- 解决故障后，微服务应用程序将恢复。

<img src="/images/resiliency-quickstart-svc-component.png" width="1000" alt="显示应用于Dapr API的弹性示意图">

在继续快速入门之前，请选择您偏好的Dapr SDK语言。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management/python/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到`order-processor`目录。

```bash
cd ../state_management/python/sdk/order-processor
```

安装依赖项

```bash
pip3 install -r requirements.txt 
```

### 步骤2：运行应用程序

在Dapr边车的支持下运行`order-processor`服务。然后，Dapr边车会加载位于资源目录中的弹性规范：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Resiliency
   metadata:
     name: myresiliency
   scopes:
     - order-processor

   spec:
     policies:
       retries:
         retryForever:
           policy: constant
           duration: 5s
           maxRetries: -1

       circuitBreakers:
         simpleCB:
           maxRequests: 1
           timeout: 5s
           trip: consecutiveFailures >= 5

     targets:
       components:
         statestore:
           outbound:
             retry: retryForever
             circuitBreaker: simpleCB
   ```

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3
```

应用程序启动后，`order-processor`服务会将`orderId`键值对写入和读取到`statestore`的Redis实例中[在`statestore.yaml`组件中定义]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}})。

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

### 步骤3：引入故障

通过停止在开发机器上执行`dapr init`时初始化的Redis容器实例来模拟故障。一旦实例停止，来自`order-processor`服务的写入和读取操作将开始失败。

由于`resiliency.yaml`规范将`statestore`定义为组件目标，所有失败的请求将自动应用重试和断路器策略：

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

一旦Redis停止，请求开始失败，并应用名为`retryForever`的重试策略。以下输出显示了来自`order-processor`服务的日志：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据`retryForever`策略，重试将以5秒间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦5次连续重试失败，断路器策略`simpleCB`被触发，断路器打开，停止所有请求：

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

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要Redis容器停止，这种半开/打开行为将继续。

### 步骤3：移除故障

当您在机器上重新启动Redis容器后，应用程序将无缝恢复并继续之前的操作。

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

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装最新的Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到`order-processor`目录。

```bash
cd ../state_management/javascript/sdk/order-processor
```

安装依赖项

```bash
npm install
```

### 步骤2：运行应用程序

在Dapr边车的支持下运行`order-processor`服务。然后，Dapr边车会加载位于资源目录中的弹性规范：

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

应用程序启动后，`order-processor`服务会将`orderId`键值对写入和读取到`statestore`的Redis实例中[在`statestore.yaml`组件中定义]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}})。

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

### 步骤3：引入故障

通过停止在开发机器上执行`dapr init`时初始化的Redis容器实例来模拟故障。一旦实例停止，来自`order-processor`服务的写入和读取操作将开始失败。

由于`resiliency.yaml`规范将`statestore`定义为组件目标，所有失败的请求将自动应用重试和断路器策略：

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

一旦Redis停止，请求开始失败，并应用名为`retryForever`的重试策略。以下输出显示了来自`order-processor`服务的日志：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据`retryForever`策略，重试将以5秒间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦5次连续重试失败，断路器策略`simpleCB`被触发，断路器打开，停止所有请求：

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

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要Redis容器停止，这种半开/打开行为将继续。

### 步骤3：移除故障

当您在机器上重新启动Redis容器后，应用程序将无缝恢复并继续之前的操作。

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

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [.NET SDK或.NET 6 SDK已安装](https://dotnet.microsoft.com/download)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到`order-processor`目录。

```bash
cd ../state_management/csharp/sdk/order-processor
```

安装依赖项

```bash
dotnet restore
dotnet build
```

### 步骤2：运行应用程序

在Dapr边车的支持下运行`order-processor`服务。然后，Dapr边车会加载位于资源目录中的弹性规范：

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

应用程序启动后，`order-processor`服务会将`orderId`键值对写入和读取到`statestore`的Redis实例中[在`statestore.yaml`组件中定义]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}})。

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

### 步骤3：引入故障

通过停止在开发机器上执行`dapr init`时初始化的Redis容器实例来模拟故障。一旦实例停止，来自`order-processor`服务的写入和读取操作将开始失败。

由于`resiliency.yaml`规范将`statestore`定义为组件目标，所有失败的请求将自动应用重试和断路器策略：

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

一旦Redis停止，请求开始失败，并应用名为`retryForever`的重试策略。以下输出显示了来自`order-processor`服务的日志：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据`retryForever`策略，重试将以5秒间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦5次连续重试失败，断路器策略`simpleCB`被触发，断路器打开，停止所有请求：

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

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要Redis容器停止，这种半开/打开行为将继续。

### 步骤3：移除故障

当您在机器上重新启动Redis容器后，应用程序将无缝恢复并继续之前的操作。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management/java/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到`order-processor`目录。

```bash
cd ../state_management/java/sdk/order-processor
```

安装依赖项

```bash
mvn clean install
```

### 步骤2：运行应用程序

在Dapr边车的支持下运行`order-processor`服务。然后，Dapr边车会加载位于资源目录中的弹性规范：

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

应用程序启动后，`order-processor`服务会将`orderId`键值对写入和读取到`statestore`的Redis实例中[在`statestore.yaml`组件中定义]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}})。

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

### 步骤3：引入故障

通过停止在开发机器上执行`dapr init`时初始化的Redis容器实例来模拟故障。一旦实例停止，来自`order-processor`服务的写入和读取操作将开始失败。

由于`resiliency.yaml`规范将`statestore`定义为组件目标，所有失败的请求将自动应用重试和断路器策略：

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

一旦Redis停止，请求开始失败，并应用名为`retryForever`的重试策略。以下输出显示了来自`order-processor`服务的日志：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据`retryForever`策略，重试将以5秒间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦5次连续重试失败，断路器策略`simpleCB`被触发，断路器打开，停止所有请求：

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

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要Redis容器停止，这种半开/打开行为将继续。

### 步骤3：移除故障

当您在机器上重新启动Redis容器后，应用程序将无缝恢复并继续之前的操作。

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

### 前提条件

对于此示例，您将需要：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端窗口中，导航到`order-processor`目录。

```bash
cd ../state_management/go/sdk/order-processor
```

安装依赖项

```bash
go build .
```

### 步骤2：运行应用程序

在Dapr边车的支持下运行`order-processor`服务。然后，Dapr边车会加载位于资源目录中的弹性规范：

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

应用程序启动后，`order-processor`服务会将`orderId`键值对写入和读取到`statestore`的Redis实例中[在`statestore.yaml`组件中定义]({{< ref "statemanagement-quickstart.md#statestoreyaml-component-file" >}})。

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

### 步骤3：引入故障

通过停止在开发机器上执行`dapr init`时初始化的Redis容器实例来模拟故障。一旦实例停止，来自`order-processor`服务的写入和读取操作将开始失败。

由于`resiliency.yaml`规范将`statestore`定义为组件目标，所有失败的请求将自动应用重试和断路器策略：

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

一旦Redis停止，请求开始失败，并应用名为`retryForever`的重试策略。以下输出显示了来自`order-processor`服务的日志：

```bash
INFO[0006] Error processing operation component[statestore] output. Retrying...
```

根据`retryForever`策略，重试将以5秒间隔无限期地继续每个失败的请求。

```yaml
retryForever:
  policy: constant
  maxInterval: 5s
  maxRetries: -1 
```

一旦5次连续重试失败，断路器策略`simpleCB`被触发，断路器打开，停止所有请求：

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

经过5秒后，断路器将切换到半开状态，允许一个请求通过以验证故障是否已解决。如果请求继续失败，断路器将再次触发回到打开状态。

```bash
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0031] Circuit breaker "simpleCB-statestore" changed state from half-open to open 
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from open to half-open  
INFO[0036] Circuit breaker "simpleCB-statestore" changed state from half-open to closed  
```

只要Redis容器停止，这种半开/打开行为将继续。

### 步骤3：移除故障

当您在机器上重新启动Redis容器后，应用程序将无缝恢复并继续之前的操作。

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

## 告诉我们您的想法！
我们正在不断努力改进我们的快速入门示例，并重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)讨论。

## 下一步

了解更多关于[弹性功能]({{< ref resiliency-overview.md >}})及其如何与Dapr的构建块API协作。

{{< button text="探索Dapr教程  >>" page="getting-started/tutorials/_index.md" >}}