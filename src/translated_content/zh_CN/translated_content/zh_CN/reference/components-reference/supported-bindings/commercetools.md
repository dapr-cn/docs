---
type: docs
title: "commercetools GraphQL binding spec"
linkTitle: "commercetools GraphQL"
description: "Detailed documentation on the commercetools GraphQL binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/commercetools/"
---

## Component format

To setup commercetools GraphQL binding create a component of type `bindings.commercetools`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.commercetools
  version: v1
  metadata:
  - name: region # required.
    value: "region"
  - name: provider # required.
    value: "gcp"
  - name: projectKey # required.
    value: "<project-key>"
  - name: clientID # required.
    value: "*****************"
  - name: clientSecret # required.
    value: "*****************"
  - name: scopes # required.
    value: "<project-scopes>"
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field          | Required | 绑定支持   | 详情                                              | 示例                             |
| -------------- |:--------:| ------ | ----------------------------------------------- | ------------------------------ |
| `region`       |    是     | Output | The region of the commercetools project         | `"europe-west1"`               |
| `provider`     |    是     | 输出     | The cloud provider, either gcp or aws           | `"gcp"`, `"aws"`               |
| `projectKey`   |    是     | 输出     | The commercetools project key                   |                                |
| `clientID`     |    是     | 输出     | The commercetools client ID for the project     |                                |
| `clientSecret` |    是     | 输出     | The commercetools client secret for the project |                                |
| `scopes`       |    是     | Output | The commercetools scopes for the project        | `"manage_project:project-key"` |

For more information see [commercetools - Creating an API Client](https://docs.commercetools.com/getting-started/create-api-client#create-an-api-client) and [commercetools - Regions](https://docs.commercetools.com/api/general-concepts#regions).

## 绑定支持

该组件支持如下操作的 **输出绑定** ：

- `create`

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过 input binding 触发应用]({{< ref howto-triggers.md >}})
- [How-To：使用绑定与外部资源进行交互]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
- [Sample app](https://github.com/dapr/samples/tree/master/commercetools-graphql-sample) that leverages the commercetools binding with sample GraphQL query
