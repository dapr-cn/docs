---
type: docs
title: "操作指南：在 Kubernetes 中设置 Fluentd、Elastic search 和 Kibana"
linkTitle: "FluentD"
weight: 2000
description: "如何在 Kubernetes 中安装 Fluentd、Elastic Search 和 Kibana 以搜索日志"
---

## 前提条件

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Helm 3](https://helm.sh/)

## 安装 Elastic search 和 Kibana

1. 创建一个用于监控工具的 Kubernetes 命名空间

    ```bash
    kubectl create namespace dapr-monitoring
    ```

2. 添加 Elastic Search 的 Helm 仓库

    ```bash
    helm repo add elastic https://helm.elastic.co
    helm repo update
    ```

3. 使用 Helm 安装 Elastic Search

    默认情况下，chart 会创建 3 个副本，要求它们位于不同的节点上。如果您的集群少于 3 个节点，请指定较少的副本数。例如，将副本数设置为 1：

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set replicas=1
    ```

    否则：

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring
    ```

    如果您使用 minikube 或仅在开发过程中想禁用持久卷，可以使用以下命令：

    ```bash
    helm install elasticsearch elastic/elasticsearch --version 7.17.3 -n dapr-monitoring --set persistence.enabled=false,replicas=1
    ```

4. 安装 Kibana

    ```bash
    helm install kibana elastic/kibana --version 7.17.3 -n dapr-monitoring
    ```

5. 确保 Elastic Search 和 Kibana 在您的 Kubernetes 集群中正常运行

    ```bash
    $ kubectl get pods -n dapr-monitoring
    NAME                            READY   STATUS    RESTARTS   AGE
    elasticsearch-master-0          1/1     Running   0          6m58s
    kibana-kibana-95bc54b89-zqdrk   1/1     Running   0          4m21s
    ```

## 安装 Fluentd

1. 作为 daemonset 安装配置映射和 Fluentd

    下载这些配置文件：
    - [fluentd-config-map.yaml](/docs/fluentd-config-map.yaml)
    - [fluentd-dapr-with-rbac.yaml](/docs/fluentd-dapr-with-rbac.yaml)

    > 注意：如果您的集群中已经运行了 Fluentd，请启用嵌套的 JSON 解析器，以便它可以解析来自 Dapr 的 JSON 格式日志。

    将配置应用到您的集群：

    ```bash
    kubectl apply -f ./fluentd-config-map.yaml
    kubectl apply -f ./fluentd-dapr-with-rbac.yaml
    ```

2. 确保 Fluentd 作为 daemonset 运行。FluentD 实例的数量应与集群节点的数量相同。以下示例中，集群中只有一个节点：

    ```bash
    $ kubectl get pods -n kube-system -w
    NAME                          READY   STATUS    RESTARTS   AGE
    coredns-6955765f44-cxjxk      1/1     Running   0          4m41s
    coredns-6955765f44-jlskv      1/1     Running   0          4m41s
    etcd-m01                      1/1     Running   0          4m48s
    fluentd-sdrld                 1/1     Running   0          14s
    ```

## 安装 Dapr 并启用 JSON 格式日志

1. 安装 Dapr 并启用 JSON 格式日志

    ```bash
    helm repo add dapr https://dapr.github.io/helm-charts/
    helm repo update
    helm install dapr dapr/dapr --namespace dapr-system --set global.logAsJson=true
    ```

2. 在 Dapr sidecar 中启用 JSON 格式日志

    在您的部署 yaml 中添加 `dapr.io/log-as-json: "true"` 注解。例如：

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

> 注意：Elastic Search 需要一些时间来索引 Fluentd 发送的日志。

1. 从本地主机端口转发到 `svc/kibana-kibana`

    ```bash
    $ kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring
    Forwarding from 127.0.0.1:5601 -> 5601
    Forwarding from [::1]:5601 -> 5601
    Handling connection for 5601
    Handling connection for 5601
    ```

2. 浏览到 `http://localhost:5601`

3. 展开下拉菜单并点击 **Management → Stack Management**

    ![Kibana 管理菜单选项下的 Stack Management 项](/images/kibana-1.png)

4. 在 Stack Management 页面上，选择 **Data → Index Management** 并等待 `dapr-*` 被索引。

    ![Kibana Stack Management 页面上的 Index Management 视图](/images/kibana-2.png)

5. 一旦 `dapr-*` 被索引，点击 **Kibana → Index Patterns** 然后点击 **Create index pattern** 按钮。

    ![Kibana 创建索引模式按钮](/images/kibana-3.png)

6. 通过在 **Index Pattern name** 字段中输入 `dapr*` 来定义一个新的索引模式，然后点击 **Next step** 按钮继续。

    ![Kibana 定义索引模式页面](/images/kibana-4.png)

7. 通过从 **Time field** 下拉菜单中选择 `@timestamp` 选项来配置新索引模式的主要时间字段。点击 **Create index pattern** 按钮完成索引模式的创建。

    ![Kibana 创建索引模式的配置设置页面](/images/kibana-5.png)

8. 应显示新创建的索引模式。通过在 **Fields** 标签中的搜索框中使用搜索，确认感兴趣的字段如 `scope`、`type`、`app_id`、`level` 等是否被索引。

    > 注意：如果找不到索引字段，请稍等。搜索所有索引字段所需的时间取决于数据量和 Elastic Search 运行的资源大小。

    ![查看创建的 Kibana 索引模式](/images/kibana-6.png)

9. 要探索索引的数据，展开下拉菜单并点击 **Analytics → Discover**。

    ![Kibana Analytics 菜单选项下的 Discover 项](/images/kibana-7.png)

10. 在搜索框中输入查询字符串如 `scope:*` 并点击 **Refresh** 按钮查看结果。

    > 注意：这可能需要很长时间。返回所有结果所需的时间取决于数据量和 Elastic Search 运行的资源大小。

    ![在 Kibana Analytics Discover 页面中使用搜索框](/images/kibana-8.png)

## 参考资料

* [Kubernetes 的 Fluentd](https://docs.fluentd.org/v/0.12/articles/kubernetes-fluentd)
* [Elastic search helm chart](https://github.com/elastic/helm-charts/tree/master/elasticsearch)
* [Kibana helm chart](https://github.com/elastic/helm-charts/tree/master/kibana)
* [Kibana 查询语言](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
* [使用日志进行故障排除]({{< ref "logs-troubleshooting.md" >}})
