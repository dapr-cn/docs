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
  -e COLLECTOR_ZIPKIN_HTTP_PORT=9412 \
  -p 16686:16686 \
  -p 9412:9412 \
  jaegertracing/all-in-one:1.21
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

To launch the application referring to the new YAML file, you can use `--config` option:

```bash
dapr run --app-id mynode --app-port 3000 node app.js --config config.yaml
```

### Viewing Traces
To view traces, in your browser go to http://localhost:16686 and you will see the Jaeger UI.

## Configure Kubernetes
The following steps shows you how to configure Dapr to send distributed tracing data to Jaeger running as a container in your Kubernetes cluster, how to view them.

### Setup

First create the following YAML file to install Jaeger
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
    image: jaegertracing/all-in-one:1.13
    options:
      query:
        base-path: /jaeger
```

Now, use the above YAML file to install Jaeger
```bash
# Install Jaeger
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm install jaeger-operator jaegertracing/jaeger-operator
kubectl apply -f jaeger-operator.yaml

# Wait for Jaeger to be up and running
kubectl wait deploy --selector app.kubernetes.io/name=jaeger --for=condition=available
```

Next, create the following YAML file locally:

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

Finally, deploy the the Dapr component and configuration files:

```bash
kubectl apply -f tracing.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

That's it! That's it! Your Dapr sidecar is now configured for use with Jaeger.

### Viewing Tracing Data

To view traces, connect to the Jaeger Service and open the UI:

```bash
kubectl port-forward svc/jaeger-query 16686
```

In your browser, go to `http://localhost:16686` and you will see the Jaeger UI.

![jaeger](/images/jaeger_ui.png)

## 参考资料
- [Jaeger Getting Started](https://www.jaegertracing.io/docs/1.21/getting-started/#all-in-one)
- [W3C distributed tracing]({{< ref w3c-tracing >}})
