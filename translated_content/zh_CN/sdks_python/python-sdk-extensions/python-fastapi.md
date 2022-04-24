---
type: docs
title: "Dapr Python SDK 与 FastAPI 集成"
linkTitle: "FastAPI"
weight: 200000
description: 如何创建基于 FastAPI 扩展的Dapr Python virtual actors
---

Dapr Python SDK 使用 `dapr-ext-fastapi` 模块与 FastAPI 集成

## 安装

您可以通过下面的方式下载和安装 Dapr FastAPI 扩展模块：

{{< tabs Stable Development>}}

{{% codetab %}}
```bash
pip install dapr-ext-fastapi
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
开发包包含的功能和行为将兼容此前发行的 Dapr 运行时。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 dapr-ext-fastapi 的 Python SDK 扩展包。
{{% /alert %}}

```bash
pip install dapr-ext-fastapi-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

### 订阅事件

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprApp


app = FastAPI()
dapr_app = DaprApp(app)


@dapr_app.subscribe(pubsub='pubsub', topic='some_topic')
def event_handler(event_data):
    print(event_data)
```

### 创建 Actor

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprActor
from demo_actor import DemoActor

app = FastAPI(title=f'{DemoActor.__name__}Service')

# Add Dapr Actor Extension
actor = DaprActor(app)

@app.on_event("startup")
async def startup_event():
    # Register DemoActor
    await actor.register_actor(DemoActor)

@app.get("/GetMyData")
def get_my_data():
    return "{'message': 'myData'}"
```