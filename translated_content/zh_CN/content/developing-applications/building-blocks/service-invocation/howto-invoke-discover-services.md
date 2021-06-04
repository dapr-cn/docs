---
type: docs
title: "入门指南：发现并调用服务"
linkTitle: "How-To: Invoke services"
description: "入门指南指导如何使用 Dapr 服务在分布式应用程序中调用其它服务"
weight: 2000
---

本文介绍如何使用唯一的应用程序 ID 部署每个服务，以便其他服务可以使用服务调用 API 发现和调用这些终结点。

## 步骤 1: 为服务选择标识

Dapr 允许您为您的应用分配一个全局唯一ID。 此 ID 为您的应用程序封装了状态，不管它可能有多少实例。

{{< tabs "Self-Hosted (CLI)" Kubernetes >}}

{{% codetab %}}
在自托管方式下，设置 `--app-id` 标记:

```bash
dapr run --app-id cart --app-port 5000 python app.py
```

如果您的应用使用 SSL 连接，您可以告诉Dapr 在不安全的 SSL 连接中调用您的应用：

```bash
dapr run --app-id cart --app-port 5000 --app-ssl python app.py
```
{{% /codetab %}}

{{% codetab %}}

### 使用 Kubernetes 设置标识

在 Kubernetes 中，在您的pod 上设置 `dapr.io/app-id` 注解：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: python-app
  namespace: default
  labels:
    app: python-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: python-app
  template:
    metadata:
      labels:
        app: python-app
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "cart"
        dapr.io/app-port: "5000"
...
```
*如果应用程序使用 SSL 连接，那么可以使用 `app-ssl: "true"` 注解 (完整列表 [此处]({{< ref kubernetes-annotations.md >}})) 告知 Dapr 在不安全的 SSL 连接上调用应用程序。*

{{% /codetab %}}

{{< /tabs >}}


## 步骤 2: 设置服务

以下是购物车应用的 Python 示例。 它可以用任何编程语言编写。

```python
from flask import Flask
app = Flask(__name__)

@app.route('/add', methods=['POST'])
def add():
    return "Added!"

if __name__ == '__main__':
    app.run()
```

此 Python 应用程序通过 `/add()` 端点暴露了一个 `add()` 方法。

## 步骤 3: 调用服务

Dapr 采用边车（sidecar）、去中心化的架构。 要使用 Dapr 调用应用程序，您可以在任意 Dapr 实例中使用 `调用` API。

sidecar 编程模型鼓励每个应用程序与自己的 Dapr 实例对话。 Dapr 实例会相互发现并进行通信。

{{< tabs curl CLI >}}

{{% codetab %}}
从一个终端或命令提示运行：
```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add -X POST
```

由于 add 端点是一个“POST”方法，我们在 curl 命令中使用了 `-X POST`。

要调用 "GET" 端点:

```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add
```

要调用 "DELETE" 端点:

```bash
curl http://localhost:3500/v1.0/invoke/cart/method/add -X DELETE
```

Dapr 将调用的服务返回的任何有效负载放在 HTTP 响应的消息体中。
{{% /codetab %}}

{{% codetab %}}
```bash
dapr invoke --app-id cart --method add
```
{{% /codetab %}}

{{< /tabs >}}

### 命名空间

当运行于[支持命名空间]({{< ref "service_invocation_api.md#namespace-supported-platforms" >}})的平台时，在您的 app ID 中包含命名空间：`myApp.production`

例如，调用包含名称空间的示例 python 服务:

```bash
curl http://localhost:3500/v1.0/invoke/cart.production/method/add -X POST
```

有关名称空间的更多信息，请参阅 [跨命名空间 API]({{< ref "service_invocation_api.md#cross-namespace-invocation" >}}) 。

## 步骤 4: 查看跟踪和日志

上面的示例显示了如何直接调用本地或 Kubernetes 中运行的其他服务。 Dapr 输出指标、跟踪和日志记录信息，允许您可视化服务之间的调用图、日志错误和可选地记录有效负载正文。

有关跟踪和日志的更多信息，请参阅 [可观察性]({{< ref observability-concept.md >}}) 篇文章。

 相关链接

* [服务调用概述]({{< ref service-invocation-overview.md >}})
* [服务调用 API 规范]({{< ref service_invocation_api.md >}})
