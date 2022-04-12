---
type: docs
title: "upgrade CLI 命令参考"
linkTitle: "upgrade"
description: "有关 upgrade CLI 命令的详细信息"
---

### 说明

在支持的托管平台上升级或降级 Dapr。

{{% alert title="Warning" color="warning" %}}
版本步骤应逐步进行，包括升级或降级时的小版本。

在降级之前，请确认组件向后兼容，并且应用程序代码确实会破坏以前版本的 Dapr 中不支持的 API。
{{% /alert %}}

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr upgrade [flags]
```

### 参数

| Name                 | 环境变量 | 默认值      | 说明                                            |
| -------------------- | ---- | -------- | --------------------------------------------- |
| `--help`, `-h`       |      |          | 显示此帮助消息                                       |
| `--kubernetes`, `-k` |      | `false`  | 更新/降级 Kubernetes 集群中的 dapr                    |
| `--runtime-version`  |      | `latest` | 要升级/降级到的 Dapr 运行时版本，例如： `1.0.0`               |
| `--set`              |      |          | 在命令行上设置值 (可以用逗号指定多个或多个值: key1=val1,key2=val2) |

### 示例

```bash
# Upgrade Dapr in Kubernetes to latest version
dapr upgrade -k

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes
dapr upgrade -k --runtime-version 1.2

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes with value set
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```

### 相关链接

- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade.md >}})