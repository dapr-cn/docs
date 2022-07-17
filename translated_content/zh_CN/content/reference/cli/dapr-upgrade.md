---
type: docs
title: "upgrade CLI 命令参考"
linkTitle: "upgrade"
description: "有关 upgrade CLI 命令的详细信息"
---

## 说明

Upgrade Dapr on supported hosting platforms.

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr upgrade [flags]
```

## 参数

| Name                 | 环境变量 | 默认值      | 说明                                                                  |
| -------------------- | ---- | -------- | ------------------------------------------------------------------- |
| `--help`, `-h`       |      |          | 显示此帮助消息                                                             |
| `--kubernetes`, `-k` |      | `false`  | Upgrade Dapr in a Kubernetes cluster                                |
| `--runtime-version`  |      | `latest` | The version of the Dapr runtime to upgrade to, for example: `1.0.0` |
| `--set`              |      |          | 在命令行上设置值 (可以用逗号指定多个或多个值: key1=val1,key2=val2)                       |

## 示例

### 将 Kubernetes 中的 dapr 升级到最新版本
```bash
dapr upgrade -k
```

### Upgrade specified version of Dapr runtime in Kubernetes
```bash
dapr upgrade -k --runtime-version 1.2
```

### Upgrade specified version of Dapr runtime in Kubernetes with value set
```bash
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```
# 相关链接

- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade.md >}})
