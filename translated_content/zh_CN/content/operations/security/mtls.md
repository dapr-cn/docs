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

如果没有提供自定义证书，Dapr 将会自动创建并保存有效期为一年的自签名的证书。 In Kubernetes, the certs are persisted to a secret that resides in the namespace of the Dapr system pods, accessible only to them. 在自托管模式下，证书被持久化到硬盘。

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

The file here shows the default `daprsystem` configuration settings. 下面的示例向您展示了如何在 Kubernetes 和自托管模式下更改此配置并将其应用于控制平面 Sentry 服务。

## Kubernetes

### Setting up mTLS with the configuration resource

在 Kubernetes 中，Dapr 创建一个开启了 mTLS 的默认控制平面配置资源。 Sentry 服务，即证书颁发机构系统 pod，通过 Helm 和 Dapr CLI 使用 `dapr init --kubernetes` 进行安装。

您可以使用如下命令查看控制平面配置资源：

`kubectl get configurations/daprsystem --namespace <DAPR_NAMESPACE> -o yaml`.

要对控制平面配置资源进行更改，请运行以下命令进行编辑：

```
kubectl edit configurations/daprsystem --namespace <DAPR_NAMESPACE>
```

Once the changes are saved, perform a rolling update to the control plane:

```
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

*注意：控制平面 Sidecar 的 Injector 服务不需要重新部署*

### Disabling mTLS with Helm
*控制平面将继续使用mTLS*

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### Disabling mTLS with the CLI
*控制平面将继续使用mTLS*

```
dapr init --kubernetes --enable-mtls=false
```

### Viewing logs

要查看 sentry 服务日志，请运行如下命令：

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```
### Bringing your own certificates

使用 Helm，您可以提供 PEM 编码的根证书，颁发者证书和私钥，这些证书将会填充到 Sentry 服务使用的 Kubernetes 秘密中。

{{% alert title="Avoiding downtime" color="warning" %}}
为了避免轮换过期证书时出现宕机时间，请确保始终使用相同的私有根密钥对你的证书进行签名。
{{% /alert %}}

_Note: This example uses the OpenSSL command line tool, this is a widely distributed package, easily installed on Linux via the package manager. On Windows OpenSSL can be installed [using chocolatey](https://community.chocolatey.org/packages/openssl). On MacOS it can be installed using brew `brew install openssl`_

Create config files for generating the certificates, this is necessary for generating v3 certificates with the SAN (Subject Alt Name) extension fields. First save the following to a file named `root.conf`:

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

Repeat this for `issuer.conf`, paste the same contents into the file, but add `pathlen:0` to the end of the basicConstraints line, as shown below:

```ini
basicConstraints = critical, CA:true, pathlen:0
```

Run the following to generate the root cert and key

```bash
# skip the following line to reuse an existing root key, required for rotating expiring certificates
openssl ecparam -genkey -name prime256v1 | openssl ec -out root.key
openssl req -new -nodes -sha256 -key root.key -out root.csr -config root.conf -extensions v3_req
openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -outform PEM -out root.pem -extfile root.conf -extensions v3_req
```

Next run the following to generate the issuer cert and key:

```bash
# skip the following line to reuse an existing issuer key, required for rotating expiring certificates
openssl ecparam -genkey -name prime256v1 | openssl ec -out issuer.key
openssl req -new -sha256 -key issuer.key -out issuer.csr -config issuer.conf -extensions v3_req
openssl x509 -req -in issuer.csr -CA root.pem -CAkey root.key -CAcreateserial -outform PEM -out issuer.pem -days 365 -sha256 -extfile issuer.conf -extensions v3_req
```

Install Helm and pass the root cert, issuer cert and issuer key to Sentry via configuration:

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
### Root and issuer certificate upgrade using CLI (Recommended)
The CLI commands below can be used to renew root and issuer certificates in your Kubernetes cluster.

#### Generate brand new certificates

1. The command below generates brand new root and issuer certificates, signed by a newly generated private root key.

> **Note: The `Dapr sentry service` followed by rest of the control plane services must be restarted for them to be able to read the new certificates. This can be done by supplying `--restart` flag to the command.**

```bash
dapr mtls renew-certificate -k --valid-until <days> --restart
```
2. The command below generates brand new root and issuer certificates, signed by provided private root key.

> **Note: If your existing deployed certificates are signed by this same private root key, the `Dapr Sentry service` can then read these new certificates without restarting.**

```bash
dapr mtls renew-certificate -k --private-key <private_key_file_path> --valid-until <days>
```
#### Renew certificates by using provided custom certificates
To update the provided certificates in the Kubernetes cluster, the CLI command below can be used.

> **Note - It does not support `valid-until` flag to specify validity for new certificates.**

```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.crt> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.crt> --restart
```

{{% alert title="Restart Dapr-enabled pods" color="warning" %}}
Irrespective of which command was used to renew the certificates, you must restart all Dapr-enabled pods. Due to certificate mismatches, you might experience some downtime till all deployments have successfully been restarted.
{{% /alert %}}
The recommended way to do this is to perform a rollout restart of your deployment:
```
kubectl rollout restart deploy/myapp
```

### Updating root or issuer certs using Kubectl

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

{{% alert title="Avoiding downtime when rotating certificates" color="warning" %}}
为了避免在轮换过期证书时出现宕机时间，务必要保证使用与前期证书相同的私有根密钥对你的证书进行签名。 目前使用Dapr生成的自签名证书还做不到这一点。
{{% /alert %}}

#### Dapr生成的自签名证书

1. 将下列YAML内容保存到文件 (e.g. `clear-trust-bundle.yaml`)中，通过部署该YAML文件来清理Dapr中已经存在的信任包密钥。
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dapr-trust-bundle
  labels:
    app: dapr-sentry
data:
```

```bash
kubectl apply -f `clear-trust-bundle.yaml` -n <DAPR_NAMESPACE>
```

2. 重启Dapr Sentry 服务。 这将生成一个新的证书包并更新 `dapr-trust-bundle` Kubernetes 密钥对象。

```bash
kubectl rollout restart -n <DAPR_NAMESPACE> deployment/dapr-sentry
```

3. 一旦Sentry服务被重启，重启其余的Dapr控制平面去加载新的Dapr信任包。

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

4. 重新启动你的Dapr应用程序，以获取最新的信任包。

{{% alert title="Potential application downtime with mTLS enabled." color="warning" %}}
使用mTLS的服务间调用部署重启将会失败，直到被调用方服务也重新启动完成(从而加载新的Dapr信任包)。 此外，在应用重新启动加载新的Dapr信任包之前，已经就绪的服务将无法指派新的actors(然而已经存在的actors将不受影响)。
{{% /alert %}}

```bash
kubectl rollout restart deployment/mydaprservice1 kubectl deployment/myotherdaprservice2
```

#### 自定义证书(携带您自己的证书)

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

现在您有了这些新证书，使用Helm去升级这些证书:

```bash
helm upgrade \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.pem \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=root.pem \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

或者，你可以更新保存这些密钥的Kubernetes secret对象:

```bash
kubectl edit secret dapr-trust-bundle -n <DAPR_NAMESPACE>
```

Replace the `ca.crt`, `issuer.crt` and `issuer.key` keys in the Kubernetes secret with their corresponding values from the new certificates. *__Note: The values must be base64 encoded__*

如果，你使用**相同的私钥**签发这个新根证书，Dapr Sentry 服务将会自动获取新证书。 你可以使用`kubectl rollout restart` 来实现应用的平滑重启。 不需要将所有部署全部立刻重启，只要在原证书到期之前完成重启即可。

如果你使用了一个**不同的私钥**签发了新根证书, 你必须重启Dapr Sentry服务，然后重启其他Dapr控制平面服务。

```bash
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
```

一旦 Sentry 已经重新启动，开始运行:

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

接下来，你必须重启所有Dapr-enabled pods。 The recommended way to do this is to perform a rollout restart of your deployment:

```
kubectl rollout restart deploy/myapp
```

由于不匹配证书，在所有部署成功部署之前(因为加载了新的Dapr证书)，你可能会经历宕机时间。

### Kubernetes 视频演示
观看此视频，了解如何在 Kubernetes 上更新 mTLS 证书

<iframe width="1280" height="720" src="https://www.youtube.com/embed/_U9wJqq-H1g" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

### Set up monitoring for Dapr control plane mTLS certificate expiration

Beginning 30 days prior to mTLS root certificate expiration the Dapr sentry service will emit hourly warning level logs indicating that the root certificate is about to expire.

As an operational best practice for running Dapr in production we recommend configuring monitoring for these particular sentry service logs so that you are aware of the upcoming certificate expiration.

```bash
"Dapr root certificate expiration warning: certificate expires in 2 days and 15 hours"
```

Once the certificate has expired you will see the following message:

```bash
"Dapr root certificate expiration warning: certificate has expired."
```

In Kubernetes you can view the sentry service logs like so:

```bash
kubectl logs deployment/dapr-sentry -n dapr-system
```

The log output will appear like the following:"

```bash
{"instance":"dapr-sentry-68cbf79bb9-gdqdv","level":"warning","msg":"Dapr root certificate expiration warning: certificate expires in 2 days and 15 hours","scope":"dapr.sentry","time":"2022-04-01T23:43:35.931825236Z","type":"log","ver":"1.6.0"}
```

As an additional tool to alert you to the upcoming certificate expiration beginning with release 1.7.0 the CLI now prints the certificate expiration status whenever you interact with a Kubernetes-based deployment.

示例:
```bash
dapr status -k

  NAME                   NAMESPACE    HEALTHY  STATUS   REPLICAS  VERSION   AGE  CREATED
  dapr-sentry            dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-dashboard         dapr-system  True     Running  1         0.9.0     17d  2022-03-15 09:29.45
  dapr-sidecar-injector  dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-operator          dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
  dapr-placement-server  dapr-system  True     Running  1         1.7.0     17d  2022-03-15 09:29.45
⚠  Dapr root certificate of your Kubernetes cluster expires in 2 days. Expiry date: Mon, 04 Apr 2022 15:01:03 UTC.
 Please see docs.dapr.io for certificate renewal instructions to avoid service interruptions.
```

## 自托管
### 运行控制平面 Sentry 服务

为了运行 Sentry 服务，您可以从源码构建，或者从 [此处](https://github.com/dapr/dapr/releases) 下载发布的二进制文件。

When building from source, please refer to [this](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) guide on how to build Dapr.

然后，为 Sentry 服务创建目录以创建自签名的根证书：

```
mkdir -p $HOME/.dapr/certs
```

使用以下的命令在本地运行 Sentry服务：

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

如果成功，Sentry 服务将会运行并在指定的目录创建根证书。 This command uses default configuration values as no custom config file was given. 请参阅下文，了解如何使用自定义配置启动 Sentry 服务。

### Setting up mTLS with the configuration resource

#### Dapr instance configuration

When running Dapr in self hosted mode, mTLS is disabled by default. you can enable it by creating the following configuration file:

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

除了 Dapr 配置之外，您还需要为每个 Dapr sidecar 实例提供 TLS 证书。 You can do so by setting the following environment variables before running the Dapr instance:

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

If using the Dapr CLI, point Dapr to the config file above to run the Dapr instance with mTLS enabled:

```
dapr run --app-id myapp --config ./config.yaml node myapp.js
```

If using `daprd` directly, use the following flags to enable mTLS:

```bash
daprd --app-id myapp --enable-mtls --sentry-address localhost:50001 --config=./config.yaml
```

#### Sentry 服务配置

Here's an example of a configuration for Sentry that changes the workload cert TTL to 25 seconds:

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

### Bringing your own certificates

In order to provide your own credentials, create ECDSA PEM encoded root and issuer certificates and place them on the file system. 使用 `--issuer-credentials` 标志告诉 Sentry 服务从何处加载证书。

接下来的示例创建根证书和颁发者证书，并使用哨兵服务加载他们。

*Note: This example uses the step tool to create the certificates. You can install step tool from [here](https://smallstep.com/docs/getting-started/). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

Create the root certificate:

```bash
step certificate create cluster.local ca.crt ca.key --profile root-ca --no-password --insecure
```

Create the issuer certificate:

```bash
step certificate create cluster.local issuer.crt issuer.key --ca ca.crt --ca-key ca.key --profile intermediate-ca --not-after 8760h --no-password --insecure
```

This creates the root and issuer certs and keys. Place `ca.crt`, `issuer.crt` and `issuer.key` in a desired path (`$HOME/.dapr/certs` in the example below), and launch Sentry:

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

### 更新根证书或颁发者证书

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

为了让Dapr生成新证书，首先将`$HOME/.dapr/certs` 目录里的证书删除，然后重启Sentry服务去生成新证书。

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

为了替换为您自己的证书，首先使用上述在 [携带您自己的证书](#bringing-your-own-certificates)步骤生成新证书。

Copy `ca.crt`, `issuer.crt` and `issuer.key` to the filesystem path of every configured system service, and restart the process or container. By default, system services will look for the credentials in `/var/run/dapr/credentials`. 上述示例使用`$HOME/.dapr/certs` 作为自定义的路径。

*备注：如果您使用了一个不同的私有秘钥签发这个根证书，需要重启Dapr实例。*

## 关于证书轮换的社区视频
Watch this [video](https://www.youtube.com/watch?v=Hkcx9kBDrAc&feature=youtu.be&t=1400) on how to perform certificate rotation if your certicates are expiring.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube.com/embed/Hkcx9kBDrAc?start=1400"></iframe>
</div>
