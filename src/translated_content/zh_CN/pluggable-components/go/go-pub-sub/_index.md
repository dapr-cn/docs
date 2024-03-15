---
type: docs
title: 实现一个Go pub/sub组件
linkTitle: Pub/sub
weight: 1000
description: 如何使用 Dapr 可插拔组件 Go SDK 创建发布/订阅组件
no_list: true
is_preview: true
---

创建一个Pub/sub组件只需要几个基本步骤。

## 导入pub/sub包

创建文件`components/pubsub.go`并添加`import`语句，用于Pub/sub相关的包。

```go
package components

import (
	"context"
	"github.com/dapr/components-contrib/pubsub"
)
```

## 实现 `PubSub` 接口

创建一个实现`PubSub`接口的类型。

```go
type MyPubSubComponent struct {
}

func (component *MyPubSubComponent) Init(metadata pubsub.Metadata) error {
	// Called to initialize the component with its configured metadata...
}

func (component *MyPubSubComponent) Close() error {
    // Not used with pluggable components...
	return nil
}

func (component *MyPubSubComponent) Features() []pubsub.Feature {
	// Return a list of features supported by the component...
}

func (component *MyPubSubComponent) Publish(req *pubsub.PublishRequest) error {
	// Send the message to the "topic"...
}

func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	// Until canceled, check the topic for messages and deliver them to the Dapr runtime...
}
```

调用`Subscribe()`方法应该设置一个长期存在的机制来获取消息，但立即返回`nil`（或错误，如果无法设置该机制）。 当被取消时（例如，通过`ctx.Done()`或`ctx.Err() != nil`），机制应该结束。 "topic"从中拉取消息的方式是通过`req`参数传递，而将消息传递给Dapr运行时是通过`handler`回调函数执行的。 回调函数在应用程序（由 Dapr 运行时提供服务）确认处理消息后才返回。

```go
func (component *MyPubSubComponent) Subscribe(ctx context.Context, req pubsub.SubscribeRequest, handler pubsub.Handler) error {
	go func() {
		for {
			err := ctx.Err()

			if err != nil {
				return
			}
	
			messages := // Poll for messages...

            for _, message := range messages {
                handler(ctx, &pubsub.NewMessage{
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

## 注册pub/sub组件

在主应用程序文件中（例如，`main.go`），注册 Pub/sub 组件到应用程序。

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

- [Dapr 可插拔组件 Go SDK 的高级技巧]({{< ref go-advanced >}})
- 详细了解如何实现：
  - [绑定]({{< ref go-bindings >}})
  - [状态]({{< ref go-state-store >}})
