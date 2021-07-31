---
type: docs
title: "How-To: Handle large http body requests"
linkTitle: "Http request body size"
weight: 6000
description: "Configure http requests that are bigger than 4 MB"
---

By default Dapr has a limit for the request body size which is set to 4 MB, however you can change this by defining `dapr.io/http-max-request-size` annotation or `--dapr-http-max-request-size` flag.



{{< tabs Self-hosted Kubernetes >}}

{{% codetab %}}

When running in self hosted mode, use the `--dapr-http-max-request-size` flag to configure Dapr to use non-default request body size:

```bash
dapr run --dapr-http-max-request-size 16 node app.js
```
This tells Dapr to set maximum request body size to `16` MB.

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
