---
type: docs
title: "指南：跨命名空间进行服务调用"
linkTitle: "指南：服务调用命名空间"
weight: 50
description: "在不同命名空间之间进行服务调用"
---

在本文中，您将学习如何在不同命名空间之间进行服务调用。默认情况下，service-invocation支持通过简单引用应用程序ID（如`nodeapp`）来调用*同一*命名空间内的服务：

```sh
localhost:3500/v1.0/invoke/nodeapp/method/neworder
```

service-invocation也支持跨命名空间的调用。在所有支持的平台上，Dapr应用程序ID遵循包含目标命名空间的有效FQDN格式。您可以同时指定：

- 应用程序ID（如`nodeapp`），以及
- 应用程序所在的命名空间（如`production`）。

**示例 1**

调用位于`production`命名空间中`nodeapp`的`neworder`方法：

```sh
localhost:3500/v1.0/invoke/nodeapp.production/method/neworder
```

在使用service-invocation调用不同命名空间中的应用程序时，您需要使用命名空间来限定它。这在Kubernetes集群中的跨命名空间调用中非常有用。

**示例 2**

调用位于`production`命名空间中`myapp`的`ping`方法：

```bash
https://localhost:3500/v1.0/invoke/myapp.production/method/ping
```

**示例 3**

使用curl命令从外部DNS地址（例如`api.demo.dapr.team`）调用与示例2相同的`ping`方法，并提供Dapr API令牌进行身份验证：

MacOS/Linux:

```
curl -i -d '{ "message": "hello" }' \
     -H "Content-type: application/json" \
     -H "dapr-api-token: ${API_TOKEN}" \
     https://api.demo.dapr.team/v1.0/invoke/myapp.production/method/ping
```
