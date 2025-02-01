---
type: docs
title: "操作指南：控制并发和限制应用程序的速率"
linkTitle: "并发与速率限制"
weight: 2000
description: "了解如何控制同时调用您应用程序的请求和事件数量"
---

在分布式计算中，通常您可能只希望允许一定数量的请求同时执行。通过使用 Dapr 的 `app-max-concurrency`，您可以控制同时调用您应用程序的请求和事件数量。

默认情况下，`app-max-concurrency` 设置为 `-1`，表示不限制并发数量。

## 不同的方法

本指南主要介绍 `app-max-concurrency`，但您也可以使用 **`middleware.http.ratelimit`** 中间件来限制每秒的请求速率。理解这两种方法的区别非常重要：

- `middleware.http.ratelimit`：限制每秒的请求数量
- `app-max-concurrency`：限制在任意时间点的最大并发请求（和事件）数量。

有关该方法的更多信息，请参见[速率限制中间件]({{< ref middleware-rate-limit.md >}})。

## 演示

观看此[视频](https://youtu.be/yRI5g6o_jp8?t=1710)以了解如何控制并发和速率限制。

<div class="embed-responsive embed-responsive-16by9">
<iframe width="764" height="430" src="https://www.youtube-nocookie.com/embed/yRI5g6o_jp8?t=1710" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 配置 `app-max-concurrency`

如果不使用 Dapr，您需要在应用程序中创建某种信号量并负责获取和释放它。

使用 Dapr，您无需对应用程序进行任何代码更改。

选择您希望配置 `app-max-concurrency` 的方式。

{{< tabs "CLI" Kubernetes >}}

 <!-- CLI -->
{{% codetab %}}

要在本地开发环境中使用 Dapr CLI 设置并发限制，请添加 `app-max-concurrency` 标志：

```bash
dapr run --app-max-concurrency 1 --app-port 5000 python ./app.py
```

上述示例将您的应用程序变成一个顺序处理服务。

{{% /codetab %}}

 <!-- Kubernetes -->
{{% codetab %}}

要在 Kubernetes 中配置并发限制，请将以下注释添加到您的 pod：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodesubscriber
  namespace: default
  labels:
    app: nodesubscriber
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nodesubscriber
  template:
    metadata:
      labels:
        app: nodesubscriber
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodesubscriber"
        dapr.io/app-port: "3000"
        dapr.io/app-max-concurrency: "1"
#...
```

{{% /codetab %}}

{{< /tabs >}}

## 限制

### 控制外部请求的并发
速率限制适用于来自 Dapr 的每个事件，包括 pub/sub 事件、来自其他服务的直接调用、bindings 事件等。然而，Dapr 无法对外部传入您应用程序的请求强制执行并发策略。

## 相关链接

[参数和注释]({{< ref arguments-annotations-overview.md >}})

## 下一步

{{< button text="限制 secret 存储访问" page="secret-scope" >}}