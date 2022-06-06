---
type: docs
title: "使用 Dapr 的内置 API"
linkTitle: "使用 Dapr 的内置 API"
weight: 30
description: "运行 Dapr sidecar 并尝试使用状态 API"
---

运行 [`dapr init`]({{<ref install-dapr-selfhost.md>}}) 加载你的本地环境。

- Dapr sidecar 二进制文件。
- 两者的默认 Redis 组件定义：
  - 状态管理，和
  - 消息代理。

通过此设置，使用 Dapr CLI 运行 Dapr，并尝试使用状态 API 来存储和检索状态。 [通过我们的概念文档了解更多关于状态构建块以及它是如何工作的]({{< ref state-management >}})。

在本指南中，您将通过运行 sidecar 并直接调用 API 来模拟应用程序。 为了本教程的目的，您将在没有应用程序的情况下运行sidecar。

### 第 1 步：运行Dapr sidecar

最有用的 Dapr CLI 命令之一是 [`dapr run`]({{< ref dapr-run.md >}})。 这条命令在启动应用的同时启动 sidecar。

启动一个 Dapr sidecar，它将在端口 3500 上侦听名为 `myapp`的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

由于没有使用上述命令定义自定义组件文件夹，因此 Dapr 使用在 [`dapr init` flow]({{< ref install-dapr-selfhost.md >}}) 期间创建的默认组件定义，查看：

- 在Windows上，在 `%UserProfile%\.dapr\components`
- 在Linux/MacOS上，在 `~/.dapr/components`

这些告诉 Dapr 使用 Redis 的本地 Docker 容器作为状态存储和消息代理。

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

注意, 状态中包含的对象有一个 `key`, 其值 `name`。 您将在下一步中使用该key。

使用以下命令存储新状态：

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

通过使用状态管理 API，用 key `name` 来检索你刚刚存储在状态中的对象。 使用之前运行的同一 Dapr 实例运行以下代码。 :

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

查看运行时状态值：

```bash
hgetall "myapp||name"
```

**输出:**  
`1) "data"`  
`2) "\"Bruce Wayne\""`  
`3) "version"`  
`4) "1"`

退出redis-cli，使用

```bash
exit
```

{{< button text="下一步：Dapr 快速入门 >>" page="getting-started/quickstarts" >}}