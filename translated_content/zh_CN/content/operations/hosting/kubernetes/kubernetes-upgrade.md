---
type: docs
title: "更新 Kubernetes 集群中的 Dapr"
linkTitle: "升级 Dapr"
weight: 30000
description: "请按照以下步骤在 Kubernetes 上升级 Dapr 并确保顺利升级。"
---

## 先决条件

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Helm 3](https://github.com/helm/helm/releases) (如果使用 Helm)

## 升级现有集群到 {{% dapr-latest-version long="true" %}}
有两种方法可以使用 Dapr CLI 或 Helm 在 Kubernetes 集群上升级 Dapr 控制平面。

### Dapr CLI

下面的示例展示了如何升级到版本 {{% dapr-latest-version long="true" %}}：

  ```bash
  dapr upgrade -k --runtime-version={{% dapr-latest-version long="true" %}}
  ```

您可以使用 Dapr CLI 提供所有可用的 Helm chart 配置。 请参阅 [这里](https://github.com/dapr/cli#supplying-helm-values) 以获取更多信息。

#### 使用 CLI 进行故障排除升级

在群集上运行升级时存在一个已知问题，该群集上以前可能安装了 1.0.0-rc.2 之前的版本。

大多数用户不应该遇到这个问题。 但有几个升级路径边缘案例可能会在您的集群中安装不兼容的CustomResourceDefinition。 此情况下的错误消息如下所示：

```
❌  Failed to upgrade Dapr: Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
The CustomResourceDefinition "configurations.dapr.io" is invalid: spec.preserveUnknownFields: Invalid value: true: must be false in order to use defaults in the schema

```

要解决此问题，请运行以下命令，将自定义资源定义升级到兼容版本：

```
kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/5a15b3e0f093d2d0938b12f144c7047474a290fe/charts/dapr/crds/configuration.yaml
```

然后继续执行 `dapr upgrade --runtime-version {{% dapr-latest-version long="true" %}} -k` 。

### Helm

从1.0.0版本开始，使用 Helm 升级 Dapr 不再是一个破坏性的动作，因为现有的证书值将自动被重新使用。

1. 将 Dapr 从1.0.0 (或更新) 升级到任何[新版本] > v1.0.0。

   *Helm 并不处理 CRD 的更新，所以您需要手动执行。 CRD 是向后兼容的，并且应当只能向前安装。*
> 注意：Dapr 版本包含在下面的命令行中。

   对于版本 {{% dapr-latest-version long="true" %}}：

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
   *如果你使用的是 values 文件，记得在运行升级命令时添加 `--values` 选项。*

2. 确保所有 Pod 都在运行：

   ```bash
   kubectl get pods -n dapr-system -w

   NAME                                     READY   STATUS    RESTARTS   AGE
   dapr-dashboard-69f5c5c867-mqhg4          1/1     Running   0          42s
   dapr-operator-5cdd6b7f9c-9sl7g           1/1     Running   0          41s
   dapr-placement-server-0                  1/1     Running   0          41s
   dapr-sentry-84565c747b-7bh8h             1/1     Running   0          35s
   dapr-sidecar-injector-68f868668f-6xnbt   1/1     Running   0          41s
   ```

3. 重新启动应用程序的 deployment 以更新 Dapr 运行时。

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

4. 全部完成！

#### 升级现有 Dapr 以启用高可用模式

在现有 Dapr 部署中启用高可用模式需要额外的步骤。 更多详细信息，请参阅 [本段]({{< ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" >}}) 。


## 下一步

- [Kubernetes上的 Dapr]({{< ref kubernetes-overview.md >}})
- [Dapr 生产环境指南]({{< ref kubernetes-production.md >}})
