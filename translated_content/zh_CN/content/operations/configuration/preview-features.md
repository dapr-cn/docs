---
type: docs
title: "操作方法：启用预览功能"
linkTitle: "Preview features"
weight: 7000
description: "如何指定和启用预览功能"
---

## 概述
Dapr 中的预览功能在首次发布时被视为实验性功能。 这些预览功能需要显式选择加入才能使用。 选择加入在 Dapr 的配置中指定。

预览功能是通过在运行应用程序实例时设置配置来基于每个应用程序启用的。

### 预览功能
当前的预览功能列表可以在[此处]({{<ref support-preview-features>}})找到。

## 配置属性
`Configuration` sepc下的 `features` 部分包含以下属性：

| 属性      | 数据类型   | 说明              |
| ------- | ------ | --------------- |
| name    | string | 启用/禁用的预览功能的名称   |
| enabled | bool   | 指定功能是启用还是禁用的布尔值 |

## 启用预览功能
预览功能在配置中指定。 下面是包含多个功能的完整配置的示例：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: featureconfig
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
  features:
    - name: Feature1
      enabled: true
    - name: Feature2
      enabled: true
```

### 独立模式
要在本地运行 Dapr 时启用预览功能，请更新默认配置或使用 `dapr run`指定单独的配置文件。

The default Dapr config is created when you run `dapr init`, and is located at:
- Windows: `%USERPROFILE%\.dapr\config.yaml`
- Linux/macOS: `~/.dapr/config.yaml`

或者，您可以通过在 `dapr run` 中指定 `--config` 标志并指向单独的 Dapr 配置文件来更新本地运行的所有应用的预览功能：

```bash
dapr run --app-id myApp --config ./previewConfig.yaml ./app
```


### Kubernetes
在 Kubernetes 模式下，必须通过配置组件提供配置。 使用与上面相同的配置，通过 `kubectl`应用它：

```bash
kubectl apply -f previewConfig.yaml
```

然后，可以通过修改应用程序的配置以通过 `dapr.io/config` 元素引用该特定配置组件，从而在任何应用程序中引用此配置组件。 例如:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodeapp
  labels:
    app: node
spec:
  replicas: 1
  selector:
    matchLabels:
      app: node
  template:
    metadata:
      labels:
        app: node
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "nodeapp"
        dapr.io/app-port: "3000"
        dapr.io/config: "featureconfig"
    spec:
      containers:
      - name: node
        image: dapriosamples/hello-k8s-node:latest
        ports:
        - containerPort: 3000
        imagePullPolicy: Always
```
