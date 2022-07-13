---
type: docs
title: "Updating components"
linkTitle: "Updating components"
weight: 250
description: "Updating deployed components used by applications"
---

When making an update to an existing deployed component used by an application, Dapr does not update the component automatically. The Dapr sidecar needs to be restarted in order to pick up the latest version of the component. How this done depends on the hosting environment.

## Kubernetes

When running in Kubernetes, the process of updating a component involves two steps:

1. Applying the new component YAML to the desired namespace
2. Performing a [rollout restart operation](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) on your deployments to pick up the latest component

## Self Hosted

When running in Self Hosted mode, the process of updating a component involves a single step of stopping the `daprd` process and starting it again to pick up the latest component.

## 深入阅读
- [Components concept]({{< ref components-concept.md >}})
- [组件定义中的引用密钥]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的 发布/订阅 消息代理]({{< ref supported-pubsub >}})
- [支持的密钥存储]({{< ref supported-secret-stores >}})
- [Supported bindings]({{< ref supported-bindings >}})
- [设置组件作用域]({{< ref component-scopes.md >}})
