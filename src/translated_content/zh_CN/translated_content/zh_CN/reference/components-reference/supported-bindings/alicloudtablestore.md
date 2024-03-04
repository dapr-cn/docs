---
type: docs
title: "阿里云 Tablestore 绑定规范"
linkTitle: "阿里云 Tablestore"
description: "有关阿里云 Tablestore 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/alicloudtablestore/"
---

## Component format

To setup an Alibaba Cloud Tablestore binding create a component of type `bindings.alicloud.tablestore`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a secretstore configuration. See this guide on [referencing secrets]({{< ref component-secrets.md >}}) to retrieve and use the secret with Dapr components.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mytablestore
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
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field          | Required | 绑定支持   | 详情                            | 示例                                          |
| -------------- | -------- | ------ | ----------------------------- | ------------------------------------------- |
| `endpoint`     | 是        | Output | Alicloud Tablestore endpoint. | https://tablestore-cn-hangzhou.aliyuncs.com |
| `accessKeyID`  | 是        | 输出     | 访问密钥 ID 凭据。                   |                                             |
| `accessKey`    | 是        | 输出     | 访问密钥凭据。                       |                                             |
| `instanceName` | 是        | 输出     | 实例的名称。                        |                                             |
| `tableName`    | 是        | 输出     | 表的名称。                         |                                             |

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`: [Create object](#create-object)

### Create object

要执行创建对象操作，请使用 `POST` 方法和以下 JSON 调用绑定：

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
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
