---
type: docs
title: "应用开放策略代理 (OPA) 策略"
linkTitle: "开放策略代理 (OPA)"
weight: 6000
description: "使用中间件对传入的请求应用开放策略代理（OPA）策略。"
---

The Open Policy Agent (OPA) [HTTP middleware]({{< ref middleware-concept.md >}}) applys [OPA Policies](https://www.openpolicyagent.org/) to incoming Dapr HTTP requests. 这可以用来将可重用的授权策略应用到应用终结点。

## 配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: my-policy
  namespace: default
spec:
  type: middleware.http.opa
  version: v1
  metadata:
    # `includedHeaders` is a comma-separated set of case-insensitive headers to include in the request input.
    # Request headers are not passed to the policy by default. Include to receive incoming request headers in
    # the input
    - name: includedHeaders
      value: "x-my-custom-header, x-jwt-header"

    # `defaultStatus` is the status code to return for denied responses
    - name: defaultStatus
      value: 403

    # `rego` is the open policy agent policy to evaluate. required
    # The policy package must be http and the policy must set data.http.allow
    - name: rego
      value: |
        package http

        default allow = true

        # Allow may also be an object and include other properties

        # For example, if you wanted to redirect on a policy failure, you could set the status code to 301 and set the location header on the response:
        allow = {
            "status_code": 301,
            "additional_headers": {
                "location": "https://my.site/authorize"
            }
        } {
            not jwt.payload["my-claim"]
        }

        # You can also allow the request and add additional headers to it:
        allow = {
            "allow": true,
            "additional_headers": {
                "x-my-claim": my_claim
            }
        } {
            my_claim := jwt.payload["my-claim"]
        }
        jwt = { "payload": payload } {
            auth_header := input.request.headers["authorization"]
            [_, jwt] := split(auth_header, " ")
            [_, payload, _] := io.jwt.decode(jwt)
        }
```

您可以使用 [官方 opa playground](https://play.openpolicyagent.org)对策略进行原型设计和实验。 例如，[您可以在这里找到上面的示例策略](https://play.openpolicyagent.org/p/oRIDSo6OwE)。

## 元数据字段规范

| 字段              | 详情                                                             | Example                                                           |
| --------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| rego            | Rego策略语言                                                       | 见上文                                                               |
| defaultStatus   | 状态码返回拒绝的响应                                                     | `"https://accounts.google.com"`, `"https://login.salesforce.com"` |
| includedHeaders | 一组以逗号分隔的不区分大小写的头信息，包含在请求输入中。 默认情况下，请求头不会传递给策略。 在输入中包含接收传入的请求头。 | `"x-my-custom-header, x-jwt-header"`                              |

## Dapr配置

To be applied, the middleware must be referenced in [configuration]({{< ref configuration-concept.md >}}). See [middleware pipelines]({{< ref "middleware-concept.md#customize-processing-pipeline">}}).

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

这个中间件提供了一个 [`HTTPRequest`](#httprequest) 作为输入。

### HTTP请求

`HTTPRequest` 输入包含所有关于传入HTTP请求的透彻信息，但它的正文除外。

```go
type Input struct {
  request HTTPRequest
}

type HTTPRequest struct {
  // The request method (e.g. GET,POST,etc...)
  method string
  // The raw request path (e.g. "/v2/my-path/")
  path string
  // The path broken down into parts for easy consumption (e.g. ["v2", "my-path"])
  path_parts string[]
  // The raw query string (e.g. "?a=1&b=2")
  raw_query string
  // The query broken down into keys and their values
  query map[string][]string
  // The request headers
  // NOTE: By default, no headers are included. You must specify what headers
  // you want to receive via `spec.metadata.includedHeaders` (see above)
  headers map[string]string
  // The request scheme (e.g. http, https)
  scheme string
}
  method string
  // The raw request path (e.g. "/v2/my-path/")
  path string
  // The path broken down into parts for easy consumption (e.g. ["v2", "my-path"])
  path_parts string[]
  // The raw query string (e.g. "?a=1&b=2")
  raw_query string
  // The query broken down into keys and their values
  query map[string][]string
  // The request headers
  // NOTE: By default, no headers are included. You must specify what headers
  // you want to receive via `spec.metadata.includedHeaders` (see above)
  headers map[string]string
  // The request scheme (e.g. http, https)
  scheme string
}
```

## 结果

策略必须设置 `data.http.allow` 带有 `boolean` 值或者一个 `object` 值与一个 `allow` 布尔属性。 `true` `allow` 将允许请求 当一个 `false` 值将以 `defaultStatus` 指定的状态拒绝请求。 下面的策略，在默认情况下，演示了对所有请求的 `403 - Forbidden`:

```go
package http

default allow = false
```

等价于：

```go
package http

default allow = {
  "allow": false
}
```

### 更改拒绝的响应状态代码

拒绝请求时，您可以覆盖返回的状态代码。 例如，如果您想退回 `401` 而不是 `403`，你可以这样做：

```go
package http

default allow = {
  "allow": false,
  "status_code": 401
}
```

### 添加响应头

若要重定向，添加消息头并将 `status_code` 设置为返回的结果：

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

你也可以在允许的请求上设置额外的头信息：

```go
package http

default allow = false

allow = { "allow": true, "additional_headers": { "X-JWT-Payload": payload } } {
  not input.path[0] == "forbidden"
  // Where `jwt` is the result of another rule
  payload := base64.encode(json.marshal(jwt.payload))
}
```

### 结果结构
```go
type Result bool
// or
type Result struct {
  // Whether to allow or deny the incoming request
  allow bool
  // Overrides denied response status code; Optional
  status_code int
  // Sets headers on allowed request or denied response; Optional
  additional_headers map[string]string
}
```

## 相关链接

- [Open Policy Agent](https://www.openpolicyagent.org)
- [HTTP API 示例](https://www.openpolicyagent.org/docs/latest/http-api-authorization/)
- [中间件概念]({{< ref middleware-concept.md >}})
- [配置概念]({{< ref configuration-concept.md >}})
- [配置概览]({{< ref configuration-overview.md >}})
