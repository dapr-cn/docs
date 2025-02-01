---
type: docs
title: "Dapr Python SDK 与 Flask 集成"
linkTitle: "Flask"
weight: 300000
description: 如何使用 Flask 扩展创建 Dapr Python 虚拟 actor
---

Dapr Python SDK 使用 `flask-dapr` 扩展来实现与 Flask 的集成。

## 安装

您可以通过以下命令下载并安装 Dapr Flask 扩展：

{{< tabs 稳定版 开发版>}}

{{% codetab %}}
```bash
pip install flask-dapr
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
开发版包含与 Dapr 运行时预发布版本兼容的功能和行为。在安装 `dapr-dev` 包之前，请确保卸载任何已安装的稳定版 Python SDK 扩展。
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

# 启用 DaprActor Flask 扩展
actor = DaprActor(app)

# 注册 DemoActor
actor.register_actor(DemoActor)

# 设置方法路由
@app.route('/GetMyData', methods=['GET'])
def get_my_data():
    return {'message': 'myData'}, 200

# 运行应用程序
if __name__ == '__main__':
    app.run(port=settings.HTTP_APP_PORT)
