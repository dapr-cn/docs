---
type: docs
title: "阿里云 Tablestore 绑定规范"
linkTitle: "阿里云 Tablestore"
description: "有关阿里云 Tablestore 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudtablestore/"
---

## 配置

要设置阿里云 Tablestore 绑定，需要创建一个类型为 `bindings.alicloud.tablestore` 的组件。 请参阅 [本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}}) 了解如何创建和应用 secretstore 配置。 有关如何在 Dapr 组件中检索和使用 secret，请参阅 [引用 secrets]({{< ref component-secrets.md >}}) 指南。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mytablestore
  namespace: default
spec:
  type: bindings.alicloud.tablestore
  version: v1
  metadata:
  - name: endpoint
    value: "[endpoint]"
  - name: accessKeyID
    value: "[key-id]"
  - name: accessKey
    value: "[access-key]"
  - name: instanceName
    value: "[instance]"
  - name: tableName
    value: "[table]"
  - name: endpoint
    value: "[endpoint]"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段             | 必填 | 绑定支持 | 详情                       | 示例                                          |
| -------------- | -- | ---- | ------------------------ | ------------------------------------------- |
| `终结点`          | Y  | 输出   | 阿里云 Tablestore endpoint。 | https://tablestore-cn-hangzhou.aliyuncs.com |
| `accessKeyID`  | Y  | 输出   | 访问密钥 ID 凭据。              |                                             |
| `accessKey`    | Y  | 输出   | 访问密钥凭据。                  |                                             |
| `instanceName` | Y  | 输出   | 实例的名称。                   |                                             |
| `tableName`    | Y  | 输出   | 表的名称。                    |                                             |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：
- `create`: [创建对象](#create-object)


### 创建对象

要执行创建对象操作，请使用`POST`方法和以下JSON调用绑定：

```json
{
  "operation": "create",
  "data": "YOUR_CONTENT",
  "metadata": {
    "primaryKeys": "pk1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
请注意，`metadata.primaryKeys` 是必填字段。
{{% /alert %}}

### 删除对象

要执行删除对象操作，请使用 `POST` 方法和以下 JSON 调用绑定：

```json
{
  "operation": "delete",
  "metadata": {
   "primaryKeys": "pk1",
   "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
请注意，`metadata.primaryKeys` 是必填字段。
{{% /alert %}}

### 列出对象

要执行列出对象操作，请使用 `POST` 和以下 JSON 调用绑定：

```json
{
  "operation": "delete",
  "metadata": {
    "primaryKeys": "pk1",
    "columnToGet": "name,age,date"
  },
  "data": {
    "pk1": "data1",
    "pk2": "data2"
  }
} 
```

{{% alert title="Note" color="primary" %}}
请注意，`metadata.primaryKeys` 是必填字段。
{{% /alert %}}

### 获取对象

要执行获取对象操作，请使用 `POST` 方法和以下 JSON 调用绑定：

```json
{
  "operation": "delete",
  "metadata": {
    "primaryKeys": "pk1"
  },
  "data": {
    "pk1": "data1"
  }
} 
```

{{% alert title="Note" color="primary" %}}
请注意，`metadata.primaryKeys` 是必填字段。
{{% /alert %}}

## 相关链接

- [绑定构建块]({{< ref bindings >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
