---
type: docs
title: "upgrade CLI 命令参考"
linkTitle: "upgrade"
description: "有关 upgrade CLI 命令的详细信息"
---

### 说明

Upgrade or downgrade Dapr on supported hosting platforms.

{{% alert title="Warning" color="warning" %}}
Version steps should be done incrementally, including minor versions as you upgrade or downgrade.

Prior to downgrading, confirm components are backwards compatible and application code does ultilize APIs that are not supported in previous versions of Dapr.
{{% /alert %}}

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr upgrade [flags]
```

### 参数

| Name                 | 环境变量 | 默认值      | 说明                                                                            |
| -------------------- | ---- | -------- | ----------------------------------------------------------------------------- |
| `--help`, `-h`       |      |          | 显示此帮助消息                                                                       |
| `--kubernetes`, `-k` |      | `false`  | Upgrade/Downgrade Dapr in a Kubernetes cluster                                |
| `--runtime-version`  |      | `latest` | The version of the Dapr runtime to upgrade/downgrade to, for example: `1.0.0` |
| `--set`              |      |          | 在命令行上设置值 (可以用逗号指定多个或多个值: key1=val1,key2=val2)                                 |

### 示例

```bash
# Upgrade Dapr in Kubernetes to latest version
dapr upgrade -k

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes
dapr upgrade -k --runtime-version 1.2

# Upgrade or downgrade to a specified version of Dapr runtime in Kubernetes with value set
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```
### Warning messages
This command can issue warning messages.

#### Root certificate renewal warning
If the mtls root certificate deployed to the Kubernetes cluster expires in under 30 days the following warning message is displayed:

```
Dapr root certificate of your Kubernetes cluster expires in <n> days. Expiry date: <date:time> UTC. 
Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```

### 相关链接

- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade.md >}})