---
type: docs
title: 快速入门：Secrets 管理
linkTitle: 密钥管理
weight: 76
description: 开始使用 Dapr 的 Secrets Management 构建块
---

Dapr 提供了一个专用的秘钥 API，允许开发者从秘钥存储中检索秘钥。 在本快速入门中，您将：

1. 使用密钥存储组件运行微服务。
2. 在应用程序代码中使用 Dapr 密钥 API 检索密钥。

<img src="/images/secretsmanagement-quickstart/secrets-mgmt-quickstart.png" width=1000 alt="Diagram showing secrets management of example service.">

在继续快速入门之前，请选择您首选的特定语言 Dapr SDK。



 <!-- Python -->

{{% codetab %}}

### 先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装Python 3.7+](https://www.python.org/downloads/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第1步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在一个终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/python/sdk/order-processor
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- python3 app.py
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

#### 在这个幕后

**\`order-processor 服务**

请注意下面的 `order-processor` 服务指向：

- `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json` 中定义的密钥。

```python
# app.py
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
    secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
    logging.info('Fetched Secret: %s', secret.secret)
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml) 的 `local-secret-store.yaml` 组件文件中定义：

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

在 YAML 文件中：

- `metadata/name` 是应用程序引用组件的方式（在代码示例中称为 `DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在位于 [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk/order-processor/secrets.json) 的 `secrets.json` 文件中定义：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的，`order-processor`服务通过Dapr密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == INFO:root:Fetched Secret: {'secret': 'YourPasskeyHere'}
```



 <!-- JavaScript -->

{{% codetab %}}

### 先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装最新的Node.js](https://nodejs.org/download/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第1步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在一个终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/javascript/sdk/order-processor
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- npm start
```

#### 在这个幕后

**\`order-processor 服务**

请注意下面的 `order-processor` 服务指向：

- `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json` 中定义的密钥。

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

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml) 的 `local-secret-store.yaml` 组件文件中定义：

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

在 YAML 文件中：

- `metadata/name` 是应用程序引用组件的方式（在代码示例中称为 `DAPR_SECRET_STORE`）。
- `spec/metadata`定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在位于 [secrets_management/javascript/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk/order-processor/secrets.json) 的 `secrets.json` 文件中定义：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的，`order-processor`服务通过Dapr密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP ==
== APP == > order-processor@1.0.0 start
== APP == > node index.js
== APP ==
== APP == Fetched Secret: {"secret":"YourPasskeyHere"}
```



 <!-- .NET -->

{{% codetab %}}

### 先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [已安装.NET SDK或.NET 6 SDK](https://dotnet.microsoft.com/download)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第1步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在一个终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/csharp/sdk/order-processor
```

安装依赖项：

```bash
dotnet restore
dotnet build
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- dotnet run
```

#### 在这个幕后

**\`order-processor 服务**

请注意下面的 `order-processor` 服务指向：

- `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json` 中定义的密钥。

```csharp
// Program.cs
const string DAPR_SECRET_STORE = "localsecretstore";
const string SECRET_NAME = "secret";
var client = new DaprClientBuilder().Build();

var secret = await client.GetSecretAsync(DAPR_SECRET_STORE, SECRET_NAME);
var secretValue = string.Join(", ", secret);
Console.WriteLine($"Fetched Secret: {secretValue}");
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml) 的 `local-secret-store.yaml` 组件文件中定义：

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

在 YAML 文件中：

- `metadata/name`是您的应用程序引用组件的方式（在代码示例中称为`DAPR_SECRET_NAME`）。
- `spec/metadata`定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在位于 [secrets_management/csharp/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk/order-processor/secrets.json) 的 `secrets.json` 文件中定义：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的，`order-processor`服务通过Dapr密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: [secret, YourPasskeyHere]
```



 <!-- Java -->

{{% codetab %}}

### 先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- Java JDK 11（或更高版本）：
  - [Oracle JDK](https://www.oracle.com/java/technologies/downloads)，或者
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，3.x版本。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第1步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在一个终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/java/sdk/order-processor
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- java -jar target/OrderProcessingService-0.0.1-SNAPSHOT.jar
```

#### 在这个幕后

**\`order-processor 服务**

请注意下面的 `order-processor` 服务指向：

- `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json` 中定义的密钥。

```java
// OrderProcessingServiceApplication.java
private static final String SECRET_STORE_NAME = "localsecretstore";
// ...
    Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
    System.out.println("Fetched Secret: " + secret);
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml) 的 `local-secret-store.yaml` 组件文件中定义：

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

在 YAML 文件中：

- `metadata/name`是您的应用程序引用组件的方式（在代码示例中称为`DAPR_SECRET_NAME`）。
- `spec/metadata`定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在位于 [secrets_management/java/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk/order-processor/secrets.json) 的 `secrets.json` 文件中定义：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的，`order-processor`服务通过Dapr密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: {secret=YourPasskeyHere}
```



 <!-- Go -->

{{% codetab %}}

### 先决条件

对于此示例，您将需要：

- [Dapr CLI 和初始化环境](https://docs.dapr.io/getting-started).
- [Go的最新版本](https://go.dev/dl/)。

<!-- IGNORE_LINKS -->

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

<!-- END_IGNORE -->

### 第1步：设置环境

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在一个终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/go/sdk/order-processor
```

安装依赖项：

```bash
go build .
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --resources-path ../../../components/ -- go run .
```

#### 在这个幕后

**\`order-processor 服务**

请注意下面的 `order-processor` 服务指向：

- `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json` 中定义的密钥。

```go
const DAPR_SECRET_STORE = "localsecretstore"
const SECRET_NAME = "secret"
// ...
secret, err := client.GetSecret(ctx, DAPR_SECRET_STORE, SECRET_NAME, nil)
if secret != nil {
    fmt.Println("Fetched Secret: ", secret[SECRET_NAME])
}
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml) 的 `local-secret-store.yaml` 组件文件中定义：

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

在 YAML 文件中：

- `metadata/name`是您的应用程序引用组件的方式（在代码示例中称为`DAPR_SECRET_NAME`）。
- `spec/metadata`定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在位于 [secrets_management/go/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk/order-processor/secrets.json) 的 `secrets.json` 文件中定义：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的，`order-processor`服务通过Dapr密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret:  YourPasskeyHere
```



{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)参与讨论。

## 下一步

- 使用 HTTP 而不是 SDK 的 Dapr Secrets Management。
  - [Python](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/http)
- 了解有关[Secrets Management构建块]({{< ref secrets-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
