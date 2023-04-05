---
type: docs
title: "HTTP 绑定规范"
linkTitle: "HTTP"
description: "HTTP 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/http/"
---

## Setup Dapr component

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.http
  version: v1
  metadata:
  - name: url
    value: http://something.com
  - name: MTLSRootCA
    value: /Users/somepath/root.pem # OPTIONAL <path to root CA> or <pem encoded string>
  - name: MTLSClientCert
    value: /Users/somepath/client.pem # OPTIONAL <path to client cert> or <pem encoded string>
  - name: MTLSClientKey
    value: /Users/somepath/client.key # OPTIONAL <path to client key> or <pem encoded string>
  - name: securityToken # OPTIONAL <token to include as a header on HTTP requests>
    secretKeyRef:
      name: mysecret
      key: mytoken
  - name: securityTokenHeader
    value: "Authorization: Bearer" # OPTIONAL <header name for the security token>
```

## 元数据字段规范

| Field               | 必填 | 绑定支持   | 详情                                                                                                        | 示例                                                         |
| ------------------- |:--:| ------ | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| url                 | 是  | Output | The base URL of the HTTP endpoint to invoke                                                               | `http://host:port/path`, `http://myservice:8000/customers` |
| MTLSRootCA          | 否  | Output | Path to root ca certificate or pem encoded string                                                         |                                                            |
| MTLSClientCert      | 否  | Output | Path to client certificate or pem encoded string                                                          |                                                            |
| MTLSClientKey       | 否  | Output | Path client private key or pem encoded string                                                             |                                                            |
| securityToken       | 否  | Output | The value of a token to be added to an HTTP request as a header. Used together with `securityTokenHeader` |                                                            |
| securityTokenHeader | 否  | Output | The name of the header for `securityToken` on an HTTP request that                                        |                                                            |

## 绑定支持

This component supports **output binding** with the following [HTTP methods/verbs](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html):

- `create` : For backward compatibility and treated like a post
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

以上所有操作都支持以下元数据字段

| Field    | 必填 | 详情                                                                   | 示例                                    |
| -------- |:--:| -------------------------------------------------------------------- | ------------------------------------- |
| path     | 否  | The path to append to the base URL. Used for accessing specific URIs | `"/1234"`, `"/search?lastName=Jones"` |
| Headers* | 否  | 任何第一字母为大写字母的字段均作为请求头发送                                               | `"Content-Type"`, `"Accept"`          |

#### 检索数据

要从 HTTP 终结点检索数据，请使用 `GET` 方法和以下 JSON 的 HTTP 绑定：

```json
{
  "operation": "get"
}
```

可以指定 URI ：

```json
{
  "operation": "get",
  "metadata": {
    "path": "/things/1234"
  }
}
```

### 响应

响应正文包含 HTTP 终结点返回的数据。  `data` 字段包含一个 HTTP 响应实体作为字节数组(通过curl Base64 编码). `metadata` 字段含有：

| Field      | 必填 | 详情                                                                              | 示例                          |
| ---------- |:--:| ------------------------------------------------------------------------------- | --------------------------- |
| statusCode | 是  | The [HTTP status code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) | `200`, `404`, `503`         |
| status     | 是  | 状态说明                                                                            | `"200 OK"`, `"201 Created"` |
| Headers*   | 否  | 任何第一字母为大写字母的字段均作为请求头发送                                                          | `"Content-Type"`            |

#### 示例

**请求 base URL**

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

**请求特定路径**

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

### 发送和更新数据

要将数据发送到 HTTP 终结点，请调用带有 `POST`的 HTTP 绑定， `PUT`，或 `PATCH` 方法和以下 JSON 正文：

{{% alert title="Note" color="primary" %}}
以大写字母开头的任何元数据字段都作为请求头传递。 例如，默认 content type 是 `application/json; charset=utf-8`. 这个值可以被元数据的`Content-Type`字段设置的值所覆盖。
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

#### 示例

**发布新记录**

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

## Using HTTPS

The HTTP binding can also be used with HTTPS endpoints by configuring the Dapr sidecar to trust the server's SSL certificate.


1. Update the binding URL to use `https` instead of `http`.
1. Refer [How-To: Install certificates in the Dapr sidecar]({{< ref install-certificates >}}), to install the SSL certificate in the sidecar.

### 示例

#### Update the binding component

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
    value: https://my-secured-website.com # Use HTTPS
```

#### Install the SSL certificate in the sidecar


{{< tabs Self-Hosted Kubernetes >}}

{{% codetab %}}
When the sidecar is not running inside a container, the SSL certificate can be directly installed on the host operating system.

Below is an example when the sidecar is running as a container. The SSL certificate is located on the host computer at `/tmp/ssl/cert.pem`.

```yaml
version: '3'
services:
  my-app:
    # ...
  dapr-sidecar:
    image: "daprio/daprd:1.8.0"
    command: [
      "./daprd",
     "-app-id", "myapp",
     "-app-port", "3000",
     ]
    volumes:
        - "./components/:/components"
        - "/tmp/ssl/:/certificates" # Mount the certificates folder to the sidecar container at /certificates
    environment:
      - "SSL_CERT_DIR=/certificates" # Set the environment variable to the path of the certificates folder
    depends_on:
      - my-app
```

{{% /codetab %}}

{{% codetab %}}

The sidecar can read the SSL certificate from a variety of sources. See [How-to: Mount Pod volumes to the Dapr sidecar]({{< ref kubernetes-volume-mounts >}}) for more. In this example, we store the SSL certificate as a Kubernetes secret.

```bash
kubectl create secret generic myapp-cert --from-file /tmp/ssl/cert.pem
```

The YAML below is an example of the Kubernetes deployment that mounts the above secret to the sidecar and sets `SSL_CERT_DIR` to install the certificates.

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
        dapr.io/volume-mounts: "cert-vol:/certificates" # Mount the certificates folder to the sidecar container at /certificates
        dapr.io/env: "SSL_CERT_DIR=/certificates" # Set the environment variable to the path of the certificates folder
    spec:
      volumes:
        - name: cert-vol
          secret:
            secretName: myapp-cert
...
```

{{% /codetab %}}

{{< /tabs >}}

#### Invoke the binding securely

{{< tabs Windows Linux >}}

{{% codetab %}}
```bash
curl -d "{ \"operation\": \"get\" }" \
      https://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```bash
curl -d '{ "operation": "get" }' \
      https://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

## Using mTLS or enabling client TLS authentication along with HTTPS
You can configure the HTTP binding to use mTLS or client TLS authentication along with HTTPS by providing the `MTLSRootCA`, `MTLSClientCert`, and `MTLSClientKey` metadata fields in the binding component.

These fields can be passed as a file path or as a pem encoded string.
- If the file path is provided, the file is read and the contents are used.
- If the pem encoded string is provided, the string is used as is. When these fields are configured, the Dapr sidecar uses the provided certificate to authenticate itself with the server during the TLS handshake process.

### When to use:
You can use this when the server with which the HTTP binding is configured to communicate requires mTLS or client TLS authentication.


## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [How-To: Install certificates in the Dapr sidecar]({{< ref install-certificates >}})
