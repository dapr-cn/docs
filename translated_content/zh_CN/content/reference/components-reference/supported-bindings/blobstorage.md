---
type: docs
title: "Azure Blob Storage绑定规范"
linkTitle: "Azure Blob Storage"
description: "关于 Azure Blob Storage绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/blobstorage/"
---

## 配置

要设置 Azure Blob Storage 绑定，请创建一个类型为 `bindings.azure.blobstorage` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: <bool>
  - name: getBlobRetryCount
    value: <integer>
```
{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                | 必填 | 绑定支持 | 详情                                                                                                          | 示例                     |
| ----------------- |:--:| ---- | ----------------------------------------------------------------------------------------------------------- | ---------------------- |
| storageAccount    | Y  | 输出   | Blob Storage 账户名称                                                                                           | `"myexmapleaccount"`   |
| storageAccessKey  | Y  | 输出   | Blob Storage 访问密钥                                                                                           | `"access-key"`         |
| container         | Y  | 输出   | 要写入的Blob Storage容器名称                                                                                        | `"myexamplecontainer"` |
| decodeBase64      | N  | 输出   | 配置在保存到Blob Storage之前对base64文件内容进行解码。 (保存有二进制内容的文件时)。 `"true"`是唯一允许的正值。 其他正值，如`"True"`是不可接受的。 默认值为 `"false"` | `"true"`, `"false"`    |
| getBlobRetryCount | N  | 输出   | 指定从 RetryReader 读取时，将进行的 HTTP GET 请求的最大次数 默认为 `"10"`。                                                       | `"1"`, `"2"`           |


## 绑定支持

字段名为 `ttlInSeconds`。

- `create` : [创建blob](#create-blob)
- `get` : [获取blob](#get-blob)
- `delete` : [Delete blob](#delete-blob)

### 创建blob

要执行创建 blob 操作，请使用 `POST` 方法和以下 JSON 调用 Azure Blob Storage绑定。

> 注意：默认情况下，会随机生成一个UUID。 参见下面所示的支持的元数据设置名称

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例


##### 保存到一个随机生成的UUID blob

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

##### 保存文本到指定blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"blobName\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "blobName": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}


##### 保存文件到blob

要上传一个文件，将其编码为Base64，并让绑定知道要对它进行反序列化：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.azure.blobstorage
  version: v1
  metadata:
  - name: storageAccount
    value: myStorageAccountName
  - name: storageAccessKey
    value: ***********
  - name: container
    value: container1
  - name: decodeBase64
    value: "true"
```

然后你就可以像平常一样上传了：

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"create\", \"data\": \"YOUR_BASE_64_CONTENT\", \"metadata\": { \"blobName\": \"my-test-file.jpg\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "YOUR_BASE_64_CONTENT", "metadata": { "blobName": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应体将包含以下JSON：

```json
{
   "blobURL": "https://<your account name>. {
   "blobURL": "https://<your account name>. blob.core.windows.net/<your container name>/<filename>"
}

```

### 获取blob

要执行获取blob操作，请使用`POST`方法和以下JSON体调用Azure Blob Storage绑定:

```json
{
  "operation": "get",
  "metadata": {
    "blobName": "myblob"
  }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应体包含存储在blob对象中的值。

### Delete blob

To perform a delete blob operation, invoke the Azure Blob Storage binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "blobName": "myblob"
  }
}
```

#### 示例

##### Delete blob

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Delete blob snapshots only

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"DeleteSnapshotOptions\": \"only\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "DeleteSnapshotOptions": "only" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

##### Delete blob including snapshots

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"blobName\": \"myblob\", \"DeleteSnapshotOptions\": \"include\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "blobName": "myblob", "DeleteSnapshotOptions": "include" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

An HTTP 204 (No Content) and empty body will be retuned if successful.

## 元数据信息

默认情况下，Azure Blob Storage 输出绑定会自动生成一个 UUID 作为 blob 文件名，并且不会为其分配任何系统或自定义元数据。 它可以在消息的元数据属性中配置（都是可选的）。

应用程序发布到 Azure Blob Storage 输出绑定时，应发送格式如下的消息。

```json
{
    "data": "file content",
    "metadata": {
        "blobName"           : "filename.txt",
        "ContentType"        : "text/plain",
        "ContentMD5"         : "vZGKbMRDAnMs4BIwlXaRvQ==",
        "ContentEncoding"    : "UTF-8",
        "ContentLanguage"    : "en-us",
        "ContentDisposition" : "attachment",
        "CacheControl"       : "no-cache",
        "Custom"             : "hello-world",
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
