---
type: docs
title: "uninstall CLI 命令参考文档"
linkTitle: "uninstall"
description: "有关 uninstall CLI 命令的详细信息"
---

### 说明

Uninstall Dapr runtime.

### Supported platforms

- [自托管]({{< ref self-hosted >}})
- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr uninstall [flags]
```

### Flags

| 名称                    | 环境变量 | 默认值           | 说明                                                                                                                                                      |
| --------------------- | ---- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--all`               |      | `false`       | Remove Redis, Zipkin containers in addition to actor placement container. Remove default dapr dir located at `$HOME/.dapr or %USERPROFILE%\.dapr\`. |
| `--help`, `-h`        |      |               | 显示此帮助消息                                                                                                                                                 |
| `--kubernetes`, `-k`  |      | `false`       | 从 Kubernetes 集群卸载 dapr                                                                                                                                  |
| `--namespace`, `-n`   |      | `dapr-system` | 要卸载 Dapr 的 Kubernetes 命名空间                                                                                                                              |
| `--container-runtime` |      | `docker`      | Used to pass in a different container runtime other than Docker. Supported container runtimes are: `docker`, `podman`                                   |

### 示例

#### Uninstall from self-hosted mode

```bash
dapr uninstall
```

你也可以使用选项 `--all` 去移除 .dapr 目录，以及 Redis、Placement 和 Zipkin 容器。

```bash
dapr uninstall --all
```

You can specify a different container runtime while setting up Dapr. If you omit the `--container-runtime` flag, the default container runtime is Docker.

```bash
dapr uninstall --all --container-runtime podman
```

#### Uninstall from Kubernetes

```bash
dapr uninstall -k
```
