---
type: docs
title: "Dapr SDK 中的序列化"
linkTitle: "序列化（Serialization）"
description: "Dapr 如何在 SDK 中序列化数据"
weight: 2000
aliases:
  - '/zh-hans/developing-applications/sdks/serialization/'
---

An SDK for Dapr should provide serialization for two use cases. First, for API objects sent through request and response payloads. Second, for objects to be persisted. For both these use cases, a default serialization is provided. In the Java SDK, it is the [DefaultObjectSerializer](https://dapr.github.io/java-sdk/io/dapr/serializer/DefaultObjectSerializer.html) class, providing JSON serialization.

## 调用逻辑

```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeService("myappid", "saySomething", "My Message", HttpExtension.POST).block();
```

在上面的示例中，应用程序将收到一个对 `saySomething` 方法的 `POST` 请求，请求的有效载荷为 `"My Message"`，这句说明中给它添加了引号是因为序列化工具会把输入的 String 字符串序列化为 JSON。

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
在这个例子中，`My Message` 将被保存下来。 在这句说明中，没有给数据加上引号是因为 Dapr 的 API 会在保存 JSON 请求对象之前在内部进行解析。

```JSON
[
    {
        "key": "MyKey",
        "value": "My Message"
    }
]
```

## PubSub

```java
  DaprClient client = (new DaprClientBuilder()).build();
  client.publishEvent("TopicName", "My Message").block();
```

事件发布，内容被序列化为 `byte[]` 类型并发送到 Dapr sidecar。 订阅者将以 [CloudEvent](https://github.com/cloudevents/spec) 的格式收到它。 CloudEvent 将 `data` 定义为 String。 Dapr SDK 还为 `CloudEvent` 对象提供了一个内置的反序列化工具。

```java
  @PostMapping(path = "/TopicName")
  public void handleMessage(@RequestBody(required = false) byte[] body) {
      // Dapr's event is compliant to CloudEvent.
      CloudEvent event = CloudEvent.deserialize(body);
  }
      CloudEvent event = CloudEvent.deserialize(body);
  }
```

## 绑定

在这种情况下，对象也会被序列化为 `byte[]` 类型，而输入绑定会按原样接收原始的 `byte[]`，并将其反序列化为预期的对象类型。

* Output binding:
```java
    DaprClient client = (new DaprClientBuilder()).build();
    client.invokeBinding("sample", "My Message").block();
```

* 输入绑定:
```java
  @PostMapping(path = "/sample")
  public void handleInputBinding(@RequestBody(required = false) byte[] body) {
      String message = (new DefaultObjectSerializer()).deserialize(body, String.class);
      System.out.println(message);
  }
```
应当会出现如下输出:
```
My Message
```

## 调用 Actor 方法
Actor 方法调用的对象序列化和反序列化与服务方法调用相同，唯一不同的是应用程序不需要反序列化请求或序列化响应，因为这一切都由 SDK 透明地完成。

对于 Actor 的方法，SDK 只支持无参或一个参数的方法。

* 调用 Actor 的方法:
```java
public static void main() {
    ActorProxyBuilder builder = new ActorProxyBuilder("DemoActor");
    String result = actor.invokeActorMethod("say", "My Message", String.class).block();
}
```

* 实现 Actor 的方法:
```java
public String say(String something) {
  System.out.println(something);
  return "OK";
}
```
应当会出现如下输出:
```
    My Message
```

## Actor 状态管理
Actor 也可以有状态。 在这种情况下，状态管理器将使用状态序列化工具对对象进行序列化和反序列化，并对应用程序进行透明处理。

```java
public String actorMethod(String message) {
    // Reads a state from key and deserializes it to String.
    String previousMessage = super.getActorStateManager().get("lastmessage", String.class).block();

    // Sets the new state for the key after serializing it.
    super.getActorStateManager().set("lastmessage", message).block();
    return previousMessage;
}
```

## 默认序列化工具

Dapr 的默认序列化工具是 JSON 序列化工具，其期望如下:

1. Use of basic [JSON data types](https://www.w3schools.com/js/js_json_datatypes.asp) for cross-language and cross-platform compatibility: string, number, array, boolean, null and another JSON object. Every complex property type in application's serializable objects (DateTime, for example), should be represented as one of the JSON's basic types.
2. Data persisted with the default serializer should be saved as JSON objects too, without extra quotes or encoding. The example below shows how a string and a JSON object would look like in a Redis store.
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"This is a message to be saved and retrieved."
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
{"value":"My data value."}
```
3. Custom serializers must serialize object to `byte[]`.
4. 自定义序列化工具必须将`byte[]`反序列化为对象。
5. 当用户提供一个自定义的序列化工具时，它应该以`byte[]`的形式被传输或持久化， 持久化时，也应当编码为Base64字符串， 大多数JSON库都能够完成这个功能。
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"VGhpcyBpcyBhIG1lc3NhZ2UgdG8gYmUgc2F2ZWQgYW5kIHJldHJpZXZlZC4="
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
"eyJ2YWx1ZSI6Ik15IGRhdGEgdmFsdWUuIn0="
```

*目前而言，[Java SDK](https://github.com/dapr/java-sdk/)是唯一实现该规范的Dapr SDK。 在不久的将来，其他SDK也会实现同样的功能。*
