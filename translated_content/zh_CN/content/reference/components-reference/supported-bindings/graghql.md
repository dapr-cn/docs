---
type: docs
title: "GraphQL binding spec"
linkTitle: "GraphQL"
description: "Detailed documentation on the GraphQL binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/graphql/"
---

## 配置

To setup GraphQL binding create a component of type `bindings.graphql`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。 To separate normal config settings (e.g. endpoint) from headers, "header:" is used a prefix on the header names.


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

| 字段                 | 必填 | 绑定支持 | 详情                                                                                         | 示例                                        |
| ------------------ |:--:| ---- | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| 终结点                | Y  | 输出   | GraphQL endpoint string See [here](#url-format) for more details                           | `"http://localhost:4000/graphql/graphql"` |
| header:[HEADERKEY] | N  | 输出   | GraphQL header. Specify the header key in the `name`, and the header value in the `value`. | `"no-cache"` (see above)                  |

### Endpoint and Header format

The GraphQL binding uses [GraphQL client](https://github.com/machinebox/graphql) internally.

## 绑定支持

字段名为 `ttlInSeconds`。

- `query`
- `mutation`

### query

The `query` operation is used for `query` statements, which returns the metadata along with data in a form of an array of row values.

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
