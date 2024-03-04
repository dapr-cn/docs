---
type: docs
title: "AWS 认证"
linkTitle: "AWS 认证"
weight: 10
description: "关于 AWS 的认证和配置选项"
aliases:
  - /zh-hans/developing-applications/integrations/authenticating/authenticating-aws/
---

所有使用 AWS 服务(如DynamoDB、SQS、S3等) 的 Dapr 组件都使用一套标准化的属性通过 AWS SDK 进行配置。 [了解有关 AWS SDK 如何处理凭据的更多信息](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)。

由于您可以使用默认提供程序链配置 AWS SDK，因此以下所有属性都是可选的。 测试组件配置并检查 Dapr 运行时的日志输出，以确保组件正确初始化。

| 属性             | 说明                                                                                                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `region`       | 要连接到哪个 AWS 区域。 在某些情况下(例如在自托管模式下运行Dapr时)，这个标志可以由环境变量`AWS_REGION`提供。 因为 Dapr sidecar 注入不允许配置 Dapr sidecar 上的环境变量。 建议在组件中始终设置 `region` 属性。                                       |
| `endpoint`     | 终端节点通常由 AWS 开发工具包在内部处理。 然而，在某些情况下，在本地设置 endpoint 可能是有意义的：例如，如果是针对 [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) 进行开发， |
| `accessKey`    | AWS Access key id.                                                                                                                                                            |
| `secretKey`    | AWS Secret access key. 与`accessKey` 一起使用确定信任凭据。                                                                                                                               |
| `sessionToken` | AWS Session token. 与`accessKey`和`secretKey`一起使用。 当使用普通IAM用户的 access key和密钥时，通常不需要session token。                                                                               |

{{% alert title="Important" color="warning" %}}
您**不得**在您正在使用的组件规范的定义中提供AWS访问密钥、秘密密钥和令牌：
- 当在 EKS（AWS Kubernetes）上运行 Dapr sidecar（`daprd`）与您的应用程序时
- 如果使用已附加到定义对AWS资源访问权限的IAM策略的节点/ pod
{{% /alert %}}

## 在组件清单文件中明确指定凭证的替代方法

在生产方案中，建议使用以下解决方案：
- [Kiam](https://github.com/uswitch/kiam)
- [Kube2iam](https://github.com/jtblin/kube2iam)

如果在 AWS EKS 上运行，你可以 [将 IAM 角色链接到 Kubernetes 服务帐户](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html)，你的 pod 可以使用该帐户。

所有这些解决方案都解决了同样的问题：它们允许Dapr运行时进程（或sidecar）动态地重新获取凭证，因此不需要显式凭证。 这样做有几个好处，比如自动轮换访问密钥，避免必须管理密钥。

Kiam和Kube2IAM都是通过拦截对[实例元数据服务](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)的调用来工作的。

### 在 AWS EC2 上以单机模式运行时使用实例角色/配置文件

如果直接在AWS EC2实例上以单机模式运行Dapr，可以使用实例配置文件。

1. 配置 IAM 角色。
1. [将其附加到ec2实例的配置文件](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)。

Dapr 然后在 Dapr 组件清单中不指定凭据的情况下对 AWS 进行身份验证。

### 以单机模式在本地运行 dapr 时验证到 AWS

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

当在单机模式下运行Dapr（或直接运行Dapr时）时，你可以选择像这样在进程中注入环境变量，就像以下示例一样：

```bash
FOO=bar daprd --app-id myapp
```

如果你在本地有[配置的名为AWS的配置文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)，您可以通过指定 "AWS_PROFILE" 环境变量来告诉Dapr（或Dapr运行时）要使用哪个配置文件：

```bash
AWS_PROFILE=myprofile dapr run...
```

或者

```bash
AWS_PROFILE=myprofile daprd...
```

你可以使用任何[支持的环境变量](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list)以这种方式配置Dapr。

{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

在Windows上，环境变量需要在启动`dapr`或`daprd`命令之前设置，不支持像在Linux/MacOS中内联操作。

{{% /codetab %}}

{{< /tabs >}}


### 如果使用基于 AWS SSO 的配置文件，则向 AWS 进行身份验证

如果你使用 [AWS SSO](https://aws.amazon.com/single-sign-on/)进行身份验证，一些 AWS SDK（包括 Go SDK）还不支持此功能。 您可以使用多种实用程序来“弥合”基于 AWS SSO 的凭证和“传统”凭证之间的差距，例如：
- [AwsHelper](https://pypi.org/project/awshelper/)
- [aws-sso-util](https://github.com/benkehoe/aws-sso-util)

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

如果使用AwsHelper，可以这样启动Dapr:

```bash
AWS_PROFILE=myprofile awshelper dapr run...
```

或者

```bash
AWS_PROFILE=myprofile awshelper daprd...
```
{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

在Windows上，环境变量需要在启动`awshelper`命令之前进行设置，不支持像在Linux/MacOS中内联操作。

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="Refer to AWS component specs >>" page="components-reference" >}}

## 相关链接

有关更多信息，请参阅 [AWS 开发工具包（Dapr 使用）如何处理](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)凭证。
