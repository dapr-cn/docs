---
type: docs
title: "Dapr 可插拔组件 Go SDK 的高级用法"
linkTitle: "高级"
weight: 2000
description: 如何使用 Dapr 可插拔组件 Go SDK 的高级技术
is_preview: true
---

尽管大多数情况下不需要使用这些高级配置方法，但本指南将展示如何在 Go 中配置 Dapr 的可插拔组件。

## 组件生命周期

可插拔组件通过传递一个“工厂方法”进行注册，该方法会在每个与 socket 关联的 Dapr 组件配置中被调用。这个方法返回与该 Dapr 组件相关联的实例（无论是否共享）。这使得多个相同类型的 Dapr 组件可以使用不同的元数据集进行配置，尤其是在需要组件操作相互隔离的情况下。

## 注册多个服务

每次调用 `Register()` 都会将一个 socket 绑定到一个注册的可插拔组件。每种组件类型（输入/输出绑定、pub/sub 和状态存储）可以在每个 socket 上注册一个。

```go
func main() {
	dapr.Register("service-a", dapr.WithStateStore(func() state.Store {
		return &components.MyDatabaseStoreComponent{}
	}))

	dapr.Register("service-a", dapr.WithOutputBinding(func() bindings.OutputBinding {
		return &components.MyDatabaseOutputBindingComponent{}
	}))

	dapr.Register("service-b", dapr.WithStateStore(func() state.Store {
		return &components.MyDatabaseStoreComponent{}
	}))

	dapr.MustRun()
}
```

在上面的示例中，状态存储和输出绑定被注册到 socket `service-a`，而另一个状态存储被注册到 socket `service-b`。

## 配置多个组件

配置 Dapr 使用托管组件与配置单个组件的方式相同 - 组件的 YAML 文件中需要指明关联的 socket。例如，要为上面注册的两个组件（分别注册到 socket `service-a` 和 `service-b`）配置 Dapr 状态存储，您需要创建两个配置文件，每个文件引用其各自的 socket。

```yaml
#
# 此组件使用与 socket `service-a` 关联的状态存储
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-a
spec:
  type: state.service-a
  version: v1
  metadata: []
```

```yaml
#
# 此组件使用与 socket `service-b` 关联的状态存储
#
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: state-store-b
spec:
  type: state.service-b
  version: v1
  metadata: []
```

## 下一步
- 了解更多关于实现：
  - [绑定]({{< ref go-bindings >}})
  - [状态存储]({{< ref go-state-store >}})
  - [发布/订阅]({{< ref go-pub-sub >}})
