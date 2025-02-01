
---
type: docs
title: "快速入门：加密技术"
linkTitle: 加密技术
weight: 79
description: 开始使用 Dapr 加密构建块
---

{{% alert title="Alpha" color="warning" %}}
加密构建块目前处于**初始阶段**。
{{% /alert %}}

我们来了解一下 Dapr 的[加密构建块]({{< ref cryptography >}})。在这个快速入门中，您将创建一个应用程序，使用 Dapr 加密 API 来加密和解密数据。您将：

- 加密并解密一个短字符串（使用 RSA 密钥），在内存中读取结果，存储在 Go 的字节切片中。
- 加密并解密一个大文件（使用 AES 密钥），通过流将加密和解密的数据存储到文件中。

<img src="/images/crypto-quickstart.png" width=800 style="padding-bottom:15px;">

{{% alert title="注意" color="primary" %}}
此示例使用 Dapr SDK，该 SDK 利用 gRPC，并在使用加密 API 加密和解密消息时**强烈**推荐使用。
{{% /alert %}}

目前，您可以使用 Go SDK 体验加密 API。

{{< tabs "JavaScript" "Go" >}}

 <!-- JavaScript -->
{{% codetab %}}

> 此快速入门包括一个名为 `crypto-quickstart` 的 JavaScript 应用程序。

### 前置条件

对于此示例，您将需要：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [安装最新的 Node.js](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- 系统上可用的 [OpenSSL](https://www.openssl.org/source/)

### 步骤 1：设置环境

克隆 [Quickstarts 仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/cryptography/javascript/sdk)

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端中，从根目录导航到加密示例。

```bash
cd cryptography/javascript/sdk
```

导航到包含源代码的文件夹：

```bash
cd ./crypto-quickstart
```

安装依赖项：

```bash
npm install
```

### 步骤 2：使用 Dapr 运行应用程序

应用程序代码定义了两个必需的密钥：

- 私有 RSA 密钥
- 一个 256 位对称（AES）密钥

使用 OpenSSL 生成一个 RSA 密钥和一个 AES 密钥，并将它们分别写入两个文件：

```bash
mkdir -p keys
# 生成一个私有 RSA 密钥，4096 位密钥
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# 为 AES 生成一个 256 位密钥
openssl rand -out keys/symmetric-key-256 32
```

使用 Dapr 运行 Go 服务应用程序：

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- npm start
```

**预期输出**

```
== APP == 2023-10-25T14:30:50.435Z INFO [GRPCClient, GRPCClient] Opening connection to 127.0.0.1:58173
== APP == == 使用缓冲区加密消息
== APP == 加密了消息，得到 856 字节
== APP == == 使用缓冲区解密消息
== APP == 解密了消息，得到 24 字节
== APP == 密码是 "passw0rd"
== APP == == 使用流加密消息
== APP == 加密 federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg 到 encrypted.out
== APP == 将消息加密到 encrypted.out
== APP == == 使用流解密消息
== APP == 解密 encrypted.out 到 decrypted.out.jpg
== APP == 将消息解密到 decrypted.out.jpg
```

### 发生了什么？

#### `local-storage.yaml`

之前，您在 `crypto-quickstarts` 中创建了一个名为 `keys` 的目录。在 [`local-storage` 组件 YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml) 中，`path` 元数据映射到新创建的 `keys` 目录。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localstorage
spec:
  type: crypto.dapr.localstorage
  version: v1
  metadata:
    - name: path
      # 路径相对于示例所在的文件夹
      value: ./keys
```

#### `index.mjs`

[应用程序文件](https://github.com/dapr/quickstarts/blob/master/cryptography/javascript/sdk/crypto-quickstart/index.mjs) 使用您生成的 RSA 和 AES 密钥加密和解密消息和文件。应用程序创建了一个新的 Dapr SDK 客户端：

```javascript
async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // 使用缓冲区加密和解密消息
  await encryptDecryptBuffer(client);

  // 使用流加密和解密消息
  await encryptDecryptStream(client);
}
```

##### 使用 RSA 密钥加密和解密字符串

一旦创建了客户端，应用程序就会加密一条消息：

```javascript
async function encryptDecryptBuffer(client) {
  // 要加密的消息
  const plaintext = `The secret is "passw0rd"`

  // 首先，加密消息
  console.log("== 使用缓冲区加密消息");

  const encrypted = await client.crypto.encrypt(plaintext, {
    componentName: "localstorage",
    keyName: "rsa-private-key.pem",
    keyWrapAlgorithm: "RSA",
  });

  console.log("加密了消息，得到", encrypted.length, "字节");
```

然后应用程序解密消息：

```javascript
  // 解密消息
  console.log("== 使用缓冲区解密消息");
  const decrypted = await client.crypto.decrypt(encrypted, {
    componentName: "localstorage",
  });

  console.log("解密了消息，得到", decrypted.length, "字节");
  console.log(decrypted.toString("utf8"));

  // ...
}
``` 

##### 使用 AES 密钥加密和解密大文件

接下来，应用程序加密一个大图像文件：

```javascript
async function encryptDecryptStream(client) {
  // 首先，加密消息
  console.log("== 使用流加密消息");
  console.log("加密", testFileName, "到 encrypted.out");

  await pipeline(
    createReadStream(testFileName),
    await client.crypto.encrypt({
      componentName: "localstorage",
      keyName: "symmetric-key-256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("encrypted.out"),
  );

  console.log("将消息加密到 encrypted.out");
```

然后应用程序解密大图像文件：

```javascript
  // 解密消息
  console.log("== 使用流解密消息");
  console.log("解密 encrypted.out 到 decrypted.out.jpg");
  await pipeline(
    createReadStream("encrypted.out"),
    await client.crypto.decrypt({
      componentName: "localstorage",
    }),
    createWriteStream("decrypted.out.jpg"),
  );

  console.log("将消息解密到 decrypted.out.jpg");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

> 此快速入门包括一个名为 `crypto-quickstart` 的 Go 应用程序。

### 前置条件

对于此示例，您将需要：

- [Dapr CLI 和已初始化的环境](https://docs.dapr.io/getting-started)。
- [最新版本的 Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- 系统上可用的 [OpenSSL](https://www.openssl.org/source/)

### 步骤 1：设置环境

克隆 [Quickstarts 仓库中提供的示例](https://github.com/dapr/quickstarts/tree/master/cryptography/go/sdk)

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端中，从根目录导航到加密示例。

```bash
cd cryptography/go/sdk
```

### 步骤 2：使用 Dapr 运行应用程序

导航到包含源代码的文件夹：

```bash
cd ./crypto-quickstart
```

应用程序代码定义了两个必需的密钥：

- 私有 RSA 密钥
- 一个 256 位对称（AES）密钥

使用 OpenSSL 生成一个 RSA 密钥和一个 AES 密钥，并将它们分别写入两个文件：

```bash
mkdir -p keys
# 生成一个私有 RSA 密钥，4096 位密钥
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# 为 AES 生成一个 256 位密钥
openssl rand -out keys/symmetric-key-256 32
```

使用 Dapr 运行 Go 服务应用程序：

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

**预期输出**

```
== APP == dapr client initializing for: 127.0.0.1:52407
== APP == 加密了消息，得到 856 字节
== APP == 解密了消息，得到 24 字节
== APP == 密码是 "passw0rd"
== APP == 将解密数据写入 encrypted.out
== APP == 将解密数据写入 decrypted.out.jpg
```

### 发生了什么？

#### `local-storage.yaml`

之前，您在 `crypto-quickstarts` 中创建了一个名为 `keys` 的目录。在 [`local-storage` 组件 YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml) 中，`path` 元数据映射到新创建的 `keys` 目录。

```yml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: localstorage
spec:
  type: crypto.dapr.localstorage
  version: v1
  metadata:
    - name: path
      # 路径相对于示例所在的文件夹
      value: ./keys
```

#### `app.go`

[应用程序文件](https://github.com/dapr/quickstarts/tree/master/cryptography/go/sdk/crypto-quickstart/app.go) 使用您生成的 RSA 和 AES 密钥加密和解密消息和文件。应用程序创建了一个新的 Dapr SDK 客户端：

```go
func main() {
	// 创建一个新的 Dapr SDK 客户端
	client, err := dapr.NewClient()
    
    //...

	// 步骤 1：使用 RSA 密钥加密字符串，然后解密并在终端中显示输出
	encryptDecryptString(client)

	// 步骤 2：加密大文件，然后使用 AES 密钥解密
	encryptDecryptFile(client)
}
```

##### 使用 RSA 密钥加密和解密字符串

一旦创建了客户端，应用程序就会加密一条消息：

```go
func encryptDecryptString(client dapr.Client) {
    // ...

	// 加密消息
	encStream, err := client.Encrypt(context.Background(),
		strings.NewReader(message),
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// 要使用的密钥名称
			// 由于这是一个 RSA 密钥，我们将其指定为密钥包装算法
			KeyName:          RSAKeyName,
			KeyWrapAlgorithm: "RSA",
		},
	)

    // ...

	// 该方法返回一个可读流，我们在内存中完整读取
	encBytes, err := io.ReadAll(encStream)
    // ...

	fmt.Printf("加密了消息，得到 %d 字节\n", len(encBytes))
```

然后应用程序解密消息：

```go
	// 现在，解密加密数据
	decStream, err := client.Decrypt(context.Background(),
		bytes.NewReader(encBytes),
		dapr.DecryptOptions{
			// 我们只需要传递组件的名称
			ComponentName: CryptoComponentName,
			// 传递密钥名称是可选的
			KeyName: RSAKeyName,
		},
	)

    // ...

	// 该方法返回一个可读流，我们在内存中完整读取
	decBytes, err := io.ReadAll(decStream)

    // ...

	// 在控制台上打印消息
	fmt.Printf("解密了消息，得到 %d 字节\n", len(decBytes))
	fmt.Println(string(decBytes))
}
``` 

##### 使用 AES 密钥加密和解密大文件

接下来，应用程序加密一个大图像文件：

```go
func encryptDecryptFile(client dapr.Client) {
	const fileName = "liuguangxi-66ouBTTs_x0-unsplash.jpg"

	// 获取输入文件的可读流
	plaintextF, err := os.Open(fileName)

    // ...

	defer plaintextF.Close()

	// 加密文件
	encStream, err := client.Encrypt(context.Background(),
		plaintextF,
		dapr.EncryptOptions{
			ComponentName: CryptoComponentName,
			// 要使用的密钥名称
			// 由于这是一个对称密钥，我们将其指定为 AES 密钥包装算法
			KeyName:          SymmetricKeyName,
			KeyWrapAlgorithm: "AES",
		},
	)

    // ...

	// 将加密数据写入文件 "encrypted.out"
	encryptedF, err := os.Create("encrypted.out")

    // ...

	encryptedF.Close()

	fmt.Println("将解密数据写入 encrypted.out")
```

然后应用程序解密大图像文件：

```go
	// 现在，解密加密数据
	// 首先，再次打开文件 "encrypted.out"，这次用于读取
	encryptedF, err = os.Open("encrypted.out")

    // ...

	defer encryptedF.Close()

	// 现在，解密加密数据
	decStream, err := client.Decrypt(context.Background(),
		encryptedF,
		dapr.DecryptOptions{
			// 我们只需要传递组件的名称
			ComponentName: CryptoComponentName,
			// 传递密钥名称是可选的
			KeyName: SymmetricKeyName,
		},
	)

    // ...

	// 将解密数据写入文件 "decrypted.out.jpg"
	decryptedF, err := os.Create("decrypted.out.jpg")

    // ...

	decryptedF.Close()

	fmt.Println("将解密数据写入 decrypted.out.jpg")
}
```

{{% /codetab %}}


{{< /tabs >}}

## 观看演示

观看来自 Dapr 社区电话 #83 的加密 API [演示视频](https://youtu.be/PRWYX4lb2Sg?t=1148)：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 告诉我们您的想法！

我们正在不断努力改进我们的快速入门示例，并重视您的反馈。您觉得这个快速入门有帮助吗？您有改进建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)进行讨论。

## 下一步

- 通过 [更多使用加密 API 加密和解密的示例]({{< ref howto-cryptography.md >}}) 进行学习
- 了解更多关于 [作为 Dapr 构建块的加密技术]({{< ref cryptography-overview.md >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
