---
type: 文档
title: "Steps to upgrade Dapr on a Kubernetes cluster"
linkTitle: "Upgrade Dapr"
weight: 30000
description: "Follow these steps to upgrade Dapr on Kubernetes and ensure a smooth upgrade."
---

## 前期准备

- Latest [Dapr CLI]({{< ref install-dapr-cli.md >}})
- https://github.com/helm/helm/releases

## Upgrade existing cluster running 0.11.x
There are two ways to upgrade the Dapr control plane on a Kubernetes cluster using either the Dapr CLI or Helm. The preferred way is to use the Dapr CLI.

### Dapr CLI
Upgrade Dapr to 1.0.0-3:

  ```bash
  Upgrade Dapr to 1.0.0-rc.3:
  ```

You can provide all the available Helm chart configurations using the Dapr CLI. See [here](https://github.com/dapr/cli#supplying-helm-values) for more info.

### Helm 3
From version 1.0.0 onwards, upgrading Dapr using Helm is no longer a disruptive action since existing certificate values will automatically be re-used.

1. Run these two commands to prevent `helm upgrade` from uninstalling `0.11.x` placement service:

   ```bash
   helm repo update
   ```

   ```bash
   kubectl annotate svc dapr-placement helm.sh/resource-policy=keep -n dapr-system
   ```
   *If you're using a values file, remember to add the `--values` option when running the upgrade command.*

2. Ensure all pods are running:

   ```bash
   dapr mtls export -o ./certs
   ```

3. Restart your application deployments to update the Dapr runtime:

   ```bash
   kubectl rollout restart deploy/<DEPLOYMENT-NAME>
   ```

4. All done!

## 下一步

- [Dapr on Kubernetes]({{< ref kubernetes-overview.md >}})
- [Dapr production guidelines]({{< ref kubernetes-production.md >}})