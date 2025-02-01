---
type: docs
title: "操作指南：配置 New Relic 以收集和分析指标"
linkTitle: "New Relic"
weight: 6000
description: "为 Dapr 指标配置 New Relic"
---

## 前提条件

- [New Relic 账户](https://newrelic.com/signup?ref=dapr)，永久免费，每月提供 100 GB 的免费数据摄取，1 个免费完全访问用户，无限制的免费基本用户

## 背景信息

New Relic 支持 Prometheus 的 OpenMetrics 集成。

本文档将介绍如何在集群中安装该集成，建议使用 Helm chart 进行安装。

## 安装步骤

1. 根据官方说明安装 Helm。

2. 按照[这些说明](https://github.com/newrelic/helm-charts/blob/master/README.md#installing-charts)添加 New Relic 官方 Helm chart 仓库。

3. 运行以下命令通过 Helm 安装 New Relic Logging Kubernetes 插件，并将 YOUR_LICENSE_KEY 替换为您的 [New Relic 许可证密钥](https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/new-relic-license-key)：

    ```bash
    helm install nri-prometheus newrelic/nri-prometheus --set licenseKey=YOUR_LICENSE_KEY
    ```

## 查看指标

![Dapr 指标](/images/nr-metrics-1.png)

![仪表板](/images/nr-dashboard-dapr-metrics-1.png)

## 相关链接/参考

* [New Relic 账户注册](https://newrelic.com/signup)
* [遥测数据平台](https://newrelic.com/platform/telemetry-data-platform)
* [New Relic Prometheus OpenMetrics 集成](https://github.com/newrelic/helm-charts/tree/master/charts/nri-prometheus)
* [New Relic API 密钥类型](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/)
* [警报和应用智能](https://docs.newrelic.com/docs/alerts-applied-intelligence/overview/)
