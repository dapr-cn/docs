---
type: docs
title: "OpenAI"
linkTitle: "OpenAI"
description: OpenAI conversation组件的详细信息
---

## 组件格式说明

一个Dapr `conversation.yaml` 组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: openai
spec:
  type: conversation.openai
  metadata:
  - name: key
    value: mykey
  - name: model
    value: gpt-4-turbo
  - name: cacheTTL
    value: 10m
```

{{% alert title="警告" color="warning" %}}
上述示例中使用了明文字符串作为密钥。建议使用密钥存储来保护密钥，具体方法请参见[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据说明

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:----:|------|------|
| `key`   | 是 | OpenAI的API密钥。 | `mykey` |
| `model` | 否 | 要使用的OpenAI语言模型。默认为`gpt-4-turbo`。  | `gpt-4-turbo` |
| `cacheTTL` | 否 | 提示缓存的有效期。使用Golang的时间格式表示。  | `10m` |

## 相关链接

- [conversation API概述]({{< ref conversation-overview.md >}})
