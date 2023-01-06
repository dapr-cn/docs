---
type: docs
title: "快速入门：状态管理"
linkTitle: "状态管理"
weight: 72
description: "Get started with Dapr's State Management building block"
---

让我们看看Dapr的 [状态管理构建块]({{< ref state-management >}})。 在本快速入门中，您将使用 Redis 状态存储来保存、获取和删除状态，但您可以将其替换为任何一个 [受支持的状态存储]({{< ref supported-state-stores.md >}})。

<img src="/images/state-management-quickstart.png" width=1000 style="padding-bottom:15px;">

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：操作服务状态

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd state_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components/ -- python3 app.py
```

`order-processor` 服务向定义在 [ `statestore.yaml` ]({{< ref "#statestoreyaml-component-file" >}}) 组件中的 `statestore` 实例 写入、读取和删除 `orderId` 键/值对。 一旦服务启动，它就会执行循环。

```python
with DaprClient() as client:

    # Save state into the state store
    client.save_state(DAPR_STORE_NAME, orderId, str(order))
    logging.info('Saving Order: %s', order)

    # Get state from the state store
    result = client.get_state(DAPR_STORE_NAME, orderId)
    logging.info('Result after get: ' + str(result.data))

    # Delete state from the state store
    client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
    logging.info('Deleting Order: %s', order)
```

### 第3步：查看order-processor输出

请注意，正如上面代码中所指定的，代码将应用程序状态保存在 Dapr 状态存储中，读取它，然后将其删除。

Order-processor输出：
```
== APP == INFO:root:Saving Order: {'orderId': '1'}
== APP == INFO:root:Result after get: b"{'orderId': '1'}"
== APP == INFO:root:Deleting Order: {'orderId': '1'}
== APP == INFO:root:Saving Order: {'orderId': '2'}
== APP == INFO:root:Result after get: b"{'orderId': '2'}"
== APP == INFO:root:Deleting Order: {'orderId': '2'}
== APP == INFO:root:Saving Order: {'orderId': '3'}
== APP == INFO:root:Result after get: b"{'orderId': '3'}"
== APP == INFO:root:Deleting Order: {'orderId': '3'}
== APP == INFO:root:Saving Order: {'orderId': '4'}
== APP == INFO:root:Result after get: b"{'orderId': '4'}"
== APP == INFO:root:Deleting Order: {'orderId': '4'}
```

#### `statestore.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松更换 [状态存储](/reference/components-reference/supported-state-stores/) 而无需更改代码。

本快速入门包含的 Redis `statestore.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

在 YAML 文件中：

- `metadata/name` 是您的应用程序与组件通信的方式(在代码示例中称为 `DAPR_STORE_NAME`)。
- `spec/metadata` 定义与组件使用的 Redis 实例的连接。

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：操作服务状态

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd state_management/javascript/sdk/order-processor
```

安装依赖项，其中将包括 JavaScript SDK 中的 `dapr-client` 包：

```bash
npm install
```

验证服务目录中是否包含以下文件：

- `package.json`
- `package-lock.json`

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components/ -- npm run start
```
`order-processor` 服务向 [定义在 `statestore.yaml` 组件]({{< ref "#statestoreyaml-component-file" >}}) 中的 `statestore` 实例 写入、读取和删除 `orderId` 键/值对。 一旦服务启动，它就会执行循环。

```js
  const client = new DaprClient(DAPR_HOST, DAPR_HTTP_PORT);

  // Save state into the state store
  client.state.save(STATE_STORE_NAME, [
      {
          key: orderId.toString(),
          value: order
      }
  ]);
  console.log("Saving Order: ", order);

  // Get state from the state store
  var result = client.state.get(STATE_STORE_NAME, orderId.toString());
  result.then(function(val) {
      console.log("Getting Order: ", val);
  });

  // Delete state from the state store
  client.state.delete(STATE_STORE_NAME, orderId.toString());    
  result.then(function(val) {
      console.log("Deleting Order: ", val);
  });

```
### 第3步：查看order-processor输出

请注意，正如上面代码中所指定的，代码将应用程序状态保存在 Dapr 状态存储中，读取它，然后将其删除。

Order-processor输出：
```
== APP == > order-processor@1.0.0 start
== APP == > node index.js
== APP == Saving Order:  { orderId: 1 }
== APP == Saving Order:  { orderId: 2 }
== APP == Saving Order:  { orderId: 3 }
== APP == Saving Order:  { orderId: 4 }
== APP == Saving Order:  { orderId: 5 }
== APP == Getting Order:  { orderId: 1 }
== APP == Deleting Order:  { orderId: 1 }
== APP == Getting Order:  { orderId: 2 }
== APP == Deleting Order:  { orderId: 2 }
== APP == Getting Order:  { orderId: 3 }
== APP == Deleting Order:  { orderId: 3 }
== APP == Getting Order:  { orderId: 4 }
== APP == Deleting Order:  { orderId: 4 }
== APP == Getting Order:  { orderId: 5 }
== APP == Deleting Order:  { orderId: 5 }
```

#### `statestore.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松换出 [状态存储](/reference/components-reference/supported-state-stores/) 而无需更改代码。

本快速入门包含的 Redis `statestore.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

在 YAML 文件中：

- `metadata/name` 是您的应用程序与组件通信的方式(在代码示例中称为 `DAPR_STORE_NAME`)。
- `spec/metadata` 定义与组件使用的 Redis 实例的连接。

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：操作服务状态

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd state_management/csharp/sdk/order-processor
```

还原 NuGet 包：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components/ -- dotnet run
```

`order-processor` 服务向 [定义在 `statestore.yaml` 组件]({{< ref "#statestoreyaml-component-file" >}}) 中的 `statestore` 实例 写入、读取和删除 `orderId` 键/值对。 一旦服务启动，它就会执行循环。

```cs
var client = new DaprClientBuilder().Build();

// Save state into the state store
await client.SaveStateAsync(DAPR_STORE_NAME, orderId.ToString(), order.ToString());
Console.WriteLine("Saving Order: " + order);

// Get state from the state store
var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Getting Order: " + result);

// Delete state from the state store
await client.DeleteStateAsync(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Deleting Order: " + order);
```
### 第3步：查看order-processor输出

请注意，正如上面代码中所指定的，代码将应用程序状态保存在 Dapr 状态存储中，读取它，然后将其删除。

Order-processor输出：
```
== APP == Saving Order: Order { orderId = 1 }
== APP == Getting Order: Order { orderId = 1 }
== APP == Deleting Order: Order { orderId = 1 }
== APP == Saving Order: Order { orderId = 2 }
== APP == Getting Order: Order { orderId = 2 }
== APP == Deleting Order: Order { orderId = 2 }
== APP == Saving Order: Order { orderId = 3 }
== APP == Getting Order: Order { orderId = 3 }
== APP == Deleting Order: Order { orderId = 3 }
== APP == Saving Order: Order { orderId = 4 }
== APP == Getting Order: Order { orderId = 4 }
== APP == Deleting Order: Order { orderId = 4 }
== APP == Saving Order: Order { orderId = 5 }
== APP == Getting Order: Order { orderId = 5 }
== APP == Deleting Order: Order { orderId = 5 }
```

#### `statestore.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松换出 [状态存储](/reference/components-reference/supported-state-stores/) 而无需更改代码。

本快速入门包含的 Redis `statestore.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

在 YAML 文件中：

- `metadata/name` 是您的应用程序与组件通信的方式(在代码示例中称为 `DAPR_STORE_NAME`)。
- `spec/metadata` 定义与组件使用的 Redis 实例的连接。

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：操作服务状态

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd state_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components -- java -jar target/order-processor-0.0.1-SNAPSHOT.jar
```

`order-processor` 服务向 [定义在 `statestore.yaml` 组件]({{< ref "#statestoreyaml-component-file" >}}) 中的 `statestore` 实例 写入、读取和删除 `orderId` 键/值对。 一旦服务启动，它就会执行循环。

```java
try (DaprClient client = new DaprClientBuilder().build()) {
  for (int i = 1; i <= 10; i++) {
    int orderId = i;
    Order order = new Order();
    order.setOrderId(orderId);

    // Save state into the state store
    client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
    LOGGER.info("Saving Order: " + order.getOrderId());

    // Get state from the state store
    State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
    LOGGER.info("Getting Order: " + response.getValue().getOrderId());

    // Delete state from the state store
    client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
    LOGGER.info("Deleting Order: " + orderId);
    TimeUnit.MILLISECONDS.sleep(1000);
  }
```
### 第3步：查看order-processor输出

请注意，正如上面代码中所指定的，代码将应用程序状态保存在 Dapr 状态存储中，读取它，然后将其删除。

Order-processor输出：
```
== APP == INFO:root:Saving Order: {'orderId': '1'}
== APP == INFO:root:Result after get: b"{'orderId': '1'}"
== APP == INFO:root:Deleting Order: {'orderId': '1'}
== APP == INFO:root:Saving Order: {'orderId': '2'}
== APP == INFO:root:Result after get: b"{'orderId': '2'}"
== APP == INFO:root:Deleting Order: {'orderId': '2'}
== APP == INFO:root:Saving Order: {'orderId': '3'}
== APP == INFO:root:Result after get: b"{'orderId': '3'}"
== APP == INFO:root:Deleting Order: {'orderId': '3'}
== APP == INFO:root:Saving Order: {'orderId': '4'}
== APP == INFO:root:Result after get: b"{'orderId': '4'}"
== APP == INFO:root:Deleting Order: {'orderId': '4'}
```

#### `statestore.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松换出 [状态存储](/reference/components-reference/supported-state-stores/) 而无需更改代码。

本快速入门包含的 Redis `statestore.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

在 YAML 文件中：

- `metadata/name` 是您的应用程序与组件通信的方式(在代码示例中称为 `DAPR_STORE_NAME`)。
- `spec/metadata` 定义与组件使用的 Redis 实例的连接。

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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/state_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：操作服务状态

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd state_management/go/sdk/order-processor
```

安装依赖项并构建应用程序：

```bash
go build app.go
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components -- go run app.go
```

`order-processor` 服务向 [定义在 `statestore.yaml` 组件]({{< ref "#statestoreyaml-component-file" >}}) 中的 `statestore` 实例 写入、读取和删除 `orderId` 键/值对。 一旦服务启动，它就会执行循环。

```go
  client, err := dapr.NewClient()

  // Save state into the state store
  _ = client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order))
  log.Print("Saving Order: " + string(order))

  // Get state from the state store
  result, _ := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  fmt.Println("Getting Order: " + string(result.Value))

  // Delete state from the state store
  _ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  log.Print("Deleting Order: " + string(order))
```

### 第3步：查看order-processor输出

请注意，正如上面代码中所指定的，代码将应用程序状态保存在 Dapr 状态存储中，读取它，然后将其删除。

Order-processor输出：
```
== APP == dapr client initializing for: 127.0.0.1:53689
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":1}
== APP == Getting Order: {"orderId":1}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":1}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":2}
== APP == Getting Order: {"orderId":2}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":2}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":3}
== APP == Getting Order: {"orderId":3}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":3}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":4}
== APP == Getting Order: {"orderId":4}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":4}
== APP == 2022/04/01 09:16:03 Saving Order: {"orderId":5}
== APP == Getting Order: {"orderId":5}
== APP == 2022/04/01 09:16:03 Deleting Order: {"orderId":5}
```

#### `statestore.yaml` 组件文件

当你运行 `dapr init`时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在你的本地机器上运行一个 Redis 容器，它位于：

- 在Windows上，在 `%UserProfile%\.dapr\components\statestore.yaml`
- 在Linux/MacOS上，在 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松换出 [状态存储](/reference/components-reference/supported-state-stores/) 而无需更改代码。

本快速入门包含的 Redis `statestore.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
  - name: actorStateStore
    value: "true"
```

在 YAML 文件中：

- `metadata/name` 是您的应用程序与组件通信的方式(在代码示例中称为 `DAPR_STORE_NAME`)。
- `spec/metadata` 定义与组件使用的 Redis 实例的连接。

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法
我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.gg/22ZtJrNe)中的讨论。

## 下一步

- 使用 HTTP 而不是 SDK 的 Dapr 状态管理。
  - [Python](https://github.com/dapr/quickstarts/tree/master/state_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/state_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/state_management/go/http)
- 了解更多关于 [状态管理构建块]({{< ref state-management >}})的信息

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
