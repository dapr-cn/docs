---
type: docs
title: "Azure OpenAI 绑定组件规范"
linkTitle: "Azure OpenAI"
description: "关于 Azure OpenAI 绑定组件的详细文档"
aliases:
  - "/zh-hans/operations/components/setup-bindings/supported-bindings/openai/"
---

## 组件格式

要设置 Azure OpenAI 绑定组件，请创建一个类型为 `bindings.azure.openai` 的组件。请参阅[本指南]({{< ref "howto-bindings.md#1-create-a-binding" >}})了解如何创建和应用绑定配置。
有关 Azure OpenAI 服务的文档，请参阅[此处](https://learn.microsoft.com/azure/cognitive-services/openai/overview/)。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.openai
  version: v1
  metadata:
  - name: apiKey # 必需
    value: "1234567890abcdef"
  - name: endpoint # 必需
    value: "https://myopenai.openai.azure.com"
```
{{% alert title="警告" color="warning" %}}
上述示例中，`apiKey` 被直接用作字符串。建议使用密钥存储来保存敏感信息，具体方法请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规范元数据字段

| 字段              | 必需 | 绑定支持 | 详情 | 示例 |
|--------------------|:--------:|--------|---------|---------|
| `endpoint` | Y | 输出 | Azure OpenAI 服务端点的 URL。 | `"https://myopenai.openai.azure.com"` |
| `apiKey` | Y* | 输出 | Azure OpenAI 服务的访问密钥。仅在不使用 Microsoft Entra ID 认证时需要。 | `"1234567890abcdef"` |
| `azureTenantId` | Y* | 输入 | Azure OpenAI 资源的租户 ID。仅在未提供 `apiKey` 时需要。  | `"tenentID"` |
| `azureClientId` | Y* | 输入 | 用于创建或更新 Azure OpenAI 订阅并认证传入消息的客户端 ID。仅在未提供 `apiKey` 时需要。| `"clientId"` |
| `azureClientSecret` | Y* | 输入 | 用于创建或更新 Azure OpenAI 订阅并认证传入消息的客户端密钥。仅在未提供 `apiKey` 时需要。 | `"clientSecret"` |

### Microsoft Entra ID 认证

Azure OpenAI 绑定组件支持使用所有 Microsoft Entra ID 机制进行认证。有关更多信息以及根据选择的 Microsoft Entra ID 认证机制提供的相关组件元数据字段，请参阅[认证到 Azure 的文档]({{< ref authenticating-azure.md >}})。

#### 示例配置

```yaml
apiVersion: dapr.io/v1alpha1
kind: component
metadata:
  name: <NAME>
spec:
  type: bindings.azure.openai
  version: v1
  metadata:
  - name: endpoint
    value: "https://myopenai.openai.azure.com"
  - name: azureTenantId
    value: "***"
  - name: azureClientId
    value: "***"
  - name: azureClientSecret
    value: "***"
```
## 绑定功能支持

此组件支持以下操作的**输出绑定**：

- `completion` : [Completion API](#completion-api)
- `chat-completion` : [Chat Completion API](#chat-completion-api)
- `get-embedding` : [Embedding API](#get-embedding-api)

### Completion API

要使用提示调用 Completion API，请使用 `POST` 方法调用 Azure OpenAI 绑定，并使用以下 JSON 正文：

```json
{
  "operation": "completion",
  "data": {
    "deploymentId": "my-model",
    "prompt": "A dog is",
    "maxTokens":5
    }
}
```

数据参数为：

- `deploymentId` - 指定要使用的模型部署 ID 的字符串。
- `prompt` - 指定要生成完成的提示的字符串。
- `maxTokens` - （可选）定义要生成的最大令牌数。Completion API 默认为 16。
- `temperature` - （可选）定义采样温度，范围为 0 到 2。较高的值如 0.8 使输出更随机，而较低的值如 0.2 使其更集中和确定。Completion API 默认为 1.0。
- `topP` - （可选）定义采样温度。Completion API 默认为 1.0。
- `n` - （可选）定义要生成的完成数。Completion API 默认为 1。
- `presencePenalty` - （可选）介于 -2.0 和 2.0 之间的数字。正值根据它们是否出现在文本中对新令牌进行惩罚，从而增加模型谈论新主题的可能性。Completion API 默认为 0.0。
- `frequencyPenalty` - （可选）介于 -2.0 和 2.0 之间的数字。正值根据它们在文本中的现有频率对新令牌进行惩罚，从而减少模型逐字重复同一行的可能性。Completion API 默认为 0.0。

在 [Azure OpenAI API 文档](https://learn.microsoft.com/azure/ai-services/openai/reference)中阅读更多关于这些参数的重要性和用法。
#### 示例

{{< tabs Linux >}}
  {{% codetab %}}
  ```bash
  curl -d '{ "data": {"deploymentId: "my-model" , "prompt": "A dog is ", "maxTokens":15}, "operation": "completion" }' \
        http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文包含以下 JSON：

```json
[
  {
    "finish_reason": "length",
    "index": 0,
    "text": " a pig in a dress.\n\nSun, Oct 20, 2013"
  },
  {
    "finish_reason": "length",
    "index": 1,
    "text": " the only thing on earth that loves you\n\nmore than he loves himself.\"\n\n"
  }
]

```

### Chat Completion API

要执行 chat-completion 操作，请使用 `POST` 方法调用 Azure OpenAI 绑定，并使用以下 JSON 正文：

```json
{
    "operation": "chat-completion",
    "data": {
        "deploymentId": "my-model",
        "messages": [
            {
                "role": "system",
                "message": "You are a bot that gives really short replies"
            },
            {
                "role": "user",
                "message": "Tell me a joke"
            }
        ],
        "n": 2,
        "maxTokens": 30,
        "temperature": 1.2
    }
}
```

数据参数为：

- `deploymentId` - 指定要使用的模型部署 ID 的字符串。
- `messages` - 将用于生成聊天完成的消息数组。
每条消息的格式为：
  - `role` - 指定消息角色的字符串。可以是 `user`、`system` 或 `assistant`。
  - `message` - 指定角色的对话消息的字符串。
- `maxTokens` - （可选）定义要生成的最大令牌数。Chat Completion API 默认为 16。
- `temperature` - （可选）定义采样温度，范围为 0 到 2。较高的值如 0.8 使输出更随机，而较低的值如 0.2 使其更集中和确定。Chat Completion API 默认为 1.0。
- `topP` - （可选）定义采样温度。Chat Completion API 默认为 1.0。
- `n` - （可选）定义要生成的完成数。Chat Completion API 默认为 1。
- `presencePenalty` - （可选）介于 -2.0 和 2.0 之间的数字。正值根据它们是否出现在文本中对新令牌进行惩罚，从而增加模型谈论新主题的可能性。Chat Completion API 默认为 0.0。
- `frequencyPenalty` - （可选）介于 -2.0 和 2.0 之间的数字。正值根据它们在文本中的现有频率对新令牌进行惩罚，从而减少模型逐字重复同一行的可能性。Chat Completion API 默认为 0.0。

#### 示例

{{< tabs Linux >}}

  {{% codetab %}}
  ```bash
curl -d '{
    "data": {
        "deploymentId": "my-model",
        "messages": [
            {
                "role": "system",
                "message": "You are a bot that gives really short replies"
            },
            {
                "role": "user",
                "message": "Tell me a joke"
            }
        ],
        "n": 2,
        "maxTokens": 30,
        "temperature": 1.2
    },
    "operation": "chat-completion"
}' \
http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
  {{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文包含以下 JSON：

```json
[
  {
    "finish_reason": "stop",
    "index": 0,
    "message": {
      "content": "Why was the math book sad? Because it had too many problems.",
      "role": "assistant"
    }
  },
  {
    "finish_reason": "stop",
    "index": 1,
    "message": {
      "content": "Why did the tomato turn red? Because it saw the salad dressing!",
      "role": "assistant"
    }
  }
]

```

### 获取嵌入 API

`get-embedding` 操作返回给定输入的向量表示，可以被机器学习模型和其他算法轻松使用。
要执行 `get-embedding` 操作，请使用 `POST` 方法调用 Azure OpenAI 绑定，并使用以下 JSON 正文：

```json
{
    "operation": "get-embedding",
    "data": {
        "deploymentId": "my-model",
        "message": "The capital of France is Paris."
    }
}
```

数据参数为：

- `deploymentId` - 指定要使用的模型部署 ID 的字符串。
- `message` - 指定要嵌入的文本的字符串。

#### 示例

{{< tabs Linux >}}

{{% codetab %}}
  ```bash
curl -d '{
    "data": {
        "deploymentId": "embeddings",
        "message": "The capital of France is Paris."
    },
    "operation": "get-embedding"
}' \
http://localhost:<dapr-port>/v1.0/bindings/<binding-name>
  ```
{{% /codetab %}}

{{< /tabs >}}

#### 响应

响应正文包含以下 JSON：

```json
[0.018574921,-0.00023652936,-0.0057790717,.... (1536 floats total for ada)]
```

## 了解更多关于 Azure OpenAI 输出绑定的信息

观看[以下社区电话演示](https://youtu.be/rTovKpG0rhY?si=g7hZTQSpSEXz4pV1&t=80)以了解更多关于 Azure OpenAI 输出绑定的信息。

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/rTovKpG0rhY?si=XP1S-80SIg1ptJuG&amp;start=80" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- [绑定构建块]({{< ref bindings >}})
- [如何：使用输入绑定触发应用程序]({{< ref howto-triggers.md >}})
- [如何：使用绑定与外部资源接口]({{< ref howto-bindings.md >}})
- [绑定 API 参考]({{< ref bindings_api.md >}})
- [Azure OpenAI REST 示例](https://learn.microsoft.com/azure/ai-services/openai/reference)
