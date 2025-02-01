---
type: docs
title: "卸载 CLI 命令参考"
linkTitle: "卸载"
description: "关于卸载 CLI 命令的详细信息"
---

### 描述

卸载 Dapr 运行环境。

### 支持的平台

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr uninstall [flags]
```

### 标志

| 名称                 | 环境变量             | 默认值       | 描述                                                                                                                                         |
| -------------------- | -------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--all`              |                      | `false`       | 移除 Redis、Zipkin 容器以及默认 Dapr 目录（位于 `$HOME/.dapr` 或 `%USERPROFILE%\.dapr\`），但保留调度服务和 actor 放置服务容器。 |
| `--help`, `-h`       |                      |               | 显示帮助信息                                                                                                                             |
| `--kubernetes`, `-k` |                      | `false`       | 从 Kubernetes 集群中卸载 Dapr                                                                                                            |
| `--namespace`, `-n`  |                      | `dapr-system` | 从指定的 Kubernetes 命名空间卸载 Dapr                                                                                                     |
|  `--container-runtime`  |              |    `docker`      | 指定使用 Docker 以外的容器运行时。支持的选项包括：`docker`，`podman` |

### 示例

#### 从自托管模式卸载

```bash
dapr uninstall
```

您还可以使用 `--all` 选项来移除 .dapr 目录、Redis、Placement、Scheduler 和 Zipkin 容器

```bash
dapr uninstall --all
```

在配置 Dapr 时，您可以指定不同的容器运行时。如果省略 `--container-runtime` 标志，默认使用 Docker。

```bash
dapr uninstall --all --container-runtime podman
```

#### 从 Kubernetes 卸载

```bash
dapr uninstall -k
```