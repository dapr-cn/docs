---
type: docs
title: "操作方法：使用 Grafana 观察指标"
linkTitle: "带有 Grafana 的指标仪表板"
weight: 5000
description: "如何在 Grafana 仪表板中查看 Dapr 指标。"
---

## 可用的仪表板

{{< tabs "System Service" "Sidecars" "Actors" >}}

{{% codetab %}}
`grafana-system-services-dashboard.json` 模板展示了 Dapr 系统组件的状态包括，dapr-operator、dapr-sidecar-injector、dapr-sentry 和 dapr-placement：

<img src="/images/grafana-system-service-dashboard.png" alt="系统服务仪表板的屏幕截图" width=1200>
{{% /codetab %}}

{{% codetab %}}
`grafana-sidecar-dashboard.json` 模板展示了 Dapr sidecar 的状态，包括 sidecar 的健康状态/资源，HTTP 和 GRPC 的吞吐量/延迟，Actor，mTLS等：

<img src="/images/grafana-sidecar-dashboard.png" alt="Sidecar 仪表板的屏幕截图" width=1200>
{{% /codetab %}}

{{% codetab %}}
`grafana-actor-dashboard.json` 展示 Dapr sidecar 的状态，actor 调用的吞吐量/延迟，timer/reminder 触发器和基于回合的并发：

<img src="/images/grafana-actor-dashboard.png" alt="Actor 仪表板的屏幕截图" width=1200>
{{% /codetab %}}

{{< /tabs >}}

## 前提

- [安装 Prometheus]({{<ref prometheus.md>}})

## 在 Kubernetes 上安装

### 安装 Grafana

1. 添加 Grafana Helm 仓库：

   ```bash
   helm repo add grafana https://grafana.github.io/helm-charts
   ```

1. 安装 Chart：

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring
   ```

   {{% alert title="Note" color="primary" %}}
   如果您正在使用 minikube 或者想要禁用持久化卷来开发，您可以使用以下命令禁用它：

   ```bash
   helm install grafana grafana/grafana -n dapr-monitoring --set persistence.enabled=false
   ```
   {{% /alert %}}


1. 获取登录 Grafana 的管理员密码：

   ```bash
   kubectl get secret --namespace dapr-monitoring grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo
   ```

   您将会得到一个类似于 `cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1%` 的密码。 从密码中移除 `%` 字符，以获取 `cj3m0OfBNx8SLzUlTx91dEECgzRlYJb60D2evof1` 作为管理员密码。

1. 验证 Grafana 正在集群中运行：

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

### 将 Prometheus 配置为数据源
首先，您需要将 Prometheus 作为数据源连接到 Grafana。

1. Port-forward 到 svc/grafana:

   ```bash
   kubectl port-forward svc/grafana 8080:80 -n dapr-monitoring

   Forwarding from 127.0.0.1:8080 -> 3000
   Forwarding from [::1]:8080 -> 3000
   Handling connection for 8080
   Handling connection for 8080
   ```

1. 将浏览器导航到 `http://localhost:8080`

1. 登录到 Grafana
   - Username = `admin`
   - Password = 上面获取的密码

1. 选择 `Configuration` 和 `Data Sources`

   <img src="/images/grafana-datasources.png" alt="Grafana 添加数据源菜单的屏幕截图" width=200>


1. 将 Prometheus 添加为数据源。
   
       <img src="/images/grafana-add-datasources.png" alt="Screenshot of the Prometheus add Data Source" width=600>

1. 获取您的 Prometheus HTTP URL

   Prometheus HTTP URL 遵循 `http://<prometheus service endpoint>.<namespace>` 的格式

   首先通过运行以下命令获取 Prometheus 服务器端点：

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


    在本指南中，服务器名称为 `dapr-prom-prometheus-server`，命名空间为 `dapr-monitoring`，因此 HTTP URL 将为 `http://dapr-prom-prometheus-server.dapr-monitoring`。

1. 填写以下设置：

   - Name: `Dapr`
   - HTTP URL: `http://dapr-prom-prometheus-server.dapr-monitoring`
   - Default: On

   <img src="/images/grafana-prometheus-dapr-server-url.png" alt="Prometheus 数据源配置的屏幕截图" width=600>

1. 点击 `Save & Test` 按钮来验证连接是否成功。

## 在 Grafana 中导入仪表盘

1. 在 Grafana 主页的左上角，点击 "+" 选项，然后点击 "Import"。

   现在，您可以从您的 Dapr 版本的 [发布资产](https://github.com/dapr/dapr/releases) 中 导入 [Grafana 仪表板模板](https://github.com/dapr/dapr/tree/master/grafana)：

   <img src="/images/grafana-uploadjson.png" alt="Grafana 仪表板上传选项的屏幕截图" width=700>

1. 找到您导入的仪表盘并开始使用

   <img src="/images/system-service-dashboard.png" alt="Dapr 服务仪表板的屏幕截图" width=900>

   {{% alert title="Tip" color="primary" %}}
   将您的鼠标悬停在角落上的 `i` 来查看每个图标的描述：

   <img src="/images/grafana-tooltip.png" alt="图形工具提示的屏幕截图" width=700>
   {{% /alert %}}

## 参考资料

* [Dapr 可观测性]({{<ref observability-concept.md >}})
* [安装 Prometheus](https://github.com/prometheus-community/helm-charts)
* [在 Kubernetes 上部署 Prometheus](https://github.com/coreos/kube-prometheus)
* [Prometheus 查询语言](https://prometheus.io/docs/prometheus/latest/querying/basics/)
* [支持的 Dapr 指标](https://github.com/dapr/dapr/blob/master/docs/development/dapr-metrics.md)

## 示例

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="//player.bilibili.com/player.html?aid=886064109&bvid=BV1QK4y1p7fn&cid=277946151&page=10&t=2577" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>