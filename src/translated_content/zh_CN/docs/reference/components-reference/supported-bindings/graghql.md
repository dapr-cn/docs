---
type: docs
title: "GraphQL 绑定说明"
linkTitle: "GraphQL"
description: "GraphQL 绑定组件的详细说明文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/graphql/"
---

## 组件格式

要配置 GraphQL 绑定，请创建一个类型为 `bindings.graphql` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。为了区分普通配置（如 endpoint）和 headers，header 名称前需加上 "header:" 前缀。

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

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串来存储 secret。建议使用 secret 存储来保护 secret，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `endpoint` | Y | 输出 | GraphQL endpoint 字符串，详情见[此处](#url-format) | `"http://localhost:4000/graphql/graphql"` |
| `header:[HEADERKEY]` | N | 输出 | GraphQL header。在 `name` 中指定 header 键，在 `value` 中指定 header 值。 | `"no-cache"` (见上文) |
| `variable:[VARIABLEKEY]` | N | 输出 | GraphQL 查询变量。在 `name` 中指定变量名，在 `value` 中指定变量值。 | `"123"` (见下文) |

### Endpoint 和 Header 格式

GraphQL 绑定内部使用 [GraphQL 客户端](https://github.com/machinebox/graphql)。

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `query`
- `mutation`

### query

`query` 操作用于执行查询语句，返回的结果包含元数据和数据，以行值数组的形式呈现。

**请求**

```golang
in := &dapr.InvokeBindingRequest{
Name:      "example.bindings.graphql",
Operation: "query",
Metadata: map[string]string{ "query": `query { users { name } }`},
}
```

如果 `query` 需要[查询变量](https://graphql.org/learn/queries/#variables)，请在 `metadata` 映射中添加键值对，每个查询变量的键需以 `variable:` 为前缀。

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

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
