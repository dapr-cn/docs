---
type: docs
title: "配置弹性Kubernetes服务（EKS）集群"
linkTitle: "弹性Kubernetes服务（EKS）"
weight: 4000
description: >
  学习如何配置EKS集群
---

本指南将引导您配置一个弹性Kubernetes服务（EKS）集群。如果您需要更多信息，请参考[创建一个Amazon EKS集群](https://docs.aws.amazon.com/eks/latest/userguide/create-cluster.html)

## 前提条件

- 需要安装以下工具：
   - [kubectl](https://kubernetes.io/docs/tasks/tools/)
   - [AWS CLI](https://aws.amazon.com/cli/)
   - [eksctl](https://eksctl.io/)
   - [一个现有的VPC和子网](https://docs.aws.amazon.com/eks/latest/userguide/network_reqs.html)
   - [Dapr CLI](https://docs.dapr.io/getting-started/install-dapr-cli/)

## 部署一个EKS集群

1. 在终端中配置AWS凭证。

   ```bash
   aws configure
   ```

1. 创建一个名为`cluster-config.yaml`的新文件，并将以下内容添加到其中，将`[your_cluster_name]`、`[your_cluster_region]`和`[your_k8s_version]`替换为相应的值：

    ```yaml
    apiVersion: eksctl.io/v1alpha5
    kind: ClusterConfig
    
    metadata:
      name: [your_cluster_name]
      region: [your_cluster_region]
      version: [your_k8s_version]
      tags:
        karpenter.sh/discovery: [your_cluster_name]
    
    iam:
      withOIDC: true
    
    managedNodeGroups:
      - name: mng-od-4vcpu-8gb
        desiredCapacity: 2
        minSize: 1
        maxSize: 5
        instanceType: c5.xlarge
        privateNetworking: true
    
    addons:
      - name: vpc-cni 
        attachPolicyARNs:
          - arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy
      - name: coredns
        version: latest 
      - name: kube-proxy
        version: latest
      - name: aws-ebs-csi-driver
        wellKnownPolicies: 
          ebsCSIController: true
    ```

1. 通过运行以下命令创建集群：

   ```bash
   eksctl create cluster -f cluster.yaml
   ```
   
1. 验证kubectl上下文：

   ```bash
   kubectl config current-context
   ```

## 为sidecar访问和默认存储类添加Dapr要求：

1. 更新安全组规则，创建端口4000的入站规则，以允许EKS集群与Dapr sidecar通信。

   ```bash
   aws ec2 authorize-security-group-ingress --region [your_aws_region] \
   --group-id [your_security_group] \
   --protocol tcp \
   --port 4000 \
   --source-group [your_security_group]
   ```

2. 如果没有默认存储类，请添加一个：

  ```bash
  kubectl patch storageclass gp2 -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
  ```

## 安装Dapr

运行以下命令安装Dapr：

```bash
dapr init -k
```

您应该看到以下响应：

```bash
⌛  Making the jump to hyperspace...
ℹ️  Note: To install Dapr using Helm, see here: https://docs.dapr.io/getting-started/install-dapr-kubernetes/#install-with-helm-advanced

ℹ️  Container images will be pulled from Docker Hub
✅  Deploying the Dapr control plane with latest version to your cluster...
✅  Deploying the Dapr dashboard with latest version to your cluster...
✅  Success! Dapr has been installed to namespace dapr-system. To verify, run `dapr status -k' in your terminal. To get started, go here: https://docs.dapr.io/getting-started
```

## 故障排除

### 访问权限

如果您遇到访问权限问题，请确保您使用的是创建集群时使用的相同AWS配置文件。如有需要，使用正确的配置文件更新kubectl配置。更多信息请参考[这里](https://repost.aws/knowledge-center/eks-api-server-unauthorized-error)：

```bash
aws eks --region [your_aws_region] update-kubeconfig --name [your_eks_cluster_name] --profile [your_profile_name]
```

## 相关链接

- [了解更多关于EKS集群的信息](https://docs.aws.amazon.com/eks/latest/userguide/clusters.html)
- [了解更多关于eksctl的信息](https://eksctl.io/getting-started/)
- [尝试一个Dapr快速入门]({{< ref quickstarts.md >}})
- 了解如何[在您的集群上部署Dapr]({{< ref kubernetes-deploy.md >}})
- [Kubernetes生产指南]({{< ref kubernetes-production.md >}})