---
type: docs
title: "使用 Dapr 的内置 API"
linkTitle: "使用 Dapr 的内置 API"
weight: 30
---

在 [前一步]({{<ref install-dapr-selfhost.md>}})中运行了 `dapr init` 命令后， 您的本地环境有 Dapr sidecar 二进制文件以及默认组件定义的状态管理和消息中介者(都使用 Redis)。 现在您可以通过使用 Dapr CLI 来运行 Dapr sidecar 并尝试使用状态API来存储和检索状态，从而尝试 Dapr 提供的一些功能。 你可以在 [}}">这些文档]({{< ref state-management >}})中了解更多关于状态构建块及其工作原理的信息。

您现在将运行sidecar并直接调用 API (模拟应用程序将做什么)。

## 第 1 步：运行Dapr sidecar

最有用的 Dapr CLI 命令之一是 [`dapr run`]({{< ref dapr-run.md >}})。 此命令与sidecar一起启动一个应用程序。 为了本教程的目的，您将在没有应用程序的情况下运行sidecar。

运行以下命令以启动 Dapr sidecar，它将在端口 3500 上监听名为 myapp 的空白应用程序：

```bash
dapr run --app-id myapp --dapr-http-port 3500
```

使用此命令，没有定义自定义组件文件夹。因此Dapr 使用在 init 流中创建的默认组件定义(这些定义可以在 `$HOME/.dapr/components` 在 Linux 或 MacOS 上，在 `%USERPROFILE%\.dapr\components`在 Windows)。 这些告诉 Dapr 使用本地的 Redis Docker 容器作为状态存储和消息代理。

## 第 2 步：保存状态

我们现在将更新对象的状态。 新状态将看起来像这样：

```json
[
  {
    "key": "name",
    "value": "Bruce Wayne"
  }
]
```

注意, 状态中包含的对象有一个 `key`, 其值 `name`。 您将在下一步中使用该key。

运行下面显示的命令来存储新的状态。

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

现在通过使用状态管理API，用key `name` 来获取你刚刚存储在状态中的对象。

{{< tabs "HTTP API (Bash)" "HTTP API (PowerShell)">}}

{{% codetab %}}
用上面运行的同一个Dapr实例运行：
```bash
curl http://localhost:3500/v1.0/state/statestore/name
```
{{% /codetab %}}

{{% codetab %}}
用上面运行的同一个Dapr实例运行：
```powershell
Invoke-RestMethod -Uri 'http://localhost:3500/v1.0/state/statestore/name'
```
{{% /codetab %}}

{{< /tabs >}}

## 第 4 步：查看状态如何在 Redis 中存储

您可以在 Redis 容器中看到并验证Dapr 正在使用它作为状态存储。 运行以下命令来使用Redis CLI：

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

查看运行时状态值：

```bash
hgetall "myapp||name"
```

```
1) "data"
2) "\"Bruce Wayne\""
3) "version"
4) "1"
```

退出redis-cli，使用

```bash
exit
```

{{< button text="下一步: 定义一个组件 >>" page="get-started-component" >}}
