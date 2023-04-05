---
type: docs
title: "大写请求实体"
linkTitle: "大写"
description: "Test your HTTP pipeline is functioning with the uppercase middleware"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-uppercase/
---

The uppercase [HTTP middleware]({{< ref middleware.md >}}) converts the body of the request to uppercase letters and is used for testing that the pipeline is functioning. It should only be used for local development.

## Component format

在下述定义中，将请求体的内容变成大写：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: uppercase
spec:
  type: middleware.http.uppercase
  version: v1
```

此组件没有要配置的 `metadata`。

## Dapr 配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware.md#customize-processing-pipeline">}}).

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: uppercase
      type: middleware.http.uppercase
```

## 相关链接

- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
