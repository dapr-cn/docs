---
type: docs
title: 快速入门：输入 & 输出绑定
linkTitle: 绑定
weight: 74
description: 开始使用 Dapr 的绑定构建块
---

让我们来看看Dapr的[Bindings构建块]({{< ref bindings >}})。 使用绑定，你可以：

- 使用来自外部系统的事件触发你的应用；
- 与外部系统进行接口交互。

在本快速入门中，你将使用输入计划每 10 秒运行一次批处理脚本 [Cron]({{< ref cron.md >}}) 捆绑。 该脚本处理 JSON 文件，并使用 [PostgreSQL]({{< ref postgresql.md >}}) Dapr 绑定输出数据到 SQL 数据库。

<img src="/images/bindings-quickstart/bindings-quickstart.png" width=800 style="padding-bottom:15px;">

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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第 2 步：在本地运行 PostgreSQL Docker 容器

在您的机器上，通过在 Docker 容器中本地运行[PostgreSQL 实例](https://www.postgresql.org/)。 快速入门示例包括一个 Docker Compose 文件，用于在本地自定义、生成、运行和初始化 `postgres` 容器具有默认值的 `orders` 表。

在终端窗口中，从Quickstarts克隆目录的根目录导航到`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否正在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 第 3 步：预定一个 Cron 任务并写入数据库

在一个新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/python/sdk/batch
```

安装依赖项：

```bash
pip3 install -r requirements.txt
```

与 Dapr sidecar 一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 50051 --resources-path ../../../components -- python3 app.py
```

> **注意**：由于Python3.exe在Windows中未定义，您可能需要使用`python app.py`而不是`python3 app.py`。

`process_batch` 函数内的代码每 10 秒执行一次（定义在 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 文件中的 `components` 目录）。 绑定触发器通过 Dapr sidecar 在您的应用程序中寻找 HTTP POST 的路由。

```python
# Triggered by Dapr input binding
@app.route('/' + cron_binding_name, methods=['POST'])
def process_batch():
```

`batch-sdk`服务使用在[`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}})组件中定义的PostgreSQL输出绑定，将`OrderId`、`Customer`和`Price`记录插入`orders`表中。

```python
with DaprClient() as d:
    sqlCmd = ('insert into orders (orderid, customer, price) values ' +
              '(%s, \'%s\', %s)' % (order_line['orderid'],
                                    order_line['customer'],
                                    order_line['price']))
    payload = {'sql': sqlCmd}

    print(sqlCmd, flush=True)

    try:
        # Insert order using Dapr output binding via HTTP Post
        resp = d.invoke_binding(binding_name=sql_binding, operation='exec',
                                binding_metadata=payload, data='')
        return resp
    except Exception as e:
        print(e, flush=True)
        raise SystemExit(e)
```

### 第 4 步：查看任务输出

请注意，如上所述，代码将使用 `OrderId`、`Customer` 和 `Price` 作为有效载荷来调用输出绑定。

您的输出绑定的`print`语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56)
== APP == Finished processing batch
```

在一个新的终端中，验证相同的数据是否已插入到数据库中。 进入`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令启动交互式 _psql_ CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在`admin=#`提示符下，切换到`orders`表：

```bash
\c orders;
```

在 `orders=#` 提示下，选择所有行：

```bash
select * from orders;
```

输出显示应该如下方所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动Cron [Bindings构建块]({{< ref bindings >}})
- 每10秒调用绑定端点（`batch`）

本快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

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
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**注意：**`binding-cron.yaml`的`metadata`部分包含一个[Cron表达式]({{< ref cron.md >}})，用于指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用在`binding-postgresql.yaml`文件中指定的设置连接到PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松更换后端数据库 [binding]({{< ref supported-bindings.md >}}) 而无需更改代码。

本快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

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
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

在 YAML 文件中：

- `spec/type`指定了此绑定所使用的PostgreSQL。
- `spec/metadata`定义了组件使用的PostgreSQL实例的连接。



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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第 2 步：在本地运行 PostgreSQL Docker 容器

在您的机器上，通过在 Docker 容器中本地运行[PostgreSQL 实例](https://www.postgresql.org/)。 快速入门示例包括一个 Docker Compose 文件，用于在本地自定义、生成、运行和初始化 `postgres` 容器具有默认值的 `orders` 表。

在终端窗口中，从Quickstarts克隆目录的根目录导航到`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否正在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 第 3 步：预定一个 Cron 任务并写入数据库

在一个新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/javascript/sdk/batch
```

安装依赖项：

```bash
npm install
```

与 Dapr sidecar 一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 5002 --dapr-http-port 3500 --resources-path ../../../components -- node index.js 
```

`process_batch` 函数内的代码每 10 秒执行一次（定义在 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 文件中的 `components` 目录）。 绑定触发器通过 Dapr sidecar 在您的应用程序中寻找 HTTP POST 的路由。

```javascript
async function start() {
    await server.binding.receive(cronBindingName,processBatch);
    await server.start();
}
```

`batch-sdk`服务使用在[`binding-postgresql.yaml`]({{< ref "##componentsbinding-postgresyaml-component-file" >}})组件中定义的PostgreSQL输出绑定，将`OrderId`、`Customer`和`Price`记录插入`orders`表。

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

### 第 4 步：查看任务输出

请注意，如上所述，代码将使用 `OrderId`、`Customer` 和 `Price` 作为有效载荷来调用输出绑定。

您的输出绑定的`print`语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

在一个新的终端中，验证相同的数据是否已插入到数据库中。 进入`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在`admin=#`提示符下，切换到`orders`表：

```bash
\c orders;
```

在 `orders=#` 提示下，选择所有行：

```bash
select * from orders;
```

输出显示应该如下方所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动Cron [Bindings构建块]({{< ref bindings >}})
- 每10秒调用绑定端点（`batch`）

本快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

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
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**注意：**`binding-cron.yaml`的`metadata`部分包含一个[Cron表达式]({{< ref cron.md >}})，用于指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用在`binding-postgresql.yaml`文件中指定的设置连接到PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松更换后端数据库 [binding]({{< ref supported-bindings.md >}}) 而无需更改代码。

本快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

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
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

在 YAML 文件中：

- `spec/type`指定了此绑定所使用的PostgreSQL。
- `spec/metadata`定义了组件使用的PostgreSQL实例的连接。



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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第 2 步：在本地运行 PostgreSQL Docker 容器

在您的机器上，通过在 Docker 容器中本地运行[PostgreSQL 实例](https://www.postgresql.org/)。 快速入门示例包括一个 Docker Compose 文件，用于在本地自定义、生成、运行和初始化 `postgres` 容器具有默认值的 `orders` 表。

在终端窗口中，从Quickstarts克隆目录的根目录导航到`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否正在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 第 3 步：预定一个 Cron 任务并写入数据库

在一个新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/csharp/sdk/batch
```

安装依赖项：

```bash
dotnet restore
dotnet build batch.csproj
```

与 Dapr sidecar 一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 7002 --resources-path ../../../components -- dotnet run
```

`process_batch` 函数内的代码每 10 秒执行一次（定义在 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 文件中的 `components` 目录）。 绑定触发器通过 Dapr sidecar 在您的应用程序中寻找 HTTP POST 的路由。

```csharp
app.MapPost("/" + cronBindingName, async () => {
// ...
});
```

`batch-sdk`服务使用在[`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}})组件中定义的PostgreSQL输出绑定，将`OrderId`、`Customer`和`Price`记录插入`orders`表中。

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

// Insert order using Dapr output binding via Dapr Client SDK
await client.InvokeBindingAsync(bindingName: sqlBindingName, operation: "exec", data: "", metadata: command);
```

### 第 4 步：查看任务输出

请注意，如上所述，代码将使用 `OrderId`、`Customer` 和 `Price` 作为有效载荷来调用输出绑定。

您的输出绑定的`print`语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == Finished processing batch
```

在一个新的终端中，验证相同的数据是否已插入到数据库中。 进入`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在`admin=#`提示符下，切换到`orders`表：

```bash
\c orders;
```

在 `orders=#` 提示下，选择所有行：

```bash
select * from orders;
```

输出显示应该如下方所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动Cron [Bindings构建块]({{< ref bindings >}})
- 每10秒调用绑定端点（`batch`）

本快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

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
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**注意：**`binding-cron.yaml`的`metadata`部分包含一个[Cron表达式]({{< ref cron.md >}})，用于指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用在`binding-postgresql.yaml`文件中指定的设置连接到PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松更换后端数据库 [binding]({{< ref supported-bindings.md >}}) 而无需更改代码。

本快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

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
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

在 YAML 文件中：

- `spec/type`指定了此绑定所使用的PostgreSQL。
- `spec/metadata`定义了组件使用的PostgreSQL实例的连接。



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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第 2 步：在本地运行 PostgreSQL Docker 容器

在您的机器上，通过在 Docker 容器中本地运行[PostgreSQL 实例](https://www.postgresql.org/)。 快速入门示例包括一个 Docker Compose 文件，用于在本地自定义、生成、运行和初始化 `postgres` 容器具有默认值的 `orders` 表。

在终端窗口中，从Quickstarts克隆目录的根目录导航到`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否正在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 第 3 步：预定一个 Cron 任务并写入数据库

在一个新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/java/sdk/batch
```

安装依赖项：

```bash
mvn clean install
```

与 Dapr sidecar 一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 8080 --resources-path ../../../components -- java -jar target/BatchProcessingService-0.0.1-SNAPSHOT.jar
```

`process_batch` 函数内的代码每 10 秒执行一次（定义在 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 文件中的 `components` 目录）。 绑定触发器通过 Dapr sidecar 在您的应用程序中寻找 HTTP POST 的路由。

```java
@PostMapping(path = cronBindingPath, consumes = MediaType.ALL_VALUE)
public ResponseEntity<String> processBatch() throws IOException, Exception
```

`batch-sdk`服务使用在[`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}})组件中定义的PostgreSQL输出绑定，将`OrderId`、`Customer`和`Price`记录插入`orders`表中。

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
 
        // Invoke sql output binding using Dapr SDK
        client.invokeBinding(sqlBindingName, "exec", null, metadata).block();
    } 

    logger.info("Finished processing batch");

    return ResponseEntity.ok("Finished processing batch");
}
```

### 第 4 步：查看任务输出

请注意，如上所述，代码将使用 `OrderId`、`Customer` 和 `Price` 作为有效载荷来调用输出绑定。

您的输出绑定的`print`语句输出：

```
== APP == 2022-06-22 16:39:17.012  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Processing batch..
== APP == 2022-06-22 16:39:17.268  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (1, 'John Smith', 100.32);
== APP == 2022-06-22 16:39:17.838  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (2, 'Jane Bond', 15.4);
== APP == 2022-06-22 16:39:17.844  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : insert into orders (orderid, customer, price) values (3, 'Tony James', 35.56);
== APP == 2022-06-22 16:39:17.848  INFO 35772 --- [nio-8080-exec-4] c.s.c.BatchProcessingServiceController   : Finished processing batch
```

在一个新的终端中，验证相同的数据是否已插入到数据库中。 进入`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在`admin=#`提示符下，切换到`orders`表：

```bash
\c orders;
```

在 `orders=#` 提示下，选择所有行：

```bash
select * from orders;
```

输出显示应该如下方所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动Cron [Bindings构建块]({{< ref bindings >}})
- 每10秒调用绑定端点（`batch`）

本快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

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
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**注意：**`binding-cron.yaml`的`metadata`部分包含一个[Cron表达式]({{< ref cron.md >}})，用于指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用在`binding-postgresql.yaml`文件中指定的设置连接到PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松更换后端数据库 [binding]({{< ref supported-bindings.md >}}) 而无需更改代码。

本快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

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
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

在 YAML 文件中：

- `spec/type`指定了此绑定所使用的PostgreSQL。
- `spec/metadata`定义了组件使用的PostgreSQL实例的连接。



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

克隆[在Quickstarts存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/bindings)。

```bash
git clone https://github.com/dapr/quickstarts.git
```

### 第 2 步：在本地运行 PostgreSQL Docker 容器

在您的机器上，通过在 Docker 容器中本地运行[PostgreSQL 实例](https://www.postgresql.org/)。 快速入门示例包括一个 Docker Compose 文件，用于在本地自定义、生成、运行和初始化 `postgres` 容器具有默认值的 `orders` 表。

在终端窗口中，从Quickstarts克隆目录的根目录导航到`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令以设置容器：

```bash
docker compose up
```

验证容器是否正在本地运行。

```bash
docker ps
```

输出应包括：

```bash
CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS         PORTS                    NAMES
55305d1d378b   postgres   "docker-entrypoint.s…"   3 seconds ago   Up 2 seconds   0.0.0.0:5432->5432/tcp   sql_db
```

### 第 3 步：预定一个 Cron 任务并写入数据库

在一个新的终端窗口中，导航到 SDK 目录。

```bash
cd bindings/go/sdk/batch
```

安装依赖项：

```bash
go build .
```

与 Dapr sidecar 一起运行 `batch-sdk` 服务。

```bash
dapr run --app-id batch-sdk --app-port 6002 --dapr-http-port 3502 --dapr-grpc-port 60002 --resources-path ../../../components -- go run .
```

`process_batch` 函数内的代码每 10 秒执行一次（定义在 [`binding-cron.yaml`]({{< ref "#componentsbinding-cronyaml-component-file" >}}) 文件中的 `components` 目录）。 绑定触发器通过 Dapr sidecar 在您的应用程序中寻找 HTTP POST 的路由。

```go
// Triggered by Dapr input binding
r.HandleFunc("/"+cronBindingName, processBatch).Methods("POST")
```

`batch-sdk`服务使用在[`binding-postgresql.yaml`]({{< ref "#componentbinding-postgresyaml-component-file" >}})组件中定义的PostgreSQL输出绑定，将`OrderId`、`Customer`和`Price`记录插入`orders`表中。

```go
func sqlOutput(order Order) (err error) {

	client, err := dapr.NewClient()
	if err != nil {
		return err
	}

	ctx := context.Background()

	sqlCmd := fmt.Sprintf("insert into orders (orderid, customer, price) values (%d, '%s', %s);", order.OrderId, order.Customer, strconv.FormatFloat(order.Price, 'f', 2, 64))
	fmt.Println(sqlCmd)

	// Insert order using Dapr output binding via Dapr SDK
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

### 第 4 步：查看任务输出

请注意，如上所述，代码将使用 `OrderId`、`Customer` 和 `Price` 作为有效载荷来调用输出绑定。

您的输出绑定的`print`语句输出：

```
== APP == Processing batch..
== APP == insert into orders (orderid, customer, price) values(1, 'John Smith', 100.32)
== APP == insert into orders (orderid, customer, price) values(2, 'Jane Bond', 15.4)
== APP == insert into orders (orderid, customer, price) values(3, 'Tony James', 35.56)
```

在一个新的终端中，验证相同的数据是否已插入到数据库中。 进入`bindings/db`目录。

```bash
cd bindings/db
```

运行以下命令启动交互式 Postgres CLI：

```bash
docker exec -i -t postgres psql --username postgres  -p 5432 -h localhost --no-password
```

在`admin=#`提示符下，切换到`orders`表：

```bash
\c orders;
```

在 `orders=#` 提示下，选择所有行：

```bash
select * from orders;
```

输出显示应该如下方所示：

```
 orderid |  customer  | price
---------+------------+--------
       1 | John Smith | 100.32
       2 | Jane Bond  |   15.4
       3 | Tony James |  35.56
```

#### `components\binding-cron.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动Cron [Bindings构建块]({{< ref bindings >}})
- 每10秒调用绑定端点（`batch`）

本快速入门包含的 Cron `binding-cron.yaml` 文件包含以下内容：

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
    value: "@every 10s" # valid cron schedule
  - name: direction
    value: "input" # direction of the cron binding
```

**注意：**`binding-cron.yaml`的`metadata`部分包含一个[Cron表达式]({{< ref cron.md >}})，用于指定绑定被调用的频率。

#### `component\binding-postgresql.yaml` 组件文件

当您执行`dapr run`命令并指定组件路径时，Dapr sidecar:

- 启动PostgreSQL [绑定构建块]({{< ref postgresql.md >}})
- 使用在`binding-postgresql.yaml`文件中指定的设置连接到PostgreSQL

使用 `binding-postgresql.yaml` 组件，您可以轻松更换后端数据库 [binding]({{< ref supported-bindings.md >}}) 而无需更改代码。

本快速入门包含的 PostgreSQL `binding-postgresql.yaml` 文件包含以下内容：

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
  - name: url # Required
    value: "user=postgres password=docker host=localhost port=5432 dbname=orders pool_min_conns=1 pool_max_conns=10"
  - name: direction
    value: "output" # direction of the postgresql binding
```

在 YAML 文件中：

- `spec/type`指定了此绑定所使用的PostgreSQL。
- `spec/metadata`定义了组件使用的PostgreSQL实例的连接。



{{< /tabs >}}

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的[discord频道](https://discord.com/channels/778680217417809931/953427615916638238)参与讨论。

## 下一步

- 使用 HTTP 而不是 SDK 的 Dapr Bindings。
  - [Python](https://github.com/dapr/quickstarts/tree/master/bindings/python/http)
  - [JavaScript](https://github.com/dapr/quickstarts/tree/master/bindings/javascript/http)
  - [.NET](https://github.com/dapr/quickstarts/tree/master/bindings/csharp/http)
  - [Java](https://github.com/dapr/quickstarts/tree/master/bindings/java/http)
  - [Go](https://github.com/dapr/quickstarts/tree/master/bindings/go/http)
- 了解更多关于[Binding构建块]({{< ref bindings >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
