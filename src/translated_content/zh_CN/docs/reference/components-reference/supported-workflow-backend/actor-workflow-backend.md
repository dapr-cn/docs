---
type: docs
title: "Actor 工作流后端"
linkTitle: "Actor 工作流后端"
description: Actor 工作流后端组件的详细信息
---

## 组件格式

在 Dapr 中，Actor 工作流后端是默认的后端。如果没有明确指定工作流后端，系统将自动使用 Actor 后端。

使用 Actor 工作流后端无需定义任何组件，它可以直接使用。

不过，如果您想将 Actor 工作流后端显式定义为一个组件，可以参考以下示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: actorbackend
spec:
  type: workflowbackend.actor
  version: v1
```