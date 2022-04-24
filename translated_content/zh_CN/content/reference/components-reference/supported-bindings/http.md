---
type: docs
title: "HTTP 绑定规范"
linkTitle: "HTTP"
description: "HTTP 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/http/"
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

## 元数据字段规范

| 字段  | 必填 | 绑定支持 | 详情                     | 示例                                                         |
| --- |:--:| ---- | ---------------------- | ---------------------------------------------------------- |
| url | Y  | 输出   | 要调用的 HTTP 终点的 base URL | `http://host:port/path`, `http://myservice:8000/customers` |

## 绑定支持

此组件支持以下 [HTTP methods/verbs](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html) **输出绑定** ：

- `create` : 为了向后的兼容，并被当作一个 post 请求处理
- `get` : 读数据或者记录
- `head` : 连接服务器但不返回响应正文
- `post` ： 通常用于创建记录或发送命令
- `put` ： 更新数据或者记录
- `patch` ： 有时用于更新记录的字段子集
- `删除` : 删除数据或者记录
- `options` : 请求提供关于可用通信选项的信息(不常用)
- `trace` ：用于调用请求消息的远程应用程序层回路（不常用）

### 请求

#### 请求格式

以上所有操作都支持以下元数据字段

| 字段       | 必填 | 详情                          | 示例                                    |
| -------- |:--:| --------------------------- | ------------------------------------- |
| path     | 否  | 追加到 base URL的路径。 用于访问特定的URI | `"/1234"`, `"/search?lastName=Jones"` |
| Headers* | 否  | 任何第一字母为大写字母的字段均作为请求头发送      | `"Content-Type"`, `"Accept"`          |

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

| 字段         | 必填 | 详情                                                                   | 示例                          |
| ---------- |:--:| -------------------------------------------------------------------- | --------------------------- |
| statusCode | Y  | [HTTP 状态代码](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html) | `200`, `404`, `503`         |
| status     | Y  | 状态说明                                                                 | `"200 OK"`, `"201 Created"` |
| Headers*   | 否  | 任何第一字母为大写字母的字段均作为请求头发送                                               | `"Content-Type"`            |

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
以大写字母开头的任何元数据字段都作为请求头传递。 例如，默认 content type 是 `application/json; charset=utf-8`. This can be overridden be setting the `Content-Type` metadata field.
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

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
