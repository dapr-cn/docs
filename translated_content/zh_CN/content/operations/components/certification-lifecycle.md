---
type: docs
title: "认证生命周期"
linkTitle: "认证生命周期"
weight: 200
description: "从提交到生产准备的组件认证生命周期"
---

## 概述

Dapr 使用模块化设计，将功能作为组件来提供。 每个组件都有接口定义。  所有的组件都是可插拔的，因此在理想的情况下，你可以用一个具有相同接口的组件换掉另一个。 用于生产的每个组件， 需要保持一套技术要求，以确保组件的功能兼容性和强度。

一般来说，一个组件需要是：
- 符合定义的Dapr接口
- 功能正确和强健
- 完善的文档和维护

为了确保一个组件符合Dapr设定的标准，在Dapr维护者管理的环境中，有一组针对组件的测试。 一旦测试持续通过，就可以确定一个组件的成熟度。

## 认证级别

级别如下:
- [Alpha](#alpha)
- [Beta](#beta)
- [Stable](#stable)

### Alpha

- 该组件实现了所需的接口，并按照规范中的描述工作。
- 该组件有文档
- 该组件可能有问题，或者在集成时可能会暴露出问题。
- 该组件可能无法通过所有的一致性测试
- 该组件可能没有符合性测试
- 建议仅用于非业务关键型用途，因为在后续版本中可能会出现不兼容的变化

所有组件都在 Alpha 阶段开始。

### Beta

- 该组件必须通过为满足组件规范而定义的所有组件一致性测试
- 组件的一致性测试已经在Dapr维护者管理的环境中运行
- 该组件包含了由Dapr维护者审查和批准的一致性测试结果的记录，并具有特定组件-contrib版本
- 建议仅用于非业务关键型用途，因为在后续版本中可能会出现不兼容的变化

### Stable

- The component must have component [certification tests](#certification-tests) validating functionality and resiliency
- The component is maintained by Dapr maintainers and supported by the community
- The component is well documented and tested
- A maintainer will address component security, core functionality and test issues according to the Dapr support policy and issue a patch release that includes the patched stable component

### Previous Generally Available (GA) components

Any component that was previously certified as GA is allowed into Stable even if the new requirements are not met.

## 一致性测试

[components-contrib](https://github.com/dapr/components-contrib)资源库中的每个组件都需要遵守由Dapr定义的一组接口。 一致性测试是对这些组件定义及其相关的支持服务运行的测试，这样组件就被测试为符合Dapr接口规范和行为。

符合性测试是为以下构建块定义的:

- 状态存储
- 密钥存储
- 绑定
- 发布/订阅

要了解更多关于它们的信息，请看readme [这里](https://github.com/dapr/components-contrib/blob/master/tests/conformance/README.md)。

### 测试要求

- 测试应该根据组件的规范来验证组件的功能行为和稳健性
- 重现测试所需的所有细节都作为组件一致性测试文件的一部分加入

## Certification tests

Each stable component in the [components-contrib](https://github.com/dapr/components-contrib) repository must have a certification test plan and automated certification tests validating all features supported by the component via Dapr.

Test plan for stable components should include the following scenarios:

- Client reconnection: in case the client library cannot connect to the service for a moment, Dapr sidecar should not require a restart once the service is back online.
- Authentication options: validate the component can authenticate with all the supported options.
- Validate resource provisioning: validate if the component automatically provisions resources on initialization, if applicable.
- All scenarios relevant to the corresponding building block and component.

The test plan must be approved by a Dapr maintainer and be published in a `README.md` file along with the component code.

### 测试要求

- The tests should validate the functional behavior and robustness of the component based on the component specification, reflecting the scenarios from the test plan
- The tests must run successfully as part of the continuous integration of the [components-contrib](https://github.com/dapr/components-contrib) repository


## 组件认证过程

In order for a component to be certified, tests are run in an environment maintained by the Dapr project.

### New component certification: Alpha->Beta

For a new component requiring a certification change from Alpha to Beta, a request for component certification follows these steps:
- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- Requestor submits a PR to integrate the component with the defined conformance test suite, if not already included
    - The user details the environment setup in the issue created, so a Dapr maintainer can setup the service in a managed environment
    - 在环境设置完成后，Dapr维护者会审查PR，如果批准，就会合并该PR
- Requestor submits a PR in the [docs](https://github.com/dapr/docs) repository, updating the component's certification level

### New component certification: Beta->Stable

For a new component requiring a certification change from Beta to Stable, a request for component certification follows these steps:
- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- Requestor submits a PR for the test plan as a `README.md` file in the component's source code directory
    - The requestor details the test environment requirements in the created PR, including any manual steps or credentials needed
    - A Dapr maintainer reviews the test plan, provides feedback or approves it, and eventually merges the PR
- Requestor submits a PR for the automated certification tests, including scripts to provision resources when applicable
- After the test environment setup is completed and credentials provisioned, Dapr maintainers review the PR and, if approved, merges the PR
- Requestor submits a PR in the [docs](https://github.com/dapr/docs) repository, updating the component's certification level
