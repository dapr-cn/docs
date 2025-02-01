---
type: docs
title: "华为 OBS 绑定规范"
linkTitle: "华为 OBS"
description: "关于华为 OBS 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/huawei-obs/"
---

## 组件格式

要配置华为对象存储服务（OBS）的输出绑定，创建一个类型为 `bindings.huawei.obs` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})以了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.huawei.obs
  version: v1
  metadata:
  - name: bucket
    value: "<your-bucket-name>"
  - name: endpoint
    value: "<obs-bucket-endpoint>"
  - name: accessKey
    value: "<your-access-key>"
  - name: secretKey
    value: "<your-secret-key>"
  # 可选字段
  - name: region
    value: "<your-bucket-region>"
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret 使用了明文字符串。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `bucket` | Y | 输出 | 要写入的华为 OBS 存储桶名称 | `"My-OBS-Bucket"` |
| `endpoint` | Y | 输出 | 特定的华为 OBS 端点 | `"obs.cn-north-4.myhuaweicloud.com"` |
| `accessKey` | Y | 输出 | 访问此资源的华为访问密钥（AK） | `"************"` |
| `secretKey` | Y | 输出 | 访问此资源的华为密钥（SK） | `"************"` |
| `region` | N | 输出 | 存储桶的特定华为区域 | `"cn-north-4"` |

## 绑定功能

此组件支持以下**输出绑定**操作：

- `create` : [创建文件](#create-file)
- `upload` : [上传文件](#upload-file)
- `get` : [获取文件](#get-file)
- `delete` : [删除文件](#delete-file)
- `list`: [列出文件](#list-files)

### 创建文件

要执行创建操作，请使用 `POST` 方法调用华为 OBS 绑定，并使用以下 JSON 正文：

> 注意：默认情况下，会生成一个随机 UUID。请参阅下面的元数据支持以设置目标文件名

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

响应 JSON 正文包含 `statusCode` 和 `versionId` 字段。只有在启用存储桶版本控制时，`versionId` 才会返回值，否则为空字符串。

### 上传文件

要上传二进制文件（例如，_.jpg_，_.zip_），请使用 `POST` 方法调用华为 OBS 绑定，并使用以下 JSON 正文：

> 注意：默认情况下，会生成一个随机 UUID，如果您不指定 `key`。请参阅下面的示例以获取元数据支持以设置目标文件名。此 API 可用于上传常规文件，例如纯文本文件。

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

响应 JSON 正文包含 `statusCode` 和 `versionId` 字段。只有在启用存储桶版本控制时，`versionId` 才会返回值，否则为空字符串。

### 获取对象

要执行获取文件操作，请使用 `POST` 方法调用华为 OBS 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "get",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数为：

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

响应正文包含存储在对象中的值。

### 删除对象

要执行删除对象操作，请使用 `POST` 方法调用华为 OBS 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "delete",
  "metadata": {
    "key": "my-test-file.txt"
  }
}
```

元数据参数为：

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

如果成功，将返回 HTTP 204（无内容）和空正文。

### 列出对象

要执行列出对象操作，请使用 `POST` 方法调用华为 OBS 绑定，并使用以下 JSON 正文：

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

数据参数为：

- `maxResults` - （可选）设置响应中返回的最大键数。默认情况下，操作最多返回 1,000 个键名。响应可能包含更少的键，但绝不会包含更多。
- `prefix` - （可选）限制响应为以指定前缀开头的键。
- `marker` - （可选）标记是您希望华为 OBS 开始列出的位置。华为 OBS 从此指定键之后开始列出。标记可以是存储桶中的任何键。然后可以在后续调用中使用标记值来请求下一组列表项。
- `delimiter` - （可选）分隔符是您用来分组键的字符。它返回对象/文件，其对象键与分隔符模式指定的不同。

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

响应正文包含找到的对象列表。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
