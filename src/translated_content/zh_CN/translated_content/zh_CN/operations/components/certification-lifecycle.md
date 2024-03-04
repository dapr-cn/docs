---
type: docs
title: "认证生命周期"
linkTitle: "认证生命周期"
weight: 200
description: "组件认证生命周期，从提交到生产就绪"
---

{{% alert title="Note" color="primary" %}}
Certification lifecycle only applies to built-in components and does not apply to [pluggable components]({{<ref "components-concept.md#Built-in-and-pluggable-components" >}}).
{{% /alert %}}

## 概述

Dapr 采用模块化设计，功能以组件形式交付。 每个组件都有接口定义。 All of the components are interchangeable, so that in ideal scenarios, you can swap out one component with the same interface for another. Each component used in production maintains a certain set of technical requirements to ensure functional compatibility and robustness.

In general a component needs to be:

- Compliant with the defined Dapr interfaces
- Functionally correct and robust
- Well documented and maintained

To make sure a component conforms to the standards set by Dapr, there are a set of tests run against a component in a Dapr maintainers managed environment. Once the tests pass consistently, the maturity level can be determined for a component.

## 认证级别

The levels are as follows:

- [Alpha](#alpha)
- [Beta](#beta)
- [Stable](#stable)

### Alpha

- The component implements the required interface and works as described in the specification
- 该组件有文档
- 该组件可能有问题，或者在集成时可能会暴露出问题。
- 该组件可能无法通过所有的一致性测试
- 该组件可能没有符合性测试
- 建议仅用于非业务关键型用途，因为在后续版本中可能会出现不兼容的变化

All components start at the Alpha stage.

### Beta

- The component must pass all the component conformance tests defined to satisfy the component specification
- 组件的一致性测试已经在 Dapr 维护者管理的环境中运行
- 该组件包含了由 Dapr 维护者审查和批准的一致性测试结果的记录，并具有特定 components-contrib 版本
- 建议仅用于非业务关键型用途，因为在后续版本中可能会出现不兼容的变化

{{% alert title="Note" color="primary" %}}
A component may skip the Beta stage and conformance test requirement per the discretion of the Maintainer if:
- The component is a binding
- The certification tests are comprehensive
{{% /alert %}}

### Stable

- The component must have component [certification tests](#certification-tests) validating functionality and resiliency
- 该组件由 Dapr 维护者维护，并得到社区的支持
- 该组件已有充分文档记录和测试
- The component has been available as Alpha or Beta for at least 1 minor version release of Dapr runtime prior
- A maintainer will address component security, core functionality and test issues according to the Dapr support policy and issue a patch release that includes the patched stable component

### 以前的正式发布 （GA） 组件

Any component that was previously certified as GA is allowed into Stable even if the new requirements are not met.

## 一致性测试

Each component in the [components-contrib](https://github.com/dapr/components-contrib) repository needs to adhere to a set of interfaces defined by Dapr. Conformance tests are tests that are run on these component definitions with their associated backing services such that the component is tested to be conformant with the Dapr interface specifications and behavior.

The conformance tests are defined for the following building blocks:

- State store
- 秘密存储
- 绑定
- Pub/sub（发布/订阅）

To understand more about them see the readme [here](https://github.com/dapr/components-contrib/blob/master/tests/conformance/README.md).

### Test requirements

- The tests should validate the functional behavior and robustness of component based on the component specification
- 重现测试所需的所有细节都作为组件一致性测试文件的一部分加入

## 认证测试

Each stable component in the [components-contrib](https://github.com/dapr/components-contrib) repository must have a certification test plan and automated certification tests validating all features supported by the component via Dapr.

Test plan for stable components should include the following scenarios:

- Client reconnection: in case the client library cannot connect to the service for a moment, Dapr sidecar should not require a restart once the service is back online.
- 身份验证选项：验证组件是否可以使用所有支持的选项进行身份验证。
- 验证资源供应：验证该组件是否在初始化时自动供应资源（如果适用）。
- 与相应的构建块和组件相关的所有方案。

The test plan must be approved by a Dapr maintainer and be published in a `README.md` file along with the component code.

### Test requirements

- The tests should validate the functional behavior and robustness of the component based on the component specification, reflecting the scenarios from the test plan
- 测试必须作为 [components-contrib](https://github.com/dapr/components-contrib) 仓库的持续集成的一部分成功运行。

## Component certification process

In order for a component to be certified, tests are run in an environment maintained by the Dapr project.

### 新组件认证：Alpha->Beta

For a new component requiring a certification change from Alpha to Beta, a request for component certification follows these steps:

- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- 请求者提交 PR 以将组件与定义的一致性测试套件（如果尚未包含）集成
  - The user details the environment setup in the issue created, so a Dapr maintainer can setup the service in a managed environment
  - 在环境设置完成后，Dapr 维护者会审查 PR，如果批准，就会合并该 PR
- 请求者在 [docs](https://github.com/dapr/docs) 仓库中提交 PR，从而更新组件的认证级别

### 新组件认证：Beta->Stable

For a new component requiring a certification change from Beta to Stable, a request for component certification follows these steps:

- Requestor creates an issue in the [components-contrib](https://github.com/dapr/components-contrib) repository for certification of the component with the current and the new certification levels
- 请求者将测试计划的 PR 作为组件源代码目录中的 `README.md` 文件提交
  - The requestor details the test environment requirements in the created PR, including any manual steps or credentials needed
  - Dapr 维护者审查测试计划，提供反馈或批准它，并最终合并 PR
- 请求者为自动认证测试提交 PR，包括用于在适用时预配资源的脚本
- 在测试环境设置完成并配置凭据后，Dapr 维护人员将检查 PR，如果获得批准，则合并 PR
- 请求者在 [docs](https://github.com/dapr/docs) 仓库中提交 PR，从而更新组件的认证级别
