---
type: docs
title: "操作方法：在 Kubernetes 中搭建 Fluentd、Elastic search 和 Kibana"
linkTitle: "FluentD"
weight: 1000
description: "如何在Kubernetes安装Fluentd、Elastic Search和Kibana来搜索日志"
---

## 先决条件

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

## 安装 Elasticsearch 和 Kibana

1. 为监控工具创建 Kubernetes 命名空间

    ```bash
    kubectl create namespace dapr-monitoring
    ```

2. 添加 Elastic Search 的 helm 存储库

    ```bash
    helm repo add elastic https://helm.elastic.co
    helm repo update
    ```

3. 使用 Helm 安装 Elastic Search

    默认情况下，Chart 必须在不同的节点上创建3个副本。 如果您的集群少于3个节点，请指定一个较低的副本数量。  例如，这会将副本数设置为 1：

    ```bash
    helm install elasticsearch elastic/elasticsearch -n dapr-monitoring --set replicas=1
    ```

    否则：

    ```bash
    helm install elasticsearch elastic/elasticsearch -n dapr-monitoring
    ```

    如果您正在使用 minikube 或者想要禁用持久化卷来开发，您可以使用以下命令执行此操作：

    ```bash
    helm install elasticsearch elastic/elasticsearch -n dapr-monitoring --set persistence.enabled=false,replicas=1
    ```

4. 安装 Kibana

    ```bash
    helm install kibana elastic/kibana -n dapr-monitoring
    ```

5. 确保 Elastic Search 和 Kibana 正在您的Kubernetes 集群中运行。

    ```bash
    $ kubectl get pods -n dapr-monitoring
    NAME                            READY   STATUS    RESTARTS   AGE
    elasticsearch-master-0          1/1     Running   0          6m58s
    kibana-kibana-95bc54b89-zqdrk   1/1     Running   0          4m21s
    ```

## 安装 Fluentd

1. 安装 config map 和 Fluentd 作为守护程序

    下载这些配置文件：
    - [fluentd-config-map.yaml](/docs/fluentd-config-map.yaml)
    - [fluentd-dapr-with-rbac.yaml](/docs/fluentd-dapr-with-rbac.yaml)

    > Note: If you already have Fluentd running in your cluster, please enable the nested json parser so that it can parse JSON-formatted logs from Dapr.

    将配置应用到您的集群：

    ```bash
    kubectl apply -f ./fluentd-config-map.yaml
    kubectl apply -f ./fluentd-dapr-with-rbac.yaml
    ```

2. Ensure that Fluentd is running as a daemonset. The number of FluentD instances should be the same as the number of cluster nodes. In the example below, there is only one node in the cluster:

    ```bash
    $ kubectl get pods -n kube-system -w
    NAME                          READY   STATUS    RESTARTS   AGE
    coredns-6955765f44-cxjxk      1/1     Running   0          4m41s
    coredns-6955765f44-jlskv      1/1     Running   0          4m41s
    etcd-m01                      1/1     Running   0          4m48s
    fluentd-sdrld                 1/1     Running   0          14s
    ```

## 使用 JSON 格式化日志安装 Dapr

1. 使用 JSON 格式化日志启用 Dapr

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
    ```

2. 在 Dapr sidecar 中启用 JSON 格式化日志

    添加 `dapr.io/log-as-json: "true"` annotation 到你的部署yaml. 例如:

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
    ...
    ```

## 搜索日志

> 注意: Elastic Search 需要一段时间才能索引 Fluentd 发送的日志。

1. 从本地主机端口转发到 `svc/kibana-kibana`

    ```bash
    $ kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring
    Forwarding from 127.0.0.1:5601 -> 5601
    Forwarding from [::1]:5601 -> 5601
    Handling connection for 5601
    Handling connection for 5601
    ```

2. 浏览 `http://localhost:5601`

3. 展开下拉菜单，然后单击 **管理→堆栈管理**

    ![Stack Management item under Kibana Management menu options](/images/kibana-1.png)

4. 在堆栈管理页面上，选择 **数据→索引管理** ，然后等待 `dapr-*` 被索引。

    ![Index Management view on Kibana Stack Management page](/images/kibana-2.png)

5. 一旦`dapr-*` 被索引后，单击" **Kibana → 索引模式** "，然后单击" **创建索引模式** "按钮。

    ![Kibana create index pattern button](/images/kibana-3.png)

6. 通过在 **索引模式名称** 字段中键入 `dapr*` 来定义新的索引模式，然后单击 **下一步** 按钮继续。

    ![Kibana define an index pattern page](/images/kibana-4.png)

7. 通过 **"时间字段"** 下拉列表中选择 `@timestamp` 选项，配置要与新索引模式一起使用的主要时间字段。 单击 **创建索引模式** 按钮以完成索引模式的创建。

    ![Kibana configure settings page for creating an index pattern](/images/kibana-5.png)

8. 应显示新创建的索引模式。 通过使用字段标签中的搜索框，确认感兴趣的字段，如 `scope`、`type`、`app_id`、`level` 等正在被索引。

    > 注意：如果您找不到索引字段，请稍候。 搜索所有索引字段所需的时间取决于运行 elastic search 的数据量和资源大小。

    ![View of created Kibana index pattern](/images/kibana-6.png)

9. 要浏览索引数据，请展开下拉菜单，然后单击 **分析→发现**。

    ![Discover item under Kibana Analytics menu options](/images/kibana-7.png)

10. 在搜索框中，键入查询字符串（如 `scope：*` ，然后单击" **刷新** "按钮以查看结果。

    > 注意：这可能需要很长时间。 返回所有结果所需的时间取决于运行 elastic search 的数据量和资源大小。

    ![Using the search box in the Kibana Analytics Discover page](/images/kibana-8.png)

## 参考资料

* [用于 Kubernetes 的 Fluentd](https://docs.fluentd.org/v/0.12/articles/kubernetes-fluentd)
* [Elastic search helm chart](https://github.com/elastic/helm-charts/tree/master/elasticsearch)
* [Kibana helm chart](https://github.com/elastic/helm-charts/tree/master/kibana)
* [Kibana 查询语句](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
* [使用日志进行故障排除]({{< ref "logs-troubleshooting.md" >}})
