---
type: docs
title: "快速入门：状态管理"
linkTitle: "状态管理"
weight: 74
description: "开始使用 Dapr 的状态管理模块"
---

本文将介绍 Dapr 的[状态管理模块]({{< ref state-management >}})。在本快速入门指南中，您将学习如何使用 Redis 状态存储来保存、获取和删除状态。您可以选择以下两种方式之一：
- [使用多应用运行模板文件同时启动所有应用]({{< ref "#run-using-multi-app-run" >}})，或
- [一次运行一个应用]({{< ref "#run-one-application-at-a-time" >}})

<img src="/images/state-management-quickstart.png" width=1000 style="padding-bottom:15px;">

虽然本示例使用了 Redis，您也可以替换为其他[支持的状态存储]({{< ref supported-state-stores.md >}})。

## 使用多应用运行

在开始之前，请选择您偏好的编程语言对应的 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装 Python 3.7+](https://www.python.org/downloads/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/python/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt 
```

使用 [多应用运行]({{< ref multi-app-dapr-run >}})在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run -f .
```
> **注意**：在 Windows 系统中，由于未定义 Python3.exe，您可能需要在运行 `dapr run -f .` 之前将 [`dapr.yaml`]({{< ref "#dapryaml-multi-app-run-template-file" >}}) 文件中的 `python3` 修改为 `python`。

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```python
with DaprClient() as client:

    # 将状态保存到状态存储中
    client.save_state(DAPR_STORE_NAME, orderId, str(order))
    logging.info('Saving Order: %s', order)

    # 从状态存储中获取状态
    result = client.get_state(DAPR_STORE_NAME, orderId)
    logging.info('Result after get: ' + str(result.data))

    # 从状态存储中删除状态
    client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
    logging.info('Deleting Order: %s', order)
```

### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `dapr.yaml` 多应用运行模板文件

当您运行 `dapr init` 时，Dapr 会创建一个名为 `dapr.yaml` 的默认[多应用运行模板文件]({{< ref multi-app-dapr-run >}})。运行 `dapr run -f` 会启动项目中的所有应用程序。在此示例中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../resources/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    command: ["python3" , "app.py"]
```

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 还会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装最新的 Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/javascript/sdk/order-processor
```

安装依赖项：

```bash
npm install
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run -f .
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```js
const client = new DaprClient()

// 将状态保存到状态存储中
await client.state.save(DAPR_STATE_STORE_NAME, order)
console.log("Saving Order: ", order)

// 从状态存储中获取状态
const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Getting Order: ", savedOrder)

// 从状态存储中删除状态
await client.state.delete(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Deleting Order: ", order)
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `dapr.yaml` 多应用运行模板文件

当您运行 `dapr init` 时，Dapr 会创建一个名为 `dapr.yaml` 的默认多应用运行模板文件。运行 `dapr run -f` 会启动项目中的所有应用程序。在此示例中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../resources/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    command: ["npm", "run", "start"]
```

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0) 或 [.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0) 已安装

**注意：** .NET 6 是此版本中 Dapr .NET SDK 包的最低支持版本。只有 .NET 8 和 .NET 9 将在 Dapr v1.16 及更高版本中得到支持。

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/csharp/sdk/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run -f .
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```cs
var client = new DaprClientBuilder().Build();

// 将状态保存到状态存储中
await client.SaveStateAsync(DAPR_STORE_NAME, orderId.ToString(), order.ToString());
Console.WriteLine("Saving Order: " + order);

// 从状态存储中获取状态
var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Getting Order: " + result);

// 从状态存储中删除状态
await client.DeleteStateAsync(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Deleting Order: " + order);
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `dapr.yaml` 多应用运行模板文件

当您运行 `dapr init` 时，Dapr 会创建一个名为 `dapr.yaml` 的默认多应用运行模板文件。运行 `dapr run -f` 会启动项目中的所有应用程序。在此示例中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../../resources/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    command: ["dotnet", "run"]
```

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- Java JDK 17（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/java/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run -f .
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```java
try (DaprClient client = new DaprClientBuilder().build()) {
  for (int i = 1; i <= 10; i++) {
    int orderId = i;
    Order order = new Order();
    order.setOrderId(orderId);

    // 将状态保存到状态存储中
    client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
    LOGGER.info("Saving Order: " + order.getOrderId());

    // 从状态存储中获取状态
    State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
    LOGGER.info("Getting Order: " + response.getValue().getOrderId());

    // 从状态存储中删除状态
    client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
    LOGGER.info("Deleting Order: " + orderId);
    TimeUnit.MILLISECONDS.sleep(1000);
  }
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `dapr.yaml` 多应用运行模板文件

当您运行 `dapr init` 时，Dapr 会创建一个名为 `dapr.yaml` 的默认多应用运行模板文件。运行 `dapr run -f` 会启动项目中的所有应用程序。在此示例中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../resources/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    command: ["java", "-jar", "target/OrderProcessingService-0.0.1-SNAPSHOT.jar"]
```

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的 Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/go/sdk/order-processor
```

安装依赖项：

```bash
go build .
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run -f .
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```go
  client, err := dapr.NewClient()

  // 将状态保存到状态存储中
  _ = client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order))
  log.Print("Saving Order: " + string(order))

  // 从状态存储中获取状态
  result, _ := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  fmt.Println("Getting Order: " + string(result.Value))

  // 从状态存储中删除状态
  _ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  log.Print("Deleting Order: " + string(order))
```

### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `dapr.yaml` 多应用运行模板文件

当您运行 `dapr init` 时，Dapr 会创建一个名为 `dapr.yaml` 的默认多应用运行模板文件。运行 `dapr run -f` 会启动项目中的所有应用程序。在此示例中，`dapr.yaml` 文件包含以下内容：

```yml
version: 1
common:
  resourcesPath: ../../resources/
apps:
  - appID: order-processor
    appDirPath: ./order-processor/
    command: ["go", "run", "."]
```

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

{{< /tabs >}}


## 一次运行一个应用程序

在开始之前，请选择您偏好的编程语言对应的 Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装 Python 3.7+](https://www.python.org/downloads/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/python/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- python3 app.py
```

> **注意**：在 Windows 系统中，由于未定义 Python3.exe，您可能需要使用 `python app.py` 而不是 `python3 app.py`。

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```python
with DaprClient() as client:

    # 将状态保存到状态存储中
    client.save_state(DAPR_STORE_NAME, orderId, str(order))
    logging.info('Saving Order: %s', order)

    # 从状态存储中获取状态
    result = client.get_state(DAPR_STORE_NAME, orderId)
    logging.info('Result after get: ' + str(result.data))

    # 从状态存储中删除状态
    client.delete_state(store_name=DAPR_STORE_NAME, key=orderId)
    logging.info('Deleting Order: %s', order)
```

### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装最新的 Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/javascript/sdk/order-processor
```

安装依赖项，其中将包括 JavaScript SDK 的 `@dapr/dapr` 包：

```bash
npm install
```

验证服务目录中包含以下文件：

- `package.json`
- `package-lock.json`

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- npm run start
```
`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```js
const client = new DaprClient()

// 将状态保存到状态存储中
await client.state.save(DAPR_STATE_STORE_NAME, order)
console.log("Saving Order: ", order)

// 从状态存储中获取状态
const savedOrder = await client.state.get(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Getting Order: ", savedOrder)

// 从状态存储中删除状态
await client.state.delete(DAPR_STATE_STORE_NAME, order.orderId)
console.log("Deleting Order: ", order)
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/csharp/sdk/order-processor
```

回忆 NuGet 包：

```bash
dotnet restore
dotnet build
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../resources/ -- dotnet run
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```cs
var client = new DaprClientBuilder().Build();

// 将状态保存到状态存储中
await client.SaveStateAsync(DAPR_STORE_NAME, orderId.ToString(), order.ToString());
Console.WriteLine("Saving Order: " + order);

// 从状态存储中获取状态
var result = await client.GetStateAsync<string>(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Getting Order: " + result);

// 从状态存储中删除状态
await client.DeleteStateAsync(DAPR_STORE_NAME, orderId.ToString());
Console.WriteLine("Deleting Order: " + order);
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- Java JDK 17（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/java/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```java
try (DaprClient client = new DaprClientBuilder().build()) {
  for (int i = 1; i <= 10; i++) {
    int orderId = i;
    Order order = new Order();
    order.setOrderId(orderId);

    // 将状态保存到状态存储中
    client.saveState(DAPR_STATE_STORE, String.valueOf(orderId), order).block();
    LOGGER.info("Saving Order: " + order.getOrderId());

    // 从状态存储中获取状态
    State<Order> response = client.getState(DAPR_STATE_STORE, String.valueOf(orderId), Order.class).block();
    LOGGER.info("Getting Order: " + response.getValue().getOrderId());

    // 从状态存储中删除状态
    client.deleteState(DAPR_STATE_STORE, String.valueOf(orderId)).block();
    LOGGER.info("Deleting Order: " + orderId);
    TimeUnit.MILLISECONDS.sleep(1000);
  }
```
### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 先决条件

您需要准备以下环境：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的 Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤 1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/state_management/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：操作服务状态

在终端中，进入 `order-processor` 目录。

```bash
cd state_management/go/sdk/order-processor
```

安装依赖项并构建应用程序：

```bash
go build .
```

在 Dapr sidecar 旁边启动 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../resources -- go run .
```

`order-processor` 服务会将 `orderId` 键/值对写入、读取并删除到[在 `statestore.yaml` 组件中定义的]({{< ref "#statestoreyaml-component-file" >}}) `statestore` 实例中。服务启动后，会自动执行一个循环。

```go
  client, err := dapr.NewClient()

  // 将状态保存到状态存储中
  _ = client.SaveState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId), []byte(order))
  log.Print("Saving Order: " + string(order))

  // 从状态存储中获取状态
  result, _ := client.GetState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  fmt.Println("Getting Order: " + string(result.Value))

  // 从状态存储中删除状态
  _ = client.DeleteState(ctx, STATE_STORE_NAME, strconv.Itoa(orderId))
  log.Print("Deleting Order: " + string(order))
```

### 步骤 3：查看 order-processor 输出

如上代码所示，应用程序会将状态保存在 Dapr 状态存储中，读取后再删除。

Order-processor 输出：
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

##### `statestore.yaml` 组件文件

当您运行 `dapr init` 时，Dapr 会创建一个默认的 Redis `statestore.yaml` 并在本地机器上运行一个 Redis 容器，位置如下：

- 在 Windows 上，位于 `%UserProfile%\.dapr\components\statestore.yaml`
- 在 Linux/MacOS 上，位于 `~/.dapr/components/statestore.yaml`

使用 `statestore.yaml` 组件，您可以轻松地替换[状态存储](/reference/components-reference/supported-state-stores/)而无需进行代码更改。

此快速入门中包含的 Redis `statestore.yaml` 文件包含以下内容：

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

- `metadata/name` 是您的应用程序与组件通信的方式（在代码示例中称为 `DAPR_STORE_NAME`）。
- `spec/metadata` 定义了组件使用的 Redis 实例的连接。

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法！
我们正在不断努力改进我们的快速入门示例，并重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的[discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)进行讨论。

## 下一步

- 使用 HTTP 而不是 SDK 来使用 Dapr 状态管理。
  - [Python](https://github.com/dapr/quickstarts/tree/master/state_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/state_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/state_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/state_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/state_management/go/http)
- 了解更多关于[状态管理模块]({{< ref state-management >}})的信息

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}