---
type: docs
title: "JavaScript Client SDK"
linkTitle: "客户端"
weight: 500
description: JavaScript Client SDK for developing Dapr applications
---

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Latest LTS version of Node or greater](https://nodejs.org/en/)

## Installing and importing Dapr's JS SDK

Install the SDK with npm:

```bash
npm i dapr-client
```

Import the libraries:

```javascript
import { DaprClient, DaprServer, HttpMethod, CommunicationProtocolEnum } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server 

// HTTP
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort); 
const client = new DaprClient(daprHost, daprPort);

// GRPC 
const server = new DaprServer(serverHost, serverPort, daprHost, daprPort, CommunicationProtocolEnum.GRPC);
const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.GRPC);
```

## Running

To run the examples, you can use two different protocols to interact with the Dapr sidecar: HTTP (default) or gRPC.

### Using HTTP (default)

```javascript
import { DaprClient, DaprServer } from "dapr-client";
const client = new DaprClient(daprHost, daprPort);
const server= new DaprServer(appHost, appPort, daprHost, daprPort);
```

```bash
# Using dapr run
dapr run --app-id <example-sdk> --app-port 50051 --app-protocol http npm run start

# or, using npm script
npm run start:dapr-http
```

### Using gRPC

Since HTTP is the default, you will have to adapt the communication protocol to use gRPC. You can do this by passing an extra argument to the client or server constructor.

```javascript
import { DaprClient, DaprServer, CommunicationProtocol } from "dapr-client";
const client = new DaprClient(daprHost, daprPort, CommunicationProtocol.GRPC);
const server= new DaprServer(appHost, appPort, daprHost, daprPort, CommunicationProtocol.GRPC);
```

```bash
# Using dapr run
dapr run --app-id <example-sdk> --app-port 50051 --app-protocol grpc npm run start

# or, using npm script
npm run start:dapr-grpc
```

### DaprClient Library
A library that provides methods for how an application communicates with the Dapr sidecar.

### DaprServer Library
A library for how an application registers bindings / routes with Dapr. The `start()` method is used to start the server and bind the routes.

## 构建块

The JavaScript SDK allows you to interface with all of the [Dapr building blocks]({{< ref building-blocks >}}).

### 调用服务

```javascript
import { DaprClient, HttpMethod } from "dapr-client"; 

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 

async function start() {
  const client = new DaprClient(daprHost, daprPort); 

  const serviceAppId = "my-app-id";
  const serviceMethod = "say-hello";

  // POST Request
  const response = await client.invoker.invoke(serviceAppId , serviceMethod , HttpMethod.POST, { hello: "world" });

  // GET Request
  const response = await client.invoker.invoke(serviceAppId , serviceMethod , HttpMethod.GET);
}
```

- 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。

### Save, get and delete application state

```javascript
import { DaprClient } from "dapr-client"; 

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 

async function start() {
  const client = new DaprClient(daprHost, daprPort); 

  const serviceStoreName = "my-state-store-name";

  // Save State
  const response = await client.state.save(serviceStoreName, [
    {
      key: "first-key-name",
      value: "hello"
    },
    {
      key: "second-key-name",
      value: "world"
    }
  ]);

  // Get State
  const response = await client.state.get(serviceStoreName, "first-key-name");

  // Get Bulk State
  const response = await client.state.getBulk(serviceStoreName, ["first-key-name", "second-key-name"]);

  // State Transactions
  await client.state.transaction(serviceStoreName, [
    {
      operation: "upsert",
      request: {
        key: "first-key-name",
        value: "new-data"
      }
    },
    {
      operation: "delete",
      request: {
        key: "second-key-name"
      }
    }
  ]);

  // Delete State
  const response = await client.state.delete(serviceStoreName, "first-key-name");
}
```

- 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。

### Publish & subscribe to messages

##### 发布消息

```javascript
import { DaprClient } from "dapr-client"; 

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 

async function start() {
  const client = new DaprClient(daprHost, daprPort); 

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";
  const message = { hello: "world" }

  // Publish Message to Topic
  const response = await client.pubsub.publish(pubSubName, topic, message);
}
```

##### Subscribe to messages

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
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### Interact with bindings

**Output Bindings**

```javascript
import { DaprClient } from "dapr-client"; 

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 

async function start() {
  const client = new DaprClient(daprHost, daprPort); 

  const bindingName = "my-binding-name";
  const bindingOperation = "create";
  const message = { hello: "world" };

  const response = await client.binding.send(bindingName, bindingOperation, message);
}
```

**Input Bindings**

```javascript
import { DaprServer } from "dapr-client";;

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
```

- 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

### 检索密钥

```javascript
import { DaprClient } from "dapr-client"; 

const daprHost = "127.0.0.1"; 
const daprPort = "3500"; 

async function start() {
  const client = new DaprClient(daprHost, daprPort); 

  const secretStoreName = "my-secret-store";
  const secretKey = "secret-key";

  // Retrieve a single secret from secret store
  const response = await client.secret.get(secretStoreName, secretKey);

  // Retrieve all secrets from secret store
  const response = await client.secret.getBulk(secretStoreName);
}
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。

### Get configuration keys

```javascript
import { DaprClient } from "dapr-client";

const daprHost = "127.0.0.1";
const daprAppId = "example-config";

async function start() {

  const client = new DaprClient(
    daprHost,
    process.env.DAPR_HTTP_PORT
  );

  const config = await client.configuration.get('config-store', ['key1', 'key2']);
  console.log(config); 

  console.log(JSON.stringify(config));
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## 相关链接

- [JavaScript SDK examples](https://github.com/dapr/js-sdk/tree/master/examples)