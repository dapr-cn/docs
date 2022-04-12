---
type: docs
title: "开始使用 Dapr actor Python SDK"
linkTitle: "Actor"
weight: 20000
description: 如何使用 Dapr Python SDK 启动和运行
---

Dapr actor 包允许您从 Python 应用程序中与 Dapr virtual actor 进行交互。

## 先决条件

- 安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 安装 [Python 3.7+](https://www.python.org/downloads/)
- 安装 [Dapr Python 模块]({{< ref "python#install-the0dapr-module" >}})

## Actor 接口

该接口定义了 actor 契约，该契约在 actor 实现和调用 actor 的客户端之间共享。 因为客户端可能依赖于它，所以通常在一个与 actor 实现分开的程序集中定义它是有意义的。

```python
from dapr.actor import ActorInterface, actormethod

class DemoActorInterface(ActorInterface):
    @actormethod(name="GetMyData")
    async def get_my_data(self) -> object:
        ...
```

## Actor 服务

Actor 服务承载着 virtual actor。 它实现了一个派生自基类型 `Actor` 的类，并实现了 actor 接口中定义的接口。

Actor 可以使用 Dapr actor 扩展来创建：
   - [FastAPI actor extension]({{< ref python-fastapi.md >}})
   - [Flask actor extension]({{< ref python-flask.md >}})

## Actor 客户端

Actor 客户端包含 actor 客户端的实现，它调用 actor 接口中定义的 actor 方法。

```python
import asyncio

from dapr.actor import ActorProxy, ActorId
from demo_actor_interface import DemoActorInterface

async def main():
    # Create proxy client
    proxy = ActorProxy.create('DemoActor', ActorId('1'), DemoActorInterface)

    # Call method on client
    resp = await proxy.GetMyData()
```

## 样本

请访问[本页](https://github.com/dapr/python-sdk/tree/release-1.0/examples/demo_actor)以获得可运行的 actor 样本。