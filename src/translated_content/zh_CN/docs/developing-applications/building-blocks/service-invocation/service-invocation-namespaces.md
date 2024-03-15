---
type: docs
title: 如何：跨命名空间进行服务调用
linkTitle: 如何：服务调用命名空间
weight: 50
description: 部署到不同命名空间的服务间调用
---

在本文中，你将了解如何在不同命名空间中部署的服务之间进行调用。 默认情况下，服务调用支持通过简单地引用应用ID（`nodeapp`）来调用_相同_命名空间内的服务：

```sh
localhost:3500/v1.0/invoke/nodeapp/method/neworder
```

服务调用也支持跨命名空间的调用。 在所有受支持的托管平台上， Dapr 应用程序标识（ID）遵循包含了目标命名空间的有效 FQDN 格式。 您可以同时指定：

- 应用 ID (`nodeapp`)，以及
- 应用程序运行的命名空间 (`production`)。

**示例 1**

在 `production` 命名空间中调用 `nodeapp` 的 `neworder` 方法：

```sh
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

当使用服务调用在命名空间中调用应用程序时，您可以使用命名空间对其进行限定。 这在 Kubernetes 集群中的跨命名空间调用中被证明是有用的。

**示例 2**

在 `production` 命名空间中调用 `myapp` 的 `ping` 方法:

```bash
https://localhost:3500/v1.0/invoke/myapp.production/method/ping
```

**示例 3**

使用来自外部 DNS 地址（在本例中为 `api.demo.dapr.team`）的 curl 命令调用与示例 2 相同的 `ping` 方法，并提供 Dapr API 令牌进行身份验证：

MacOS/Linux:

```
curl -i -d '{ "message": "hello" }' \
     -H "Content-type: application/json" \
     -H "dapr-api-token: ${API_TOKEN}" \
     https://api.demo.dapr.team/v1.0/invoke/myapp.production/method/ping
```
