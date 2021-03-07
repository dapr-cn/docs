---
type: docs
title: "HTTP 绑定规范"
linkTitle: "HTTP"
description: "HTTP 绑定组件的详细文档"
---

## 设置 Dapr 组件

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: http://something.com
```

## Spec metadata fields

| 字段  | Required | Binding support | Details                                     | Example                                                    |
| --- |:--------:| --------------- | ------------------------------------------- | ---------------------------------------------------------- |
| url |    Y     | Output          | The base URL of the HTTP endpoint to invoke | `http://host:port/path`, `http://myservice:8000/customers` |

## 相关链接

This component supports **output binding** with the folowing [HTTP methods/verbs](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html):

- `create` : For backward compatability and treated like a post
- `get` :  Read data/records
- `head` : Identical to get except that the server does not return a response body
- `post` : Typically used to create records or send commands
- `put` : Update data/records
- `patch` : Sometimes used to update a subset of fields of a record
- `delete` : Delete a data/record
- `options` : Requests for information about the communication options available (not commonly used)
- `trace` : Used to invoke a remote, application-layer loop- back of the request message (not commonly used)

### Request

#### Operation metadata fields

All of the operations above support the following metadata fields

| Field    | Required | Details                                                                                               | Example                               |
| -------- |:--------:| ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| path     |    N     | The path to append to the base URL. Used for accessing specific URIs Used for accessing specific URIs | `"/1234"`, `"/search?lastName=Jones"` |
| Headers* |    N     | Any fields that have a capital first letter are sent as request headers                               | `"Content-Type"`, `"Accept"`          |

#### Retrieving data

To retrieve data from the HTTP endpoint, invoke the HTTP binding with a `GET` method and the following JSON body:

```json
{
  "operation": "get"
}
```

Optionally, a path can be specified to interact with resource URIs:

```json
{
  "operation": "get",
  "metadata": {
    "path": "/things/1234"
  }
}
```

### Response

The response body contains the data returned by the HTTP endpoint.  The response body contains the data returned by the HTTP endpoint.  The `data` field contains the HTTP response body as a byte slice (Base64 encoded via curl). The `metadata` field contains: The `metadata` field contains:

| Field      | Required | Details                                                                         | Example                     |
| ---------- |:--------:| ------------------------------------------------------------------------------- | --------------------------- |
| statusCode |    Y     | The [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) | `200`, `404`, `503`         |
| status     |    Y     | The status description                                                          | `"200 OK"`, `"201 Created"` |
| Headers*   |    N     | Any fields that have a capital first letter are sent as request headers         | `"Content-Type"`            |

#### 示例

**Requesting the base URL**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\" }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get" }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

**Requesting a specific path**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\", \"metadata\": { \"path\": \"/things/1234\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get", "metadata": { "path": "/things/1234" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

### Sending and updating data

To send data to the HTTP endpoint, invoke the HTTP binding with a `POST`, `PUT`, or `PATCH` method and the following JSON body:

{{% alert title="Note" color="primary" %}}
Any metadata field that starts with a capital letter is passed as a request header. For example, the default content type is `application/json; charset=utf-8`. This can be overriden be setting the `Content-Type` metadata field. For example, the default content type is `application/json; charset=utf-8`. This can be overriden be setting the `Content-Type` metadata field.
{{% /alert %}}

```json
{
  "operation": "post",
  "data": "content (default is JSON)",
  "metadata": {
    "path": "/things",
    "Content-Type": "application/json; charset=utf-8"
  }
}
```

#### 例子

**Posting a new record**

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"post\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"path\": \"/things\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "post", "data": "YOUR_BASE_64_CONTENT", "metadata": { "path": "/things" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
