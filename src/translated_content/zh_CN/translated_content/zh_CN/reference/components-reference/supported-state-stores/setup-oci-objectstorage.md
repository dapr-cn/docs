---
type: docs
title: "OCI 对象存储"
linkTitle: "OCI 对象存储"
description: OCI 对象存储状态存储组件详细信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-oci-objectstorage/"
---

## Component format

要设置 OCI 对象存储状态存储，请创建一个类型为 `state.oci.objectstorage` 的组件。 See [this guide]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}}) on how to create and apply a state store configuration.

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.oci.objectstorage
  version: v1
  metadata:
 - name: instancePrincipalAuthentication
   value: <"true" or "false">  # Optional. default: "false" 
 - name: configFileAuthentication
   value: <"true" or "false">  # Optional. default: "false" . Not used when instancePrincipalAuthentication == "true" 
 - name: configFilePath
   value: <REPLACE-WITH-FULL-QUALIFIED-PATH-OF-CONFIG-FILE>  # Optional. No default. Only used when configFileAuthentication == "true" 
 - name: configFileProfile
   value: <REPLACE-WITH-NAME-OF-PROFILE-IN-CONFIG-FILE>  # Optional. default: "DEFAULT" . Only used when configFileAuthentication == "true" 
 - name: tenancyOCID
   value: <REPLACE-WITH-TENANCY-OCID>  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
 - name: userOCID
   value: <REPLACE-WITH-USER-OCID>  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
 - name: fingerPrint
   value: <REPLACE-WITH-FINGERPRINT>  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
 - name: privateKey  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
   value: |
          -----BEGIN RSA PRIVATE KEY-----
          REPLACE-WITH-PRIVATE-KEY-AS-IN-PEM-FILE
          -----END RSA PRIVATE KEY-----    
 - name: region
   value: <REPLACE-WITH-OCI-REGION>  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
 - name: bucketName
     value: <REPLACE-WITH-BUCKET-NAME>
 - name: compartmentOCID
   value: <REPLACE-WITH-COMPARTMENT-OCID>

```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件，参考 [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| Field                           | 必填 | 详情                                                                                          | 示例                                                    |
| ------------------------------- |:--:| ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| instancePrincipalAuthentication | 否  | 指示是否使用基于实例主体的身份验证的布尔值。 默认值为 `"false"`                                                       | `"true"` 或者  `"false"` .                              |
| configFileAuthentication        | 否  | 指示是否通过配置文件提供身份凭证详细信息的布尔值。 默认值： `"false"` 当 instancePrincipalAuthentication 为 true 时不需要也不使用。 | `"true"` 或者  `"false"` .                              |
| configFilePath                  | 否  | OCI 配置文件的完整路径名。 无默认值 当 instancePrincipalAuthentication 为 true 时不会使用。 注意：不支持 ~/ 前缀。          | `"/home/apps/configuration-files/myOCIConfig.txt"`.   |
| configFileProfile               | 否  | 配置文件中要使用的配置文件的名称。 默认值： `"DEFAULT"`， 当 instancePrincipalAuthentication 为真时不使用。               | `"DEFAULT"` 或者  `"PRODUCTION"` .                      |
| tenancyOCID                     | 是  | OCI 租户标识符。 当 instancePrincipalAuthentication 为 true 时，既不需要也不使用。                             | `"ocid1.tenancy.oc1..aaaaaaaag7c7sljhsdjhsdyuwe723"`. |
| userOCID                        | 是  | OCI 账户的 OCID（此账户需要访问 OCI 对象存储的权限）。 当 instancePrincipalAuthentication 为 true 时，既不需要也不使用。     | `"ocid1.user.oc1..aaaaaaaaby4oyyyuqwy7623yuwe76"`     |
| fingerPrint                     | 是  | 公钥的指纹。 当 instancePrincipalAuthentication 为 true 时，既不需要也不使用。                                 | `"02:91:6c:49:e2:94:21:15:a7:6b:0e:a7:34:e1:3d:1b"`   |
| privateKey                      | 是  | RSA 密钥对的私钥。 当 instancePrincipalAuthentication 为 true 时，既不需要也不使用。                            | `"MIIEoyuweHAFGFG2727as+7BTwQRAIW4V"`                 |
| region                          | 是  | OCI 分区。 当 instancePrincipalAuthentication 为 true 时，既不需要也不使用。                                | `"us-ashburn-1"`                                      |
| bucketName                      | 是  | 读写的存储桶名称（必要时创建）                                                                             | `"application-state-store-bucket"`                    |
| compartmentOCID                 | 是  | 包含存储桶的隔间的 OCID                                                                              | `"ocid1.compartment.oc1..aaaaaaaacsssekayyuq7asjh78"` |

## 设置 OCI 对象存储
OCI 对象存储状态存储需要与 Oracle 云进行交互。 状态存储支持两种不同的身份验证方法。 一个基于标识（用户或服务账户），另一个是实例主体身份验证，利用授予运行应用程序工作负荷的计算实例的权限。 注意：资源主题身份认证--用于非实例资源例如serverless函数 -- 目前还不支持。

在Oracle云上运行的Dapr应用--在计算实例中或者作为Kubernetes上的一个容器--可以利用实例主题身份认证。 有关更多背景信息，请参阅有关 [从实例调用 OCI 服务的OCI 文档](https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/callingservicesfrominstances.htm) 。 简而言之：实例需要是动态分组的成员，并且该动态分组需要通过 IAM 策略获取与对象存储服务交互的权限。 在这种实例主体身份验证的情况下，将属性 instancePrincipalAuthentication 指定为 `"true"`。 您不需要配置属性tenancyOCID、userOCID、region、fingerPrint 和privateKey - 如果您为它们定义值，将被忽略。

基于身份的身份验证通过一个 OCI 账户与 OCI 交互，该账户有权通过指定存储桶中的 OCI 对象存储创建、读和删除对象，并且如果未预先创建存储桶，则允许在指定的区间中创建存储桶。 OCI 文档 [描述了如何创建 OCI 账户](https://docs.oracle.com/en-us/iaas/Content/GSG/Tasks/addingusers.htm#Adding_Users)。 状态存储的交互是使用公钥的指纹和来自为 OCI 账户生成的 RSA 密钥对中的私钥执行的。 OCI 文档中提供了 [有关生成密钥对和获取所需信息](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm)。

用来和OCI交互的身份和身份凭证细节，可以直接在Dapr组件的属性文件中提供 —— 使用 tenancyOCID, userOCID, fingerPrint, privateKey and region属性 —— 或者可以从配置文件中提供，这是许多OCI关联工具（例如CLI和Terraform）和SDK常用的。 在后一种情况下，必须通过属性 configFilePath 提供确切的文件名和完整路径。 注意：路径中不支持 ~/ 前缀。 一个配置文件可以包含多个配置文件; 可以通过属性 configFileProfile 指定所需的配置文件。 如果未提供任何值，则使用 DEFAULT 作为要使用的配置文件的名称。 注意：如果未找到指示的配置文件，则使用 DEFAULT 配置文件（如果存在）。 OCI SDK 文档提供了[有关配置文件定义的详细信息](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm)。

如果您希望创建供Dapr使用的存储桶，可以事先执行此操作。 但是，对象存储状态提供程序将在指定的隔离区中自动为您创建一个，如果该存储桶不存在。

如果要将 OCI 对象存储设置为状态存储，您需要以下属性：
- **nstancePrincipalAuthentication**：该标识标示是否使用基于实例主体的身份验证。
- **configFileAuthentication**: 该标识标示是否通过配置文件提供了OCI身份凭证信息。 当 **instancePrincipalAuthentication** 为true时，不使用。
- **configFilePath**：OCI 配置文件的完整路径。 当 **instancePrincipalAuthentication** 为true或 **configFileAuthenticatio** 不为ture时，不使用。
- ** configFileProfile **：配置文件中要使用的配置文件的名称。 默认值： `“ DEFAULT”` 当instancePrincipalAuthentication为true或 **configFileAuthentication** 不为 true 时，不需要也不使用。 当在配置文件中找不到指定的配置文件时，则在存在 DEFAULT 配置文件时使用它。
- ** tenancyOCID **：要在其中存储状态的 OCI 云租户的标识符。 当 ** instancePrincipalAuthentication ** 为true或 ** configFileAuthentication ** 为true时，不使用。
- **userOCID**：状态存储组件用于连接到 OCI 的账户的标识符; 这必须是对指定隔离区和存储桶中的 OCI 对象存储服务具有适当权限的账户。 当 ** instancePrincipalAuthentication ** 为true或 ** configFileAuthentication ** 为true时，不使用。
- **fingerPrint**：为 ** userOCID **标示的账户生成的RSA密钥对中公钥的指纹。 当 ** instancePrincipalAuthentication ** 为true或 ** configFileAuthentication ** 为true时，不使用。
- ** privateKey **：为 ** userOCID **标示的账户生成的RSA密钥对中的私钥。 当 ** instancePrincipalAuthentication ** 为true或 ** configFileAuthentication ** 为true时，不使用。
- ** region **：OCI地区 - 例如 **us-ashburn-1**， **eu-amsterdam-1**， **ap-mumbai-1**。 当 **instancePrincipalAuthentication** 为true时，不使用。
- ** bucketName **：OCI 对象存储上将用于创建状态的存储桶的名称。 此存储桶可以在初始化状态存储时已经存在，也可以在状态存储的初始化期间创建。 请注意，存储桶的名称在命名空间中是唯一的
- ** compartmentOCID **：租户中存在或将要创建存储桶的分栏的标识符。


## 运行时会发生什么？

每个状态条目都由 OCI 对象存储中的一个对象表示。 OCI 对象存储状态存储使用在对 Dapr API 的请求中提供的 `key` 属性来确定对象的名称。 </code> value `存储为对象的（文本）内容。 每个对象都被分配一个唯一的ETag值 - 无论何时它被创建或更新（覆盖）；这是 OCI 对象存储的原生行为。 状态存储为其写入的每个对象分配一个元数据标记; 该标记是 <strong x-id="2"> category </strong> ，其值为 <strong x-id="2">dapr-state-store</strong>。 这将允许为标识为Daprized 应用作为状态创建对象。</p>

<p spaces-before="0">例如，以下操作 </p>

<pre><code class="shell">curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
`</pre>

创建以下对象：
在 components.yaml 中指定的</strong> bucketName **</td> 

</tr> </tbody> </table> 

Dapr使用一个固定键模式*composite keys* 去区分跨应用程序状态。 对于常规状态，键格式为：`App-ID||state key`，OCI对象存储状态存储将第一个键分段(用于 App-ID)映射到桶中的一个目录，使用 [OCI对象存储文档中描述的用于模拟目录结构的前缀和层次结构](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/managingobjects.htm#nameprefix). 

因此，以下操作（请注意复合键） 



```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "myApplication||nihilus",
          "value": "darth"
        }
      ]'
```


将创建以下对象：

在 components.yaml 中指定的</strong> bucketName **</td> 

</tr> </tbody> </table> 

您可以通过控制台、API、CLI 或 SDK 检查存储桶的内容，从而检查通过 OCI 对象存储状态存储的所有状态。 通过直接转到存储桶，您可以准备在运行时可用作应用程序状态的状态。



## 生存时间和状态期满

OCI 对象存储状态存储支持 Dapr 的生存时间逻辑，可确保状态过期后无法被检索到。 有关详细信息，请参阅 [如何设置状态时间生存]({{< ref "state-store-ttl.md" >}}) 。

OCI 对象存储对生存时间设置没有原生支持。 此组件中的实现使用已为其指定 TTL 的每个对象上放置的元数据标记。 该标记称为 **expiry-time-from-ttl** ，它包含一个 ISO 日期时间格式的字符串，其中包含基于 UTC 的到期时间。 当通过调用 Get 检索状态时，此组件将检查它是否设置了 **expiry-time-from-ttl** ，如果是，则检查它是否是过期的。 在这种情况下，不会返回任何状态。 

因此，以下操作（请注意复合键） 



```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "temporary",
          "value": "ephemeral",
          "metadata": {"ttlInSeconds": "120"}}
        }
      ]'
```


创建以下对象：

在 components.yaml 中指定的</strong> bucketName **</td> 

</tr> </tbody> </table> 

当然，expiry-time-from-ttl 的确切值取决于创建状态的时间，并且将比该时刻晚 120 秒。

请注意，此组件不会从状态存储中删除过期状态。 应用程序operator可能决定运行执行某种形式的垃圾回收的定期作业，以便显式删除具有  **expiry-time-from-ttl** 标签的所有状态，这些标签过去具有时间戳。



## 并发

OCI 对象存储状态并发是通过使用 `ETag`实现的。 OCI 对象存储中的每个对象在创建或更新（也称为替换）时都被分配了一个唯一的 ETag。 当对该状态存储的 `Set` 和 `Delete` 请求指定 FirstWrite 并发策略时，请求需要提供实际的 ETag 值，以便请求成功写入或删除状态。 



## 一致性

OCI 对象存储状态不支持事务。



## 查询

OCI 对象存储状态不支持查询 API。




## 相关链接

- [Basic schema for a Dapr component]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
