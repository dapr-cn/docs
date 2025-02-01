---
type: docs
title: "认证流程"
linkTitle: "认证流程"
weight: 200
description: "组件从提交到生产就绪的认证流程"
---

{{% alert title="注意" color="primary" %}}
认证流程仅适用于内置组件，不适用于[可插拔组件]({{<ref "components-concept.md#Built-in-and-pluggable-components" >}})。
{{% /alert %}}

## 概述

Dapr 采用模块化设计，功能以组件形式提供。每个组件都有一个接口定义，所有组件都是可互换的，因此理想情况下，您可以用具有相同接口的另一个组件替换一个组件。每个用于生产的组件都需要满足一定的技术要求，以确保功能兼容性和稳健性。

一般来说，一个组件需要：

- 符合定义的 Dapr 接口
- 功能正确且稳健
- 有良好的文档和维护

为了确保组件符合 Dapr 设定的标准，会在 Dapr 维护者管理的环境中对组件进行一系列测试。一旦测试持续通过，就可以确定组件的成熟度级别。

## 认证级别

级别如下：

- [Alpha](#alpha)
- [Beta](#beta)
- [Stable](#stable)

### Alpha

- 组件实现了所需的接口，并按规范描述工作
- 组件有文档
- 组件可能存在漏洞，或在集成时暴露出漏洞
- 组件可能无法通过所有一致性测试
- 组件可能没有一致性测试
- 由于后续版本中可能出现不兼容的更改，仅推荐用于非关键业务用途

所有组件都从 Alpha 阶段开始。

### Beta

- 组件必须通过所有定义的组件一致性测试以满足组件规范
- 组件一致性测试已在 Dapr 维护者管理的环境中运行
- 组件包含由 Dapr 维护者审核和批准的特定 components-contrib 版本的一致性测试结果记录
- 由于后续版本中可能出现不兼容的更改，仅推荐用于非关键业务用途

{{% alert title="注意" color="primary" %}}
如果满足以下条件，组件可以跳过 Beta 阶段和一致性测试要求，由维护者决定：
- 组件是一个绑定
- 认证测试是全面的
{{% /alert %}}

### Stable

- 组件必须有组件[认证测试](#certification-tests)以验证功能和弹性
- 组件由 Dapr 维护者维护并由社区支持
- 组件有良好的文档和测试
- 组件在之前至少一个 Dapr 运行时的小版本发布中以 Alpha 或 Beta 形式存在
- 维护者将根据 Dapr 支持政策解决组件安全性、核心功能和测试问题，并发布包含修补的稳定组件的补丁版本

{{% alert title="注意" color="primary" %}}
稳定的 Dapr 组件基于 Dapr 认证和一致性测试，并不保证由任何特定供应商支持，其中供应商的 SDK 作为组件的一部分使用。

Dapr 组件测试保证组件的稳定性，与第三方供应商为任何使用的 SDK 声明的稳定性状态无关。这是因为稳定的含义（例如 alpha、beta、stable）可能因供应商而异。
{{% /alert %}}

### 以前的正式发布 (GA) 组件

任何先前认证为 GA 的组件，即使不符合新要求，也允许进入 Stable。

## 一致性测试

[components-contrib](https://github.com/dapr/components-contrib) 仓库中的每个组件都需要遵循 Dapr 定义的一组接口。一致性测试是在这些组件定义及其相关支持服务上运行的测试，以确保组件符合 Dapr 接口规范和行为。

一致性测试为以下构建块定义：

- 状态存储
- secret 存储
- 绑定
- pubsub

要了解更多信息，请参阅[此处](https://github.com/dapr/components-contrib/blob/master/tests/conformance/README.md)的自述文件。

### 测试要求

- 测试应根据组件规范验证组件的功能行为和稳健性
- 作为组件一致性测试文档的一部分，添加所有重现测试所需的详细信息

## 认证测试

[components-contrib](https://github.com/dapr/components-contrib) 仓库中的每个稳定组件必须有一个认证测试计划和自动化认证测试，以验证组件通过 Dapr 支持的所有功能。

稳定组件的测试计划应包括以下场景：

- 客户端重新连接：如果客户端库暂时无法连接到服务，一旦服务重新上线，Dapr sidecar 不应需要重启。
- 认证选项：验证组件可以使用所有支持的选项进行认证。
- 验证资源配置：验证组件在初始化时是否自动配置资源（如果适用）。
- 所有与相应构建块和组件相关的场景。

测试计划必须由 Dapr 维护者批准，并与组件代码一起发布在 `README.md` 文件中。

### 测试要求

- 测试应根据组件规范验证组件的功能行为和稳健性，反映测试计划中的场景
- 测试必须作为 [components-contrib](https://github.com/dapr/components-contrib) 仓库的持续集成的一部分成功运行

## 组件认证过程

为了使组件获得认证，测试在由 Dapr 项目维护的环境中运行。

### 新组件认证：Alpha->Beta

对于需要从 Alpha 更改为 Beta 认证的新组件，组件认证请求遵循以下步骤：

- 请求者在 [components-contrib](https://github.com/dapr/components-contrib) 仓库中创建一个问题，以认证组件的当前和新认证级别
- 请求者提交一个 PR 以将组件与定义的一致性测试套件集成（如果尚未包含）
  - 用户在创建的问题中详细说明环境设置，以便 Dapr 维护者可以在托管环境中设置服务
  - 环境设置完成后，Dapr 维护者审核 PR，如果批准则合并该 PR
- 请求者在 [docs](https://github.com/dapr/docs) 仓库中提交一个 PR，更新组件的认证级别

### 新组件认证：Beta->Stable

对于需要从 Beta 更改为 Stable 认证的新组件，组件认证请求遵循以下步骤：

- 请求者在 [components-contrib](https://github.com/dapr/components-contrib) 仓库中创建一个问题，以认证组件的当前和新认证级别
- 请求者在组件的源代码目录中提交一个 PR，将测试计划作为 `README.md` 文件
  - 请求者在创建的 PR 中详细说明测试环境要求，包括任何手动步骤或凭据
  - Dapr 维护者审核测试计划，提供反馈或批准，并最终合并 PR
- 请求者提交一个 PR 用于自动化认证测试，包括在适用时配置资源的脚本
- 在测试环境设置完成和凭据配置后，Dapr 维护者审核 PR，如果批准则合并 PR
- 请求者在 [docs](https://github.com/dapr/docs) 仓库中提交一个 PR，更新组件的认证级别
