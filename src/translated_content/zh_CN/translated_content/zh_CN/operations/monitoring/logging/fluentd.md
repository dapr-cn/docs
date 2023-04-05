---
type: docs
title: "操作方法：在 Kubernetes 中搭建 Fluentd、Elastic search 和 Kibana"
linkTitle: "FluentD"
weight: 2000
description: "如何在 Kubernetes 中安装 Fluentd、Elastic Search 和 Kibana 来搜索日志"
---

## Prerequisites

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

## 安装 Elasticsearch 和 Kibana

1. Create a Kubernetes namespace for monitoring tools

    ```bash
    kubectl create namespace dapr-monitoring
    ```

2. Add the helm repo for Elastic Search

    ```bash
    helm repo add elastic https://helm.elastic.co
    helm repo update
    ```

3. Install Elastic Search using Helm

    By default, the chart creates 3 replicas which must be on different nodes. If your cluster has fewer than 3 nodes, specify a smaller number of replicas.  For example, this sets the number of replicas to 1:

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set replicas=1
    ```

    Otherwise:

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring
    ```

    If you are using minikube or simply want to disable persistent volumes for development purposes, you can do so by using the following command:

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set persistence.enabled=false,replicas=1
    ```

4. Install Kibana

    ```bash
    helm install kibana elastic/kibana --version 7.17.3 -n dapr-monitoring
    ```

5. Ensure that Elastic Search and Kibana are running in your Kubernetes cluster

    ```bash
    $ kubectl get pods -n dapr-monitoring
    NAME                            READY   STATUS    RESTARTS   AGE
    elasticsearch-master-0          1/1     Running   0          6m58s
    kibana-kibana-95bc54b89-zqdrk   1/1     Running   0          4m21s
    ```

## 安装 Fluentd

1. Install config map and Fluentd as a daemonset

    Download these config files:
    - [fluentd-config-map.yaml](/docs/fluentd-config-map.yaml)
    - [fluentd-dapr-with-rbac.yaml](/docs/fluentd-dapr-with-rbac.yaml)

    > Note: If you already have Fluentd running in your cluster, please enable the nested json parser so that it can parse JSON-formatted logs from Dapr.

    Apply the configurations to your cluster:

    ```bash
    kubectl apply -f ./fluentd-config-map.yaml
    kubectl apply -f ./fluentd-dapr-with-rbac.yaml
    ```

2. 确保 Fluentd 作为守护进程集运行。 FluentD 实例的数量应该与集群节点的数量相同。 在下面的例子中，集群中只有一个节点。

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

2. Enable JSON formatted log in Dapr sidecar

    添加 `dapr.io/log-as-json: "true"` annotation 到 deployment yaml。 例如：

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

1. Port-forward from localhost to `svc/kibana-kibana`

    ```bash
    $ kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring
    Forwarding from 127.0.0.1:5601 -> 5601
    Forwarding from [::1]:5601 -> 5601
    Handling connection for 5601
    Handling connection for 5601
    ```

2. 浏览 `http://localhost:5601`

3. Expand the drop-down menu and click **Management → Stack Management**

    ![Kibana 管理菜单选项下的堆栈管理项](/images/kibana-1.png)

4. On the Stack Management page, select **Data → Index Management** and wait until `dapr-*` is indexed.

    !["Kibana 堆栈管理"页面上的"索引管理"视图](/images/kibana-2.png)

5. Once `dapr-*` is indexed, click on **Kibana → Index Patterns** and then the **Create index pattern** button.

    ![Kibana 创建索引模式按钮](/images/kibana-3.png)

6. Define a new index pattern by typing `dapr*` into the **Index Pattern name** field, then click the **Next step** button to continue.

    ![Kibana 定义索引模式页面](/images/kibana-4.png)

7. Configure the primary time field to use with the new index pattern by selecting the `@timestamp` option from the **Time field** drop-down. Click the **Create index pattern** button to complete creation of the index pattern.

    ![Kibana 配置用于创建索引模式的设置页面](/images/kibana-5.png)

8. The newly created index pattern should be shown. Confirm that the fields of interest such as `scope`, `type`, `app_id`, `level`, etc. are being indexed by using the search box in the **Fields** tab.

    > 注意：如果您找不到索引字段，请稍候。 搜索所有索引字段所需的时间取决于运行 elastic search 的数据量和资源大小。

    ![已创建的 Kibana 索引模式的视图](/images/kibana-6.png)

9. To explore the indexed data, expand the drop-down menu and click **Analytics → Discover**.

    ![发现 Kibana Analytics 菜单选项下的项目](/images/kibana-7.png)

10. In the search box, type in a query string such as `scope:*` and click the **Refresh** button to view the results.

    > 注意：这可能需要很长时间。 返回所有结果所需的时间取决于运行 elastic search 的数据量和资源大小。

    ![使用 Kibana Analytics Discover 页面中的搜索框](/images/kibana-8.png)

## 参考

* [Fluentd for Kubernetes](https://docs.fluentd.org/v/0.12/articles/kubernetes-fluentd)
* [Elastic search helm chart](https://github.com/elastic/helm-charts/tree/master/elasticsearch)
* [Kibana helm chart](https://github.com/elastic/helm-charts/tree/master/kibana)
* [Kibana 查询语句](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
* [使用日志进行故障排除]({{< ref "logs-troubleshooting.md" >}})
