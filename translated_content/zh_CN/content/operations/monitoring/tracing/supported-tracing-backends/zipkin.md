---
type: docs
title: "操作方法: 为分布式追踪安装 Zipkin"
linkTitle: "Zipkin"
weight: 3000
description: "设置 Zipkin 进行分布式追踪"
---

## 配置自托管模式

对于自托管模式，在运行 `dapr init `时：

1. 默认情况下，以下 YAML 文件是在 `$HOME/.dapr/config.yaml` （在 Linux/Mac 上）或 `%USERPROFILE%\.dapr\config.yaml` （在 Windows 上）中创建的，默认情况下，在 `dapr run` 调用时引用该文件，除非另有覆盖：

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

2. [openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) docker 容器是在运行 `dapr init` 启动的，也可以使用以下代码启动。

使用 Docker 启动 Zipkin：

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. 默认情况下，使用 `dapr run` 启动的应用程序，引用 `$HOME/.dapr/config.yaml` 或 `%USERPROFILE%\.dapr\config.yaml` 中的配置文件，并且可以使用 `--config` 参数用 Dapr CLI 覆盖：

```bash
dapr run --app-id mynode --app-port 3000 node app.js
```
### 查看 Traces
要查看 traces，在您的浏览器中请访问 http://localhost:9411，您会看到 Zipkin UI。

## 配置 Kubernetes

以下步骤向您展示了如何配置 Dapr 以将分布式追踪数据发送到在 Kubernetes 集群中作为容器运行的 Zipkin，以及如何查看它们。

### 设置

首先，部署 Zipkin：

```bash
kubectl create deployment zipkin --image openzipkin/zipkin
```

为 Zipkin pod 创建一个 Kubernetes 服务：

```bash
kubectl expose deployment zipkin --type ClusterIP --port 9411
```

接下来，在本地创建以下 YAML 文件：

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

现在，部署 Dapr 配置文件：

```bash
kubectl apply -f tracing.yaml
```

为了启用您的 Dapr sidecar 的配置，请在您的 pod spec 模板中添加以下注解：

```yml
annotations:
  dapr.io/config: "tracing"
```

就这么简单！ 你的 sidecar 现在被配置为向 Zipkin 发送追踪。

### 查看追踪数据

要查看跟踪，请连接到 Zipkin 服务并打开 UI：

```bash
kubectl port-forward svc/zipkin 9411:9411
```

在浏览器上，转到 `http://localhost:9411` ，您应该会看到 Zipkin UI。

![zipkin](/images/zipkin_ui.png)

## 参考资料
- [Zipkin 分布式追踪](https://zipkin.io/)
- [W3C 分布式跟踪]({{< ref w3c-tracing >}})
