---
type: docs
title: "操作指南：在离线或隔离环境中运行Dapr"
linkTitle: "离线或隔离运行"
weight: 30000
description: "如何在隔离环境中以自托管模式部署和运行Dapr"
---

## 概述

通常情况下，Dapr初始化时会从网络下载二进制文件并拉取镜像来设置开发环境。然而，Dapr也支持使用预先下载的安装包进行离线或隔离安装，这可以通过Docker或精简模式来实现。每个Dapr版本的安装包都被构建成一个[Dapr安装包](https://github.com/dapr/installer-bundle)，可以下载。通过使用这个安装包和Dapr CLI的`init`命令，你可以在没有网络访问的环境中安装Dapr。

## 设置

在进行隔离初始化之前，需要预先下载一个Dapr安装包，其中包含CLI、运行时和仪表板的内容。这避免了在本地初始化Dapr时需要下载二进制文件和Docker镜像。

1. 下载特定版本的[Dapr安装包](https://github.com/dapr/installer-bundle/releases)。例如，daprbundle_linux_amd64.tar.gz，daprbundle_windows_amd64.zip。
2. 解压缩安装包。
3. 要安装Dapr CLI，将`daprbundle/dapr (Windows为dapr.exe)`二进制文件复制到合适的位置：
   * 对于Linux/MacOS - `/usr/local/bin`
   * 对于Windows，创建一个目录并将其添加到系统PATH。例如，创建一个名为`c:\dapr`的目录，并通过编辑系统环境变量将此目录添加到路径中。

   > 注意：如果Dapr CLI没有移动到合适的位置，你可以直接使用包中的本地`dapr` CLI二进制文件。上述步骤是为了将其移动到常用位置并添加到路径中。

## 初始化Dapr环境

Dapr可以在有或没有Docker容器的隔离环境中初始化。

### 使用Docker初始化Dapr

（[前提条件](#Prerequisites)：环境中可用Docker）

进入安装包目录并运行以下命令：
```bash
dapr init --from-dir .
```
> 对于Linux用户，如果你使用sudo运行Docker命令，你需要使用“**sudo dapr init**”

> 如果你不是在安装包目录下运行上述命令，请提供安装包目录的完整路径。例如，假设安装包目录路径是$HOME/daprbundle，运行`dapr init --from-dir $HOME/daprbundle`以获得相同的效果。

输出应类似于以下内容：
```bash
  正在进行超空间跳跃...
ℹ️  正在安装最新的运行时版本
↘  正在提取二进制文件并设置组件... 已加载镜像：daprio/dapr:$version
✅  提取二进制文件并设置组件完成。
✅  二进制文件提取和组件设置已完成。
ℹ️  daprd二进制文件已安装到$HOME/.dapr/bin。
ℹ️  dapr_placement容器正在运行。
ℹ️  使用`docker ps`检查正在运行的容器。
✅  成功！Dapr已启动并运行。要开始使用，请访问：https://aka.ms/dapr-getting-started
```

> 注意：要模拟*在线* Dapr初始化，使用`dapr init`，你也可以运行Redis和Zipkin容器，如下所示：
```
1. docker run --name "dapr_zipkin" --restart always -d -p 9411:9411 openzipkin/zipkin
2. docker run --name "dapr_redis" --restart always -d -p 6379:6379 redislabs/rejson
```

### 不使用Docker初始化Dapr

或者，为了让CLI不安装任何默认配置文件或运行任何Docker容器，可以使用`init`命令的`--slim`标志。这样只会安装Dapr的二进制文件。

```bash
dapr init --slim --from-dir .
```

输出应类似于以下内容：
```bash
⌛  正在进行超空间跳跃...
ℹ️  正在安装最新的运行时版本
↙  正在提取二进制文件并设置组件... 
✅  提取二进制文件并设置组件完成。
✅  二进制文件提取和组件设置已完成。
ℹ️  daprd二进制文件已安装到$HOME/.dapr/bin。
ℹ️  placement二进制文件已安装到$HOME/.dapr/bin。
✅  成功！Dapr已启动并运行。要开始使用，请访问：https://aka.ms/dapr-getting-started
