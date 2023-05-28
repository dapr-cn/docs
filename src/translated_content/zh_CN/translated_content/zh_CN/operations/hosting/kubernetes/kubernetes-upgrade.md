---
type: docs
title: "更新 Kubernetes 集群中的 dapr"
linkTitle: "升级 Dapr"
weight: 50000
description: "请按照以下步骤在 Kubernetes 上升级 Dapr 并确保顺利升级。"
---

## Prerequisites

- [Dapr CLI]({{< ref install-dapr-cli.md >}})
- [Helm 3](https://github.com/helm/helm/releases) (if using Helm)

## 升级现有集群到 {{% dapr-latest-version long="true" %}}
There are two ways to upgrade the Dapr control plane on a Kubernetes cluster using either the Dapr CLI or Helm.

{{% alert title="Note" color="primary" %}}
Refer to the [Dapr version policy]({{< ref "support-release-policy.md#upgrade-paths" >}}) for guidance on which versions of Dapr can be upgraded to which versions.
{{% /alert %}}

### Dapr CLI

The example below shows how to upgrade to version {{% dapr-latest-version long="true" %}}:

  ```bash
  dapr upgrade -k --runtime-version={{% dapr-latest-version long="true" %}}
  ```

You can provide all the available Helm chart configurations using the Dapr CLI. See [here](https://github.com/dapr/cli#supplying-helm-values) for more info.

#### Troubleshooting upgrade using the CLI

There is a known issue running upgrades on clusters that may have previously had a version prior to 1.0.0-rc.2 installed on a cluster.

Most users should not encounter this issue, but there are a few upgrade path edge cases that may leave an incompatible CustomResourceDefinition installed on your cluster. The error message for this case looks like this:

```
❌  Failed to upgrade Dapr: Warning: kubectl apply should be used on resource created by either kubectl create --save-config or kubectl apply
The CustomResourceDefinition "configurations.dapr.io" is invalid: spec.preserveUnknownFields: Invalid value: true: must be false in order to use defaults in the schema

```

To resolve this issue please run the follow command to upgrade the CustomResourceDefinition to a compatible version:

```
kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/5a15b3e0f093d2d0938b12f144c7047474a290fe/charts/dapr/crds/configuration.yaml
```

Then proceed with the `dapr upgrade --runtime-version {{% dapr-latest-version long="true" %}} -k` command as above.

### Helm

From version 1.0.0 onwards, upgrading Dapr using Helm is no longer a disruptive action since existing certificate values will automatically be re-used.

1. Upgrade Dapr from 1.0.0 (or newer) to any [NEW VERSION] > 1.0.0:

   *Helm does not handle upgrading CRDs, so you need to perform that manually. CRDs are backward-compatible and should only be installed forward.*
> Note: The Dapr version is included in the commands below.

   For version {{% dapr-latest-version long="true" %}}:

   ```bash
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/components.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/configuration.yaml
   kubectl replace -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/subscription.yaml
   kubectl apply -f https://raw.githubusercontent.com/dapr/dapr/v{{% dapr-latest-version long="true" %}}/charts/dapr/crds/resiliency.yaml
   ```

   ```bash
   helm repo update
   ```

   ```bash
   helm upgrade dapr dapr/dapr --version {{% dapr-latest-version long="true" %}} --namespace dapr-system --wait
   ```
   *If you're using a values file, remember to add the `--values` option when running the upgrade command.*

2. Ensure all pods are running:

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

Enabling HA mode in an existing Dapr deployment requires additional steps. Please refer to [this paragraph]({{< ref "kubernetes-production.md#enabling-high-availability-in-an-existing-dapr-deployment" >}}) for more details.


## 下一步

- [Dapr on Kubernetes]({{< ref kubernetes-overview.md >}})
- [Dapr 生产环境指南]({{< ref kubernetes-production.md >}})