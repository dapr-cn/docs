---
type: docs
title: "操作指南：启用预览功能"
linkTitle: "预览功能"
weight: 7000
description: "如何指定和启用预览功能"
---

在 Dapr 中，[预览功能]({{< ref support-preview-features >}})在首次发布时被视为实验功能。这些预览功能需要您明确选择启用才能使用。您需要在 Dapr 的配置文件中进行此选择。

预览功能是通过在运行应用程序实例时设置配置来启用的。

## 配置属性

`Configuration` 规范下的 `features` 部分包含以下属性：

| 属性       | 类型   | 描述 |
|------------|--------|------|
|`name`|字符串|启用/禁用的预览功能的名称|
|`enabled`|布尔值|指定功能是否启用或禁用的布尔值|

## 启用预览功能

预览功能需要在配置中指定。以下是一个包含多个功能的完整配置示例：

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

{{< tabs Self-hosted Kubernetes >}}

<!--self-hosted-->
{{% codetab %}}

要在本地运行 Dapr 时启用预览功能，可以更新默认配置或使用 `dapr run` 指定单独的配置文件。

默认的 Dapr 配置是在您运行 `dapr init` 时创建的，位于：
- Windows: `%USERPROFILE%\.dapr\config.yaml`
- Linux/macOS: `~/.dapr/config.yaml`

或者，您可以通过在 `dapr run` 中指定 `--config` 标志并指向单独的 Dapr 配置文件来更新本地运行的所有应用程序的预览功能：

```bash
dapr run --app-id myApp --config ./previewConfig.yaml ./app
```

{{% /codetab %}}

<!--kubernetes-->
{{% codetab %}}

在 Kubernetes 模式下，必须通过配置组件来提供配置。使用与上面相同的配置，通过 `kubectl` 应用：

```bash
kubectl apply -f previewConfig.yaml
```

然后可以通过修改应用程序的配置，使用 `dapr.io/config` 元素来引用该特定配置组件。例如：

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

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="配置模式" page="configuration-schema" >}}
