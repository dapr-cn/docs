---
type: docs
title: "Dapr Python SDK"
linkTitle: "Python"
weight: 1000
description: 开发 Dapr 应用程序的 Python SDK 包
no_list: true
---

Dapr提供了帮助开发Python应用程序各种包。 你可以使用他们来创建 Python 客户端、服务器和 virtual actors。

## 可用软件包

- [**Dapr Client**]({{< ref python-client.md >}}) 用于编写 Python 应用程序以与 Dapr sidecar 和其他 Dapr 应用程序交互
- [**Dapr actor**]({{< ref python-actor.md >}}) 用于使用 Python 创建并和有状态的virtual actors 交互。
- [**扩展**]({{< ref python-sdk-extensions >}}) 用于将 Dapr 功能添加到其他 Python 框架
    - [**gRPC Extensions**]({{< ref python-grpc.md >}}) 用于使用 Dapr 创建 gRPC 服务器
    - [**FastAPI Extensions**]({{< ref python-fastapi.md >}}) 用于将 Dapr Actor 功能添加到 FastAPI 应用程序
    - [**Flask 扩展**]({{< ref python-flask.md >}}) 用于将 Dapr actor 功能添加到 Flask 应用程序

## 安装 Dapr 模块

{{< tabs Stable Development>}}

{{% codetab %}}
```bash
pip install dapr
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
开发包包含的功能和行为将兼容此前发行的 Dapr 运行时。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 Python SDK 扩展包。
{{% /alert %}}

```bash
pip install dapr-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 试试吧

克隆Python SDK 仓库来尝试一些 [示例](https://github.com/dapr/python-sdk/tree/master/examples)。

```bash
git clone https://github.com/dapr/python-sdk.git
```

## 详情

- [Python 软件包索引 (PyPI)](https://pypi.org/user/dapr.io/)
- [Dapr SDK 序列化]({{< ref sdk-serialization.md >}})