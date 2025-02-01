<Meaning-Based Translation>
---
type: docs
title: "Huggingface"
linkTitle: "Huggingface"
description: Huggingface 对话组件的详细信息
---

## 组件格式

一个 Dapr `conversation.yaml` 组件文件具有以下结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: huggingface
spec:
  type: conversation.huggingface
  metadata:
  - name: key
    value: mykey
  - name: model
    value: meta-llama/Meta-Llama-3-8B
  - name: cacheTTL
    value: 10m
```

{{% alert title="警告" color="warning" %}}
上述示例中，密钥以明文字符串形式使用。建议使用密钥存储来保存密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `key`   | Y | Huggingface 的 API 密钥。 | `mykey` |
| `model` | N | 要使用的 Huggingface LLM。默认为 `meta-llama/Meta-Llama-3-8B`。  | `meta-llama/Meta-Llama-3-8B` |
| `cacheTTL` | N | 提示缓存的过期时间。使用 Golang 持续时间格式。  | `10m` |

## 相关链接

- [对话 API 概述]({{< ref conversation-overview.md >}})