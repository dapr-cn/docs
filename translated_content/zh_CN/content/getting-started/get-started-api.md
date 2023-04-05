---
type: docs
title: "使用 Dapr 的内置 API"
linkTitle: "使用 Dapr 的内置 API"
weight: 30
description: "运行 Dapr sidecar 并尝试使用状态 API"
---

In this guide, you'll simulate an application by running the sidecar and calling the API directly. After running Dapr using the Dapr CLI, you'll:

- Save a state object.
- Read/get the state object.
- Delete the state object.

通过我们的[概念文档]({{< ref state-management >}})了解更多关于状态构建块以及它是如何工作的。

### 前提

- [Install  Dapr CLI]({{< ref install-dapr-cli.md >}}).
- [Run `dapr init`]({{< ref install-dapr-selfhost.md>}}).

### 第 1 步：运行Dapr sidecar

The [`dapr run`]({{< ref dapr-run.md >}}) command launches an application, together with a sidecar.

启动一个 Dapr sidecar，它将在端口 3500 上侦听名为 `myapp`的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

由于没有使用上述命令定义自定义组件文件夹，因此 Dapr 将使用在 [`dapr init` ]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}}) 期间创建的默认组件定义。

### 第 2 步：保存状态

更新对象的状态。 新状态将看起来像这样：

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

Notice, that objects contained in the state each have a `key` assigned with the value `name`. 您将在下一步中使用该key。

Save a new state object using the following command:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}
{{% codetab %}}

```bash
curl -X POST -H "Content-Type: application/json" -d '[{ "key": "name", "value": "Bruce Wayne"}]' http://localhost:3500/v1.0/state/statestore
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Post -ContentType 'application/json' -Body '[{ "key": "name", "value": "Bruce Wayne"}]' -Uri 'http://localhost:3500/v1.0/state/statestore'
```

{{% /codetab %}}

{{< /tabs >}}

### 第 3 步：获取状态

通过使用状态管理 API，用 key `name` 来检索你刚刚存储在状态中的对象。 In the same terminal window, run the following command:

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl http://localhost:3500/v1.0/state/statestore/name 
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```

{{% /codetab %}}

{{< /tabs >}}

### 第 4 步：查看状态如何在 Redis 中存储

在 Redis 容器中查看并验证Dapr 正在使用它作为状态存储。 通过以下命令使用 Redis CLI：

```bash
docker exec -it dapr_redis redis-cli
```

列出Redis keys以查看Dapr如何创建一个键值对(您提供给 `dapr run` 的app-id 作为key的前缀)：

```bash
keys *
```

**输出：**  
`1) "myapp||name"`

View the state values by running:

```bash
hgetall "myapp||name"
```

**输出:**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`

Exit the Redis CLI with:

```bash
exit
```

### Step 5: Delete state

In the same terminal window, delete the`name` state object from the state store.

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}

```bash
curl -v -X DELETE -H "Content-Type: application/json" http://localhost:3500/v1.0/state/statestore/name
```

{{% /codetab %}}

{{% codetab %}}

```powershell
Invoke-RestMethod -Method Delete -ContentType 'application/json' -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```

{{% /codetab %}}

{{< /tabs >}}

{{< button text="下一步：Dapr 快速入门 >>" page="getting-started/quickstarts" >}}