---
type: docs
title: "快速入门：Secrets 管理"
linkTitle: "密钥管理"
weight: 76
description: "开始使用 Dapr 的 Secrets Management 构建块"
---

Dapr 提供了一个专用的秘钥 API，允许开发者从秘钥存储中检索秘钥。 在本快速入门中，您将：

1. 使用密钥存储组件运行微服务。
1. 在应用程序代码中使用 Dapr 密钥 API 检索密钥。

<img src="/images/secretsmanagement-quickstart/secrets-mgmt-quickstart.png" width=1000 alt="显示示例服务的secrets管理的图示。">


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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在终端窗口中，导航到 `order-processor` 目录。

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

> **注意：** 由于Python3.exe在Windows中未定义，您可能需要使用 `python app.py` 替代 `python3 app.py`。


#### Behind the scenes

**`order-processor` 服务**

请注意 `order-processor` 以下服务指向：

- 这 `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json`中定义的密钥。

```python
# app.py
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
    secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
    logging.info('Fetched Secret: %s', secret.secret)
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在 `local-secret-store.yaml` 组件文件中定义，位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

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
- `spec/metadata` 定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在 `secrets.json` 文件中定义，位于 [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的， `order-processor` 服务通过 Dapr 密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == INFO:root:Fetched Secret: {'secret': 'YourPasskeyHere'}
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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在终端窗口中，导航到 `order-processor` 目录。

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

#### Behind the scenes

**`order-processor` 服务**

请注意 `order-processor` 以下服务指向：

- 这 `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json`中定义的密钥。

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

`DAPR_SECRET_STORE` 在 `local-secret-store.yaml` 组件文件中定义，位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

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
- `spec/metadata` 定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在 `secrets.json` 文件中定义，位于 [secrets_management/javascript/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的， `order-processor` 服务通过 Dapr 密钥存储检索密钥，并在控制台中显示。

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

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [.NET SDK 或 .NET 6 SDK 已安装](https://dotnet.microsoft.com/download).
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在终端窗口中，导航到 `order-processor` 目录。

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

#### Behind the scenes

**`order-processor` 服务**

请注意 `order-processor` 以下服务指向：

- 这 `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json`中定义的密钥。

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

`DAPR_SECRET_STORE` 在 `local-secret-store.yaml` 组件文件中定义，位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

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

- `元数据/名称` 是应用程序引用组件的方式（在代码示例中称为 `DAPR_SECRET_NAME`）。
- `spec/metadata` 定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在 `secrets.json` 文件中定义，位于 [secrets_management/csharp/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/sdk/order-processor/secrets.json)：

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的， `order-processor` 服务通过 Dapr 密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: [secret, YourPasskeyHere]
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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在终端窗口中，导航到 `order-processor` 目录。

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

#### Behind the scenes

**`order-processor` 服务**

请注意 `order-processor` 以下服务指向：

- 这 `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json`中定义的密钥。

```java
// OrderProcessingServiceApplication.java
private static final String SECRET_STORE_NAME = "localsecretstore";
// ...
    Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
    System.out.println("Fetched Secret: " + secret);
```

**`local-secret-store.yaml` 组件**

`DAPR_SECRET_STORE` 在 `local-secret-store.yaml` 组件文件中定义，位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

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

- `元数据/名称` 是应用程序引用组件的方式（在代码示例中称为 `DAPR_SECRET_NAME`）。
- `spec/metadata` 定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在 `secrets.json` 文件，位于 [secrets_management/java/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的， `order-processor` 服务通过 Dapr 密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret: {secret=YourPasskeyHere}
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

克隆[快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/secrets_management)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第2步：检索密钥

在终端窗口中，导航到 `order-processor` 目录。

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

#### Behind the scenes

**`order-processor` 服务**

请注意 `order-processor` 以下服务指向：

- 这 `DAPR_SECRET_STORE` 定义于 `local-secret-store.yaml` 组件。
- 在 `secrets.json`中定义的密钥。

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

`DAPR_SECRET_STORE` 在 `local-secret-store.yaml` 组件文件中定义，位于 [secrets_management/components](https://github.com/dapr/quickstarts/tree/master/secrets_management/components/local-secret-store.yaml)：

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

- `元数据/名称` 是应用程序引用组件的方式（在代码示例中称为 `DAPR_SECRET_NAME`）。
- `spec/metadata` 定义了组件使用的密钥的连接。

**`secrets.json` 文件**

`SECRET_NAME` 在 `secrets.json` 文件，位于 [secrets_management/go/sdk/order-processor](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

如上面的应用程序代码中所指定的， `order-processor` 服务通过 Dapr 密钥存储检索密钥，并在控制台中显示。

Order-processor输出：

```
== APP == Fetched Secret:  YourPasskeyHere
```

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

- 使用 HTTP 而不是 SDK 的 Dapr Secrets Management。
  - [Python](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/http)
- 了解有关 [Secrets Management 构建块]({{< ref secrets-overview >}})的更多信息

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
