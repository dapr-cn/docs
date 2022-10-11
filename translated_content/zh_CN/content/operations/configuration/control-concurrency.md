---
type: docs
title: "操作方法：控制并发和限流"
linkTitle: "并发& 限流"
weight: 2000
description: "控制同时有多少个请求和事件可以同时调用你的应用"
---

只允许通知执行给定数量的请求时分布式计算中一个常见的场景。 使用Dapr，你可以控制同时有多少个应用和事件可以调用你的应用。

*请注意，这个速率限制对每一个来自Dapr的事件都是有保证的，这意味着Pub/Sub事件、来自其他服务的直接调用、绑定事件等等。 Dapr 无法对来自Dapr外部的应用程序的请求强制应用并发策略。*

*请注意，每秒速率限制可以通过使用中间件 **middleware.http.ratelimit** 来实现。 但是，这两种方法之间存在着明显的差异。 速率限制中间件存在时间限制以及每秒请求数限制，而 `app-max-concurrency` 标志指定了任意时间点上的并发请求（和事件）的数量。 请参阅 [速率限制中间件]({{< ref middleware-rate-limit.md >}})。 *

观看此 [视频](https://youtu.be/yRI5g6o_jp8?t=1710) ，了解如何控制并发和速率限制”。
<iframe width="764" height="430" src="https://www.youtube.com/embed/yRI5g6o_jp8?t=1710" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 设置 app-max-concurrency

如果不适用Dapr，开发者需要在应用中创建某种信号量，并且负责获取和释放它。 使用 Dapr，应用程序不需要代码更改。

### 在Kubernetes中设置app-max-concurrency

要在 Kubernetes 中设置 app-max-concurrency，请向你的 pod 添加以下注解：

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
        <b>dapr.io/app-max-concurrency: "1"</b>
...
```

### 使用 Dapr CLI 设置 app-max-concurrency

要用 Dapr CLI 设置在你的本地开发机器上运行的 app-max-concurrency，添加 `app-max-concurrency` 参数：

```bash
dapr run --app-max-concurrency 1 --app-port 5000 python ./app.py
```

上述示例将有效地将你的应用转换为单并发服务。
