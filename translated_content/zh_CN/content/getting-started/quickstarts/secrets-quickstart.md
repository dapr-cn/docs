---
type: docs
title: "Quickstart: Secrets Management"
linkTitle: "密钥管理"
weight: 75
description: "Get started with Dapr's Secrets Management building block"
---

Dapr provides a dedicated secrets API that allows developers to retrieve secrets from a secrets store. In this quickstart, you:

1. Run a microservice with a secret store component.
1. Retrieve secrets using the Dapr secrets API in the application code.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

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
dapr run --app-id order-processor --components-path ../../../components/ -- python3 app.py
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```python
# app.py
DAPR_SECRET_STORE = 'localsecretstore'
SECRET_NAME = 'secret'
with DaprClient() as client:
        secret = client.get_secret(store_name=DAPR_SECRET_STORE, key=SECRET_NAME)
        logging.info('Fetched Secret: %s', secret.secret)
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/blob/master/secrets_management/components/local-secret-store.yaml):

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

- `metadata/name` is how your application references the component (called `DAPR_SECRET_STORE` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/blob/master/secrets_management/python/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

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
dapr run --app-id order-processor --components-path ../../../components/ -- npm start
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

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

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/blob/master/secrets_management/components/local-secret-store.yaml):

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

- `metadata/name` is how your application references the component (called `DAPR_SECRET_STORE` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/javascript/sdk/order-processor](https://github.com/dapr/quickstarts/blob/master/secrets_management/javascript/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

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
dapr run --app-id order-processor --components-path ../../../components/ -- dotnet run
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```csharp
// Program.cs
const string DAPR_SECRET_STORE = "localsecretstore";
const string SECRET_NAME = "secret";
var client = new DaprClientBuilder().Build();

var secret = await client.GetSecretAsync(DAPR_SECRET_STORE, SECRET_NAME);
var secretValue = string.Join(", ", secret);
Console.WriteLine($"Fetched Secret: {secretValue}");
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/blob/master/secrets_management/components/local-secret-store.yaml):

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

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/csharp/sdk/order-processor](https://github.com/dapr/quickstarts/blob/master/secrets_management/csharp/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

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
  - [Oracle JDK](https://www.oracle.com/technetwork/java/javase/downloads/index.html#JDK11)，或
  - OpenJDK
- [Apache Maven](https://maven.apache.org/install.html)，版本 3.x。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->

### 第1步：设置环境

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

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
dapr run --app-id order-processor --components-path ../../../components/ -- java -jar target/order-processor-0.0.1-SNAPSHOT.jar
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```java
// OrderProcessingServiceApplication.java
private static final String SECRET_STORE_NAME = "localsecretstore";
// ...
    Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, "secret").block();
    System.out.println("Fetched Secret: " + secret);
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/blob/master/secrets_management/components/local-secret-store.yaml):

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

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/blob/master/secrets_management/java/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

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

Clone the [sample provided in the Quickstarts repo](https://github.com/dapr/quickstarts/tree/master/secrets_management).

```bash
git clone https://github.com/dapr/quickstarts.git
```

### Step 2: Retrieve the secret

在终端窗口中，导航到 `order-processor` 目录。

```bash
cd secrets_management/go/sdk/order-processor
```

安装依赖项：

```bash
go build app.go
```

与 Dapr sidecar 一起运行 `order-processor` 服务。

```bash
dapr run --app-id order-processor --components-path ../../../components/ -- go run app.go
```

#### Behind the scenes

**`order-processor` service**

Notice how the `order-processor` service below points to:

- The `DAPR_SECRET_STORE` defined in the `local-secret-store.yaml` component.
- The secret defined in `secrets.json`.

```go
const DAPR_SECRET_STORE = "localsecretstore"
    const SECRET_NAME = "secret"
  // ...
    secret, err := client.GetSecret(ctx, DAPR_SECRET_STORE, SECRET_NAME, nil)
    if secret != nil {
        fmt.Println("Fetched Secret: ", secret[SECRET_NAME])
    }
```

**`local-secret-store.yaml` component**

`DAPR_SECRET_STORE` is defined in the `local-secret-store.yaml` component file, located in [secrets_management/components](https://github.com/dapr/quickstarts/blob/master/secrets_management/components/local-secret-store.yaml):

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

- `metadata/name` is how your application references the component (called `DAPR_SECRET_NAME` in the code sample).
- `spec/metadata` defines the connection to the secret used by the component.

**`secrets.json` file**

`SECRET_NAME` is defined in the `secrets.json` file, located in [secrets_management/python/sdk/order-processor](https://github.com/dapr/quickstarts/blob/master/secrets_management/java/sdk/order-processor/secrets.json):

```json
{
    "secret": "YourPasskeyHere"
}
```

### 第3步：查看order-processor输出

As specified in the application code above, the `order-processor` service retrieves the secret via the Dapr secret store and displays it in the console.

Order-processor输出：

```
== APP == Fetched Secret:  YourPasskeyHere
```

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.gg/22ZtJrNe)中的讨论。

## 下一步

- Use Dapr Secrets Management with HTTP instead of an SDK.
  - [Python](https://github.com/dapr/quickstarts/tree/master/secrets_management/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/secrets_management/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/secrets_management/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/secrets_management/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/secrets_management/go/http)
- Learn more about the [Secrets Management building block]({{< ref secrets-overview >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
