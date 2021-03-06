---
type: docs
title: "Twitter binding spec"
linkTitle: "Twitter"
description: "Detailed documentation on the Twitter binding component"
---

## Component format

To setup Twitter binding create a component of type `bindings.twitter`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration. To setup Redis binding create a component of type `bindings.redis`. See [this guide]({{< ref "howto-bindings.md#1-create-a-binding" >}}) on how to create and apply a binding configuration.

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
以上示例将 Secret 明文存储。 The example configuration shown above, contain a username and password as plain-text strings. 更推荐的方式是使用 Secret 组件， [here]({{< ref component-secrets.md >}}})。
{{% /alert %}}

## Spec metadata fields

| 字段             | Required | Binding support | Details                     | Example            |
| -------------- |:--------:| --------------- | --------------------------- | ------------------ |
| consumerKey    |    Y     | Input/Output    | Twitter API consumer key    | `"conusmerkey"`    |
| consumerSecret |    Y     | Input/Output    | Twitter API consumer secret | `"conusmersecret"` |
| accessToken    |    Y     | Input/Output    | Twitter API access token    | `"accesstoken"`    |
| accessSecret   |    Y     | Input/Output    | Twitter API access secret   | `"accesssecret"`   |

## 相关链接

This component supports both **input and output** binding interfaces.

字段名为 `ttlInSeconds`。

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

- `query` - any valid Twitter query (e.g. `dapr` or `dapr AND serverless`). `query` - any valid Twitter query (e.g. `dapr` or `dapr AND serverless`). See [Twitter docs](https://developer.twitter.com/en/docs/tweets/rules-and-filtering/overview/standard-operators) for more details on advanced query formats
- `lang` - (optional, default: `en`) restricts result tweets to the given language using [ISO 639-1 language code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
- `result` - (optional, default: `recent`) specifies tweet query result type. Valid values include: Valid values include:
  - `mixed` - both popular and real time results
  - `recent` - most recent results
  - `popular` - most popular results

You can see the example of the JSON data that Twitter binding returns [here](https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets)

## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- [Bindings building block]({{< ref bindings >}})
- [How-To: Trigger application with input binding]({{< ref howto-triggers.md >}})
- [How-To: Use bindings to interface with external resources]({{< ref howto-bindings.md >}})
- [Bindings API reference]({{< ref bindings_api.md >}})
