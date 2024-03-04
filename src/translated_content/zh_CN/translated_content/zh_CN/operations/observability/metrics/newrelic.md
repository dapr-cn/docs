---
type: docs
title: "如何：设置 New Relic 来收集和分析指标"
linkTitle: "New Relic"
weight: 6000
description: "为 Dapr 指标设置 New Relic"
---

## 前期准备

- Perpetually [free New Relic account](https://newrelic.com/signup?ref=dapr), 100 GB/month of free data ingest, 1 free full access user, unlimited free basic users

## 背景

New Relic offers a Prometheus OpenMetrics Integration.

本文档说明如何使用 Helm 图表（推荐）在群集中安装它。

## 安装

1. Install Helm following the official instructions.

2. 按照[这些说明](https://github.com/newrelic/helm-charts/blob/master/README.md#installing-charts)添加 New Relic 官方 Helm 图表存储库

3. 运行以下命令通过 Helm 安装 New Relic Logging Kubernetes 插件，将占位符值 YOUR_LICENSE_KEY 替换为 [New Relic 许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key)：

    ```bash
    helm install nri-prometheus newrelic/nri-prometheus --set licenseKey=YOUR_LICENSE_KEY
    ```

## 查看指标

![Dapr 指标](/images/nr-metrics-1.png)

![Dashboard](/images/nr-dashboard-dapr-metrics-1.png)

## 相关链接/参考资料

* [New Relic Account Signup](https://newrelic.com/signup)
* [Telemetry 数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic 与 Prometheus OpenMetrics 集成。](https://github.com/newrelic/helm-charts/tree/master/charts/nri-prometheus)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和应用智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
