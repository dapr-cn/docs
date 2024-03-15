---
type: docs
title: Dapr Python SDK 与 Dapr Workflow 扩展的集成
linkTitle: Dapr 工作流
weight: 400000
description: 如何使用 Dapr Workflow 扩展启动和运行
no_list: true
---

{{% alert title="注意" color="primary" %}}
Dapr工作流目前处于alpha阶段。
{{% /alert %}}

Dapr Python SDK 提供了一个内置的 Dapr Workflow 扩展，`dapr.ext.workflow`，用于创建 Dapr 服务。

## 安装

您可以通过下面的方式下载和安装 Dapr Workflow 扩展：

{{< tabs Stable Development>}}

{{% codetab %}}

```bash
pip install dapr-ext-workflow
```

{{% /codetab %}}

{{% codetab %}}
{{% alert title="Note" color="warning" %}}
The development package will contain features and behavior that will be compatible with the pre-release version of the Dapr runtime. 在安装 `dapr-dev` 包之前，请务必卸载任何稳定版本的 Python SDK 扩展。
{{% /alert %}}

```bash
pip3 install dapr-ext-workflow-dev
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="使用 Dapr 工作流 Python SDK 入门" page="python-workflow.md" >}}
