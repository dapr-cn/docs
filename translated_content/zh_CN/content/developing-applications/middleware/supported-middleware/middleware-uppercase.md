---
type: docs
title: "大写请求实体"
linkTitle: "Uppercase"
weight: 9999
description: "测试您的 HTTP 管道与大写中间件一起运行"
---

大写 [HTTP midleware]({{< ref middleware-concept.md >}}) 将请求的正文转换为大写字母，并用于测试管道正在起作用。 它只应用于本地开发。

## 配置

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

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中进行引用。 请参阅[中间件管道]({{< ref "middleware-concept.md#customize-processing-pipeline">}})。

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

- [中间件概念]({{< ref middleware-concept.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
