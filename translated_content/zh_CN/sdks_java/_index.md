---
type: docs
title: "Dapr Java SDK"
linkTitle: "Java"
weight: 1000
description: Java SDK packages for developing Dapr applications
---

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- JDK 11 或更高版本 - 已发布的 jar 与 Java 8 兼容：
    - [AdoptOpenJDK 11 - LTS](https://adoptopenjdk.net/)
    - [Oracle's JDK 15](https://www.oracle.com/java/technologies/javase-downloads.html)
    - [Oracle's JDK 11 - LTS](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
    - [OpenJDK](https://openjdk.java.net/)
- 安装以下 Java 构建工具之一：
    - [Maven 3.x](https://maven.apache.org/install.html)
    - [Gradle 6.x](https://gradle.org/install/)

## 导入 Dapr 的 Java SDK

对于 Maven 项目，请将以下内容添加到 `pom.xml` 文件中：
```java
<project>
  ...
  <dependencies>
    ...
     // Dapr's core SDK with all features, except Actors. 
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk</artifacetId>
      <version>1.1.0</version>
    </dependency>
    // Dapr's SDK for Actors (optional).
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-actors</artifactId>
      <version>1.1.0</version>>
    </dependency>
    // Dapr's SDK integration with SpringBoot (optional).
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-springboot</artifactId>
      <version>1.1.0</version>>
    </dependency>
    ...
  </dependencies>
  ...
</project>
```

对于 Gradle 项目，请将以下内容添加到 `build.gradle` 文件中：

```java
dependencies {
...
    // Dapr's core SDK with all features, except Actors.
    compile('io.dapr:dapr-sdk:1.1.0'))
    // Dapr's SDK for Actors (optional).
    compile('io.dapr:dapr-sdk-actors:1.1.0')
    // Dapr's SDK integration with SpringBoot (optional).
    compile('io.dapr:dapr-sdk-springboot:1.1.0')
}
```

## 构建块

Java SDK允许您与的所有 [Dapr构建块]({{< ref building-blocks >}}) 进行交互。

### 调用服务

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // invoke a 'GET' method (HTTP) skipping serialization: \say with a Mono<byte[]> return type
  // for gRPC set HttpExtension.NONE parameters below
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"name\":\"World!\"}", HttpExtension.GET, byte[].class).block();

  // invoke a 'POST' method (HTTP) skipping serialization: to \say with a Mono<byte[]> return type     
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"id\":\"100\", \"FirstName\":\"Value\", \"LastName\":\"Value\"}", HttpExtension.POST, byte[].class).block();

  System.out.println(new String(response));

  // invoke a 'POST' method (HTTP) with serialization: \employees with a Mono<Employee> return type      
  Employee newEmployee = new Employee("Nigel", "Guitarist");
  Employee employeeResponse = client.invokeMethod(SERVICE_TO_INVOKE, "employees", newEmployee, HttpExtension.POST, Employee.class).block();
}
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/invoke)，获取代码示例和说明，以试用服务调用。

### 保存 & 获取 应用程序状态

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import reactor.core.publisher.Mono;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // Save state
  client.saveState(STATE_STORE_NAME, FIRST_KEY_NAME, myClass).block();

  // Get state
  State<MyClass> retrievedMessage = client.getState(STATE_STORE_NAME, FIRST_KEY_NAME, MyClass.class).block();

  // Delete state
  client.deleteState(STATE_STORE_NAME, FIRST_KEY_NAME).block();
}
```

- 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/state)，获取代码示例和说明，以试用状态管理。

### 发布 & 订阅消息

##### 发布消息

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.Metadata;
import static java.util.Collections.singletonMap;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  client.publishEvent(PUBSUB_NAME, TOPIC_NAME, message, singletonMap(Metadata.TTL_IN_SECONDS, MESSAGE_TTL_IN_SECONDS)).block();
}
```

##### 订阅消息

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.Topic;
import io.dapr.client.domain.CloudEvent;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class SubscriberController {

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  @Topic(name = "testingtopic", pubsubName = "${myAppProperty:messagebus}")
  @PostMapping(path = "/testingtopic")
  public Mono<Void> handleMessage(@RequestBody(required = false) CloudEvent cloudEvent) {
    return Mono.fromRunnable(() -> {
      try {
        System.out.println("Subscriber got: " + cloudEvent.getData());
        System.out.println("Subscriber got: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    });
  }

}
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub/http)，获取代码示例和说明，以试用发布订阅。

### 与输出绑定交互

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // sending a class with message; BINDING_OPERATION="create"
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, myClass).block();

  // sending a plain string
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, message).block();
}
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http)，获取代码示例和说明，以使用输出绑定。

### 检索密钥

```java
import com.fasterxml.jackson.databind.ObjectMapper;
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import java.util.Map;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, secretKey).block();
  System.out.println(JSON_SERIALIZER.writeValueAsString(secret));
}
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/secrets)，获取代码示例和说明，以试用密钥检索。

### Actors
参与者是孤立的独立计算单元，具有单线程执行。 Dapr 提供了一个基于 [虚拟 Actor 模式](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/)的 actor 实现，它提供了一个单线程编程模型，其中 actor 在不使用时被垃圾回收。 通过 Dapr 的实现，您可以根据 Actors 模型编写 Dapr Actor，而 Dapr 利用底层平台提供的可扩展性和可靠性保证。

```java
import io.dapr.actors.ActorMethod;
import io.dapr.actors.ActorType;
import reactor.core.publisher.Mono;

@ActorType(name = "DemoActor")
public interface DemoActor {

  void registerReminder();

  @ActorMethod(name = "echo_message")
  String say(String something);

  void clock(String message);

  @ActorMethod(returns = Integer.class)
  Mono<Integer> incrementAndGet(int delta);
}
```

- 有关 Actor 的完整指南，请访问 [操作方法：在Dapr中使用 Actor ]({{< ref howto-actors.md >}})。
- 请访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors)，获取代码示例和说明，以试用 Actor。

## 相关链接
- [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)