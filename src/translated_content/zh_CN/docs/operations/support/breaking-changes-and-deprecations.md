---
type: docs
title: "重大变更和弃用"
linkTitle: "重大变更和弃用"
weight: 2500
description: "处理重大变更和弃用"
---

## 重大变更

重大变更是指对以下内容的修改，这些修改可能导致现有的第三方应用程序或脚本在升级到下一个稳定的小版本的 Dapr 工件（如 SDK、CLI、runtime 等）后出现编译错误或运行时问题：

- 代码行为
- 架构
- 默认配置值
- 命令行参数
- 发布的指标
- Kubernetes 资源模板
- 公开访问的 API
- 公开可见的 SDK 接口、方法、类或属性

以下情况可以立即应用重大变更：

- 版本未达到 1.0.0 的项目
- 预览功能
- Alpha API
- SDK 中的预览或 Alpha 接口、类、方法或属性
- 处于 Alpha 或 Beta 阶段的 Dapr 组件
- `github.com/dapr/components-contrib` 的接口
- 文档和博客中的 URL
- **例外**情况，**需要**修复关键错误或安全漏洞。

### 应用重大变更的流程

应用重大变更需要遵循以下流程：

1. 弃用通知必须作为发布的一部分进行发布。
1. 重大变更将在弃用公告发布后的两个版本后生效。
   - 例如，功能 X 在 1.0.0 版本说明中宣布弃用，然后将在 1.2.0 中移除。

## 弃用

弃用可以应用于：

1. API，包括 alpha API
1. 预览功能
1. 组件
1. CLI
1. 可能导致安全漏洞的功能

弃用信息会在发布说明中名为“弃用”的部分中列出，说明：

- 当前弃用的功能将在未来某个版本中不再受支持。例如，发布 x.y.z。这至少是在两个版本之前。
- 在发布说明中记录用户需要采取的任何步骤以修改其代码、操作等（如果适用）。

在宣布未来的重大变更后，该变更将在 2 个版本或 6 个月后生效，以较长者为准。弃用的功能应响应警告，但除此之外不执行任何操作。

## 已宣布的弃用

| 功能               |   弃用公告   | 移除       |
|-----------------------|-----------------------|------------------------- |
| GET /v1.0/shutdown API（用户应使用 [POST API]({{< ref kubernetes-job.md >}}) 代替） | 1.2.0 | 1.4.0 |
| Java 域构建器类已弃用（用户应使用 [setters](https://github.com/dapr/java-sdk/issues/587) 代替） | Java SDK 1.3.0 | Java SDK 1.5.0 |
| 当未指定内容类型时，服务调用将不再提供默认的 `application/json` 内容类型头。如果您的调用应用程序依赖于此头，则必须明确 [设置内容类型头]({{< ref "service_invocation_api.md#request-contents" >}})。 | 1.7.0 | 1.9.0 |
| 使用 `invoke` 方法的 gRPC 服务调用已弃用。请改用代理模式服务调用。请参阅 [How-To: Invoke services using gRPC ]({{< ref howto-invoke-services-grpc.md >}}) 以使用代理模式。| 1.9.0 | 1.10.0 |
| CLI 标志 `--app-ssl`（在 Dapr CLI 和 daprd 中）已弃用，建议使用 `--app-protocol`，值为 `https` 或 `grpcs`。[daprd:6158](https://github.com/dapr/dapr/issues/6158) [cli:1267](https://github.com/dapr/cli/issues/1267)| 1.11.0 | 1.13.0 |
| Hazelcast PubSub 组件 | 1.9.0 | 1.11.0 |
| Twitter Binding 组件 | 1.10.0 | 1.11.0 |
| NATS Streaming PubSub 组件 | 1.11.0 | 1.13.0 |
| Workflows API Alpha1 `/v1.0-alpha1/workflows` 被弃用，建议使用 Workflow Client | 1.15.0 | 1.17.0 |

## 相关链接

- 阅读 [版本政策]({{< ref support-versioning.md >}})
- 阅读 [支持的发布]({{< ref support-release-policy.md >}})