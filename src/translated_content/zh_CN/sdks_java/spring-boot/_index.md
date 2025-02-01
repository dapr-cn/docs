---
type: docs
title: "开始使用 Dapr 和 Spring Boot"
linkTitle: "Spring Boot 集成"
weight: 4000
description: 如何开始使用 Dapr 和 Spring Boot
---

通过将 Dapr 和 Spring Boot 结合使用，我们可以创建不依赖于特定基础设施的 Java 应用程序，这些应用程序可以部署在不同的环境中，并支持多种本地和云服务提供商。

首先，我们将从一个简单的集成开始，涵盖 `DaprClient` 和 [Testcontainers](https://testcontainers.com/) 的集成，然后利用 Spring 和 Spring Boot 的机制及编程模型来使用 Dapr API。这有助于团队消除连接到特定环境基础设施（如数据库、键值存储、消息代理、配置/密钥存储等）所需的客户端和驱动程序等依赖项。

{{% alert title="注意" color="primary" %}}
本页面解释的 Spring Boot 集成仍处于 alpha 阶段，因此大多数工件标记为 0.13.0。

{{% /alert %}}

## 将 Dapr 和 Spring Boot 集成添加到您的项目中

如果您已经有一个 Spring Boot 应用程序（Spring Boot 3.x+），可以直接将以下依赖项添加到您的项目中：

```
	<dependency>
        <groupId>io.dapr.spring</groupId>
		<artifactId>dapr-spring-boot-starter</artifactId>
		<version>0.13.1</version>
	</dependency>
	<dependency>
		<groupId>io.dapr.spring</groupId>
		<artifactId>dapr-spring-boot-starter-test</artifactId>
		<version>0.13.1</version>
		<scope>test</scope>
	</dependency>
```

通过添加这些依赖项，您可以：
- 自动装配一个 `DaprClient` 以在您的应用程序中使用
- 使用 Spring Data 和 Messaging 的抽象及编程模型，这些模型在底层使用 Dapr API
- 通过依赖 [Testcontainers](https://testcontainers.com/) 来引导 Dapr 控制平面服务和默认组件，从而改善您的开发流程

一旦这些依赖项在您的应用程序中，您可以依赖 Spring Boot 自动配置来自动装配一个 `DaprClient` 实例：

```java
@Autowired
private DaprClient daprClient;
```

这将连接到默认的 Dapr gRPC 端点 `localhost:50001`，需要您在应用程序外启动 Dapr。

您可以在应用程序中的任何地方使用 `DaprClient` 与 Dapr API 交互，例如在 REST 端点内部：

```java
@RestController
public class DemoRestController {
  @Autowired
  private DaprClient daprClient;

  @PostMapping("/store")
  public void storeOrder(@RequestBody Order order){
    daprClient.saveState("kvstore", order.orderId(), order).block();
  }
}

record Order(String orderId, Integer amount){}
```

如果您想避免在 Spring Boot 应用程序外管理 Dapr，可以依赖 [Testcontainers](https://testcontainers.com/) 来在开发过程中引导 Dapr。为此，我们可以创建一个测试配置，使用 `Testcontainers` 来引导我们需要的所有内容，以使用 Dapr API 开发我们的应用程序。

通过使用 [Testcontainers](https://testcontainers.com/) 和 Dapr 的集成，我们可以让 `@TestConfiguration` 为我们的应用程序引导 Dapr。注意，在此示例中，我们配置了一个名为 `kvstore` 的 Statestore 组件，该组件连接到由 Testcontainers 引导的 `PostgreSQL` 实例。

```java
@TestConfiguration(proxyBeanMethods = false)
public class DaprTestContainersConfig {
  @Bean
  @ServiceConnection
  public DaprContainer daprContainer(Network daprNetwork, PostgreSQLContainer<?> postgreSQLContainer){
    
    return new DaprContainer("daprio/daprd:1.14.1")
            .withAppName("producer-app")
            .withNetwork(daprNetwork)
            .withComponent(new Component("kvstore", "state.postgresql", "v1", STATE_STORE_PROPERTIES))
            .withComponent(new Component("kvbinding", "bindings.postgresql", "v1", BINDING_PROPERTIES))
            .dependsOn(postgreSQLContainer);
  }
}
```

在测试类路径中，您可以添加一个新的 Spring Boot 应用程序，使用此配置进行测试：

```java
@SpringBootApplication
public class TestProducerApplication {

  public static void main(String[] args) {

    SpringApplication
            .from(ProducerApplication::main)
            .with(DaprTestContainersConfig.class)
            .run(args);
  }
  
}
```

现在您可以启动您的应用程序：
```bash
mvn spring-boot:test-run
```

运行此命令将启动应用程序，使用提供的测试配置，其中包括 Testcontainers 和 Dapr 集成。在日志中，您应该能够看到 `daprd` 和 `placement` 服务容器已为您的应用程序启动。

除了之前的配置（`DaprTestContainersConfig`），您的测试不应该测试 Dapr 本身，只需测试您的应用程序暴露的 REST 端点。

## 利用 Spring 和 Spring Boot 编程模型与 Dapr

Java SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}}) 接口。但如果您想利用 Spring 和 Spring Boot 编程模型，可以使用 `dapr-spring-boot-starter` 集成。这包括 Spring Data 的实现（`KeyValueTemplate` 和 `CrudRepository`）以及用于生产和消费消息的 `DaprMessagingTemplate`（类似于 [Spring Kafka](https://spring.io/projects/spring-kafka)、[Spring Pulsar](https://spring.io/projects/spring-pulsar) 和 [Spring AMQP for RabbitMQ](https://spring.io/projects/spring-amqp)）。

## 使用 Spring Data `CrudRepository` 和 `KeyValueTemplate`

您可以使用依赖于 Dapr 实现的知名 Spring Data 构造。使用 Dapr，您无需添加任何与基础设施相关的驱动程序或客户端，使您的 Spring 应用程序更轻量化，并与其运行的环境解耦。

在底层，这些实现使用 Dapr Statestore 和 Binding API。

### 配置参数

使用 Spring Data 抽象，您可以配置 Dapr 将用于连接到可用基础设施的 statestore 和 bindings。这可以通过设置以下属性来完成：

```properties
dapr.statestore.name=kvstore
dapr.statestore.binding=kvbinding
```

然后您可以像这样 `@Autowire` 一个 `KeyValueTemplate` 或 `CrudRepository`：

```java
@RestController
@EnableDaprRepositories
public class OrdersRestController {
  @Autowired
  private OrderRepository repository;
  
  @PostMapping("/orders")
  public void storeOrder(@RequestBody Order order){
    repository.save(order);
  }

  @GetMapping("/orders")
  public Iterable<Order> getAll(){
    return repository.findAll();
  }
}
```

其中 `OrderRepository` 在一个扩展 Spring Data `CrudRepository` 接口的接口中定义：

```java
public interface OrderRepository extends CrudRepository<Order, String> {}
```

注意，`@EnableDaprRepositories` 注解完成了在 `CrudRespository` 接口下连接 Dapr API 的所有工作。因为 Dapr 允许用户从同一个应用程序与不同的 StateStores 交互，作为用户，您需要提供以下 bean 作为 Spring Boot `@Configuration`：

```java
@Configuration
@EnableConfigurationProperties({DaprStateStoreProperties.class})
public class ProducerAppConfiguration {
  
  @Bean
  public KeyValueAdapterResolver keyValueAdapterResolver(DaprClient daprClient, ObjectMapper mapper, DaprStateStoreProperties daprStatestoreProperties) {
    String storeName = daprStatestoreProperties.getName();
    String bindingName = daprStatestoreProperties.getBinding();

    return new DaprKeyValueAdapterResolver(daprClient, mapper, storeName, bindingName);
  }

  @Bean
  public DaprKeyValueTemplate daprKeyValueTemplate(KeyValueAdapterResolver keyValueAdapterResolver) {
    return new DaprKeyValueTemplate(keyValueAdapterResolver);
  }
}
```

## 使用 Spring Messaging 生产和消费事件

类似于 Spring Kafka、Spring Pulsar 和 Spring AMQP，您可以使用 `DaprMessagingTemplate` 将消息发布到配置的基础设施。要消费消息，您可以使用 `@Topic` 注解（即将重命名为 `@DaprListener`）。

要发布事件/消息，您可以在 Spring 应用程序中 `@Autowired` `DaprMessagingTemplate`。在此示例中，我们将发布 `Order` 事件，并将消息发送到名为 `topic` 的主题。

```java
@Autowired
private DaprMessagingTemplate<Order> messagingTemplate;

@PostMapping("/orders")
public void storeOrder(@RequestBody Order order){
  repository.save(order);
  messagingTemplate.send("topic", order);
}
```

与 `CrudRepository` 类似，我们需要指定要使用哪个 PubSub 代理来发布和消费我们的消息。

```properties
dapr.pubsub.name=pubsub
```

因为使用 Dapr，您可以连接到多个 PubSub 代理，您需要提供以下 bean 以让 Dapr 知道您的 `DaprMessagingTemplate` 将使用哪个 PubSub 代理：

```java
@Bean
public DaprMessagingTemplate<Order> messagingTemplate(DaprClient daprClient,
                                                             DaprPubSubProperties daprPubSubProperties) {
  return new DaprMessagingTemplate<>(daprClient, daprPubSubProperties.getName());
}
```

最后，因为 Dapr PubSub 需要您的应用程序和 Dapr 之间的双向连接，您需要使用一些参数扩展您的 Testcontainers 配置：

```java
@Bean
@ServiceConnection
public DaprContainer daprContainer(Network daprNetwork, PostgreSQLContainer<?> postgreSQLContainer, RabbitMQContainer rabbitMQContainer){
    
    return new DaprContainer("daprio/daprd:1.14.1")
            .withAppName("producer-app")
            .withNetwork(daprNetwork)
            .withComponent(new Component("kvstore", "state.postgresql", "v1", STATE_STORE_PROPERTIES))
            .withComponent(new Component("kvbinding", "bindings.postgresql", "v1", BINDING_PROPERTIES))
            .withComponent(new Component("pubsub", "pubsub.rabbitmq", "v1", rabbitMqProperties))
            .withAppPort(8080)
            .withAppChannelAddress("host.testcontainers.internal")
            .dependsOn(rabbitMQContainer)
            .dependsOn(postgreSQLContainer);
}
```

现在，在 Dapr 配置中，我们包含了一个 `pubsub` 组件，该组件将连接到由 Testcontainers 启动的 RabbitMQ 实例。我们还设置了两个重要参数 `.withAppPort(8080)` 和 `.withAppChannelAddress("host.testcontainers.internal")`，这允许 Dapr 在代理中发布消息时联系回应用程序。

要监听事件/消息，您需要在应用程序中暴露一个端点，该端点将负责接收消息。如果您暴露一个 REST 端点，可以使用 `@Topic` 注解让 Dapr 知道它需要将事件/消息转发到哪里：

```java
@PostMapping("subscribe")
@Topic(pubsubName = "pubsub", name = "topic")
public void subscribe(@RequestBody CloudEvent<Order> cloudEvent){
    events.add(cloudEvent);
}
```

在引导您的应用程序时，Dapr 将注册订阅，以便将消息转发到您的应用程序暴露的 `subscribe` 端点。

如果您正在为这些订阅者编写测试，您需要确保 Testcontainers 知道您的应用程序将在端口 8080 上运行，以便 Testcontainers 启动的容器知道您的应用程序在哪里：

```java
@BeforeAll
public static void setup(){
  org.testcontainers.Testcontainers.exposeHostPorts(8080);
}
```

您可以在[此处查看并运行完整示例源代码](https://github.com/salaboy/dapr-spring-boot-docs-examples)。

## 下一步

了解更多关于 [Dapr Java SDK 可用于添加到您的 Java 应用程序的包](https://dapr.github.io/java-sdk/)的信息。

## 相关链接
- [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)
