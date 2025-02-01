---
type: docs
title: "Dapr Python SDK 与 FastAPI 集成指南"
linkTitle: "FastAPI"
weight: 200000
description: 如何使用 FastAPI 扩展创建 Dapr Python actor 和发布订阅功能
---

Dapr Python SDK 通过 `dapr-ext-fastapi` 扩展实现与 FastAPI 的集成。

## 安装

您可以通过以下命令下载并安装 Dapr FastAPI 扩展：

{{< tabs 稳定版 开发版 >}}

{{% codetab %}}
```bash
pip install dapr-ext-fastapi
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
开发版包含与 Dapr 运行时预发布版本兼容的功能。在安装 `dapr-dev` 包之前，请先卸载任何稳定版本的 Python SDK 扩展。
{{% /alert %}}

```bash
pip install dapr-ext-fastapi-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

### 订阅不同类型的事件

```python
import uvicorn
from fastapi import Body, FastAPI
from dapr.ext.fastapi import DaprApp
from pydantic import BaseModel

class RawEventModel(BaseModel):
    body: str

class User(BaseModel):
    id: int
    name = 'Jane Doe'

class CloudEventModel(BaseModel):
    data: User
    datacontenttype: str
    id: str
    pubsubname: str
    source: str
    specversion: str
    topic: str
    traceid: str
    traceparent: str
    tracestate: str
    type: str    
    
app = FastAPI()
dapr_app = DaprApp(app)

# 处理任意结构的事件（简单但不够可靠）
# dapr publish --publish-app-id sample --topic any_topic --pubsub pubsub --data '{"id":"7", "desc": "good", "size":"small"}'
@dapr_app.subscribe(pubsub='pubsub', topic='any_topic')
def any_event_handler(event_data = Body()):
    print(event_data)    

# 为了更稳健，根据发布者是否使用 CloudEvents 选择以下之一

# 处理使用 CloudEvents 发送的事件
# dapr publish --publish-app-id sample --topic cloud_topic --pubsub pubsub --data '{"id":"7", "name":"Bob Jones"}'
@dapr_app.subscribe(pubsub='pubsub', topic='cloud_topic')
def cloud_event_handler(event_data: CloudEventModel):
    print(event_data)   

# 处理未使用 CloudEvents 发送的原始事件
# curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/raw_topic?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"body": "345"}'
@dapr_app.subscribe(pubsub='pubsub', topic='raw_topic')
def raw_event_handler(event_data: RawEventModel):
    print(event_data)    

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=30212)
```

### 创建一个 actor

```python
from fastapi import FastAPI
from dapr.ext.fastapi import DaprActor
from demo_actor import DemoActor

app = FastAPI(title=f'{DemoActor.__name__}服务')

# 添加 Dapr actor 扩展
actor = DaprActor(app)

@app.on_event("startup")
async def startup_event():
    # 注册 DemoActor
    await actor.register_actor(DemoActor)

@app.get("/GetMyData")
def get_my_data():
    return "{'message': 'myData'}"
