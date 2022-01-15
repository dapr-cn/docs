---
type: 文档
title: "开始 Dapr Service (Callback) SDK"
linkTitle: "gRPC 服务"
weight: 20000
description: 如何开始和运行 Dapr Service (Callback) SDK
no_list: true
---

## Dapr gRPC Service SDK for Go

### 前提条件
首先导入 Dapr Go service/grpc 包：

```go
daprd "github.com/dapr/go-sdk/service/grpc"
```

### 创建和启动服务

要创建 gRPC Dapr服务，首先创建一个带有特定地址的 Dapr 回调实例：

```go
s, err := daprd.NewService(":50001")
if err != nil {
    log.Fatalf("failed to start the server: %v", err)
}
```
或者通过地址和现有的 net.Listener ，如果您想要合并现有服务器监听器：

```go
list, err := net.Listen("tcp", "localhost:0")
if err != nil {
    log.Fatalf("gRPC listener creation failed: %s", err)
}
s := daprd.NewServiceWithListener(list)
```

一旦您创建了一个服务实例，您可以在该服务中“attach”以下显示的事件数量、绑定和服务调用逻辑处理程序。 定义逻辑后，即可启动服务：

```go
if err := s.Start(); err != nil {
    log.Fatalf("server error: %v", err)
}
```

### 事件处理
要处理特定主题的事件，您需要在启动服务之前添加至少一个主题事件处理程序：

```go
sub := &common.Subscription{
        PubsubName: "messages",
        Topic:      "topic1",
    }
if err := s.AddTopicEventHandler(sub, eventHandler); err != nil {
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
要处理服务的调用，您需要在启动服务之前至少添加一个服务调用处理程序：

```go
if err := s.AddServiceInvocationHandler("echo", echoHandler); err != nil {
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
若要处理绑定调用，需要在启动服务之前添加至少一个绑定调用处理程序：

```go
if err := s.AddBindingInvocationHandler("run", runHandler); err != nil {
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
