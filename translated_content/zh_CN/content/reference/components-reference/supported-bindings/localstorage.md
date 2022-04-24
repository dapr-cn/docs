---
type: docs
title: "本地存储绑定规范"
linkTitle: "本地存储"
description: "关于本地存储绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/localstorage/"
---

## 配置

To set up the Local Storage binding, create a component of type `bindings.localstorage`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


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

| 字段       | 必填 | 绑定支持           | 详情                                                      | 示例              |
| -------- |:--:| -------------- | ------------------------------------------------------- | --------------- |
| rootPath | Y  | Input / Output | The root path anchor to which files can be read / saved | `"/temp/files"` |

## 绑定支持

字段名为 `ttlInSeconds`。

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `list` : [List files](#list-files)
- `delete` ：[删除文件](#delete-file)

### 创建文件

To perform a create file operation, invoke the Local Storage binding with a `POST` method and the following JSON body:

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


##### Save a binary file

To upload a file, encode it as Base64. The binding should automatically detect the Base64 encoding.

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

### Get file

To perform a get file operation, invoke the Local Storage binding with a `POST` method and the following JSON body:

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

The response body contains the value stored in the file.

### List files

To perform a list files operation, invoke the Local Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "list"
}
```

If you only want to list the files beneath a particular directory below the `rootPath`, specify the relative directory name as the `fileName` in the metadata.

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

The response is a JSON array of file names.

### Delete file

To perform a delete file operation, invoke the Local Storage binding with a `POST` method and the following JSON body:

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

An HTTP 204 (No Content) and empty body will be returned if successful.

## 元数据信息

By default the Local Storage output binding auto generates a UUID as the file name. It is configurable in the metadata property of the message.

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
