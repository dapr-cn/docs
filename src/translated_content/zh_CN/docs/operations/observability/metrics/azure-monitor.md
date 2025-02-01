---
type: docs
title: "操作指南：配置 Azure Monitor 以搜索日志和收集指标"
linkTitle: "Azure Monitor"
weight: 7000
description: "为 Azure Kubernetes Service (AKS) 启用 Dapr 指标和日志的 Azure Monitor"
---

## 前提条件

- [Azure Kubernetes Service](https://docs.microsoft.com/azure/aks/)
- [在 AKS 中启用 Azure Monitor For 容器](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-overview)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

## 使用配置映射启用 Prometheus 指标抓取

1. 确认 Azure Monitor Agents (AMA) 正在运行。

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

1. 使用配置映射启用 Prometheus 指标端点抓取。

   可以使用 [azm-config-map.yaml](/docs/azm-config-map.yaml) 来启用 Prometheus 指标端点抓取。

   如果 Dapr 安装在不同的命名空间，需要修改 `monitor_kubernetes_pod_namespaces` 数组的值。例如：

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

   应用配置映射：

   ```bash
   kubectl apply -f ./azm-config.map.yaml
   ```

## 安装带有 JSON 格式日志的 Dapr

1. 安装 Dapr 并启用 JSON 格式日志。

   ```bash
   helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
   ```

1. 在 Dapr sidecar 中启用 JSON 格式日志并添加 Prometheus 注解。

   > 注意：只有设置了 Prometheus 注解，Azure Monitor Agents (AMA) 才会发送指标。

   在部署的 YAML 文件中添加 `dapr.io/log-as-json: "true"` 注解。

   示例：

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

## 使用 Azure Monitor 搜索指标和日志

1. 在 Azure 门户中进入 Azure Monitor。

1. 搜索 Dapr **日志**。

   下面是一个示例查询，用于解析 JSON 格式日志并查询来自 Dapr 系统进程的日志。

   ```
   ContainerLog
   | extend parsed=parse_json(LogEntry)
   | project Time=todatetime(parsed['time']), app_id=parsed['app_id'], scope=parsed['scope'],level=parsed['level'], msg=parsed['msg'], type=parsed['type'], ver=parsed['ver'], instance=parsed['instance']
   | where level != ""
   | sort by Time
   ```

1. 搜索 **指标**。

   这个查询，查询 `process_resident_memory_bytes` Prometheus 指标用于 Dapr 系统进程并渲染时间图表。

   ```
   InsightsMetrics
   | where Namespace == "prometheus" and Name == "process_resident_memory_bytes"
   | extend tags=parse_json(Tags)
   | project TimeGenerated, Name, Val, app=tostring(tags['app'])
   | summarize memInBytes=percentile(Val, 99) by bin(TimeGenerated, 1m), app
   | where app startswith "dapr-"
   | render timechart
   ```

## 参考资料

- [使用 Azure Monitor for 容器配置 Prometheus 指标抓取](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-prometheus-integration)
- [为 Azure Monitor for 容器配置代理数据收集](https://docs.microsoft.com/azure/azure-monitor/insights/container-insights-agent-config)
- [Azure Monitor 查询](https://docs.microsoft.com/azure/azure-monitor/log-query/query-language)