---
type: docs
title: "快速入门：机密管理"
linkTitle: "机密管理"
weight: 77
description: "开始使用Dapr的机密管理构建块"
---

Dapr提供了一个专用的机密API，允许开发者从机密存储中检索机密。在本快速入门中，您将：

1. 运行一个带有机密存储组件的微服务。
2. 在应用程序代码中使用Dapr机密API检索机密。

<img src="/images/secretsmanagement-quickstart/secrets-mgmt-quickstart.png" width=1000 alt="示例服务的机密管理图示。">

在继续快速入门之前，请选择您偏好的编程语言对应的Dapr SDK。

{{< tabs "Python" "JavaScript" ".NET" "Java" "Go" >}}
 <!-- Python -->
{{% codetab %}}

### 前置条件

您需要准备以下环境：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装Python 3.7+](https://www.python.org/downloads/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：检索机密

在终端窗口中，导航到`order-processor`目录。

```bash
cd secrets_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

> **注意**：在Windows中，可能需要使用`python app.py`而不是`python3 app.py`。

#### 背后的原理

**`order-processor`服务**

请注意，`order-processor`服务配置如下：

- 使用在`local-secret-store.yaml`组件中定义的`DAPR_SECRET_STORE`。
- 使用在`secrets.json`中定义的机密。

```python
# app.py
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
    secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
    logging.info('Fetched Secret: %s', secret.secret)
```

**`local-secret-store.yaml`组件**

`DAPR_SECRET_STORE`在`local-secret-store.yaml`组件文件中定义，位于[secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

在YAML文件中：

- `metadata/name`是应用程序引用组件的名称（在代码示例中称为`DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的机密的连接信息。

**`secrets.json`文件**

`SECRET_NAME`在`secrets.json`文件中定义，位于[secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 步骤3：查看order-processor输出

如上面的应用程序代码中所示，`order-processor`服务通过Dapr机密存储检索机密并在控制台中显示。

Order-processor输出：

```
== APP == INFO:root:Fetched Secret: {'secret': 'YourPasskeyHere'}
```

{{% /codetab %}}

 <!-- JavaScript -->
{{% codetab %}}

### 前置条件

您需要准备以下环境：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [已安装最新的Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：检索机密

在终端窗口中，导航到`order-processor`目录。

```bash
cd secrets_management/javascript/sdk/order-processor
```

安装依赖项：

```bash
npm install
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- npm start
```

#### 背后的原理

**`order-processor`服务**

请注意，`order-processor`服务配置如下：

- 使用在`local-secret-store.yaml`组件中定义的`DAPR_SECRET_STORE`。
- 使用在`secrets.json`中定义的机密。

```javascript
// index.js
const DAPR_SECRET_STORE = "localsecretstore";
const SECRET_NAME = "secret";

async function main() {
    // ...
    const secret = await client.secret.get(DAPR_SECRET_STORE, SECRET_NAME);
    console.log("Fetched Secret: " + JSON.stringify(secret));
}
```

**`local-secret-store.yaml`组件**

`DAPR_SECRET_STORE`在`local-secret-store.yaml`组件文件中定义，位于[secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

在YAML文件中：

- `metadata/name`是应用程序引用组件的名称（在代码示例中称为`DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的机密的连接信息。

**`secrets.json`文件**

`SECRET_NAME`在`secrets.json`文件中定义，位于[secrets_management/javascript/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 步骤3：查看order-processor输出

如上面的应用程序代码中所示，`order-processor`服务通过Dapr机密存储检索机密并在控制台中显示。

Order-processor输出：

```
== APP ==
== APP == > order-processor@1.0.0 start
== APP == > node index.js
== APP ==
== APP == Fetched Secret: {"secret":"YourPasskeyHere"}
```

{{% /codetab %}}

 <!-- .NET -->
{{% codetab %}}

### 前置条件

您需要准备以下环境：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [.NET 6](https://dotnet.microsoft.com/download/dotnet/6.0)、[.NET 8](https://dotnet.microsoft.com/download/dotnet/8.0)或[.NET 9](https://dotnet.microsoft.com/download/dotnet/9.0)已安装

**注意：** .NET 6是此版本中Dapr .NET SDK包的最低支持版本。只有.NET 8和.NET 9将在Dapr v1.16及以后版本中得到支持。

### 步骤1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：检索机密

在终端窗口中，导航到`order-processor`目录。

```bash
cd secrets_management/csharp/sdk/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- dotnet run
```

#### 背后的原理

**`order-processor`服务**

请注意，`order-processor`服务配置如下：

- 使用在`local-secret-store.yaml`组件中定义的`DAPR_SECRET_STORE`。
- 使用在`secrets.json`中定义的机密。

```csharp
// Program.cs
const string DAPR_SECRET_STORE = "localsecretstore";
const string SECRET_NAME = "secret";
var client = new DaprClientBuilder().Build();

var secret = await client.GetSecretAsync(DAPR_SECRET_STORE, SECRET_NAME);
var secretValue = string.Join(", ", secret);
Console.WriteLine($"Fetched Secret: {secretValue}");
```

**`local-secret-store.yaml`组件**

`DAPR_SECRET_STORE`在`local-secret-store.yaml`组件文件中定义，位于[secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

在YAML文件中：

- `metadata/name`是应用程序引用组件的名称（在代码示例中称为`DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的机密的连接信息。

**`secrets.json`文件**

`SECRET_NAME`在`secrets.json`文件中定义，位于[secrets_management/csharp/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 步骤3：查看order-processor输出

如上面的应用程序代码中所示，`order-processor`服务通过Dapr机密存储检索机密并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: [secret, YourPasskeyHere]
```

{{% /codetab %}}

 <!-- Java -->
{{% codetab %}}

### 前置条件

您需要准备以下环境：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- Java JDK 17（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：检索机密

在终端窗口中，导航到`order-processor`目录。

```bash
cd secrets_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

#### 背后的原理

**`order-processor`服务**

请注意，`order-processor`服务配置如下：

- 使用在`local-secret-store.yaml`组件中定义的`DAPR_SECRET_STORE`。
- 使用在`secrets.json`中定义的机密。

```java
// OrderProcessingServiceApplication.java
private static final String SECRET_STORE_NAME = "localsecretstore";
// ...
    Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
    System.out.println("Fetched Secret: " + secret);
```

**`local-secret-store.yaml`组件**

`DAPR_SECRET_STORE`在`local-secret-store.yaml`组件文件中定义，位于[secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

在YAML文件中：

- `metadata/name`是应用程序引用组件的名称（在代码示例中称为`DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的机密的连接信息。

**`secrets.json`文件**

`SECRET_NAME`在`secrets.json`文件中定义，位于[secrets_management/java/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 步骤3：查看order-processor输出

如上面的应用程序代码中所示，`order-processor`服务通过Dapr机密存储检索机密并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: {secret=YourPasskeyHere}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

### 前置条件

您需要准备以下环境：

- [Dapr CLI和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 步骤1：设置环境

克隆[快速入门仓库中的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤2：检索机密

在终端窗口中，导航到`order-processor`目录。

```bash
cd secrets_management/go/sdk/order-processor
```

安装依赖项：

```bash
go build .
```

运行`order-processor`服务及其Dapr sidecar。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- go run .
```

#### 背后的原理

**`order-processor`服务**

请注意，`order-processor`服务配置如下：

- 使用在`local-secret-store.yaml`组件中定义的`DAPR_SECRET_STORE`。
- 使用在`secrets.json`中定义的机密。

```go
const DAPR_SECRET_STORE = "localsecretstore"
const SECRET_NAME = "secret"
// ...
secret, err := client.GetSecret(ctx, DAPR_SECRET_STORE, SECRET_NAME, nil)
if secret != nil {
    fmt.Println("Fetched Secret: ", secret[SECRET_NAME])
}
```

**`local-secret-store.yaml`组件**

`DAPR_SECRET_STORE`在`local-secret-store.yaml`组件文件中定义，位于[secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localsecretstore
  namespace: default
spec:
  type: secretstores.local.file
  version: v1
  metadata:
  - name: secretsFile
    value: secrets.json
  - name: nestedSeparator
    value: ":"
```

在YAML文件中：

- `metadata/name`是应用程序引用组件的名称（在代码示例中称为`DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的机密的连接信息。

**`secrets.json`文件**

`SECRET_NAME`在`secrets.json`文件中定义，位于[secrets_management/go/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 步骤3：查看order-processor输出

如上面的应用程序代码中所示，`order-processor`服务通过Dapr机密存储检索机密并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret:  YourPasskeyHere
```

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法！

我们正在不断改进我们的快速入门示例，重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)讨论。

## 下一步

- 使用HTTP而不是SDK来使用Dapr机密管理。
  - [Python](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/http)
- 了解更多关于[机密管理构建块]({{< ref secrets-overview >}})

{{< button text="探索Dapr教程  >>" page="getting-started/tutorials/_index.md" >}}