---
type: docs
title: "操作指南：处理大型HTTP头部大小"
linkTitle: "HTTP头部大小"
weight: 6000
description: "配置更大的HTTP读取缓冲区大小"
---

Dapr的HTTP头部读取缓冲区大小默认限制为4KB。如果您发送的HTTP头部超过4KB，可能会遇到`请求头部过大`的服务调用错误。

您可以通过以下方法增加HTTP头部大小：
- 使用`dapr.io/http-read-buffer-size`注解，或
- 在使用CLI时添加`--dapr-http-read-buffer-size`标志。

{{< tabs Self-hosted Kubernetes >}}

<!--Self-hosted-->
{{% codetab %}}

在自托管模式下运行时，使用`--dapr-http-read-buffer-size`标志来配置Dapr，以便使用非默认的HTTP头部大小：

```bash
dapr run --dapr-http-read-buffer-size 16 node app.js
```
这会将Dapr的最大读取缓冲区大小设置为`16` KB。

{{% /codetab %}}

<!--Kubernetes-->
{{% codetab %}}

在Kubernetes上，您可以在部署的YAML文件中设置以下注解：

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
#...
```

{{% /codetab %}}

{{< /tabs >}}

## 相关链接
[Dapr Kubernetes pod注解规范]({{< ref arguments-annotations-overview.md >}})

## 下一步

{{< button text="处理大型HTTP主体请求" page="increase-request-size" >}}