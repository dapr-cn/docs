---
type: docs
title: "upgrade CLI command reference"
linkTitle: "upgrade"
description: "Detailed information on the upgrade CLI command"
---

## 说明

Upgrade Dapr on supported hosting platforms.

## Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

## 用法
```bash
dapr upgrade [flags]
```

## 参数

| Name                 | 环境变量 | 默认值      | 说明                                                                                                        |
| -------------------- | ---- | -------- | --------------------------------------------------------------------------------------------------------- |
| `--help`, `-h`       |      |          | 显示此帮助消息                                                                                                   |
| `--kubernetes`, `-k` |      | `false`  | Upgrade Dapr in a Kubernetes cluster                                                                      |
| `--runtime-version`  |      | `latest` | The version of the Dapr runtime to upgrade to, for example: `1.0.0`                                       |
| `--set`              |      |          | Set values on the command line (can specify multiple or separate values with commas: key1=val1,key2=val2) |

## 示例

### Upgrade Dapr in Kubernetes to latest version
```bash
dapr upgrade -k
```

### Upgrade specified version of Dapr runtime in Kubernetes
```bash
dapr upgrade -k --runtime-version 1.0.0
```

### Upgrade specified version of Dapr runtime in Kubernetes with value set
```bash
dapr upgrade -k --runtime-version 1.0.0 --set global.logAsJson=true
```
# Related links

- [Upgrade Dapr on a Kubernetes cluster]({{< ref kubernetes-upgrade.md >}})
