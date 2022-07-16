---
type: docs
title: "uninstall CLI 命令参考"
linkTitle: "uninstall"
description: "有关 uninstall CLI 命令的详细信息"
---

### 说明

卸载 Dapr 运行时。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr uninstall [flags]
```

### 参数

| Name                 | 环境变量 | 默认值           | 说明                                                                                                       |
| -------------------- | ---- | ------------- | -------------------------------------------------------------------------------------------------------- |
| `--all`              |      | `false`       | 除 actor Placement放置容器外，卸载 Redis， Zipkin 容器。 删除 dapr 默认文件夹，路径为 `$HOME/.dapr or %USERPROFILE%\.dapr\`. |
| `--help`, `-h`       |      |               | 显示此帮助消息                                                                                                  |
| `--kubernetes`, `-k` |      | `false`       | 从 Kubernetes 集群卸载 dapr                                                                                   |
| `--namespace`, `-n`  |      | `dapr-system` | 要卸载 Dapr 的 Kubernetes 命名空间                                                                               |

### 示例

#### 从自托管模式卸载

```bash
dapr uninstall
```

你也可以使用选项 `--all` 去移除.dapr目录，以及Redis、Placement和Zipkin容器。

```bash
dapr uninstall --all
```

#### 从 Kubernetes 卸载

```bash
dapr uninstall -k
```
