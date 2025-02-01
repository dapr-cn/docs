---
type: docs
title: "更新组件"
linkTitle: "更新组件"
weight: 300
description: "更新应用程序使用的已部署组件"
---

在更新应用程序使用的现有已部署组件时，除非启用了 [`HotReload`](#hot-reloading-preview-feature) 功能门控，否则 Dapr 不会自动更新组件。需要重启 Dapr sidecar 才能获取组件的最新版本。具体操作方式取决于托管环境。

### Kubernetes

在 Kubernetes 中运行时，更新组件的过程包括以下两个步骤：

1. 将新的组件 YAML 应用到所需的命名空间。
2. 除非启用了 [`HotReload` 功能门控](#hot-reloading-preview-feature)，否则需要对部署执行 [滚动重启操作](https://kubernetes.io/docs/reference/kubectl/cheatsheet/#updating-resources) 以获取最新组件。

### 自托管

除非启用了 [`HotReload` 功能门控](#hot-reloading-preview-feature)，更新组件的过程包括停止和重启 `daprd` 进程以获取最新组件的单个步骤。

## 热重载（预览功能）

> 此功能目前处于[预览]({{< ref "preview-features.md" >}})状态。
> 热重载通过 [`HotReload` 功能门控]({{< ref "support-preview-features.md" >}}) 启用。

Dapr 可以实现“热重载”组件，从而在不需要重启 Dapr sidecar 进程或 Kubernetes pod 的情况下自动获取组件更新。这意味着创建、更新或删除组件清单将在运行时反映在 Dapr sidecar 中。

{{% alert title="更新组件" color="warning" %}}
当组件更新时，它首先被关闭，然后使用新配置重新初始化。这会导致组件在此过程中短时间内不可用。
{{% /alert %}}

{{% alert title="初始化错误" color="warning" %}}
如果通过热重载创建或更新组件时初始化过程出错，Dapr sidecar 会遵循组件字段 [`spec.ignoreErrors`]({{< ref component-schema.md>}}) 的设置。也就是说，行为与 sidecar 在启动时加载组件时相同。
- `spec.ignoreErrors=false` (*默认*): sidecar 优雅地关闭。
- `spec.ignoreErrors=true`: sidecar 继续运行，既没有注册旧的也没有注册新的组件配置。
{{% /alert %}}

除以下类型外，所有组件均支持热重载。这些组件类型的任何创建、更新或删除都将被 sidecar 忽略，需要重启以获取更改。
- [actor 状态存储]({{< ref "state_api.md#configuring-state-store-for-actors" >}})
- [workflow 后端]({{< ref "workflow-architecture.md#workflow-backend" >}})

## 进一步阅读
- [组件概念]({{< ref components-concept.md >}})
- [在组件定义中引用 secret]({{< ref component-secrets.md >}})
- [支持的状态存储]({{< ref supported-state-stores >}})
- [支持的 pub/sub 代理]({{< ref supported-pubsub >}})
- [支持的 secret 存储]({{< ref supported-secret-stores >}})
- [支持的 bindings]({{< ref supported-bindings >}})
- [设置组件范围]({{< ref component-scopes.md >}})