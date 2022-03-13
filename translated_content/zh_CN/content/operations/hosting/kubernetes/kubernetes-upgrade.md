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

## 将现有集群升级为1.0.1
有两种方法可以使用Dapr CLI或Helm升级Kubernetes集群上的Dapr control plane。

### Dapr CLI

下面的例子显示了如何升级到1.0.1版本：

  ```bash
  dapr upgrade -k --runtime-version=1.0.1
  ```

您可以使用Dapr CLI提供所有可用的Helm chart配置。 请参阅 [这里](https://github.com/dapr/cli#supplying-helm-values) 以获取更多信息。

### Helm

从1.0.0版本开始，使用Helm升级Dapr不再是一个破坏性的动作，因为现有的证书值将自动被重新使用。

1. 将Dapr从1.0.0（或更新）升级到任何[新版本] > v1.0.0。

   ```bash
   helm repo update
   ```

   ```bash
   helm upgrade dapr dapr/dapr --version [NEW VERSION] --namespace dapr-system --wait
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

## 下一步

- [Kubernetes上的 Dapr]({{< ref kubernetes-overview.md >}})
- [Dapr生产环境指南]({{< ref kubernetes-production.md >}})