---
type: docs
title: "GraphQL 绑定规范"
linkTitle: "GraphQL"
description: "有关 GraphQL 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/graphql/"
---

## 配置

要设置 GraphQL 绑定，请创建一个类型为 `bindings.graphql` 的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。 为了将常规配置设置（例如 endpoint）与 header 分开，在 header 名称上使用前缀 "header:"。


```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: example.bindings.graphql
spec:
  type: bindings.graphql
  version: v1
  metadata:
    - name: endpoint
      value:  http://localhost:8080/v1/graphql
    - name: header:x-hasura-access-key
      value: adminkey
    - name: header:Cache-Control
      value: no-cache
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                 | 必填 | 绑定支持 | 详情                                                          | 示例                                        |
| ------------------ |:--:| ---- | ----------------------------------------------------------- | ----------------------------------------- |
| 终结点                | 是  | 输出   | GraphQL endpoint 详细信息请参阅[此处](#url-format)                   | `"http://localhost:4000/graphql/graphql"` |
| header:[HEADERKEY] | 否  | 输出   | GraphQL header. 指定 `name` 中的 header 键和 `value` 中的 header 值。 | `"no-cache"` （见上文）                        |

### Endpoint 和 Header 格式

GraphQL 绑定在内部使用 [GraphQL 客户端](https://github.com/machinebox/graphql) 。

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `query`
- `mutation`

### query

`query ` 操作用于 `query` 语句，该语句以行值数组的形式返回元数据和数据。

**请求**

```golang
in := &dapr.InvokeBindingRequest{
Name:      "example.bindings.graphql",
Operation: "query",
Metadata: map[string]string{ "query": `query { users { name } }`},
}
```

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
