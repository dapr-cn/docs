---
type: docs
title: "How-To: Enable preview features"
linkTitle: "Preview features"
weight: 7000
description: "How to specify and enable preview features"
---

## 概述
Dapr 中的某些功能在首次发布时被视为实验性功能。 这些功能需要明确的选择加入才能使用。 选择加入在 Dapr 的配置中指定。

目前，在运行Kubernetes时，在每个应用程序的基础上启用预览功能。 如果今后有必要使用全局范围，则可引入全局范围。

### 当前预览功能
以下是现有预览功能列表：
- [Actor可重入性]({{<ref actor-reentrancy.md>}})

## Configuration properties
The `features` section under the `Configuration` spec contains the following properties:

| 属性      | 数据类型   | 说明                                                            |
| ------- | ------ | ------------------------------------------------------------- |
| name    | string | The name of the preview feature that will be enabled/disabled |
| enabled | bool   | Boolean specifying if the feature is enabled or disabled      |

## Enabling a preview feature
Preview features are specified in the configuration. Here is an example of a full configuration that contains multiple features:

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

### Standalone
To enable preview features when running Dapr locally, either update the default configuration or specify a separate config file using `dapr run`.

The default Dapr config is created when you run `dapr init`, and is located at:
- Windows: `%USERPROFILE%\.dapr\config.yaml`
- Linux/macOS: `~/.dapr/config.yaml`

Alternately, you can update preview features on all apps run locally by specifying the `--config` flag in `dapr run` and pointing to a separate Dapr config file:

```bash
dapr run --app-id myApp --config ./previewConfig.yaml ./app
```


### Kubernetes
In Kubernetes mode, the configuration must be provided via a configuration component. Using the same configuration as above, apply it via `kubectl`:

```bash
kubectl apply -f previewConfig.yaml
```

This configuration component can then be referenced in any application by modifying the application's configuration to reference that specific configuration component via the `dapr.io/config` element. 例如:

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
