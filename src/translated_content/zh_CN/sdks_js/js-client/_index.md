---
type: docs
title: "JavaScript 客户端 SDK"
linkTitle: "客户端"
weight: 500
description: JavaScript 客户端 SDK，用于开发 Dapr 应用程序
---

## 介绍

Dapr客户端允许您与Dapr Sidecar进行通信，并访问其面向客户端的功能，例如发布事件，调用输出绑定，状态管理，机密管理等等。

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Node.js 的最新 LTS 版本或更高版本](https://nodejs.org/en/)

## 安装和导入 Dapr 的 JS SDK

1. 使用 `npm` 安装 SDK：

```bash
npm i dapr-client --save
```

2. 导入类库：

```javascript
import { DaprClient, DaprServer, HttpMethod, CommunicationProtocolEnum } from "dapr-client";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server 

// HTTP Example
const client = new DaprClient(daprHost, daprPort);

// GRPC Example
const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.GRPC);
```

## 运行

要运行这些示例，您可以使用两种不同的协议与 Dapr Sidecar 进行交互：HTTP（默认）或 gRPC。

### 使用 HTTP（默认）

```javascript
import { DaprClient } from "dapr-client";
const client = new DaprClient(daprHost, daprPort);
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol http -- npm run start

# or, using npm script
npm run start:dapr-http
```

### 使用 gRPC

由于 HTTP 是默认设置，因此必须调整通信协议才能使用 gRPC。 您可以通过向客户端或服务器构造函数传递一个额外的参数来做到这一点。

```javascript
import { DaprClient, CommunicationProtocol } from "dapr-client";
const client = new DaprClient(daprHost, daprPort, CommunicationProtocol.GRPC);
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol grpc -- npm run start

# or, using npm script
npm run start:dapr-grpc
```

## 构建块

JavaScript Client SDK允许您与所有专注于客户端到Sidecar功能的[Dapr构建块]({{< ref building-blocks >}})进行交互。

### 调用 API

#### 调用服务

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

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关服务调用的完整指南，请访问 [如何：调用服务]({{< ref howto-invoke-discover-services.md >}})。


### 状态管理 API

#### 保存、获取和删除应用程序状态

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

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关状态操作的完整列表，请访问 [如何：获取 & 保存 状态。]({{< ref howto-get-save-state.md >}})。


#### Query State API

```javascript
import { DaprClient } from "dapr-client";

async function start() {
  const client = new DaprClient(daprHost, daprPort);

  const res = await client.state.query("state-mongodb", {
    filter: {
      OR: [
        {
          EQ: { "person.org": "Dev Ops" }
        },
        {
          "AND": [
            {
              "EQ": { "person.org": "Finance" }
            },
            {
              "IN": { "state": ["CA", "WA"] }
            }
          ]
        }
      ]
    },
    sort: [
      {
        key: "state",
        order: "DESC"
      }
    ],
    page: {
      limit: 10
    }
  });

  console.log(res);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### PubSub API

#### 发布消息

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

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
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

  // Configure Subscriber for a Topic
  await server.pubsub.subscribe(pubSubName, topic, async (data: any) => console.log(`Got Data: ${JSON.stringify(data)}`));

  await server.start();
}
```

> 有关状态操作的完整列表，请访问 [如何: 发布 & 订阅]({{< ref howto-publish-subscribe.md >}})。

### 绑定 API

#### 调用输出绑定

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

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关输出绑定的完整指南，请访问 [如何：使用绑定]({{< ref howto-bindings.md >}})。

### Secret API

#### 检索密钥

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

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关密钥的完整指南，请访问[如何：检索密钥]({{< ref howto-secrets.md >}})。

### Configuration API

#### Get Configuration Keys

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
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## 相关链接

- [JavaScript SDK 示例](https://github.com/dapr/js-sdk/tree/master/examples)