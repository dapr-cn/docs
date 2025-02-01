---
type: docs
title: "将请求体转换为大写"
linkTitle: "大写"
description: "测试您的HTTP管道是否正常工作，使用大写中间件"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-uppercase/
---

大写[HTTP中间件]({{< ref middleware.md >}})用于将请求体的内容转换为大写字母。它主要用于测试管道的正常运行，仅在本地开发环境中使用。

## 组件格式

在以下定义中，该中间件将请求体的内容转换为大写：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: uppercase
spec:
  type: middleware.http.uppercase
  version: v1
```

此组件没有可配置的`metadata`选项。

## Dapr配置

要使用此中间件，必须在[配置]({{< ref configuration-concept.md >}})中进行设置。请参阅[中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})以获取更多信息。

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
