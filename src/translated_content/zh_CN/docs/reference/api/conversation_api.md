---
type: docs
title: "Conversation API reference"
linkTitle: "Conversation API"
description: "Detailed documentation on the conversation API"
weight: 1400
---

{{% alert title="Alpha" color="primary" %}}
The conversation API is currently in [alpha]({{< ref "certification-lifecycle.md#certification-levels" >}}).
{{% /alert %}}

Dapr provides an API to interact with Large Language Models (LLMs) and enables critical performance and security functionality with features like prompt caching and PII data obfuscation.

## Converse

This endpoint lets you converse with LLMs.

```
POST /v1.0-alpha1/conversation/<llm-name>/converse
```

### URL parameters

| Parameter | Description |
| --------- | ----------- |
| `llm-name` | The name of the LLM component. [See a list of all available conversation components.]({{< ref supported-conversation >}})

### Request body

| Field | Description |
| --------- | ----------- |
| `conversationContext` |  |
| `inputs` | |
| `parameters` | | 


### Request content

```json
REQUEST = {
  "inputs": ["what is Dapr", "Why use Dapr"],
  "parameters": {},
}
```

### HTTP response codes

Code | Description
---- | -----------
`202`  | Accepted
`400`  | Request was malformed
`500`  | Request formatted correctly, error in dapr code or underlying component

### Response content

```json
RESPONSE  = {
  "outputs": {
    {
       "result": "Dapr is distribution application runtime ...",
       "parameters": {},
    },
    {
       "result": "Dapr can help developers ...",
       "parameters": {},
    }
  },
}
```

## Next steps

[Conversation API overview]({{< ref conversation-overview.md >}})