---
type: docs
title: "操作指南：使用 Prometheus 监控指标"
linkTitle: "Prometheus"
weight: 4000
description: "使用 Prometheus 收集与 Dapr 运行时执行相关的时间序列数据"
---

## 本地设置 Prometheus
在本地计算机上，您可以选择[安装并作为进程运行](#install) Prometheus，或者将其作为[Docker 容器运行](#Run-as-Container)。

### 安装
{{% alert title="注意" color="warning" %}}
如果您计划将 Prometheus 作为 Docker 容器运行，则无需单独安装 Prometheus。请参阅[容器](#run-as-container)部分的说明。
{{% /alert %}}

请按照[此处](https://prometheus.io/docs/prometheus/latest/getting_started/)提供的步骤，根据您的操作系统安装 Prometheus。

### 配置
安装完成后，您需要创建一个配置文件。

以下是一个示例 Prometheus 配置，请将其保存为文件，例如 `/tmp/prometheus.yml` 或 `C:\Temp\prometheus.yml`：
```yaml
global:
  scrape_interval:     15s # 默认情况下，每 15 秒收集一次指标。

# 包含一个收集端点的配置：
# 这里是 Prometheus 自身。
scrape_configs:
  - job_name: 'dapr'

    # 覆盖全局默认值，每 5 秒从此 job 收集指标。
    scrape_interval: 5s

    static_configs:
      - targets: ['localhost:9090'] # 如果不是默认值，请替换为 Dapr 指标端口
```

### 作为进程运行
使用您的配置文件运行 Prometheus，以开始从指定目标收集指标。
```bash
./prometheus --config.file=/tmp/prometheus.yml --web.listen-address=:8080
```
> 我们更改了端口以避免与 Dapr 自身的指标端点冲突。

如果您当前没有运行 Dapr 应用程序，目标将显示为离线。要开始收集指标，您必须启动 Dapr，并确保其指标端口与配置中指定的目标一致。

一旦 Prometheus 运行，您可以通过访问 `http://localhost:8080` 来查看其仪表板。

### 作为容器运行
要在本地计算机上将 Prometheus 作为 Docker 容器运行，首先确保已安装并运行 [Docker](https://docs.docker.com/install/)。

然后可以使用以下命令将 Prometheus 作为 Docker 容器运行：
```bash
docker run \
    --net=host \
    -v /tmp/prometheus.yml:/etc/prometheus/prometheus.yml \
    prom/prometheus --config.file=/etc/prometheus/prometheus.yml --web.listen-address=:8080
```
`--net=host` 确保 Prometheus 实例能够连接到在主机上运行的任何 Dapr 实例。如果您计划也在容器中运行 Dapr 应用程序，则需要在共享的 Docker 网络上运行它们，并使用正确的目标地址更新配置。

一旦 Prometheus 运行，您可以通过访问 `http://localhost:8080` 来查看其仪表板。

## 在 Kubernetes 上设置 Prometheus

### 先决条件

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

### 安装 Prometheus

1. 首先创建一个命名空间，用于部署 Grafana 和 Prometheus 监控工具

```bash
kubectl create namespace dapr-monitoring
```

2. 安装 Prometheus

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install dapr-prom prometheus-community/prometheus -n dapr-monitoring
```

如果您是 Minikube 用户或想要禁用持久卷以进行开发，可以使用以下命令禁用它。

```bash
helm install dapr-prom prometheus-community/prometheus -n dapr-monitoring
 --set alertmanager.persistence.enabled=false --set pushgateway.persistentVolume.enabled=false --set server.persistentVolume.enabled=false
```

要自动发现 Dapr 目标（服务发现），请使用：

```bash
  helm install dapr-prom prometheus-community/prometheus -f values.yaml -n dapr-monitoring --create-namespace
```

### `values.yaml` 文件

```yaml
alertmanager:
  persistence:
    enabled: false
pushgateway:
  persistentVolume:
    enabled: false
server:
  persistentVolume:
    enabled: false

# 向 prometheus.yml 添加额外的收集配置
# 使用服务发现找到 Dapr 和 Dapr sidecar 目标
extraScrapeConfigs: |-
  - job_name: dapr-sidecars
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - action: keep
        regex: "true"
        source_labels:
          - __meta_kubernetes_pod_annotation_dapr_io_enabled
      - action: keep
        regex: "true"
        source_labels:
          - __meta_kubernetes_pod_annotation_dapr_io_enable_metrics
      - action: replace
        replacement: ${1}
        source_labels:
          - __meta_kubernetes_namespace
        target_label: namespace
      - action: replace
        replacement: ${1}
        source_labels:
          - __meta_kubernetes_pod_name
        target_label: pod
      - action: replace
        regex: (.*);daprd
        replacement: ${1}-dapr
        source_labels:
          - __meta_kubernetes_pod_annotation_dapr_io_app_id
          - __meta_kubernetes_pod_container_name
        target_label: service
      - action: replace
        replacement: ${1}:9090
        source_labels:
          - __meta_kubernetes_pod_ip
        target_label: __address__

  - job_name: dapr
    kubernetes_sd_configs:
      - role: pod
    relabel_configs:
      - action: keep
        regex: dapr
        source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_name
      - action: keep
        regex: dapr
        source_labels:
          - __meta_kubernetes_pod_label_app_kubernetes_io_part_of
      - action: replace
        replacement: ${1}
        source_labels:
          - __meta_kubernetes_pod_label_app
        target_label: app
      - action: replace
        replacement: ${1}
        source_labels:
          - __meta_kubernetes_namespace
        target_label: namespace
      - action: replace
        replacement: ${1}
        source_labels:
          - __meta_kubernetes_pod_name
        target_label: pod
      - action: replace
        replacement: ${1}:9090
        source_labels:
          - __meta_kubernetes_pod_ip
        target_label: __address__
```

3. 验证

确保 Prometheus 在您的集群中运行。

```bash
kubectl get pods -n dapr-monitoring
```

预期输出：

```bash
NAME                                                READY   STATUS    RESTARTS   AGE
dapr-prom-kube-state-metrics-9849d6cc6-t94p8        1/1     Running   0          4m58s
dapr-prom-prometheus-alertmanager-749cc46f6-9b5t8   2/2     Running   0          4m58s
dapr-prom-prometheus-node-exporter-5jh8p            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-88gbg            1/1     Running   0          4m58s
dapr-prom-prometheus-node-exporter-bjp9f            1/1     Running   0          4m58s
dapr-prom-prometheus-pushgateway-688665d597-h4xx2   1/1     Running   0          4m58s
dapr-prom-prometheus-server-694fd8d7c-q5d59         2/2     Running   0          4m58s
```

### 访问 Prometheus 仪表板

要查看 Prometheus 仪表板并检查服务发现：

```bash
kubectl port-forward svc/dapr-prom-prometheus-server 9090:80 -n dapr-monitoring
```

打开浏览器并访问 `http://localhost:9090`。导航到 **Status** > **Service Discovery** 以验证 Dapr 目标是否被正确发现。

<img src="/images/prometheus-web-ui.png" alt="Prometheus Web UI" width="1200">

您可以看到 `job_name` 及其发现的目标。

<img src="/images/prometheus-service-discovery.png" alt="Prometheus Service Discovery" width="1200">

## 示例

<div class="embed-responsive embed-responsive-16by9">
    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8W-iBDNvCUM?start=2577" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 参考资料

* [Prometheus 安装](https://github.com/prometheus-community/helm-charts)
* [Prometheus 查询语言](https://prometheus.io/docs/prometheus/latest/querying/basics/)
