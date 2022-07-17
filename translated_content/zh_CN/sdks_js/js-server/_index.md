---
type: docs
title: "JavaScript Server SDK"
linkTitle: "服务器"
weight: 500
description: JavaScript Server SDK for developing Dapr applications
---

## 介绍

The Dapr Server will allow you to receive communication from the Dapr Sidecar and get access to its server facing features such as: Subscribing to Events, Receiving Input Bindings, and much more.

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Latest LTS version of Node or greater](https://nodejs.org/en/)

## Installing and importing Dapr's JS SDK

1. Install the SDK with `npm`:

```bash
npm i dapr-client --save
```

2. Import the libraries:

```javascript
import { DaprServer, CommunicationProtocolEnum } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server 

// HTTP Example
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort); 

// GRPC Example
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, CommunicationProtocolEnum.GRPC);
```

## 运行

要运行这些示例，您可以使用两种不同的协议与 Dapr Sidecar 进行交互：HTTP（默认）或 gRPC。

### 使用 HTTP（默认）

```javascript
import { DaprServer } from "dapr-client";

const server= new DaprServer(appHost, appPort, daprHost, daprPort);
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

> ℹ️ **Note:** The `app-port` is required here, as this is where our server will need to bind to. Dapr will check for the application to bind to this port, before finishing start-up.

### 使用 gRPC

由于 HTTP 是默认设置，因此必须调整通信协议才能使用 gRPC。 您可以通过向客户端或服务器构造函数传递一个额外的参数来做到这一点。

```javascript
import { DaprServer, CommunicationProtocol } from "dapr-client";

const server = new DaprServer(appHost, appPort, daprHost, daprPort, CommunicationProtocol.GRPC);
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

> ℹ️ **Note:** The `app-port` is required here, as this is where our server will need to bind to. Dapr will check for the application to bind to this port, before finishing start-up.

## 构建块

The JavaScript Server SDK allows you to interface with all of the [Dapr building blocks]({{< ref building-blocks >}}) focusing on Sidecar to App features.

### Invocation API

#### Listen to an Invocation

```javascript
import { DaprServer } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);

  await server.invoker.listen('hello-world', mock, { method: HttpMethod.GET });

  // You can now invoke the service with your app id and method "hello-world"

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### PubSub API

#### Subscribe to messages

```javascript
import { DaprServer } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server "

async function start() {
  const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Configure Subscriber for a Topic
  await server.pubsub.subscribe(pubSubName, topic, async (data: any) => console.log(`Got Data: ${JSON.stringify(data)}`));

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### 绑定 API

#### Receive an Input Binding

```javascript
import { DaprServer } from "dapr-client";

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 
const serverHost = "127.0.0.1";
const serverPort = "5051";

async function start() {
  const server = new DaprServer(serverHost, serverPort, daprHost, daprPort);;

  const bindingName = "my-binding-name";

  const response = await server.binding.receive(bindingName, async (data: any) => console.log(`Got Data: ${JSON.stringify(data)}`));

  await server.start();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

## 相关链接

- [JavaScript SDK examples](https://github.com/dapr/js-sdk/tree/master/examples)