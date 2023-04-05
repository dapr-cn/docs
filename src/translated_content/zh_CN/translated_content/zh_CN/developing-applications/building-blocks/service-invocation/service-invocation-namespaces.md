---
type: docs
title: "How to: Service invocation across namespaces"
linkTitle: "How to: Service invocation namespaces"
weight: 1000
description: "部署到不同命名空间的服务间调用"
---

In this article, you'll learn how you can call between services deployed to different namespaces. By default, service invocation supports invoking services within the *same* namespace by simply referencing the app ID (`nodeapp`):

```sh
localhost:3500/v1.0/invoke/nodeapp/method/neworder
```

服务调用也支持跨命名空间的调用。 On all supported hosting platforms, Dapr app IDs conform to a valid FQDN format that includes the target namespace. 您可以同时指定：

- The app ID (`nodeapp`), and
- 应用程序运行的命名空间（`production`）。

**示例 1**

在 `production` 命名空间中的 `nodeapp` 上调用 `neworder` 方法：

```sh
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

当使用服务调用在命名空间中调用应用程序时，您可以使用命名空间对其进行限定。 这在 Kubernetes 集群中的跨命名空间调用中被证明是有用的。

**示例 2**

在 `myapp` 上调用 `ping` 方法，范围为 `production` 命名空间：

```bash
https://localhost:3500/v1.0/invoke/myapp.production/method/ping
```

**示例 3**

使用来自外部 DNS 地址（在本例中为 `api.demo.dapr.team`）的 curl 命令调用与示例 2 相同的 `ping` 方法，并提供 Dapr API 令牌进行身份验证：

MacOS/Linux：

```
curl -i -d '{ "message": "hello" }' \
     -H "Content-type: application/json" \
     -H "dapr-api-token: ${API_TOKEN}" \
     https://api.demo.dapr.team/v1.0/invoke/myapp.production/method/ping
```
