---
type: docs
title: "本地存储绑定规范"
linkTitle: "本地存储"
description: "关于本地存储绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/localstorage/"
---

## 配置

需要创建一个类型为`bindings.localstorage`的组件来设置本地存储绑定。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.localstorage
  version: v1
  metadata:
  - name: rootPath
    value: <string>
```

## 元数据字段规范

| 字段       | 必填 | 绑定支持  | 详情             | 示例              |
| -------- |:--:| ----- | -------------- | --------------- |
| rootPath | 是  | 输入/输出 | 可以 读/保存 文件的根目录 | `"/temp/files"` |

## 绑定支持

该组件支持如下操作的**输出绑定** ：

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `list` : [List files](#list-files)
- `delete` ：[删除文件](#delete-file)

### 创建文件

使用发送如下JSON结构数据的 `POST`方法，调用本地存储绑定去演示如何创建一个文件操作：

> 注意：默认情况下，会随机生成一个UUID。 参见下面所示的支持的元数据设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例


##### 把文本保存到一个随机生成的 UUID 文件

{{< tabs Windows Linux >}}
  {{% codetab %}}
  在Windows上，使用cmd提示符（PowerShell有不同的转义机制）。
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### 将文本保存到指定文件

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"fileName\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "fileName": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}


##### 保存二进制文件

要上传文件，需要将其使用Base64编码。 绑定应该能够自动检测Base64编码。

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"fileName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "fileName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应体将包含以下JSON：

```json
{
   "fileName": "<filename>"
}

```

### 获取文件

使用发送如下JSON结构数据的`POST`方法，调用本地存储绑定去演示获取文件操作：

```json
{
  "operation": "get",
  "metadata": {
    "fileName": "myfile"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"fileName\": \"myfile\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "fileName": "myfile" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文包含文件中存储的值。

### List files

通过使用发送如下JSON结构数据 `POST` 方法调用本地存储绑定去演示获取文件列表操作：

```json
{
  "operation": "list"
}
```

如果你想获取在`rootPath`下某个特定目录里的文件列表，可以在元数据`fileName`字段中指定相对路径的目录名

```json
{
  "operation": "list",
  "metadata": {
    "fileName": "my/cool/directory"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"list\", \"metadata\": { \"fileName\": \"my/cool/directory\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "list", "metadata": { "fileName": "my/cool/directory" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文是一个文件名的JOSN数组。

### 删除文件

通过发送如下JOSN结构数据的 `POST` 方法调用本地存储绑定，演示如何删除一个文件操作：

```json
{
  "operation": "delete",
  "metadata": {
    "fileName": "myfile"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"fileName\": \"myfile\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "fileName": "myfile" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

请求成功，将返回HTTP 204状态码(无内容) 和空报文

## 元数据信息

默认，本地存储输出绑定自动生成一个UUID作为文件名。 它可以在消息的元数据属性中进行配置。

```json
{
    "data": "file content",
    "metadata": {
        "fileName": "filename.txt"
    },
    "operation": "create"
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
