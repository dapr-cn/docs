---
type: docs
title: "操作方法: 设置 Azure Monitor 以搜索日志并收集指标"
linkTitle: "Azure Monitor"
weight: 7000
description: "使用 Azure Monitor为 Azure Kubernetes Service(AKS) 启用 Dapr 度量和日志"
---

## 前期准备

- [Azure Kubernetes Service](https://docs.microsoft.com/azure/aks/)
- [Enable Azure Monitor For containers in AKS](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-overview)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

## 使用config map启用 Prometheus 度量抓取

1. Make sure that Azure Monitor Agents (AMA) are running.

   ```bash
   $ kubectl get pods -n kube-system
   NAME                                                  READY   STATUS    RESTARTS   AGE
   ...
   ama-logs-48kpv                                        2/2     Running   0          2d13h
   ama-logs-mx24c                                        2/2     Running   0          2d13h
   ama-logs-rs-f9bbb9898-vbt6k                           1/1     Running   0          30h
   ama-logs-sm2mz                                        2/2     Running   0          2d13h
   ama-logs-z7p4c                                        2/2     Running   0          2d13h
   ...
   ```

1. 应用 config map 来启用 Prometheus metrics endpoint 抓取。

  You can use [azm-config-map.yaml](/docs/azm-config-map.yaml) to enable Prometheus metrics endpoint scrape.

  If you installed Dapr to a different namespace, you need to change the `monitor_kubernetes_pod_namespaces` array values. For example:

   ```yaml
   ...
     prometheus-data-collection-settings: |-
       [prometheus_data_collection_settings.cluster]
           interval = "1m"
           monitor_kubernetes_pods = true
           monitor_kubernetes_pods_namespaces = ["dapr-system", "default"]
       [prometheus_data_collection_settings.node]
           interval = "1m"
   ...
   ```

  应用 config map：

   ```bash
   kubectl apply -f ./azm-config.map.yaml
   ```

## Install Dapr with JSON formatted logs

1. Install Dapr with enabling JSON-formatted logs.

   ```bash
   helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
   ```

1. 启用 JSON 格式化日志到 Dapr sidecar 并添加 Prometheus 注释。

  > Note: The Azure Monitor Agents (AMA) only sends the metrics if the Prometheus annotations are set.

  添加 `dapr.io/log-as-json: "true"` annotation 到你的部署yaml.

  示例︰

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: pythonapp
     namespace: default
     labels:
       app: python
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: python
     template:
       metadata:
         labels:
           app: python
         annotations:
           dapr.io/enabled: "true"
           dapr.io/app-id: "pythonapp"
           dapr.io/log-as-json: "true"
           prometheus.io/scrape: "true"
           prometheus.io/port: "9090"
           prometheus.io/path: "/"

   ...
   ```

## 用 Azure Monitor 搜索度量和日志

1. Go to Azure Monitor in the Azure portal.

1. Search Dapr **Logs**.

  Here is an example query, to parse JSON formatted logs and query logs from Dapr system processes.

   ```
   ContainerLog
   | extend parsed=parse_json(LogEntry)
   | project Time=todatetime(parsed['time']), app_id=parsed['app_id'], scope=parsed['scope'],level=parsed['level'], msg=parsed['msg'], type=parsed['type'], ver=parsed['ver'], instance=parsed['instance']
   | where level != ""
   | sort by Time
   ```

1. Search **Metrics**.

  This query, queries `process_resident_memory_bytes` Prometheus metrics for Dapr system processes and renders timecharts.

   ```
   InsightsMetrics
   | where Namespace == "prometheus" and Name == "process_resident_memory_bytes"
   | extend tags=parse_json(Tags)
   | project TimeGenerated, Name, Val, app=tostring(tags['app'])
   | summarize memInBytes=percentile(Val, 99) by bin(TimeGenerated, 1m), app
   | where app startswith "dapr-"
   | render timechart
   ```

## 参考

- [Configure scraping of Prometheus metrics with Azure Monitor for containers](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-prometheus-integration)
- [配置用于容器的 Azure Monitor 的代理数据收集](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-agent-config)
- [Azure Monitor 查询](https://docs.microsoft.com/azure/azure-monitor/log-query/query-language)
