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

- [**Dapr client**]({{< ref python-client.md >}}) for writing Python applications to interact with the Dapr sidecar and other Dapr applications
- [**Dapr actor**]({{< ref python-actor.md >}}) for creating and interacting with stateful virtual actors in Python
- [**Extensions**]({{< ref python-sdk-extensions >}}) for adding Dapr capabilities to other Python frameworks
    - [**gRPC extension**]({{< ref python-grpc.md >}}) for creating a gRPC server with Dapr
    - [**FastAPI extension**]({{< ref python-fastapi.md >}}) for adding Dapr actor capabilities to FastAPI applications
    - [**Flask extension**]({{< ref python-flask.md >}}) for adding Dapr actor capabilities to Flask applications

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
