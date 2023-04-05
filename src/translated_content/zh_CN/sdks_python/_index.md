---
type: docs
title: "Dapr Python SDK"
linkTitle: "Python"
weight: 1000
description: 开发 Dapr 应用程序的 Python SDK 包
no_list: true
---

Dapr offers a variety of packages to help with the development of Python applications. Using them you can create Python clients, servers, and virtual actors with Dapr.

## Available packages

- [**Dapr client**]({{< ref python-client.md >}}) 用于编写 Python 应用程序以与 Dapr sidecar 和其他 Dapr 应用程序交互
- [**Dapr actor**]({{< ref python-actor.md >}}) 用于在 Python 中创建有状态的虚拟 Actor 并与之交互
- [**扩展**]({{< ref python-sdk-extensions >}}) 用于将 Dapr 功能添加到其他 Python 框架
    - [**gRPC 扩展**]({{< ref python-grpc.md >}}) 用创建 Dapr gRPC 服务器
    - [**Flask 扩展**]({{< ref python-fastapi.md >}}) 用于将 Dapr actor 功能添加到 Flask 应用程序
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
开发包将包含与 Dapr 运行时的预发布版本兼容的功能和行为。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 Python SDK。
{{% /alert %}}

```bash
pip install dapr-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 试试吧

克隆 Python SDK 仓库来尝试一些 [示例](https://github.com/dapr/python-sdk/tree/master/examples)。

```bash
git clone https://github.com/dapr/python-sdk.git
```

## 详情

- [Python Package Index (PyPI)](https://pypi.org/user/dapr.io/)
- [Dapr SDK 序列化]({{< ref sdk-serialization.md >}})
