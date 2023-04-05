---
type: docs
title: "操作方法：为 Dapr 日志记录设置 New Relic"
linkTitle: "New Relic"
weight: 2000
description: "为 Dapr 日志设置 New Relic"
---

## 先决条件

- 永久[免费的 New Relic 账户](https://newrelic.com/signup?ref=dapr)，100GB/月的免费数据摄取，1个免费全接入用户，无限制免费基本用户

## 背景

New Relic 提供了一个 [Fluent Bit](https://fluentbit.io/) 输出[插件](https://github.com/newrelic/newrelic-fluent-bit-output) ，可以轻松地将日志转发到 [New Relic Logs](https://github.com/newrelic/newrelic-fluent-bit-output)。 此插件也包含在一个独立的 Docker 镜像中，该镜像可以以 DaemonSet 的形式安装在 Kubernetes 集群中，我们称之为 Kubernetes 插件。

本文档介绍如何使用 Helm 图表（推荐）或通过应用 Kubernetes 清单手动将其安装到集群中。

## 安装

### 使用 Helm 图表进行安装（推荐）

1. 按照官方说明安装 Helm。

2. 按照这些说明添加 New Relic 官方 Helm 图表存储库

3. 运行以下命令，通过 Helm 安装 New Relic Logging Kubernetes 插件，用你的 [New Relic 许可证密钥](https://docs. newrelic. com/docs/accounts/accounts-billing/account-setup/new-relic-license-key/)替换占位符数值 YOUR_LICENSE_KEY。

- Helm 3
    ```bash
    helm install newrelic-logging newrelic/newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

- Helm 2
    ```bash
    helm install newrelic/newrelic-logging --name newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

对于欧盟用户，请在上述任何一个 Helm 安装命令中添加 `--set endpoint=https://log-api.eu.newrelic.com/log/v1`。

默认情况下，tailing 被设置为 /var/log/containers/*.log。 要更改此设置，请通过向上述任何 helm 安装命令添加 `--set fluentBit.path=DESIRED_PATH` 来提供您的首选路径。

### 安装 Kubernetes 清单

1. 将以下3个清单文件下载到你当前的工作目录中。

    ```bash
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/fluent-conf.yml > fluent-conf.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/new-relic-fluent-plugin.yml > new-relic-fluent-plugin.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/rbac.yml > rbac.yml
    ```

2. 在下载的 new-relic-fluent-plugin.yml 文件中，将占位符值 LICENSE_KEY 替换为你的 New Relic 许可证密钥。

    对于欧盟用户，将 ENDPOINT 环境变量改为 https://log-api.eu.newrelic.com/log/v1。

3. 添加许可证密钥后，在终端或命令行界面中运行以下命令：
    ```bash
    kubectl apply -f .
    ```

4. [可选] 你可以通过编辑 fluent-conf.yml 文件中的 parsers.conf 部分来配置插件如何解析数据。 更多信息请参见 Fluent Bit关于解析器配置的文档。

    默认情况下，tailing 被设置为 /var/log/containers/*.log。 要改变这一设置，在 new-relic-fluent-plugin.yml 文件中用你喜欢的路径替换默认路径。

## 查看日志

![Dapr 注释](/images/nr-logging-1.png)

![搜索](/images/nr-logging-2.png)

## 相关链接/参考资料

* [注册 New Relic 账户](https://newrelic.com/signup)
* [Telemetry 数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic 日志系统](https://github.com/newrelic/helm-charts/tree/master/charts/newrelic-logging)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/new-relic-alerts/learn-alerts/alerts-ai-transition-guide-2022/)
