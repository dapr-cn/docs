---
type: docs
title: "RouterChecker http request routing"
linkTitle: "RouterChecker"
description: "Use routerchecker middleware to block invalid http request routing"
aliases:
  - /zh-hans/developing-applications/middleware/supported-middleware/middleware-routerchecker/
---

The RouterChecker HTTP [middleware]({{< ref middleware.md >}}) component leverages regexp to check the validity of HTTP request routing to prevent invalid routers from entering the Dapr cluster. In turn, filtering out bad requests, and reducing noise in the telemetry and log data.

## 配置

The RouterChecker applies a set of rules to the incoming HTTP request. You define these rules in the component metadata using regular expressions. In the following example, the HTTP request RouterChecker is set to validate all requests message against the `^[A-Za-z0-9/._-]+$`: regex.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: routerchecker 
spec:
  type: middleware.http.routerchecker
  version: v1
  metadata:
  - name: rule
    value: "^[A-Za-z0-9/._-]+$"
```

In this example, the above definition would result in the following PASS/FAIL cases:

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

| 字段   | 详情                                                                 | 示例                   |
| ---- | ------------------------------------------------------------------ | -------------------- |
| rule | the regexp expression to be used by the HTTP request RouterChecker | `^[A-Za-z0-9/._-]+$` |

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
