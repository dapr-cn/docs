---
type: docs
title: "Supported runtime and SDK releases"
linkTitle: "支持的版本"
weight: 2000
description: "Runtime and SDK release support and upgrade policies"
---

## 介绍
This topic details the supported versions of Dapr releases, the upgrade policies and how deprecations and breaking changes are communicated in all Dapr repositories (runtime, CLI, SDKs, etc) at versions 1.x and above.

Dapr 发布使用 `MAJOR.MINOR.PATCH` 格式做版本控制。 For example, 1.0.0.

| 版本控制    | 说明                                                                                                                                                                                                                                                             |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAJOR` | Updated when there’s a non-backward compatible change to the runtime, such as an API change. A `MAJOR` release can also occur then there is a considered a significant addition/change of functionality that needs to differentiate from the previous version. |
| `MINOR` | Updated as part of the regular release cadence, including new features, bug, and security fixes.                                                                                                                                                               |
| `PATCH` | Incremented for a critical issue (P0) and security hot fixes.                                                                                                                                                                                                  |

A supported release means:

- A hoxfix patch is released if the release has a critical issue such as a mainline broken scenario or a security issue. Each of these are reviewed on a case by case basis.
- Issues are investigated for the supported releases. If a release is no longer supported, you need to upgrade to a newer release and determine if the issue is still relevant.

From the 1.8.0 release onwards three (3) versions of Dapr are supported; the current and previous two (2) versions. 通常，这些是`次要`发布更新。 这意味着有一个版本滚动窗口，用于更新到受支持的版本，并且您的操作责任是维护升级到最新受支持版本。 如果您使用的是较旧版本的 Dapr，则可能必须执行过渡升级才能获得受支持的版本。

在 major.minor 版本发布之间将至少有 6 周的时间，为用户提供 12 周（3 个月）的滚动升级窗口。

补丁支持仅适用于受支持的版本（当前版本和前一个主要版本）。

## Build variations

The Dapr's sidecar image is published to both [GitHub Container Registry](https://github.com/dapr/dapr/pkgs/container/daprd) and [Docker Registry](https://hub.docker.com/r/daprio/daprd/tags). The default image contains all components. From version 1.11, Dapr also offers a variation of the sidecar image, containing only stable components.

* Default sidecar images: `daprio/daprd:<version>` or `ghcr.io/dapr/daprd:<version>` (for example `ghcr.io/dapr/daprd:1.11.1`)
* Sidecar images for stable components: `daprio/daprd:<version>-stablecomponents` or `ghcr.io/dapr/daprd:<version>-stablecomponents` (for example `ghcr.io/dapr/daprd:1.11.1-stablecomponents`)

On Kubernetes, the sidecar image can be overwritten for the application Deployment resource with the `dapr.io/sidecar-image` annotation. See more about [Dapr's arguments and annotations]({{< ref "arguments-annotations-overview.md" >}}). The default 'daprio/daprd:latest' image is used if not specified.

Learn more about [Dapr components' certification lifecycle]({{< ref "certification-lifecycle.md" >}}).

## 支持的版本

下表显示了 Dapr 发布的版本，这些版本已被一起测试并形成一个 "打包 "的版本。 不支持任何其他版本组合。

| Release date       |   Runtime    | CLI    | SDKs                                                                                       | Dashboard | 状态 （Status）         | Release notes                                                                |
| ------------------ |:------------:|:------ | ------------------------------------------------------------------------------------------ | --------- | ------------------- | ---------------------------------------------------------------------------- |
| January 17th 2024  | 1.12.4</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0    | Supported (current) | [v1.12.4 release notes](https://github.com/dapr/dapr/releases/tag/v1.12.4)   |
| January 2nd 2024   | 1.12.3</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0    | Supported (current) | [v1.12.3 release notes](https://github.com/dapr/dapr/releases/tag/v1.12.3)   |
| November 18th 2023 | 1.12.2</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0    | Supported (current) | [v1.12.2 release notes](https://github.com/dapr/dapr/releases/tag/v1.12.2)   |
| November 16th 2023 | 1.12.1</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.1 </br>PHP 1.2.0 </br>Python 1.12.0 </br>.NET 1.12.0 </br>JS 3.2.0 | 0.14.0    | Supported           | [v1.12.1 release notes](https://github.com/dapr/dapr/releases/tag/v1.12.1)   |
| October 11th 2023  | 1.12.0</br>  | 1.12.0 | Java 1.10.0 </br>Go 1.9.0 </br>PHP 1.1.0 </br>Python 1.11.0 </br>.NET 1.12.0 </br>JS 3.1.2 | 0.14.0    | Supported           | [v1.12.0 release notes](https://github.com/dapr/dapr/releases/tag/v1.12.0)   |
| November 18th 2023 | 1.11.6</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.6 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.6)   |
| November 3rd 2023  | 1.11.5</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.5 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.5)   |
| October 5th 2023   | 1.11.4</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.4 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.4)   |
| August 31st 2023   | 1.11.3</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.3 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.3)   |
| July 20th 2023     | 1.11.2</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.2 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.2)   |
| June 22nd 2023     | 1.11.1</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.1 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.1)   |
| June 12th 2023     | 1.11.0</br>  | 1.11.0 | Java 1.9.0 </br>Go 1.8.0 </br>PHP 1.1.0 </br>Python 1.10.0 </br>.NET 1.11.0 </br>JS 3.1.0  | 0.13.0    | Supported           | [v1.11.0 release notes](https://github.com/dapr/dapr/releases/tag/v1.11.0)   |
| November 18th 2023 | 1.10.10</br> | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           | [v1.10.10 release notes](https://github.com/dapr/dapr/releases/tag/v1.10.10) |
| July 20th 2023     | 1.10.9</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           | [v1.10.9 release notes](https://github.com/dapr/dapr/releases/tag/v1.10.9)   |
| June 22nd 2023     | 1.10.8</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           | [v1.10.8 release notes](https://github.com/dapr/dapr/releases/tag/v1.10.8)   |
| May 15th 2023      | 1.10.7</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           |                                                                              |
| May 12th 2023      | 1.10.6</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.7.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           |                                                                              |
| April 13 2023      | 1.10.5</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 3.0.0   | 0.11.0    | Supported           |                                                                              |
| March 16 2023      | 1.10.4</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0   | 0.11.0    | Supported           |                                                                              |
| March 14 2023      | 1.10.3</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0   | 0.11.0    | Supported           |                                                                              |
| February 24 2023   | 1.10.2</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0   | 0.11.0    | Supported           |                                                                              |
| February 20 2023   | 1.10.1</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0   | 0.11.0    | Supported           |                                                                              |
| February 14 2023   | 1.10.0</br>  | 1.10.0 | Java 1.8.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.9.0 </br>.NET 1.10.0 </br>JS 2.5.0   | 0.11.0    | Supported           |                                                                              |
| December 2nd 2022  |  1.9.5</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| November 17th 2022 |  1.9.4</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| November 4th 2022  |  1.9.3</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| November 1st 2022  |  1.9.2</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| October 26th 2022  |  1.9.1</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.1 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| October 13th 2022  |  1.9.0</br>  | 1.9.1  | Java 1.7.0 </br>Go 1.6.0 </br>PHP 1.1.0 </br>Python 1.8.3 </br>.NET 1.9.0 </br>JS 2.4.2    | 0.11.0    | Unsupported         |                                                                              |
| October 26th 2022  |  1.8.6</br>  | 1.8.1  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| October 13th 2022  |  1.8.5</br>  | 1.8.1  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| August 10th 2022   |  1.8.4</br>  | 1.8.1  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| July 29th 2022     |  1.8.3</br>  | 1.8.0  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| July 21st 2022     |  1.8.2</br>  | 1.8.0  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| July 20th 2022     |  1.8.1</br>  | 1.8.0  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| July 7th 2022      |  1.8.0</br>  | 1.8.0  | Java 1.6.0 </br>Go 1.5.0 </br>PHP 1.1.0 </br>Python 1.7.0 </br>.NET 1.8.0 </br>JS 2.3.0    | 0.11.0    | Unsupported         |                                                                              |
| October 26th 2022  |  1.7.5</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1    | 0.10.0    | Unsupported         |                                                                              |
| May 31st 2022      |  1.7.4</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1    | 0.10.0    | Unsupported         |                                                                              |
| May 17th 2022      |  1.7.3</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.2.1    | 0.10.0    | Unsupported         |                                                                              |
| Apr 22th 2022      |  1.7.2</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0    | 0.10.0    | Unsupported         |                                                                              |
| Apr 20th 2022      |  1.7.1</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0    | 0.10.0    | Unsupported         |                                                                              |
| Apr 7th 2022       |  1.7.0</br>  | 1.7.0  | Java 1.5.0 </br>Go 1.4.0 </br>PHP 1.1.0 </br>Python 1.6.0 </br>.NET 1.7.0 </br>JS 2.1.0    | 0.10.0    | Unsupported         |                                                                              |
| Apr 20th 2022      |  1.6.2</br>  | 1.6.0  | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0    | 0.9.0     | Unsupported         |                                                                              |
| Mar 25th 2022      |  1.6.1</br>  | 1.6.0  | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0    | 0.9.0     | Unsupported         |                                                                              |
| Jan 25th 2022      |  1.6.0</br>  | 1.6.0  | Java 1.4.0 </br>Go 1.3.1 </br>PHP 1.1.0 </br>Python 1.5.0 </br>.NET 1.6.0 </br>JS 2.0.0    | 0.9.0     | Unsupported         |                                                                              |

## 升级路径

在 1.0 版本之后，可能需要通过之间版本显式升级才能达到所需的目标版本。 For example, an upgrade from v1.0 to v1.2 may need to pass through v1.1.

{{% alert title="Note" color="primary" %}}
Dapr only has a seamless guarantee when upgrading patch versions in a single minor version, or upgrading from one minor version to the next. For example, upgrading from `v1.6.0` to `v1.6.4` or `v1.6.4` to `v1.7.0` is guaranteed tested. Upgrading more than one minor version at a time is untested and treated as best effort.
{{% /alert %}}

The table below shows the tested upgrade paths for the Dapr runtime. Any other combinations of upgrades have not been tested.

General guidance on upgrading can be found for [self hosted mode]({{< ref self-hosted-upgrade >}}) and [Kubernetes]({{< ref kubernetes-upgrade >}}) deployments. It is best to review the target version release notes for specific guidance.

| Current Runtime version | Must upgrade through | Target Runtime version |
| ----------------------- | -------------------- | ---------------------- |
| 1.5.0 to 1.5.2          | N/A                  | 1.6.0                  |
|                         | 1.6.0                | 1.6.2                  |
|                         | 1.6.2                | 1.7.5                  |
|                         | 1.7.5                | 1.8.6                  |
|                         | 1.8.6                | 1.9.6                  |
|                         | 1.9.6                | 1.10.7                 |
| 1.6.0 to 1.6.2          | N/A                  | 1.7.5                  |
|                         | 1.7.5                | 1.8.6                  |
|                         | 1.8.6                | 1.9.6                  |
|                         | 1.9.6                | 1.10.7                 |
| 1.7.0 to 1.7.5          | N/A                  | 1.8.6                  |
|                         | 1.8.6                | 1.9.6                  |
|                         | 1.9.6                | 1.10.7                 |
| 1.8.0 to 1.8.6          | N/A                  | 1.9.6                  |
| 1.9.0                   | N/A                  | 1.9.6                  |
| 1.10.0                  | N/A                  | 1.10.8                 |
| 1.11.0                  | N/A                  | 1.11.4                 |
| 1.12.0                  | N/A                  | 1.12.4                 |



## 在托管平台上升级

Dapr can support multiple hosting platforms for production. With the 1.0 release the two supported platforms are Kubernetes and physical machines. For Kubernetes upgrades see [Production guidelines on Kubernetes]({{< ref kubernetes-production.md >}})

### Supported versions of dependencies

Below is a list of software that the latest version of Dapr (v{{% dapr-latest-version long="true" %}}) has been tested against.

| Dependency                                                                                            | Supported Version                                                                                                                 |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Kubernetes                                                                                            | Dapr support for Kubernetes is aligned with [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy/) |
| [Open Telemetry collector (OTEL)](https://github.com/open-telemetry/opentelemetry-collector/releases) | v0.4.0                                                                                                                            |
| [Prometheus](https://prometheus.io/download/)                                                         | v2.28                                                                                                                             |

## 相关链接

- Read the [Versioning Policy]({{< ref support-versioning.md >}})
- Read the [Breaking Changes and Deprecation Policy]({{< ref breaking-changes-and-deprecations.md >}})
