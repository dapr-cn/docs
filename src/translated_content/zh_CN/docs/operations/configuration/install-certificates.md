---
type: docs
title: "操作指南：在Dapr sidecar中安装证书"
linkTitle: "安装sidecar证书"
weight: 6500
description: "配置Dapr sidecar容器以信任证书"
---

Dapr sidecar可以通过配置来信任与外部服务通信所需的证书。这在需要信任自签名证书的场景中非常有用，例如：
- 使用HTTP绑定
- 为sidecar配置出站代理

支持信任证书颁发机构（CA）证书和叶子证书。

{{< tabs Self-hosted Kubernetes >}}

<!--self-hosted-->
{{% codetab %}}

当sidecar作为容器运行时，可以进行以下配置。

1. 使用卷挂载将证书配置为可用于sidecar容器。
2. 将sidecar容器中的环境变量`SSL_CERT_DIR`指向包含证书的目录。

> **注意：** 对于Windows容器，请确保容器以管理员权限运行，以便可以安装证书。

以下示例展示了如何使用Docker Compose在sidecar容器中安装证书（证书位于本地的`./certificates`目录中）：

```yaml
version: '3'
services:
  dapr-sidecar:
    image: "daprio/daprd:edge" # dapr版本必须至少为v1.8
    command: [
      "./daprd",
     "-app-id", "myapp",
     "-app-port", "3000",
     ]
    volumes:
        - "./components/:/components"
        - "./certificates:/certificates" # （步骤1）将证书文件夹挂载到sidecar容器
    environment:
      - "SSL_CERT_DIR=/certificates" # （步骤2）将环境变量设置为证书文件夹的路径
    # 对于Windows容器，取消注释下面的行
    # user: ContainerAdministrator
```

> **注意：** 当sidecar不在容器内运行时，证书必须直接安装在主机操作系统上。

{{% /codetab %}}

<!--kubernetes-->
{{% codetab %}}

在Kubernetes上：

1. 使用卷挂载将证书配置为可用于sidecar容器。
2. 将sidecar容器中的环境变量`SSL_CERT_DIR`指向包含证书的目录。

以下示例YAML展示了一个部署：
- 将pod卷附加到sidecar
- 设置`SSL_CERT_DIR`以安装证书

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
        dapr.io/volume-mounts: "certificates-vol:/tmp/certificates" # （步骤1）将证书文件夹挂载到sidecar容器
        dapr.io/env: "SSL_CERT_DIR=/tmp/certificates" # （步骤2）将环境变量设置为证书文件夹的路径
    spec:
      volumes:
        - name: certificates-vol
          hostPath:
            path: /certificates
#...
```

> **注意：** 使用Windows容器时，sidecar容器以管理员权限启动，这是安装证书所需的。这不适用于Linux容器。

{{% /codetab %}}

{{< /tabs >}}

完成这些步骤后，`SSL_CERT_DIR`指向的目录中的所有证书都将被安装。

- **在Linux容器上：** 支持OpenSSL支持的所有证书扩展。[了解更多。](https://www.openssl.org/docs/man1.1.1/man1/openssl-rehash.html)
- **在Windows容器上：** 支持`certoc.exe`支持的所有证书扩展。[查看Windows Server Core中的certoc.exe](https://hub.docker.com/_/microsoft-windows-servercore)。

## 演示

观看在社区电话64中使用安装SSL证书和安全使用HTTP绑定的演示：

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/M0VM7GlphAU?start=800" title="YouTube视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

## 相关链接
- [HTTP绑定规范]({{< ref http.md >}})
- [(Kubernetes) 操作指南：将Pod卷挂载到Dapr sidecar]({{< ref kubernetes-volume-mounts.md >}})
- [Dapr Kubernetes pod注释规范]({{< ref arguments-annotations-overview.md >}})

## 下一步

{{< button text="启用预览功能" page="preview-features" >}}