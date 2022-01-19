---
type: docs
title: "How-To: Handle large http body requests"
linkTitle: "Http request body size"
weight: 6000
description: "Configure http requests that are bigger than 4 MB"
---

默认情况下，Dapr 对请求正文大小的限制设置为 4 MB，但是您可以通过定义 `dapr.io/http-max-request-size` annotations 或 `--dapr-http-max-request-size` 标志来更改此限制。



{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

在自托管模式下运行时，请使用 `--dapr-http-max-request-size` 标志将 Dapr 配置为使用非默认请求正文大小：

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
这告诉 Dapr 将最大请求正文大小设置为 `16` MB。

{{% /codetab %}}


{{% codetab %}}

在Kubernetes中，需要在deployment YAML文件中设置以下注解:
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
- [Dapr Kubernetes pod annotations规范]({{< ref arguments-annotations-overview.md >}})
