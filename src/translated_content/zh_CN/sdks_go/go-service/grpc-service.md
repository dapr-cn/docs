---
type: docs
title: "使用 Dapr 服务（回调）SDK for Go 入门"
linkTitle: "gRPC 服务"
weight: 20000
description: 如何使用 Dapr 服务（回调）SDK for Go 快速上手
no_list: true
---

## Dapr gRPC 服务 SDK for Go

### 前置条件
首先，导入 Dapr Go 服务/gRPC 包：

```go
daprd "github.com/dapr/go-sdk/service/grpc"
```

### 创建和启动服务

要创建一个 gRPC Dapr 服务，首先需要在特定地址上创建一个 Dapr 回调实例：

```go
s, err := daprd.NewService(":50001")
if err != nil {
    log.Fatalf("无法启动服务器: %v", err)
}
```
或者，使用地址和现有的 net.Listener，以便与现有的服务器监听器结合：

```go
list, err := net.Listen("tcp", "localhost:0")
if err != nil {
	log.Fatalf("gRPC 监听器创建失败: %s", err)
}
s := daprd.NewServiceWithListener(list)
```

创建服务实例后，你可以为该服务添加任意数量的事件、绑定和服务调用处理程序，如下所示。定义好逻辑后，你就可以启动服务：

```go
if err := s.Start(); err != nil {
    log.Fatalf("服务器错误: %v", err)
}
```

### 事件处理
要处理来自特定主题的事件，你需要在启动服务之前添加至少一个主题事件处理程序：

```go
sub := &common.Subscription{
		PubsubName: "messages",
		Topic:      "topic1",
	}
if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
    log.Fatalf("添加主题订阅时出错: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("事件 - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
	// 在这里处理事件
	return true, nil
}
```

你可以选择使用[路由规则](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/)根据 CloudEvent 的内容将消息路由到不同的处理程序。

```go
sub := &common.Subscription{
	PubsubName: "messages",
	Topic:      "topic1",
	Route:      "/important",
	Match:      `event.type == "important"`,
	Priority:   1,
}
err := s.AddTopicEventHandler(sub, importantHandler)
if err != nil {
	log.Fatalf("添加主题订阅时出错: %v", err)
}
```

你还可以创建一个自定义类型来实现 `TopicEventSubscriber` 接口，以处理你的事件：

```go
type EventHandler struct {
	// 你的事件处理程序需要的任何数据或引用。
}

func (h *EventHandler) Handle(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    log.Printf("事件 - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
    // 在这里处理事件
    return true, nil
}
```

然后可以使用 `AddTopicEventSubscriber` 方法添加 `EventHandler`：

```go
sub := &common.Subscription{
    PubsubName: "messages",
    Topic:      "topic1",
}
eventHandler := &EventHandler{
// 初始化任何字段
}
if err := s.AddTopicEventSubscriber(sub, eventHandler); err != nil {
    log.Fatalf("添加主题订阅时出错: %v", err)
}
```

### 服务调用处理程序
要处理服务调用，你需要在启动服务之前添加至少一个服务调用处理程序：

```go
if err := s.AddServiceInvocationHandler("echo", echoHandler); err != nil {
    log.Fatalf("添加调用处理程序时出错: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func echoHandler(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
	log.Printf("回声 - ContentType:%s, Verb:%s, QueryString:%s, %+v", in.ContentType, in.Verb, in.QueryString, string(in.Data))
	// 在这里处理调用
	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}
	return
}
```

### 绑定调用处理程序
要处理绑定调用，你需要在启动服务之前添加至少一个绑定调用处理程序：

```go
if err := s.AddBindingInvocationHandler("run", runHandler); err != nil {
    log.Fatalf("添加绑定处理程序时出错: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
	log.Printf("绑定 - Data:%v, Meta:%v", in.Data, in.Metadata)
	// 在这里处理调用
	return nil, nil
}
```

## 相关链接
- [Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples)