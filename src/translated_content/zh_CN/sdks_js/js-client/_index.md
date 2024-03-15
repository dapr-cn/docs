---
type: docs
title: JavaScript 客户端 SDK
linkTitle: Client
weight: 1000
description: JavaScript 客户端 SDK，用于开发 Dapr 应用程序
---

## 介绍

Dapr客户端允许您与Dapr Sidecar进行通信，并访问其面向客户端的功能，例如发布事件，调用输出绑定，状态管理，机密管理等等。

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
import { DaprClient, DaprServer, HttpMethod, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1"; // Dapr Sidecar Host
const daprPort = "3500"; // Dapr Sidecar Port of this Example Server
const serverHost = "127.0.0.1"; // App Host of this Example Server
const serverPort = "50051"; // App Port of this Example Server

// HTTP Example
const client = new DaprClient({ daprHost, daprPort });

// GRPC Example
const client = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocolEnum.GRPC });
```

## 运行

要运行这些示例，您可以使用两种不同的协议与 Dapr Sidecar 进行交互：HTTP（默认）或 gRPC。

### 使用 HTTP（默认）

```typescript
import { DaprClient } from "@dapr/dapr";
const client = new DaprClient({ daprHost, daprPort });
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol http -- npm run start

# or, using npm script
npm run start:dapr-http
```

### 使用 gRPC

由于 HTTP 是默认设置，因此必须调整通信协议才能使用 gRPC。 您可以通过向客户端或服务器构造函数传递一个额外的参数来做到这一点。

```typescript
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";
const client = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocol.GRPC });
```

```bash
# Using dapr run
dapr run --app-id example-sdk --app-protocol grpc -- npm run start

# or, using npm script
npm run start:dapr-grpc
```

### 环境变量

##### Dapr Sidecar 终端点

您可以使用 `DAPR_HTTP_ENDPOINT` 和 `DAPR_GRPC_ENDPOINT` 环境变量分别设置 Dapr
Sidecar 的 HTTP 和 gRPC 终端。 当这些变量被设置时，`daprHost`和`daprPort`不需要在构造函数的选项参数中设置，客户端会自动从提供的端点中解析出它们。

```typescript
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";

// Using HTTP, when DAPR_HTTP_ENDPOINT is set
const client = new DaprClient();

// Using gRPC, when DAPR_GRPC_ENDPOINT is set
const client = new DaprClient({ communicationProtocol: CommunicationProtocol.GRPC });
```

如果环境变量已设置，但是`daprHost`和`daprPort`的值被传递给构造函数，后者将优先于环境变量。

##### Dapr API 令牌

您可以使用 `DAPR_API_TOKEN` 环境变量来设置 Dapr API 令牌。 当这个变量被设置时，`daprApiToken`不需要在构造函数的选项参数中设置，客户端会自动获取它。

## 通用

### 增加 Body 大小

您可以通过使用`DaprClient`的选项来增加应用程序与侧车通信时使用的主体大小。

```typescript
import { DaprClient, CommunicationProtocol } from "@dapr/dapr";

// Allow a body size of 10Mb to be used
// The default is 4Mb
const client = new DaprClient({
  daprHost,
  daprPort,
  communicationProtocol: CommunicationProtocol.HTTP,
  maxBodySizeMb: 10,
});
```

### 代理请求

通过代理请求，我们可以利用 Dapr 的 sidecar 架构带来的独特功能，如服务发现、日志记录等，使我们能够立即"升级"我们的 gRPC 服务。 gRPC代理的这个特性在[社区讨论41](https://www.youtube.com/watch?v=B_vkXqptpXY\&t=71s)中进行了演示。

#### 创建代理

要执行gRPC代理，只需调用`client.proxy.create()`方法创建一个代理：

```typescript
// As always, create a client to our dapr sidecar
// this client takes care of making sure the sidecar is started, that we can communicate, ...
const clientSidecar = new DaprClient({ daprHost, daprPort, communicationProtocol: CommunicationProtocol.GRPC });

// Create a Proxy that allows us to use our gRPC code
const clientProxy = await clientSidecar.proxy.create<GreeterClient>(GreeterClient);
```

我们现在可以调用在我们的`GreeterClient`接口中定义的方法（在这个例子中是来自[Hello World example](https://github.com/grpc/grpc-go/blob/master/examples/helloworld/helloworld/helloworld.proto)）

#### 幕后原理（技术工作）

![架构](assets/architecture.png)

1. gRPC 服务在 Dapr 中启动。 我们通过 `--app-port` 告诉 Dapr 这个 gRPC 服务器运行在哪个端口，并使用 `--app-id <APP_ID_HERE>` 给它一个唯一的 Dapr 应用程序 ID
2. 现在我们可以通过一个客户端来调用 Dapr Sidecar，该客户端将连接到 Sidecar
3. 在调用 Dapr Sidecar 时，我们提供一个名为 `dapr-app-id` 的元数据键，其值为我们在 Dapr 中启动的 gRPC 服务器的名称（例如，在我们的示例中为 `server`）
4. Dapr 现在会将调用转发到配置的 gRPC 服务器

## 构建块

JavaScript 客户端 SDK 允许您与所有[Dapr 构建块]({{< ref building-blocks >}}) 专注于客户端到 Sidecar 功能。

### 调用 API

#### 调用服务

```typescript
import { DaprClient, HttpMethod } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const serviceAppId = "my-app-id";
  const serviceMethod = "say-hello";

  // POST Request
  const response = await client.invoker.invoke(serviceAppId, serviceMethod, HttpMethod.POST, { hello: "world" });

  // POST Request with headers
  const response = await client.invoker.invoke(
    serviceAppId,
    serviceMethod,
    HttpMethod.POST,
    { hello: "world" },
    { headers: { "X-User-ID": "123" } },
  );

  // GET Request
  const response = await client.invoker.invoke(serviceAppId, serviceMethod, HttpMethod.GET);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关服务调用的完整指南，请访问[操作方法: 调用服务]({{< ref howto-invoke-discover-services.md >}})。

### 状态管理 API

#### 保存、获取和删除应用程序状态

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const serviceStoreName = "my-state-store-name";

  // Save State
  const response = await client.state.save(
    serviceStoreName,
    [
      {
        key: "first-key-name",
        value: "hello",
        metadata: {
          foo: "bar",
        },
      },
      {
        key: "second-key-name",
        value: "world",
      },
    ],
    {
      metadata: {
        ttlInSeconds: "3", // this should override the ttl in the state item
      },
    },
  );

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
        value: "new-data",
      },
    },
    {
      operation: "delete",
      request: {
        key: "second-key-name",
      },
    },
  ]);

  // Delete State
  const response = await client.state.delete(serviceStoreName, "first-key-name");
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关状态操作的完整列表，请访问 [操作方法：获取和保存状态]({{< ref howto-get-save-state.md >}}).

#### 查询状态：

```typescript
import { DaprClient } from "@dapr/dapr";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const res = await client.state.query("state-mongodb", {
    filter: {
      OR: [
        {
          EQ: { "person.org": "Dev Ops" },
        },
        {
          AND: [
            {
              EQ: { "person.org": "Finance" },
            },
            {
              IN: { state: ["CA", "WA"] },
            },
          ],
        },
      ],
    },
    sort: [
      {
        key: "state",
        order: "DESC",
      },
    ],
    page: {
      limit: 10,
    },
  });

  console.log(res);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### Pub/Sub API

#### 发布消息

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const pubSubName = "my-pubsub-name";
  const topic = "topic-a";

  // Publish message to topic as text/plain
  // Note, the content type is inferred from the message type unless specified explicitly
  const response = await client.pubsub.publish(pubSubName, topic, "hello, world!");
  // If publish fails, response contains the error
  console.log(response);

  // Publish message to topic as application/json
  await client.pubsub.publish(pubSubName, topic, { hello: "world" });

  // Publish a JSON message as plain text
  const options = { contentType: "text/plain" };
  await client.pubsub.publish(pubSubName, topic, { hello: "world" }, options);

  // Publish message to topic as application/cloudevents+json
  // You can also use the cloudevent SDK to create cloud events https://github.com/cloudevents/sdk-javascript
  const cloudEvent = {
    specversion: "1.0",
    source: "/some/source",
    type: "example",
    id: "1234",
  };
  await client.pubsub.publish(pubSubName, topic, cloudEvent);

  // Publish a cloudevent as raw payload
  const options = { metadata: { rawPayload: true } };
  await client.pubsub.publish(pubSubName, topic, "hello, world!", options);

  // Publish multiple messages to a topic as text/plain
  await client.pubsub.publishBulk(pubSubName, topic, ["message 1", "message 2", "message 3"]);

  // Publish multiple messages to a topic as application/json
  await client.pubsub.publishBulk(pubSubName, topic, [
    { hello: "message 1" },
    { hello: "message 2" },
    { hello: "message 3" },
  ]);

  // Publish multiple messages with explicit bulk publish messages
  const bulkPublishMessages = [
    {
      entryID: "entry-1",
      contentType: "application/json",
      event: { hello: "foo message 1" },
    },
    {
      entryID: "entry-2",
      contentType: "application/cloudevents+json",
      event: { ...cloudEvent, data: "foo message 2", datacontenttype: "text/plain" },
    },
    {
      entryID: "entry-3",
      contentType: "text/plain",
      event: "foo message 3",
    },
  ];
  await client.pubsub.publishBulk(pubSubName, topic, bulkPublishMessages);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

### Bindings API

#### 调用输出绑定

**输出绑定**

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

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

> 有关输出绑定的完整指南，请访问[操作方法：使用绑定]({{< ref howto-bindings.md >}})。

### 密钥 API

#### 检索密钥

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

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

> 有关秘密的完整指南，请访问[操作方法: 检索秘密]({{< ref howto-secrets.md >}})。

### 配置 API

#### 获取配置键

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  const config = await client.configuration.get("config-store", ["key1", "key2"]);
  console.log(config);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

示例输出

```log
{
   items: {
     key1: { key: 'key1', value: 'foo', version: '', metadata: {} },
     key2: { key: 'key2', value: 'bar2', version: '', metadata: {} }
   }
}
```

#### 订阅配置更新

```typescript
import { DaprClient } from "@dapr/dapr";

const daprHost = "127.0.0.1";

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort: process.env.DAPR_GRPC_PORT,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Subscribes to config store changes for keys "key1" and "key2"
  const stream = await client.configuration.subscribeWithKeys("config-store", ["key1", "key2"], async (data) => {
    console.log("Subscribe received updates from config store: ", data);
  });

  // Wait for 60 seconds and unsubscribe.
  await new Promise((resolve) => setTimeout(resolve, 60000));
  stream.stop();
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

示例输出

```log
Subscribe received updates from config store:  {
  items: { key2: { key: 'key2', value: 'bar', version: '', metadata: {} } }
}
Subscribe received updates from config store:  {
  items: { key1: { key: 'key1', value: 'foobar', version: '', metadata: {} } }
}
```

### 加密 API

> 对加密 API 的支持仅在 JavaScript SDK 中的 gRPC 客户端上可用。

```typescript
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";

import { DaprClient, CommunicationProtocolEnum } from "@dapr/dapr";

const daprHost = "127.0.0.1";
const daprPort = "50050"; // Dapr Sidecar Port of this example server

async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Encrypt and decrypt a message using streams
  await encryptDecryptStream(client);

  // Encrypt and decrypt a message from a buffer
  await encryptDecryptBuffer(client);
}

async function encryptDecryptStream(client: DaprClient) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting plaintext.txt to ciphertext.out");

  await pipeline(
    createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
      componentName: "crypto-local",
      keyName: "symmetric256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("ciphertext.out"),
  );

  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Encrypting ciphertext.out to plaintext.out");
  await pipeline(
    createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
      componentName: "crypto-local",
    }),
    createWriteStream("plaintext.out"),
  );
}

async function encryptDecryptBuffer(client: DaprClient) {
  // Read "plaintext.txt" so we have some content
  const plaintext = await readFile("plaintext.txt");

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const ciphertext = await client.crypto.encrypt(plaintext, {
    componentName: "crypto-local",
    keyName: "my-rsa-key",
    keyWrapAlgorithm: "RSA",
  });

  await writeFile("test.out", ciphertext);

  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(ciphertext, {
    componentName: "crypto-local",
  });

  // The contents should be equal
  if (plaintext.compare(decrypted) !== 0) {
    throw new Error("Decrypted message does not match original message");
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 有关密码学的完整指南，请访问[操作方法：密码学]({{< ref howto-cryptography.md >}})。

### 分布式锁 API

#### 尝试锁定和解锁API

```typescript
import { CommunicationProtocolEnum, DaprClient } from "@dapr/dapr";
import { LockStatus } from "@dapr/dapr/types/lock/UnlockResponse";

const daprHost = "127.0.0.1";
const daprPortDefault = "3500";

async function start() {
  const client = new DaprClient({ daprHost, daprPort });

  const storeName = "redislock";
  const resourceId = "resourceId";
  const lockOwner = "owner1";
  let expiryInSeconds = 1000;

  console.log(`Acquiring lock on ${storeName}, ${resourceId} as owner: ${lockOwner}`);
  const lockResponse = await client.lock.lock(storeName, resourceId, lockOwner, expiryInSeconds);
  console.log(lockResponse);

  console.log(`Unlocking on ${storeName}, ${resourceId} as owner: ${lockOwner}`);
  const unlockResponse = await client.lock.unlock(storeName, resourceId, lockOwner);
  console.log("Unlock API response: " + getResponseStatus(unlockResponse.status));
}

function getResponseStatus(status: LockStatus) {
  switch (status) {
    case LockStatus.Success:
      return "Success";
    case LockStatus.LockDoesNotExist:
      return "LockDoesNotExist";
    case LockStatus.LockBelongsToOthers:
      return "LockBelongsToOthers";
    default:
      return "InternalError";
  }
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> 了解有关使用分布式锁的完整指南：[操作方法：使用分布式锁]({{< ref howto-use-distributed-lock.md >}}).

### 工作流 API

#### 工作流管理

```typescript
import { DaprClient } from "@dapr/dapr";

async function start() {
  const client = new DaprClient();

  // Start a new workflow instance
  const instanceId = await client.workflow.start("OrderProcessingWorkflow", {
    Name: "Paperclips",
    TotalCost: 99.95,
    Quantity: 4,
  });
  console.log(`Started workflow instance ${instanceId}`);

  // Get a workflow instance
  const workflow = await client.workflow.get(instanceId);
  console.log(
    `Workflow ${workflow.workflowName}, created at ${workflow.createdAt.toUTCString()}, has status ${
      workflow.runtimeStatus
    }`,
  );
  console.log(`Additional properties: ${JSON.stringify(workflow.properties)}`);

  // Pause a workflow instance
  await client.workflow.pause(instanceId);
  console.log(`Paused workflow instance ${instanceId}`);

  // Resume a workflow instance
  await client.workflow.resume(instanceId);
  console.log(`Resumed workflow instance ${instanceId}`);

  // Terminate a workflow instance
  await client.workflow.terminate(instanceId);
  console.log(`Terminated workflow instance ${instanceId}`);

  // Purge a workflow instance
  await client.workflow.purge(instanceId);
  console.log(`Purged workflow instance ${instanceId}`);
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

## 相关链接

- [JavaScript SDK示例](https://github.com/dapr/js-sdk/tree/master/examples)
