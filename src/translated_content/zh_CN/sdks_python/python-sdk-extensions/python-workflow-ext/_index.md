---
type: docs
title: "Dapr Python SDK 与 Dapr Workflow 扩展集成"
linkTitle: "Dapr Workflow"
weight: 400000
description: 如何使用 Dapr Workflow 扩展快速上手
no_list: true
---

{{% alert title="注意" color="primary" %}}
Dapr Workflow 目前处于初始测试阶段（alpha）。
{{% /alert %}}

Dapr Python SDK 内置了一个 Dapr Workflow 扩展，`dapr.ext.workflow`，用于创建 Dapr 服务。

## 安装

您可以通过以下命令下载并安装 Dapr Workflow 扩展：

{{< tabs 稳定版 开发版>}}

{{% codetab %}}
```bash
pip install dapr-ext-workflow
```
{{% /codetab %}}

{{% codetab %}}
{{% alert title="注意" color="warning" %}}
开发包包含与 Dapr 运行时预发布版本兼容的功能和行为。在安装 `dapr-dev` 包之前，请确保卸载任何已安装的稳定版 Python SDK 扩展。
{{% /alert %}}

```bash
pip3 install dapr-ext-workflow-dev
```
{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="开始使用 Dapr Workflow Python SDK" page="python-workflow.md" >}}