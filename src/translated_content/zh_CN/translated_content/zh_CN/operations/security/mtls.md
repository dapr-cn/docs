---
type: docs
title: "Setup & configure mTLS certificates"
linkTitle: "Setup & configure mTLS certificates"
weight: 1000
description: "Encrypt communication between applications using self-signed or user supplied x.509 certificates"
---

Dapr supports in-transit encryption of communication between Dapr instances using the Dapr control plane, Sentry service, which is a central Certificate Authority (CA).

Dapr 允许运维和开发人员引入自己的证书，或者让 Dapr 自动创建和保留自签名的根证书和颁发者证书。

有关 mTLS 的详细信息，请阅读 [安全概念部分]({{< ref "security-concept.md" >}})。

如果没有提供自定义证书，Dapr 将会自动创建并保存有效期为一年的自签名的证书。 在 Kubernetes 中，证书被持久保存到 secret 中，该 secret 位于 Dapr 系统 pods 所在的命名空间中，只能被 Dapr 系统 pods 访问。 在自托管模式下，证书被持久化到硬盘。

## Control plane Sentry service configuration
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

### Setting up mTLS with the configuration resource

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
*控制平面将继续使用mTLS*

```bash
kubectl create ns dapr-system

helm install \
  --set global.mtls.enabled=false \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

### 使用 CLI 禁用 mTLS
*控制平面将继续使用mTLS*

```
dapr init --kubernetes --enable-mtls=false
```

### 查看日志

In order to view the Sentry service logs, run the following command:

```
kubectl logs --selector=app=dapr-sentry --namespace <DAPR_NAMESPACE>
```
### 自带证书

Using Helm, you can provide the PEM encoded root cert, issuer cert and private key that will be populated into the Kubernetes secret used by the Sentry service.

{{% alert title="Avoiding downtime" color="warning" %}}
为了避免轮换过期证书时出现宕机时间，请确保始终使用相同的私有根密钥对你的证书进行签名。
{{% /alert %}}

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
# skip the following line to reuse an existing root key, required for rotating expiring certificates
openssl ecparam -genkey -name prime256v1 | openssl ec -out root.key
openssl req -new -nodes -sha256 -key root.key -out root.csr -config root.conf -extensions v3_req
openssl x509 -req -sha256 -days 365 -in root.csr -signkey root.key -outform PEM -out root.pem -extfile root.conf -extensions v3_req
```

接下来，运行以下命令生成颁发者证书和密钥：

```bash
# skip the following line to reuse an existing issuer key, required for rotating expiring certificates
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
To avoid downtime when rotating expiring certificates your new certificates must be signed with the same private root key as the previous certificates. This is not currently possible using self-signed certificates generated by Dapr.
{{% /alert %}}

#### Dapr-generated self-signed certificates

1. Clear the existing Dapr Trust Bundle secret by saving the following YAML to a file (e.g. `clear-trust-bundle.yaml`) and applying this secret.
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

2. Restart the Dapr Sentry service. This will generate a new certificate bundle and update the `dapr-trust-bundle` Kubernetes secret.

```bash
kubectl rollout restart -n <DAPR_NAMESPACE> deployment/dapr-sentry
```

3. Once the Sentry service has been restarted, restart the rest of the Dapr control plane to pick up the new Dapr Trust Bundle.

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

4. Restart your Dapr applications to pick up the latest trust bundle.

{{% alert title="Potential application downtime with mTLS enabled." color="warning" %}}
Restarts of deployments using service to service invocation using mTLS will fail until the callee service has also been restarted (thereby loading the new Dapr Trust Bundle). Additionally, the placement service will not be able to assign new actors (while existing actors remain unaffected) until applications have been restarted to load the new Dapr Trust Bundle.
{{% /alert %}}

```bash
kubectl rollout restart deployment/mydaprservice1 kubectl deployment/myotherdaprservice2
```

#### Custom certificates (bring your own)

First, issue new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Now that you have the new certificates, use Helm to upgrade the certificates:

```bash
helm upgrade \
  --set-file dapr_sentry.tls.issuer.certPEM=issuer.pem \
  --set-file dapr_sentry.tls.issuer.keyPEM=issuer.key \
  --set-file dapr_sentry.tls.root.certPEM=root.pem \
  --namespace dapr-system \
  dapr \
  dapr/dapr
```

Alternatively, you can update the Kubernetes secret that holds them:

```bash
kubectl edit secret dapr-trust-bundle -n <DAPR_NAMESPACE>
```

Replace the `ca.crt`, `issuer.crt` and `issuer.key` keys in the Kubernetes secret with their corresponding values from the new certificates. *__Note: The values must be base64 encoded__*

If you signed the new cert root with the **same private key** the Dapr Sentry service will pick up the new certificates automatically. You can restart your application deployments using `kubectl rollout restart` with zero downtime. It is not necessary to restart all deployments at once, as long as deployments are restarted before original certificate expiration.

If you signed the new cert root with a **different private key**, you must restart the Dapr Sentry service, followed by the remainder of the Dapr control plane service.

```bash
kubectl rollout restart deploy/dapr-sentry -n <DAPR_NAMESPACE>
```

Once Sentry has been completely restarted run:

```bash
kubectl rollout restart deploy/dapr-operator -n <DAPR_NAMESPACE>
kubectl rollout restart statefulsets/dapr-placement-server -n <DAPR_NAMESPACE>
```

Next, you must restart all Dapr-enabled pods. The recommended way to do this is to perform a rollout restart of your deployment:

```
kubectl rollout restart deploy/myapp
```

You will experience potential downtime due to mismatching certificates until all deployments have successfully been restarted (and hence loaded the new Dapr certificates).

### Kubernetes video demo
Watch this video to show how to update mTLS certificates on Kubernetes

<iframe width="1280" height="720" src="https://www.youtube-nocookie.com/embed/_U9wJqq-H1g" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

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

示例︰
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
### Running the control plane Sentry service

In order to run the Sentry service, you can either build from source, or download a release binary from [here](https://github.com/dapr/dapr/releases).

When building from source, please refer to [this](https://github.com/dapr/dapr/blob/master/docs/development/developing-dapr.md#build-the-dapr-binaries) guide on how to build Dapr.

Second, create a directory for the Sentry service to create the self signed root certs:

```
mkdir -p $HOME/.dapr/certs
```

Run the Sentry service locally with the following command:

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local
```

If successful, the Sentry service runs and creates the root certs in the given directory. This command uses default configuration values as no custom config file was given. See below on how to start the Sentry service with a custom configuration.

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

In addition to the Dapr configuration, you also need to provide the TLS certificates to each Dapr sidecar instance. You can do so by setting the following environment variables before running the Dapr instance:

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

#### Sentry service configuration

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

In order to start Sentry service with a custom config, use the following flag:

```
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

### 自带证书

In order to provide your own credentials, create ECDSA PEM encoded root and issuer certificates and place them on the file system. Tell the Sentry service where to load the certificates from using the `--issuer-credentials` flag.

The next examples creates root and issuer certs and loads them with the Sentry service.

*Note: This example uses the step tool to create the certificates. You can install step tool from [here](https://smallstep.com/docs/step-cli/installation). Windows binaries available [here](https://github.com/smallstep/cli/releases)*

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

### Updating root or issuer certificates

If the Root or Issuer certs are about to expire, you can update them and restart the required system services.

To have Dapr generate new certificates, delete the existing certificates at `$HOME/.dapr/certs` and restart the sentry service to generate new certificates.

```bash
./sentry --issuer-credentials $HOME/.dapr/certs --trust-domain cluster.local --config=./config.yaml
```

To replace with your own certificates, first generate new certificates using the step above in [Bringing your own certificates](#bringing-your-own-certificates).

Copy `ca.crt`, `issuer.crt` and `issuer.key` to the filesystem path of every configured system service, and restart the process or container. By default, system services will look for the credentials in `/var/run/dapr/credentials`. The examples above use `$HOME/.dapr/certs` as a custom location.

*Note: If you signed the cert root with a different private key, restart the Dapr instances.*

## 关于证书轮换的社区视频
Watch this [video](https://www.youtube.com/watch?v=Hkcx9kBDrAc&feature=youtu.be&t=1400) on how to perform certificate rotation if your certicates are expiring.

<div class="embed-responsive embed-responsive-16by9">
<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/Hkcx9kBDrAc?start=1400"></iframe>
</div>
