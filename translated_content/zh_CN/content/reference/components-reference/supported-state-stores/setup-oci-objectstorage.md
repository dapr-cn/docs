---
type: docs
title: "OCI Object Storage"
linkTitle: "OCI Object Storage"
description: Detailed information on the OCI Object Storage state store component
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-oci-objectstorage/"
---

## 配置

To setup OCI Object Storage state store create a component of type `state.oci.objectstorage`. 请参阅[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})，了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
  namespace: <NAMESPACE>
spec:
  type: state.oci.objectstorage
  version: v1
  metadata:
 - name: instancePrincipalAuthentication
   value: <"true" or "false">  # Optional. default: "false" 
 - name: configFileAuthentication
   value: <"true" or "false">  # Optional. default: "false" . Not used when instancePrincipalAuthentication == "true" 
 - name: configFilePath
   value: <REPLACE-WITH-FULL-QUALIFIED-PATH-OF-CONFIG-FILE>  # Optional. default: the operating system specific default location for the OCI config file; on Linux: "~/.oci/config" . Only used when configFileAuthentication == "true" 
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
          REPLACE-WIH-PRIVATE-KEY-AS-IN-PEM-FILE
          -----END RSA PRIVATE KEY-----    
 - name: region
   value: <REPLACE-WITH-OCI-REGION>  # Not used when configFileAuthentication == "true" or instancePrincipalAuthentication == "true" 
 - name: bucketName
     value: <REPLACE-WITH-BUCKET-NAME>
 - name: compartmentOCID
   value: <REPLACE-WITH-COMPARTMENT-OCID>

```

{{% alert title="Warning" color="warning" %}}
以上示例将密钥明文存储， 更推荐的方式是使用 Secret 组件， [这里]({{< ref component-secrets.md >}})。
{{% /alert %}}

## 元数据字段规范

| 字段                              | 必填 | 详情                                                                                                                                                                                                                            | 示例                                                    |
| ------------------------------- |:--:| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| instancePrincipalAuthentication | N  | Boolean to indicate whether instance principal based authentication is used. 默认值为 `"false"`                                                                                                                                   | `"true"` or  `"false"` .                              |
| configFileAuthentication        | 否  | Boolean to indicate whether identity credential details are provided through a configuration file. Default: `"false"` Not required nor used when instancePrincipalAuthentication is true.                                     | `"true"` or  `"false"` .                              |
| configFilePath                  | 否  | Full path name to the OCI configuration file. Default: the default location on your operating system for the OCI confile file, for example `"~/.oci/config"` on Linux. Not used when instancePrincipalAuthentication is true. | `"/home/apps/configuration-files/myOCIConfig.txt"`.   |
| configFileProfile               | 否  | Name of profile in configuration file to use. Default: `"DEFAULT"` Not used when instancePrincipalAuthentication is true.                                                                                                     | `"DEFAULT"` or  `"PRODUCTION"` .                      |
| tenancyOCID                     | Y  | The OCI tenancy identifier. Not required nor used when instancePrincipalAuthentication is true.                                                                                                                               | `"ocid1.tenancy.oc1..aaaaaaaag7c7sljhsdjhsdyuwe723"`. |
| userOCID                        | Y  | The OCID for an OCI account (this account requires permissions to access OCI Object Storage). Not required nor used when instancePrincipalAuthentication is true.                                                             | `"ocid1.user.oc1..aaaaaaaaby4oyyyuqwy7623yuwe76"`     |
| fingerPrint                     | Y  | Fingerprint of the public key. Not required nor used when instancePrincipalAuthentication is true.                                                                                                                            | `"02:91:6c:49:e2:94:21:15:a7:6b:0e:a7:34:e1:3d:1b"`   |
| privateKey                      | Y  | Private key of the RSA key pair. Not required nor used when instancePrincipalAuthentication is true.                                                                                                                          | `"MIIEoyuweHAFGFG2727as+7BTwQRAIW4V"`                 |
| region                          | Y  | OCI Region. Not required nor used when instancePrincipalAuthentication is true.                                                                                                                                               | `"us-ashburn-1"`                                      |
| bucketName                      | Y  | Name of the bucket written to and read from (and if necessary created)                                                                                                                                                        | `"application-state-store-bucket"`                    |
| compartmentOCID                 | Y  | The OCID for the compartment that contains the bucket                                                                                                                                                                         | `"ocid1.compartment.oc1..aaaaaaaacsssekayyuq7asjh78"` |

## Setup OCI Object Storage
The OCI Object Storage state store needs to interact with Oracle Cloud Infrastructure. The state store supports two different approaches to authentication. One is based on an identity (a user or service account) and the other is instance principal authentication leveraging the permissions granted to the compute instance running the application workload. Note: Resource Principal Authentication - used for resources that are not instances such as serverless functions - is not currently supported.

Dapr-applications running on Oracle Cloud Infrastructure - in a compute instance or as a container on Kubernetes - can leverage instance principal authentication. See the [OCI documentation on calling OCI Services from instances](https://docs.oracle.com/en-us/iaas/Content/Identity/Tasks/callingservicesfrominstances.htm) for more background. In short: The instance needs to be member of a Dynamic Group and this Dynamic Group needs to get permissions for interacting with the Object Storage service through IAM policies. In case of such instance principal authentication, specify property instancePrincipalAuthentication as `"true"`. You do not need to configure the properties tenancyOCID, userOCID, region, fingerPrint and privateKey - these will be ignored if you define values for them.

Identity based authentication interacts with OCI through an OCI account that has permissions to create, read and delete objects through OCI Object Storage in the indicated bucket and that is allowed to create a bucket in the specified compartment if the bucket is not created beforehand. The OCI documentation [describes how to create an OCI Account](https://docs.oracle.com/en-us/iaas/Content/GSG/Tasks/addingusers.htm#Adding_Users). The interaction by the state store is performed using the public key's fingerprint and a private key from an RSA Key Pair generated for the OCI account. The [instructions for generating the key pair and getting hold of the required information](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) are available in the OCI documentation.

Details for the identity and identity's credentials to be used for interaction with OCI can be provided directly in the Dapr component properties file - using the properties tenancyOCID, userOCID, fingerPrint, privateKey and region - or can be provided from a configuration file as is common for many OCI related tools (such as CLI and Terraform) and SDKs. In the latter case, a default configuration file can be assumed (such as ~/.oci/config on Linux) or the exact file name and path can be provided through property configFilePath. A configuration file can contain multiple profiles; the desired profile can be specified through property configFileProfile. If no value is provided, DEFAULT is used as the name for the profile to be used. Note: if the indicated profile is not found, then the DEFAULT profile (if it exists) is used instead. The OCI SDK documentation gives [details about the definition of the configuration file](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/sdkconfig.htm).

If you wish to create the bucket for Dapr to use, you can do so beforehand. However, Object Storage state provider will create one - in the specified compartment - for you automatically if it doesn't exist.

In order to setup OCI Object Storage as a state store, you need the following properties:
- **instancePrincipalAuthentication**: The flag that indicates if instance principal based authentication should be used.
- **configFileAuthentication**: The flag that indicates if the OCI identity credential details are provided through a configuration file. Not used when **instancePrincipalAuthentication** is true.
- **configFilePath**: Full path name to the OCI configuration file. Not used when **instancePrincipalAuthentication** is true or **configFileAuthentication** is not true.
- **configFileProfile**: Name of profile in configuration file to use. Default: `"DEFAULT"` Not required nor used when instancePrincipalAuthentication is true or **configFileAuthentication** is not true. When the specified profile is not found in the configuration file, the DEFAULT profile is used when it exists
- **tenancyOCID**: The identifier for the OCI cloud tenancy in which the state is to be stored. Not used when **instancePrincipalAuthentication** is true or **configFileAuthentication** is true.
- **userOCID**: The identifier for the account used by the state store component to connect to OCI; this must be an account with appropriate permissions on the OCI Object Storage service in the specified compartment and bucket. Not used when **instancePrincipalAuthentication** is true or **configFileAuthentication** is true.
- **fingerPrint**: The fingerprint for the public key in the RSA key pair generated for the account indicated by **userOCID**. Not used when **instancePrincipalAuthentication** is true or **configFileAuthentication** is true.
- **privateKey**: The private key in the RSA key pair generated for the account indicated by **userOCID**. Not used when **instancePrincipalAuthentication** is true or **configFileAuthentication** is true.
- **region**: The OCI region - for example **us-ashburn-1**, **eu-amsterdam-1**, **ap-mumbai-1**. Not used when **instancePrincipalAuthentication** is true
- **bucketName**: The name of the bucket on OCI Object Storage in which state will be created. This bucket can exist already when the state store is initialized or it will be created during initialization of the state store. Note that the name of buckets is unique within a namespace
- **compartmentOCID**: The identifier of the compartment within the tenancy in which the bucket exists or will be created.


## What Happens at Runtime?

Every state entry is represented by an object in OCI Object Storage. The OCI Object Storage state store uses the `key` property provided in the requests to the Dapr API to determine the name of the object. The `value` is stored as the (literal) content of the object. Each object is assigned a unique ETag value - whenever it is created or updated (aka overwritten); this is native behavior of OCI Object Storage. The state store assigns a meta data tag to every object it writes; the tag is __category__ and its value is __dapr-state-store__. This allows the objects created as state for Daprized applications to be identified.

For example, the following operation

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

creates the following object:

| Bucket                                              | Directory | Object Name | Object Content | Meta Tags                  |
| --------------------------------------------------- | --------- | ----------- | -------------- | -------------------------- |
| as specified with **bucketName** in components.yaml | - (root)  | nihilus     | darth          | category: dapr-state-store |


Dapr uses a fixed key scheme with *composite keys* to partition state across applications. For general states, the key format is: `App-ID||state key` The OCI Object Storage state store maps the first key segment (for App-ID) to a directory within a bucket, using the [Prefixes and Hierarchy used for simulating a directory structure as described in the OCI Object Storage documentation](https://docs.oracle.com/en-us/iaas/Content/Object/Tasks/managingobjects.htm#nameprefix).

The following operation therefore (notice the composite key)

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

will create the following object:

| Bucket                                              | Directory     | Object Name | Object Content | Meta Tags                  |
| --------------------------------------------------- | ------------- | ----------- | -------------- | -------------------------- |
| as specified with **bucketName** in components.yaml | myApplication | nihilus     | darth          | category: dapr-state-store |


You will be able to inspect all state stored through the OCI Object Storage state store by inspecting the contents of the bucket through the console, the APIs, CLI or SDKs. By going directly to the bucket, you can prepare state that will be available as state to your application at runtime.

## Time To Live and State Expiration
The OCI Object Storage state store supports Dapr's Time To Live logic that ensure that state cannot be retrieved after it has expired. See [this How To on Setting State Time To Live]({{< ref "state-store-ttl.md" >}}) for details.

OCI Object Storage does not have native support for a Time To Live setting. The implementation in this component uses a meta data tag put on each object for which a TTL has been specified. The tag is called **expiry-time-from-ttl** and it contains a string in ISO date time format with the UTC based expiry time. When state is retrieved through a call to Get, this component checks if it has the **expiry-time-from-ttl** set and if so it checks whether it is in the past. In that case, no state is returned.

The following operation therefore (notice the composite key)

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

creates the following object:

| Bucket                                              | Directory | Object Name | Object Content | Meta Tags                                                              |
| --------------------------------------------------- | --------- | ----------- | -------------- | ---------------------------------------------------------------------- |
| as specified with **bucketName** in components.yaml | -         | nihilus     | darth          | category: dapr-state-store , expiry-time-from-ttl: 2022-01-06T08:34:32 |

The exact value of the expiry-time-from-ttl depends of course on the time at which the state was created and will be 120 seconds later than that moment.


Note that expired state is not removed from the state store by this component. An application operator may decide to run a periodic job that does a form of garbage collection in order to explicitly remove all state that has an  **expiry-time-from-ttl** label with a timestamp in the past.

## 并发（Concurrency）

OCI Object Storage state concurrency is achieved by using `ETag`s. Each object in OCI Object Storage is assigned a unique ETag when it is created or updated (aka replaced). When the `Set` and `Delete` requests for this state store specify the FirstWrite concurrency policy, then the request need to provide the actual ETag value for the state to be written or removed for the request to be successful.

## 一致性

OCI Object Storage state does not support Transactions.

## Query

OCI Object Storage state does not support the Query API.


## 相关链接
- [Dapr组件的基本格式]({{< ref component-schema >}})
- 阅读 [本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}}) 以获取配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
