---
type: docs
title: "本地存储绑定规范"
linkTitle: "本地存储"
description: "关于本地存储绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/localstorage/"
---

## 组件格式

要配置本地存储绑定，创建一个类型为 `bindings.localstorage` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})以了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.localstorage
  version: v1
  metadata:
  - name: rootPath
    value: "<string>"
```

## 元数据字段规范

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|---------|---------|
| `rootPath` | Y | 输出 | 文件可读写的根路径 | `"/temp/files"` |

## 绑定支持

此组件支持**输出绑定**，具有以下操作：

- `create` : [创建文件](#create-file)
- `get` : [获取文件](#get-file)
- `list` : [列出文件](#list-files)
- `delete` : [删除文件](#delete-file)

### 创建文件

要执行创建文件操作，使用 `POST` 方法调用本地存储绑定，并使用以下 JSON 正文：

> 注意：默认情况下，会生成一个随机的 UUID 作为文件名。请参阅下文的元数据支持以设置自定义文件名。

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例

##### 将文本保存到随机生成的 UUID 文件

{{< tabs Windows Linux >}}
  {{% codetab %}}
  在 Windows 上，使用 cmd 提示符（PowerShell 有不同的转义机制）
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

##### 将文本保存到特定文件

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

要上传文件，请将其编码为 Base64。绑定会自动检测 Base64 编码。

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

响应正文将包含以下 JSON：

```json
{
   "fileName": "<filename>"
}

```

### 获取文件

要执行获取文件操作，使用 `POST` 方法调用本地存储绑定，并使用以下 JSON 正文：

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

响应正文包含存储在文件中的值。

### 列出文件

要执行列出文件操作，使用 `POST` 方法调用本地存储绑定，并使用以下 JSON 正文：

```json
{
  "operation": "list"
}
```

如果您只想列出 `rootPath` 下特定目录中的文件，请在元数据中指定相对目录名称作为 `fileName`。

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

响应是一个文件名的 JSON 数组。

### 删除文件

要执行删除文件操作，使用 `POST` 方法调用本地存储绑定，并使用以下 JSON 正文：

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

如果成功，将返回 HTTP 204（无内容）和空正文。

## 元数据信息

默认情况下，本地存储输出绑定会自动生成一个 UUID 作为文件名。您可以在消息的元数据属性中自定义文件名。

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
