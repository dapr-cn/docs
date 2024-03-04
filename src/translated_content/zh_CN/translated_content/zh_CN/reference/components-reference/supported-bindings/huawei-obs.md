---
type: docs
title: "Huawei OBS binding spec"
linkTitle: "Huawei OBS"
description: "Detailed documentation on the Huawei OBS binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/huawei-obs/"
---

## Component format

To setup Huawei Object Storage Service (OBS) (output) binding create a component of type `bindings.huawei.obs`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.huawei.obs
  version: v1
  - name: bucket
    value: "<your-bucket-name>"
  - name: endpoint
    value: "<obs-bucket-endpoint>"
  - name: accessKey
    value: "<your-access-key>"
  - name: secretKey
    value: "<your-secret-key>"
  # optional fields
  - name: region
    value: "<your-bucket-region>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field       | Required | 绑定支持   | 详情                                                 | 示例                                   |
| ----------- |:--------:| ------ | -------------------------------------------------- | ------------------------------------ |
| `bucket`    |    是     | Output | The name of the Huawei OBS bucket to write to      | `"My-OBS-Bucket"`                    |
| `endpoint`  |    是     | 输出     | The specific Huawei OBS endpoint                   | `"obs.cn-north-4.myhuaweicloud.com"` |
| `accessKey` |    是     | 输出     | The Huawei Access Key (AK) to access this resource | `"************"`                     |
| `secretKey` |    是     | 输出     | The Huawei Secret Key (SK) to access this resource | `"************"`                     |
| `region`    |    否     | 输出     | The specific Huawei region of the bucket           | `"cn-north-4"`                       |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create` : [Create file](#create-file)
- `upload` : [Upload file](#upload-file)
- `get` : [Get file](#get-file)
- `delete` : [Delete file](#delete-file)
- `list`: [List file](#list-files)

### Create file

To perform a create operation, invoke the Huawei OBS binding with a `POST` method and the following JSON body:

> Note: by default, a random UUID is generated. See below for Metadata support to set the destination file name

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

#### 示例
##### Save text to a random generated UUID file

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
  curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-test-file.txt\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-test-file.txt" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

The response JSON body contains the `statusCode` and the `versionId` fields. The `versionId` will have a value returned only if the bucket versioning is enabled and an empty string otherwise.

### Upload file

To upload a binary file (for example, _.jpg_, _.zip_), invoke the Huawei OBS binding with a `POST` method and the following JSON body:

> Note: by default, a random UUID is generated, if you don't specify the `key`. See the example below for metadata support to set the destination file name. This API can be used to upload a regular file, such as a plain text file.

```json
{
  "operation": "upload",
  "metadata": {
     "key": "DESTINATION_FILE_NAME"
   },
  "data": {
     "sourceFile": "PATH_TO_YOUR_SOURCE_FILE"
   }
}
```

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d "{ \"operation\": \"upload\", \"data\": { \"sourceFile\": \".\my-test-file.jpg\" }, \"metadata\": { \"key\": \"my-test-file.jpg\" } }" \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "upload", "data": { "sourceFile": "./my-test-file.jpg" }, "metadata": { "key": "my-test-file.jpg" } }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

The response JSON body contains the `statusCode` and the `versionId` fields. The `versionId` will have a value returned only if the bucket versioning is enabled and an empty string otherwise.

### 获取对象

To perform a get file operation, invoke the Huawei OBS binding with a `POST` method and the following JSON body:

```json
{
  "operation": "get",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

The metadata parameters are:

- `key` - 对象的名称

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"get\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "get", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

The response body contains the value stored in the object.


### 删除对象

To perform a delete object operation, invoke the Huawei OBS binding with a `POST` method and the following JSON body:

```json
{
  "operation": "delete",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

The metadata parameters are:

- `key` - 对象的名称


#### 示例

##### 删除对象

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"delete\", \"metadata\": { \"key\": \"my-test-file.txt\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "delete", "metadata": { "key": "my-test-file.txt" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

An HTTP 204 (No Content) and empty body are returned if successful.


### 列出对象

To perform a list object operation, invoke the Huawei OBS binding with a `POST` method and the following JSON body:

```json
{
  "operation": "list",
  "data": {
    "maxResults": 5,
    "prefix": "dapr-",
    "marker": "obstest",
    "delimiter": "jpg"
  }
}
```

The data parameters are:

- `maxResults` - (optional) sets the maximum number of keys returned in the response. By default the action returns up to 1,000 key names. The response might contain fewer keys but will never contain more.
- `prefix` - （可选）只返回以指定前缀开头的键。
- `marker` - (optional) marker is where you want Huawei OBS to start listing from. Huawei OBS starts listing after this specified key. Marker can be any key in the bucket. The marker value may then be used in a subsequent call to request the next set of list items.
- `delimiter` - (optional) A delimiter is a character you use to group keys. It returns objects/files with their object key other than that is specified by the delimiter pattern.

#### 示例

{{< tabs Windows Linux >}}

  {{% codetab %}}
  ```bash
  curl -d '{ \"operation\": \"list\", \"data\": { \"maxResults\": 5, \"prefix\": \"dapr-\", \"marker\": \"obstest\", \"delimiter\": \"jpg\" }}' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

  {{% codetab %}}
  ```bash
  curl -d '{ "operation": "list", "data": { "maxResults": 5, "prefix": "dapr-", "marker": "obstest", "delimiter": "jpg" }}' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

The response body contains the list of found objects.

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
