---
type: docs
title: "OCI 对象存储"
linkTitle: "OCI 对象存储"
description: 详细介绍 OCI 对象存储状态存储组件
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-oci-objectstorage/"
---

## 组件格式

要配置 OCI 对象存储状态存储，请创建一个类型为 `state.oci.objectstorage` 的组件。请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

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
   value: <"true" 或 "false">  # 可选。默认值："false"
 - name: configFileAuthentication
   value: <"true" 或 "false">  # 可选。默认值："false"。当 instancePrincipalAuthentication 为 "true" 时不使用
 - name: configFilePath
   value: <配置文件的完整路径>  # 可选。无默认值。仅在 configFileAuthentication 为 "true" 时使用
 - name: configFileProfile
   value: <配置文件中的配置名称>  # 可选。默认值："DEFAULT"。仅在 configFileAuthentication 为 "true" 时使用
 - name: tenancyOCID
   value: <租户的 OCID>  # 当 configFileAuthentication 为 "true" 或 instancePrincipalAuthentication 为 "true" 时不使用
 - name: userOCID
   value: <用户的 OCID>  # 当 configFileAuthentication 为 "true" 或 instancePrincipalAuthentication 为 "true" 时不使用
 - name: fingerPrint
   value: <公钥的指纹>  # 当 configFileAuthentication 为 "true" 或 instancePrincipalAuthentication 为 "true" 时不使用
 - name: privateKey  # 当 configFileAuthentication 为 "true" 或 instancePrincipalAuthentication 为 "true" 时不使用
   value: |
          -----BEGIN RSA PRIVATE KEY-----
          私钥内容
          -----END RSA PRIVATE KEY-----
 - name: region
   value: <OCI 区域>  # 当 configFileAuthentication 为 "true" 或 instancePrincipalAuthentication 为 "true" 时不使用
 - name: bucketName
   value: <桶的名称>
 - name: compartmentOCID
   value: <隔间的 OCID>

```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为密钥。建议使用密钥存储来保护密钥，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详细信息 | 示例 |
|--------------------|:--------:|---------|---------|
| instancePrincipalAuthentication        | 否        | 布尔值，指示是否使用实例主体认证。默认值："false"  | `"true"` 或 `"false"`。
| configFileAuthentication        | 否        | 布尔值，指示是否通过配置文件提供身份凭证。默认值："false"。当 instancePrincipalAuthentication 为 true 时不使用。  | `"true"` 或 `"false"`。
| configFilePath        | 否        | OCI 配置文件的完整路径。无默认值。当 instancePrincipalAuthentication 为 true 时不使用。请注意：不支持 ~/ 前缀。 | `"/home/apps/configuration-files/myOCIConfig.txt"`。
| configFileProfile        | 否        | 配置文件中的配置名称。默认值："DEFAULT"。当 instancePrincipalAuthentication 为 true 时不使用。  | `"DEFAULT"` 或 `"PRODUCTION"`。
| tenancyOCID        | 是        | OCI 租户标识符。当 instancePrincipalAuthentication 为 true 时不使用。 | `"ocid1.tenancy.oc1..aaaaaaaag7c7sljhsdjhsdyuwe723"`。
| userOCID           | 是        | OCI 用户的 OCID（需要访问 OCI 对象存储的权限）。当 instancePrincipalAuthentication 为 true 时不使用。| `"ocid1.user.oc1..aaaaaaaaby4oyyyuqwy7623yuwe76"`
| fingerPrint        | 是        | 公钥的指纹。当 instancePrincipalAuthentication 为 true 时不使用。 | `"02:91:6c:49:e2:94:21:15:a7:6b:0e:a7:34:e1:3d:1b"`
| privateKey         | 是        | RSA 密钥对的私钥。当 instancePrincipalAuthentication 为 true 时不使用。 | `"MIIEoyuweHAFGFG2727as+7BTwQRAIW4V"`
| region             | 是        | OCI 区域。当 instancePrincipalAuthentication 为 true 时不使用。 | `"us-ashburn-1"`
| bucketName         | 是        | 用于读写的桶的名称（如果需要则创建） | `"application-state-store-bucket"`
| compartmentOCID    | 是        | 包含桶的隔间的 OCID | `"ocid1.compartment.oc1..aaaaaaaacsssekayyuq7asjh78"`

## 设置 OCI 对象存储
OCI 对象存储状态存储需要与 Oracle 云基础设施交互。状态存储支持两种认证方法：基于身份（用户或服务账户）的认证和实例主体认证。请注意，资源主体认证（用于非实例的资源，如无服务器函数）目前不支持。

在 Oracle 云基础设施上运行的 Dapr 应用程序（无论是在计算实例中还是作为 Kubernetes 上的容器）可以使用实例主体认证。有关更多信息，请参阅 [OCI 文档关于从实例调用 OCI 服务](https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/callingservicesfrominstances.htm)。简而言之：实例需要是动态组的成员，并且该动态组需要通过 IAM 策略获得与对象存储服务交互的权限。在这种情况下，设置 instancePrincipalAuthentication 为 `"true"`。您无需配置 tenancyOCID、userOCID、region、fingerPrint 和 privateKey 属性——如果您为它们定义了值，这些将被忽略。

基于身份的认证通过具有权限的 OCI 账户与 OCI 交互，以在指定的桶中创建、读取和删除对象，并允许在指定的隔间中创建桶（如果桶未事先创建）。OCI 文档[描述了如何创建 OCI 账户](https://docs.oracle.com/en-us/iaas/Content/GSG/Tasks/addingusers.htm#Adding_Users)。状态存储通过使用为 OCI 账户生成的 RSA 密钥对的公钥指纹和私钥进行交互。OCI 文档中提供了[生成密钥对和获取所需信息的说明](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm)。

身份和身份凭证的详细信息可以直接在 Dapr 组件属性文件中提供——使用属性 tenancyOCID、userOCID、fingerPrint、privateKey 和 region——或者可以从配置文件中提供，这在许多 OCI 相关工具（如 CLI 和 Terraform）和 SDK 中很常见。在后一种情况下，必须通过属性 configFilePath 提供确切的文件名和完整路径。请注意：路径中不支持 ~/ 前缀。配置文件可以包含多个配置；可以通过属性 configFileProfile 指定所需的配置。如果未提供值，则使用 DEFAULT 作为要使用的配置名称。请注意：如果未找到指定的配置，则使用 DEFAULT 配置（如果存在）。OCI SDK 文档提供了[关于配置文件定义的详细信息](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm)。

如果您希望为 Dapr 使用创建桶，可以事先进行。然而，如果不存在，对象存储状态提供者将在指定的隔间中自动为您创建一个。

为了将 OCI 对象存储设置为状态存储，您需要以下属性：
- **instancePrincipalAuthentication**：指示是否应使用基于实例主体的认证的标志。
- **configFileAuthentication**：指示是否通过配置文件提供 OCI 身份凭证的标志。当 **instancePrincipalAuthentication** 为 true 时不使用。
- **configFilePath**：OCI 配置文件的完整路径。当 **instancePrincipalAuthentication** 为 true 或 **configFileAuthentication** 不为 true 时不使用。
- **configFileProfile**：配置文件中的配置名称。默认值："DEFAULT"。当 instancePrincipalAuthentication 为 true 或 **configFileAuthentication** 不为 true 时不使用。当在配置文件中找不到指定的配置时，使用 DEFAULT 配置（如果存在）。
- **tenancyOCID**：要存储状态的 OCI 云租户的标识符。当 **instancePrincipalAuthentication** 为 true 或 **configFileAuthentication** 为 true 时不使用。
- **userOCID**：状态存储组件用于连接到 OCI 的账户标识符；这必须是对指定隔间和桶上的 OCI 对象存储服务具有适当权限的账户。当 **instancePrincipalAuthentication** 为 true 或 **configFileAuthentication** 为 true 时不使用。
- **fingerPrint**：为 **userOCID** 指定的账户生成的 RSA 密钥对中公钥的指纹。当 **instancePrincipalAuthentication** 为 true 或 **configFileAuthentication** 为 true 时不使用。
- **privateKey**：为 **userOCID** 指定的账户生成的 RSA 密钥对中的私钥。当 **instancePrincipalAuthentication** 为 true 或 **configFileAuthentication** 为 true 时不使用。
- **region**：OCI 区域 - 例如 **us-ashburn-1**、**eu-amsterdam-1**、**ap-mumbai-1**。当 **instancePrincipalAuthentication** 为 true 时不使用。
- **bucketName**：OCI 对象存储中将创建状态的桶的名称。此桶可以在状态存储初始化时已经存在，也可以在状态存储初始化期间创建。请注意，桶的名称在命名空间内是唯一的。
- **compartmentOCID**：租户中桶存在或将被创建的隔间的标识符。

## 运行时会发生什么？

每个状态条目由 OCI 对象存储中的一个对象表示。OCI 对象存储状态存储使用请求中提供给 Dapr API 的 `key` 属性来确定对象的名称。`value` 作为对象的内容存储。每个对象在创建或更新时都会分配一个唯一的 ETag 值；这是 OCI 对象存储的本机行为。状态存储为它写入的每个对象分配一个元数据标签；标签是 __category__，其值是 __dapr-state-store__。这允许创建为 Dapr 应用程序状态的对象被识别。

例如，以下操作

```shell
curl -X POST http://localhost:3500/v1.0/state \
  -H "Content-Type: application/json"
  -d '[
        {
          "key": "nihilus",
          "value": "darth"
        }
      ]'
```

创建以下对象：

| 桶 | 目录 | 对象名称  | 对象内容 | 元数据标签 |
| ------------ | ------- | ----- | ----- | ---- |
| 在 components.yaml 中用 **bucketName** 指定 | - (根)  | nihilus | darth | category: dapr-state-store

Dapr 使用固定的键方案与*复合键*来跨应用程序分区状态。对于一般状态，键格式为：
`App-ID||state key`
OCI 对象存储状态存储将第一个键段（用于 App-ID）映射到桶内的目录，使用 [OCI 对象存储文档中描述的用于模拟目录结构的前缀和层次结构](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/managingobjects.htm#nameprefix)。

因此，以下操作（注意复合键）

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

| 桶 | 目录 | 对象名称  | 对象内容 | 元数据标签 |
| ------------ | ------- | ----- | ----- | ---- |
| 在 components.yaml 中用 **bucketName** 指定 | myApplication  | nihilus | darth | category: dapr-state-store

您将能够通过控制台、API、CLI 或 SDK 检查通过 OCI 对象存储状态存储存储的所有状态。通过直接访问桶，您可以准备在运行时可用作应用程序状态的状态。

## 生存时间和状态过期
OCI 对象存储状态存储支持 Dapr 的生存时间逻辑，确保状态在过期后无法检索。有关详细信息，请参阅[此设置状态生存时间的操作指南]({{< ref "state-store-ttl.md" >}})。

OCI 对象存储不支持本机生存时间设置。此组件中的实现使用在每个指定了 TTL 的对象上放置的元数据标签。该标签称为 **expiry-time-from-ttl**，它包含一个 ISO 日期时间格式的字符串，表示基于 UTC 的过期时间。当通过调用 Get 检索状态时，此组件会检查它是否设置了 **expiry-time-from-ttl**，如果是，则检查它是否在过去。在这种情况下，不返回状态。

因此，以下操作（注意复合键）

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

| 桶 | 目录 | 对象名称  | 对象内容 | 元数据标签 |
| ------------ | ------- | ----- | ----- | ---- |
| 在 components.yaml 中用 **bucketName** 指定 | -  | nihilus | darth | category: dapr-state-store , expiry-time-from-ttl: 2022-01-06T08:34:32

当然，expiry-time-from-ttl 的确切值取决于创建状态的时间，并将在该时刻之后的 120 秒。

请注意，此组件不会从状态存储中删除过期的状态。应用程序操作员可以决定运行一个定期作业，以某种形式的垃圾收集来显式删除所有具有过去时间戳的 **expiry-time-from-ttl** 标签的状态。

## 并发

OCI 对象存储状态并发通过使用 `ETag` 实现。OCI 对象存储中的每个对象在创建或更新时都会分配一个唯一的 ETag。当此状态存储的 `Set` 和 `Delete` 请求指定 FirstWrite 并发策略时，请求需要提供要写入或删除的状态的实际 ETag 值，以便请求成功。

## 一致性

OCI 对象存储状态不支持事务。

## 查询

OCI 对象存储状态不支持查询 API。

## 相关链接
- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
