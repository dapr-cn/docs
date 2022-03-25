---
type: 文档
title: "JavaScript 客户端 SDK"
linkTitle: "客户端"
weight: 500
description: JavaScript 客户端 SDK，用于开发 Dapr 应用程序
---

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [NodeJS的最新LTS版本或更高版本](https://nodejs.org/en/)

## 安装和导入 Dapr 的 JS SDK

使用 npm 安装 SDK ：

```bash
npm i dapr-client
```

导入类库：

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

## 运行

要运行这些示例，您可以使用两种不同的协议与 Dapr sidecar 进行交互：HTTP (默认) 或 gRPC。

### 使用 HTTP (默认)

```javascript
import { DaprClient, DaprServer } from "dapr-client";
const client = new DaprClient(daprHost, daprPort);
const server= new DaprServer(appHost, appPort, daprHost, daprPort);
```

```bash
# 使用 dapr 运行
dapr run --app-id <example-sdk> --app-port 50051 --app-protocol http npm run start

# 或者使用 npm 脚本
npm run start:dapr-http
```

### 使用 gRPC

由于 HTTP 是默认设置，因此必须调整通信协议才能使用 gRPC。 你可以通过将额外的参数传递给客户端或服务器构造函数来执行此操作。

```javascript
import { DaprClient, DaprServer, CommunicationProtocol } from "dapr-client";
const client = new DaprClient(daprHost, daprPort, CommunicationProtocol.GRPC);
const server= new DaprServer(appHost, appPort, daprHost, daprPort, CommunicationProtocol.GRPC);
```

```bash
# 使用 dapr 运行
dapr run --app-id <example-sdk> --app-port 50051 --app-protocol grpc npm run start

# 或者使用 npm 脚本
npm run start:dapr-grpc
```

### DaprClient 类库
该类库提供应用程序与 Dapr sidecar 进行通信的方法。

### DaprServer 类库
该类库用于应用程序向 Dapr 注册绑定/路由。 `start()`方法被用来启动服务器并绑定路由。

## 构建块

JavaScript SDK 允许您与的所有 [Dapr 构建块]({{< ref building-blocks >}})进行交互。

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

### 保存、获取和删除应用程序状态

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

### 发布 & 订阅消息

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

  // 发布消息到主题
  const response = await client.pubsub.publish(pubSubName, topic, message);
}
```

##### 订阅消息

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

  // 订阅主题
  await server.pubsub.subscribe(pubSubName, topic, async (data: any) => console.log(`Got Data: ${JSON.stringify(data)}`));

  await server.start();
}
```

- 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### 与绑定交互

**输出绑定**

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

**输入绑定**

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

  // 从密钥存储库中取回其中一个密钥
  const response = await client.secret.get(secretStoreName, secretKey);

  // 从密钥存储库中取回其所有密钥
  const response = await client.secret.getBulk(secretStoreName);
}
```

- 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。

### 获取配置

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

- [JavaScript SDK 示例](https://github.com/dapr/js-sdk/tree/master/examples)