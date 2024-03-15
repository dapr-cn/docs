---
type: docs
title: 使用 Dapr 的内置 API
linkTitle: 使用 Dapr 的内置 API
weight: 30
description: 运行 Dapr sidecar 并尝试使用状态管理 API
---

在本指南中，您将通过运行 sidecar 并直接调用状态管理 API 来模拟一个应用程序。
使用 Dapr CLI 运行 Dapr 后，您将：

- 保存状态对象。
- 阅读/获取状态对象。
- 删除状态对象。

[在我们的概念文档中了解更多关于状态构建块及其工作原理的信息]({{< ref state-management >}})。

### 先决条件

- [安装 Dapr CLI]({{< ref install-dapr-cli.md >}})。
- [运行 `dapr init`]({{< ref install-dapr-selfhost.md>}})。

### 第 1 步：运行 Dapr sidecar

[`dapr run`]({{< ref dapr-run.md >}}) 命令通常会运行您的应用程序和一个 Dapr sidecar。 在这种情况下，
它只运行 sidecar ，因为您直接与状态管理 API 交互。

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 `myapp` 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

由于没有使用上述命令定义自定义组件文件夹，因此Dapr将使用在[`dapr init`流程]({{< ref "install-dapr-selfhost.md#step-5-verify-components-directory-has-been-initialized" >}})期间创建的默认组件定义。

### 第 2 步：保存状态

更新对象的状态。 新状态将如下所示：

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

注意, 状态中包含的对象每个都有一个`key`被赋值为`name`的值。 您将在下一步中使用该 key。

使用以下命令保存一个新的状态对象:

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

通过使用状态管理 API，用 key `name` 来检索你刚刚存储在状态中的对象。 在同一个终端窗口中，运行以下命令：

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

### 第 4 步：查看状态在 Redis 中的存储方式

在 Redis 容器中查看并验证Dapr 正在使用它作为状态存储。 通过以下命令使用 Redis CLI：

```bash
docker exec -it dapr_redis redis-cli
```

列出Redis的键，以查看Dapr如何创建一个带有您提供给`dapr run`作为键前缀的键值对：

```bash
keys *
```

**输出：**\
`1) "myapp||name"`

查看运行时状态值：

```bash
hgetall "myapp||name"
```

**输出:**\
`1) "data"`\
`2) "\"Bruce Wayne\""`\
`3) "version"`\
`4) "1"`

退出 Redis CLI，使用：

```bash
exit
```

### 第三步：删除状态

在同一个终端窗口中，从状态存储中删除`name`状态对象。

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

{{< button text="下一步: Dapr 快速入门 >>" page="getting-started/quickstarts" >}}
