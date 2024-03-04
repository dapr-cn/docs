---
type: docs
title: "Dapr 可插拔组件 .Go SDK 的高级用法"
linkTitle: "Advanced"
weight: 2000
description: 如何使用 Dapr 可插拔组件 Go SDK 的高级技术
is_preview: true
---

虽然大多数人通常不需要这些指南，但这些指南展示了配置 Go 可插拔组件的高级方法。

## 组件生命周期

可插拔组件通过传递一个"工厂方法"进行注册，该方法将在与该套接字关联的每个配置的 Dapr 组件的每个类型中调用。 该方法返回与该 Dapr 组件关联的实例（无论是共享的还是非共享的）。 这样可以允许将同一类型的多个Dapr组件配置为具有不同的元数据集，当组件操作需要彼此隔离时等。

## 注册多个服务

每次调用`Register()`都会将套接字绑定到一个已注册的可插拔组件。 每个套接字可以注册每种组件类型（输入/输出绑定、发布/订阅和状态存储）的一个实例。

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

在上面的示例中，一个状态存储和输出绑定被注册到套接字`service-a`，而另一个状态存储被注册到套接字`service-b`。

## 配置多个组件

配置 Dapr 使用托管组件与任何单个组件的配置方式相同 - 组件的 YAML 引用关联的套接字。 例如，要为上面注册的两个组件（`service-a` 和 `service-b`）配置 Dapr 状态存储，您需要创建两个配置文件，分别引用它们各自的 socket。

```yaml
#
# This component uses the state store associated with socket `service-a`
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
# This component uses the state store associated with socket `service-b`
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
- 了解更多关于实施的内容：
  - [绑定]({{< ref go-bindings >}})
  - [State]({{< ref go-state-store >}})
  - [Pub/sub]({{< ref go-pub-sub >}})
