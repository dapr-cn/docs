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
- JDK 11 or above - the published jars are compatible with Java 8:
    - [AdoptOpenJDK 11 - LTS](https://adoptopenjdk.net/)
    - [Oracle's JDK 15](https://www.oracle.com/java/technologies/javase-downloads.html)
    - [Oracle's JDK 11 - LTS](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
    - [OpenJDK](https://openjdk.java.net/)
- Install one of the following build tools for Java:
    - [Maven 3.x](https://maven.apache.org/install.html)
    - [Gradle 6.x](https://gradle.org/install/)

## Importing Dapr's Java SDK

For a Maven project, add the following to your `pom.xml` file:
```xml
<project>
  ...
  <dependencies>
    ...
    <!-- Dapr's core SDK with all features, except Actors. -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk</artifactId>
      <version>1.4.0</version>
    </dependency>
    <!-- Dapr's SDK for Actors (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-actors</artifactId>
      <version>1.4.0</version>
    </dependency>
    <!-- Dapr's SDK integration with SpringBoot (optional). -->
    <dependency>
      <groupId>io.dapr</groupId>
      <artifactId>dapr-sdk-springboot</artifactId>
      <version>1.4.0</version>
    </dependency>
    ...
  </dependencies>
  ...
</project>
```

For a Gradle project, add the following to your `build.gradle` file:

```java
dependencies {
...
    // Dapr's core SDK with all features, except Actors.
    compile('io.dapr:dapr-sdk:1.4.0')
    // Dapr's SDK for Actors (optional).
    compile('io.dapr:dapr-sdk-actors:1.4.0')
    // Dapr's SDK integration with SpringBoot (optional).
    compile('io.dapr:dapr-sdk-springboot:1.4.0')
}
```

如果您还使用Spring Boot，则可能会遇到一个常见问题，即Dapr SDK使用的OkHttp版本与Spring Boot _材料清单_中指定的版本冲突。 您可以通过在项目中指定兼容的 OkHttp 版本来解决此问题，以匹配 Dapr SDK 使用的版本：

```xml
<dependency>
  <groupId>com.squareup.okhttp3</groupId>
  <artifactId>okhttp</artifactId>
  <version>1.4.0</version>
</dependency>
```

## 构建块

The Java SDK allows you to interface with all of the [Dapr building blocks]({{< ref building-blocks >}}).

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
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/invoke) for code samples and instructions to try out service invocation

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
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/state) for code samples and instructions to try out state management

### Publish & subscribe to messages

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

##### Subscribe to messages

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
  public Mono<Void> handleMessage(@RequestBody(required = false) CloudEvent<?> cloudEvent) {
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
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub/http) for code samples and instructions to try out pub/sub

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
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) for code samples and instructions to try out output bindings

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
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/secrets) for code samples and instructions to try out retrieving secrets

### 参与者
参与者是孤立的独立计算单元，具有单线程执行。 Dapr provides an actor implementation based on the [Virtual Actor pattern](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/), which provides a single-threaded programming model and where actors are garbage collected when not in use. With Dapr's implementaiton, you write your Dapr actors according to the Actor model, and Dapr leverages the scalability and reliability that the underlying platform provides.

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

- For a full guide on actors visit [How-To: Use virtual actors in Dapr]({{< ref howto-actors.md >}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors) for code samples and instructions to try actors

### 获取 & 订阅应用程序配置

> Note this is a preview API and thus will only be accessible via the DaprPreviewClient interface and not the normal DaprClient interface

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
  // Get configuration for a single key
  Mono<ConfigurationItem> item = client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY).block();

// Get Configurations for multiple keys
  Mono<List<ConfigurationItem>> items =
          client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);

  // Susbcribe to Confifuration changes
  Flux<List<ConfigurationItem>> outFlux = client.subscribeToConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);
  outFlux.subscribe(configItems -> configItems.forEach(...));
}
```

- 有关配置操作的完整列表，请访问[操作方法：从存储管理配置]({{< ref howto-manage-configuration.md >}})。
- 请访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/configuration)，获取代码示例和说明，以尝试不同的配置操作。

### Query saved state

> Note this is a preview API and thus will only be accessible via the DaprPreviewClient interface and not the normal DaprClient interface

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.QueryStateItem;
import io.dapr.client.domain.QueryStateRequest;
import io.dapr.client.domain.QueryStateResponse;
import io.dapr.client.domain.query.Query;
import io.dapr.client.domain.query.Sorting;
import io.dapr.client.domain.query.filters.EqFilter;

try (DaprClient client = builder.build(); DaprPreviewClient previewClient = builder.buildPreviewClient()) {
        String searchVal = args.length == 0 ? "searchValue" : args[0];

        // Create JSON data
        Listing first = new Listing();
        first.setPropertyType("apartment");
        first.setId("1000");
        ...
        Listing second = new Listing();
        second.setPropertyType("row-house");
        second.setId("1002");
        ...
        Listing third = new Listing();
        third.setPropertyType("apartment");
        third.setId("1003");
        ...
        Listing fourth = new Listing();
        fourth.setPropertyType("apartment");
        fourth.setId("1001");
        ...
        Map<String, String> meta = new HashMap<>();
        meta.put("contentType", "application/json");

        // Save state
        SaveStateRequest request = new SaveStateRequest(STATE_STORE_NAME).setStates(
          new State<>("1", first, null, meta, null),
          new State<>("2", second, null, meta, null),
          new State<>("3", third, null, meta, null),
          new State<>("4", fourth, null, meta, null)
        );
        client.saveBulkState(request).block();


        // Create query and query state request

        Query query = new Query()
          .setFilter(new EqFilter<>("propertyType", "apartment"))
          .setSort(Arrays.asList(new Sorting("id", Sorting.Order.DESC)));
        QueryStateRequest request = new QueryStateRequest(STATE_STORE_NAME)
          .setQuery(query);

        // Use preview client to call query state API
        QueryStateResponse<MyData> result = previewClient.queryState(request, MyData.class).block();

        // View Query state response 
        System.out.println("Found " + result.getResults().size() + " items.");
        for (QueryStateItem<Listing> item : result.getResults()) {
          System.out.println("Key: " + item.getKey());
          System.out.println("Data: " + item.getValue());
        }
}

```
- For a full list of configuration operations visit [How-To: Query state]({{< ref howto-state-query-api.md >}}).
- Visit [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/querystate) for complete code sample.

## 相关链接
- [Java SDK examples](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)
