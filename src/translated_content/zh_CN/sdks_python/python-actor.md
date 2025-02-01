---
type: docs
title: "使用 Dapr actor Python SDK 入门"
linkTitle: "actor"
weight: 20000
description: 如何使用 Dapr Python SDK 快速上手
---

Dapr actor 包使您能够从 Python 应用程序与 Dapr 虚拟 actor 交互。

## 先决条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [Python 3.8+](https://www.python.org/downloads/)
- 已安装 [Dapr Python 包]({{< ref "python#installation" >}})

## actor 接口

接口定义了 actor 实现和调用 actor 的客户端之间共享的协议。由于客户端可能依赖于此协议，通常将其定义在与 actor 实现分开的模块中是有意义的。

```python
from dapr.actor import ActorInterface, actormethod

class DemoActorInterface(ActorInterface):
    @actormethod(name="GetMyData")
    async def get_my_data(self) -> object:
        ...
```

## actor 服务

actor 服务负责托管虚拟 actor。它是一个从基类 `Actor` 派生并实现 actor 接口中定义的类。

可以使用以下 Dapr actor 扩展之一创建 actor：
   - [FastAPI actor 扩展]({{< ref python-fastapi.md >}})
   - [Flask actor 扩展]({{< ref python-flask.md >}})

## actor 客户端

actor 客户端用于实现调用 actor 接口中定义的方法。

```python
import asyncio

from dapr.actor import ActorProxy, ActorId
from demo_actor_interface import DemoActorInterface

async def main():
    # 创建代理客户端
    proxy = ActorProxy.create('DemoActor', ActorId('1'), DemoActorInterface)

    # 在客户端上调用方法
    resp = await proxy.GetMyData()
```

## 示例

访问[此页面](https://github.com/dapr/python-sdk/tree/release-1.0/examples/demo_actor)获取可运行的 actor 示例。
