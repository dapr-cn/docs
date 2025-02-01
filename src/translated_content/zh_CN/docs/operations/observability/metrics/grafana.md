---
type: docs
title: "如何使用Grafana监控指标"
linkTitle: "Grafana仪表板"
weight: 5000
description: "在Grafana仪表板中查看Dapr指标的方法。"
---

## 可用的仪表板

{{< tabs "系统服务" "sidecar" "actor" >}}

{{% codetab %}}
`grafana-system-services-dashboard.json`模板展示了Dapr系统组件的状态，包括dapr-operator、dapr-sidecar-injector、dapr-sentry和dapr-placement：

<img src="/images/grafana-system-service-dashboard.png" alt="系统服务仪表板的截图" width=1200>
{{% /codetab %}}

{{% codetab %}}
`grafana-sidecar-dashboard.json`模板展示了Dapr sidecar 的状态，包括sidecar 的健康状况/资源使用情况、HTTP和gRPC的吞吐量/延迟、actor、mTLS等：

<img src="/images/grafana-sidecar-dashboard.png" alt="sidecar仪表板的截图" width=1200>
{{% /codetab %}}

{{% codetab %}}
`grafana-actor-dashboard.json`模板展示了Dapr sidecar 的状态、actor 调用的吞吐量/延迟、timer/reminder触发器和基于回合的并发性：

<img src="/images/grafana-actor-dashboard.png" alt="actor仪表板的截图" width=1200>
{{% /codetab %}}

{{< /tabs >}}

## 前提条件

- [设置Prometheus]({{<ref prometheus.md>}})

## 在Kubernetes上设置

### 安装Grafana

1. 添加Grafana Helm仓库：

   ```bash
   helm repo add grafana https://grafana.github.io/helm-charts
   helm repo update
   ```

1. 安装图表：

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring
   ```

   {{% alert title="注意" color="primary" %}}
   如果您使用Minikube或希望在开发中禁用持久卷，可以使用以下命令禁用：

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring --set persistence.enabled=false
   ```
   {{% /alert %}}

1. 获取Grafana登录的管理员密码：

   ```bash
   kubectl get secret --namespace dapr-monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```

   您将看到一个类似于`cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1%`的密码。请去掉密码中的`%`字符，得到`cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1`作为管理员密码。

1. 检查Grafana是否在您的集群中运行：

   ```bash
   kubectl get pods -n dapr-monitoring

   NAME                                                READY   STATUS       RESTARTS   AGE
   dapr-prom-kube-state-metrics-9849d6cc6-t94p8        1/1     Running      0          4m58s
   dapr-prom-prometheus-alertmanager-749cc46f6-9b5t8   2/2     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-5jh8p            1/1     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-88gbg            1/1     Running      0          4m58s
   dapr-prom-prometheus-node-exporter-bjp9f            1/1     Running      0          4m58s
   dapr-prom-prometheus-pushgateway-688665d597-h4xx2   1/1     Running      0          4m58s
   dapr-prom-prometheus-server-694fd8d7c-q5d59         2/2     Running      0          4m58s
   grafana-c49889cff-x56vj                             1/1     Running      0          5m10s
   ```

### 配置Prometheus作为数据源
首先，您需要将Prometheus连接为Grafana的数据源。

1. 端口转发到svc/grafana：

   ```bash
   kubectl port-forward svc/grafana 8080:80 -n dapr-monitoring

   Forwarding from 127.0.0.1:8080 -> 3000
   Forwarding from [::1]:8080 -> 3000
   Handling connection for 8080
   Handling connection for 8080
   ```

1. 打开浏览器访问`http://localhost:8080`

1. 登录Grafana
   - 用户名 = `admin`
   - 密码 = 上述密码

1. 选择`Configuration`和`Data Sources`

   <img src="/images/grafana-datasources.png" alt="Grafana添加数据源菜单的截图" width=200>

1. 添加Prometheus作为数据源。

   <img src="/images/grafana-add-datasources.png" alt="Prometheus添加数据源的截图" width=600>

1. 获取您的Prometheus HTTP URL

   Prometheus HTTP URL的格式为`http://<prometheus服务端点>.<命名空间>`

   首先通过运行以下命令获取Prometheus服务器端点：

   ```bash
   kubectl get svc -n dapr-monitoring

   NAME                                 TYPE        CLUSTER-IP        EXTERNAL-IP   PORT(S)             AGE
   dapr-prom-kube-state-metrics         ClusterIP   10.0.174.177      <none>        8080/TCP            7d9h
   dapr-prom-prometheus-alertmanager    ClusterIP   10.0.255.199      <none>        80/TCP              7d9h
   dapr-prom-prometheus-node-exporter   ClusterIP   None              <none>        9100/TCP            7d9h
   dapr-prom-prometheus-pushgateway     ClusterIP   10.0.190.59       <none>        9091/TCP            7d9h
   dapr-prom-prometheus-server          ClusterIP   10.0.172.191      <none>        80/TCP              7d9h
   elasticsearch-master                 ClusterIP   10.0.36.146       <none>        9200/TCP,9300/TCP   7d10h
   elasticsearch-master-headless        ClusterIP   None              <none>        9200/TCP,9300/TCP   7d10h
   grafana                              ClusterIP   10.0.15.229       <none>        80/TCP              5d5h
   kibana-kibana                        ClusterIP   10.0.188.224      <none>        5601/TCP            7d10h

   ```

   在本指南中，服务器名称为`dapr-prom-prometheus-server`，命名空间为`dapr-monitoring`，因此HTTP URL将是`http://dapr-prom-prometheus-server.dapr-monitoring`。

1. 填写以下设置：

   - 名称：`Dapr`
   - HTTP URL：`http://dapr-prom-prometheus-server.dapr-monitoring`
   - 默认：开启
   - 跳过TLS验证：开启
     - 这是保存和测试配置所必需的

   <img src="/images/grafana-prometheus-dapr-server-url.png" alt="Prometheus数据源配置的截图" width=600>

1. 点击`Save & Test`按钮以验证连接是否成功。

## 在Grafana中导入仪表板

1. 在Grafana主屏幕的左上角，点击“+”选项，然后选择“Import”。

   现在，您可以从[发布资产](https://github.com/dapr/dapr/releases)中为您的Dapr版本导入[Grafana仪表板模板](https://github.com/dapr/dapr/tree/master/grafana)：

   <img src="/images/grafana-uploadjson.png" alt="Grafana仪表板上传选项的截图" width=700>

1. 找到您导入的仪表板并享受

   <img src="/images/system-service-dashboard.png" alt="Dapr服务仪表板的截图" width=900>

   {{% alert title="提示" color="primary" %}}
   将鼠标悬停在每个图表描述角落的`i`上：

   <img src="/images/grafana-tooltip.png" alt="图表工具提示的截图" width=700>
   {{% /alert %}}

## 参考资料

* [Dapr可观察性]({{<ref observability-concept.md >}})
* [Prometheus安装](https://github.com/prometheus-community/helm-charts)
* [Kubernetes上的Prometheus](https://github.com/coreos/kube-prometheus)
* [Prometheus查询语言](https://prometheus.io/docs/prometheus/latest/querying/basics/)
* [支持的Dapr指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 示例

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/8W-iBDNvCUM?start=2577" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>