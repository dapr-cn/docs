---
type: docs
title: "JavaScript 服务器 SDK"
linkTitle: "服务器"
weight: 2000
description: 用于开发 Dapr 应用的 JavaScript 服务器 SDK
---

## 介绍

Dapr 服务器使您能够接收来自 Dapr sidecar 的通信，并访问其面向服务器的功能，例如：事件订阅、接收输入绑定等。

## 准备条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- [最新的 LTS 版本的 Node 或更高版本](https://nodejs.org/en/)

## 安装和导入 Dapr 的 JS SDK

1. 使用 `npm` 安装 SDK：

```bash
npm i @dapr/dapr --save
```

2. 导入库：

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

// HTTP 示例
const server = new DaprServer({
  serverHost,
  serverPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP, // DaprClient 使用与 DaprServer 相同的通信协议，除非另有说明
  clientOptions: {
    daprHost,
    daprPort,
  },
});

// GRPC 示例
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

要运行示例，您可以使用两种不同的协议与 Dapr sidecar 交互：HTTP（默认）或 gRPC。

### 使用 HTTP（内置 express 网络服务器）

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
// 在服务器启动前初始化订阅，Dapr sidecar 依赖于这些
await server.start();
```

```bash
# 使用 dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol http -- npm run start

# 或者，使用 npm 脚本
npm run start:dapr-http
```

> ℹ️ **注意：** 这里需要 `app-port`，因为这是我们的服务器需要绑定的地方。Dapr 将检查应用程序是否绑定到此端口，然后完成启动。

### 使用 HTTP（自带 express 网络服务器）

除了使用内置的网络服务器进行 Dapr sidecar 到应用程序的通信，您还可以自带实例。这在构建 REST API 后端并希望直接集成 Dapr 时非常有用。

注意，这目前仅适用于 [`express`](https://www.npmjs.com/package/express)。

> 💡 注意：使用自定义网络服务器时，SDK 将配置服务器属性，如最大主体大小，并向其添加新路由。这些路由是独特的，以避免与您的应用程序发生任何冲突，但不能保证不发生冲突。

```typescript
import { DaprServer, CommunicationProtocolEnum } from "@dapr/dapr";
import express from "express";

const myApp = express();

myApp.get("/my-custom-endpoint", (req, res) => {
  res.send({ msg: "My own express app!" });
});

const daprServer = new DaprServer({
      serverHost: "127.0.0.1", // 应用主机
      serverPort: "50002", // 应用端口
      serverHttp: myApp,
      clientOptions: {
        daprHost,
        daprPort
      }
    });

// 在服务器启动前初始化订阅，Dapr sidecar 使用它。
// 这也将初始化应用服务器本身（无需调用 `app.listen`）。
await daprServer.start();
```

配置完上述内容后，您可以像往常一样调用您的自定义端点：

```typescript
const res = await fetch(`http://127.0.0.1:50002/my-custom-endpoint`);
const json = await res.json();
```

### 使用 gRPC

由于 HTTP 是默认的，您需要调整通信协议以使用 gRPC。您可以通过向客户端或服务器构造函数传递额外的参数来实现这一点。

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
// 在服务器启动前初始化订阅，Dapr sidecar 依赖于这些
await server.start();
```

```bash
# 使用 dapr run
dapr run --app-id example-sdk --app-port 50051 --app-protocol grpc -- npm run start

# 或者，使用 npm 脚本
npm run start:dapr-grpc
```

> ℹ️ **注意：** 这里需要 `app-port`，因为这是我们的服务器需要绑定的地方。Dapr 将检查应用程序是否绑定到此端口，然后完成启动。

## 构建块

JavaScript 服务器 SDK 允许您与所有 [Dapr 构建块]({{< ref building-blocks >}}) 进行接口交互，重点是 sidecar 到应用程序的功能。

### 调用 API

#### 监听调用

```typescript
import { DaprServer, DaprInvokerCallbackContent } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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
    console.log("Received headers: ", data.headers); // 仅在 HTTP 中可用
  };

  await server.invoker.listen("hello-world", callbackFunction, { method: HttpMethod.GET });

  // 您现在可以使用您的应用 ID 和方法 "hello-world" 调用服务

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### PubSub API

#### 订阅消息

可以通过多种方式订阅消息，以提供接收主题消息的灵活性：

- 通过 `subscribe` 方法直接订阅
- 通过 `subscribeWithOptions` 方法直接订阅并带有选项
- 通过 `susbcribeOnEvent` 方法之后订阅

每次事件到达时，我们将其主体作为 `data` 传递，并将头信息作为 `headers` 传递，其中可以包含事件发布者的属性（例如，来自 IoT Hub 的设备 ID）

> Dapr 要求在启动时设置订阅，但在 JS SDK 中，我们允许之后添加事件处理程序，为您提供编程的灵活性。

下面提供了一个示例

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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

  // 为主题配置订阅者
  // 方法 1：通过 `subscribe` 方法直接订阅
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`),
  );

  // 方法 2：通过 `subscribeWithOptions` 方法直接订阅并带有选项
  await server.pubsub.subscribeWithOptions(pubSubName, topic, {
    callback: async (data: any, headers: object) =>
      console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`),
  });

  // 方法 3：通过 `susbcribeOnEvent` 方法之后订阅
  // 注意：我们使用默认值，因为如果没有传递路由（空选项），我们将使用 "default" 作为路由名称
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-1", {});
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "default", async (data: any, headers: object) => {
    console.log(`Received Data: ${JSON.stringify(data)} with headers: ${JSON.stringify(headers)}`);
  });

  // 启动服务器
  await server.start();
}
```

> 有关状态操作的完整列表，请访问 [如何：发布和订阅]({{< ref howto-publish-subscribe.md >}})。

#### 使用 SUCCESS/RETRY/DROP 状态订阅

Dapr 支持 [重试逻辑的状态码](https://docs.dapr.io/reference/api/pubsub_api/#expected-http-response)，以指定消息处理后应执行的操作。

> ⚠️ JS SDK 允许在同一主题上有多个回调，我们处理状态优先级为 `RETRY` > `DROP` > `SUCCESS`，默认为 `SUCCESS`

> ⚠️ 确保在应用程序中 [配置弹性](https://docs.dapr.io/operations/resiliency/resiliency-overview/) 以处理 `RETRY` 消息

在 JS SDK 中，我们通过 `DaprPubSubStatusEnum` 枚举支持这些消息。为了确保 Dapr 将重试，我们还配置了一个弹性策略。

**components/resiliency.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: myresiliency
spec:
  policies:
    retries:
      # 全局重试策略用于入站组件操作
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

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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

  // 成功处理消息
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.SUCCESS;
  });

  // 重试消息
  // 注意：此示例将继续重试传递消息
  // 注意 2：每个组件可以有自己的重试配置
  //   例如，https://docs.dapr.io/reference/components-reference/supported-pubsub/setup-redis-pubsub/
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.RETRY;
  });

  // 丢弃消息
  await server.pubsub.subscribe(pubSubName, topic, async (data: any, headers: object) => {
    return DaprPubSubStatusEnum.DROP;
  });

  // 启动服务器
  await server.start();
}
```

#### 基于规则订阅消息

Dapr [支持路由消息](https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-route-messages/) 到不同的处理程序（路由）基于规则。

> 例如，您正在编写一个需要根据消息的 "type" 处理消息的应用程序，使用 Dapr，您可以将它们发送到不同的路由 `handlerType1` 和 `handlerType2`，默认路由为 `handlerDefault`

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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

  // 为主题配置订阅者并设置规则
  // 注意：默认路由和匹配模式是可选的
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

  // 为每个路由添加处理程序
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "default", async (data) => {
    console.log(`Handling Default`);
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "type-1", async (data) => {
    console.log(`Handling Type 1`);
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-1", "type-2", async (data) => {
    console.log(`Handling Type 2`);
  });

  // 启动服务器
  await server.start();
}
```

#### 使用通配符订阅

支持流行的通配符 `*` 和 `+`（请确保验证 [pubsub 组件是否支持](https://docs.dapr.io/reference/components-reference/supported-pubsub/)）并可以按如下方式订阅：

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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

  // * 通配符
  await server.pubsub.subscribe(pubSubName, "/events/*", async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)}`),
  );

  // + 通配符
  await server.pubsub.subscribe(pubSubName, "/events/+/temperature", async (data: any, headers: object) =>
    console.log(`Received Data: ${JSON.stringify(data)}`),
  );

  // 启动服务器
  await server.start();
}
```

#### 批量订阅消息

支持批量订阅，并可通过以下 API 获得：

- 通过 `subscribeBulk` 方法进行批量订阅：`maxMessagesCount` 和 `maxAwaitDurationMs` 是可选的；如果未提供，将使用相关组件的默认值。

在监听消息时，应用程序以批量方式从 Dapr 接收消息。然而，与常规订阅一样，回调函数一次接收一条消息，用户可以选择返回 `DaprPubSubStatusEnum` 值以确认成功、重试或丢弃消息。默认行为是返回成功响应。

请参阅 [此文档](https://v1-10.docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-bulk/) 以获取更多详细信息。

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

  // 使用默认配置向主题发布多条消息。
  await client.pubsub.subscribeBulk(pubSubName, topic, (data) =>
    console.log("Subscriber received: " + JSON.stringify(data)),
  );

  // 使用特定的 maxMessagesCount 和 maxAwaitDurationMs 向主题发布多条消息。
  await client.pubsub.subscribeBulk(
    pubSubName,
    topic,
    (data) => {
      console.log("Subscriber received: " + JSON.stringify(data));
      return DaprPubSubStatusEnum.SUCCESS; // 如果应用程序没有返回任何内容，默认是 SUCCESS。应用程序还可以根据传入的消息返回 RETRY 或 DROP。
    },
    {
      maxMessagesCount: 100,
      maxAwaitDurationMs: 40,
    },
  );
}
```

#### 死信主题

Dapr 支持 [死信主题](https://docs.dapr.io/developing-applications/building-blocks/pubsub/pubsub-deadletter/)。这意味着当消息处理失败时，它会被发送到死信队列。例如，当消息在 `/my-queue` 上处理失败时，它将被发送到 `/my-queue-failed`。
例如，当消息在 `/my-queue` 上处理失败时，它将被发送到 `/my-queue-failed`。

您可以使用 `subscribeWithOptions` 方法的以下选项：

- `deadletterTopic`：指定死信主题名称（注意：如果未提供，我们将创建一个名为 `deadletter` 的主题）
- `deadletterCallback`：作为死信处理程序触发的方法

在 JS SDK 中实现死信支持可以通过以下方式：

- 作为选项传递 `deadletterCallback`
- 通过 `subscribeToRoute` 手动订阅路由

下面提供了一个示例

```typescript
import { DaprServer } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr sidecar 主机
const daprPort = "3500"; // Dapr sidecar 端口
const serverHost = "127.0.0.1"; // 应用主机
const serverPort = "50051"; // 应用端口

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

  // 方法 1（通过 subscribeWithOptions 直接订阅）
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-5", {
    callback: async (data: any) => {
      throw new Error("Triggering Deadletter");
    },
    deadLetterCallback: async (data: any) => {
      console.log("Handling Deadletter message");
    },
  });

  // 方法 2（之后订阅）
  await server.pubsub.subscribeWithOptions("pubsub-redis", "topic-options-1", {
    deadletterTopic: "my-deadletter-topic",
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "default", async () => {
    throw new Error("Triggering Deadletter");
  });
  server.pubsub.subscribeToRoute("pubsub-redis", "topic-options-1", "my-deadletter-topic", async () => {
    console.log("Handling Deadletter message");
  });

  // 启动服务器
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

> 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

### Configuration API

> 💡 配置 API 目前仅通过 gRPC 可用

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

#### 订阅键更改

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
    // 收到键更新
  });

  // 当您准备好停止监听时，调用以下命令
  await stream.close();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## 相关链接

- [JavaScript SDK 示例](https://github.com/dapr/js-sdk/tree/main/examples)
