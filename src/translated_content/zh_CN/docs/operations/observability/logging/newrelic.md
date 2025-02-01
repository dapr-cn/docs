---
type: docs
title: "操作指南：为 Dapr 日志配置 New Relic"
linkTitle: "New Relic"
weight: 3000
description: "为 Dapr 日志配置 New Relic"
---

## 前提条件

- 注册一个 [New Relic 账户](https://newrelic.com/signup?ref=dapr)，享受每月 100 GB 的免费数据摄取、1 个免费完全访问用户和无限制的免费基本用户。

## 背景

New Relic 提供了一个 [Fluent Bit](https://fluentbit.io/) 输出 [插件](https://github.com/newrelic/newrelic-fluent-bit-output)，可以轻松地将日志转发到 [New Relic Logs](https://github.com/newrelic/newrelic-fluent-bit-output)。该插件也可以作为独立的 Docker 镜像使用，并在 Kubernetes 集群中以 DaemonSet 的形式安装，我们称之为 Kubernetes 插件。

本文档将解释如何在集群中安装此插件，推荐使用 Helm chart，也可以通过应用 Kubernetes 清单手动安装。

## 安装

### 使用 Helm chart 安装（推荐）

1. 按照官方说明安装 Helm。

2. 添加 New Relic 官方 Helm chart 仓库。

3. 运行以下命令通过 Helm 安装 New Relic Logging Kubernetes 插件，并将占位符 YOUR_LICENSE_KEY 替换为您的 [New Relic 许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key/)：

- Helm 3
    ```bash
    helm install newrelic-logging newrelic/newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

- Helm 2
    ```bash
    helm install newrelic/newrelic-logging --name newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

对于欧盟用户，请在上述命令中添加 `--set endpoint=https://log-api.eu.newrelic.com/log/v1`。

默认情况下，日志跟踪路径设置为 /var/log/containers/*.log。要更改此设置，请在上述命令中添加 --set fluentBit.path=DESIRED_PATH，并提供您首选的路径。

### 安装 Kubernetes 清单

1. 下载以下 3 个清单文件到当前工作目录：

    ```bash
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/fluent-conf.yml > fluent-conf.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/new-relic-fluent-plugin.yml > new-relic-fluent-plugin.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/rbac.yml > rbac.yml
    ```

2. 在下载的 new-relic-fluent-plugin.yml 文件中，将占位符 LICENSE_KEY 替换为您的 New Relic 许可证密钥。

    对于欧盟用户，将 ENDPOINT 环境变量替换为 https://log-api.eu.newrelic.com/log/v1。

3. 添加许可证密钥后，在终端或命令行界面中运行以下命令：
    ```bash
    kubectl apply -f .
    ```

4. [可选] 您可以通过编辑 fluent-conf.yml 文件中的 parsers.conf 部分来配置插件如何解析数据。有关更多信息，请参阅 Fluent Bit 的 Parsers 配置文档。

    默认情况下，日志跟踪路径设置为 /var/log/containers/*.log。要更改此设置，请在 new-relic-fluent-plugin.yml 文件中将默认路径替换为您首选的路径。

## 查看日志

![Dapr 注释](/images/nr-logging-1.png)

![搜索](/images/nr-logging-2.png)

## 相关链接/参考

* [New Relic 账户注册](https://newrelic.com/signup)
* [遥测数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Logging](https://github.com/newrelic/helm-charts/tree/master/charts/newrelic-logging)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和应用智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
