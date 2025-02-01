
---
type: docs
title: "使用 Dapr API"
linkTitle: "使用 Dapr API"
weight: 30
description: "运行 Dapr sidecar 并尝试使用状态管理 API"
---

在本指南中，您将通过运行 sidecar 并直接调用状态管理 API 来模拟应用程序的操作。在使用 Dapr CLI 运行 Dapr 之后，您将：

- 保存一个状态对象。
- 读取/获取状态对象。
- 删除状态对象。

[了解更多关于状态构建块及其工作原理的概念文档]({{< ref state-management >}})。

### 前置条件

- [安装 Dapr CLI]({{< ref install-dapr-cli.md >}})。
- [运行 `dapr init`]({{< ref install-dapr-selfhost.md>}})。

### 步骤 1: 运行 Dapr sidecar

[`dapr run`]({{< ref dapr-run.md >}}) 命令通常会运行您的应用程序和一个 Dapr sidecar。在这种情况下，由于您直接与状态管理 API 交互，它只运行 sidecar。

启动一个 Dapr sidecar，它将在端口 3500 上监听一个名为 `myapp` 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

由于上述命令没有定义自定义组件文件夹，Dapr 使用在 [`dapr init` 流程]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}})中创建的默认组件定义。

### 步骤 2: 保存状态

使用一个对象更新状态。新的状态将如下所示：

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

注意，状态中包含的每个对象都有一个 `key`，其值为 `name`。您将在下一步中使用该 key。

使用以下命令保存一个新的状态对象：

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

### 步骤 3: 获取状态

使用状态管理 API 和 key `name` 检索您刚刚存储在状态中的对象。在同一个终端窗口中，运行以下命令：

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

### 步骤 4: 查看状态如何存储在 Redis 中

查看 Redis 容器并验证 Dapr 是否将其用作状态存储。使用以下命令与 Redis CLI 交互：

```bash
docker exec -it dapr_redis redis-cli
```

列出 Redis 键以查看 Dapr 如何使用您提供给 `dapr run` 的 app-id 作为键的前缀创建键值对：

```bash
keys *
```

**输出：**  
`1) "myapp||name"`

通过运行以下命令查看状态值：

```bash
hgetall "myapp||name"
```

**输出：**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`  

使用以下命令退出 Redis CLI：

```bash
exit
```

### 步骤 5: 删除状态

在同一个终端窗口中，从状态存储中删除 `name` 状态对象。

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
