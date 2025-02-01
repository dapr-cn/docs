---
type: docs
title: "操作指南：如何处理大容量 HTTP 请求体"
linkTitle: "HTTP 请求体配置"
weight: 6000
description: "如何配置超过 4 MB 的 HTTP 请求体"
---

Dapr 默认限制请求体大小为 4MB。您可以通过以下方法更改此限制：
- 使用 `dapr.io/http-max-request-size` 注解，或
- 使用 `--dapr-http-max-request-size` 参数。

{{< tabs 自托管模式 Kubernetes 模式 >}}

<!--自托管模式-->
{{% codetab %}}

在自托管模式下运行时，使用 `--dapr-http-max-request-size` 参数来设置 Dapr 的请求体大小限制：

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
这将把 Dapr 的最大请求体大小设置为 `16` MB。

{{% /codetab %}}

<!--Kubernetes 模式-->
{{% codetab %}}

在 Kubernetes 中，您可以在部署的 YAML 文件中添加以下注解：

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
#...
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接

[Dapr Kubernetes pod 注解规范]({{< ref arguments-annotations-overview.md >}})

## 下一步

{{< button text="安装 Sidecar 证书" page="install-certificates" >}}
