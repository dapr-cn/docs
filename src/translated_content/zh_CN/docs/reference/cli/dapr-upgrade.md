---
type: docs
title: "升级 CLI 命令参考"
linkTitle: "升级"
description: "关于升级 CLI 命令的详细信息"
---

### 描述

在支持的托管平台上升级或回退 Dapr。

{{% alert title="警告" color="warning" %}}
版本升级或回退应逐步进行，包括小版本的更新。

在回退之前，请确认组件是向后兼容的，并且应用程序代码没有使用以前版本的 Dapr 不支持的 API。
{{% /alert %}}

### 支持的平台

- [Kubernetes]({{< ref kubernetes >}})

### 用法

```bash
dapr upgrade [flags]
```

### 标志

| 名称                 | 环境变量             | 默认值   | 描述                                                                                                      |
| -------------------- | -------------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `--help`, `-h`       |                      |          | 显示帮助信息                                                                                             |
| `--kubernetes`, `-k` |                      | `false`  | 在 Kubernetes 集群中升级/回退 Dapr                                                                         |
| `--runtime-version`  |                      | `latest` | 要升级/回退到的 Dapr 运行时版本，例如：`1.0.0`                                                             |
| `--set`              |                      |          | 在命令行上设置值（可以指定多个值或用逗号分隔：key1=val1,key2=val2）                                      |
| `--image-registry`   |                      |          | 从指定的镜像注册表中拉取 Dapr 所需的容器镜像                                                               |

### 示例

```bash
# 在 Kubernetes 中将 Dapr 升级到最新版本
dapr upgrade -k

# 在 Kubernetes 中升级或回退到指定版本的 Dapr 运行时
dapr upgrade -k --runtime-version 1.2

# 在 Kubernetes 中升级或回退到指定版本的 Dapr 运行时并设置值
dapr upgrade -k --runtime-version 1.2 --set global.logAsJson=true
```
```bash
# 使用私有注册表进行升级或回退，如果您在托管 Dapr 镜像时使用了私有注册表并在执行 `dapr init -k` 时使用了它
# 场景 1：Dapr 镜像直接托管在私有注册表的根目录下 -
dapr init -k --image-registry docker.io/username
# 场景 2：Dapr 镜像托管在私有注册表的不同目录下 -
dapr init -k --image-registry docker.io/username/<directory-name>
```

### 警告信息
此命令可能会发出警告信息。

#### 根证书更新警告
如果部署到 Kubernetes 集群的 mtls 根证书将在 30 天内过期，则会显示以下警告信息：

```
您的 Kubernetes 集群的 Dapr 根证书将在 <n> 天后过期。到期日期：<date:time> UTC。
请参阅 docs.dapr.io 以获取证书更新说明，以避免服务中断。
```

### 相关链接

- [在 Kubernetes 集群上升级 Dapr]({{< ref kubernetes-upgrade.md >}})
