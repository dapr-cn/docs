---
type: docs
title: "Kubernetes 密钥"
linkTitle: "Kubernetes 密钥"
description: 详细介绍了关于 Kubernetes密钥仓库组件的信息
---

## 开篇摘要

Kubernetes有一个内置的密钥仓库，Dapr组件可以使用它来检索密钥。 设置Kubernetes密钥仓库不需要特殊的配置，你能够从`http://localhost:3500/v1.0/secrets/kubernetes/[my-secret]`这个 URL中检索密钥。 请参阅本指南 [引用密钥]({{< ref component-secrets.md >}}) 来检索和使用Dapr组件的密钥。

## 相关链接
- [密钥构建块]({{< ref secrets >}})
- [指南：获取密钥]({{< ref "howto-secrets.md" >}})
- [指南：在Dapr组件中引用密钥]({{< ref component-secrets.md >}})
- [密钥 API 参考]({{< ref secrets_api.md >}})
