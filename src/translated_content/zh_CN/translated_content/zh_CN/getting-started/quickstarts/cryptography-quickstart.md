---
type: docs
title: "快速入门：加密"
linkTitle: 密码学
weight: 79
description: 开始使用 Dapr 的 Cryptography 构建块
---

{{% alert title="Alpha" color="warning" %}}
加密构建块当前位于 **alpha** 阶段.
{{% /alert %}}

让我们来看一下 Dapr [密码学构建块]({{< ref cryptography >}})。 在此快速入门中，您将创建一个应用程序，使用 Dapr 加密和解密数据的 API。 您将：

- 使用RSA密钥对短字符串进行加密和解密，在Go字节切片中读取结果。
- 使用流加密和解密大文件（使用AES密钥），将加密和解密的数据存储到文件中。

<img src="/images/crypto-quickstart.png" width=800 style="padding-bottom:15px;">

{{% alert title="Note" color="primary" %}}
此示例使用 Dapr SDK，它利用 gRPC 并且是 **强烈** 建议在使用加密 API 加密和解密消息时使用。
{{% /alert %}}

当前，您可以使用Go SDK来体验密码学 API。

{{< tabs "JavaScript" "Go" >}}

 <!-- JavaScript -->
{{% codetab %}}

> 这个快速入门包括一个名为 `crypto-quickstart`的JavaScript应用程序。

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新的Node.js已安装](https://nodejs.org/download/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [OpenSSL](https://www.openssl.org/source/) 在您的系统上可用

### 第1步：设置环境

克隆 [快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/cryptography)

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端中，从根目录导航到 cryptography 示例。

```bash
cd cryptography/javascript/sdk
```

导航到包含源代码的文件夹中:

```bash
cd ./crypto-quickstart
```

安装依赖项：

```bash
npm install
```

### 步骤 2：使用 Dapr 运行应用程序

应用程序代码定义了两个必需的键：

- 私有RSA密钥
- 一个256位的对称（AES）密钥

使用OpenSSL生成两个密钥，一个RSA密钥和一个AES密钥，并将其写入两个文件中：

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand -out keys/symmetric-key-256 32
```

使用 Dapr 运行 Go 服务应用程序:

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- npm start
```

**预期输出**

```
== APP == 2023-10-25T14:30:50.435Z INFO [GRPCClient, GRPCClient] Opening connection to 127.0.0.1:58173
== APP == == Encrypting message using buffers
== APP == Encrypted the message, got 856 bytes
== APP == == Decrypting message using buffers
== APP == Decrypted the message, got 24 bytes
== APP == The secret is "passw0rd"
== APP == == Encrypting message using streams
== APP == Encrypting federico-di-dio-photography-Q4g0Q-eVVEg-unsplash.jpg to encrypted.out
== APP == Encrypted the message to encrypted.out
== APP == == Decrypting message using streams
== APP == Decrypting encrypted.out to decrypted.out.jpg
== APP == Decrypted the message to decrypted.out.jpg
```

### 发生了什么？

#### `local-storage.yaml`

早些时候，您在 `crypto-quickstarts` 中创建了一个名为 `keys`的目录。 在 [这 `local-storage` 组件 YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml)这 `路径` 元数据映射到新创建的 `keys` 目录。

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
      # Path is relative to the folder where the example is located
      value: ./keys
```

#### `index.mjs`

[应用程序文件](https://github.com/dapr/quickstarts/blob/master/cryptography/javascript/sdk/crypto-quickstart/index.mjs) 使用您生成的 RSA 和 AES 密钥对消息和文件进行加密和解密。 应用程序创建一个新的 Dapr SDK 客户端：

```javascript
async function start() {
  const client = new DaprClient({
    daprHost,
    daprPort,
    communicationProtocol: CommunicationProtocolEnum.GRPC,
  });

  // Encrypt and decrypt a message from a buffer
  await encryptDecryptBuffer(client);

  // Encrypt and decrypt a message using streams
  await encryptDecryptStream(client);
}
```

##### 使用 RSA 密钥加密和解密字符串

一旦客户端创建完成，应用程序会对消息进行加密:

```javascript
async function encryptDecryptBuffer(client) {
  // Message to encrypt
  const plaintext = `The secret is "passw0rd"`

  // First, encrypt the message
  console.log("== Encrypting message using buffers");

  const encrypted = await client.crypto.encrypt(plaintext, {
    componentName: "localstorage",
    keyName: "rsa-private-key.pem",
    keyWrapAlgorithm: "RSA",
  });

  console.log("Encrypted the message, got", encrypted.length, "bytes");
```

然后应用程序解密消息：

```javascript
  // Decrypt the message
  console.log("== Decrypting message using buffers");
  const decrypted = await client.crypto.decrypt(encrypted, {
    componentName: "localstorage",
  });

  console.log("Decrypted the message, got", decrypted.length, "bytes");
  console.log(decrypted.toString("utf8"));

  // ...
}
```

##### 使用AES密钥加密和解密大文件

接下来，应用程序对一个大型图像文件进行加密：

```javascript
async function encryptDecryptStream(client) {
  // First, encrypt the message
  console.log("== Encrypting message using streams");
  console.log("Encrypting", testFileName, "to encrypted.out");

  await pipeline(
    createReadStream(testFileName),
    await client.crypto.encrypt({
      componentName: "localstorage",
      keyName: "symmetric-key-256",
      keyWrapAlgorithm: "A256KW",
    }),
    createWriteStream("encrypted.out"),
  );

  console.log("Encrypted the message to encrypted.out");
```

接下来，应用程序解密大型图像文件：

```javascript
  // Decrypt the message
  console.log("== Decrypting message using streams");
  console.log("Decrypting encrypted.out to decrypted.out.jpg");
  await pipeline(
    createReadStream("encrypted.out"),
    await client.crypto.decrypt({
      componentName: "localstorage",
    }),
    createWriteStream("decrypted.out.jpg"),
  );

  console.log("Decrypted the message to decrypted.out.jpg");
}
```

{{% /codetab %}}

 <!-- Go -->
{{% codetab %}}

> 此快速入门包括一个名为 `crypto-quickstart`的 Go 应用程序。

### 前提

对于此示例，您将需要：

- [Dapr CLI和初始化环境](https://docs.dapr.io/getting-started)。
- [最新版本的Go](https://go.dev/dl/)。
<!-- IGNORE_LINKS -->
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
<!-- END_IGNORE -->
- [OpenSSL](https://www.openssl.org/source/) 在您的系统上可用

### 第1步：设置环境

克隆 [快速入门存储库中提供的示例](https://github.com/dapr/quickstarts/tree/master/cryptography)

```bash
git clone https://github.com/dapr/quickstarts.git
```

在终端中，从根目录导航到 cryptography 示例。

```bash
cd cryptography/go/sdk
```

### 步骤 2：使用 Dapr 运行应用程序

导航到包含源代码的文件夹中:

```bash
cd ./crypto-quickstart
```

应用程序代码定义了两个必需的键：

- 私有RSA密钥
- 一个256位的对称（AES）密钥

使用OpenSSL生成两个密钥，一个RSA密钥和一个AES密钥，并将其写入两个文件中：

```bash
mkdir -p keys
# Generate a private RSA key, 4096-bit keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out keys/rsa-private-key.pem
# Generate a 256-bit key for AES
openssl rand -out keys/symmetric-key-256 32
```

使用 Dapr 运行 Go 服务应用程序:

```bash
dapr run --app-id crypto-quickstart --resources-path ../../../components/ -- go run .
```

**预期输出**

```
== APP == dapr client initializing for: 127.0.0.1:52407
== APP == Encrypted the message, got 856 bytes
== APP == Decrypted the message, got 24 bytes
== APP == The secret is "passw0rd"
== APP == Wrote decrypted data to encrypted.out
== APP == Wrote decrypted data to decrypted.out.jpg
```

### 发生了什么？

#### `local-storage.yaml`

早些时候，您在 `crypto-quickstarts` 中创建了一个名为 `keys`的目录。 在 [这 `local-storage` 组件 YAML](https://github.com/dapr/quickstarts/tree/master/cryptography/components/local-storage.yaml)这 `路径` 元数据映射到新创建的 `keys` 目录。

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
      # Path is relative to the folder where the example is located
      value: ./keys
```

#### `app.go`

[应用程序文件](https://github.com/dapr/quickstarts/tree/master/cryptography/go/sdk/crypto-quickstart/app.go) 使用您生成的 RSA 和 AES 密钥对消息和文件进行加密和解密。 应用程序创建一个新的 Dapr SDK 客户端：

```go
func main() {
    // Create a new Dapr SDK client
    client, err := dapr.NewClient()

    //...

    // Step 1: encrypt a string using the RSA key, then decrypt it and show the output in the terminal
    encryptDecryptString(client)

    // Step 2: encrypt a large file and then decrypt it, using the AES key
    encryptDecryptFile(client)
}
```

##### 使用 RSA 密钥加密和解密字符串

一旦客户端创建完成，应用程序会对消息进行加密:

```go
func encryptDecryptString(client dapr.Client) {
    // ...

    // Encrypt the message
    encStream, err := client.Encrypt(context.Background(),
        strings.NewReader(message),
        dapr.EncryptOptions{
            ComponentName: CryptoComponentName,
            // Name of the key to use
            // Since this is a RSA key, we specify that as key wrapping algorithm
            KeyName:          RSAKeyName,
            KeyWrapAlgorithm: "RSA",
        },
    )

    // ...

    // The method returns a readable stream, which we read in full in memory
    encBytes, err := io.ReadAll(encStream)
    // ...

    fmt.Printf("Encrypted the message, got %d bytes\n", len(encBytes))
```

然后应用程序解密消息：

```go
    // Now, decrypt the encrypted data
    decStream, err := client.Decrypt(context.Background(),
        bytes.NewReader(encBytes),
        dapr.DecryptOptions{
            // We just need to pass the name of the component
            ComponentName: CryptoComponentName,
            // Passing the name of the key is optional
            KeyName: RSAKeyName,
        },
    )

    // ...

    // The method returns a readable stream, which we read in full in memory
    decBytes, err := io.ReadAll(decStream)

    // ...

    // Print the message on the console
    fmt.Printf("Decrypted the message, got %d bytes\n", len(decBytes))
    fmt.Println(string(decBytes))
}
```

##### 使用AES密钥加密和解密大文件

接下来，应用程序对一个大型图像文件进行加密：

```go
func encryptDecryptFile(client dapr.Client) {
    const fileName = "liuguangxi-66ouBTTs_x0-unsplash.jpg"

    // Get a readable stream to the input file
    plaintextF, err := os.Open(fileName)

    // ...

    defer plaintextF.Close()

    // Encrypt the file
    encStream, err := client.Encrypt(context.Background(),
        plaintextF,
        dapr.EncryptOptions{
            ComponentName: CryptoComponentName,
            // Name of the key to use
            // Since this is a symmetric key, we specify AES as key wrapping algorithm
            KeyName:          SymmetricKeyName,
            KeyWrapAlgorithm: "AES",
        },
    )

    // ...

    // Write the encrypted data to a file "encrypted.out"
    encryptedF, err := os.Create("encrypted.out")

    // ...

    encryptedF.Close()

    fmt.Println("Wrote decrypted data to encrypted.out")
```

接下来，应用程序解密大型图像文件：

```go
    // Now, decrypt the encrypted data
    // First, open the file "encrypted.out" again, this time for reading
    encryptedF, err = os.Open("encrypted.out")

    // ...

    defer encryptedF.Close()

    // Now, decrypt the encrypted data
    decStream, err := client.Decrypt(context.Background(),
        encryptedF,
        dapr.DecryptOptions{
            // We just need to pass the name of the component
            ComponentName: CryptoComponentName,
            // Passing the name of the key is optional
            KeyName: SymmetricKeyName,
        },
    )

    // ...

    // Write the decrypted data to a file "decrypted.out.jpg"
    decryptedF, err := os.Create("decrypted.out.jpg")

    // ...

    decryptedF.Close()

    fmt.Println("Wrote decrypted data to decrypted.out.jpg")
}
```

{{% /codetab %}}


{{< /tabs >}}

## 观看演示

请观看 [演示视频，了解 Dapr Community Call #83](https://youtu.be/PRWYX4lb2Sg?t=1148)中的密码学 API：

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/PRWYX4lb2Sg?start=1148" title="YouTube 视频播放器" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 告诉我们您的想法

我们一直在努力改进我们的快速入门示例，并重视您的反馈。 您觉得此快速入门有帮助吗？ 您有改进的建议吗？

加入我们的 [discord 频道](https://discord.com/channels/778680217417809931/953427615916638238)中的讨论。

## 下一步

- 探索 [使用加密 API 进行加密和解密的更多示例]({{< ref howto-cryptography.md >}})
- 了解 [作为 Dapr 构建块的密码学]({{< ref cryptography-overview.md >}})

{{< button text="探索 Dapr 教程  >>" page="getting-started/tutorials/_index.md" >}}
