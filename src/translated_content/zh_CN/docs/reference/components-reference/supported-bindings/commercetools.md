---
type: docs
title: "commercetools GraphQL 绑定说明"
linkTitle: "commercetools GraphQL"
description: "commercetools GraphQL 绑定组件的详细介绍"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/commercetools/"
---

## 组件格式

要配置 commercetools GraphQL 绑定，请创建一个类型为 `bindings.commercetools` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.commercetools
  version: v1
  metadata:
  - name: region # 必需。
    value: "region"
  - name: provider # 必需。
    value: "gcp"
  - name: projectKey # 必需。
    value: "<project-key>"
  - name: clientID # 必需。
    value: "*****************"
  - name: clientSecret # 必需。
    value: "*****************"
  - name: scopes # 必需。
    value: "<project-scopes>"
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保存这些机密信息，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 |  详情 | 示例 |
|--------------------|:--------:|------------|-----|---------|
| `region` | Y | 输出 | commercetools 项目的区域 | `"europe-west1"` |
| `provider` | Y | 输出 | 云提供商，可以是 gcp 或 aws | `"gcp"`, `"aws"` |
| `projectKey` | Y | 输出 | commercetools 项目密钥 |  |
| `clientID` | Y | 输出 | 项目的 commercetools 客户端 ID |  |
| `clientSecret` | Y | 输出 | 项目的 commercetools 客户端密钥 |  |
| `scopes` | Y | 输出 | 项目的 commercetools 范围 | `"manage_project:project-key"` |

更多信息请参见 [commercetools - 创建 API 客户端](https://docs.commercetools.com/getting-started/create-api-client#create-an-api-client) 和 [commercetools - 区域](https://docs.commercetools.com/api/general-concepts#regions)。

## 绑定支持

此组件支持以下操作的**输出绑定**：

- `create`

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [Bindings 构建块]({{< ref bindings >}})
- [操作指南：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [操作指南：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [Bindings API 参考]({{< ref bindings_api.md >}})
- [示例应用](https://github.com/dapr/samples/tree/master/commercetools-graphql-sample)，利用 commercetools 绑定进行示例 GraphQL 查询