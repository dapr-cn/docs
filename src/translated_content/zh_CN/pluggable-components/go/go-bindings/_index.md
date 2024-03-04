---
type: docs
title: "实现一个Go输入/输出绑定组件"
linkTitle: "绑定"
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 创建一个输入/输出绑定
no_list: true
is_preview: true
---

创建一个绑定组件只需要几个基本步骤。

## 导入绑定包

创建文件`components/inputbinding.go`并添加与状态存储相关的`import`语句。

```go
package components

import (
    "context"
    "github.com/dapr/components-contrib/bindings"
)
```

## 输入绑定: 实现`InputBinding`接口

创建一个实现`InputBinding`接口的类型。

```go
type MyInputBindingComponent struct {
}

func (component *MyInputBindingComponent) Init(meta bindings.Metadata) error {
    // Called to initialize the component with its configured metadata...
}

func (component *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
    // Until canceled, check the underlying store for messages and deliver them to the Dapr runtime...
}
```

调用`Read()`方法应该设置一个长期存在的机制来获取消息，但立即返回`nil`（或错误，如果无法设置该机制）。 当被取消时（例如，通过`ctx.Done()或ctx.Err() != nil`），机制应该结束。 当消息从组件的底层存储中读取时，它们通过`handler`回调函数传递给Dapr运行时，直到应用程序（由Dapr运行时提供服务）确认处理消息后才返回。

```go
func (b *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
    go func() {
        for {
            err := ctx.Err()

            if err != nil {
                return
            }

            messages := // Poll for messages...

            for _, message := range messages {
                handler(ctx, &bindings.ReadResponse{
                    // Set the message content...
                })
            }

            select {
                case <-ctx.Done():
                case <-time.After(5 * time.Second):
            } 
        }
    }()

    return nil
}
```

## 输出绑定: 实现`OutputBinding`接口

创建一个实现`OutputBinding`接口的类型。

```go
type MyOutputBindingComponent struct {
}

func (component *MyOutputBindingComponent) Init(meta bindings.Metadata) error {
    // Called to initialize the component with its configured metadata...
}

func (component *MyOutputBindingComponent) Invoke(ctx context.Context, req *bindings.InvokeRequest) (*bindings.InvokeResponse, error) {
    // Called to invoke a specific operation...
}

func (component *MyOutputBindingComponent) Operations() []bindings.OperationKind {
    // Called to list the operations that can be invoked.
}
```

## 输入和输出绑定组件

一个组件可以通过实现两个接口，_同时_成为输入和输出绑定。 只需实现两个接口并将组件注册为两种绑定类型。

## 注册绑定组件

在主应用程序文件中（例如，`main.go`），将绑定组件注册到应用程序。

```go
package main

import (
    "example/components"
    dapr "github.com/dapr-sandbox/components-go-sdk"
    "github.com/dapr-sandbox/components-go-sdk/bindings/v1"
)

func main() {
    // Register an import binding...
    dapr.Register("my-inputbinding", dapr.WithInputBinding(func() bindings.InputBinding {
        return &components.MyInputBindingComponent{}
    }))

    // Register an output binding...
    dapr.Register("my-outputbinding", dapr.WithOutputBinding(func() bindings.OutputBinding {
        return &components.MyOutputBindingComponent{}
    }))

    dapr.MustRun()
}
```

## 下一步
- [Dapr 可插拔组件 Go SDK 的高级技巧]({{< ref go-advanced >}})
- 了解更多关于实施的内容：
  - [State]({{< ref go-state-store >}})
  - [Pub/sub]({{< ref go-pub-sub >}})
