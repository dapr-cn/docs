yaml
type: docs
title: "AWS Bedrock"
linkTitle: "AWS Bedrock"
description: AWS Bedrock conversation组件的详细信息
---

## 组件格式

一个Dapr `conversation.yaml` 组件文件的结构如下：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: awsbedrock
spec:
  type: conversation.aws.bedrock
  metadata:
  - name: endpoint
    value: "http://localhost:4566"
  - name: model
    value: amazon.titan-text-express-v1
  - name: cacheTTL
    value: 10m
```

{{% alert title="警告" color="warning" %}}
上述示例中，secret以明文字符串形式使用。建议使用secret存储来保护secret，详情请参阅[此处]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `endpoint`   | N | 组件连接到AWS模拟器的端点。不建议在生产环境中使用。 | `http://localhost:4566` |
| `model` | N | 使用的语言模型（LLM）。默认为Amazon的Bedrock默认提供商模型。  | `amazon.titan-text-express-v1` |
| `cacheTTL` | N | 提示缓存的生存时间（TTL），即缓存过期时间。使用Golang持续时间格式。  | `10m` |

## 相关链接

- [conversation API概述]({{< ref conversation-overview.md >}})
