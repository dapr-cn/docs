---
type: docs
title: "实现一个Go输入/输出绑定组件"
linkTitle: "绑定"
weight: 1000
description: 如何使用Dapr可插拔组件Go SDK创建一个输入/输出绑定
no_list: true
is_preview: true
---

创建绑定组件只需几个基本步骤。

## 导入绑定包

创建文件 `components/inputbinding.go` 并添加与状态存储相关的包的 `import` 语句。

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/bindings"
)
```

## 输入绑定：实现 `InputBinding` 接口

创建一个实现 `InputBinding` 接口的类型。

```go
type MyInputBindingComponent struct {
}

func (component *MyInputBindingComponent) Init(meta bindings.Metadata) error {
	// 用于初始化组件的配置元数据...
}

func (component *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
	// 设置一个长期机制来检索消息，直到取消为止...
}
```

调用 `Read()` 方法时，应该设置一个长期运行的机制来检索消息，并立即返回 `nil`（如果无法设置该机制，则返回错误）。当取消时（例如，通过 `ctx.Done()` 或 `ctx.Err() != nil`），该机制应停止。当从组件的底层存储读取消息时，它们通过 `handler` 回调传递给Dapr运行时，直到应用程序（由Dapr运行时服务）确认消息处理后才返回。

```go
func (b *MyInputBindingComponent) Read(ctx context.Context, handler bindings.Handler) error {
	go func() {
		for {
			if ctx.Err() != nil {
				return
			}
	
			messages := // 轮询消息...

            for _, message := range messages {
                handler(ctx, &bindings.ReadResponse{
                    // 设置消息内容...
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

## 输出绑定：实现 `OutputBinding` 接口

创建一个实现 `OutputBinding` 接口的类型。

```go
type MyOutputBindingComponent struct {
}

func (component *MyOutputBindingComponent) Init(meta bindings.Metadata) error {
	// 用于初始化组件的配置元数据...
}

func (component *MyOutputBindingComponent) Invoke(ctx context.Context, req *bindings.InvokeRequest) (*bindings.InvokeResponse, error) {
	// 调用特定操作时执行...
}

func (component *MyOutputBindingComponent) Operations() []bindings.OperationKind {
	// 列出可以调用的操作。
}
```

## 输入和输出绑定组件

一个组件可以同时作为输入和输出绑定。只需实现两个接口，并将组件注册为两种绑定类型即可。

## 注册绑定组件

在主应用程序文件中（例如，`main.go`），将绑定组件注册到应用程序中。

```go
package main

import (
	"example/components"
	dapr "github.com/dapr-sandbox/components-go-sdk"
	"github.com/dapr-sandbox/components-go-sdk/bindings/v1"
)

func main() {
	// 注册一个输入绑定...
	dapr.Register("my-inputbinding", dapr.WithInputBinding(func() bindings.InputBinding {
		return &components.MyInputBindingComponent{}
	}))

	// 注册一个输出绑定...
	dapr.Register("my-outputbinding", dapr.WithOutputBinding(func() bindings.OutputBinding {
		return &components.MyOutputBindingComponent{}
	}))

	dapr.MustRun()
}
```

## 下一步
- [使用可插拔组件Go SDK的高级技术]({{< ref go-advanced >}})
- 了解更多关于实现：
  - [状态]({{< ref go-state-store >}})
  - [发布/订阅]({{< ref go-pub-sub >}})
