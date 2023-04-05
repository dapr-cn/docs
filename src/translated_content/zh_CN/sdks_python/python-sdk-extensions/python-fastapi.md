---
type: docs
title: "Dapr Python SDK 与 FastAPI 集成"
linkTitle: "FastAPI"
weight: 200000
description: How to create Dapr Python virtual actors and pubsub with the FastAPI extension
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
开发包将包含与 Dapr 运行时的预发布版本兼容的功能和行为。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 Python SDK 扩展包。
{{% /alert %}}

```bash
pip install dapr-ext-fastapi-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

### Subscribing to events of different types

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

# Allow handling event with any structure (Easiest, but least robust)
# dapr publish --publish-app-id sample --topic any_topic --pubsub pubsub --data '{"id":"7", "desc": "good", "size":"small"}'
@dapr_app.subscribe(pubsub='pubsub', topic='any_topic')
def any_event_handler(event_data = Body()):
    print(event_data)    

# For robustness choose one of the below based on if publisher is using CloudEvents

# Handle events sent with CloudEvents
# dapr publish --publish-app-id sample --topic cloud_topic --pubsub pubsub --data '{"id":"7", "name":"Bob Jones"}'
@dapr_app.subscribe(pubsub='pubsub', topic='cloud_topic')
def cloud_event_handler(event_data: CloudEventModel):
    print(event_data)   

# Handle raw events sent without CloudEvents
# curl -X "POST" http://localhost:3500/v1.0/publish/pubsub/raw_topic?metadata.rawPayload=true -H "Content-Type: application/json" -d '{"body": "345"}'
@dapr_app.subscribe(pubsub='pubsub', topic='raw_topic')
def raw_event_handler(event_data: RawEventModel):
    print(event_data)    



if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=30212)
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