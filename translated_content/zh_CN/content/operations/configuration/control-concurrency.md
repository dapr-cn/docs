---
type: docs
title: "如何：控制并发和限流"
linkTitle: "并发& 限流"
weight: 2000
description: "控制同时又多少个请求和实现可以同时调用你的应用"
---

只允许通知执行给定数量的请求时分布式计算中一个常见的场景 使用Dapr，你可以控制同时有多少个应用和时间可以调用你的应用

*请注意，这个速率限制对每一个来自Dapr的事件都是有保证的，这意味着Pub/Sub事件、来自其他服务的直接调用、绑定事件等等。 Dapr不能对从从Dapr外部调用你的应用程序的请求应用并发策略。*

*Note that rate limiting per second can be achieved by using the **middleware.http.ratelimit** middleware. However, there is an imporant difference between the two approaches. The rate limit middlware is time bound and limits the number of requests per second, while the `app-max-concurrency` flag specifies the number of concurrent requests (and events) at any point of time. See [Rate limit middleware]({{< ref middleware-rate-limit.md >}}). * However, there is an imporant difference between the two approaches. The rate limit middlware is time bound and limits the number of requests per second, while the `app-max-concurrency` flag specifies the number of concurrent requests (and events) at any point of time. See [Rate limit middleware]({{< ref middleware-rate-limit.md >}}). *

Watch this [video](https://youtu.be/yRI5g6o_jp8?t=1710) on how to control concurrency and rate limiting ".
<iframe width="764" height="430" src="https://www.youtube.com/embed/yRI5g6o_jp8?t=1710" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 设置 app-max-concurrency

如果不适用Dapr，开发者需要在应用中创建某种信号量，并且负责获取和释放它 使用 Dapr，应用程序不需要代码更改。

### 在Kubernetes中设置app-max-concurrency

To set app-max-concurrency in Kubernetes, add the following annotation to your pod:

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

### Setting app-max-concurrency using the Dapr CLI

To set app-max-concurrency with the Dapr CLI for running on your local dev machine, add the `app-max-concurrency` flag:

```bash
dapr run --app-max-concurrency 1 --app-port 5000 python ./app.py
```

The above examples will effectively turn your app into a single concurrent service.
