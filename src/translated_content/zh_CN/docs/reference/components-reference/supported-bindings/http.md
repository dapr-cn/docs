---
type: docs
title: "HTTP 绑定规范"
linkTitle: "HTTP"
description: "关于 HTTP 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/http/"
---

## 替代方法

[服务调用 API]({{< ref service_invocation_api.md >}}) 允许调用非 Dapr 的 HTTP 端点，并且是推荐的方法。阅读 ["如何：使用 HTTP 调用非 Dapr 端点"]({{< ref howto-invoke-non-dapr-endpoints.md >}}) 以获取更多信息。

## 设置 Dapr 组件

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
      value: "http://something.com"
    #- name: maxResponseBodySize
    #  value: "100Mi" # 可选，最大读取响应数据量
    #- name: MTLSRootCA
    #  value: "/Users/somepath/root.pem" # 可选，根 CA 或 PEM 编码字符串的路径
    #- name: MTLSClientCert
    #  value: "/Users/somepath/client.pem" # 可选，客户端证书或 PEM 编码字符串的路径
    #- name: MTLSClientKey
    #  value: "/Users/somepath/client.key" # 可选，客户端密钥或 PEM 编码字符串的路径
    #- name: MTLSRenegotiation
    #  value: "RenegotiateOnceAsClient" # 可选，选项之一：RenegotiateNever, RenegotiateOnceAsClient, RenegotiateFreelyAsClient
    #- name: securityToken # 可选，<在 HTTP 请求中作为头部包含的令牌>
    #  secretKeyRef:
    #    name: mysecret
    #    key: "mytoken"
    #- name: securityTokenHeader
    #  value: "Authorization: Bearer" # 可选，<安全令牌的头部名称>
    #- name: errorIfNot2XX
    #  value: "false" # 可选
```

## 元数据字段说明

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|--------|---------|
| `url`                | 是 | 输出 | 要调用的 HTTP 端点的基本 URL | `http://host:port/path`, `http://myservice:8000/customers` |
| `maxResponseBodySize`| 否 | 输出 | 要读取的响应的最大长度。整数被解释为字节；可以添加 `Ki, Mi, Gi` (SI) 或 `k | M | G` (十进制) 单位以方便使用。默认值为 `100Mi` | "1Gi", "100Mi", "20Ki", "200" (字节) |
| `MTLSRootCA`         | 否 | 输出 | 根 CA 证书或 PEM 编码字符串的路径 |
| `MTLSClientCert`     | 否 | 输出 | 客户端证书或 PEM 编码字符串的路径  |
| `MTLSClientKey`      | 否 | 输出 | 客户端私钥或 PEM 编码字符串的路径 |
| `MTLSRenegotiation`  | 否 | 输出 | 要使用的 mTLS 重新协商类型 | `RenegotiateOnceAsClient`
| `securityToken`      | 否 | 输出 | 要作为头部添加到 HTTP 请求中的令牌值。与 `securityTokenHeader` 一起使用 |
| `securityTokenHeader` | 否 | 输出 | HTTP 请求中 `securityToken` 的头部名称 |
| `errorIfNot2XX`      | 否 | 输出 | 当响应不在 2xx 范围内时是否抛出绑定错误。默认为 `true` |

**MTLSRootCA**、**MTLSClientCert** 和 **MTLSClientKey** 的值可以通过三种方式提供：

- Secret 存储引用：

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
        secretKeyRef:
          name: mysecret
          key: myrootca
    auth:
      secretStore: <NAME_OF_SECRET_STORE_COMPONENT>
    ```

- 文件路径：可以将文件的绝对路径作为字段的值提供。
- PEM 编码字符串：也可以将 PEM 编码字符串作为字段的值提供。

{{% alert title="注意" color="primary" %}}
元数据字段 **MTLSRootCA**、**MTLSClientCert** 和 **MTLSClientKey** 用于配置 (m)TLS 认证。
使用 mTLS 认证时，必须提供这三个字段。有关更多详细信息，请参阅 [mTLS]({{< ref "#using-mtls-or-enabling-client-tls-authentication-along-with-https" >}})。您也可以仅提供 **MTLSRootCA**，以启用与自定义 CA 签名证书的 **HTTPS** 连接。有关更多详细信息，请参阅 [HTTPS]({{< ref "#install-the-ssl-certificate-in-the-sidecar" >}}) 部分。
{{% /alert %}}

## 绑定支持

此组件支持具有以下 [HTTP 方法/动词](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html) 的 **输出绑定**：

- `create` : 为了向后兼容，视作 post
- `get` : 读取数据/记录
- `head` : 与 get 相同，但服务器不返回响应体
- `post` : 通常用于创建记录或发送命令
- `put` : 更新数据/记录
- `patch` : 有时用于更新记录的部分字段
- `delete` : 删除数据/记录
- `options` : 请求有关可用通信选项的信息（不常用）
- `trace` : 用于调用请求消息的远程应用层回环（不常用）

### 请求

#### 操作元数据字段

上述所有操作都支持以下元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `path`               | 否        | 要附加到基本 URL 的路径。用于访问特定 URI。     | `"/1234"`, `"/search?lastName=Jones"`
| 首字母大写的字段  | 否        | 任何首字母大写的字段都作为请求头发送  | `"Content-Type"`, `"Accept"`

#### 检索数据

要从 HTTP 端点检索数据，请使用 `GET` 方法调用 HTTP 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "get"
}
```

可以选择指定路径以与资源 URI 交互：

```json
{
  "operation": "get",
  "metadata": {
    "path": "/things/1234"
  }
}
```

### 响应

响应体包含 HTTP 端点返回的数据。`data` 字段包含 HTTP 响应体，作为字节切片（通过 curl 进行 Base64 编码）。`metadata` 字段包含：

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `statusCode`         | 是        | [HTTP 状态码](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) | `200`, `404`, `503` |
| `status`             | 是        | 状态描述 | `"200 OK"`, `"201 Created"` |
| 首字母大写的字段           | 否        | 任何首字母大写的字段都作为请求头发送  | `"Content-Type"` |

#### 示例

**请求基本 URL**

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
```sh
curl -d "{ \"operation\": \"get\", \"metadata\": { \"path\": \"/things/1234\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```sh
curl -d '{ "operation": "get", "metadata": { "path": "/things/1234" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

### 发送和更新数据

要向 HTTP 端点发送数据，请使用 `POST`、`PUT` 或 `PATCH` 方法调用 HTTP 绑定，并使用以下 JSON 正文：

{{% alert title="注意" color="primary" %}}
任何以大写字母开头的元数据字段都作为请求头传递。
例如，默认内容类型是 `application/json; charset=utf-8`。可以通过设置 `Content-Type` 元数据字段来覆盖此设置。
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
```sh
curl -d "{ \"operation\": \"post\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"path\": \"/things\" } }" \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{% codetab %}}
```sh
curl -d '{ "operation": "post", "data": "YOUR_BASE_64_CONTENT", "metadata": { "path": "/things" } }' \
      http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```
{{% /codetab %}}

{{< /tabs >}}

## 使用 HTTPS

通过配置 Dapr sidecar 信任服务器的 SSL 证书，HTTP 绑定也可以与 HTTPS 端点一起使用。

1. 将绑定 URL 更新为使用 `https` 而不是 `http`。
1. 如果需要添加自定义 TLS 证书，请参考 [如何：在 Dapr sidecar 中安装证书]({{< ref install-certificates >}})，在 sidecar 中安装 TLS 证书。

### 示例

#### 更新绑定组件

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
    value: https://my-secured-website.com # 使用 HTTPS
```

#### 在 sidecar 中安装 TLS 证书

{{< tabs Self-Hosted Kubernetes >}}

{{% codetab %}}
当 sidecar 未在容器内运行时，可以直接在主机操作系统上安装 TLS 证书。

以下是 sidecar 作为容器运行时的示例。SSL 证书位于主机计算机的 `/tmp/ssl/cert.pem`。

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
        - "/tmp/ssl/:/certificates" # 将证书文件夹挂载到 sidecar 容器的 /certificates
    environment:
      - "SSL_CERT_DIR=/certificates" # 将环境变量设置为证书文件夹的路径
    depends_on:
      - my-app
```

{{% /codetab %}}

{{% codetab %}}

sidecar 可以从多种来源读取 TLS 证书。请参阅 [如何：将 Pod 卷挂载到 Dapr sidecar]({{< ref kubernetes-volume-mounts >}}) 以了解更多信息。在此示例中，我们将 TLS 证书存储为 Kubernetes secret。

```bash
kubectl create secret generic myapp-cert --from-file /tmp/ssl/cert.pem
```

下面的 YAML 是一个 Kubernetes 部署示例，将上述 secret 挂载到 sidecar 并设置 `SSL_CERT_DIR` 以安装证书。

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
        dapr.io/volume-mounts: "cert-vol:/certificates" # 将证书文件夹挂载到 sidecar 容器的 /certificates
        dapr.io/env: "SSL_CERT_DIR=/certificates" # 将环境变量设置为证书文件夹的路径
    spec:
      volumes:
        - name: cert-vol
          secret:
            secretName: myapp-cert
...
```

{{% /codetab %}}

{{< /tabs >}}

#### 安全地调用绑定

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

{{% alert title="注意" color="primary" %}}
HTTPS 绑定支持也可以通过 **MTLSRootCA** 元数据选项进行配置。这将把指定的证书添加到绑定的受信任证书列表中。两种方法没有特定的偏好。虽然 **MTLSRootCA** 选项易于使用且不需要对 sidecar 进行任何更改，但它仅接受一个证书。如果您需要信任多个证书，则需要 [按照上述步骤在 sidecar 中安装它们]({{< ref "#install-the-ssl-certificate-in-the-sidecar" >}})。
{{% /alert %}}

## 使用 mTLS 或启用客户端 TLS 认证以及 HTTPS

您可以通过在绑定组件中提供 `MTLSRootCA`、`MTLSClientCert` 和 `MTLSClientKey` 元数据字段来配置 HTTP 绑定以使用 mTLS 或客户端 TLS 认证以及 HTTPS。

这些字段可以作为文件路径或 pem 编码字符串传递：

- 如果提供了文件路径，则读取文件并使用其内容。
- 如果提供了 PEM 编码字符串，则直接使用该字符串。

当这些字段被配置时，Dapr sidecar 在 TLS 握手过程中使用提供的证书来认证自己。

如果远程服务器强制执行 TLS 重新协商，您还需要设置元数据字段 `MTLSRenegotiation`。此字段接受以下选项之一：

- `RenegotiateNever`
- `RenegotiateOnceAsClient`
- `RenegotiateFreelyAsClient`

有关更多详细信息，请参阅 [Go `RenegotiationSupport` 文档](https://pkg.go.dev/crypto/tls#RenegotiationSupport)。

当服务器需要 mTLS 或客户端 TLS 认证时，可以使用此功能。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
- [如何：在 Dapr sidecar 中安装证书]({{< ref install-certificates >}})