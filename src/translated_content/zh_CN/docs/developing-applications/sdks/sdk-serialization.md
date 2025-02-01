---
type: docs
title: "Dapr SDK中的序列化"
linkTitle: "序列化"
description: "Dapr如何在SDK中序列化数据"
weight: 2000
aliases:
  - '/zh-hans/developing-applications/sdks/serialization/'
---

Dapr的SDK应该提供两种用例的序列化功能。首先是通过请求和响应负载发送的API对象。其次是需要持久化的对象。对于这两种用例，SDK提供了默认的序列化。在Java SDK中，使用[DefaultObjectSerializer](https://dapr.github.io/java-sdk/io/dapr/serializer/DefaultObjectSerializer.html)类来进行JSON序列化。

## 服务调用

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeService("myappid", "saySomething", "My Message", HttpExtension.POST).block();
```

在上面的示例中，应用程序会收到一个针对`saySomething`方法的`POST`请求，请求负载为`"My Message"` - 引号是因为序列化器会将输入字符串序列化为JSON格式。

```text
POST /saySomething HTTP/1.1
Host: localhost
Content-Type: text/plain
Content-Length: 12

"My Message"
```

## 状态管理

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.saveState("MyStateStore", "MyKey", "My Message").block();
```
在此示例中，`My Message`将被保存。它没有加引号，因为Dapr的API会在内部解析JSON请求对象后再保存它。

```JSON
[
    {
        "key": "MyKey",
        "value": "My Message"
    }
]
```

## 发布订阅

```java
  DaprClient client = (new DaprClientBuilder()).build();
  client.publishEvent("TopicName", "My Message").block();
```

事件被发布，内容被序列化为`byte[]`并发送到Dapr sidecar。订阅者将以[CloudEvent](https://github.com/cloudevents/spec)的形式接收它。CloudEvent定义`data`为字符串。Dapr SDK还为`CloudEvent`对象提供了内置的反序列化器。

```java
  @PostMapping(path = "/TopicName")
  public void handleMessage(@RequestBody(required = false) byte[] body) {
      // Dapr的事件符合CloudEvent。
      CloudEvent event = CloudEvent.deserialize(body);
  }
```

## 绑定

在这种情况下，对象也被序列化为`byte[]`，输入绑定接收原始的`byte[]`并将其反序列化为预期的对象类型。

* 输出绑定：
```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeBinding("sample", "My Message").block();
```

* 输入绑定：
```java
  @PostMapping(path = "/sample")
  public void handleInputBinding(@RequestBody(required = false) byte[] body) {
      String message = (new DefaultObjectSerializer()).deserialize(body, String.class);
      System.out.println(message);
  }
```
它应该打印：
```
My Message
```

## actor方法调用
actor方法调用的对象序列化和反序列化与服务方法调用相同，唯一的区别是应用程序不需要手动反序列化请求或序列化响应，因为这些操作都由SDK自动完成。

对于actor的方法，SDK仅支持具有零个或一个参数的方法。

* 调用actor的方法：
```java
public static void main() {
    ActorProxyBuilder builder = new ActorProxyBuilder("DemoActor");
    String result = actor.invokeActorMethod("say", "My Message", String.class).block();
}
```

* 实现actor的方法：
```java
public String say(String something) {
  System.out.println(something);
  return "OK";
}
```
它应该打印：
```
    My Message
```

## actor的状态管理
actor也可以有状态。在这种情况下，状态管理器将使用状态序列化器来序列化和反序列化对象，并自动处理这些操作。

```java
public String actorMethod(String message) {
    // 从键读取状态并将其反序列化为字符串。
    String previousMessage = super.getActorStateManager().get("lastmessage", String.class).block();

    // 在序列化后为键设置新状态。
    super.getActorStateManager().set("lastmessage", message).block();
    return previousMessage;
}
```

## 默认序列化器

Dapr的默认序列化器是一个JSON序列化器，具有以下期望：

1. 使用基本的[JSON数据类型](https://www.w3schools.com/js/js_json_datatypes.asp)以实现跨语言和跨平台的兼容性：字符串、数字、数组、布尔值、null和另一个JSON对象。应用程序可序列化对象中的每个复杂属性类型（例如DateTime）都应表示为JSON的基本类型之一。
2. 使用默认序列化器持久化的数据也应保存为JSON对象，没有额外的引号或编码。下面的示例显示了字符串和JSON对象在Redis存储中的样子。
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"This is a message to be saved and retrieved."
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
{"value":"My data value."}
```
3. 自定义序列化器必须将对象序列化为`byte[]`。
4. 自定义序列化器必须将`byte[]`反序列化为对象。
5. 当用户提供自定义序列化器时，它应作为`byte[]`传输或持久化。持久化时，也要编码为Base64字符串。这是大多数JSON库本地完成的。
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"VGhpcyBpcyBhIG1lc3NhZ2UgdG8gYmUgc2F2ZWQgYW5kIHJldHJpZXZlZC4="
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
"eyJ2YWx1ZSI6Ik15IGRhdGEgdmFsdWUuIn0="
```

*截至目前，[Java SDK](https://github.com/dapr/java-sdk/)是唯一实现此规范的Dapr SDK。在不久的将来，其他SDK也将实现相同的功能。*