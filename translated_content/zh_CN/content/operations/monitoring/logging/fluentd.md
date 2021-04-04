---
type: docs
title: "操作方法：在 Kubernetes 中搭建 Fluentd、Elastic search 和 Kibana"
linkTitle: "FluentD"
weight: 1000
description: "如何在Kubernetes安装Fluentd、Elastic Search和Kibana来搜索日志"
---

## 前期准备

- Kubernetes (> 1.14)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Helm 3](https://helm.sh/)


## 安装 Elasticsearch 和 Kibana

1.  为监测工具创建命名空间并添加 Helm Repo 用于Elastic Search

    ```bash
    kubectl create namespace dapr-monitoring
    ```

2. 添加 Elastic helm repo

    ```bash
    helm repo add elastic https://helm.elastic.co
    helm repo update
    ```

3. 使用 Helm 安装 Elastic Search

默认情况下，Chart 必须在不同的节点上创建3个副本。  如果您的集群少于3个节点，请指定一个较低的副本数量。  例如，将它设置为 1：

```bash
helm install elasticsearch elastic/elasticsearch -n dapr-monitoring --set replicas=1
```

否则：

```bash
helm install elasticsearch elastic/elasticsearch -n dapr-monitoring
```

如果您正在使用 minikube 或者想要禁用持久化卷来开发，您可以使用以下命令禁用它：

```bash
helm install elasticsearch elastic/elasticsearch -n dapr-monitoring --set persistence.enabled=false,replicas=1
```

4. 安装 Kibana

    ```bash
    helm install kibana elastic/kibana -n dapr-monitoring
    ```

5. 校验

    确保 Elastic Search 和 Kibana 正在您的Kubernetes 集群中运行。

    ```bash
    kubectl get pods -n dapr-monitoring
    NAME                            READY   STATUS    RESTARTS   AGE
    elasticsearch-master-0          1/1     Running   0          6m58s
    kibana-kibana-95bc54b89-zqdrk   1/1     Running   0          4m21s
    ```

## 安装 Fluentd

1. 安装 config map 和 Fluentd 作为守护程序

下载这些配置文件：
- [fluentd-config-map.yaml](/docs/fluentd-config-map.yaml)
- [fluentd-dapr-with-rbac.yaml](/docs/fluentd-dapr-with-rbac.yaml)

> 注意：如果你已经在你的集群中运行 Fluentd，请启用 nested json 解析器从 Dapr 解析JSON 格式的日志。

将配置应用到您的集群：

```bash
kubectl apply -f ./fluentd-config-map.yaml
kubectl apply -f ./fluentd-dapr-with-rbac.yaml
```

2. 确保 Fluentd 作为守护程序运行；实例的数量应与集群节点的数量相同。  在下面的例子中，我们只有一个节点。

```bash
kubectl get pods -n kube-system -w
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
...
```

## Search logs

> Note: Elastic Search takes a time to index the logs that Fluentd sends.

1. Port-forward to svc/kibana-kibana

```
$ kubectl port-forward svc/kibana-kibana 5601 -n dapr-monitoring
Forwarding from 127.0.0.1:5601 -> 5601
Forwarding from [::1]:5601 -> 5601
Handling connection for 5601
Handling connection for 5601
```

2. Browse `http://localhost:5601`

3. Click Management -> Index Management

![kibana management](/images/kibana-1.png)

4. Wait until dapr-* is indexed.

![index log](/images/kibana-2.png)

5. Once dapr-* indexed, click Kibana->Index Patterns and Create Index Pattern

![create index pattern](/images/kibana-3.png)

6. Define index pattern - type `dapr*` in index pattern

![define index pattern](/images/kibana-4.png)

7. Select time stamp filed: `@timestamp`

![timestamp](/images/kibana-5.png)

8. Confirm that `scope`, `type`, `app_id`, `level`, etc are being indexed.

> Note: if you cannot find the indexed field, please wait. Note: if you cannot find the indexed field, please wait. it depends on the volume of data and resource size where elastic search is running.

![indexing](/images/kibana-6.png)

9. Click `discover` icon and search `scope:*`

> Note: it would take some time to make log searchable based on the data volume and resource.

![discover](/images/kibana-7.png)

## References

* [Fluentd for Kubernetes](https://docs.fluentd.org/v/0.12/articles/kubernetes-fluentd)
* [Elastic search helm chart](https://github.com/elastic/helm-charts/tree/master/elasticsearch)
* [Kibana helm chart](https://github.com/elastic/helm-charts/tree/master/kibana)
* [Kibana Query Language](https://www.elastic.co/guide/en/kibana/current/kuery-query.html)
* [Troubleshooting using Logs]({{< ref "logs-troubleshooting.md" >}})
