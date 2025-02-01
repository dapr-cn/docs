---
type: docs
title: "AWS 认证"
linkTitle: "AWS 认证"
weight: 10
description: "关于 AWS 的认证和配置选项的信息"
aliases:
  - /zh-hans/developing-applications/integrations/authenticating/authenticating-aws/
---

Dapr 组件通过 AWS SDK 使用 AWS 服务（例如，DynamoDB、SQS、S3），并支持标准化的配置属性。[了解更多关于 AWS SDK 如何处理凭证的信息](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)。

您可以使用 AWS SDK 的默认提供者链，或者选择以下列出的预定义 AWS 认证配置文件之一来进行认证配置。通过测试和检查 Dapr 运行时日志来验证组件配置，确保正确初始化。

### 术语
- **ARN (Amazon Resource Name):** 用于唯一标识 AWS 资源的标识符。格式为：`arn:partition:service:region:account-id:resource`。示例：`arn:aws:iam::123456789012:role/example-role`。
- **IAM (Identity and Access Management):** AWS 提供的用于安全管理对 AWS 资源访问的服务。

### 认证配置文件

#### 访问密钥 ID 和秘密访问密钥
使用静态访问密钥和秘密密钥凭证，可以通过组件元数据字段或通过[默认 AWS 配置](https://docs.aws.amazon.com/sdkref/latest/guide/creds-config-files.html)进行配置。

{{% alert title="重要" color="warning" %}}
在以下场景中，建议通过默认 AWS 配置加载凭证：
- 在 EKS（AWS Kubernetes）上运行 Dapr sidecar (`daprd`) 和您的应用程序。
- 使用附加了定义 AWS 资源访问的 IAM 策略的节点或 pod。
{{% /alert %}}

| 属性 | 必需 | 描述 | 示例 |
| --------- | ----------- | ----------- | ----------- |
| `region` | Y | 要连接的 AWS 区域。 | "us-east-1" |
| `accessKey` | N | AWS 访问密钥 ID。在 Dapr v1.17 中将是必需的。 | "AKIAIOSFODNN7EXAMPLE" |
| `secretKey` | N | AWS 秘密访问密钥，与 `accessKey` 一起使用。在 Dapr v1.17 中将是必需的。 | "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" |
| `sessionToken` | N | AWS 会话令牌，与 `accessKey` 和 `secretKey` 一起使用。对于 IAM 用户密钥通常不需要。 | |

#### 假设 IAM 角色
此配置文件允许 Dapr 假设特定的 IAM 角色。通常在 Dapr sidecar 在 EKS 或链接到 IAM 策略的节点/pod 上运行时使用。目前由 Kafka 和 PostgreSQL 组件支持。

| 属性 | 必需 | 描述 | 示例 |
| --------- | ----------- | ----------- | ----------- |
| `region` | Y | 要连接的 AWS 区域。 | "us-east-1" |
| `assumeRoleArn` | N | 具有 AWS 资源访问权限的 IAM 角色的 ARN。在 Dapr v1.17 中将是必需的。 | "arn:aws:iam::123456789:role/mskRole" |
| `sessionName` | N | 角色假设的会话名称。默认是 `"DaprDefaultSession"`。 | "MyAppSession" |

#### 从环境变量获取凭证
使用[环境变量](https://docs.aws.amazon.com/sdkref/latest/guide/environment-variables.html)进行认证。这对于在自托管模式下运行的 Dapr 特别有用，因为 sidecar 注入器不会配置环境变量。

此认证配置文件不需要任何元数据字段。

#### IAM Roles Anywhere
[IAM Roles Anywhere](https://aws.amazon.com/iam/roles-anywhere/) 将基于 IAM 角色的认证扩展到外部工作负载。通过使用加密签名的证书，消除了长期凭证的需求，这些证书基于 Dapr PKI 的信任关系。Dapr SPIFFE 身份 X.509 证书用于认证到 AWS 服务，Dapr 在会话生命周期的一半时处理凭证轮换。

要配置此认证配置文件：
1. 使用 Dapr 证书包作为 `外部证书包` 在信任的 AWS 账户中创建一个信任锚。
2. 创建一个具有必要资源权限策略的 IAM 角色，以及一个为 Roles Anywhere AWS 服务指定的信任实体。在此处，您指定允许的 SPIFFE 身份。
3. 在 Roles Anywhere 服务下创建一个 IAM 配置文件，链接 IAM 角色。

| 属性 | 必需 | 描述 | 示例 |
| --------- | ----------- | ----------- | ----------- |
| `trustAnchorArn` | Y | 在 AWS 账户中授予 Dapr 证书颁发机构信任的信任锚的 ARN。 | arn:aws:rolesanywhere:us-west-1:012345678910:trust-anchor/01234568-0123-0123-0123-012345678901 |
| `trustProfileArn` | Y | 在信任的 AWS 账户中的 AWS IAM 配置文件的 ARN。 | arn:aws:rolesanywhere:us-west-1:012345678910:profile/01234568-0123-0123-0123-012345678901 |
| `assumeRoleArn` | Y | 在信任的 AWS 账户中要假设的 AWS IAM 角色的 ARN。 | arn:aws:iam:012345678910:role/exampleIAMRoleName |

### 其他字段

一些 AWS 组件包括额外的可选字段：

| 属性 | 必需 | 描述 | 示例 |
| --------- | ----------- | ----------- | ----------- |
| `endpoint` | N | 端点通常由 AWS SDK 内部处理。然而，在某些情况下，可能需要在本地设置它 - 例如，如果针对 [DynamoDB Local](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html) 进行开发。 | |

此外，支持 AWS 认证配置文件的非原生 AWS 组件（如 Kafka 和 PostgreSQL）具有触发 AWS 认证逻辑的元数据字段。请务必查看特定组件文档。

## 在组件清单文件中显式指定凭证的替代方案

在生产场景中，建议使用以下解决方案：
- [Kiam](https://github.com/uswitch/kiam) 
- [Kube2iam](https://github.com/jtblin/kube2iam) 

如果在 AWS EKS 上运行，您可以[将 IAM 角色链接到 Kubernetes 服务账户](https://docs.aws.amazon.com/eks/latest/userguide/create-service-account-iam-policy-and-role.html)，您的 pod 可以使用该账户。

所有这些解决方案都解决了同一个问题：它们允许 Dapr 运行时进程（或 sidecar）动态检索凭证，因此不需要显式凭证。这提供了几个好处，例如自动密钥轮换，以及避免管理 secret。

Kiam 和 Kube2IAM 都通过拦截对[实例元数据服务](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/configuring-instance-metadata-service.html)的调用来工作。

### 在 AWS EC2 上以独立模式运行时使用实例配置文件

如果直接在 AWS EC2 实例上以独立模式运行 Dapr，您可以使用实例配置文件。

1. 配置一个 IAM 角色。
1. [将其附加到实例配置文件](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html)以用于 ec2 实例。

然后，Dapr 在 Dapr 组件清单中不指定凭证的情况下认证到 AWS。

### 在本地以独立模式运行 dapr 时认证到 AWS

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

在独立模式下运行 Dapr（或直接运行 Dapr 运行时）时，您可以将环境变量注入到进程中，如以下示例：

```bash
FOO=bar daprd --app-id myapp
```

如果您在本地[配置了命名的 AWS 配置文件](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)，您可以通过指定 "AWS_PROFILE" 环境变量来告诉 Dapr（或 Dapr 运行时）使用哪个配置文件：

```bash
AWS_PROFILE=myprofile dapr run...
```

或

```bash
AWS_PROFILE=myprofile daprd...
```

您可以使用任何[支持的环境变量](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html#envvars-list)以这种方式配置 Dapr。

{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

在 Windows 上，需要在启动 `dapr` 或 `daprd` 命令之前设置环境变量，像在 Linux/MacOS 中那样内联设置是不支持的。

{{% /codetab %}}

{{< /tabs >}}

### 如果使用基于 AWS SSO 的配置文件认证到 AWS

如果您使用 [AWS SSO](https://aws.amazon.com/single-sign-on/) 认证到 AWS，某些 AWS SDK（包括 Go SDK）尚不支持此功能。您可以使用几个实用程序来“弥合” AWS SSO 凭证和“传统”凭证之间的差距，例如：
- [AwsHelper](https://pypi.org/project/awshelper/) 
- [aws-sso-util](https://github.com/benkehoe/aws-sso-util)

{{< tabs "Linux/MacOS" "Windows" >}}
 <!-- linux -->
{{% codetab %}}

如果使用 AwsHelper，像这样启动 Dapr：

```bash
AWS_PROFILE=myprofile awshelper dapr run...
```

或

```bash
AWS_PROFILE=myprofile awshelper daprd...
```
{{% /codetab %}}

 <!-- windows -->
{{% codetab %}}

在 Windows 上，需要在启动 `awshelper` 命令之前设置环境变量，像在 Linux/MacOS 中那样内联设置是不支持的。

{{% /codetab %}}

{{< /tabs >}}

## 下一步

{{< button text="参考 AWS 组件规范 >>" page="components-reference" >}}

## 相关链接

有关更多信息，请参阅[如何 AWS SDK（Dapr 使用的）处理凭证](https://docs.aws.amazon.com/sdk-for-go/v1/developer-guide/configuring-sdk.html#specifying-credentials)。