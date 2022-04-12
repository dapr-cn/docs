---
type: docs
title: "指南：保存和获取状态"
linkTitle: "指南：如何保存和获取状态"
weight: 200
description: "使用键值对来持久化状态"
---

## 介绍

状态管理是任何应用程序最常见的需求之一：无论是新是旧，是单体还是微服务。 与不同的数据库库打交道，进行测试，处理重试和故障是很费时费力的。

Dapr提供的状态管理功能包括一致性和并发选项。 在本指南中，我们将从基础知识开始。使用键/值状态API来允许应用程序保存，获取和删除状态。

## 前提

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})

## 第一步：设置状态存储

状态存储组件代表Dapr用来与数据库进行通信的资源。

本手册演示使用Redis状态存储，在[支持列表]({{< ref supported-state-stores >}})中的所有状态存储均可使用。

{{< tabs "Self-Hosted (CLI)" Kubernetes>}}

{{% codetab %}}
当在单机模式下使用`dapr init`时，Dapr CLI会自动提供一个状态存储(Redis)，并在`components`目录中创建相关的YAML，在Linux/MacOS上位于`$HOME/.dapr/components`，在Windows上位于`%USERPROFILE%/.dapr/components`。

如果需要切换使用的状态存储引擎，用你选择的文件替换`/components`下的YAML文件`statestore.yaml`。
{{% /codetab %}}

{{% codetab %}}

若要部署在Kubernetes集群中，请在以下所示的yaml文件中对[期望状态存储组件]({{< ref supported-state-stores >}})的`metadata`进行连接信息填充，保存为`statestore.yaml`，然后运行`kubectl apply -f statestore.yaml`。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: default
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: localhost:6379
  - name: redisPassword
    value: ""
```
如何在Kubernetes中设置状态存储，请查阅[这里]({{< ref "setup-state-store" >}})。

{{% /codetab %}}

{{< /tabs >}}

## 第二步：保存和检索单个状态

下面的例子显示了如何使用Dapr状态构件的单个键/值对。

{{% alert title="Note" color="warning" %}}
设置一个app-id是很重要的，因为状态键是以这个值为前缀的。 如果你不设置，就会在运行期间为你自动生成一个值，而到下次运行命令时又会生成一个新的值，你将因此无法再访问以前保存的状态。
{{% /alert %}}

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
首先启动一个Dapr sidecar：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

然后在一个单独的终端中保存一个键/值对到你的statestore中：
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1"}]' http://localhost:3500/v1.0/state/statestore
```

现在获取你刚才保存的状态：
```bash
curl http://localhost:3500/v1.0/state/statestore/key1
```

你也可以重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。
{{% /codetab %}}

{{% codetab %}}

首先启动一个Dapr sidecar：

```bash
dapr --app-id myapp --port 3500 run
```

然后在一个单独的终端中保存一个键/值对到你的statestore中：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{"key": "key1", "value": "value1"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

现在获取你刚才保存的状态：
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/key1'
```

你也可以重启你的sidecar，然后再次尝试检索状态，看看存储的状态是否与应用状态保持一致。

{{% /codetab %}}

{{% codetab %}}

将以下内容保存到名为`pythonState.py`的文件中:

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    d.save_state(store_name="statestore", key="myFirstKey", value="myFirstValue" )
    print("State has been stored")

    data = d.get_state(store_name="statestore", key="myFirstKey").data
    print(f"Got value: {data}")

```

保存后执行以下命令启动Dapr sidecar并运行Python应用程序:

```bash
dapr --app-id myapp run python pythonState.py
```

你应该会得到一个类似于下面的输出，它将同时显示Dapr和应用程序的日志:

```md
== DAPR == time="2021-01-06T21:34:33.7970377-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.8040378-08:00" level=info msg="standalone mode configured" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.8040378-08:00" level=info msg="app id: Braidbald-Boot" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9750400-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9760387-08:00" level=info msg="API gRPC server is running on port 51656" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9770372-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 172.9994ms" app_id=Braidbald-Boot scope=dapr.

Checking if Dapr sidecar is listening on GRPC port 51656
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You are up and running! Both Dapr and your app logs will appear here.

== APP == State has been stored
== APP == Got value: b'myFirstValue' name: statestore, type: state.redis" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9760387-08:00" level=info msg="API gRPC server is running on port 51656" app_id=Braidbald-Boot scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:34:33.9770372-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 172.9994ms" app_id=Braidbald-Boot scope=dapr.

 
Updating metadata for app command: python pythonState.py
You are up and running! Both Dapr and your app logs will appear here.

== APP == State has been stored
== APP == Got value: b'myFirstValue'
```

{{% /codetab %}}

{{% codetab %}}

在`state-example.php`中保存以下内容:

```php
<?php
require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $stateManager->save_state(store_name: 'statestore', item: new \Dapr\State\StateItem(
        key: 'myFirstKey',
        value: 'myFirstValue' 
    ));
    $logger->alert('State has been stored');

    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value: {data}", ['data' => $data]);
});
```

保存后，执行以下命令启动Dapr sidecar并运行PHP应用程序:

```bash
dapr --app-id myapp run -- php state-example.php
```

你应该会得到一个类似于下面的输出，它将同时显示Dapr和应用程序的日志:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:30:11.078777+01:00] APP.ALERT: State has been stored [] []

== APP == [2021-02-12T16:30:11.082620+01:00] APP.ALERT: Got value: myFirstValue {"data":"myFirstValue"} []
```

{{% /codetab %}}

{{< /tabs >}}


## 第三步：删除状态

下面的例子显示了如何通过给状态管理API传递一个键来删除一个对象:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
用上面运行的同一个dapr实例执行:
```bash
curl -X DELETE 'http://localhost:3500/v1.0/state/statestore/key1'
```
再尝试获取状态，注意没有返回任何值。
{{% /codetab %}}

{{% codetab %}}
用上面运行的同一个dapr实例执行:
```powershell
Invoke-RestMethod -Method Delete -Uri 'http://localhost:3500/v1.0/state/statestore/key1'
```
再尝试获取状态，注意没有返回任何值。
{{% /codetab %}}

{{% codetab %}}

修改`pythonState.py`如下：

```python
from dapr.clients import DaprClient

with DaprClient() as d:
    d.save_state(store_name="statestore", key="key1", value="value1" )
    print("State has been stored")

    data = d.get_state(store_name="statestore", key="key1").data
    print(f"Got value: {data}")

    d.delete_state(store_name="statestore", key="key1")

    data = d.get_state(store_name="statestore", key="key1").data
    print(f"Got value after delete: {data}")
```

现在通过以下命令运行你的程序:

```bash
dapr --app-id myapp run python pythonState.py
```

你应该会看到一个类似于下面的输出:

```md
Starting Dapr with id Yakchocolate-Lord. HTTP Port: 59457. gRPC Port: 59458

== DAPR == time="2021-01-06T22:55:36.5570696-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.5690367-08:00" level=info msg="standalone mode configured" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7220140-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7230148-08:00" level=info msg="API gRPC server is running on port 59458" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:55:36.7240207-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 154.984ms" app_id=Yakchocolate-Lord scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 59458
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == State has been stored
== APP == Got value: b'value1'
== APP == Got value after delete: b''
```
{{% /codetab %}}

{{% codetab %}}

修改`state-example.php`，内容如下:

```php
<?php
require_once __DIR__.'/vendor/autoload.php';

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $stateManager->save_state(store_name: 'statestore', item: new \Dapr\State\StateItem(
        key: 'myFirstKey',
        value: 'myFirstValue' 
    ));
    $logger->alert('State has been stored');

    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value: {data}", ['data' => $data]);

    $stateManager->delete_keys(store_name: 'statestore', keys: ['myFirstKey']);
    $data = $stateManager->load_state(store_name: 'statestore', key: 'myFirstKey')->value;
    $logger->alert("Got value after delete: {data}", ['data' => $data]);
});
```

现在使用以下命令运行它:

```bash
dapr --app-id myapp run -- php state-example.php
```

你应该会看到类似下面的输出:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:38:00.839201+01:00] APP.ALERT: State has been stored [] []

== APP == [2021-02-12T16:38:00.841997+01:00] APP.ALERT: Got value: myFirstValue {"data":"myFirstValue"} []

== APP == [2021-02-12T16:38:00.845721+01:00] APP.ALERT: Got value after delete:  {"data":null} []
```

{{% /codetab %}}

{{< /tabs >}}

## 第四步：保存和检索多个状态

Dapr还允许你在同一个调用中保存和检索多个状态:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
在上面运行的同一个dapr实例中，将两个键/值对保存到你的statetore中:
```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' http://localhost:3500/v1.0/state/statestore
```

现在获取你刚才保存的状态：
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["key1", "key2"]}' http://localhost:3500/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
在上面运行的同一个dapr实例中，将两个键/值对保存到你的statetore中:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "key1", "value": "value1"}, { "key": "key2", "value": "value2"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

现在获取你刚才保存的状态：
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["key1", "key2"]}' -Uri 'http://localhost:3500/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{% codetab %}}

`StateItem`对象可以使用`save_states`和`get_states`方法来存储多个Dapr状态。

用以下代码更新你的`pythonState.py`文件:

```python
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem

with DaprClient() as d:
    s1 = StateItem(key="key1", value="value1")
    s2 = StateItem(key="key2", value="value2")

    d.save_bulk_state(store_name="statestore", states=[s1,s2])
    print("States have been stored")

    items = d.get_bulk_state(store_name="statestore", keys=["key1", "key2"]).items
    print(f"Got items: {[i.data for i in items]}")
```

现在通过以下命令运行你的程序:

```bash
dapr --app-id myapp run python pythonState.py
```

你应该会看到一个类似于下面的输出:

```md
== DAPR == time="2021-01-06T21:54:56.7262358-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.7401933-08:00" level=info msg="standalone mode configured" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8754240-08:00" level=info msg="Initialized name resolution to standalone" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8844248-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8854273-08:00" level=info msg="API gRPC server is running on port 60614" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T21:54:56.8854273-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 145.234ms" app_id=Musesequoia-Sprite scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 60614
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == States have been stored
== APP == Got items: [b'value1', b'value2']
```

{{% /codetab %}}

{{% codetab %}}

要用PHP批量加载和保存状态，只需创建一个 "Plain Ole' PHP对象"(POPO)，并用 StateStore注解进行声明。

更新`state-example.php`文件:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualLastWrite::class)]
class MyState {
    public string $key1 = 'value1';
    public string $key2 = 'value2';
}

$app = \Dapr\App::create();
$app->run(function(\Dapr\State\StateManager $stateManager, \Psr\Log\LoggerInterface $logger) {
    $obj = new MyState();
    $stateManager->save_object(item: $obj);
    $logger->alert('States have been stored');

    $stateManager->load_object(into: $obj);
    $logger->alert("Got value: {data}", ['data' => $obj]);
});
```

运行该应用:

```bash
dapr --app-id myapp run -- php state-example.php
```

并看到以下输出:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T16:55:02.913801+01:00] APP.ALERT: States have been stored [] []

== APP == [2021-02-12T16:55:02.917850+01:00] APP.ALERT: Got value: [object MyState] {"data":{"MyState":{"key1":"value1","key2":"value2"}}} []
```

{{% /codetab %}}

{{< /tabs >}}

## 第五步：执行状态事务性操作

{{% alert title="Note" color="warning" %}}
状态事务性操作需要一个支持multi-item transactions的状态存储引擎。 完整列表请查阅[受支持的状态存储]({{< ref supported-state-stores >}})。 请注意，在自托管环境中创建的默认Redis容器是支持的。
{{% /alert %}}

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)" "Python SDK" "PHP SDK">}}

{{% codetab %}}
用上面运行的同一个dapr实例执行两个状态事务操作:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"operations": [{"operation":"upsert", "request": {"key": "key1", "value": "newValue1"}}, {"operation":"delete", "request": {"key": "key2"}}]}' http://localhost:3500/v1.0/state/statestore/transaction
```

现在可以看到你的状态事务操作的结果:
```bash
curl -X POST -H "Content-Type: application/json" -d '{"keys":["key1", "key2"]}' http://localhost:3500/v1.0/state/statestore/bulk
```
{{% /codetab %}}

{{% codetab %}}
在上面运行的同一个dapr实例中，将两个键/值对保存到你的statetore中:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"operations": [{"operation":"upsert", "request": {"key": "key1", "value": "newValue1"}}, {"operation":"delete", "request": {"key": "key2"}}]}' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

现在可以看到你的状态事务操作的结果:
```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '{"keys":["key1", "key2"]}' -Uri 'http://localhost:3500/v1.0/state/statestore/bulk'
```

{{% /codetab %}}

{{% codetab %}}

如果你的状态存储需要事务支持，可以考虑使用`TransactionalStateOperation`。

用以下代码更新你的`pythonState.py`文件:

```python
from dapr.clients import DaprClient
from dapr.clients.grpc._state import StateItem
from dapr.clients.grpc._request import TransactionalStateOperation, TransactionOperationType

with DaprClient() as d:
    s1 = StateItem(key="key1", value="value1")
    s2 = StateItem(key="key2", value="value2")

    d.save_bulk_state(store_name="statestore", states=[s1,s2])
    print("States have been stored")

    d.execute_state_transaction(
        store_name="statestore",
        operations=[
            TransactionalStateOperation(key="key1", data="newValue1", operation_type=TransactionOperationType.upsert),
            TransactionalStateOperation(key="key2", data="value2", operation_type=TransactionOperationType.delete)
        ]
    )
    print("State transactions have been completed")

    items = d.get_bulk_state(store_name="statestore", keys=["key1", "key2"]).items
    print(f"Got items: {[i.data for i in items]}")
```

现在通过以下命令运行你的程序:

```bash
dapr run python pythonState.py
```

你应该会看到一个类似于下面的输出:

```md
Starting Dapr with id Singerchecker-Player. HTTP Port: 59533. gRPC Port: 59534
== DAPR == time="2021-01-06T22:18:14.1246721-08:00" level=info msg="starting Dapr Runtime -- version 0.11.3 -- commit a1a8e11" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.1346254-08:00" level=info msg="standalone mode configured" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2747063-08:00" level=info msg="component loaded. name: statestore, type: state.redis" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2757062-08:00" level=info msg="API gRPC server is running on port 59534" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3
== DAPR == time="2021-01-06T22:18:14.2767059-08:00" level=info msg="dapr initialized. Status: Running. Init Elapsed 142.0805ms" app_id=Singerchecker-Player scope=dapr.runtime type=log ver=0.11.3

Checking if Dapr sidecar is listening on GRPC port 59534
Dapr sidecar is up and running.
Updating metadata for app command: python pythonState.py
You're up and running! Both Dapr and your app logs will appear here.

== APP == State transactions have been completed
== APP == Got items: [b'value1', b'']
```

{{% /codetab %}}

{{% codetab %}}

事务性状态通过扩展`TransactionalState`基础对象来支持，它挂接到你的 对象，然后通过setters和getters来提供事务。 而你可能会希望依赖注入框架来替你创建一个事务对象:

再次修改`state-example.php`文件:

```php
<?php

require_once __DIR__.'/vendor/autoload.php';

#[\Dapr\State\Attributes\StateStore('statestore', \Dapr\consistency\EventualLastWrite::class)]
class MyState extends \Dapr\State\TransactionalState {
    public string $key1 = 'value1';
    public string $key2 = 'value2';
}

$app = \Dapr\App::create();
$app->run(function(MyState $obj, \Psr\Log\LoggerInterface $logger, \Dapr\State\StateManager $stateManager) {
    $obj->begin();
    $obj->key1 = 'hello world';
    $obj->key2 = 'value3';
    $obj->commit();
    $logger->alert('Transaction committed!');

    // begin a new transaction which reloads from the store
    $obj->begin();
    $logger->alert("Got value: {key1}, {key2}", ['key1' => $obj->key1, 'key2' => $obj->key2]);
});
```

运行程序:

```bash
dapr --app-id myapp run -- php state-example.php
```

观察到以下输出:

```md
✅  You're up and running! Both Dapr and your app logs will appear here.

== APP == [2021-02-12T17:10:06.837110+01:00] APP.ALERT: Transaction committed! [] []

== APP == [2021-02-12T17:10:06.840857+01:00] APP.ALERT: Got value: hello world, value3 {"key1":"hello world","key2":"value3"} []
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

- 请查阅[状态API参考手册]({{< ref state_api.md >}})
- 尝试一个 [Dapr SDKs]({{< ref sdks >}})
- 构建一个 [状态服务]({{< ref howto-stateful-service.md >}})
