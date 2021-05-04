---
type: docs
title: "操作方法: 为分布式跟踪安装 Zipkin"
linkTitle: "Zipkin"
weight: 3000
description: "Set up Zipkin for distributed tracing"
---

## 配置自托管模式

For self hosted mode, on running `dapr init`:

1. The following YAML file is created by default in `$HOME/.dapr/config.yaml` (on Linux/Mac) or `%USERPROFILE%\.dapr\config.yaml` (on Windows) and it is referenced by default on `dapr run` calls unless otherwise overridden `:

* config.yaml

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprConfig
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://localhost:9411/api/v2/spans"
```

2. The [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker container is launched on running `dapr init` or it can be launched with the following code.

Launch Zipkin using Docker:

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. The applications launched with `dapr run` by default reference the config file in `$HOME/.dapr/config.yaml` or `%USERPROFILE%\.dapr\config.yaml` and can be overridden with the Dapr CLI using the `--config` param:

```bash
dapr run --app-id mynode --app-port 3000 node app.js
```
### 查看 Traces
To view traces, in your browser go to http://localhost:9411 and you will see the Zipkin UI.

## 配置 Kubernetes

The following steps shows you how to configure Dapr to send distributed tracing data to Zipkin running as a container in your Kubernetes cluster, and how to view them.

### 设置

First, deploy Zipkin:

```bash
kubectl create deployment zipkin --image openzipkin/zipkin
```

Create a Kubernetes service for the Zipkin pod:

```bash
kubectl expose deployment zipkin --type ClusterIP --port 9411
```

Next, create the following YAML file locally:

* tracing.yaml configuration

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
      endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

Now, deploy the the Dapr configuration file:

```bash
kubectl apply -f tracing.yaml
```

In order to enable this configuration for your Dapr sidecar, add the following annotation to your pod spec template:

```yml
annotations:
  dapr.io/config: "tracing"
```

就这么简单！ That's it! Your sidecar is now configured to send traces to Zipkin.

### Viewing Tracing Data

To view traces, connect to the Zipkin service and open the UI:

```bash
kubectl port-forward svc/zipkin 9411:9411
```

In your browser, go to `http://localhost:9411` and you will see the Zipkin UI.

![zipkin](/images/zipkin_ui.png)

## 参考资料
- [Zipkin for distributed tracing](https://zipkin.io/)
- [W3C 分布式跟踪]({{< ref w3c-tracing >}})
