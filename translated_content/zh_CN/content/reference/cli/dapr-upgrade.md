---
type: docs
title: "upgrade CLI 命令参考"
linkTitle: "upgrade"
description: "有关 upgrade CLI 命令的详细信息"
---

## 说明

在受支持的托管平台上升级 Dapr 。

## 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr upgrade [flags]
```

## 参数

| Name                 | 环境变量 | 默认值      | 说明                                            |
| -------------------- | ---- | -------- | --------------------------------------------- |
| `--help`, `-h`       |      |          | 显示此帮助消息                                       |
| `--kubernetes`, `-k` |      | `false`  | 更新 Kubernetes 集群中的 dapr                       |
| `--runtime-version`  |      | `latest` | 要升级的 Dapr 运行时的版本，例如: `1.0.0`                  |
| `--set`              |      |          | 在命令行上设置值 (可以用逗号指定多个或多个值: key1=val1,key2=val2) |

## 示例

### 将 Kubernetes 中的 dapr 升级到最新版本
```bash
dapr upgrade -k
```

### 在 Kubernetes 中升级指定版本的 Dapr 运行时
```bash
dapr upgrade -k --runtime-version 1.0.0
```

### 在 Kubernetes 中升级指定版本的 Dapr 运行时，并包含一些参数
```bash
dapr upgrade -k --runtime-version 1.0.0 --set global.logAsJson=true
```
# 相关链接

- [更新 Kubernetes 集群中的 Dapr]({{< ref kubernetes-upgrade.md >}})
