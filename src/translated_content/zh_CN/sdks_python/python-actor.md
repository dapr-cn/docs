---
type: docs
title: 开始使用 Dapr actor Python SDK
linkTitle: Actor
weight: 20000
description: 如何使用 Dapr Python SDK 启动和运行
---

Dapr actor 包允许您从 Python 应用程序中与 Dapr virtual actor 进行交互。

## 先决条件

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [已安装Python 3.8+](https://www.python.org/downloads/)。
- 安装了[Dapr Python包]({{< ref "python#installation" >}})

## Actor 接口

Actor 接口定义了 Actor 契约，由 Actor 实现和调用 Actor 的客户端共享。 因为客户端可能依赖于它，所以通常在一个与 Actor 实现分开的程序集中定义它是有意义的。

```python
from dapr.actor import ActorInterface, actormethod

class DemoActorInterface(ActorInterface):
    @actormethod(name="GetMyData")
    async def get_my_data(self) -> object:
        ...
```

## Actor 服务

Actor 服务承载着虚拟 Actor。 它是一个从基类型 `Actor` 派生并实现了actor接口中定义的接口的类。

可以使用以下 Dapr Actor 扩展之一创建 Actor：

- [FastAPI actor扩展]({{< ref python-fastapi.md >}})
- [Flask actor extension]({{< ref python-flask.md >}})

## Actor 客户端

Actor 客户端包含调用 Actor 接口中定义的 Actor 方法的 Actor 客户端实现。

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

## 示例

访问[此页面](https://github.com/dapr/python-sdk/tree/release-1.0/examples/demo_actor)查看可运行的演员示例。
