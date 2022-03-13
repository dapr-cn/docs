---
type: docs
title: "更新 Kubernetes 集群中的 Dapr"
linkTitle: "升级 Dapr"
weight: 30000
description: "按照这些步骤升级 Kubernetes 上的 Dapr，并确保顺利升级."
---

## 先决条件

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Helm 3](https://github.com/helm/helm/releases) (如果使用 Helm)

## Upgrade existing cluster to {{% dapr-latest-version long="true" %}}
有两种方法可以使用Dapr CLI或Helm升级Kubernetes集群上的Dapr control plane。

### Dapr CLI

The example below shows how to upgrade to version {{% dapr-latest-version long="true" %}}:

  ```bash
  dapr upgrade -k --runtime-version={{% dapr-latest-version long="true" %}}
  ```

您可以使用Dapr CLI提供所有可用的Helm chart配置。 请参阅 [这里](https://github.com/dapr/cli#supplying-helm-values) 以获取更多信息。

#### 使用 CLI 进行故障排除升级

在集群上安装 1.0.0-rc.2 之前，可能以前有一个版本，但在集群上运行升级时存在一个已知问题。

大多数用户不应该遇到这个问题。 但有几个升级路径边缘案例可能会在您的集群中安装不兼容的CustomResourceDefin。 此案例的错误消息看起来像这样：

```
❌  Failed to upgrade Dapr: Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
The CustomResourceDefinition "configurations.dapr.io" is invalid: spec.preserveUnknownFields: Invalid value: true: must be false in order to use defaults in the schema

```

要解决此问题，请运行以下命令，将自定义资源定义升级到兼容版本：

```
kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/5a15b3e0f093d2d0938b12f144c7047474a290fe/charts/dapr/crds/configuration.yaml
```

Then proceed with the `dapr upgrade --runtime-version {{% dapr-latest-version long="true" %}} -k` command as above.

### Helm

从1.0.0版本开始，使用Helm升级Dapr不再是一个破坏性的动作，因为现有的证书值将自动被重新使用。

1. Upgrade Dapr from 1.0.0 (or newer) to any [NEW VERSION] > 1.0.0:

   *Helm does not handle upgrading CRDs, so you need to perform that manually. CRDs are backward-compatible and should only be installed forward.*
> Note: The Dapr version is included in the commands below.

   For version {{% dapr-latest-version long="true" %}}:

   ```bash
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/components.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/configuration.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/subscription.yaml
   ```

   ```bash
   helm repo update
   ```

   ```bash
   helm upgrade dapr dapr/dapr --version {{% dapr-latest-version long="true" %}} --namespace dapr-system --wait
   ```
   *如果你使用的是values文件，记得在运行升级命令时添加`--values`选项。*

2. 确保所有pod正在运行：

   ```bash
   kubectl get pods -n dapr-system -w

   NAME                                     READY   STATUS    RESTARTS   AGE
   dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   ```

3. 重新启动您的应用程序 deployments 以更新 Dapr 运行时。

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

4. 全部完成！

#### Upgrading existing Dapr to enable high availability mode

Enabling HA mode in an existing Dapr deployment requires additional steps. Please refer to [this paragraph]({{< ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" >}}) for more details.


## 下一步

- [Kubernetes上的 Dapr]({{< ref kubernetes-overview.md >}})
- [Dapr生产环境指南]({{< ref kubernetes-production.md >}})
