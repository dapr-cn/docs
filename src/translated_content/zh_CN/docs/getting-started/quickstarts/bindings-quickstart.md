---
type: docs
title: "快速入门：输入和输出绑定"
linkTitle: "绑定"
weight: 75
description: "开始使用 Dapr 的绑定构建块"
---

我们来了解一下 Dapr 的[绑定构建块]({{< ref bindings >}})。通过使用绑定，您可以：

- 让您的应用程序响应来自外部系统的事件。
- 与外部系统进行交互。

在本快速入门中，您将使用输入 [Cron]({{< ref cron.md >}}) 绑定每 10 秒调度一次批处理脚本。该脚本处理一个 JSON 文件，并使用 [PostgreSQL]({{< ref postgresql.md >}}) Dapr 绑定将数据输出到 SQL 数据库。

<img src="/images/bindings-quickstart/bindings-quickstart.png" width=800 style="padding-bottom:15px;">

在继续快速入门之前，请选择您偏好的 Dapr SDK 语言版本。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings/python/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：本地运行 PostgreSQL Docker 容器

在您的机器上通过 Docker 容器本地运行 [PostgreSQL 实例](https://www.postgresql.org/)。快速入门示例中包含一个 Docker Compose 文件，用于本地自定义、构建、运行和初始化带有默认 `orders` 表的 `postgres` 容器。

在终端窗口中，从快速入门克隆目录的根目录导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 步骤 3：调度 Cron 作业并写入数据库

在新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/python/sdk/batch
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr 边车一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 50051 --resources-path ../../../components -- python3 app.py
```

> **注意**：在 Windows 中，由于未定义 Python3.exe，您可能需要使用 `python app.py` 而不是 `python3 app.py`。

`process_batch` 函数中的代码每 10 秒执行一次（在 `components` 目录中的 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 中定义）。绑定触发器通过 Dapr 边车在您的应用程序中查找通过 HTTP POST 调用的路由。

```python
# 由 Dapr 输入绑定触发
@app.route('/' + cron_binding_name, methods=['POST'])
def process_batch():
```

`batch-sdk` 服务使用在 [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) 组件中定义的 PostgreSQL 输出绑定将 `OrderId`、`Customer` 和 `Price` 记录插入到 `orders` 表中。

```python
with DaprClient() as d:
    sqlCmd = ('insert into orders (orderid, customer, price) values ' +
              '(%s, \'%s\', %s)' % (order_line['orderid'],
                                    order_line['customer'],
                                    order_line['price']))
    payload = {'sql': sqlCmd}

    print(sqlCmd, flush=True)

    try:
        # 使用 Dapr 输出绑定通过 HTTP Post 插入订单
        resp = d.invoke_binding(binding_name=sql_binding, operation='exec',
                                binding_metadata=payload, data='')
        return resp
    except Exception as e:
        print(e, flush=True)
        raise SystemExit(e)
```

### 步骤 4：查看作业的输出

请注意，如上所述，代码使用 `OrderId`、`Customer` 和 `Price` 作为负载调用输出绑定。

您的输出绑定的 `print` 语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56)
== APP == Finished processing batch
```

在新的终端中，验证相同的数据已插入到数据库中。导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以启动交互式 *psql* CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在 `admin=#` 提示符下，切换到 `orders` 表：

```bash
\c orders;
```

在 `orders=#` 提示符下，选择所有行：

```bash
select * from orders;
```

输出应如下所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 Cron [绑定构建块]({{< ref bindings >}})
- 每 10 秒调用绑定端点（`batch`）

为此快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # 有效的 cron 调度
  - name: direction
    value: "input" # cron 绑定的方向
```

**注意：** `binding-cron.yaml` 的 `metadata` 部分包含一个 [Cron 表达式]({{< ref cron.md >}})，指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用 `binding-postgresql.yaml` 文件中指定的设置连接到 PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松地更换后端数据库[绑定]({{< ref supported-bindings.md >}})，而无需进行代码更改。

为此快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # 必需
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # postgresql 绑定的方向
```

在 YAML 文件中：

- `spec/type` 指定 PostgreSQL 用于此绑定。
- `spec/metadata` 定义组件使用的 PostgreSQL 实例的连接。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：本地运行 PostgreSQL Docker 容器

在您的机器上通过 Docker 容器本地运行 [PostgreSQL 实例](https://www.postgresql.org/)。快速入门示例中包含一个 Docker Compose 文件，用于本地自定义、构建、运行和初始化带有默认 `orders` 表的 `postgres` 容器。

在终端窗口中，从快速入门克隆目录的根目录导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 步骤 3：调度 Cron 作业并写入数据库

在新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/javascript/sdk/batch
```

安装依赖项：

```bash
npm install
```

与 Dapr 边车一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 5002 --dapr-http-port 3500 --resources-path ../../../components -- node index.js 
```

`process_batch` 函数中的代码每 10 秒执行一次（在 `components` 目录中的 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 中定义）。绑定触发器通过 Dapr 边车在您的应用程序中查找通过 HTTP POST 调用的路由。

```javascript
async function start() {
    await server.binding.receive(cronBindingName,processBatch);
    await server.start();
}
```

`batch-sdk` 服务使用在 [`binding-postgresql.yaml`]({{< ref "##componentsbinding-postgresyaml-component-file" >}}) 组件中定义的 PostgreSQL 输出绑定将 `OrderId`、`Customer` 和 `Price` 记录插入到 `orders` 表中。

```javascript
async function processBatch(){
    const loc = '../../orders.json';
    fs.readFile(loc, 'utf8', (err, data) => {
        const orders = JSON.parse(data).orders;
        orders.forEach(order => {
            let sqlCmd = `insert into orders (orderid, customer, price) values (${order.orderid}, '${order.customer}', ${order.price});`;
            let payload = `{  "sql": "${sqlCmd}" } `;
            console.log(payload);
            client.binding.send(postgresBindingName, "exec", "", JSON.parse(payload));
        });
        console.log('Finished processing batch');
      });
    return 0;
}
```

### 步骤 4：查看作业的输出

请注意，如上所述，代码使用 `OrderId`、`Customer` 和 `Price` 作为负载调用输出绑定。

您的输出绑定的 `print` 语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

在新的终端中，验证相同的数据已插入到数据库中。导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在 `admin=#` 提示符下，切换到 `orders` 表：

```bash
\c orders;
```

在 `orders=#` 提示符下，选择所有行：

```bash
select * from orders;
```

输出应如下所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 Cron [绑定构建块]({{< ref bindings >}})
- 每 10 秒调用绑定端点（`batch`）

为此快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # 有效的 cron 调度
  - name: direction
    value: "input" # cron 绑定的方向
```

**注意：** `binding-cron.yaml` 的 `metadata` 部分包含一个 [Cron 表达式]({{< ref cron.md >}})，指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用 `binding-postgresql.yaml` 文件中指定的设置连接到 PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松地更换后端数据库[绑定]({{< ref supported-bindings.md >}})，而无需进行代码更改。

为此快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # 必需
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # postgresql 绑定的方向
```

在 YAML 文件中：

- `spec/type` 指定 PostgreSQL 用于此绑定。
- `spec/metadata` 定义组件使用的 PostgreSQL 实例的连接。

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

**注意：** .NET 6 是此版本中 Dapr .NET SDK 包的最低支持版本。仅 .NET 8 和 .NET 9 将在 Dapr v1.16 及更高版本中得到支持。

### 步骤 1：设置环境

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：本地运行 PostgreSQL Docker 容器

在您的机器上通过 Docker 容器本地运行 [PostgreSQL 实例](https://www.postgresql.org/)。快速入门示例中包含一个 Docker Compose 文件，用于本地自定义、构建、运行和初始化带有默认 `orders` 表的 `postgres` 容器。

在终端窗口中，从快速入门克隆目录的根目录导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 步骤 3：调度 Cron 作业并写入数据库

在新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/csharp/sdk/batch
```

安装依赖项：

```bash
dotnet restore
dotnet build batch.csproj
```

与 Dapr 边车一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 7002 --resources-path ../../../components -- dotnet run
```

`process_batch` 函数中的代码每 10 秒执行一次（在 `components` 目录中的 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 中定义）。绑定触发器通过 Dapr 边车在您的应用程序中查找通过 HTTP POST 调用的路由。

```csharp
app.MapPost("/" + cronBindingName, async () => {
// ...
});
```

`batch-sdk` 服务使用在 [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) 组件中定义的 PostgreSQL 输出绑定将 `OrderId`、`Customer` 和 `Price` 记录插入到 `orders` 表中。

```csharp
// ...
string jsonFile = File.ReadAllText("../../../orders.json");
var ordersArray = JsonSerializer.Deserialize<Orders>(jsonFile);
using var client = new DaprClientBuilder().Build();
foreach(Order ord in ordersArray?.orders ?? new Order[] {}){
    var sqlText = $"insert into orders (orderid, customer, price) values ({ord.OrderId}, '{ord.Customer}', {ord.Price});";
    var command = new Dictionary<string,string>(){
        {"sql",
        sqlText}
    };
// ...
}

// 使用 Dapr 输出绑定通过 Dapr Client SDK 插入订单
await client.InvokeBindingAsync(bindingName: sqlBindingName, operation: "exec", data: "", metadata: command);
```

### 步骤 4：查看作业的输出

请注意，如上所述，代码使用 `OrderId`、`Customer` 和 `Price` 作为负载调用输出绑定。

您的输出绑定的 `print` 语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == Finished processing batch
```

在新的终端中，验证相同的数据已插入到数据库中。导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在 `admin=#` 提示符下，切换到 `orders` 表：

```bash
\c orders;
```

在 `orders=#` 提示符下，选择所有行：

```bash
select * from orders;
```

输出应如下所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 Cron [绑定构建块]({{< ref bindings >}})
- 每 10 秒调用绑定端点（`batch`）

为此快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # 有效的 cron 调度
  - name: direction
    value: "input" # cron 绑定的方向
```

**注意：** `binding-cron.yaml` 的 `metadata` 部分包含一个 [Cron 表达式]({{< ref cron.md >}})，指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用 `binding-postgresql.yaml` 文件中指定的设置连接到 PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松地更换后端数据库[绑定]({{< ref supported-bindings.md >}})，而无需进行代码更改。

为此快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # 必需
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # postgresql 绑定的方向
```

在 YAML 文件中：

- `spec/type` 指定 PostgreSQL 用于此绑定。
- `spec/metadata` 定义组件使用的 PostgreSQL 实例的连接。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings/java/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：本地运行 PostgreSQL Docker 容器

在您的机器上通过 Docker 容器本地运行 [PostgreSQL 实例](https://www.postgresql.org/)。快速入门示例中包含一个 Docker Compose 文件，用于本地自定义、构建、运行和初始化带有默认 `orders` 表的 `postgres` 容器。

在终端窗口中，从快速入门克隆目录的根目录导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 步骤 3：调度 Cron 作业并写入数据库

在新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/java/sdk/batch
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr 边车一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 8080 --resources-path ../../../components -- java -jar target/BatchProcessingService-0.0.1-SNAPSHOT.jar
```

`process_batch` 函数中的代码每 10 秒执行一次（在 `components` 目录中的 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 中定义）。绑定触发器通过 Dapr 边车在您的应用程序中查找通过 HTTP POST 调用的路由。

```java
@PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
public ResponseEntity<String> processBatch() throws IOException, Exception
```

`batch-sdk` 服务使用在 [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) 组件中定义的 PostgreSQL 输出绑定将 `OrderId`、`Customer` 和 `Price` 记录插入到 `orders` 表中。

```java
try (DaprClient client = new DaprClientBuilder().build()) {

    for (Order order : ordList.orders) {
        String sqlText = String.format(
            "insert into orders (orderid, customer, price) " +
            "values (%s, '%s', %s);", 
            order.orderid, order.customer, order.price);
        logger.info(sqlText);
    
        Map<String, String> metadata = new HashMap<String, String>();
        metadata.put("sql", sqlText);
 
        // 使用 Dapr SDK 调用 sql 输出绑定
        client.invokeBinding(sqlBindingName, "exec", null, metadata).block();
    } 

    logger.info("Finished processing batch");

    return ResponseEntity.ok("Finished processing batch");
}
```

### 步骤 4：查看作业的输出

请注意，如上所述，代码使用 `OrderId`、`Customer` 和 `Price` 作为负载调用输出绑定。

您的输出绑定的 `print` 语句输出：

```
== APP == 2022-06-22 16:39:17.012  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Processing batch..
== APP == 2022-06-22 16:39:17.268  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == 2022-06-22 16:39:17.838  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == 2022-06-22 16:39:17.844  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == 2022-06-22 16:39:17.848  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Finished processing batch
```

在新的终端中，验证相同的数据已插入到数据库中。导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在 `admin=#` 提示符下，切换到 `orders` 表：

```bash
\c orders;
```

在 `orders=#` 提示符下，选择所有行：

```bash
select * from orders;
```

输出应如下所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 Cron [绑定构建块]({{< ref bindings >}})
- 每 10 秒调用绑定端点（`batch`）

为此快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # 有效的 cron 调度
  - name: direction
    value: "input" # cron 绑定的方向
```

**注意：** `binding-cron.yaml` 的 `metadata` 部分包含一个 [Cron 表达式]({{< ref cron.md >}})，指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用 `binding-postgresql.yaml` 文件中指定的设置连接到 PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松地更换后端数据库[绑定]({{< ref supported-bindings.md >}})，而无需进行代码更改。

为此快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # 必需
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # postgresql 绑定的方向
```

在 YAML 文件中：

- `spec/type` 指定 PostgreSQL 用于此绑定。
- `spec/metadata` 定义组件使用的 PostgreSQL 实例的连接。

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

克隆[快速入门仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings/go/sdk)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 步骤 2：本地运行 PostgreSQL Docker 容器

在您的机器上通过 Docker 容器本地运行 [PostgreSQL 实例](https://www.postgresql.org/)。快速入门示例中包含一个 Docker Compose 文件，用于本地自定义、构建、运行和初始化带有默认 `orders` 表的 `postgres` 容器。

在终端窗口中，从快速入门克隆目录的根目录导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 步骤 3：调度 Cron 作业并写入数据库

在新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/go/sdk/batch
```

安装依赖项：

```bash
go build .
```

与 Dapr 边车一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 6002 --dapr-http-port 3502 --dapr-grpc-port 60002 --resources-path ../../../components -- go run .
```

`process_batch` 函数中的代码每 10 秒执行一次（在 `components` 目录中的 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 中定义）。绑定触发器通过 Dapr 边车在您的应用程序中查找通过 HTTP POST 调用的路由。

```go
// 由 Dapr 输入绑定触发
r.HandleFunc("/"+cronBindingName, processBatch).Methods("POST")
```

`batch-sdk` 服务使用在 [`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}}) 组件中定义的 PostgreSQL 输出绑定将 `OrderId`、`Customer` 和 `Price` 记录插入到 `orders` 表中。

```go
func sqlOutput(order Order) (err error) {

	client, err := dapr.NewClient()
	if err != nil {
		return err
	}

	ctx := context.Background()

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))
	fmt.Println(sqlCmd)

	// 使用 Dapr 输出绑定通过 Dapr SDK 插入订单
	in := &dapr.InvokeBindingRequest{
		Name:      sqlBindingName,
		Operation: "exec",
		Data:      []byte(""),
		Metadata:  map[string]string{"sql": sqlCmd},
	}
	err = client.InvokeOutputBinding(ctx, in)
	if err != nil {
		return err
	}

	return nil
}
```

### 步骤 4：查看作业的输出

请注意，如上所述，代码使用 `OrderId`、`Customer` 和 `Price` 作为负载调用输出绑定。

您的输出绑定的 `print` 语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

在新的终端中，验证相同的数据已插入到数据库中。导航到 `bindings/db` 目录。

```bash
cd bindings/db
```

运行以下命令以启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在 `admin=#` 提示符下，切换到 `orders` 表：

```bash
\c orders;
```

在 `orders=#` 提示符下，选择所有行：

```bash
select * from orders;
```

输出应如下所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 Cron [绑定构建块]({{< ref bindings >}})
- 每 10 秒调用绑定端点（`batch`）

为此快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: cron
  namespace: quickstarts
spec:
  type: bindings.cron
  version: v1
  metadata:
  - name: schedule
    value: "@every 10s" # 有效的 cron 调度
  - name: direction
    value: "input" # cron 绑定的方向
```

**注意：** `binding-cron.yaml` 的 `metadata` 部分包含一个 [Cron 表达式]({{< ref cron.md >}})，指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行 `dapr run` 命令并指定组件路径时，Dapr 边车：

- 启动 PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用 `binding-postgresql.yaml` 文件中指定的设置连接到 PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松地更换后端数据库[绑定]({{< ref supported-bindings.md >}})，而无需进行代码更改。

为此快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: sqldb
  namespace: quickstarts
spec:
  type: bindings.postgresql
  version: v1
  metadata:
  - name: url # 必需
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # postgresql 绑定的方向
```

在 YAML 文件中：

- `spec/type` 指定 PostgreSQL 用于此绑定。
- `spec/metadata` 定义组件使用的 PostgreSQL 实例的连接。

{{% /codetab %}}

{{< /tabs >}}

## 告诉我们您的想法！

我们正在不断努力改进我们的快速入门示例，并重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)进行讨论。

## 下一步

- 使用 HTTP 而不是 SDK 使用 Dapr 绑定。
  - [Python](https://github.com/dapr/quickstarts/tree/master/bindings/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/bindings/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/bindings/go/http)
- 了解更多关于[绑定构建块]({{< ref bindings >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}