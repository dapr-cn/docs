---
type: docs
title: "支持的运行时和SDK版本"
linkTitle: "支持的版本"
weight: 2000
description: "运行时和SDK版本的支持和升级策略"
---

## 介绍
本主题详细介绍了Dapr版本的支持策略、升级策略，以及在所有Dapr代码库（如运行时、CLI、SDK等）中如何传达弃用和重大更改的信息，适用于1.x及以上版本。

Dapr版本采用`MAJOR.MINOR.PATCH`的版本号格式。例如，1.0.0。

| 版本号 | 描述 |
| ---------- | ----------- |
| `MAJOR`    | 当运行时有不兼容的更改时更新，例如API的更改。`MAJOR`版本也可能在有显著功能添加或更改时发布，以便与之前版本区分。 |
| `MINOR`    | 作为常规发布节奏的一部分更新，包括新功能、错误修复和安全修复。 |
| `PATCH`    | 针对关键问题（如P0问题）和安全修复进行更新。 |

支持的版本指的是：

- 如果版本存在关键问题，例如主线中断或安全问题，将发布修补程序。每个问题都根据具体情况进行评估。
- 对支持的版本进行问题调查。如果版本不再受支持，您需要升级到较新的版本以确定问题是否仍然存在。

从1.8.0版本开始，Dapr支持三个版本：当前版本和之前的两个版本。通常这些是`MINOR`版本更新。这意味着支持版本的动态窗口会向前移动，您有责任保持这些支持版本的最新状态。如果您使用较旧版本的Dapr，可能需要进行中间升级以达到支持的版本。

在major.minor版本发布之间至少有13周（3个月）的时间，给用户至少9个月的时间从不支持的版本进行升级。有关发布过程的更多详细信息，请阅读[发布周期和节奏](https://github.com/dapr/community/blob/master/release-process.md)。

补丁支持适用于当前和之前的支持版本。

## 构建变体

Dapr的sidecar镜像被发布到[GitHub容器注册表](https://github.com/dapr/dapr/pkgs/container/daprd)和[Docker注册表](https://hub.docker.com/r/daprio/daprd/tags)。默认镜像包含所有组件。从1.11版本开始，Dapr还提供了仅包含稳定组件的sidecar镜像变体。

* 默认sidecar镜像：`daprio/daprd:<version>`或`ghcr.io/dapr/daprd:<version>`（例如`ghcr.io/dapr/daprd:1.11.1`）
* 稳定组件的sidecar镜像：`daprio/daprd:<version>-stablecomponents`或`ghcr.io/dapr/daprd:<version>-stablecomponents`（例如`ghcr.io/dapr/daprd:1.11.1-stablecomponents`）

在Kubernetes上，可以通过`dapr.io/sidecar-image`注释覆盖应用程序部署资源的sidecar镜像。有关更多信息，请参阅[Dapr的参数和注释]({{< ref "arguments-annotations-overview.md" >}})。如果未指定，则使用默认的'daprio/daprd:latest'镜像。

了解更多关于[Dapr组件的认证生命周期]({{< ref "certification-lifecycle.md" >}})。

## 支持的版本

下表显示了已一起测试并形成“打包”发布的Dapr版本。任何其他版本组合都不受支持。

| 发布日期 | 运行时     | CLI  | SDKs  | 仪表板  | 状态 | 发布说明 |
|--------------------|:--------:|:--------|---------|---------|---------|------------|
| 2024年9月16日 | 1.14.4</br>  | 1.14.1 | Java 1.12.0 </br>Go 1.11.0 </br>PHP 1.2.0 </br>Python 1.14.0 </br>.NET 1.14.0 </br>JS 3.3.1 | 0.15.0 | 支持（当前） | [v1.14.4发布说明](https://github.com/dapr/dapr/releases/tag/v1.14.4) |
| 2024年9月13日 | 1.14.3</br>  | 1.14.1 | Java 1.12.0 </br>Go 1.11.0 </br>PHP 1.2.0 </br>Python 1.14.0 </br>.NET 1.14.0 </br>JS 3.3.1 | 0.15.0 | ⚠️ 已召回 | [v1.14.3发布说明](https://github.com/dapr/dapr/releases/tag/v1.14.3) |
| 2024年9月6日 | 1.14.2</br>  | 1.14.1 | Java 1.12.0 </br>Go 1.11.0 </br>PHP 1.2.0 </br>Python 1.14.0 </br>.NET 1.14.0 </br>JS 3.3.1 | 0.15.0 | 支持（当前） | [v1.14.2发布说明](https://github.com/dapr/dapr/releases/tag/v1.14.2) |
| 2024年8月14日 | 1.14.1</br>  | 1.14.1 | Java 1.12.0 </br>Go 1.11.0 </br>PHP 1.2.0 </br>Python 1.14.0 </br>.NET 1.14.0 </br>JS 3.3.1 | 0.15.0 | 支持（当前） | [v1.14.1发布说明](https://github.com/dapr/dapr/releases/tag/v1.14.1) |
| 2024年8月14日 | 1.14.0</br>  | 1.14.0 | Java 1.12.0 </br>Go 1.11.0 </br>PHP 1.2.0 </br>Python 1.14.0 </br>.NET 1.14.0 </br>JS 3.3.1 | 0.15.0 | 支持（当前） | [v1.14.0发布说明](https://github.com/dapr/dapr/releases/tag/v1.14.0) |
| 2024年5月29日 | 1.13.4</br>  | 1.13.0 | Java 1.11.0 </br>Go 1.10.0 </br>PHP 1.2.0 </br>Python 1.13.0 </br>.NET 1.13.0 </br>JS 3.3.0 | 0.14.0 | 支持  | [v1.13.4发布说明](https://github.com/dapr/dapr/releases/tag/v1.13.4) |
| 2024年5月21日 | 1.13.3</br>  | 1.13.0 | Java 1.11.0 </br>Go 1.10.0 </br>PHP 1.2.0 </br>Python 1.13.0 </br>.NET 1.13.0 </br>JS 3.3.0 | 0.14.0 | 支持 | [v1.13.3发布说明](https://github.com/dapr/dapr/releases/tag/v1.13.3) |
| 2024年4月3日 | 1.13.2</br>  | 1.13.0 | Java 1.11.0 </br>Go 1.10.0 </br>PHP 1.2.0 </br>Python 1.13.0 </br>.NET 1.13.0 </br>JS 3.3.0 | 0.14.0 | 支持 | [v1.13.2发布说明](https://github.com/dapr/dapr/releases/tag/v1.13.2) |
| 2024年3月26日 | 1.13.1</br>  | 1.13.0 | Java 1.11.0 </br>Go 1.10.0 </br>PHP 1.2.0 </br>Python 1.13.0 </br>.NET 1.13.0 </br>JS 3.3.0 | 0.14.0 | 支持 | [v1.13.1发布说明](https://github.com/dapr/dapr/releases/tag/v1.13.1) |
| 2024年3月6日 | 1.13.0</br>  | 1.13.0 | Java 1.11.0 </br>Go 1.10.0 </br>PHP 1.2.0 </br>Python 1.13.0 </br>.NET 1.13.0 </br>JS 3.3.0 | 0.14.0 | 支持 | [v1.13.0发布说明](https://github.com/dapr/dapr/releases/tag/v1.13.0) |
| 2024年1月17日 | 1.12.4</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0 | 支持 | [v1.12.4发布说明](https://github.com/dapr/dapr/releases/tag/v1.12.4) |
| 2024年1月2日 | 1.12.3</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0 | 支持 | [v1.12.3发布说明](https://github.com/dapr/dapr/releases/tag/v1.12.3) |
| 2023年11月18日 | 1.12.2</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0 | 支持 | [v1.12.2发布说明](https://github.com/dapr/dapr/releases/tag/v1.12.2) |
| 2023年11月16日 | 1.12.1</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0 | 支持 | [v1.12.1发布说明](https://github.com/dapr/dapr/releases/tag/v1.12.1) |
| 2023年10月11日 | 1.12.0</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.0 </br>PHP 1.1.0 </br>Python 1.11.0 </br>.NET 1.12.0 </br>JS 3.1.2 | 0.14.0 | 支持 | [v1.12.0发布说明](https://github.com/dapr/dapr/releases/tag/v1.12.0) |
| 2023年11月18日 | 1.11.6</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.6发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.6) |
| 2023年11月3日 | 1.11.5</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.5发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.5) |
| 2023年10月5日 | 1.11.4</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.4发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.4) |
| 2023年8月31日 | 1.11.3</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.3发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.3) |
| 2023年7月20日 | 1.11.2</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.2发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.2) |
| 2023年6月22日 | 1.11.1</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.1发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.1) |
| 2023年6月12日 | 1.11.0</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0 | 0.13.0 | 不支持 | [v1.11.0发布说明](https://github.com/dapr/dapr/releases/tag/v1.11.0) |
| 2023年11月18日 | 1.10.10</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持 |  |
| 2023年7月20日 | 1.10.9</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持 |  |
| 2023年6月22日 | 1.10.8</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持 |  |
| 2023年5月15日 | 1.10.7</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持 |  |
| 2023年5月12日 | 1.10.6</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持 |  |
| 2023年4月13日 |1.10.5</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0 | 0.11.0 | 不支持  |  |
| 2023年3月16日 | 1.10.4</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | 不支持 |  |
| 2023年3月14日 | 1.10.3</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | 不支持 |  |
| 2023年2月24日 | 1.10.2</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | 不支持 |  |
| 2023年2月20日 | 1.10.1</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | 不支持 |  |
| 2023年2月14日 | 1.10.0</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0 | 0.11.0 | 不支持 |  |
| 2022年12月2日 | 1.9.5</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年11月17日 | 1.9.4</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年11月4日 | 1.9.3</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年11月1日 | 1.9.2</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年10月26日 | 1.9.1</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年10月13日 | 1.9.0</br>  | 1.9.1 | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2 | 0.11.0 | 不支持 |  |
| 2022年10月26日 | 1.8.6</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年10月13日 | 1.8.5</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年8月10日 | 1.8.4</br>  | 1.8.1 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年7月29日 | 1.8.3</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年7月21日 | 1.8.2</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年7月20日 | 1.8.1</br>  | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年7月7日 | 1.8.0</br>   | 1.8.0 | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0 | 0.11.0 | 不支持 |  |
| 2022年10月26日 | 1.7.5</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | 不支持 |  |
| 2022年5月31日 | 1.7.4</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | 不支持 |  |
| 2022年5月17日 | 1.7.3</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1 | 0.10.0 | 不支持 |  |
| 2022年4月22日 | 1.7.2</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | 不支持 |  |
| 2022年4月20日 | 1.7.1</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | 不支持 |  |
| 2022年4月7日 | 1.7.0</br>   | 1.7.0 | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0 | 0.10.0 | 不支持 |  |
| 2022年4月20日 | 1.6.2</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | 不支持 |  |
| 2022年3月25日 | 1.6.1</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | 不支持 |  |
| 2022年1月25日 | 1.6.0</br>   | 1.6.0 | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0 | 0.9.0 | 不支持 |  |

## SDK兼容性
SDK和运行时承诺除了安全问题所需的更改外，不会有重大更改。如果需要，所有重大更改都会在发布说明中宣布。

**SDK和运行时的前向兼容性**  
较新的Dapr SDK支持最新版本的Dapr运行时和之前的两个版本（N-2）。

**SDK和运行时的后向兼容性**  
对于新的Dapr运行时，当前的SDK版本和之前的两个版本（N-2）都受到支持。

## 升级路径

在运行时1.0版本发布后，可能会出现需要通过额外版本显式升级以达到目标的情况。例如，从v1.0升级到v1.2可能需要经过v1.1。

{{% alert title="注意" color="primary" %}}
Dapr仅在单个次要版本中升级补丁版本或从一个次要版本升级到下一个次要版本时提供无缝保证。例如，从`v1.6.0`升级到`v1.6.4`或`v1.6.4`升级到`v1.7.0`是经过保证测试的。一次升级多个次要版本是未经测试的，并被视为尽力而为。
{{% /alert %}}

下表显示了Dapr运行时的测试升级路径。任何其他升级组合都没有经过测试。

有关升级的一般指导可以在[selfhost模式]({{< ref self-hosted-upgrade >}})和[Kubernetes]({{< ref kubernetes-upgrade >}})部署中找到。最好查看目标版本的发布说明以获得具体指导。

| 当前运行时版本 | 必须通过的版本  | 目标运行时版本   |
|--------------------------|-----------------------|------------------------- |
| 1.5.0 到 1.5.2           |                   N/A |                    1.6.0 |
|                          |                 1.6.0 |                    1.6.2 |
|                          |                 1.6.2 |                    1.7.5 |
|                          |                 1.7.5 |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.6 |
|                          |                 1.9.6 |                   1.10.7 |
| 1.6.0 到 1.6.2           |                   N/A |                    1.7.5 |
|                          |                 1.7.5 |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.6 |
|                          |                 1.9.6 |                   1.10.7 |
| 1.7.0 到 1.7.5           |                   N/A |                    1.8.6 |
|                          |                 1.8.6 |                    1.9.6 |
|                          |                 1.9.6 |                   1.10.7 |
| 1.8.0 到 1.8.6           |                   N/A |                    1.9.6 |
| 1.9.0 到 1.9.6           |                   N/A |                   1.10.8 |
| 1.10.0 到 1.10.8         |                   N/A |                   1.11.4 |
| 1.11.0 到 1.11.4         |                   N/A |                   1.12.4 |
| 1.12.0 到 1.12.4         |                   N/A |                   1.13.5 |
| 1.13.0 到 1.13.5         |                   N/A |                   1.14.0 |
| 1.14.0 到 1.14.2         |                   N/A |                   1.14.2 |

## 在托管平台上升级

Dapr可以支持多个生产托管平台。在1.0版本发布时，支持的两个平台是Kubernetes和物理机。有关Kubernetes升级，请参阅[Kubernetes上的生产指南]({{< ref kubernetes-production.md >}})

### 依赖项的支持版本

以下是最新版本的Dapr（v{{% dapr-latest-version long="true" %}}）已测试的软件列表。

| 依赖项            |   支持的版本                                                                                                              |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| Kubernetes                                                |  Dapr对Kubernetes的支持与[Kubernetes版本偏差策略](https://kubernetes.io/releases/version-skew-policy/)保持一致 |
| [Open Telemetry collector (OTEL)](https://github.com/open-telemetry/opentelemetry-collector/releases)|                                                                                                                              v0.101.0|
| [Prometheus](https://prometheus.io/download/)             |                                                                                                                              v2.28 |

## 相关链接

- 阅读[版本控制策略]({{< ref support-versioning.md >}})
- 阅读[重大更改和弃用策略]({{< ref breaking-changes-and-deprecations.md >}})