---
type: docs
title: "支持的版本"
linkTitle: "支持的版本"
weight: 2000
description: "发布支持和升级策略"
---

## 介绍
本主题详细介绍了 Dapr 版本受支持的版本、升级策略以及如何传达弃用和重大更改。

Dapr 版本使用 `MAJOR.MINOR.PATCH` 版本控制。 例如 1.0.0

  * `PATCH` 版本会递增，以进行错误和安全热修复。
  * `MINOR` 版本作为常规发布节奏的一部分进行更新，包括新功能，错误和安全修复。
  * `MAJOR` 版本在运行时发生不向后兼容的更改（如 API 更改）时更新。  `MAJOR` 版本也可能发生，然后会考虑与先前版本区分开来的重大功能添加/更改。

支持的版本意味着:

- 如果发布版本存在关键问题（如主线损坏情况或安全问题），则会发布 hoxfix 修补程序。 其中每一项都是根据具体情况进行审查的。
- 将调查受支持版本的问题。 如果某个版本不再受支持，则需要升级到较新的版本，并确定该问题是否仍然相关。

From the 1.0.0 release onwards two (2) versions of Dapr are supported; the current and previous versions. Typically these are `MINOR`release updates. This means that there is a rolling window that moves forward for supported releases and it is your operational responsibility to remain up to date with these supported versions. If you have an older version of Dapr you may have to do intermediate upgrades to get to a supported version.

There will be at least 6 weeks between major.minor version releases giving users a 12 week (3 month) rolling window for upgrading.

Patch support is for supported versions (current and previous).

## Supported versions
The table below shows the versions of Dapr releases that have been tested together and form a "packaged" release. Any other combinations of releases are not supported.

| 发布日期          |  Runtime   | CLI   | SDK                                                                                     | Dashboard | 状态     |
| ------------- |:----------:|:----- | --------------------------------------------------------------------------------------- | --------- | ------ |
| 2021年2月17日    | 1.0.0</br> | 1.0.0 | Java 1.0.0 </br>Go 1.0.0 </br>PHP 1.0.0 </br>Python 1.0.0 </br>.NET 1.0.0               | 0.6.0     | 不受支持   |
| 2021年3月4日     | 1.0.1</br> | 1.0.1 | Java 1.0.2 </br>Go 1.0.0 </br>PHP 1.0.0 </br>Python 1.0.0 </br>.NET 1.0.0               | 0.6.0     | 不受支持   |
| 2021年4月1日     | 1.1.0</br> | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0               | 0.6.0     | 不受支持   |
| 2021年4月6日     | 1.1.1</br> | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0               | 0.6.0     | 不受支持   |
| 2021年4月16日    | 1.1.2</br> | 1.1.0 | Java 1.0.2 </br>Go 1.1.0 </br>PHP 1.0.0 </br>Python 1.1.0 </br>.NET 1.1.0               | 0.6.0     | 不受支持   |
| 2021年5月26日    | 1.2.0</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0               | 0.6.0     | 不受支持   |
| Jun 16th 2021 | 1.2.1</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0               | 0.6.0     | 不受支持   |
| Jun 16th 2021 | 1.2.2</br> | 1.2.0 | Java 1.1.0 </br>Go 1.1.0 </br>PHP 1.1.0 </br>Python 1.1.0 </br>.NET 1.2.0               | 0.6.0     | 不受支持   |
| Jul 26th 2021 |  1.3</br>  | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0               | 0.7.0     | 不受支持   |
| Sep 14th 2021 | 1.3.1</br> | 1.3.0 | Java 1.2.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.2.0 </br>.NET 1.3.0               | 0.7.0     | 不受支持   |
| Sep 15th 2021 |  1.4</br>  | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0               | 0.8.0     | 支持     |
| Sep 22nd 2021 | 1.4.1</br> | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0               | 0.8.0     | 支持     |
| Sep 24th 2021 | 1.4.2</br> | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0               | 0.8.0     | 支持     |
| Oct 7th 2021  | 1.4.3</br> | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0               | 0.8.0     | 支持     |
| Dev 6th 2021  | 1.4.4</br> | 1.4.0 | Java 1.3.0 </br>Go 1.2.0 </br>PHP 1.1.0 </br>Python 1.3.0 </br>.NET 1.4.0               | 0.8.0     | 支持     |
| Nov 11th 2021 | 1.5.0</br> | 1.5.0 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0     | 支持（当前） |
| Dec 6th 2021  | 1.5.1</br> | 1.5.1 | Java 1.3.0 </br>Go 1.3.0 </br>PHP 1.1.0 </br>Python 1.4.0 </br>.NET 1.5.0 </br>JS 1.0.2 | 0.9.0     | 支持（当前） |

## Upgrade paths
After the 1.0 release of the runtime there may be situations where it is necessary to explicitly upgrade through an additional release to reach the desired target. For example an upgrade from v1.0 to v1.2 may need go pass through v1.1

The table below shows the tested upgrade paths for the Dapr runtime. Any other combinations of upgrades have not been tested.

General guidance on upgrading can be found for [self hosted mode]({{<ref self-hosted-upgrade>}}) and [Kubernetes]({{<ref kubernetes-upgrade>}}) deployments. It is best to review the target version release notes for specific guidance.

| Current Runtime version | Must upgrade through | Target Runtime version |
| ----------------------- | -------------------- | ---------------------- |
| 1.0.0 or 1.0.1          | N/A                  | 1.1.2                  |
|                         | 1.1.2                | 1.2.2                  |
|                         | 1.2.2                | 1.3.1                  |
|                         | 1.3.1                | 1.4.4                  |
|                         | 1.4.4                | 1.5.1                  |
| 1.1.0 to 1.1.2          | N/A                  | 1.2.2                  |
|                         | 1.2.2                | 1.3.1                  |
|                         | 1.3.1                | 1.4.4                  |
|                         | 1.4.4                | 1.5.1                  |
| 1.2.0 to 1.2.2          | N/A                  | 1.3.1                  |
|                         | 1.3.1                | 1.4.4                  |
|                         | 1.4.4                | 1.5.1                  |
| 1.3.0                   | N/A                  | 1.3.1                  |
|                         | 1.3.1                | 1.4.4                  |
|                         | 1.4.4                | 1.5.1                  |
| 1.3.1                   | N/A                  | 1.4.4                  |
|                         | 1.4.4                | 1.5.0                  |
| 1.4.0 to 1.4.2          | N/A                  | 1.4.4                  |
|                         | 1.4.4                | 1.5.1                  |

## Feature and deprecations
There is a process for announcing feature deprecations.  Deprecations are applied two (2) releases after the release in which they were announced. For example Feature X is announced to be deprecated in the 1.0.0 release notes and will then be removed in 1.2.0.

Deprecations appear in release notes under a section named “Deprecations”, which indicates:
- The point in the future the now-deprecated feature will no longer be supported. For example release x.y.z.  This is at least two (2) releases prior.
- Document any steps the user must take to modify their code, operations, etc if applicable in the release notes.

After announcing a future breaking change, the change will happen in 2 releases or 6 months, whichever is greater. Deprecated features should respond with warning but do nothing otherwise.

### Announced deprecations
| 特性                                                                           | 废弃通知  | 移除    |
| ---------------------------------------------------------------------------- | ----- | ----- |
| GET /v1.0/shutdown API (用户应该使用 [POST API]({{< ref kubernetes-job.md >}}) 替代) | 1.2.0 | 1.4.0 |

## Upgrade on Hosting platforms
Dapr can support multiple hosting platforms for production. With the 1.0 release the two supported platforms are Kubernetes and physical machines. For Kubernetes upgrades see [Production guidelines on Kubernetes]({{< ref kubernetes-production.md >}})

### Supported Kubernetes versions

Dapr follows [Kubernetes Version Skew Policy](https://kubernetes.io/releases/version-skew-policy).

## 相关链接
* Read the [Versioning policy]({{< ref support-versioning.md >}})
