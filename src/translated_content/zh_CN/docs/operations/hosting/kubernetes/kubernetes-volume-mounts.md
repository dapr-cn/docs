---
type: docs
title: "操作指南：将 Pod 卷挂载到 Dapr sidecar"
linkTitle: "操作指南：挂载 Pod 卷"
weight: 90000
description: "配置 Dapr sidecar 以挂载 Pod 卷"
---

Dapr sidecar 可以配置为挂载应用程序 Pod 上的任何 Kubernetes 卷。这些卷可以通过 `daprd` (sidecar) 容器以只读或读写模式访问。如果配置了一个卷进行挂载但在 Pod 中不存在，Dapr 会记录一个警告并忽略该卷。

有关不同类型卷的更多信息，请查看 [Kubernetes 文档](https://kubernetes.io/docs/concepts/storage/volumes/)。

## 配置

您可以在部署的 YAML 文件中设置以下注解：

| 注解 | 描述 |
| ---------- | ----------- |
| `dapr.io/volume-mounts` | 用于只读卷挂载 |
| `dapr.io/volume-mounts-rw` | 用于读写卷挂载 |

这些注解是以逗号分隔的 `volume-name:path/in/container` 对。请确保相应的卷在 Pod 规范中已定义。

在官方容器镜像中，Dapr 以用户 ID (UID) `65532` 运行。请确保挂载卷内的文件夹和文件对用户 `65532` 可读写。

虽然您可以在 Dapr sidecar 容器内的任何文件夹中挂载卷，但为了避免冲突并确保未来的兼容性，建议将所有挂载点放置在以下位置之一或其子文件夹中：

| 位置 | 描述 |
| -------- | ----------- |
| `/mnt` | 推荐用于存储 Dapr sidecar 进程可读写的持久数据的卷。 |
| `/tmp` | 推荐用于存储临时数据的卷，例如临时磁盘。 |

## 示例

### 基本部署资源示例

在下面的 Deployment 资源示例中：
- `my-volume1` 在 sidecar 容器内以只读模式挂载到 `/mnt/sample1`
- `my-volume2` 在 sidecar 容器内以只读模式挂载到 `/mnt/sample2`
- `my-volume3` 在 sidecar 容器内以读写模式挂载到 `/tmp/sample3`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "myapp"
        dapr.io/app-port: "8000"
        dapr.io/volume-mounts: "my-volume1:/mnt/sample1,my-volume2:/mnt/sample2"
        dapr.io/volume-mounts-rw: "my-volume3:/tmp/sample3"
    spec:
      volumes:
        - name: my-volume1
          hostPath:
            path: /sample
        - name: my-volume2
          persistentVolumeClaim:
            claimName: pv-sample
        - name: my-volume3
          emptyDir: {}
...
```

### 使用本地文件 secret 存储自定义 secret 存储

由于任何类型的 Kubernetes 卷都可以附加到 sidecar，您可以使用本地文件 secret 存储从各种地方读取 secret。例如，如果您有一个运行在 `10.201.202.203` 的网络文件共享 (NFS) 服务器，secret 存储在 `/secrets/stage/secrets.json`，您可以将其用作 secret 存储。

1. 配置应用程序 pod 以挂载 NFS 并将其附加到 Dapr sidecar。

   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: myapp
   ...
   spec:
     ...
     template:
       ...
         annotations:
           dapr.io/enabled: "true"
           dapr.io/app-id: "myapp"
           dapr.io/app-port: "8000"
           dapr.io/volume-mounts: "nfs-secrets-vol:/mnt/secrets"
       spec:
         volumes:
           - name: nfs-secrets-vol
             nfs:
               server: 10.201.202.203
               path: /secrets/stage
   ...
   ```

1. 将本地文件 secret 存储组件指向附加的文件。

   ```yaml
   apiVersion: dapr.io/v1alpha1
   kind: Component
   metadata:
     name: local-secret-store
   spec:
     type: secretstores.local.file
     version: v1
     metadata:
     - name: secretsFile
       value: /mnt/secrets/secrets.json
   ```

1. 使用 secret。

   ```
   GET http://localhost:<daprPort>/v1.0/secrets/local-secret-store/my-secret
   ```

## 相关链接

[Dapr Kubernetes pod 注解规范]({{< ref arguments-annotations-overview.md >}})
