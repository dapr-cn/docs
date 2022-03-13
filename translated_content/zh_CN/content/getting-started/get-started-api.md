---
type: docs
title: "使用 Dapr API"
linkTitle: "使用 Dapr API"
weight: 30
---

在[上一步]({{<ref install-dapr-selfhost.md>}})运行了 `dapr init` 命令后， 您的本地环境具有 Dapr sidecar 二进制文件以及默认组件定义的状态管理和消息代理(都使用 Redis)。 现在您可以通过使用 Dapr CLI 来运行 Dapr sidecar 并尝试使用状态 API 来存储和检索状态，从而尝试 Dapr 提供的一些功能。 你可以在 [这些文档]({{< ref state-management >}})中了解更多关于状态构建块及其工作原理的信息。

现在，您将运行 sidecar 并直接调用 API（模拟应用程序将执行的操作）。

## 第 1 步：运行 Dapr sidecar

最有用的 Dapr CLI 命令之一是 [`dapr run`]({{< ref dapr-run.md >}})。 这条命令在启动应用的同时启动 sidecar。 在本教程中，你将在没有应用程序的情况下运行 sidecar。

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 myapp 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

使用此命令时，未定义自定义组件文件夹，因此 Dapr 使用在初始化流程期间创建的默认组件定义（这些定义可以在 Linux 或 MacOS 上的 `$HOME/.dapr/components` 下以及 Windows 上的 `%USERPROFILE%\.dapr\components` 下找到）。 这些告诉 Dapr 使用本地的 Redis Docker 容器作为状态存储和消息代理。

## 第 2 步：保存状态

我们现在将更新对象的状态。 新状态将如下所示：

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

注意, 状态中包含的对象有一个值为 `name` 的 `key`。 您将在下一步中使用该 key。

运行如下所示的命令以存储新的状态。

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

## 第 3 步：获取状态

现在通过使用状态管理 API，用 key `name` 来获取你刚刚存储在状态中的对象。

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
使用从上面运行的相同 Dapr 实例运行：
```bash
curl http://localhost:3500/v1.0/state/statestore/name
```
{{% /codetab %}}

{{% codetab %}}
使用从上面运行的相同 Dapr 实例运行：
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```
{{% /codetab %}}

{{< /tabs >}}

## 第 4 步：查看状态在 Redis 中的存储方式

您可以查看 Redis 容器并验证 Dapr 是否将其用作状态存储。 运行以下命令以使用 Redis CLI：

```bash
docker exec -it dapr_redis redis-cli
```

列出redis keys以查看Dapr如何创建一个键值对(您提供给 `dapr run` 的app-id 作为key的前缀)：

```bash
keys *
```

```
1) "myapp||name"
```

通过运行命令来查看状态值：

```bash
hgetall "myapp||name"
```

```
1) "data"
2) "\"Bruce Wayne\""
3) "version"
4) "1"
```

退出 redis-cli：

```bash
exit
```

{{< button text="下一步: 定义一个组件 >>" page="get-started-component" >}}
