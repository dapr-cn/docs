---
type: docs
title: "实现一个 Go pub/sub 组件"
linkTitle: "Pub/sub"
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 创建一个 pub/sub 组件
no_list: true
is_preview: true
---

创建一个 pub/sub 组件只需几个基本步骤。

## 导入 pub/sub 包

创建文件 `components/pubsub.go` 并添加 `import` 语句以导入与 pub/sub 相关的包。

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/pubsub"
)
```

## 实现 `PubSub` 接口

创建一个实现 `PubSub` 接口的类型。

```go
type MyPubSubComponent struct {
}

func (component *MyPubSubComponent) Init(metadata pubsub.Metadata) error {
	// 使用配置的元数据初始化组件...
}

func (component *MyPubSubComponent) Close() error {
    // 不用于可插拔组件...
	return nil
}

func (component *MyPubSubComponent) Features() []pubsub.Feature {
	// 返回组件支持的功能列表...
}

func (component *MyPubSubComponent) Publish(req *pubsub.PublishRequest) error {
	// 将消息发送到 "topic"...
}

func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	// 设置一个长时间运行的机制来检索消息，直到取消为止，并将其传递给 Dapr 运行时...
}
```

调用 `Subscribe()` 方法时，需要设置一个长时间运行的机制来检索消息，并立即返回 `nil`（如果无法设置该机制，则返回错误）。该机制应在取消时结束（例如，通过 `ctx.Done()` 或 `ctx.Err() != nil`）。消息的 "topic" 是通过 `req` 参数传递的，而传递给 Dapr 运行时的消息则通过 `handler` 回调来处理。回调在应用程序（由 Dapr 运行时服务）确认处理消息之前不会返回。

```go
func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	go func() {
		for {
			if ctx.Err() != nil {
				return
			}
	
			messages := // 轮询消息...

            for _, message := range messages {
                handler(ctx, &pubsub.NewMessage{
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

## 注册 pub/sub 组件

在主应用程序文件中（例如，`main.go`），注册 pub/sub 组件。

```go
package main

import (
	"example/components"
	dapr "github.com/dapr-sandbox/components-go-sdk"
	"github.com/dapr-sandbox/components-go-sdk/pubsub/v1"
)

func main() {
	dapr.Register("<socket name>", dapr.WithPubSub(func() pubsub.PubSub {
		return &components.MyPubSubComponent{}
	}))

	dapr.MustRun()
}
```

## 下一步
- [使用可插拔组件 Go SDK 的高级技术]({{< ref go-advanced >}})
- 了解更多关于实现：
  - [bindings]({{< ref go-bindings >}})
  - [state]({{< ref go-state-store >}})
