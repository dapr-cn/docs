---
type: docs
title: "应用 Open Policy Agent (OPA) 策略"
linkTitle: "Open Policy Agent (OPA)"
description: "通过中间件对传入请求应用 Open Policy Agent (OPA) 策略"
aliases:
- /zh-hans/developing-applications/middleware/supported-middleware/middleware-opa/
---

Open Policy Agent (OPA) [HTTP 中间件]({{< ref middleware.md >}}) 用于对传入的 Dapr HTTP 请求应用 [OPA 策略](https://www.openpolicyagent.org/)。这可以用于在应用程序端点上实施可重用的授权策略。

## 组件格式

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-policy
spec:
  type: middleware.http.opa
  version: v1
  metadata:
    # `includedHeaders` 是一个不区分大小写的逗号分隔的头集合，包含在请求输入中。
    # 默认情况下，请求头不会传递给策略。需要明确指定以接收传入请求头。
    - name: includedHeaders
      value: "x-my-custom-header, x-jwt-header"

    # `defaultStatus` 是拒绝响应时返回的状态码
    - name: defaultStatus
      value: 403

    # `readBody` 控制中间件是否在内存中读取整个请求体并使其可用于策略决策。
    - name: readBody
      value: "false"

    # `rego` 是要评估的 open policy agent 策略。必需
    # 策略包必须命名为 http，策略必须设置 data.http.allow
    - name: rego
      value: |
        package http

        default allow = true

        # Allow 也可以是一个对象并包含其他属性

        # 例如，如果您想在策略失败时重定向，可以将状态码设置为 301 并在响应中设置位置头：
        allow = {
            "status_code": 301,
            "additional_headers": {
                "location": "https://my.site/authorize"
            }
        } {
            not jwt.payload["my-claim"]
        }

        # 您还可以允许请求并向其添加其他头：
        allow = {
            "allow": true,
            "additional_headers": {
                "x-my-claim": my_claim
            }
        } {
            my_claim := jwt.payload["my-claim"]
        }
        jwt = { "payload": payload } {
            auth_header := input.request.headers["Authorization"]
            [_, jwt] := split(auth_header, " ")
            [_, payload, _] := io.jwt.decode(jwt)
        }
```

您可以使用 [官方 OPA playground](https://play.openpolicyagent.org) 来原型和实验策略。例如，[您可以在此处找到上面的示例策略](https://play.openpolicyagent.org/p/oRIDSo6OwE)。

## 规格元数据字段

| 字段  | 详情 | 示例 |
|--------|---------|---------|
| `rego` | Rego 策略语言 | 见上文 |
| `defaultStatus`   | 拒绝响应时返回的状态码 | `"https://accounts.google.com"`，`"https://login.salesforce.com"`
| `readBody`   | 如果设置为 `true`（默认值），则每个请求的主体将完全在内存中读取，并可用于进行策略决策。如果您的策略不依赖于检查请求体，请考虑禁用此功能（设置为 `false`）以显著提高性能。 | `"false"`
| `includedHeaders` | 一个不区分大小写的逗号分隔的头集合，包含在请求输入中。默认情况下，请求头不会传递给策略。需要明确指定以接收传入请求头。 | `"x-my-custom-header, x-jwt-header"`

## Dapr 配置

要应用中间件，必须在 [配置]({{< ref configuration-concept.md >}}) 中引用。请参阅 [中间件管道]({{< ref "middleware.md#customize-processing-pipeline">}})。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: appconfig
spec:
  httpPipeline:
    handlers:
    - name: my-policy
      type: middleware.http.opa
```

## 输入

此中间件提供一个 [`HTTPRequest`](#httprequest) 作为输入。

### HTTPRequest

`HTTPRequest` 输入包含有关传入 HTTP 请求的所有相关信息。

```go
type Input struct {
  request HTTPRequest
}

type HTTPRequest struct {
  // 请求方法（例如 GET,POST 等）
  method string
  // 原始请求路径（例如 "/v2/my-path/"）
  path string
  // 路径分解为部分以便于使用（例如 ["v2", "my-path"]）
  path_parts string[]
  // 原始查询字符串（例如 "?a=1&b=2"）
  raw_query string
  // 查询分解为键及其值
  query map[string][]string
  // 请求头
  // 注意：默认情况下，不包括任何头。您必须指定要通过 `spec.metadata.includedHeaders` 接收的头（见上文）
  headers map[string]string
  // 请求方案（例如 http, https）
  scheme string
  // 请求体（例如 http, https）
  body string
}
```

## 结果

策略必须设置 `data.http.allow`，可以是 `boolean` 值，也可以是具有 `allow` 布尔属性的 `object` 值。`true` 的 `allow` 将允许请求，而 `false` 值将拒绝请求，并使用 `defaultStatus` 指定的状态。以下策略，带有默认值，演示了对所有请求的 `403 - Forbidden`：

```go
package http

default allow = false
```

这与以下相同：

```go
package http

default allow = {
  "allow": false
}
```

### 更改拒绝响应状态码

拒绝请求时，您可以覆盖返回的状态码。例如，如果您想返回 `401` 而不是 `403`，可以执行以下操作：

```go
package http

default allow = {
  "allow": false,
  "status_code": 401
}
```

### 添加响应头

要重定向，请添加头并将 `status_code` 设置为返回结果：

```go
package http

default allow = {
  "allow": false,
  "status_code": 301,
  "additional_headers": {
    "Location": "https://my.redirect.site"
  }
}
```

### 添加请求头

您还可以在允许的请求上设置其他头：

```go
package http

default allow = false

allow = { "allow": true, "additional_headers": { "X-JWT-Payload": payload } } {
  not input.path[0] == "forbidden"
  // 其中 `jwt` 是另一个规则的结果
  payload := base64.encode(json.marshal(jwt.payload))
}
```

### 结果结构

```go
type Result bool
// 或
type Result struct {
  // 是否允许或拒绝传入请求
  allow bool
  // 覆盖拒绝响应状态码；可选
  status_code int
  // 设置允许请求或拒绝响应的头；可选
  additional_headers map[string]string
}
```

## 相关链接

- [Open Policy Agent](https://www.openpolicyagent.org)
- [HTTP API 示例](https://www.openpolicyagent.org/docs/latest/http-api-authorization/)
- [中间件]({{< ref middleware.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概述]({{< ref configuration-overview.md >}})
