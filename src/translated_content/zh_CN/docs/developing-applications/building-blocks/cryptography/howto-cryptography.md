---
type: docs
title: 如何使用加密API
linkTitle: 如何使用密码学
weight: 2000
description: 学习如何加密和解密文件
---

现在您已经阅读了 [Dapr密码学构建块]({{< ref cryptography-overview.md >}})，让我们通过使用SDK与密码学API一起进行演示。

{{% alert title="注意" color="primary" %}}
Dapr密码学目前处于alpha阶段。

{{% /alert %}}

## 加密

{{< tabs "JavaScript" "Go" ".NET" >}}

{{% codetab %}}

<!--JavaScript-->

使用 Dapr SDK 在您的项目中，通过 gRPC API，您可以在缓冲区或字符串中加密数据：

```js
// When passing data (a buffer or string), `encrypt` returns a Buffer with the encrypted message
const ciphertext = await client.crypto.encrypt(plaintext, {
    // Name of the Dapr component (required)
    componentName: "mycryptocomponent",
    // Name of the key stored in the component (required)
    keyName: "mykey",
    // Algorithm used for wrapping the key, which must be supported by the key named above.
    // Options include: "RSA", "AES"
    keyWrapAlgorithm: "RSA",
});
```

当数据来自流时，API也可以与流一起使用，以更高效地对数据进行加密。 以下示例使用流将文件加密，并将结果写入另一个文件：

```js
// `encrypt` can be used as a Duplex stream
await pipeline(
    fs.createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
        // Name of the Dapr component (required)
        componentName: "mycryptocomponent",
        // Name of the key stored in the component (required)
        keyName: "mykey",
        // Algorithm used for wrapping the key, which must be supported by the key named above.
        // Options include: "RSA", "AES"
        keyWrapAlgorithm: "RSA",
    }),
    fs.createWriteStream("ciphertext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

在您的项目中使用 Dapr SDK，您可以对数据流进行加密，例如文件。

```go
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// Name of the Dapr component (required)
	ComponentName: "mycryptocomponent",
	// Name of the key stored in the component (required)
	KeyName:       "mykey",
	// Algorithm used for wrapping the key, which must be supported by the key named above.
	// Options include: "RSA", "AES"
	Algorithm:     "RSA",
})
```

以下示例将 `Encrypt` API 放入上下文中，使用代码读取文件，对其进行加密，然后将结果存储在另一个文件中。

```go
// Input file, clear-text
rf, err := os.Open("input")
if err != nil {
	panic(err)
}
defer rf.Close()

// Output file, encrypted
wf, err := os.Create("output.enc")
if err != nil {
	panic(err)
}
defer wf.Close()

// Encrypt the data using Dapr
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// These are the 3 required parameters
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// Read the stream and copy it to the out file
n, err := io.Copy(wf, out)
if err != nil {
	panic(err)
}
fmt.Println("Written", n, "bytes")
```

以下示例使用 `Encrypt` API 对字符串进行加密。

```go
// Input string
rf := strings.NewReader("Amor, ch’a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m’abbandona")

// Encrypt the data using Dapr
enc, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// Read the encrypted data into a byte slice
enc, err := io.ReadAll(enc)
if err != nil {
	panic(err)
}
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->

使用 Dapr SDK 在您的项目中，通过 gRPC API，您可以在字符串或字节数组中加密数据：

```csharp
using var client = new DaprClientBuilder().Build();

const string componentName = "azurekeyvault"; //Change this to match your cryptography component
const string keyName = "myKey"; //Change this to match the name of the key in your cryptographic store

const string plainText = "This is the value we're going to encrypt today";

//Encode the string to a UTF-8 byte array and encrypt it
var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
var encryptedBytesResult = await client.EncryptAsync(componentName, plaintextBytes, keyName, new EncryptionOptions(KeyWrapAlgorithm.Rsa));
```

{{% /codetab %}}

{{< /tabs >}}

## 解密

{{< tabs "JavaScript" "Go" ".NET" >}}

{{% codetab %}}

<!--JavaScript-->

使用 Dapr SDK，您可以使用缓冲区或流解密数据。

```js
// When passing data as a buffer, `decrypt` returns a Buffer with the decrypted message
const plaintext = await client.crypto.decrypt(ciphertext, {
    // Only required option is the component name
    componentName: "mycryptocomponent",
});

// `decrypt` can also be used as a Duplex stream
await pipeline(
    fs.createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
        // Only required option is the component name
        componentName: "mycryptocomponent",
    }),
    fs.createWriteStream("plaintext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

要解密文件，请使用 `Decrypt` gRPC API 到您的项目。

在下面的示例中，`out` 是一个可以写入文件或在内存中读取的流，就像上面的示例一样。

```go
out, err := sdkClient.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// Only required option is the component name
	ComponentName: "mycryptocomponent",
})
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->

要解密字符串，请在您的项目中使用 'DecryptAsync' gRPC API。

在下面的示例中，我们将使用一个字节数组（例如上面的示例）对其进行解密，得到一个UTF-8编码的字符串。

```csharp
public async Task<string> DecryptBytesAsync(byte[] encryptedBytes)
{
  using var client = new DaprClientBuilder().Build();

  const string componentName = "azurekeyvault"; //Change this to match your cryptography component
  const string keyName = "myKey"; //Change this to match the name of the key in your cryptographic store

  var decryptedBytes = await client.DecryptAsync(componentName, encryptedBytes, keyName);
  var decryptedString = Encoding.UTF8.GetString(decryptedBytes.ToArray());
  return decryptedString;
}
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步

[支持的加密组件列表]({{< ref supported-cryptography >}})
