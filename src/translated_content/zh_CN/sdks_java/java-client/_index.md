---
type: docs
title: "使用 Dapr 客户端 Java SDK 入门"
linkTitle: "客户端"
weight: 3000
description: 如何使用 Dapr Java SDK 快速上手
---

Dapr 客户端包使您能够从 Java 应用程序与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
如果您还没有尝试过，[请尝试其中一个快速入门]({{< ref quickstarts >}})，以快速了解如何使用 Dapr Java SDK 和 API 构建块。

{{% /alert %}}

## 前提条件

[完成初始设置并将 Java SDK 导入您的项目]({{< ref java >}})

## 初始化客户端
您可以这样初始化 Dapr 客户端：

```java
DaprClient client = new DaprClientBuilder().build();
```

这会连接到默认的 Dapr gRPC 端点 `localhost:50001`。

#### 环境变量

##### Dapr Sidecar 端点
您可以使用标准化的 `DAPR_GRPC_ENDPOINT` 和 `DAPR_HTTP_ENDPOINT` 环境变量来指定不同的 gRPC 或 HTTP 端点。当设置了这些变量时，客户端将自动使用它们连接到 Dapr sidecar。

旧的环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT` 仍然受支持，但 `DAPR_GRPC_ENDPOINT` 和 `DAPR_HTTP_ENDPOINT` 优先。

##### Dapr API 令牌
如果您的 Dapr 实例需要 `DAPR_API_TOKEN` 环境变量，您可以在环境中设置，客户端会自动使用。  
您可以在[这里](https://docs.dapr.io/operations/security/api-token/)阅读更多关于 Dapr API 令牌认证的信息。

#### 错误处理

最初，Dapr 中的错误遵循标准 gRPC 错误模型。为了提供更详细的信息，在 1.13 版本中引入了一个增强的错误模型，与 gRPC 的丰富错误模型对齐。Java SDK 扩展了 DaprException，以包含 Dapr 中添加的错误详细信息。

使用 Dapr Java SDK 处理 DaprException 并消费错误详细信息的示例：

```java
...
      try {
        client.publishEvent("unknown_pubsub", "mytopic", "mydata").block();
      } catch (DaprException exception) {
        System.out.println("Dapr 异常的错误代码: " + exception.getErrorCode());
        System.out.println("Dapr 异常的消息: " + exception.getMessage());
        // DaprException 现在通过 `getStatusDetails()` 提供来自 Dapr 运行时的更多错误详细信息。
        System.out.println("Dapr 异常的原因: " + exception.getStatusDetails().get(
        DaprErrorDetails.ErrorDetailType.ERROR_INFO,
            "reason",
        TypeRef.STRING));
      }
...
```

## 构建块

Java SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}})进行接口交互。

### 调用服务

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // 调用 'GET' 方法 (HTTP) 跳过序列化: 返回类型为 Mono<byte[]>
  // 对于 gRPC 设置 HttpExtension.NONE 参数
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"name\":\"World!\"}", HttpExtension.GET, byte[].class).block();

  // 调用 'POST' 方法 (HTTP) 跳过序列化: 返回类型为 Mono<byte[]>     
  response = client.invokeMethod(SERVICE_TO_INVOKE, METHOD_TO_INVOKE, "{\"id\":\"100\", \"FirstName\":\"Value\", \"LastName\":\"Value\"}", HttpExtension.POST, byte[].class).block();

  System.out.println(new String(response));

  // 调用 'POST' 方法 (HTTP) 带序列化: 返回类型为 Mono<Employee>      
  Employee newEmployee = new Employee("Nigel", "Guitarist");
  Employee employeeResponse = client.invokeMethod(SERVICE_TO_INVOKE, "employees", newEmployee, HttpExtension.POST, Employee.class).block();
}
```

- 有关服务调用的完整指南，请访问 [How-To: Invoke a service]({{< ref howto-invoke-discover-services.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/invoke) 以获取代码示例和尝试服务调用的说明

### 保存和获取应用程序状态

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.domain.State;
import reactor.core.publisher.Mono;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // 保存状态
  client.saveState(STATE_STORE_NAME, FIRST_KEY_NAME, myClass).block();

  // 获取状态
  State<MyClass> retrievedMessage = client.getState(STATE_STORE_NAME, FIRST_KEY_NAME, MyClass.class).block();

  // 删除状态
  client.deleteState(STATE_STORE_NAME, FIRST_KEY_NAME).block();
}
```

- 有关状态操作的完整列表，请访问 [How-To: Get & save state]({{< ref howto-get-save-state.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/state) 以获取代码示例和尝试状态管理的说明

### 发布和订阅消息

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
import io.dapr.client.domain.BulkSubscribeAppResponse;
import io.dapr.client.domain.BulkSubscribeAppResponseEntry;
import io.dapr.client.domain.BulkSubscribeAppResponseStatus;
import io.dapr.client.domain.BulkSubscribeMessage;
import io.dapr.client.domain.BulkSubscribeMessageEntry;
import io.dapr.client.domain.CloudEvent;
import io.dapr.springboot.annotations.BulkSubscribe;
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

  @Topic(name = "testingtopic", pubsubName = "${myAppProperty:messagebus}",
          rule = @Rule(match = "event.type == 'myevent.v2'", priority = 1))
  @PostMapping(path = "/testingtopicV2")
  public Mono<Void> handleMessageV2(@RequestBody(required = false) CloudEvent envelope) {
    return Mono.fromRunnable(() -> {
      try {
        System.out.println("Subscriber got: " + cloudEvent.getData());
        System.out.println("Subscriber got: " + OBJECT_MAPPER.writeValueAsString(cloudEvent));
      } catch (Exception e) {
        throw new RuntimeException(e);
      }
    });
  }

  @BulkSubscribe()
  @Topic(name = "testingtopicbulk", pubsubName = "${myAppProperty:messagebus}")
  @PostMapping(path = "/testingtopicbulk")
  public Mono<BulkSubscribeAppResponse> handleBulkMessage(
          @RequestBody(required = false) BulkSubscribeMessage<CloudEvent<String>> bulkMessage) {
    return Mono.fromCallable(() -> {
      if (bulkMessage.getEntries().size() == 0) {
        return new BulkSubscribeAppResponse(new ArrayList<BulkSubscribeAppResponseEntry>());
      }

      System.out.println("Bulk Subscriber received " + bulkMessage.getEntries().size() + " messages.");

      List<BulkSubscribeAppResponseEntry> entries = new ArrayList<BulkSubscribeAppResponseEntry>();
      for (BulkSubscribeMessageEntry<?> entry : bulkMessage.getEntries()) {
        try {
          System.out.printf("Bulk Subscriber message has entry ID: %s\n", entry.getEntryId());
          CloudEvent<?> cloudEvent = (CloudEvent<?>) entry.getEvent();
          System.out.printf("Bulk Subscriber got: %s\n", cloudEvent.getData());
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.SUCCESS));
        } catch (Exception e) {
          e.printStackTrace();
          entries.add(new BulkSubscribeAppResponseEntry(entry.getEntryId(), BulkSubscribeAppResponseStatus.RETRY));
        }
      }
      return new BulkSubscribeAppResponse(entries);
    });
  }
}
```

##### 批量发布消息
> 注意: API 处于 Alpha 阶段

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.BulkPublishResponse;
import io.dapr.client.domain.BulkPublishResponseFailedEntry;
import java.util.ArrayList;
import java.util.List;
class Solution {
  public void publishMessages() {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      // 创建要发布的消息列表
      List<String> messages = new ArrayList<>();
      for (int i = 0; i < NUM_MESSAGES; i++) {
        String message = String.format("This is message #%d", i);
        messages.add(message);
        System.out.println("Going to publish message : " + message);
      }

      // 使用批量发布 API 发布消息列表
      BulkPublishResponse<String> res = client.publishEvents(PUBSUB_NAME, TOPIC_NAME, "text/plain", messages).block()
    }
  }
}
```

- 有关发布消息和订阅主题的完整指南，请访问 [How-To: Publish & subscribe]({{< ref howto-publish-subscribe.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub/http) 以获取代码示例和尝试发布/订阅

### 与输出绑定交互

```java
import io.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  // 发送带有消息的类; BINDING_OPERATION="create"
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, myClass).block();

  // 发送纯字符串
  client.invokeBinding(BINDING_NAME, BINDING_OPERATION, message).block();
}
```

- 有关输出绑定的完整指南，请访问 [How-To: Output bindings]({{< ref howto-bindings.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) 以获取代码示例和尝试输出绑定。

### 与输入绑定交互

```java
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/")
public class myClass {
    private static final Logger log = LoggerFactory.getLogger(myClass);
        @PostMapping(path = "/checkout")
        public Mono<String> getCheckout(@RequestBody(required = false) byte[] body) {
            return Mono.fromRunnable(() ->
                    log.info("Received Message: " + new String(body)));
        }
}
```

- 有关输入绑定的完整指南，请访问 [How-To: Input bindings]({{< ref howto-triggers >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http) 以获取代码示例和尝试输入绑定。

### 检索秘密

```java
import com.fasterxml.jackson.databind.ObjectMapper;
importio.dapr.client.DaprClient;
import io.dapr.client.DaprClientBuilder;
import java.util.Map;

try (DaprClient client = (new DaprClientBuilder()).build()) {
  Map<String, String> secret = client.getSecret(SECRET_STORE_NAME, secretKey).block();
  System.out.println(JSON_SERIALIZER.writeValueAsString(secret));
}
```

- 有关秘密的完整指南，请访问 [How-To: Retrieve secrets]({{< ref howto-secrets.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/secrets) 以获取代码示例和尝试检索秘密

### Actors
actor 是一个具有单线程执行的隔离、独立的计算和状态单元。Dapr 提供了一种基于 [虚拟 actor 模式](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/) 的 actor 实现，该模式提供了单线程编程模型，并且当 actor 不在使用时会被垃圾回收。使用 Dapr 的实现，您可以根据 actor 模型编写 Dapr actor，Dapr 利用底层平台提供的可扩展性和可靠性。

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

- 有关 actor 的完整指南，请访问 [How-To: Use virtual actors in Dapr]({{< ref howto-actors.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors) 以获取代码示例和尝试 actor

### 获取和订阅应用程序配置

> 注意这是一个预览 API，因此只能通过 DaprPreviewClient 接口访问，而不能通过普通的 DaprClient 接口访问

```java
import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.ConfigurationItem;
import io.dapr.client.domain.GetConfigurationRequest;
import io.dapr.client.domain.SubscribeConfigurationRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
  // 获取单个键的配置
  Mono<ConfigurationItem> item = client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY).block();

  // 获取多个键的配置
  Mono<Map<String, ConfigurationItem>> items =
          client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);

  // 订阅配置更改
  Flux<SubscribeConfigurationResponse> outFlux = client.subscribeConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);
  outFlux.subscribe(configItems -> configItems.forEach(...));

  // 取消订阅配置更改
  Mono<UnsubscribeConfigurationResponse> unsubscribe = client.unsubscribeConfiguration(SUBSCRIPTION_ID, CONFIG_STORE_NAME)
}
```

- 有关配置操作的完整列表，请访问 [How-To: Manage configuration from a store]({{< ref howto-manage-configuration.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/configuration) 以获取代码示例和尝试不同的配置操作。

### 查询保存的状态

> 注意这是一个预览 API，因此只能通过 DaprPreviewClient 接口访问，而不能通过普通的 DaprClient 接口访问

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
        
        // 创建 JSON 数据
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

        // 保存状态
        SaveStateRequest request = new SaveStateRequest(STATE_STORE_NAME).setStates(
          new State<>("1", first, null, meta, null),
          new State<>("2", second, null, meta, null),
          new State<>("3", third, null, meta, null),
          new State<>("4", fourth, null, meta, null)
        );
        client.saveBulkState(request).block();
        
        
        // 创建查询和查询状态请求

        Query query = new Query()
          .setFilter(new EqFilter<>("propertyType", "apartment"))
          .setSort(Arrays.asList(new Sorting("id", Sorting.Order.DESC)));
        QueryStateRequest request = new QueryStateRequest(STATE_STORE_NAME)
          .setQuery(query);

        // 使用预览客户端调用查询状态 API
        QueryStateResponse<MyData> result = previewClient.queryState(request, MyData.class).block();
        
        // 查看查询状态响应 
        System.out.println("Found " + result.getResults().size() + " items.");
        for (QueryStateItem<Listing> item : result.getResults()) {
          System.out.println("Key: " + item.getKey());
          System.out.println("Data: " + item.getValue());
        }
}
```
- 有关查询状态的完整指南，请访问 [How-To: Query state]({{< ref howto-state-query-api.md >}})。
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/querystate) 以获取完整代码示例。

### 分布式锁

```java
package io.dapr.examples.lock.grpc;

import io.dapr.client.DaprClientBuilder;
import io.dapr.client.DaprPreviewClient;
import io.dapr.client.domain.LockRequest;
import io.dapr.client.domain.UnlockRequest;
import io.dapr.client.domain.UnlockResponseStatus;
import reactor.core.publisher.Mono;

public class DistributedLockGrpcClient {
  private static final String LOCK_STORE_NAME = "lockstore";

  /**
   * 执行各种方法以检查不同的 API。
   *
   * @param args 参数
   * @throws Exception 抛出异常
   */
  public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      System.out.println("Using preview client...");
      tryLock(client);
      unlock(client);
    }
  }

  /**
   * 尝试获取锁。
   *
   * @param client DaprPreviewClient 对象
   */
  public static void tryLock(DaprPreviewClient client) {
    System.out.println("*******尝试获取一个空闲的分布式锁********");
    try {
      LockRequest lockRequest = new LockRequest(LOCK_STORE_NAME, "resouce1", "owner1", 5);
      Mono<Boolean> result = client.tryLock(lockRequest);
      System.out.println("Lock result -> " + (Boolean.TRUE.equals(result.block()) ? "SUCCESS" : "FAIL"));
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
    }
  }

  /**
   * 解锁。
   *
   * @param client DaprPreviewClient 对象
   */
  public static void unlock(DaprPreviewClient client) {
    System.out.println("*******解锁一个分布式锁********");
    try {
      UnlockRequest unlockRequest = new UnlockRequest(LOCK_STORE_NAME, "resouce1", "owner1");
      Mono<UnlockResponseStatus> result = client.unlock(unlockRequest);
      System.out.println("Unlock result ->" + result.block().name());
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
    }
  }
}
```

- 有关分布式锁的完整指南，请访问 [How-To: Use a Lock]({{< ref howto-use-distributed-lock.md >}})
- 访问 [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/lock) 以获取完整代码示例。

### 工作流

```java
package io.dapr.examples.workflows;

import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 有关设置说明，请参阅 README。
 */
public class DemoWorkflowClient {

  /**
   * 主方法。
   *
   * @param args 输入参数（未使用）。
   * @throws InterruptedException 如果程序被中断。
   */
  public static void main(String[] args) throws InterruptedException {
    DaprWorkflowClient client = new DaprWorkflowClient();

    try (client) {
      String separatorStr = "*******";
      System.out.println(separatorStr);
      String instanceId = client.scheduleNewWorkflow(DemoWorkflow.class, "input data");
      System.out.printf("Started new workflow instance with random ID: %s%n", instanceId);

      System.out.println(separatorStr);
      System.out.println("**GetInstanceMetadata:Running Workflow**");
      WorkflowInstanceStatus workflowMetadata = client.getInstanceState(instanceId, true);
      System.out.printf("Result: %s%n", workflowMetadata);

      System.out.println(separatorStr);
      System.out.println("**WaitForInstanceStart**");
      try {
        WorkflowInstanceStatus waitForInstanceStartResult =
            client.waitForInstanceStart(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForInstanceStartResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForInstanceStart has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**SendExternalMessage**");
      client.raiseEvent(instanceId, "TestEvent", "TestEventPayload");

      System.out.println(separatorStr);
      System.out.println("** Registering parallel Events to be captured by allOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "event1", "TestEvent 1 Payload");
      client.raiseEvent(instanceId, "event2", "TestEvent 2 Payload");
      client.raiseEvent(instanceId, "event3", "TestEvent 3 Payload");
      System.out.printf("Events raised for workflow with instanceId: %s\n", instanceId);

      System.out.println(separatorStr);
      System.out.println("** Registering Event to be captured by anyOf(t1,t2,t3) **");
      client.raiseEvent(instanceId, "e2", "event 2 Payload");
      System.out.printf("Event raised for workflow with instanceId: %s\n", instanceId);


      System.out.println(separatorStr);
      System.out.println("**WaitForInstanceCompletion**");
      try {
        WorkflowInstanceStatus waitForInstanceCompletionResult =
            client.waitForInstanceCompletion(instanceId, Duration.ofSeconds(60), true);
        System.out.printf("Result: %s%n", waitForInstanceCompletionResult);
      } catch (TimeoutException ex) {
        System.out.printf("waitForInstanceCompletion has an exception:%s%n", ex);
      }

      System.out.println(separatorStr);
      System.out.println("**purgeInstance**");
      boolean purgeResult = client.purgeInstance(instanceId);
      System.out.printf("purgeResult: %s%n", purgeResult);

      System.out.println(separatorStr);
      System.out.println("**raiseEvent**");

      String eventInstanceId = client.scheduleNewWorkflow(DemoWorkflow.class);
      System.out.printf("Started new workflow instance with random ID: %s%n", eventInstanceId);
      client.raiseEvent(eventInstanceId, "TestException", null);
      System.out.printf("Event raised for workflow with instanceId: %s\n", eventInstanceId);

      System.out.println(separatorStr);
      String instanceToTerminateId = "terminateMe";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, instanceToTerminateId);
      System.out.printf("Started new workflow instance with specified ID: %s%n", instanceToTerminateId);

      TimeUnit.SECONDS.sleep(5);
      System.out.println("Terminate this workflow instance manually before the timeout is reached");
      client.terminateWorkflow(instanceToTerminateId, null);
      System.out.println(separatorStr);

      String restartingInstanceId = "restarting";
      client.scheduleNewWorkflow(DemoWorkflow.class, null, restartingInstanceId);
      System.out.printf("Started new  workflow instance with ID: %s%n", restartingInstanceId);
      System.out.println("Sleeping 30 seconds to restart the workflow");
      TimeUnit.SECONDS.sleep(30);

      System.out.println("**SendExternalMessage: RestartEvent**");
      client.raiseEvent(restartingInstanceId, "RestartEvent", "RestartEventPayload");

      System.out.println("Sleeping 30 seconds to terminate the eternal workflow");
      TimeUnit.SECONDS.sleep(30);
      client.terminateWorkflow(restartingInstanceId, null);
    }

    System.out.println("Exiting DemoWorkflowClient.");
    System.exit(0);
  }
}
```

- 有关工作流的完整指南，请访问:
   - [How-To: Author workflows]({{< ref howto-author-workflow.md >}})。
   - [How-To: Manage workflows]({{< ref howto-manage-workflow.md >}})。
- [了解更多关于如何使用 Java SDK 使用工作流]({{< ref java-workflow.md >}})。

## Sidecar API

#### 等待 sidecar
`DaprClient` 还提供了一个辅助方法来等待 sidecar 变得健康（仅限组件）。使用此方法时，请确保指定超时时间（以毫秒为单位）并使用 block() 来等待反应操作的结果。

```java
// 在尝试使用 Dapr 组件之前，等待 Dapr sidecar 报告健康。
try (DaprClient client = new DaprClientBuilder().build()) {
  System.out.println("Waiting for Dapr sidecar ...");
  client.waitForSidecar(10000).block(); // 指定超时时间（以毫秒为单位）
  System.out.println("Dapr sidecar is ready.");
  ...
}

// 在此处执行 Dapr 组件操作，例如获取秘密或保存状态。
```

### 关闭 sidecar
```java
try (DaprClient client = new DaprClientBuilder().build()) {
  logger.info("Sending shutdown request.");
  client.shutdown().block();
  logger.info("Ensuring dapr has stopped.");
  ...
}
```

了解更多关于 [Dapr Java SDK 可用于添加到您的 Java 应用程序的包](https://dapr.github.io/java-sdk/)。

## 相关链接
- [Java SDK 示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)
