---
type: docs
title: "Twitter binding spec"
linkTitle: "Twitter"
description: "Detailed documentation on the Twitter binding component"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/twitter/"
---

## 配置

要设置Twitter绑定需要创建一个 `bindings.twitter`类型的组件。 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: bindings.twitter
  version: v1
  metadata:
  - name: consumerKey
    value: "****" # twitter api consumer key, required
  - name: consumerSecret
    value: "****" # twitter api consumer secret, required
  - name: accessToken
    value: "****" # twitter api access token, required
  - name: accessSecret
    value: "****" # twitter api access secret, required
```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段             | 必填 | 绑定支持  | 详情                | 示例                 |
| -------------- |:--:| ----- | ----------------- | ------------------ |
| consumerKey    | Y  | 输入/输出 | Twitter API消费者键值  | `"conusmerkey"`    |
| consumerSecret | Y  | 输入/输出 | Twitter API 消费者密码 | `"conusmersecret"` |
| accessToken    | Y  | 输入/输出 | Twitter API 访问令牌  | `"accesstoken"`    |
| accessSecret   | Y  | 输入/输出 | Twitter API 访问密码  | `"accesssecret"`   |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持如下操作的 **输出绑定** ：

- `get`

### 输入绑定

对于输入绑定，如果与Tweets正文匹配的查询将会流式的发送到用户服务，上述组件可以包含如下查询：

```yaml
  - name: query
    value: "dapr" # your search query, required
```

### 输出绑定
#### 获取

对于输出绑定调用，用户代码必须使用如下方式调用绑定：

```shell
POST http://localhost:3500/v1.0/bindings/twitter
```

Where the payload is:

```json
{
  "data": "",
  "metadata": {
    "query": "twitter-query",
    "lang": "optional-language-code",
    "result": "valid-result-type"
  },
  "operation": "get"
}
```

元数据参数包括：

- `query` - 任何有效的Twitter 查询 (例如`dapr` 或者 `dapr AND serverless`)。 参照[Twitter 文档](https://developer.twitter.com/en/docs/tweets/rules-and-filtering/overview/standard-operators)了解进一步查询格式的细节。
- `lang` - (可选项, 默认: `en`) 约束使用[ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)将结果推文转为给定的语言
- `result` - (可选项, 默认: `recent`) 指定推文查询结果类型。 有效值包括：
  - `mixed` - 流行和实时结果
  - `recent` - 最近的结果
  - `popular` - 最流行的结果

你可以查看[此处](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets)了解Twitter 绑定返回的JSON数据样例

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [Bindings API 引用]({{< ref bindings_api.md >}})
