---
type: docs
title: "操作方法: 为分布式跟踪安装 Jaeger"
linkTitle: "Jaeger"
weight: 3000
description: "为分布式跟踪安装 Jaeger"
---

Dapr 目前支持Zipkin 协议。 既然Jaeger 与 Zipkin 兼容，那么 Zipkin 协议可以用来与 Jaeger 通信。

## 配置自托管模式

### 设置

启动Jaeger的最简单方式是使用发布到DockerHub的Jaeger全家桶镜像：

```bash
docker run -d --name jaeger \
  -e COLLECTOR_ZIPKIN_HOST_PORT=:9412 \
  -p 16686:16686 \
  -p 9412:9412 \
  jaegertracing/all-in-one:1.22
```


接下来，在本地创建以下YAML文件：

* **config.yaml**: 注意, 因为我们正在使用 Zipkin 协议 来与 Jaeger 通信, 我们指定 `zipkin` 追踪部分 配置设置 `endpointAddress` 来定位Jaeger 实例。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9412/api/v2/spans"
```

要启动指向新的 YAML 文件的应用程序，您可以使用 `--config` 选项：

```bash
dapr run --app-id mynode --app-port 3000 node app.js --config config.yaml
```

### 查看 Traces
要查看 traces，在您的浏览器中请访问 http://localhost:16686，您会看到Jaeger UI。

## 配置 Kubernetes
以下步骤可向您展示如何配置 Dapr 将分布式跟踪数据发送给 Jaeger，该数据作为 Dapr 中的容器运行，以及如何查看它们。

### 设置

首先创建下面的 YAML 文件来安装Jaeger
* jaeger-operator.yaml
```yaml
apiVersion: jaegertracing.io/v1
kind: "Jaeger"
metadata:
  name: jaeger
spec:
  strategy: allInOne
  ingress:
    enabled: false
  allInOne:
    image: jaegertracing/all-in-one:1.22
    options:
      query:
        base-path: /jaeger
```

现在，使用上面的 YAML 文件安装 Jaeger
```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

接下来，在本地创建以下YAML文件：

* **tracing.yaml**

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://jaeger-collector.default.svc.cluster.local:9411/api/v2/spans"
```

最后，部署Dapr组件和配置文件：

```bash
kubectl apply -f tracing.yaml
```

为了启用您的 Dapr sidecar 的配置，请在您的pod spec模板中添加以下注释：

```yml
annotations:
  dapr.io/config: "tracing"
```

就这么简单！ 您的 Dapr sidecar 现已配置为Jaeger使用。

### 查看追踪数据

要查看 traces 数据，请连接到Jaeger服务并打开 UI：

```bash
kubectl port-forward svc/jaeger-query 16686
```

在您的浏览器中，转到 `http://localhost:16686` 并会看到Jaeger UI。

![jaeger](/images/jaeger_ui.png)

## 参考资料
- [Jaeger 快速入门](https://www.jaegertracing.io/docs/1.21/getting-started/#all-in-one)
- [W3C 分布式跟踪]({{< ref w3c-tracing >}})
