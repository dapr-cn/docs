---
type: docs
title: "Cloudflare Workers KV"
linkTitle: "Cloudflare Workers KV"
description: 详细介绍 Cloudflare Workers KV 状态存储组件的信息
aliases:
  - "/zh-hans/operations/components/setup-state-store/supported-state-stores/setup-cloudflare-workerskv/"
---

## 创建 Dapr 组件

要配置 [Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) 状态存储，您需要创建一个类型为 `state.cloudflare.workerskv` 的组件。请参考[本指南]({{< ref "howto-get-save-state.md#step-1-setup-a-state-store" >}})了解如何创建和应用状态存储配置。

```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: <NAME>
spec:
  type: state.cloudflare.workerskv
  version: v1
  # 如果 Dapr 为您管理 Worker，请增加 initTimeout
  initTimeout: "120s"
  metadata:
    # Workers KV 命名空间的 ID（必需）
    - name: kvNamespaceID
      value: ""
    # Worker 的名称（必需）
    - name: workerName
      value: ""
    # PEM 编码的私有 Ed25519 密钥（必需）
    - name: key
      value: |
        -----BEGIN PRIVATE KEY-----
        MC4CAQ...
        -----END PRIVATE KEY-----
    # Cloudflare 账户 ID（需要 Dapr 管理 Worker 时必需）
    - name: cfAccountID
      value: ""
    # Cloudflare 的 API 令牌（需要 Dapr 管理 Worker 时必需）
    - name: cfAPIToken
      value: ""
    # Worker 的 URL（如果 Worker 已在 Dapr 外部预创建，则必需）
    - name: workerUrl
      value: ""
```

{{% alert title="警告" color="warning" %}}
上述示例使用明文字符串作为 secret。建议使用 secret 存储来存储 secret，如[此处]({{< ref component-secrets.md >}})所述。
{{% /alert %}}

## 规格元数据字段

| 字段              | 必需 | 详情 | 示例 |
|--------------------|:--------:|---------|---------|
| `kvNamespaceID` | Y | 预创建的 Workers KV 命名空间的 ID | `"123456789abcdef8b5588f3d134f74ac"`
| `workerName` | Y | 要连接的 Worker 的名称 | `"mydaprkv"`
| `key` | Y | Ed25519 私钥，PEM 编码 | *见上面的示例*
| `cfAccountID` | Y/N | Cloudflare 账户 ID。需要 Dapr 管理 Worker。 | `"456789abcdef8b5588f3d134f74ac"def`
| `cfAPIToken` | Y/N | Cloudflare 的 API 令牌。需要 Dapr 管理 Worker。 | `"secret-key"`
| `workerUrl` | Y/N | Worker 的 URL。如果 Worker 已在 Dapr 外部预配置，则必需。 | `"https://mydaprkv.mydomain.workers.dev"`

> 如果您配置 Dapr 为您创建 Worker，可能需要为组件的 `initTimeout` 属性设置更长的值，以便为 Worker 脚本的部署留出足够的时间。例如：`initTimeout: "120s"`

## 创建 Workers KV 命名空间

要使用此组件，您必须在 Cloudflare 账户中创建一个 Workers KV 命名空间。

您可以通过以下两种方式之一创建新的 Workers KV 命名空间：

<!-- IGNORE_LINKS -->
- 使用 [Cloudflare 仪表板](https://dash.cloudflare.com/)  
  记下您在仪表板中看到的 Workers KV 命名空间的 "ID"。这是一个十六进制字符串（例如 `123456789abcdef8b5588f3d134f74ac`）–而不是您创建它时使用的名称！
- 使用 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/):
  
  ```sh
  # 如果需要，首先使用 `npx wrangler login` 进行身份验证
  wrangler kv:namespace create <NAME>
  ```

  输出包含命名空间的 ID，例如：

  ```text
  { binding = "<NAME>", id = "123456789abcdef8b5588f3d134f74ac" }
  ```
<!-- END_IGNORE -->

## 配置 Worker

由于 Cloudflare Workers KV 命名空间只能由在 Workers 上运行的脚本访问，Dapr 需要维护一个 Worker 来与 Workers KV 存储进行通信。

Dapr 可以自动为您管理 Worker，或者您可以自行预配置一个 Worker。在 [workerd](https://github.com/cloudflare/workerd) 上运行时，预配置 Worker 是唯一支持的选项。

{{% alert title="重要" color="warning" %}} 
为每个 Dapr 组件使用单独的 Worker。不要为不同的 Cloudflare Workers KV 状态存储组件使用相同的 Worker 脚本，也不要为 Dapr 中的不同 Cloudflare 组件使用相同的 Worker 脚本（例如 Workers KV 状态存储和 Queues 绑定）。
{{% /alert %}}

{{< tabs "让 Dapr 管理 Worker" "手动预配置 Worker 脚本" >}}

{{% codetab %}}
<!-- 让 Dapr 管理 Worker -->

如果您希望让 Dapr 为您管理 Worker，您需要提供以下 3 个元数据选项：

<!-- IGNORE_LINKS -->
- **`workerName`**: Worker 脚本的名称。这将是您的 Worker URL 的第一部分。例如，如果为您的 Cloudflare 账户配置的 "workers.dev" 域是 `mydomain.workers.dev`，并且您将 `workerName` 设置为 `mydaprkv`，则 Dapr 部署的 Worker 将可在 `https://mydaprkv.mydomain.workers.dev` 访问。
- **`cfAccountID`**: 您的 Cloudflare 账户的 ID。您可以在登录 [Cloudflare 仪表板](https://dash.cloudflare.com/) 后在浏览器的 URL 栏中找到此 ID，ID 是 `dash.cloudflare.com` 之后的十六进制字符串。例如，如果 URL 是 `https://dash.cloudflare.com/456789abcdef8b5588f3d134f74acdef`，则 `cfAccountID` 的值为 `456789abcdef8b5588f3d134f74acdef`。
- **`cfAPIToken`**: 具有创建和编辑 Workers 和 Workers KV 命名空间权限的 API 令牌。您可以在 Cloudflare 仪表板的 "我的个人资料" 部分的 ["API 令牌" 页面](https://dash.cloudflare.com/profile/api-tokens)中创建它：
   1. 点击 **"创建令牌"**。
   1. 选择 **"编辑 Cloudflare Workers"** 模板。
   1. 按照屏幕上的说明生成新的 API 令牌。
<!-- END_IGNORE -->

当 Dapr 配置为为您管理 Worker 时，当 Dapr 运行时启动时，它会检查 Worker 是否存在并且是最新的。如果 Worker 不存在，或者使用的是过时版本，Dapr 将自动为您创建或升级它。

{{% /codetab %}}

{{% codetab %}}
<!-- 手动预配置 Worker 脚本 -->

如果您不希望授予 Dapr 为您部署 Worker 脚本的权限，您可以手动预配置一个 Worker 供 Dapr 使用。请注意，如果您有多个通过 Worker 与 Cloudflare 服务交互的 Dapr 组件，您需要为每个组件创建一个单独的 Worker。

要手动预配置 Worker 脚本，您需要在本地计算机上安装 Node.js。

1. 创建一个新文件夹，您将在其中放置 Worker 的源代码，例如：`daprworker`。
2. 如果尚未进行身份验证，请使用 Wrangler（Cloudflare Workers CLI）进行身份验证：`npx wrangler login`。
3. 在新创建的文件夹中，创建一个新的 `wrangler.toml` 文件，内容如下，适当填写缺失的信息：
  
  ```toml
  # 您的 Worker 的名称，例如 "mydaprkv"
  name = ""

  # 不要更改这些选项
  main = "worker.js"
  compatibility_date = "2022-12-09"
  usage_model = "bundled"

  [vars]
  # 将此设置为 Ed25519 密钥的 **公共** 部分，PEM 编码（用 `\n` 替换换行符）。
  # 示例：
  # PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMCowB...=\n-----END PUBLIC KEY-----
  PUBLIC_KEY = ""
  # 将此设置为您的 Worker 的名称（与上面 "name" 属性的值相同），例如 "mydaprkv"。
  TOKEN_AUDIENCE = ""

  [[kv_namespaces]]
  # 将以下两个值设置为您的 KV 命名空间的 ID（而不是名称），例如 "123456789abcdef8b5588f3d134f74ac"。
  # 请注意，它们都将设置为相同的值。
  binding = ""
  id = ""
  ```
  
  > 注意：请参阅下一节了解如何生成 Ed25519 密钥对。确保在部署 Worker 时使用密钥的 **公共** 部分！

4. 将 Worker 的（预编译和最小化的）代码复制到 `worker.js` 文件中。您可以使用以下命令执行此操作：
  
  ```sh
  # 将此设置为您正在使用的 Dapr 版本
  DAPR_VERSION="release-{{% dapr-latest-version short="true" %}}"
  curl -LfO "https://raw.githubusercontent.com/dapr/components-contrib/${DAPR_VERSION}/internal/component/cloudflare/workers/code/worker.js"
  ```

5. 使用 Wrangler 部署 Worker：
  
  ```sh
  npx wrangler publish
  ```

一旦您的 Worker 部署完成，您需要使用以下两个元数据选项初始化组件：

- **`workerName`**: Worker 脚本的名称。这是您在 `wrangler.toml` 文件中设置的 `name` 属性的值。
- **`workerUrl`**: 部署的 Worker 的 URL。`npx wrangler` 命令将向您显示完整的 URL，例如 `https://mydaprkv.mydomain.workers.dev`。

{{% /codetab %}}

{{< /tabs >}}

## 生成 Ed25519 密钥对

所有 Cloudflare Workers 都在公共互联网监听，因此 Dapr 需要使用额外的身份验证和数据保护措施，以确保没有其他人或应用程序可以与您的 Worker（以及您的 Worker KV 命名空间）通信。这些措施包括行业标准措施，例如：

- Dapr 向 Worker 发出的所有请求都通过一个持有者令牌（技术上是一个 JWT）进行身份验证，该令牌由 Ed25519 密钥签名。
- Dapr 和您的 Worker 之间的所有通信都通过加密连接进行，使用 TLS（HTTPS）。
- 持有者令牌在每次请求时生成，并且仅在短时间内有效（目前为一分钟）。

为了让 Dapr 发出持有者令牌，并让您的 Worker 验证它们，您需要生成一个新的 Ed25519 密钥对。以下是使用 OpenSSL 或 step CLI 生成密钥对的示例。

{{< tabs "使用 OpenSSL 生成" "使用 step CLI 生成" >}}

{{% codetab %}}
<!-- 使用 OpenSSL 生成 -->

> 自 OpenSSL 1.1.0 起支持生成 Ed25519 密钥，因此如果您使用的是旧版本的 OpenSSL，以下命令将不起作用。

> Mac 用户注意：在 macOS 上，Apple 提供的 "openssl" 二进制文件实际上是基于 LibreSSL 的，截至撰写时不支持 Ed25519 密钥。如果您使用的是 macOS，请使用 step CLI，或者从 Homebrew 安装 OpenSSL 3.0，使用 `brew install openssl@3`，然后在下面的命令中将 `openssl` 替换为 `$(brew --prefix)/opt/openssl@3/bin/openssl`。

您可以使用 OpenSSL 生成一个新的 Ed25519 密钥对：

```sh
openssl genpkey -algorithm ed25519 -out private.pem
openssl pkey -in private.pem -pubout -out public.pem
```

> 在 macOS 上，使用 Homebrew 的 openssl@3：
> 
> ```sh
> $(brew --prefix)/opt/openssl@3/bin/openssl genpkey -algorithm ed25519 -out private.pem
> $(brew --prefix)/opt/openssl@3/bin/openssl pkey -in private.pem -pubout -out public.pem
> ```

{{% /codetab %}}

{{% codetab %}}
<!-- 使用 step CLI 生成 -->

如果您还没有 step CLI，请按照[官方说明](https://smallstep.com/docs/step-cli/installation)进行安装。

接下来，您可以使用 step CLI 生成一个新的 Ed25519 密钥对：

```sh
step crypto keypair \
  public.pem private.pem \
  --kty OKP --curve Ed25519 \
  --insecure --no-password
```

{{% /codetab %}}

{{< /tabs >}}

无论您如何生成密钥对，按照上述说明，您将拥有两个文件：

- `private.pem` 包含密钥的私有部分；使用此文件的内容作为组件元数据的 **`key`** 属性。
- `public.pem` 包含密钥的公共部分，您仅在手动部署 Worker 时需要它（如上一节中的说明）。

{{% alert title="警告" color="warning" %}}
保护您的密钥的私有部分，并将其视为 secret 值！
{{% /alert %}}

## 附加说明

- 请注意，Cloudflare Workers KV 不保证强数据一致性。虽然更改通常会立即对同一 Cloudflare 数据中心的请求可见，但更改在所有 Cloudflare 区域之间复制可能需要一定时间（通常最多一分钟）。
- 此状态存储支持 Dapr 的 TTL，但 TTL 的最小值为 1 分钟。

## 相关链接

- [Dapr 组件的基本架构]({{< ref component-schema >}})
- 阅读[本指南]({{< ref "howto-get-save-state.md#step-2-save-and-retrieve-a-single-state" >}})以获取有关配置状态存储组件的说明
- [状态管理构建块]({{< ref state-management >}})
- [Cloudflare Workers KV](https://developers.cloudflare.com/workers/learning/how-kv-works/) 的文档
