---
type: docs
title: "mtls 续订证书 CLI 命令参考"
linkTitle: "mtls 续费证书"
description: "有关 mtls 续订证书 CLI 命令的详细信息"
weight: 3000
---

### 说明
此命令可用于续订即将过期的 Dapr 证书。 例如，Dapr Sentry 服务可以生成应用程序使用的默认根证书和颁发者证书。 有关详细信息，请参阅 [ Dapr 到 Dapr安全通信]({{< ref "#secure-dapr-to-dapr-communication" >}})

### Supported platforms

- [Kubernetes]({{< ref kubernetes >}})

### Usage

```bash
dapr mtls renew-certificate [flags]
```

### Flags

| 名称                            | 环境变量 | 默认值     | 说明                                                |
| ----------------------------- | ---- | ------- | ------------------------------------------------- |
| `--help`, `-h`                |      |         | 续订证书的帮助                                           |
| `--kubernetes`, `-k`          |      | `false` | 支持平台                                              |
| `--valid-until`               |      | 365 天   | 新创建的证书的有效期                                        |
| `--restart`                   |      | false   | 重新启动 Dapr 控制平面服务（Sentry服务、Operator服务和 Placemen服务） |
| `--timeout`                   |      | 300 秒   | 证书续订进程的超时时间                                       |
| `--ca-root-certificate`       |      |         | 用户提供的 PEM 根证书的文件路径                                |
| `--issuer-public-certificate` |      |         | 用户提供的 PEM 颁发者证书的文件路径                              |
| `--issuer-private-key`        |      |         | 用户提供的 PEM 颁发私钥的文件路径                               |
| `--private-key`               |      |         | 用户提供的root.key文件，用于生成根证书                           |

### Examples

#### 通过生成全新的证书续订证书
为 Kubernetes 集群生成新的根证书和颁发者证书，默认有效期为 365 天。 证书不应用于 Dapr 控制平面。
```bash
dapr mtls renew-certificate -k
```
为 Kubernetes 集群生成新的根证书和颁发者证书，默认有效期为 365 天，并重新启动 Dapr 控制平面服务。
```bash
dapr mtls renew-certificate -k --restart
```
为 Kubernetes 集群生成具有给定有效期的新根证书和颁发者证书。
```bash
dapr mtls renew-certificate -k --valid-until <no of days>
```
Generates new root and issuer certificates for the Kubernetes cluster with a given validity time and restarts the Dapr control plane services.
```bash
dapr mtls renew-certificate -k --valid-until <no of days> --restart
```
#### 使用用户提供的证书续订证书
使用提供的 ca.pem、issuer.pem 和issuer.key 文件路径，轮换 Kubernetes 集群的证书并重新启动 Dapr 控制平面服务
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem> --restart
```
使用提供的 ca.pem、issuer.pem 和 issuer.key文件路径轮换 Kubernetes 集群的证书。
```bash
dapr mtls renew-certificate -k --ca-root-certificate <ca.pem> --issuer-private-key <issuer.key> --issuer-public-certificate <issuer.pem>
```
#### 通过使用提供的根私有秘钥生成全新的证书来续订证书
使用现有的私有 root.key为 Kubernetes 集群生成新的根证书和颁发者证书，并为创建的证书提供给定的有效期。
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key --valid-until <no of days>
```
使用现有的root.key为 Kubernetes 集群生成新的根证书和颁发者证书。
```bash
dapr mtls renew-certificate -k --private-key myprivatekey.key
```