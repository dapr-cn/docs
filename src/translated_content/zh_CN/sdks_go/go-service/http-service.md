---
type: docs
title: "使用 Dapr HTTP 服务 SDK for Go 入门"
linkTitle: "HTTP 服务"
weight: 10000
description: 如何使用 Dapr HTTP 服务 SDK for Go 快速上手
no_list: true
---

### 前置条件
首先导入 Dapr Go 的 service/http 包：

```go
daprd "github.com/dapr/go-sdk/service/http"
```

### 创建和启动服务
要创建一个 HTTP Dapr 服务，首先需要在特定地址上创建一个 Dapr 回调实例：

```go
s := daprd.NewService(":8080")
```

或者结合现有的 http.ServeMux 使用特定地址创建服务，以便与现有服务器集成：

```go
mux := http.NewServeMux()
mux.HandleFunc("/", myOtherHandler)
s := daprd.NewServiceWithMux(":8080", mux)
```

创建服务实例后，你可以添加任意数量的事件、绑定和服务调用处理程序。定义好这些逻辑后，就可以启动服务：

```go
if err := s.Start(); err != nil && err != http.ErrServerClosed {
	log.Fatalf("error: %v", err)
}
```

### 事件处理
要处理来自特定主题的事件，你需要在启动服务之前添加至少一个主题事件处理程序：

```go
sub := &common.Subscription{
	PubsubName: "messages",
	Topic:      "topic1",
	Route:      "/events",
}
err := s.AddTopicEventHandler(sub, eventHandler)
if err != nil {
	log.Fatalf("error adding topic subscription: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
	log.Printf("event - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
	// 处理事件
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
	log.Fatalf("error adding topic subscription: %v", err)
}
```

你还可以创建一个自定义类型来实现 `TopicEventSubscriber` 接口以处理事件：

```go
type EventHandler struct {
	// 事件处理程序所需的任何数据或引用。
}

func (h *EventHandler) Handle(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    log.Printf("event - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
    // 处理事件
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
// 初始化字段
}
if err := s.AddTopicEventSubscriber(sub, eventHandler); err != nil {
    log.Fatalf("error adding topic subscription: %v", err)
}
```

### 服务调用处理程序
要处理服务调用，你需要在启动服务之前添加至少一个服务调用处理程序：

```go
if err := s.AddServiceInvocationHandler("/echo", echoHandler); err != nil {
	log.Fatalf("error adding invocation handler: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func echoHandler(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
	log.Printf("echo - ContentType:%s, Verb:%s, QueryString:%s, %+v", in.ContentType, in.Verb, in.QueryString, string(in.Data))
	// 处理调用
	out = &common.Content{
		Data:        in.Data,
		ContentType: in.ContentType,
		DataTypeURL: in.DataTypeURL,
	}
	return
}
```

### 绑定调用处理程序

```go
if err := s.AddBindingInvocationHandler("/run", runHandler); err != nil {
	log.Fatalf("error adding binding handler: %v", err)
}
```

处理程序方法可以是任何符合预期签名的方法：

```go
func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
	log.Printf("binding - Data:%v, Meta:%v", in.Data, in.Metadata)
	// 处理调用
	return nil, nil
}
```

## 相关链接
- [Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples)