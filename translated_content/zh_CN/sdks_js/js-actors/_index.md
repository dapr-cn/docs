---
type: docs
title: "JavaScript SDK for Actor"
linkTitle: "Actor"
weight: 1000
description: 如何使用 Dapr JavaScript SDK 启动和运行 Actor
---

通过 Dapr Actor 包，您可以与 JavaScript 应用程序中的 Dapr 虚拟 Actor 进行交互。 下面的示例讲演示如何使用 JavaScript SDK 与 Dapr 虚拟 Actor 进行交互。

有关 Dapr Actor 的更深入说明，请访问 [概述页面]({{< ref actors-overview >}})。

## 前提
- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- [Node.js 的最新 LTS 版本或更高版本](https://nodejs.org/en/)
- [已安装 JavaScript NPM 包](https://www.npmjs.com/package/dapr-client)

## 场景
下面的代码示例粗略地描述了停车库点监控系统的场景，可以在 Mark Russinovich 的这个 [video] 中看到（https://www.youtube.com/watch?v=eJCu6a-x9uo&t=3785）。

停车库由数百个停车位组成，每个停车位都包括一个传感器，该传感器为集中监控系统提供更新。 停车位传感器（我们的 Actor）检测一个泊车位是否被占用，或是否可用。

要想自己运行这个例子，请克隆源代码，它可以在 [JavaScript SDK 示例目录](https://github.com/dapr/js-sdk/tree/master/examples/http/actor-parking-sensor) 中找到。

## Actor 接口
Actor 接口定义了 Actor 契约，由 Actor 实现和调用 Actor 的客户端共享。 在下面的例子中，我们为一个停车场的传感器创建了一个接口。 每个传感器有 2 种方法： `carEnter` 和 `carLeave`，它定义了停车位的状态：

```javascript
export default interface ParkingSensorInterface {
  carEnter(): Promise<void>;
  carLeave(): Promise<void>;
}
```

## Actor 实现
Actor 实现通过扩展基本类型 `AbstractActor` 来定义一个类，并实现 Actor 接口。 下面的代码通过实现 `ParkingSensorInterface` 中定义的方法，描述了 Actor 的实现所包含的内容。 它还定义了一些额外的辅助方法：

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
使用 DaprServer 包初始化和注册您的 Actor：

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
注册 Actor 后，使用 DaprClient 在 Actor 上调用方法。 该客户端将调用在 Actor 接口文件中定义的方法。

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

## Actor Timer 和 Reminder
Actor 可以通过注册 Timer 或 Reminder 来安排自己的周期性任务。 Timer 与 Reminder 的主要的区别在于：Actor 运行时在停用后不保留任何有关 Timer 的信息，而会使用 Actor 状态组件来持久化有关 Reminder 的信息。

这种区别允许用户在轻量级但无状态的 Timer 和需要更多资源但有状态的 Reminder 之间进行权衡。

Timer 和 Reminder 的调度接口定义是完全相同的。 如需更深入地了解调度配置，请参阅 [Actor Timer 和 Reminder 文档]({{< ref "howto-actors.md#actor-timers-and-reminders" >}})。

### Actor Timer
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

### Actor Reminder
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

- 有关 Actor 的完整指南，请访问 [如何在 Dapr 中使用 Actor]({{< ref howto-actors.md >}})。