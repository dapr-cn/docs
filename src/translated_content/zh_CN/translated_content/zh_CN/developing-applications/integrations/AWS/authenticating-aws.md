---
type: docs
title: "AWS 认证"
linkTitle: "AWS 认证"
weight: 10
description: "关于 AWS 的认证和配置选项"
aliases:
  - /zh-hans/developing-applications/integrations/authenticating/authenticating-aws/
---

所有使用 AWS 服务(如DynamoDB、SQS、S3等) 的 Dapr 组件都使用一套标准化的属性进行配置。 查阅[AWS 开发工具包（Dapr 使用）如何处理凭证](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)。

以下属性都不是必需的，因为您可以使用默认提供商链配置 AWS 开发工具包，如上面的链接中所述。 测试组件配置并检查 Dapr 运行时的日志输出，以确保组件正确初始化。

| 属性             | 说明                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `region`       | 要连接到哪个 AWS 区域。 In some situations (when running Dapr in self-hosted mode, for example) this flag can be provided by the environment variable `AWS_REGION`. Since Dapr sidecar injection doesn't allow configuring environment variables on the Dapr sidecar, it is recommended to always set the `region` attribute in the component spec. |
| `终结点`          | 终端节点通常由 AWS 开发工具包在内部处理。 However, in some situations it might make sense to set it locally - for example if developing against [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html).                                                                                                       |
| `accessKey`    | AWS 访问密钥 ID：                                                                                                                                                                                                                                                                                                                               |
| `secretKey`    | AWS Secret access key. Use together with `accessKey` to explicitly specify credentials.                                                                                                                                                                                                                                                    |
| `sessionToken` | AWS Session token. Used together with `accessKey` and `secretKey`. When using a regular IAM user's access key and secret, a session token is normally not required.                                                                                                                                                                        |

{{% alert title="Important" color="warning" %}}
当在 EKS (AWS Kubernetes) 上与您的应用程序一起运行 Dapr sidecar (daprd) 时，如果您使用的node/pod 已附加到定义 AWS 资源访问权限的 IAM 策略，那么您 **不能**在正在使用的组件规范的定义中提供 AWS access-key、secret-key 和token。
{{% /alert %}}

## Alternatives to explicitly specifying credentials in component manifest files

In production scenarios, it is recommended to use a solution such as [Kiam](https://github.com/uswitch/kiam) or [Kube2iam](https://github.com/jtblin/kube2iam). If running on AWS EKS, you can [link an IAM role to a Kubernetes service account](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html), which your pod can use.

All of these solutions solve the same problem: They allow the Dapr runtime process (or sidecar) to retrive credentials dynamically, so that explicit credentials aren't needed. This provides several benefits, such as automated key rotation, and avoiding having to manage secrets.

Both Kiam and Kube2IAM work by intercepting calls to the [instance metadata service](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html).

## 在 AWS EC2 上以单机模式运行时使用实例角色/配置文件

If running Dapr directly on an AWS EC2 instance in stand-alone mode, instance profiles can be used. Simply configure an iam role and [attach it to the instance profile](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html) for the ec2 instance, and Dapr should be able to authenticate to AWS without specifying credentials in the Dapr component manifest.

## 以单机模式在本地运行 dapr 时验证到 AWS

When running Dapr (or the Dapr runtime directly) in stand-alone mode, you have the option of injecting environment variables into the process like this (on Linux/MacOS:

```bash
FOO=bar daprd --app-id myapp
```

If you have [configured named AWS profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) locally , you can tell Dapr (or the Dapr runtime) which profile to use by specifying the "AWS_PROFILE" environment variable:

```bash
AWS_PROFILE=myprofile dapr run...
```

or

```bash
AWS_PROFILE=myprofile daprd...
```

You can use any of the [supported environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list) to configure Dapr in this manner.

On Windows, the environment variable needs to be set before starting the `dapr` or `daprd` command, doing it inline as shown above is not supported.

## 如果使用基于 AWS SSO 的配置文件，则向 AWS 进行身份验证

If you authenticate to AWS using [AWS SSO](https://aws.amazon.com/single-sign-on/), some AWS SDKs (including the Go SDK) don't yet support this natively. There are several utilities you can use to "bridge the gap" between AWS SSO-based credentials, and "legacy" credentials, such as [AwsHelper](https://pypi.org/project/awshelper/) or [aws-sso-util](https://github.com/benkehoe/aws-sso-util).

If using AwsHelper, start Dapr like this:

```bash
AWS_PROFILE=myprofile awshelper dapr run...
```

or

```bash
AWS_PROFILE=myprofile awshelper daprd...
```

On Windows, the environment variable needs to be set before starting the `awshelper` command, doing it inline as shown above is not supported.

有关更多信息，请参阅 [AWS 开发工具包（Dapr 使用）如何处理](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)凭证。
