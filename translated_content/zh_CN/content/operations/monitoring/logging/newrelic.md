---
type: docs
title: "How-To: Set-up New Relic for Dapr logging"
linkTitle: "New Relic"
weight: 2000
description: "Set-up New Relic for Dapr logging"
---

## 先决条件

- 永久[免费的New Relic账户](https://newrelic.com/signup?ref=dapr)，100GB/月的免费数据摄取，1个免费全接入用户，无限制免费基本用户

## 背景

New Relic提供了一个 [Fluent Bit](https://fluentbit.io/) 输出 [插件](https://github.com/newrelic/newrelic-fluent-bit-output) ，可以轻松地将日志转发到 [New Relic Logs](https://github.com/newrelic/newrelic-fluent-bit-output)。 此插件也包含在一个独立的 Docker 映像中，该映像可以以 DaemonSet 的形式安装在 Kubernetes 集群中，我们称之为 Kubernetes 插件。

本文档介绍如何使用 Helm 图表（推荐）或通过应用 Kubernetes 清单手动将其安装到集群中。

## 安装

### 使用 Helm 图表进行安装（推荐）

1. 按照官方说明安装 Helm。

2. 按照这些说明添加 New Relic 官方 Helm 图表存储库

3. Run the following command to install the New Relic Logging Kubernetes plugin via Helm, replacing the placeholder value YOUR_LICENSE_KEY with your [New Relic license key](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key/):

- Helm 3
    ```bash
    helm install newrelic-logging newrelic/newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

- Helm 2
    ```bash
    helm install newrelic/newrelic-logging --name newrelic-logging --set licenseKey=YOUR_LICENSE_KEY
    ```

For EU users, add `--set endpoint=https://log-api.eu.newrelic.com/log/v1 to any of the helm install commands above.

By default, tailing is set to /var/log/containers/*.log. To change this setting, provide your preferred path by adding --set fluentBit.path=DESIRED_PATH to any of the helm install commands above.

### Install the Kubernetes manifest

1. Download the following 3 manifest files into your current working directory:

    ```bash
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/fluent-conf.yml > fluent-conf.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/new-relic-fluent-plugin.yml > new-relic-fluent-plugin.yml
    curl https://raw.githubusercontent.com/newrelic/helm-charts/master/charts/newrelic-logging/k8s/rbac.yml > rbac.yml
    ```

2. In the downloaded new-relic-fluent-plugin.yml file, replace the placeholder value LICENSE_KEY with your New Relic license key.

    For EU users, replace the ENDPOINT environment variable to https://log-api.eu.newrelic.com/log/v1.

3. Once the License key has been added, run the following command in your terminal or command-line interface:
    ```bash
    kubectl apply -f .
    ```

4. [OPTIONAL] You can configure how the plugin parses the data by editing the parsers.conf section in the fluent-conf.yml file. For more information, see Fluent Bit's documentation on Parsers configuration.

    By default, tailing is set to /var/log/containers/*.log. To change this setting, replace the default path with your preferred path in the new-relic-fluent-plugin.yml file.

## View Logs

![Dapr Annotations](/images/nr-logging-1.png)

![Search](/images/nr-logging-2.png)

## Related Links/References

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Logging](https://github.com/newrelic/helm-charts/tree/master/charts/newrelic-logging)
* [Types of New Relic API keys](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence)
