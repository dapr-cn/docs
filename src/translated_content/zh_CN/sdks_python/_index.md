---
type: docs
title: Dapr Python SDK
linkTitle: Python
weight: 1000
description: 开发 Dapr 应用程序的 Python SDK 包
no_list: true
cascade:
  github_repo: https://github.com/dapr/python-sdk
  github_subdir: daprdocs/content/en/python-sdk-docs
  path_base_for_github_subdir: content/en/developing-applications/sdks/python/
  github_branch: master
---

Dapr 提供了各种子包来帮助开发 Python 应用程序。 使用它们，您可以使用 Dapr 创建 Python 客户端、服务器和虚拟 Actor。

## 前期准备

- 已安装[Dapr CLI]({{< ref install-dapr-cli.md >}})
- 初始化[Dapr环境]({{< ref install-dapr-selfhost.md >}})
- [已安装Python 3.8+](https://www.python.org/downloads/)。

## 安装

要开始使用 Python SDK，请安装主 Dapr Python SDK 包。



{{% codetab %}}

<!--stable-->

```bash
pip install dapr
```



{{% codetab %}}

<!--dev-->

> **注意：** 开发包将包含与预发布版本的 Dapr 运行时兼容的功能和行为。 在安装 dapr-dev 包之前，请务必卸载以前任意稳定版本的 Python SDK。

```bash
pip install dapr-dev
```



{{< /tabs >}}

## 可用子软件包

### SDK 导入

Python SDK 导入是主 SDK 安装中包含的子包，但在使用时需要导入。 Dapr Python SDK 提供的最常见的导入项包括：

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>客户端</b></h5>
      <p class="card-text">编写Python应用程序与Dapr sidecar和其他Dapr应用程序进行交互，包括在Python中使用有状态的 virtual actors</p>
      
      
      <a href="{{< ref python-client ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Actors</b></h5>
      <p class="card-text">创建并与Dapr的Actor框架交互。</p>
      
      
      <a href="{{< ref python-actor ></a>
    </div>
  </div>
</div>

了解有关[可用的Dapr Python SDK导入](https://github.com/dapr/python-sdk/tree/master/dapr)的更多信息。

### SDK 扩展

SDK扩展主要作为接收发布/订阅事件的实用工具，以编程方式创建发布/订阅订阅，并处理输入绑定事件。 虽然您可以在没有扩展的情况下完成所有这些任务，但使用Python SDK扩展会更方便。

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>gRPC</b></h5>
      <p class="card-text">使用 gRPC 服务器扩展创建 Dapr 服务。</p>
      
      
      <a href="{{< ref python-grpc ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>FastAPI</b></h5>
      <p class="card-text">使用Dapr FastAPI扩展与Dapr Python虚拟actor和发布/订阅进行集成。</p>
      
      
      <a href="{{< ref python-fastapi ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>Flask</b></h5>
      <p class="card-text">使用Dapr Flask扩展与Dapr Python virtual actors 集成。</p>
      
      
      <a href="{{< ref python-sdk-extensions ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>工作流程</b></h5>
      <p class="card-text">使用Python编写与其他Dapr API配合工作的工作流。</p>
      
      
      <a href="{{< ref python-workflow ></a>
    </div>
  </div>
</div>

了解更多关于[Dapr Python SDK扩展](https://github.com/dapr/python-sdk/tree/master/ext)的信息。

## 试试吧

克隆 Python SDK 存储库。

```bash
git clone https://github.com/dapr/python-sdk.git
```

演练 Python 快速入门、教程和示例，了解 Dapr 的实际应用：

| SDK 示例                                                                                                 | 说明                                                             |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| [快速入门]({{< ref quickstarts >}}) | 使用 Python SDK 在短短几分钟内体验 Dapr 的 API 构建块。                        |
| [SDK示例](https://github.com/dapr/python-sdk/tree/master/examples)                                       | 克隆 SDK 存储库以尝试一些示例并开始使用。                                        |
| [绑定教程](https://github.com/dapr/quickstarts/tree/master/tutorials/bindings)                             | 了解 Dapr Python SDK 如何与其他 Dapr SDK 协同工作，以启用绑定。                  |
| [分布式计算器教程](https://github.com/dapr/quickstarts/tree/master/tutorials/distributed-calculator/python)    | 使用 Dapr Python SDK 处理方法调用和状态持久化功能。                             |
| [Hello world 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-world)                | 了解如何使用 Python SDK 在计算机上本地启动和运行 Dapr。                           |
| [Hello Kubernetes 教程](https://github.com/dapr/quickstarts/tree/master/tutorials/hello-kubernetes)      | 在 Kubernetes 集群中启动并运行 Dapr Python SDK。                         |
| [可观测性教程](https://github.com/dapr/quickstarts/tree/master/tutorials/observability)                      | 使用 Python SDK 探索 Dapr 的指标收集、跟踪、日志记录和运行状况检查功能。                  |
| [发布/订阅教程](https://github.com/dapr/quickstarts/tree/master/tutorials/pub-sub)                           | 了解 Dapr Python SDK 如何与其他 Dapr SDK 协同工作，以启用 Pub/sub（发布/订阅）应用程序。 |

## 更多的信息

<div class="card-deck">
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>序列化</b></h5>
      <p class="card-text">了解Dapr SDK中的序列化更多信息。</p>
      
      
      <a href="{{< ref sdk-serialization ></a>
    </div>
  </div>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"><b>PyPI</b></h5>
      <p class="card-text">Python 软件包索引（PyPI）</p>
      
      
      <a href="https://pypi.org/user/dapr.io/" class="stretched-link"></a>
    </div>
  </div>
</div>
