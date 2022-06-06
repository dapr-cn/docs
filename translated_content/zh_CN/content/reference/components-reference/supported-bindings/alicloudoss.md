---
type: docs
title: "阿里云对象存储服务绑定规范"
linkTitle: "Alibaba Cloud Object Storage"
description: "阿里云对象存储绑定组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudoss/"
---

## 配置

要设置阿里云对象存储绑定，请创建一个类型为`bindings.alicloud.os`的组件。 请参阅 [本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}}) 了解如何创建和应用 secretstore 配置。 有关如何在 Dapr 组件中检索和使用 secret，请参阅 [引用 secrets]({{< ref component-secrets.md >}}) 指南。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: alicloudobjectstorage
  namespace: default
spec:
  type: bindings.alicloud.oss
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: bucket
    value: "[bucket]"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段            | 必填 | 绑定支持 | 详情               | 示例                                   |
| ------------- | -- | ---- | ---------------- | ------------------------------------ |
| `终结点`         | Y  | 输出   | Alicloud OSS 端点。 | https://oss-cn-hangzhou.aliyuncs.com |
| `accessKeyID` | Y  | 输出   | 访问密钥 ID 凭据。      |                                      |
| `accessKey`   | Y  | 输出   | 访问密钥凭据。          |                                      |
| `bucket`      | Y  | 输出   | 存储桶名称            |                                      |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：
- `create`: [创建对象](#create-object)


### 创建对象

要执行创建对象操作，请使用`POST`方法和以下JSON调用绑定：

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT"
}
```

{{% alert title="Note" color="primary" %}}
默认情况下，会自动生成一个随机的UUID作为对象密钥。 参见下面所示的支持的元数据为对象设置密钥。
{{% /alert %}}

#### 示例

**保存到一个随机生成的UUID文件**

{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\" }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World" }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

<br />

**保存到特定文件**
{{< tabs "Windows" "Linux/MacOS" >}}

{{% codetab %}}

```bash
curl -d "{ \"operation\": \"create\", \"data\": \"Hello World\", \"metadata\": { \"key\": \"my-key\" } }" http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{% codetab %}}

```bash
curl -d '{ "operation": "create", "data": "Hello World", "metadata": { "key": "my-key" } }' http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
```

{{% /codetab %}}

{{< /tabs >}}

{{% alert title="Note" color="primary" %}}
Windows CMD需要转义`"`字符。
{{% /alert %}}

## 元数据信息

### 对象键

默认情况下，Alicloud OSS输出绑定会自动生成一个UUID作为对象键。 您可以通过以下元数据来设置键：

```json
{
    "data": "file content",
    "metadata": {
        "key": "my-key"
    },
    "operation": "create"
}
```

## 相关链接

- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
