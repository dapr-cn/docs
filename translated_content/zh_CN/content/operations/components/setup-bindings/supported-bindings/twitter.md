---
type: docs
title: "Twitter binding spec"
linkTitle: "Twitter"
description: "Detailed documentation on the Twitter binding component"
---

## 配置

To setup Twitter binding create a component of type `bindings.twitter`. 请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})，了解如何创建和应用绑定配置。

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
以上示例将密钥明文存储。 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段             | 必填 | 绑定支持         | 详情                          | 示例                 |
| -------------- |:--:| ------------ | --------------------------- | ------------------ |
| consumerKey    | 是  | Input/Output | Twitter API consumer key    | `"conusmerkey"`    |
| consumerSecret | 是  | Input/Output | Twitter API consumer secret | `"conusmersecret"` |
| accessToken    | 是  | Input/Output | Twitter API access token    | `"accesstoken"`    |
| accessSecret   | 是  | Input/Output | Twitter API access secret   | `"accesssecret"`   |

## 绑定支持

此组件支持 **输入和输出** 绑定接口。

该组件支持**输出绑定**，其操作如下:

- `get`

### Input binding

For input binding, where the query matching Tweets are streamed to the user service, the above component has to also include a query:

```yaml
  - name: query
    value: "dapr" # your search query, required 
```

### Output binding
#### get

For output binding invocation the user code has to invoke the binding:

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

The metadata parameters are:

- `query` - any valid Twitter query (e.g. `dapr` or `dapr AND serverless`). See [Twitter docs](https://developer.twitter.com/en/docs/tweets/rules-and-filtering/overview/standard-operators) for more details on advanced query formats
- `lang` - (optional, default: `en`) restricts result tweets to the given language using [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- `result` - (optional, default: `recent`) specifies tweet query result type. Valid values include:
  - `mixed` - both popular and real time results
  - `recent` - most recent results
  - `popular` - most popular results

You can see the example of the JSON data that Twitter binding returns [here](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets)

## 相关链接

- [Dapr组件的基本格式]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何通过输入绑定触发应用]({{< ref howto-triggers.md >}})
- [如何处理: 使用绑定对接外部资源]({{< ref howto-bindings.md >}})
- [绑定API 参考]({{< ref bindings_api.md >}})
