---
type: docs
title: "JavaScript SDK for Actors"
linkTitle: "Actors"
weight: 3000
description: 如何使用 Dapr JavaScript SDK 快速上手 actor
---

Dapr actors 包允许您通过 JavaScript 应用程序与 Dapr 虚拟 actor 交互。以下示例展示了如何使用 JavaScript SDK 与虚拟 actor 进行交互。

有关 Dapr actor 的详细介绍，请访问 [actor 概述页面]({{< ref actors-overview >}})。

## 前置条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- [最新的 LTS 版本的 Node 或更高版本](https://nodejs.org/en/)
- [已安装 JavaScript NPM 包](https://www.npmjs.com/package/@dapr/dapr)

## 场景

以下代码示例大致描述了一个停车场车位监控系统的场景，可以在 Mark Russinovich 的这个[视频](https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785)中看到。

一个停车场由数百个停车位组成，每个停车位都配有一个传感器，该传感器向集中监控系统提供更新。停车位传感器（即我们的 actor）用于检测停车位是否被占用或可用。

要运行此示例，请克隆源代码，源代码位于 [JavaScript SDK 示例目录](https://github.com/dapr/js-sdk/tree/main/examples/http/actor-parking-sensor)中。

## Actor 接口

actor 接口定义了 actor 实现和调用 actor 的客户端之间共享的契约。在下面的示例中，我们为停车场传感器创建了一个接口。每个传感器都有两个方法：`carEnter` 和 `carLeave`，它们定义了停车位的状态：

```ts
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor 实现

actor 实现通过扩展基类型 `AbstractActor` 并实现 actor 接口（在此示例中为 `ParkingSensorInterface`）来定义一个类。

以下代码描述了一个 actor 实现以及一些辅助方法。

```ts
import { AbstractActor } from "@dapr/dapr";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // 实现更新停车位被占用的状态。
  }

  async carLeave(): Promise<void> {
    // 实现更新停车位可用的状态。
  }

  private async getInfo(): Promise<object> {
    // 实现从停车位传感器请求更新。
  }

  /**
   * @override
   */
  async onActivate(): Promise<void> {
    // 由 AbstractActor 调用的初始化逻辑。
  }
}
```

### 配置 Actor 运行时

要配置 actor 运行时，请使用 `DaprClientOptions`。各种参数及其默认值记录在 [如何：在 Dapr 中使用虚拟 actor](https://docs.dapr.io/developing-applications/building-blocks/actors/howto-actors/#configuration-parameters)中。

注意，超时和间隔应格式化为 [time.ParseDuration](https://pkg.go.dev/time#ParseDuration) 字符串，这是一种用于表示时间段的格式。

```typescript
import { CommunicationProtocolEnum, DaprClient, DaprServer } from "@dapr/dapr";

// 使用 DaprClientOptions 配置 actor 运行时。
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

// 在创建 DaprServer 和 DaprClient 时使用这些选项。

// 注意，DaprServer 内部创建了一个 DaprClient，需要使用 clientOptions 进行配置。
const server = new DaprServer({ serverHost, serverPort, clientOptions });

const client = new DaprClient(clientOptions);
```

## 注册 Actor

使用 `DaprServer` 包初始化并注册您的 actor：

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

await server.actor.init(); // 让服务器知道我们需要 actor
server.actor.registerActor(ParkingSensorImpl); // 注册 actor
await server.start(); // 启动服务器

// 要获取已注册的 actor，可以调用 `getRegisteredActors`：
const resRegisteredActors = await server.actor.getRegisteredActors();
console.log(`Registered Actors: ${JSON.stringify(resRegisteredActors)}`);
```

## 调用 Actor 方法

在注册 actor 之后，使用 `ActorProxyBuilder` 创建一个实现 `ParkingSensorInterface` 的代理对象。您可以通过直接调用代理对象上的方法来调用 actor 方法。在内部，它会转换为对 actor API 的网络调用并获取结果。

```typescript
import { ActorId, DaprClient } from "@dapr/dapr";
import ParkingSensorImpl from "./ParkingSensorImpl";
import ParkingSensorInterface from "./ParkingSensorInterface";

const daprHost = "127.0.0.1";
const daprPort = "50000";

const client = new DaprClient({ daprHost, daprPort });

// 创建一个新的 actor 构建器。它可以用于创建多种类型的 actor。
const builder = new ActorProxyBuilder<ParkingSensorInterface>(ParkingSensorImpl, client);

// 创建一个新的 actor 实例。
const actor = builder.build(new ActorId("my-actor"));
// 或者，使用随机 ID
// const actor = builder.build(ActorId.createRandomId());

// 调用方法。
await actor.carEnter();
```

## 使用 actor 的状态

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

  // 使用特定类型获取状态
  async getState<T>(key: string): Promise<T | null> {
    return await this.getStateManager<T>().getState(key);
  }

  // 不指定类型获取状态为 `any`
  async getState(key: string): Promise<any> {
    return await this.getStateManager().getState(key);
  }
}
```

## Actor 定时器和提醒

JS SDK 支持 actor 通过注册定时器或提醒来在自身上安排周期性工作。定时器和提醒之间的主要区别在于，Dapr actor 运行时在停用后不保留有关定时器的任何信息，但使用 Dapr actor 状态提供程序持久化提醒信息。

这种区别允许用户在轻量级但无状态的定时器与更耗资源但有状态的提醒之间进行权衡。

定时器和提醒的调度接口是相同的。有关调度配置的更深入了解，请参阅 [actor 定时器和提醒文档]({{< ref "howto-actors.md#actor-timers-and-reminders" >}})。

### Actor 定时器

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// 注册一个定时器
await actor.registerActorTimer(
  "timer-id", // 定时器的唯一名称。
  "cb-method", // 定时器触发时要执行的回调方法。
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  50, // 要发送到定时器回调的状态。
);

// 删除定时器
await actor.unregisterActorTimer("timer-id");
```

### Actor 提醒

```typescript
// ...

const actor = builder.build(new ActorId("my-actor"));

// 注册一个提醒，它有一个默认回调：`receiveReminder`
await actor.registerActorReminder(
  "reminder-id", // 提醒的唯一名称。
  Temporal.Duration.from({ seconds: 2 }), // DueTime
  Temporal.Duration.from({ seconds: 1 }), // Period
  Temporal.Duration.from({ seconds: 1 }), // TTL
  100, // 要发送到提醒回调的状态。
);

// 删除提醒
await actor.unregisterActorReminder("reminder-id");
```

要处理回调，您需要在 actor 中重写默认的 `receiveReminder` 实现。例如，从我们原来的 actor 实现中：

```ts
export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  // ...

  /**
   * @override
   */
  async receiveReminder(state: any): Promise<void> {
    // 在这里处理
  }

  // ...
}
```

有关 actor 的完整指南，请访问 [如何：在 Dapr 中使用虚拟 actor]({{< ref howto-actors.md >}})。