---
type: docs
title: "操作方法：处理较大的 http 标头"
linkTitle: "HTTP header size"
weight: 6000
description: "配置更大的 http 读缓冲区大小"
---

Dapr 的 http 标头都缓冲区大小默认限制为 4KB。  当发送大于默认 4KB 的 http 标头时，您可以增加此值。 否则，您可能会遇到 `Too big request header` 的服务调用错误 您可以使用 `dapr.io/http-read-buffer-size` 注解或 CLI 的 `-dapr-http-read-buffer-size` 标志来更改 http 标头大小。



{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

在自托管模式下运行时，请使用 `--dapr-http-read-buffer-size` 标志来配置 Dapr 以使用非默认的 http 标头大小：

```bash
dapr run --dapr-http-read-buffer-size 16 node app.js
```
这告诉 Dapr 将最大读缓冲区大小这是为 `16` KB。

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
        dapr.io/http-read-buffer-size: "16"
...
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
- [Dapr Kubernetes pod annotations规范]({{< ref arguments-annotations-overview.md >}})
