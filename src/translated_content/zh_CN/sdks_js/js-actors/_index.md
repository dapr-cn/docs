---
type: docs
title: "使用 JavaScript SDK 运行 Actor"
linkTitle: "Actors"
weight: 3000
description: 如何使用 Dapr JavaScript SDK 启动和运行 Actor
---

通过 Dapr Actor 包，您可以与 JavaScript 应用程序中的 Dapr 虚拟 Actor 进行交互。 下面的示例讲演示如何使用 JavaScript SDK 与 Dapr 虚拟 Actor 进行交互。

有关 Dapr Actor 的更深入说明，请访问 [概述页面]({{< ref actors-overview >}})。

## 前提

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [Node.js 的最新 LTS 版本或更高版本](https://nodejs.org/en/)
- [已安装 JavaScript NPM 包](https://www.npmjs.com/package/@dapr/dapr)

## 场景

下面的代码示例粗略地描述了停车库点监控系统的场景，可以在这个[Mark Russinovich 提供的视频中看到](https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785)。

停车库由数百个停车位组成，每个停车位都包括一个传感器，该传感器为集中监控系统提供更新。 停车位传感器（我们的 Actor）检测一个泊车位是否被占用，或是否可用。

要想自己运行这个例子，请克隆源代码，它可以在 [JavaScript SDK 示例目录](https://github.com/dapr/js-sdk/tree/main/examples/http/actor-parking-sensor) 中找到。

## Actor 接口

Actor 接口定义了 Actor 契约，由 Actor 实现和调用 Actor 的客户端共享。 在下面的例子中，我们为一个停车场的传感器创建了一个接口。 每个传感器有 2 种方法： `carEnter` 和 `carLeave`，它定义了停车位的状态：

```ts
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor 实现

一个 actor 实现通过扩展基本类型 `AbstractActor` 来定义一个类，并实现 actor 接口（在这种情况下是 `ParkingSensorInterface`）。

下面的代码描述了一个演员实现以及几个辅助方法。

```ts
import { AbstractActor } from "@dapr/dapr";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // Implementation that updates state that this parking spaces is occupied.
  }

  async carLeave(): Promise<void> {
    // Implementation that updates state that this parking spaces is available.
  }

  private async getInfo(): Promise<object> {
    // Implementation of requesting an update from the parking space sensor.
  }

  /**
   * @override
   */
  async onActivate(): Promise<void> {
    // Initialization logic called by AbstractActor.
  }
}
```

### 配置Actor运行时

要配置 actor 运行时，请使用 `DaprClientOptions`。 各种参数及其默认值在[如何使用 Dapr 中的虚拟 actor](https://docs.dapr.io/developing-applications/building-blocks/actors/howto-actors/#configuration-parameters)中有文档记录。

注意，超时和间隔应以[time.ParseDuration](https://pkg.go.dev/time#ParseDuration)字符串的格式进行格式化。

```typescript
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// Configure the actor runtime with the DaprClientOptions.
const clientOptions = {
  daprHost: daprHost,
  daprPort: daprPort,
  communicationProtocol: CommunicationProtocolEnum.HTTP,
  actor: {
    actorIdleTimeout: "1h",
    actorScanInterval: "30s",
    drainOngoingCallTimeout: "1m",
    drainRebalancedActors: true,
    reentrancy: {
      enabled: true,
      maxStackDepth: 32,
    },
    remindersStoragePartitions: 0,
  },
};

// Use the options when creating DaprServer and DaprClient.

// Note, DaprServer creates a DaprClient internally, which needs to be configured with clientOptions.
const server = new DaprServer({ serverHost, serverPort, clientOptions });

const client = new DaprClient(clientOptions);
```

## 注册 Actor

通过使用`DaprServer`包初始化和注册您的Actor：

```typescript
import { DaprServer } from "@dapr/dapr";
import ParkingSensorImpl from "./ParkingSensorImpl";

const daprHost = "127.0.0.1";
const daprPort = "50000";
const serverHost = "127.0.0.1";
const serverPort = "50001";

const server = new DaprServer({
  serverHost,
  serverPort,
  clientOptions: {
    daprHost,
    daprPort,
  },
});

await server.actor.init(); // Let the server know we need actors
server.actor.registerActor(ParkingSensorImpl); // Register the actor
await server.start(); // Start the server

// To get the registered actors, you can invoke `getRegisteredActors`:
const resRegisteredActors = await server.actor.getRegisteredActors();
console.log(`Registered Actors: ${JSON.stringify(resRegisteredActors)}`);
```

## 调用 Actor 的方法:

注册完 Actors 后，使用 `ActorProxyBuilder` 创建一个实现 `ParkingSensorInterface` 的代理对象。 您可以通过直接在代理对象上调用方法来调用 actor 的方法。 在内部，它会调用 Actor API 进行网络请求，并获取结果返回。

```typescript
import { ActorId, DaprClient } from "@dapr/dapr";
import ParkingSensorImpl from "./ParkingSensorImpl";
import ParkingSensorInterface from "./ParkingSensorInterface";

const daprHost = "127.0.0.1";
const daprPort = "50000";

const client = new DaprClient({ daprHost, daprPort });

// Create a new actor builder. It can be used to create multiple actors of a type.
const builder = new ActorProxyBuilder<ParkingSensorInterface>(ParkingSensorImpl, client);

// Create a new actor instance.
const actor = builder.build(new ActorId("my-actor"));
// Or alternatively, use a random ID
// const actor = builder.build(ActorId.createRandomId());

// Invoke the method.
await actor.carEnter();
```

## 使用状态与Actor

```ts
import { AbstractActor } from "@dapr/dapr";
import ActorStateInterface from "./ActorStateInterface";

export default class ActorStateExample extends AbstractActor implements ActorStateInterface {
  async setState(key: string, value: any): Promise<void> {
    await this.getStateManager().setState(key, value);
    await this.getStateManager().saveState();
  }

  async removeState(key: string): Promise<void> {
    await this.getStateManager().removeState(key);
    await this.getStateManager().saveState();
  }

  // getState with a specific type
  async getState<T>(key: string): Promise<T | null> {
    return await this.getStateManager<T>().getState(key);
  }

  // getState without type as `any`
  async getState(key: string): Promise<any> {
    return await this.getStateManager().getState(key);
  }
}
```

## Actor Timer 和 Reminder

Actor 可以通过注册 Timer 或 Reminder 来安排自己的周期性任务。 定时器和提醒的主要区别在于，Dapr actor 运行时在停用后不保留任何有关定时器的信息，而使用 Dapr actor 状态提供程序持久化提醒的信息。

这种区别允许用户在轻量级但无状态的timer和需要更多资源但有状态的reminder之间进行权衡。

Timer 和 Reminder 的调度接口定义是完全相同的。 如需更深入地了解调度配置，请参阅 [Actor Timer 和 Reminder 文档]({{< ref "howto-actors.md#actor-timers-and-reminders" >}})。

### Actor Timer

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// Register a timer
await actor.registerActorTimer(
  "timer-id", // Unique name of the timer.
  "cb-method", // Callback method to execute when timer is fired.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  50, // State to be sent to timer callback.
);

// Delete the timer
await actor.unregisterActorTimer("timer-id");
```

### Actor Reminder

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// Register a reminder, it has a default callback: `receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // Unique name of the reminder.
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // State to be sent to reminder callback.
);

// Delete the reminder
await actor.unregisterActorReminder("reminder-id");
```

要处理回调，您需要在您的actor中重写默认的`receiveReminder`实现。 例如，从我们的原始actor实现：

```ts
export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  // ...

  /**
   * @override
   */
  async receiveReminder(state: any): Promise<void> {
    // handle stuff here
  }

  // ...
}
```

有关 Actor 的完整指南，请访问 [操作方法：在 Dapr 中使用 Actor ]({{< ref howto-actors.md >}})。
