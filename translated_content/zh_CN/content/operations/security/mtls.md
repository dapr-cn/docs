---
type: docs
title: "设置 & 配置 mTLS 证书"
linkTitle: "设置 & 配置 mTLS 证书"
weight: 1000
description: "使用自签名或用户提供的 x.509 证书加密应用程序之间的通信"
---

Dapr 支持使用 Dapr 控制平面，Sentry 服务 (中央证书颁发机构(CA)) 对 Dapr 实例之间的通讯进行传输时加密。

Dapr 允许运维和开发人员引入自己的证书，或者让 Dapr 自动创建和保留自签名的根证书和颁发者证书。

有关 mTLS 的详细信息，请阅读 [安全概念部分]({{< ref "security-concept.md" >}})。

如果没有提供自定义证书，Dapr 将会自动创建并保存有效期为一年的自签名的证书。 在 Kubernetes 中，证书被持久保存到 secret 中，该 secret 位于 Dapr 系统 pods 所在的命名空间中，只能被 Dapr 系统 pods 访问。 在自托管模式下，证书被持久化到硬盘。

## 控制平面 Sentry 服务配置
mTLS 设置驻留在 Dapr 控制平面配置文件中。 例如，当您部署 Dapr 控制平面到 Kubernetes， 会自动创建此配置文件，然后您可以对其进行编辑。 以下的文件展示了部署在 `daprsystem` 命名空间的配置源中可用的 mTLS 配置：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "24h"
    allowedClockSkew: "15m"
```

此处展示了默认的 `daprsystem` 配置设置。 下面的示例向您展示了如何在 Kubernetes 和自托管模式下更改此配置并将其应用于控制平面 Sentry 服务。

## Kubernetes

### 使用配置资源设置 mTLS

在 Kubernetes 中，Dapr 创建一个开启了 mTLS 的默认控制平面配置资源。 Sentry 服务，即证书颁发机构系统 pod，通过 Helm 和 Dapr CLI 使用 `dapr init --kubernetes` 进行安装。

您可以使用如下命令查看控制平面配置资源：

`kubectl get configurations/daprsystem --namespace <DAPR_NAMESPACE> -o yaml`.

要对控制平面配置资源进行更改，请运行以下命令进行编辑：

```
kubectl edit configurations/daprsystem --namespace <DAPR_NAMESPACE>
```

一旦更改被保存，对控制平面执行滚动更新：

```
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

*注意：控制平面 Sidecar 的 Injector 服务不需要重新部署*

### 使用 Helm 禁用 mTLS

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### 使用 CLI 禁用 mTLS

```
dapr init --kubernetes --enable-mtls=false
```

### 查看日志

要查看 sentry 服务日志，请运行如下命令：

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```

### 自带证书

使用 Helm，您可以提供 PEM 编码的根证书，颁发者证书和私钥，这些证书将会填充到 Sentry 服务使用的 Kubernetes 秘密中。

_注意：此示例使用 OpenSSL 命令行工具，这是一个广泛发布的软件包，通过包管理器可以轻松的在 Linux 上安装。 在 Windwos 上，OpenSSL 可以 [使用 chocolatey ](https://community.chocolatey.org/packages/openssl) 安装。 在 MacOS上，可以使用 `brew install openssl` 安装。_

创建用于生成整数的配置文件，这对于使用 SAN (Subject Alt Name) 扩展字段生成 v3 证书是必须的。 首先保存以下内容到名为 `root.conf` 的文件中：

```ini
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no
[req_distinguished_name]
C = US
ST = VA
L = Daprville
O = dapr.io/sentry
OU = dapr.io/sentry
CN = cluster.local
[v3_req]
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, cRLSign, keyCertSign
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = cluster.local
```

对 `issuer.conf` 重复此操作，粘贴同样的内容到文件中，但是添加 `pathlen: 0` 到 basicConstraints 行的末尾，如下所示：

```ini
basicConstraints = critical, CA:true, pathlen:0
```

运行以下命令生成根证书和密钥：

```bash
openssl ecparam -genkey -name prime256v1 | openssl ec -out root.key
openssl req -new -nodes -sha256 -key root.key -out root.csr -config root.conf -extensions v3_req
openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -outform PEM -out root.pem -extfile root.conf -extensions v3_req
```

接下来，运行以下命令生成颁发者证书和密钥：

```bash
openssl ecparam -genkey -name prime256v1 | openssl ec -out issuer.key
openssl req -new -sha256 -key issuer.key -out issuer.csr -config issuer.conf -extensions v3_req
openssl x509 -req -in issuer.csr -CA root.pem -CAkey root.key -CAcreateserial -outform PEM -out issuer.pem -days 365 -sha256 -extfile issuer.conf -extensions v3_req
```

安装 Helm 并通过配置将根证书，颁发者证书和颁发者密钥传递给 Sentry：

```bash
kubectl create ns dapr-system

helm install \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.pem \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=root.pem \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### 更新根证书或者颁发证书

如果根证书或者颁发者证书即将过期，你可以更新他们并重启必要的系统服务。

首先，使用在 [携带您自己的证书](#bringing-your-own-certificates) 中的步骤颁发新证书。

现在，您有了新的证书，您可以更新保存他们的 Kubernetes 秘密。 编辑 Kubernetes secret：

```
kubectl edit secret dapr-trust-bundle -n <DAPR_NAMESPACE>
```

将 Kubernetes secret 中的 `ca.crt`, `issuer.crt` 和 `issuer.key` 键替换为新证书中的相应值。 *__注意：值必须是 base64 编码的__*

如果您使用了不同的私钥对新证书进行签名，重启所有启用了 Dapr 的 Pod。 建议的方法是执行 deployment 的滚动重启：

```
kubectl rollout restart deploy/myapp
```
### Kubernetes 视频演示
观看此视频，了解如何在 Kubernetes 上更新 mTLS 证书

<iframe width="1280" height="720" src="https://www.youtube.com/embed/_U9wJqq-H1g" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 自托管
### 运行控制平面 Sentry 服务

为了运行 Sentry 服务，您可以从源码构建，或者从 [此处](https://github.com/dapr/dapr/releases) 下载发布的二进制文件。

当从源码构建时，请参阅 Dapr 的 [这个](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) 指南，了解如何构建 Dapr。

然后，为 Sentry 服务创建目录以创建自签名的根证书：

```
mkdir -p $HOME/.dapr/certs
```

使用以下的命令在本地运行 Sentry服务：

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

如果成功，Sentry 服务将会运行并在指定的目录创建根证书。 此命令使用默认配置值，因为未提供自定义配置文件。 请参阅下文，了解如何使用自定义配置启动 Sentry 服务。

### 使用配置资源设置 mTLS

#### Dapr 实例配置

当在自托管模式下运行 Dapr 时，默认情况下禁用 mTLS。 您可以通过创建如下的配置文件启用它：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
```

除了 Dapr 配置之外，您还需要为每个 Dapr sidecar 实例提供 TLS 证书。 为此，您可以在运行 Dapr 实例之前设置如下的环境变量：

{{< tabs "Linux/MacOS" Windows >}}

{{% codetab %}}
```bash
export DAPR_TRUST_ANCHORS=`cat $HOME/.dapr/certs/ca.crt`
export DAPR_CERT_CHAIN=`cat $HOME/.dapr/certs/issuer.crt`
export DAPR_CERT_KEY=`cat $HOME/.dapr/certs/issuer.key`
export NAMESPACE=default
```

{{% /codetab %}}

{{% codetab %}}
```powershell
$env:DAPR_TRUST_ANCHORS=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\ca.crt)
$env:DAPR_CERT_CHAIN=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.crt)
$env:DAPR_CERT_KEY=$(Get-Content -raw $env:USERPROFILE\.dapr\certs\issuer.key)
$env:NAMESPACE="default"
```

{{% /codetab %}}

{{< /tabs >}}

如果使用 Dapr CLI，将 Dapr 指向上面的配置文件，以在启用 mTLS 的情况下运行 Dapr 实例：

```
dapr run --app-id myapp --config ./config.yaml node myapp.js
```

如果直接使用 `daprd` ，使用如下参数启用 mTLS：

```bash
daprd --app-id myapp --enable-mtls --sentry-address localhost:50001 --config=./config.yaml
```

#### Sentry 服务配置

下面是 Sentry 的配置示例，它将工作负载证书 TTL 更改为 25 秒：

```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: daprsystem
  namespace: default
spec:
  mtls:
    enabled: true
    workloadCertTTL: "25s"
```

要使用自定义配置启动 Sentry 服务，请使用以下标志：

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

### 自带证书

要提供您自己的凭据，创建 ECDSA PEM 编码的根证书和颁发者证书，并且将它们放在文件系统上。 使用 `--issuer-credentials` 标志告诉 Sentry 服务从何处加载证书。

接下来的示例创建根证书和颁发者证书，并使用哨兵服务加载他们。

*注意：此示例使用 step 工具创建证书。 您可以从 [此处](https://smallstep.com/docs/getting-started/) 安装 step 工具。 Windows 二进制文件在 [此处](https://github.com/smallstep/cli/releases)*

创建根证书：

```bash
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

创建颁发者证书：

```bash
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

这将创建根证书和颁发者证书和密钥。 将 `ca.crt`, `issuer.crt` 和 `issuer.key` 放在所需的路径中 (在下面的实例中为 `$HOME/.dapr/certs`)，然后启动 Sentry：

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

### 更新根证书或颁发者证书

如果根证书或者颁发者证书即将过期，你可以更新他们并重启必要的系统服务。

首先，使用在 [自带证书](#bringing-your-own-certificates) 中的步骤颁发新证书。

将 `ca.crt`, `issuer.crt` 和 `issuer.key` 复制到每个已配置的系统服务的文件系统路径，然后重启进程或容器。 默认情况下，系统服务将在 `/var/run/dapr/credentials` 中查找凭据。

*注意：如果您使用不同的私钥对证书根目录进行了签名，请重新启动 Dapr 实例。*
