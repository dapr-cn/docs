---
type: docs
title: Dapr 客户端 Java SDK入门
linkTitle: Client
weight: 3000
description: 如何使用 Dapr Java SDK 启动和运行
---

Dapr 客户端包允许您从 Java 应用程序中与其他 Dapr 应用程序进行交互。

{{% alert title="注意" color="primary" %}}
如果你还没有，请[尝试使用一个快速入门]({{< ref quickstarts >}})快速了解如何使用 Dapr Python SDK 与 API 构建块。

{{% /alert %}}

## 前期准备

[完成初始设置并将Java SDK导入您的项目]({{< ref java >}})

## 初始化客户端

您可以这样初始化 Dapr 客户端：

```java
DaprClient client = new DaprClientBuilder().build()
```

这将连接到默认的 Dapr gRPC 端点 `localhost:50001`。

#### 环境变量:

##### Dapr Sidecar 终端点

您可以使用标准化的`DAPR_GRPC_ENDPOINT`和`DAPR_HTTP_ENDPOINT`环境变量来指定不同的gRPC或HTTP端点。 当这些变量被设置时，客户端将自动使用它们来连接到 Dapr sidecar。

遗留的环境变量 `DAPR_HTTP_PORT` 和 `DAPR_GRPC_PORT` 仍然被支持，但是 `DAPR_GRPC_ENDPOINT` 和 `DAPR_HTTP_ENDPOINT` 优先级更高。

##### Dapr API 令牌

如果您的 Dapr 实例配置需要 `DAPR_API_TOKEN` 环境变量，您可以在环境中设置它，客户端将自动使用它。\
您可以在此处阅读有关 Dapr API 令牌身份验证的更多信息（[链接](https://docs.dapr.io/operations/security/api-token/)）。

#### 错误处理

最初，Dapr中的错误遵循了标准的gRPC错误模型。 但是，为了提供更详细和信息丰富的错误
消息，在版本 1.13 中引入了增强的错误模型，该模型与 gRPC Richer 错误模型一致。 作为回应，Java SDK 扩展了 DaprException，包括在 Dapr 中添加的错误详情。

处理 DaprException 并在使用 Dapr Java SDK 时消费错误详情的示例：

```java
...
      try {
        client.publishEvent("unknown_pubsub", "mytopic", "mydata").block();
      } catch (DaprException exception) {
        System.out.println("Dapr exception's error code: " + exception.getErrorCode());
        System.out.println("Dapr exception's message: " + exception.getMessage());
        // DaprException now contains `getStatusDetails()` to include more details about the error from Dapr runtime.
        System.out.println("Dapr exception's reason: " + exception.getStatusDetails().get(
        DaprErrorDetails.ErrorDetailType.ERROR_INFO,
            "reason",
        TypeRef.STRING));
      }
...
```

## 构建块

Java SDK 允许您与所有的[Dapr构建块]({{< ref building-blocks >}})}进行接口交互。

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

- 有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/invoke)获取代码示例和指南，尝试使用服务调用

### 保存和获取应用程序状态

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

- 有关状态操作的完整列表，请访问 [操作方法：获取和保存状态]({{< ref howto-get-save-state.md >}}).
- 访问 [Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/state) 获取代码示例和指南，尝试使用状态管理。

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

> 注意：API 处于 Alpha 阶段

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
      // Create a list of messages to publish
      List<String> messages = new ArrayList<>();
      for (int i = 0; i < NUM_MESSAGES; i++) {
        String message = String.format("This is message #%d", i);
        messages.add(message);
        System.out.println("Going to publish message : " + message);
      }

      // Publish list of messages using the bulk publish API
      BulkPublishResponse<String> res = client.publishEvents(PUBSUB_NAME, TOPIC_NAME, "text/plain", messages).block()
    }
  }
}
```

- 有关发布消息和订阅主题的完整指南 [操作方法：发布 & 订阅]({{< ref howto-publish-subscribe.md >}}).
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/pubsub/http)获取代码示例和说明，以尝试发布/订阅

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

- 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http)获取代码示例和指南，尝试使用输出绑定。

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

- 有关输入绑定的完整指南，请访问[操作方法：输入绑定]({{< ref howto-triggers >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/bindings/http)获取代码示例和指南，尝试使用输入绑定。

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

- 有关秘密的完整指南，请访问[操作方法: 检索秘密]({{< ref howto-secrets.md >}})。
- 访问 [Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/secrets) 获取代码示例和指南，尝试检索密钥

### Actors

Actor 是孤立的独立计算单元，具有单线程执行。 Dapr提供了一个基于[虚拟Actor模式](https://www.microsoft.com/en-us/research/project/orleans-virtual-actors/)的actor实现，它提供了一个单线程编程模型，其中actor在不使用时会进行垃圾回收。 通过 Dapr 的实现，您可以根据 Actor 模型编写 Dapr Actor，而 Dapr 则利用底层平台提供的可扩展性和可靠性。

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

- 有关 Actors 的完整指南，请访问[操作方法：在Dapr中使用 virtual actors]({{< ref howto-actors.md >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/actors)获取代码示例和指令，尝试使用actors

### 获取并订阅应用程序配置

> 请注意，这是一个预览 API，因此只能通过 DaprPreviewClient 接口访问，而不是通过普通的 DaprClient 接口访问

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

  // Get configurations for multiple keys
  Mono<Map<String, ConfigurationItem>> items =
          client.getConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);

  // Subscribe to configuration changes
  Flux<SubscribeConfigurationResponse> outFlux = client.subscribeConfiguration(CONFIG_STORE_NAME, CONFIG_KEY_1, CONFIG_KEY_2);
  outFlux.subscribe(configItems -> configItems.forEach(...));

  // Unsubscribe from configuration changes
  Mono<UnsubscribeConfigurationResponse> unsubscribe = client.unsubscribeConfiguration(SUBSCRIPTION_ID, CONFIG_STORE_NAME)
}
```

- 有关配置操作的完整列表，请访问 [操作方法：从存储管理配置]({{< ref howto-manage-configuration.md >}}).
- 访问 [Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/configuration) 获取代码示例和指南，尝试不同的配置操作。

### 查询保存的状态

> 请注意，这是一个预览 API，因此只能通过 DaprPreviewClient 接口访问，而不是通过普通的 DaprClient 接口访问

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

- 有关查询状态的完整操作方法，请访问[操作方法：查询状态]({{< ref howto-state-query-api.md >}})。
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/querystate)获取完整的代码示例。

### Distributed lock

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
   * Executes various methods to check the different apis.
   *
   * @param args arguments
   * @throws Exception throws Exception
   */
  public static void main(String[] args) throws Exception {
    try (DaprPreviewClient client = (new DaprClientBuilder()).buildPreviewClient()) {
      System.out.println("Using preview client...");
      tryLock(client);
      unlock(client);
    }
  }

  /**
   * Trying to get lock.
   *
   * @param client DaprPreviewClient object
   */
  public static void tryLock(DaprPreviewClient client) {
    System.out.println("*******trying to get a free distributed lock********");
    try {
      LockRequest lockRequest = new LockRequest(LOCK_STORE_NAME, "resouce1", "owner1", 5);
      Mono<Boolean> result = client.tryLock(lockRequest);
      System.out.println("Lock result -> " + (Boolean.TRUE.equals(result.block()) ? "SUCCESS" : "FAIL"));
    } catch (Exception ex) {
      System.out.println(ex.getMessage());
    }
  }

  /**
   * Unlock a lock.
   *
   * @param client DaprPreviewClient object
   */
  public static void unlock(DaprPreviewClient client) {
    System.out.println("*******unlock a distributed lock********");
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

- 了解有关使用分布式锁的详细信息：[操作方法：使用锁]({{< ref howto-use-distributed-lock.md >}})
- 访问[Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples/lock)获取完整的代码示例。

### Workflow

> Dapr 工作流目前处于 beta 阶段。

```java
package io.dapr.examples.workflows;

import io.dapr.workflows.client.DaprWorkflowClient;
import io.dapr.workflows.client.WorkflowInstanceStatus;

import java.time.Duration;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * For setup instructions, see the README.
 */
public class DemoWorkflowClient {

  /**
   * The main method.
   *
   * @param args Input arguments (unused).
   * @throws InterruptedException If program has been interrupted.
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

- 查看工作流程的完整指南，请访问：
  - [操作方法：管理工作流]({{< ref howto-author-workflow\.md >}}).
  - [操作方法：管理工作流]({{< ref howto-manage-workflow\.md >}}).
- [了解有关如何使用Java SDK与工作流的更多信息]({{< ref java-workflow\.md >}})。

## Sidecar APIs

#### 等待 sidecar

`DaprClient`还提供了一个辅助方法，用于等待sidecar变为健康状态（仅适用于组件）。 使用
此方法时，请务必指定以毫秒为单位的超时时间，并使用block()等待响应式操作的结果。

```java
// Wait for the Dapr sidecar to report healthy before attempting to use Dapr components.
try (DaprClient client = new DaprClientBuilder().build()) {
  System.out.println("Waiting for Dapr sidecar ...");
  client.waitForSidecar(10000).block(); // Specify the timeout in milliseconds
  System.out.println("Dapr sidecar is ready.");
  ...
}

// Perform Dapr component operations here i.e. fetching secrets or saving state.
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

了解有关[Dapr Java SDK 包可用于添加到您的 Java 应用程序中的信息](https://dapr.github.io/java-sdk/)。

## 相关链接

- [Java SDK示例](https://github.com/dapr/java-sdk/tree/master/examples/src/main/java/io/dapr/examples)
