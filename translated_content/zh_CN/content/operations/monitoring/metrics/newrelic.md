---
type: docs
title: "如何：设置 New Relic 来收集和分析指标"
linkTitle: "New Relic"
weight: 6000
description: "为 Dapr 指标设置 New Relic"
---

## 先决条件

- 永久[免费的 New Relic 账户](https://newrelic.com/signup?ref=dapr)，100GB/月的免费数据摄取，1个免费全接入用户，无限制免费基本用户

## 背景

New Relic 提供了 Prometheus OpenMetrics 集成。

本文档说明如何使用 Helm 图表（推荐）在群集中安装它。

## 安装

1. 按照官方说明安装 Helm。

2. 按照[这些说明](https://github.com/newrelic/helm-charts/blob/master/README.md#installing-charts)添加 New Relic 官方 Helm 图表存储库

3. 运行以下命令通过 Helm 安装 New Relic Logging Kubernetes 插件，将占位符值 YOUR_LICENSE_KEY 替换为 [New Relic 许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key)：

    ```bash
    helm install nri-prometheus newrelic/nri-prometheus --set licenseKey=YOUR_LICENSE_KEY
    ```

## 查看指标

![Dapr Metrics](/images/nr-metrics-1.png)

![仪表盘](/images/nr-dashboard-dapr-metrics-1.png)

## 相关链接/参考资料

* [注册 New Relic 账户](https://newrelic.com/signup)
* [Telemetry 数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic 与 Prometheus OpenMetrics 集成。](https://github.com/newrelic/helm-charts/tree/master/charts/nri-prometheus)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和智能](https://docs.newrelic.com/docs/alerts-applied-intelligence)
