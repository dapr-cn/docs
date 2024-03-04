---
type: docs
title: "操作方法：为 Dapr 日志记录设置 New Relic"
linkTitle: "New Relic"
weight: 3000
description: "为 Dapr 日志设置 New Relic"
---

## 前期准备

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## 背景

New Relic offers a [Fluent Bit](https://fluentbit.io/) output [plugin](https://github.com/newrelic/newrelic-fluent-bit-output) to easily forward your logs to [New Relic Logs](https://github.com/newrelic/newrelic-fluent-bit-output). This plugin is also provided in a standalone Docker image that can be installed in a Kubernetes cluster in the form of a DaemonSet, which we refer as the Kubernetes plugin.

本文档介绍如何使用 Helm 图表（推荐）或通过应用 Kubernetes 清单手动将其安装到集群中。

## 安装

### Install using the Helm chart (recommended)

1. Install Helm following the official instructions.

2. Add the New Relic official Helm chart repository following these instructions

3. Run the following command to install the New Relic Logging Kubernetes plugin via Helm, replacing the placeholder value YOUR_LICENSE_KEY with your [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key/):

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

1. Download the following 3 manifest files into your current working directory:

    ```bash
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/fluent-conf.yml > fluent-conf.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/new-relic-fluent-plugin.yml > new-relic-fluent-plugin.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/rbac.yml > rbac.yml
    ```

2. In the downloaded new-relic-fluent-plugin.yml file, replace the placeholder value LICENSE_KEY with your New Relic license key.

    对于欧盟用户，将 ENDPOINT 环境变量改为 https://log-api.eu.newrelic.com/log/v1。

3. 添加许可证密钥后，在终端或命令行界面中运行以下命令：
    ```bash
    kubectl apply -f .
    ```

4. [OPTIONAL] You can configure how the plugin parses the data by editing the parsers.conf section in the fluent-conf.yml file. For more information, see Fluent Bit's documentation on Parsers configuration.

    默认情况下，tailing 被设置为 /var/log/containers/*.log。 要改变这一设置，在 new-relic-fluent-plugin.yml 文件中用你喜欢的路径替换默认路径。

## 查看日志

![Dapr 注释](/images/nr-logging-1.png)

![搜索](/images/nr-logging-2.png)

## 相关链接/参考资料

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry 数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic 日志系统](https://github.com/newrelic/helm-charts/tree/master/charts/newrelic-logging)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和应用智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
