---
type: docs
title: "如何：设置New Relic来收集和分析指标"
linkTitle: "New Relic"
weight: 6000
description: "为Dapr指标设置New Relic"
---

## 先决条件

- 永久[免费的New Relic账户](https://newrelic.com/signup?ref=dapr)，100GB/月的免费数据摄取，1个免费全接入用户，无限制免费基本用户

## 背景

New Relic提供了Prometheus OpenMetrics集成。

本文档说明如何使用 Helm 图表（推荐）在群集中安装它。

## 安装

1. 按照官方说明安装 Helm。

2. 按照[这些说明](https://github.com/newrelic/helm-charts/blob/master/README.md#installing-charts)添加 New Relic 官方 Helm 图表存储库

3. 运行以下命令通过 Helm 安装 New Relic Logging Kubernetes 插件，将占位符值YOUR_LICENSE_KEY替换为 [New Relic 许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key)：

    ```bash
    helm install nri-prometheus newrelic/nri-prometheus --set licenseKey=YOUR_LICENSE_KEY
    ```

## View Metrics

![Dapr Metrics](/images/nr-metrics-1.png)

![Dashboard](/images/nr-dashboard-dapr-metrics-1.png)

## Related Links/References

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry Data Platform](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Prometheus OpenMetrics Integration](https://github.com/newrelic/helm-charts/tree/master/charts/nri-prometheus)
* [Types of New Relic API keys](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [Alerts and Applied Intelligence](https://docs.newrelic.com/docs/alerts-applied-intelligence)
