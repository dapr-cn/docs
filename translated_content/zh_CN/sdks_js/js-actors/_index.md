---
type: docs
title: "JavaScript SDK for Actor"
linkTitle: "Actors"
weight: 1000
description: 如何使用 Dapr JavaScript SDK 启动和运行 Actor
---

通过 Dapr actor 包，您可以与 JavaScript 应用程序中的 Dapr virtual actor 进行交互。 下面的示例演示如何使用 JavaScript SDK 与 Dapr virtual actor 进行交互。

有关Dapr Actor 的更深入概述，请访问 [概述页面]({{< ref actors-overview >}})。

## 前提
- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [NodeJS的最新LTS版本或更高版本](https://nodejs.org/en/)
- [已安装 JavaScript NPM 包](https://www.npmjs.com/package/dapr-client)

## 场景
下面的代码示例松散地描述了停车库点监控系统的场景，这可以在以下视频中看到 Mark Russinovich(https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785)

停车库由数百个停车位组成，每个停车位都包括一个传感器，该传感器为集中监控系统提供更新。 停车位传感器 ( 我们的 Actors) 检测停车位是否被占用或可用。

要跳入并自行运行此示例，请克隆源代码，该源代码可在 [JavaScript SDK 示例目录中找到](https://github.com/dapr/js-sdk/tree/master/examples/http/actor-parking-sensor)。

## Actor 接口
该接口定义了 actor 契约，该契约在 actor 实现和调用 actor 的客户端之间共享。 在下面的示例中，我们为停车场传感器创建了交互 每个传感器有2种方法： `carEnter` 和 `carLeave`，它定义了停车位的状态：

```javascript
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor 实现
执行组件实现通过扩展基类型 ` AbstractActor ` 来定义类，并实现执行组件接口。 下面的代码通过实现 ` ParkingSensorInterface `中定义的方法，描述了执行组件的实现所包含的内容。 它还定义了一些额外的帮助器方法：

```javascript
import { AbstractActor } from "dapr-client";
import ParkingSensorInterface from "./ParkingSensorInterface";

export default class ParkingSensorImpl extends AbstractActor implements ParkingSensorInterface {
  async carEnter(): Promise<void> {
    // Implementation that updates state that this parking spaces is occupied.
  }

  async carLeave(): Promise<void> {
    // Implementation that updates state that this parking spaces is available.
  }

  async getParkingSpaceUpdate(): Promise<object> {
    // Implementation of requesting an update from the parking space sensor.
  }

  async onActivate(): Promise<void> {
    // Initialization logic called by AbstractActor.
  }
}
```

## 注册 Actor
使用 DaprServer 软件包初始化并注册您的 actors ：

```javascript
import { DaprServer } from "dapr-server";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer(`server-host`, `server-port`, `dapr-host`, `dapr-port`);

  await server.actor.init(); // Let the server know we need actors
  server.actor.registerActor(ParkingSensorImpl); // Register the actor
  await server.start(); // Start the server
}
```

## 调用 Actor
注册Actor后，使用DaprClient在Actor上调用方法。 该客户端将调用在 actor 接口文件中定义的方法。

```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer(`server-host`, `server-port`, `dapr-host`, `dapr-port`);
  const client = new DaprClient(`dapr-host`, `dapr-port`);

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.start();


  await client.actor.invoke("PUT", ParkingSensorImpl.name, `actor-id`, "carEnter"); // Invoke the ParkingSensor Actor by calling the carEnter function
}
```

## 保存和获取状态

```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() {
  const server = new DaprServer(`server-host`, `server-port`, `dapr-host`, `dapr-port`);
  const client = new DaprClient(`dapr-host`, `dapr-port`);

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.start();

  // Perform state transaction
  await client.actor.stateTransaction("ParkingSensorImpl", `actor-id`, [
    {
      operation: "upsert",
      request: {
        key: "parking-sensor-location-lat",
        value: "location-x"
      }
    },
    {
      operation: "upsert",
      request: {
        key: "parking-sensor-location-lang",
        value: "location-y"
      }
    }
  ]);

  // GET state from an actor
  await client.actor.stateGet("ParkingSensorImpl", `actor-id`, `parking-sensor-location-lat`)
  await client.actor.stateGet("ParkingSensorImpl", `actor-id`, `parking-sensor-location-lang`)
}
...
```

## Actor timer 和 reminder
Actor 可以通过注册 timer 或 reminder 来安排自己的定期工作。 Timers 与 reminders 主要的区别在于，Dapr actor 运行时在停用后不保留任何有关 timer 的信息，而使用 Dapr actor 状态提供程序持久化有关 reminder 的信息。

这种区别允许用户在轻量级但无状态的timer和需要更多资源但有状态的reminder之间进行权衡。

Timers 和 reminders 的调度接口定义是完全相同的。 有关调度配置的更深入了解，请参阅 [actors timers 和 reminders 的文档]({{< ref "howto-actors.md#actor-timers-and-reminders" >}})。

### Actor 计时器
```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() 
  const server = new DaprServer(`server-host`, `server-port`, `dapr-host`, `dapr-port`);
  const client = new DaprClient(`dapr-host`, `dapr-port`);

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.start();

  // Register a timer
  await client.actor.timerCreate(ParkingSensorImpl.name, `actor-id`, `timer-id`, {
    callback: "method-to-excute-on-actor",
    dueTime: Temporal.Duration.from({ seconds: 2 }),
    period: Temporal.Duration.from({ seconds: 1 })
  });

  // Delete the timer
  await client.actor.timerDelete(ParkingSensorImpl.name, `actor-id`, `timer-id`);
}
```

### Actor reminder
```javascript
import { DaprClient, DaprServer } from "dapr-client";
import ParkingSensorImpl from "./ParkingSensorImpl";

async function start() 
  const server = new DaprServer(`server-host`, `server-port`, `dapr-host`, `dapr-port`);
  const client = new DaprClient(`dapr-host`, `dapr-port`);

  await server.actor.init(); 
  server.actor.registerActor(ParkingSensorImpl); 
  await server.start();


  // Register a reminder, it has a default callback
  await client.actor.reminderCreate(DemoActorImpl.name, `actor-id`, `timer-id`, {
    dueTime: Temporal.Duration.from({ seconds: 2 }),
    period: Temporal.Duration.from({ seconds: 1 }),
    data: 100
  });

  // Delete the reminder
  await client.actor.reminderDelete(DemoActorImpl.name, `actor-id`, `timer-id`);
}
```

- 有关 Actor 的完整指南，请访问 [操作方法：在 Dapr 中使用 Actor ]({{< ref howto-actors.md >}})。