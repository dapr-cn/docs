---
type: docs
title: "Dapr HTTP 服务 SDK for Go 入门"
linkTitle: "HTTP 服务"
weight: 10000
description: 如何使用 Dapr HTTP 服务 SDK for Go 启动和运行
no_list: true
---

### 先决条件
首先导入 Dapr Go service/http 包：

```go
daprd "github.com/dapr/go-sdk/service/http"
```

### 创建和启动服务
要创建 HTTP Dapr 服务，首先创建一个具有特定地址的 Dapr 回调实例：

```go
s := daprd.NewService(":8080")
```

或者通过地址和现有的 http.ServeMux 来合并现有服务器实现：

```go
mux := http.NewServeMux()
mux.HandleFunc("/", myOtherHandler)
s := daprd.NewServiceWithMux(":8080", mux)
```

一旦你创建了一个服务实例，你就可以给该服务 "附加 "任何数量的事件、绑定和服务调用逻辑处理程序，如下所示。 定义逻辑后，即可启动服务：

```go
if err := s.Start(); err != nil && err != http.ErrServerClosed {
    log.Fatalf("error: %v", err)
}
```

### 事件处理
要处理来自特定主题的事件，您需要在启动服务之前至少添加一个主题事件处理程序：

```go
sub := &common.Subscription{
    PubsubName: "messages",
    Topic: "topic1",
    Route: "/events",
}
err := s.AddTopicEventHandler(sub, eventHandler)
if err != nil {
    log.Fatalf("error adding topic subscription: %v", err)
}
```

处理程序方法本身可以是具有预期签名的任何方法：

```go
func eventHandler(ctx context.Context, e *common.TopicEvent) (retry bool, err error) {
    log.Printf("event - PubsubName:%s, Topic:%s, ID:%s, Data: %v", e.PubsubName, e.Topic, e.ID, e.Data)
    // do something with the event
    return true, nil
}
```

### 服务调用处理
要处理服务调用，您需要在启动服务之前添加至少一个服务调用处理程序：

```go
if err := s.AddServiceInvocationHandler("/echo", echoHandler); err != nil {
    log.Fatalf("error adding invocation handler: %v", err)
}
```

处理程序方法本身可以是具有预期签名的任何方法：


```go
func echoHandler(ctx context.Context, in *common.InvocationEvent) (out *common.Content, err error) {
    log.Printf("echo - ContentType:%s, Verb:%s, QueryString:%s, %+v", in.ContentType, in.Verb, in.QueryString, string(in.Data))
    // do something with the invocation here 
    out = &common.Content{
        Data:        in.Data,
        ContentType: in.ContentType,
        DataTypeURL: in.DataTypeURL,
    }
    return
}
```

### 绑定调用处理

```go
if err := s.AddBindingInvocationHandler("/run", runHandler); err != nil {
    log.Fatalf("error adding binding handler: %v", err)
}
```

处理程序方法本身可以是具有预期签名的任何方法：

```go
func runHandler(ctx context.Context, in *common.BindingEvent) (out []byte, err error) {
    log.Printf("binding - Data:%v, Meta:%v", in.Data, in.Metadata)
    // do something with the invocation here 
    return nil, nil
}
```
## 相关链接
- [Go SDK 示例](https://github.com/dapr/go-sdk/tree/main/examples)
