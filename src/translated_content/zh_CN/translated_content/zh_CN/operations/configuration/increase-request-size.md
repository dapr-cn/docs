---
type: docs
title: "指南：处理大型 http 正文请求"
linkTitle: "HTTP request body size"
weight: 6000
description: "配置大于 4 MB 的 http 请求"
---

By default Dapr has a limit for the request body size which is set to 4 MB, however you can change this by defining `dapr.io/http-max-request-size` annotation or `--dapr-http-max-request-size` flag.



{{< tabs 自托管 Kubernetes >}}

{{% codetab %}}

在自托管模式下运行时，请使用 `--dapr-http-max-request-size` 参数将 Dapr 配置为使用非默认请求正文大小：

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
- [Dapr Kubernetes pod annotations 规范]({{< ref arguments-annotations-overview.md >}})
