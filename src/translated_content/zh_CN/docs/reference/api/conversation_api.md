---
type: docs
title: "会话API参考"
linkTitle: "会话API"
description: "关于会话API的详细文档"
weight: 1400
---

{{% alert title="Alpha" color="primary" %}}
会话API目前为[alpha]({{< ref "certification-lifecycle.md#certification-levels" >}})阶段。
{{% /alert %}}

Dapr提供了一种API，用于与大型语言模型（LLMs）进行交互。通过提示缓存和模糊化个人身份信息（PII）等功能，提升了性能和安全性。

## 会话

通过此端点可以与LLMs进行会话。

```
POST /v1.0-alpha1/conversation/<llm-name>/converse
```

### URL参数

| 参数 | 描述 |
| --------- | ----------- |
| `llm-name` | LLM组件的名称。[查看所有可用会话组件的列表。]({{< ref supported-conversation >}})

### 请求体

| 字段 | 描述 |
| --------- | ----------- |
| `conversationContext` | 会话的上下文信息，用于维持对话状态。 |
| `inputs` | 用户输入的文本数组。 |
| `parameters` | 额外的参数配置。 | 

### 请求示例

```json
REQUEST = {
  "inputs": ["什么是Dapr", "为什么使用Dapr"],
  "parameters": {},
}
```

### HTTP响应代码

代码 | 描述
---- | -----------
`202`  | 请求已被接受
`400`  | 请求格式错误
`500`  | 请求格式正确，但Dapr代码或底层组件出错

### 响应示例

```json
RESPONSE  = {
  "outputs": [
    {
       "result": "Dapr是分布式应用运行时...",
       "parameters": {},
    },
    {
       "result": "Dapr可以帮助开发者...",
       "parameters": {},
    }
  ],
}
```

## 下一步

[会话API概述]({{< ref conversation-overview.md >}})
