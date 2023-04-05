---
type: docs
title: "RouterChecker http请求路由"
linkTitle: "RouterChecker"
description: "使用routerchecker中间件拦截无效的http请求路由"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-routerchecker/
---

RouterChecker HTTP[middleware]({{< ref middleware.md >}}) 组件利用正则表达式去检查HTTP请求路由的有效性，防止无效路由进入Dapr集群。 反过来，RouterChecker 组件过滤掉错误请求并减少遥测和日志数据中的噪音。

## 配置

RouterChecker 将一组规则应用于传入的 HTTP 请求。 您可以使用正则表达式在组件元数据中定义这些规则。 在以下示例中，HTTP 请求 RouterChecker 设置为针对 `^[A-Za-z0-9/._-]+$`：正则表达式验证所有请求消息。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routerchecker 
spec:
  type: middleware.http.routerchecker
  version: v1gi
  metadata:
  - name: rule
    value: "^[A-Za-z0-9/._-]+$"
```

在此示例中，上述定义将导致以下 PASS/FAIL 情况：

```shell
PASS /v1.0/invoke/demo/method/method
PASS /v1.0/invoke/demo.default/method/method
PASS /v1.0/invoke/demo.default/method/01
PASS /v1.0/invoke/demo.default/method/METHOD
PASS /v1.0/invoke/demo.default/method/user/info
PASS /v1.0/invoke/demo.default/method/user_info
PASS /v1.0/invoke/demo.default/method/user-info

FAIL /v1.0/invoke/demo.default/method/cat password
FAIL /v1.0/invoke/demo.default/method/" AND 4210=4210 limit 1
FAIL /v1.0/invoke/demo.default/method/"$(curl
```

## 元数据字段规范

| 字段   | 详情                             | 示例                   |
| ---- | ------------------------------ | -------------------- |
| rule | hTTP 请求 RouterChecker 使用的正则表达式 | `^[A-Za-z0-9/._-]+$` |

## Dapr配置

要应用中间件，必须在[配置]({{< ref configuration-concept.md >}})中引用中间件。 参考[中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: routerchecker 
      type: middleware.http.routerchecker
```

## 相关链接

- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})