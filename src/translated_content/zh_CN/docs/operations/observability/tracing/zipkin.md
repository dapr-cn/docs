---
type: docs
title: "操作指南：设置 Zipkin 进行分布式追踪"
linkTitle: "Zipkin"
weight: 4000
description: "设置 Zipkin 进行分布式追踪"
---

## 配置自托管模式

在自托管模式下，运行 `dapr init` 时：

1. 系统会默认创建一个 YAML 文件，路径为 `$HOME/.dapr/config.yaml`（Linux/Mac）或 `%USERPROFILE%\.dapr\config.yaml`（Windows）。在执行 `dapr run` 时，系统会默认引用该文件，除非您指定了其他配置：

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

2. 运行 `dapr init` 时，[openzipkin/zipkin](https://hub.docker.com/r/openzipkin/zipkin/) 的 Docker 容器会自动启动。您也可以手动启动：

使用 Docker 启动 Zipkin：

```bash
docker run -d -p 9411:9411 openzipkin/zipkin
```

3. 使用 `dapr run` 启动应用程序时，默认会引用 `$HOME/.dapr/config.yaml` 或 `%USERPROFILE%\.dapr\config.yaml` 中的配置文件。您可以通过 Dapr CLI 的 `--config` 参数来指定其他配置：

```bash
dapr run --app-id mynode --app-port 3000 node app.js
```

### 查看追踪

要查看追踪数据，请在浏览器中访问 http://localhost:9411，您将看到 Zipkin 的用户界面。

## 配置 Kubernetes

以下步骤将指导您如何配置 Dapr，将分布式追踪数据发送到 Kubernetes 集群中的 Zipkin 容器，并查看这些数据。

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

* tracing.yaml 配置

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

要在 Dapr sidecar 中启用此配置，请在 pod 规范模板中添加以下注释：

```yml
annotations:
  dapr.io/config: "tracing"
```

完成！您的 sidecar 现在已配置为将追踪数据发送到 Zipkin。

### 查看追踪数据

要查看追踪数据，请连接到 Zipkin 服务并打开用户界面：

```bash
kubectl port-forward svc/zipkin 9411:9411
```

在浏览器中，访问 `http://localhost:9411`，您将看到 Zipkin 的用户界面。

![zipkin](/images/zipkin_ui.png)

## 参考资料
- [Zipkin 用于分布式追踪](https://zipkin.io/)