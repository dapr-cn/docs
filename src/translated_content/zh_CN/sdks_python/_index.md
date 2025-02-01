---
type: docs
title: "Dapr Python SDK"
linkTitle: "Python"
weight: 1000
description: 用于开发Dapr应用的Python SDK包
no_list: true
cascade:
  github_repo: https://github.com/dapr/python-sdk
  github_subdir: daprdocs/content/en/python-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/python/
  github_branch: master
---

Dapr 提供了多种子包以帮助开发 Python 应用程序。通过这些子包，您可以使用 Dapr 创建 Python 客户端、服务器和虚拟 actor。

## 先决条件

- 已安装 [Dapr CLI]({{< ref install-dapr-cli.md >}})
- 已初始化 [Dapr 环境]({{< ref install-dapr-selfhost.md >}})
- 已安装 [Python 3.8+](https://www.python.org/downloads/)

## 安装

要开始使用 Python SDK，请安装主要的 Dapr Python SDK 包。

{{< tabs Stable Development>}}

{{% codetab %}}
<!--stable-->
```bash
pip install dapr
```
{{% /codetab %}}

{{% codetab %}}
<!--dev-->
> **注意：** 开发包包含与 Dapr 运行时预发布版本兼容的功能和行为。在安装 dapr-dev 包之前，请确保卸载任何稳定版本的 Python SDK。

```bash
pip install dapr-dev
```

{{% /codetab %}}

{{< /tabs >}}

## 可用子包

### SDK 导入

Python SDK 导入是随主 SDK 安装一起包含的子包，但在使用时需要导入。Dapr Python SDK 提供的常用导入包括：

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Client</b></h5>
      <p class="card-text">编写 Python 应用以与 Dapr sidecar 和其他 Dapr 应用交互，包括 Python 中的有状态虚拟 actor。</p>
      <a href="{{< ref python-client >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">创建和与 Dapr 的 actor 框架交互。</p>
      <a href="{{< ref python-actor >}}" class="stretched-link"></a>
    </div>
  </div>
</div>

了解 [所有可用的 Dapr Python SDK 导入](https://github.com/dapr/python-sdk/tree/master/dapr) 的更多信息。

### SDK 扩展

SDK 扩展主要用于接收 pub/sub 事件、程序化创建 pub/sub 订阅和处理输入绑定事件。虽然这些任务可以在没有扩展的情况下完成，但使用 Python SDK 扩展会更加方便。

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>gRPC</b></h5>
      <p class="card-text">使用 gRPC 服务器扩展创建 Dapr 服务。</p>
      <a href="{{< ref python-grpc >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>FastAPI</b></h5>
      <p class="card-text">使用 Dapr FastAPI 扩展与 Dapr Python 虚拟 actor 和 pub/sub 集成。</p>
      <a href="{{< ref python-fastapi >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Flask</b></h5>
      <p class="card-text">使用 Dapr Flask 扩展与 Dapr Python 虚拟 actor 集成。</p>
      <a href="{{< ref python-sdk-extensions >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Workflow</b></h5>
      <p class="card-text">编写与其他 Dapr API 一起工作的 Python 工作流。</p>
      <a href="{{< ref python-workflow >}}" class="stretched-link"></a>
    </div>
  </div>
</div>

了解 [Dapr Python SDK 扩展](https://github.com/dapr/python-sdk/tree/master/ext) 的更多信息。

## 试用

克隆 Python SDK 仓库。

```bash
git clone https://github.com/dapr/python-sdk.git
```

通过 Python 快速入门、教程和示例来体验 Dapr 的实际应用：

| SDK 示例 | 描述 |
| ----------- | ----------- |
| [快速入门]({{< ref quickstarts >}}) | 使用 Python SDK 在几分钟内体验 Dapr 的 API 构建块。 |
| [SDK 示例](https://github.com/dapr/python-sdk/tree/master/examples) | 克隆 SDK 仓库以尝试一些示例并开始。 |
| [绑定教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings) | 查看 Dapr Python SDK 如何与其他 Dapr SDK 一起工作以启用绑定。 |
| [分布式计算器教程](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator/python) | 使用 Dapr Python SDK 处理方法调用和状态持久化功能。 |
| [Hello World 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world) | 学习如何在本地机器上使用 Python SDK 启动并运行 Dapr。 |
| [Hello Kubernetes 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes) | 在 Kubernetes 集群中使用 Dapr Python SDK 启动并运行。 |
| [可观测性教程](https://github.com/dapr/quickstarts/tree/master/tutorials/observability) | 使用 Python SDK 探索 Dapr 的指标收集、跟踪、日志记录和健康检查功能。 |
| [Pub/sub 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub) | 查看 Dapr Python SDK 如何与其他 Dapr SDK 一起工作以启用 pub/sub 应用。 |

## 更多信息

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Serialization</b></h5>
      <p class="card-text">了解有关 Dapr SDK 中的序列化的更多信息。</p>
      <a href="{{< ref sdk-serialization >}}" class="stretched-link"></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>PyPI</b></h5>
      <p class="card-text">Python 包索引</p>
      <a href="https://pypi.org/user/dapr.io/" class="stretched-link"></a>
    </div>
  </div>
</div>