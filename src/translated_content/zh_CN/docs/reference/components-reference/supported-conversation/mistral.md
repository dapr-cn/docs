---
type: docs
title: "Mistral"
linkTitle: "Mistral"
description: Mistral 会话组件的详细信息
---

## 组件格式

一个 Dapr `conversation.yaml` 组件文件具有以下结构：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: mistral
spec:
  type: conversation.mistral
  metadata:
  - name: key
    value: mykey
  - name: model
    value: open-mistral-7b
  - name: cacheTTL
    value: 10m
```

{{% alert title="警告" color="warning" %}}
上述示例中，密钥以明文形式展示。建议使用密钥存储来保护密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `key`   | Y | Mistral 的 API 密钥。 | `mykey` |
| `model` | N | 要使用的 Mistral LLM 模型。默认为 `open-mistral-7b`。  | `open-mistral-7b` |
| `cacheTTL` | N | 提示缓存的有效期，使用 Golang 的持续时间格式。  | `10m` |

## 相关链接

- [会话 API 概述]({{< ref conversation-overview.md >}})
