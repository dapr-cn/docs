---
type: docs
title: "GraphQL 绑定规范"
linkTitle: "GraphQL"
description: "有关 GraphQL 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/graphql/"
---

## Component format

To setup GraphQL binding create a component of type `bindings.graphql`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To separate normal config settings (e.g. endpoint) from headers, "header:" is used a prefix on the header names.


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
      value: "http://localhost:8080/v1/graphql"
    - name: header:x-hasura-access-key
      value: "adminkey"
    - name: header:Cache-Control
      value: "no-cache"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                       | Required | 绑定支持   | 详情                                                                                                      | 示例                                        |
| ------------------------ |:--------:| ------ | ------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `endpoint`               |    是     | Output | GraphQL endpoint string See [here](#url-format) for more details                                        | `"http://localhost:4000/graphql/graphql"` |
| `header:[HEADERKEY]`     |    否     | 输出     | GraphQL header. 指定 `name` 中的 header 键和 `value` 中的 header 值。                                             | `"no-cache"` （见上文）                        |
| `variable:[VARIABLEKEY]` |    否     | Output | GraphQL query variable. Specify the variable name in the `name`, and the variable value in the `value`. | `"123"` (see below)                       |

### Endpoint and Header format

GraphQL 绑定在内部使用 [GraphQL 客户端](https://github.com/machinebox/graphql) 。

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `query`
- `mutation`

### query

`query ` 操作用于 `query` 语句，该语句以行值数组的形式返回元数据和数据。

**Request**

```golang
in := &dapr.InvokeBindingRequest{
Name:      "example.bindings.graphql",
Operation: "query",
Metadata: map[string]string{ "query": `query { users { name } }`},
}
```

To use a `query` that requires [query variables](https://graphql.org/learn/queries/#variables), add a key-value pair to the `metadata` map, wherein every key corresponding to a query variable is the variable name prefixed with `variable:`

```golang
in := &dapr.InvokeBindingRequest{
Name: "example.bindings.graphql",
Operation: "query",
Metadata: map[string]string{ 
  "query": `query HeroNameAndFriends($episode: string!) { hero(episode: $episode) { name } }`,
  "variable:episode": "JEDI",
}
```

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
