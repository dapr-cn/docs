---
type: docs
title: "Dapr SDK 中的序列化"
linkTitle: "序列化（Serialization）"
description: "Dapr 如何在 SDK 中序列化数据"
weight: 2000
aliases:
  - '/zh-hans/developing-applications/sdks/serialization/'
---

Dapr 的 SDK 为下面两种情况提供序列化： 首先是对于通过请求和响应的有效载荷传递的 API 对象。 其次，对于要持久化的对象。 对于这两种情况，Sdk 都提供了默认的序列化实现。 在 Java SDK 中，由 [DefaultObjectSerializer](https://dapr.github.io/java-sdk/io/dapr/serializer/DefaultObjectSerializer.html) 这个类提供 JSON 序列化功能。

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

* 输出绑定:
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

1. 使用基本的[JSON数据类型](https://www.w3schools.com/js/js_json_datatypes.asp)来实现跨语言和跨平台的兼容性：字符串、数字、数组、布尔值、空值和另一个 JSON 对象。 应用程序的可序列化对象中的每一个复杂的属性类型（例如DateTime），都应该被表示为JSON的基本类型之一。
2. 用默认序列化工具持久化的数据也应该被保存为JSON对象，不需要额外的引号或编码。 下面的例子显示了一个字符串和一个JSON对象在Redis存储中的样子。
```bash
redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||message
"This is a message to be saved and retrieved."
```
```bash
 redis-cli MGET "ActorStateIT_StatefulActorService||StatefulActorTest||1581130928192||mydata
{"value":"My data value."}
```
3. 自定义序列化工具必须将对象序列化为`byte[]`类型。
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
