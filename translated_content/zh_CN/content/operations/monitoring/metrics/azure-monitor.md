---
type: docs
title: "指南: 设置 Azure 监视器以搜索日志并收集指标"
linkTitle: "Azure Monitor"
weight: 2000
description: "使用Azure Monitor为Azure Kubernetes Service(AKS) 启用Dapr度量和日志"
---

## 先决条件

- [Azure Kubernetes Service](https://docs.microsoft.com/en-us/azure/aks/)
- [对AKS中的容器启用 Azure Monitor。](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm 3](https://helm.sh/)

## 使用config map启用 Prometheus 度量抓取

1. 请确保正在运行 omsagents

```bash
$ kubectl get pods -n kube-system
NAME                                                              READY   STATUS    RESTARTS   AGE
...
$ kubectl get pods -n kube-system
NAME                                                              READY   STATUS    RESTARTS   AGE
...
omsagent-75qjs                                                    1/1     Running   1          44h
omsagent-c7c4t                                                    1/1     Running   0          44h
omsagent-rs-74f488997c-dshpx                                      1/1     Running   1          44h
omsagent-smtk7                                                    1/1     Running   1          44h
...
```

2. 应用config map来启用Prometheus metrics endpoint抓取。

您可以使用 [azm-config-map.yaml](/docs/azm-config-map.yaml) 来启用 Prometheus 度量端点抓取。

如果你安装 Dapr 到不同的命名空间, 你需要更改 `monitor_kubernetes_pod_namespaces` 数组值。 例如:

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

应用config map：

```bash
kubectl apply -f ./azm-config.map.yaml
```

## 使用 JSON 格式化日志安装 Dapr

1. 使用 JSON 格式化日志启用 Dapr

```bash
helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
```

2. 启用 JSON 格式化日志到 Dapr sidecar 并添加 Prometheus 注释。

> 注意: OMS Agent仅在replicaset具有Prometheus注释时才抓取指标。

添加 `dapr.io/log-as-json: "true"` annotation 到你的部署yaml.

示例:
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

1. 前往Azure Monitor

2. 搜索 Dapr 日志

下面是一个示例查询，用于解析JSON格式的日志和来自Dapr系统进程的查询日志。

```
ContainerLog
| extend parsed=parse_json(LogEntry)
| project Time=todatetime(parsed['time']), app_id=parsed['app_id'], scope=parsed['scope'],level=parsed['level'], msg=parsed['msg'], type=parsed['type'], ver=parsed['ver'], instance=parsed['instance']
| where level != ""
| sort by Time
```

3. 搜索度量

这个语句查询process_resident_memory_bytes Prometheus度量的Dapr系统进程，并呈现时间图

```
InsightsMetrics
| where Namespace == "prometheus" and Name == "process_resident_memory_bytes"
| extend tags=parse_json(Tags)
| project TimeGenerated, Name, Val, app=tostring(tags['app'])
| summarize memInBytes=percentile(Val, 99) by bin(TimeGenerated, 1m), app
| where app startswith "dapr-"
| render timechart
```

# 参考资料

* [使用Azure Monitor为容器配置普Prometheus度量数据抓取](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-prometheus-integration)
* [配置用于容器的 Azure Monitor的代理数据收集](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-agent-config)
* [Azure Monitor 查询](https://docs.microsoft.com/en-us/azure/azure-monitor/log-query/query-language)
