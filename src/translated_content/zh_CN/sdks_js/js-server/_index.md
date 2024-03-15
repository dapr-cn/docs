---
type: docs
title: JavaScript 服务器 SDK
linkTitle: Server
weight: 2000
description: 用于开发 Dapr 应用程序的 JavaScript 服务器 SDK
---

## 介绍

Dapr 服务器将允许您从 Dapr Sidecar 接收通信，并访问其面向服务器的功能，例如：订阅事件、接收输入绑定等等。

## 先决条件

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Node.js 的最新 LTS 版本或更高版本](https://nodejs.org/en/)

## 安装和导入 Dapr 的 JS SDK

1. 使用 npm 安装 SDK：

```bash
npm i @dapr/dapr --save
```

2. 导入类库：

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server

// HTTP Example
const server = new DaprServer({
  serverHost,
  serverPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP, // DaprClient to use same communication protocol as DaprServer, in case DaprClient protocol not mentioned explicitly
  clientOptions: {
    daprHost,
    daprPort,
  },
});

// GRPC Example
const server = new DaprServer({
  serverHost,
  serverPort,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
```

## 运行

要运行这些示例，您可以使用两种不同的协议与 Dapr Sidecar 进行交互：HTTP（默认）或 gRPC。

### 使用 HTTP（内置 express webserver）

```typescript
import { DaprServer } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: appHost,
  serverPort: appPort,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
// initialize subscribtions, ... before server start
// the dapr sidecar relies on these
await server.start();
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol http -- npm run start

# or, using npm script
npm run start:dapr-http
```

> ℹ️ **注意:** 在这里需要填写`app-port`，因为这是我们的服务器需要绑定的地方。 Dapr 在完成启动之前，将检查是否有应用程序绑定到该端口。

### 使用 HTTP（自带的 express webserver）

除了使用内置的 Web 服务器进行 Dapr sidecar 与应用程序的通信之外，您还可以自带实例。 这在诸如构建 REST API 后端并希望直接集成 Dapr 的情况下非常有帮助。

注意，目前仅适用于[`express`](https://www.npmjs.com/package/express)。

> 💡 注意：当使用自定义的Web服务器时，SDK将配置服务器属性，如最大body大小，并添加新的路由到其中。 这些路由本身是唯一的，以避免与您的应用程序发生冲突，但不能保证不会发生碰撞。

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";
import express from "express";

const myApp = express();

myApp.get("/my-custom-endpoint", (req, res) => {
  res.send({ msg: "My own express app!" });
});

const daprServer = new DaprServer({
      serverHost: "127.0.0.1", // App Host
      serverPort: "50002", // App Port
      serverHttp: myApp,
      clientOptions: {
        daprHost
        daprPort
      }
    });

// Initialize subscriptions before the server starts, the Dapr sidecar uses it.
// This will also initialize the app server itself (removing the need for `app.listen` to be called).
await daprServer.start();
```

在配置完上述内容后，您可以像平常一样调用您的自定义终端点：

```typescript
const res = await fetch(`http://127.0.0.1:50002/my-custom-endpoint`);
const json = await res.json();
```

### 使用 gRPC

由于 HTTP 是默认设置，因此必须调整通信协议才能使用 gRPC。 您可以通过向客户端或服务器构造函数传递一个额外的参数来做到这一点。

```typescript
import { DaprServer, CommunicationProtocol } from "@dapr/dapr";

const server = new DaprServer({
  serverHost: appHost,
  serverPort: appPort,
  communicationProtocol: CommunicationProtocolEnum.GRPC,
  clientOptions: {
    daprHost,
    daprPort,
  },
});
// initialize subscribtions, ... before server start
// the dapr sidecar relies on these
await server.start();
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol grpc -- npm run start

# or, using npm script
npm run start:dapr-grpc
```

> ℹ️ **注意:** 在这里需要填写`app-port`，因为这是我们的服务器需要绑定的地方。 Dapr 在完成启动之前，将检查是否有应用程序绑定到该端口。

## 构建块

JavaScript Server SDK 允许您与所有[Dapr构建块]({{< ref building-blocks >}})专注于Sidecar到App功能。

### 调用 API

#### 侦听调用

```typescript
import { DaprServer, DaprInvokerCallbackContent } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const callbackFunction = (data: DaprInvokerCallbackContent) => {
    console.log("Received body: ", data.body);
    console.log("Received metadata: ", data.metadata);
    console.log("Received query: ", data.query);
    console.log("Received headers: ", data.headers); // only available in HTTP
  };

  await server.invoker.listen("hello-world", callbackFunction, { method: HttpMethod.GET });

  // You can now invoke the service with your app id and method "hello-world"

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。

### Pub/Sub API

#### 订阅消息

订阅消息可以通过多种方式进行，以提供在您的主题上灵活接收消息的能力：

- 通过`subscribe`方法直接订阅
- 通过`subscribeWithOptions`方法以选项直接订阅
- 之后通过`susbcribeOnEvent`方法订阅

每次事件到达时，我们将其正文作为`data`传递，并将头部作为`headers`，其中可以包含事件发布者的属性（例如来自IoT Hub的设备ID）

> Dapr 在启动时需要设置订阅，但在 JS SDK 中我们也允许在之后添加事件处理程序，为您提供编程的灵活性。

下面提供了一个示例

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Configure Subscriber for a Topic
  // Method 1: Direct subscription through the `subscribe` method
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`),
  );

  // Method 2: Direct susbcription with options through the `subscribeWithOptions` method
  await server.pubsub.subscribeWithOptions(pubSubName, topic, {
    callback: async (data: any, headers: object) =>
      console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`),
  });

  // Method 3: Subscription afterwards through the `susbcribeOnEvent` method
  // Note: we use default, since if no route was passed (empty options) we utilize "default" as the route name
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-1", {});
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "default", async (data: any, headers: object) => {
    console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`);
  });

  // Start the server
  await server.start();
}
```

> 有关状态操作的完整列表，请访问[操作方法: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

#### 以 SUCCESS/RETRY/DROP 状态订阅

Dapr支持[重试逻辑的状态码](https://docs.dapr.io/reference/api/pubsub_api/#expected-http-response)，用于指定消息处理后应该发生什么。

> ⚠️ JS SDK允许在同一主题上进行多个回调，我们根据`RETRY` > `DROP` > `SUCCESS`的优先级处理状态，并默认为`SUCCESS`

> ⚠️ 确保在您的应用程序中[配置弹性](https://docs.dapr.io/operations/resiliency/resiliency-overview/)来处理`RETRY`消息

在JS SDK中，我们通过`DaprPubSubStatusEnum`枚举来支持这些消息。 为了确保 Dapr 会进行重试，我们需要配置一个弹性策略。

**components/resiliency.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
spec:
  policies:
    retries:
      # Global Retry Policy for Inbound Component operations
      DefaultComponentInboundRetryPolicy:
        policy: constant
        duration: 500ms
        maxRetries: 10
  targets:
    components:
      messagebus:
        inbound:
          retry: DefaultComponentInboundRetryPolicy
```

**src/index.ts**

```typescript
import { DaprServer, DaprPubSubStatusEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Process a message successfully
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.SUCCESS;
  });

  // Retry a message
  // Note: this example will keep on retrying to deliver the message
  // Note 2: each component can have their own retry configuration
  //   e.g., https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-redis-pubsub/
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.RETRY;
  });

  // Drop a message
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.DROP;
  });

  // Start the server
  await server.start();
}
```

#### 订阅基于规则的消息

Dapr [支持根据规则将消息路由](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/)到不同的处理程序（路由）。

> 例如，您正在编写一个应用程序，需要根据其"type"使用Dapr处理消息，您可以将它们发送到不同的路由`handlerType1`和`handlerType2`，默认路由为`handlerDefault`

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Configure Subscriber for a Topic with rule set
  // Note: the default route and match patterns are optional
  await server.pubsub.subscribe("pubsub-redis", "topic-1", {
    default: "/default",
    rules: [
      {
        match: `event.type == "my-type-1"`,
        path: "/type-1",
      },
      {
        match: `event.type == "my-type-2"`,
        path: "/type-2",
      },
    ],
  });

  // Add handlers for each route
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "default", async (data) => {
    console.log(`Handling Default`);
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "type-1", async (data) => {
    console.log(`Handling Type 1`);
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "type-2", async (data) => {
    console.log(`Handling Type 2`);
  });

  // Start the server
  await server.start();
}
```

#### 使用通配符订阅

支持常用的通配符 `*` 和 `+` （请确保验证 [pubsub 组件是否支持](https://docs.dapr.io/reference/components-reference/supported-pubsub/)），可以按如下方式订阅：

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const pubSubName = "my-pubsub-name";

  // * Wildcard
  await server.pubsub.subscribe(pubSubName, "/events/*", async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)}`),
  );

  // + Wildcard
  await server.pubsub.subscribe(pubSubName, "/events/+/temperature", async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)}`),
  );

  // Start the server
  await server.start();
}
```

#### 批量订阅消息

批量订阅得到支持，并可通过以下API使用：

- 通过`subscribeBulk`方法进行批量订阅：`maxMessagesCount`和`maxAwaitDurationMs`是可选的；如果不提供，将使用相关组件的默认值。

在监听消息时，应用程序会批量接收来自 Dapr 的消息。 然而，就像普通的订阅一样，回调函数每次只接收一条消息，用户可以选择返回一个 `DaprPubSubStatusEnum` 值来确认成功、重试或丢弃消息。 默认行为是返回成功响应。

请参考[此文档](https://v1-10.docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-bulk/)了解更多详情。

```typescript
import { DaprServer } from "@dapr/dapr";

const pubSubName = "orderPubSub";
const topic = "topicbulk";

const daprHost = process.env.DAPR_HOST || "127.0.0.1";
const daprHttpPort = process.env.DAPR_HTTP_PORT || "3502";
const serverHost = process.env.SERVER_HOST || "127.0.0.1";
const serverPort = process.env.APP_PORT || 5001;

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort: daprHttpPort,
    },
  });

  // Publish multiple messages to a topic with default config.
  await client.pubsub.subscribeBulk(pubSubName, topic, (data) =>
    console.log("Subscriber received: " + JSON.stringify(data)),
  );

  // Publish multiple messages to a topic with specific maxMessagesCount and maxAwaitDurationMs.
  await client.pubsub.subscribeBulk(
    pubSubName,
    topic,
    (data) => {
      console.log("Subscriber received: " + JSON.stringify(data));
      return DaprPubSubStatusEnum.SUCCESS; // If App doesn't return anything, the default is SUCCESS. App can also return RETRY or DROP based on the incoming message.
    },
    {
      maxMessagesCount: 100,
      maxAwaitDurationMs: 40,
    },
  );
}
```

#### 死信主题

Dapr支持[死信主题](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-deadletter/)。 这意味着当消息处理失败时，它会被发送到死信队列。 例如，当一个消息无法在 `/my-queue` 上处理时，它将被发送到 `/my-queue-failed`。
例如，当一个消息无法在 `/my-queue` 上处理时，它将被发送到 `/my-queue-failed`。

您可以使用以下选项与`subscribeWithOptions`方法一起使用：

- `deadletterTopic`: 指定一个死信主题名称（注意：如果没有提供，则创建一个名为`deadletter`的主题）
- `deadletterCallback`: 触发我们的死信处理程序的方法

通过以下两种方式可以在JS SDK中实现死信支持

- 将`deadletterCallback`作为选项传递
- 通过使用`subscribeToRoute`手动订阅路由

下面提供了一个示例

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const pubSubName = "my-pubsub-name";

  // Method 1 (direct subscribing through subscribeWithOptions)
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-5", {
    callback: async (data: any) => {
      throw new Error("Triggering Deadletter");
    },
    deadLetterCallback: async (data: any) => {
      console.log("Handling Deadletter message");
    },
  });

  // Method 2 (subscribe afterwards)
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-1", {
    deadletterTopic: "my-deadletter-topic",
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "default", async () => {
    throw new Error("Triggering Deadletter");
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "my-deadletter-topic", async () => {
    console.log("Handling Deadletter message");
  });

  // Start server
  await server.start();
}
```

### Bindings API

#### 接收输入绑定

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const server = new DaprServer({
    serverHost,
    serverPort,
    clientOptions: {
      daprHost,
      daprPort,
    },
  });

  const bindingName = "my-binding-name";

  const response = await server.binding.receive(bindingName, async (data: any) =>
    console.log(`Got Data: ${JSON.stringify(data)}`),
  );

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。

### 配置 API

> 💡 配置 API 目前只能通过 gRPC 获得

#### 获取配置值

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });
  const config = await client.configuration.get("config-redis", ["myconfigkey1", "myconfigkey2"]);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

#### 订阅关键变更

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });
  const stream = await client.configuration.subscribeWithKeys("config-redis", ["myconfigkey1", "myconfigkey2"], () => {
    // Received a key update
  });

  // When you are ready to stop listening, call the following
  await stream.close();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## 相关链接

- [JavaScript SDK示例](https://github.com/dapr/js-sdk/tree/main/examples)
