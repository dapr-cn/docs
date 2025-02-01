---
type: docs
title: "Anthropic"
linkTitle: "Anthropic"
description: 关于Anthropic conversation组件的详细信息
---

## 组件格式

一个Dapr `conversation.yaml` 组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: anthropic
spec:
  type: conversation.anthropic
  metadata:
  - name: key
    value: "mykey"
  - name: model
    value: claude-3-5-sonnet-20240620
  - name: cacheTTL
    value: 10m
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret使用了明文字符串。建议使用secret存储，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 元数据字段说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `key`   | Y | Anthropic的API密钥。 | `"mykey"` |
| `model` | N | 要使用的Anthropic LLM。默认为`claude-3-5-sonnet-20240620`  | `claude-3-5-sonnet-20240620` |
| `cacheTTL` | N | 提示缓存的过期时间。使用Golang的持续时间格式。  | `10m` |

## 相关链接

- [conversation API概述]({{< ref conversation-overview.md >}})
