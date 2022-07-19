---
type: docs
title: "操作方法：处理大型 http 正文请求"
linkTitle: "Http 请求正文大小"
weight: 6000
description: "配置大于 4 MB 的 http 请求"
---

默认情况下，Dapr 对请求正文大小的限制设置为 4 MB，但是您可以通过定义 `dapr.io/http-max-request-size` 注解或 `--dapr-http-max-request-size` 标志来更改此限制。



{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

在自托管模式下运行时，请使用 `--dapr-http-max-request-size` 标志将 Dapr 配置为使用非默认请求正文大小：

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
这告诉 Dapr 将最大请求正文大小设置为 `16` MB。

{{% /codetab %}}


{{% codetab %}}

在 Kubernetes 中，需要在 deployment YAML 文件中设置以下注解:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/http-max-request-size: "16"
...
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr Kubernetes pod annotations 规范]({{< ref arguments-annotations-overview.md >}})
