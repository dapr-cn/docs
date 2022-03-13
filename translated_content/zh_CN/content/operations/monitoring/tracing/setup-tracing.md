---
type: docs
title: "配置 Dapr 以发送分布式追踪数据"
linkTitle: "为你的应用程序启用 Dapr 追踪功能"
weight: 100
description: "配置 Dapr 以发送分布式追踪数据"
---

建议在任何生产方案中启用追踪功能来运行 Dapr。  你可以根据你的环境配置 Dapr 来发送追踪和遥测数据到许多后端，无论它是在云端还是在内部运行。

## 追踪配置

`Configuration` sepc下的 `tracing` 部分包含以下属性：

```yml
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "https://..."
```

下面的表格给出了调用链追踪功能可配置的属性：

| 属性                       | 数据类型   | 说明                    |
| ------------------------ | ------ | --------------------- |
| `samplingRate`           | string | 设置采样率，可以用来控制追踪功能是否开启。 |
| `zipkin.endpointAddress` | string | 设置 Zipkin 服务器地址。      |


## 自托管模式下的 Zipkin

以下步骤说明如何将 Dapr 配置为将分布式追踪数据发送到在本地计算机上作为容器运行的 Zipkin 并查看它们。

对于自托管模式，请在本地创建一个 Dapr 配置文件，并使用 Dapr CLI 引用该文件。

1. 创建以下 `config.yaml` YAML 文件：

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Configuration
   metadata:
     name: zipkin
     namespace: default
   spec:
     tracing:
       samplingRate: "1"
       zipkin:
         endpointAddress: "http://localhost:9411/api/v2/spans"
   ```

2. 使用 Docker 启动Zipkin。

   ```bash
   docker run -d -p 9411:9411 openzipkin/zipkin
   ```

3. 使用 `--config` 参数启动 Dapr，其中包含保存 `config.yaml` 的路径：

   ```bash
   dapr run --app-id mynode --app-port 3000 --config ./config.yaml node app.js
   ```


## Kubernetes 模式下的 Zipkin

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

```yml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: zipkin
  namespace: default
spec:
  tracing:
    samplingRate: "1"
    zipkin:
      endpointAddress: "http://zipkin.default.svc.cluster.local:9411/api/v2/spans"
```

最后，部署 Dapr 配置：

```bash
kubectl apply -f config.yaml
```

为了启用您的 Dapr sidecar 的配置，请在您的 pod spec 模板中添加以下注解：

```yml
annotations:
  dapr.io/config: "zipkin"
```

就这么简单！ 你的 sidecar 现在已经配置好，可以与 Zipkin 一起使用。

### 查看追踪数据

要查看追踪，请连接到 Zipkin 服务并打开 UI：

```bash
kubectl port-forward svc/zipkin 9411:9411
```

在浏览器上，转到 `http://localhost:9411` ，您应该会看到 Zipkin UI。

![zipkin](/images/zipkin_ui.png)

## 参考资料
- [Zipkin 分布式追踪](https://zipkin.io/)
