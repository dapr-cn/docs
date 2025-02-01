---
type: docs
title: "操作指南：持久化调度器任务"
linkTitle: "操作指南：持久化调度器任务"
weight: 50000
description: "配置调度器以持久化其数据库，使其在重启时具有弹性"
---

[调度器]({{< ref scheduler.md >}})服务负责将任务写入其嵌入的Etcd数据库并调度执行。
默认情况下，调度器服务数据库会将数据写入大小为`1Gb`的持久卷声明（Persistent Volume Claim），使用集群的默认[存储类](https://kubernetes.io/docs/concepts/storage/storage-classes/)。
这意味着在大多数Kubernetes部署中运行调度器服务不需要额外参数，但如果没有默认的StorageClass或在生产环境中运行时，您将需要进行[额外的配置](#storage-class)。

{{% alert title="警告" color="warning" %}}
调度器的默认存储大小为`1Gi`，这对于大多数生产部署来说可能不够。
请注意，当启用[SchedulerReminders]({{< ref support-preview-features.md >}})预览功能时，调度器会用于[actor提醒]({{< ref actors-timers-reminders.md >}})、[工作流]({{< ref workflow-overview.md >}})以及[任务API]({{< ref jobs_api.md >}})。
您可能需要考虑重新安装Dapr，并将调度器存储增加到至少`16Gi`或更多。
有关更多信息，请参见下面的[ETCD存储磁盘大小](#etcd-storage-disk-size)部分。
{{% /alert %}}

## 生产环境设置

### ETCD存储磁盘大小

调度器的默认存储大小为`1Gb`。
这个大小对于大多数生产部署来说可能不够。
当存储大小超出时，调度器将记录类似以下的错误：

```
error running scheduler: etcdserver: mvcc: database space exceeded
```

确定存储大小的安全上限并不是一门精确的科学，主要取决于应用程序任务的数量、持久性和数据负载大小。
[任务API]({{< ref jobs_api.md >}})和[actor提醒]({{< ref actors-timers-reminders.md >}})（启用[SchedulerReminders]({{< ref support-preview-features.md >}})预览功能时）会根据应用程序的使用情况进行映射。
工作流（启用[SchedulerReminders]({{< ref support-preview-features.md >}})预览功能时）会创建大量的任务作为actor提醒，但这些任务是短暂的，与每个工作流执行的生命周期相匹配。
工作流创建的任务的数据负载通常为空或很小。

调度器使用Etcd作为其存储后端数据库。
根据设计，Etcd以[预写日志（WAL）和快照](https://etcd.io/docs/v3.5/learning/persistent-storage-files/)的形式持久化历史事务和数据。
这意味着调度器的实际磁盘使用量将高于当前可观察的数据库状态，通常是多个倍数。

### 在安装时设置存储大小

如果您需要增加**现有**调度器的存储大小，请参见下面的[增加现有调度器存储大小](#increase-existing-scheduler-storage-size)部分。
要增加**新**Dapr安装的存储大小（在此示例中为`16Gi`），您可以使用以下命令：

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

```bash
dapr init -k --set dapr_scheduler.cluster.storageSize=16Gi --set dapr_scheduler.etcdSpaceQuota=16Gi
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.storageSize=16Gi \
--set dapr_scheduler.etcdSpaceQuota=16Gi \
--wait
```

{{% /codetab %}}
{{< /tabs >}}

#### 增加现有调度器存储大小

{{% alert title="警告" color="warning" %}}
并非所有存储提供商都支持动态卷扩展。
请参阅您的存储提供商文档以确定是否支持此功能，以及如果不支持该怎么办。
{{% /alert %}}

默认情况下，每个调度器会为每个副本创建一个大小为`1Gi`的持久卷和持久卷声明，使用[默认的`standard`存储类](#storage-class)。
这些将类似于以下内容，在此示例中我们以HA模式运行调度器。

```
NAMESPACE     NAME                                              STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   VOLUMEATTRIBUTESCLASS   AGE
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-0   Bound    pvc-9f699d2e-f347-43b0-aa98-57dcf38229c5   1Gi        RWO            standard       <unset>                 3m25s
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-1   Bound    pvc-f4c8be7b-ffbe-407b-954e-7688f2482caa   1Gi        RWO            standard       <unset>                 3m25s
dapr-system   dapr-scheduler-data-dir-dapr-scheduler-server-2   Bound    pvc-eaad5fb1-98e9-42a5-bcc8-d45dba1c4b9f   1Gi        RWO            standard       <unset>                 3m25s
```

```
NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM                                                         STORAGECLASS   VOLUMEATTRIBUTESCLASS   REASON   AGE
pvc-9f699d2e-f347-43b0-aa98-57dcf38229c5   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-0   standard       <unset>                          4m24s
pvc-eaad5fb1-98e9-42a5-bcc8-d45dba1c4b9f   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-2   standard       <unset>                          4m24s
pvc-f4c8be7b-ffbe-407b-954e-7688f2482caa   1Gi        RWO            Delete           Bound    dapr-system/dapr-scheduler-data-dir-dapr-scheduler-server-1   standard       <unset>                          4m24s
```

要扩展调度器的存储大小，请按照以下步骤操作：

1. 首先，确保存储类支持卷扩展，并且`allowVolumeExpansion`字段设置为`true`，如果尚未设置。

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: standard
provisioner: my.driver
allowVolumeExpansion: true
...
```

2. 删除调度器StatefulSet，同时保留绑定的持久卷声明。

```bash
kubectl delete sts -n dapr-system dapr-scheduler-server --cascade=orphan
```

3. 通过编辑`spec.resources.requests.storage`字段，将持久卷声明的大小增加到所需大小。
 在这种情况下，我们假设调度器以3个副本的HA模式运行。

```bash
kubectl edit pvc -n dapr-system dapr-scheduler-data-dir-dapr-scheduler-server-0 dapr-scheduler-data-dir-dapr-scheduler-server-1 dapr-scheduler-data-dir-dapr-scheduler-server-2
```

4. 通过[安装具有所需存储大小的Dapr](#setting-the-storage-size-on-installation)重新创建调度器StatefulSet。

### 存储类

如果您的Kubernetes部署没有默认存储类或您正在配置生产集群，则需要定义存储类。

持久卷由托管的云提供商或Kubernetes基础设施平台提供的真实磁盘支持。
磁盘大小由预计一次持久化的任务数量决定；然而，64Gb对于大多数生产场景来说应该绰绰有余。
一些Kubernetes提供商建议使用[CSI驱动](https://kubernetes.io/docs/concepts/storage/volumes/#csi)来配置底层磁盘。
以下是为主要云提供商创建持久磁盘的相关文档的有用链接列表：
- [Google Cloud Persistent Disk](https://cloud.google.com/compute/docs/disks)
- [Amazon EBS Volumes](https://aws.amazon.com/blogs/storage/persistent-storage-for-kubernetes/)
- [Azure AKS Storage Options](https://learn.microsoft.com/azure/aks/concepts-storage)
- [Digital Ocean Block Storage](https://www.digitalocean.com/docs/kubernetes/how-to/add-volumes/)
- [VMWare vSphere Storage](https://docs.vmware.com/VMware-vSphere/7.0/vmware-vsphere-with-tanzu/GUID-A19F6480-40DC-4343-A5A9-A5D3BFC0742E.html)
- [OpenShift Persistent Storage](https://docs.openshift.com/container-platform/4.6/storage/persistent_storage/persistent-storage-aws-efs.html)
- [Alibaba Cloud Disk Storage](https://www.alibabacloud.com/help/ack/ack-managed-and-ack-dedicated/user-guide/create-a-pvc)

一旦存储类可用，您可以使用以下命令安装Dapr，并将调度器配置为使用存储类（将`my-storage-class`替换为存储类的名称）：

{{% alert title="注意" color="primary" %}}
如果Dapr已经安装，则需要完全[卸载]({{< ref dapr-uninstall.md >}})控制平面，以便调度器`StatefulSet`可以使用新的持久卷重新创建。
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

```bash
dapr init -k --set dapr_scheduler.cluster.storageClassName=my-storage-class
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.storageClassName=my-storage-class \
--wait
```

{{% /codetab %}}
{{< /tabs >}}

## 临时存储

在非HA模式下运行时，调度器可以选择使用临时存储，即内存存储，这种存储在重启时**不**具有弹性。例如，调度器重启后，所有任务数据都会丢失。
这在非生产部署或测试中很有用，在这些情况下存储不可用或不需要。

{{% alert title="注意" color="primary" %}}
如果Dapr已经安装，则需要完全[卸载]({{< ref dapr-uninstall.md >}})控制平面，以便调度器`StatefulSet`可以在没有持久卷的情况下重新创建。
{{% /alert %}}

{{< tabs "Dapr CLI" "Helm" >}}
 <!-- Dapr CLI -->
{{% codetab %}}

```bash
dapr init -k --set dapr_scheduler.cluster.inMemoryStorage=true
```

{{% /codetab %}}

 <!-- Helm -->
{{% codetab %}}

```bash
helm upgrade --install dapr dapr/dapr \
--version={{% dapr-latest-version short="true" %}} \
--namespace dapr-system \
--create-namespace \
--set dapr_scheduler.cluster.inMemoryStorage=true \
--wait
```

{{% /codetab %}}
{{< /tabs >}}
