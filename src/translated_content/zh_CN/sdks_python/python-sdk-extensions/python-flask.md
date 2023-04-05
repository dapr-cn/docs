---
type: docs
title: "Dapr Python SDK 与 Flask 集成"
linkTitle: "Flask"
weight: 300000
description: 如何创建基于 Python FastAPI 的 Dapr 虚拟 actor
---

Dapr Python SDK 使用 `flask-dapr` 模块提供与Flask 的集成

## 安装

你可以通过下面的方式下载和安装 Dapr Flask 扩展模块：

{{< tabs Stable Development>}}

{{% codetab %}}
```bash
pip install flask-dapr
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
开发包将包含与 Dapr 运行时的预发布版本兼容的功能和行为。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 Python SDK 扩展包。
{{% /alert %}}

```bash
pip install flask-dapr-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 示例

```python
from flask import Flask
from flask_dapr.actor import DaprActor

from dapr.conf import settings
from demo_actor import DemoActor

app = Flask(f'{DemoActor.__name__}Service')

# Enable DaprActor Flask extension
actor = DaprActor(app)

# Register DemoActor
actor.register_actor(DemoActor)

# Setup method route
@app.route('/GetMyData', methods=['GET'])
def get_my_data():
    return {'message': 'myData'}, 200

# Run application
if __name__ == '__main__':
    app.run(port=settings.HTTP_APP_PORT)
```