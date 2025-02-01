---
type: docs
title: "如何：使用加密API"
linkTitle: "如何：使用加密"
weight: 2000
description: "学习如何加密和解密文件"
---

在您了解了[Dapr作为加密构建块]({{< ref cryptography-overview.md >}})之后，让我们通过使用SDK来学习如何使用加密API。

{{% alert title="注意" color="primary" %}}
Dapr加密功能目前处于alpha测试阶段。

{{% /alert %}}

## 加密

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}

{{% codetab %}}

<!--Python-->

在您的项目中使用Dapr SDK和gRPC API，您可以加密数据流，例如文件或字符串：

```python
# 当传递数据（缓冲区或字符串）时，`encrypt`会返回一个包含加密信息的缓冲区
def encrypt_decrypt_string(dapr: DaprClient):
    message = 'The secret is "passw0rd"'

    # 加密消息
    resp = dapr.encrypt(
        data=message.encode(),
        options=EncryptOptions(
            # 加密组件的名称（必需）
            component_name=CRYPTO_COMPONENT_NAME,
            # 存储在加密组件中的密钥（必需）
            key_name=RSA_KEY_NAME,
            # 用于包装密钥的算法，必须由上述密钥支持。
            # 选项包括："RSA", "AES"
            key_wrap_algorithm='RSA',
        ),
    )

    # 该方法返回一个可读流，我们将其完整读取到内存中
    encrypt_bytes = resp.read()
    print(f'加密后的消息长度为 {len(encrypt_bytes)} 字节')
```

{{% /codetab %}}

{{% codetab %}}

<!--JavaScript-->

在您的项目中使用Dapr SDK和gRPC API，您可以加密缓冲区或字符串中的数据：

```js
// 当传递数据（缓冲区或字符串）时，`encrypt`会返回一个包含加密信息的缓冲区
const ciphertext = await client.crypto.encrypt(plaintext, {
    // Dapr组件的名称（必需）
    componentName: "mycryptocomponent",
    // 存储在组件中的密钥名称（必需）
    keyName: "mykey",
    // 用于包装密钥的算法，必须由上述密钥支持。
    // 选项包括："RSA", "AES"
    keyWrapAlgorithm: "RSA",
});
```

API也可以与流一起使用，以更高效地加密来自流的数据。下面的示例使用流加密文件，并写入另一个文件：

```js
// `encrypt`可以用作双工流
await pipeline(
    fs.createReadStream("plaintext.txt"),
    await client.crypto.encrypt({
        // Dapr组件的名称（必需）
        componentName: "mycryptocomponent",
        // 存储在组件中的密钥名称（必需）
        keyName: "mykey",
        // 用于包装密钥的算法，必须由上述密钥支持。
        // 选项包括："RSA", "AES"
        keyWrapAlgorithm: "RSA",
    }),
    fs.createWriteStream("ciphertext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->
在您的项目中使用Dapr SDK和gRPC API，您可以加密字符串或字节数组中的数据：

```csharp
using var client = new DaprClientBuilder().Build();

const string componentName = "azurekeyvault"; //更改此以匹配您的加密组件
const string keyName = "myKey"; //更改此以匹配您加密存储中的密钥名称

const string plainText = "This is the value we're going to encrypt today";

//将字符串编码为UTF-8字节数组并加密
var plainTextBytes = Encoding.UTF8.GetBytes(plainText);
var encryptedBytesResult = await client.EncryptAsync(componentName, plaintextBytes, keyName, new EncryptionOptions(KeyWrapAlgorithm.Rsa));
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

在您的项目中使用Dapr SDK，您可以加密数据流，例如文件。

```go
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// Dapr组件的名称（必需）
	ComponentName: "mycryptocomponent",
	// 存储在组件中的密钥名称（必需）
	KeyName:       "mykey",
	// 用于包装密钥的算法，必须由上述密钥支持。
	// 选项包括："RSA", "AES"
	Algorithm:     "RSA",
})
```

以下示例将`Encrypt` API置于上下文中，代码读取文件，加密它，然后将结果存储在另一个文件中。

```go
// 输入文件，明文
rf, err := os.Open("input")
if err != nil {
	panic(err)
}
defer rf.Close()

// 输出文件，加密
wf, err := os.Create("output.enc")
if err != nil {
	panic(err)
}
defer wf.Close()

// 使用Dapr加密数据
out, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	// 这是3个必需参数
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// 读取流并将其复制到输出文件
n, err := io.Copy(wf, out)
if err != nil {
	panic(err)
}
fmt.Println("已写入", n, "字节")
```

以下示例使用`Encrypt` API加密字符串。

```go
// 输入字符串
rf := strings.NewReader("Amor, ch’a nullo amato amar perdona, mi prese del costui piacer sì forte, che, come vedi, ancor non m’abbandona")

// 使用Dapr加密数据
enc, err := sdkClient.Encrypt(context.Background(), rf, dapr.EncryptOptions{
	ComponentName: "mycryptocomponent",
	KeyName:       "mykey",
	Algorithm:     "RSA",
})
if err != nil {
	panic(err)
}

// 将加密数据读取到字节切片中
enc, err := io.ReadAll(enc)
if err != nil {
	panic(err)
}
```

{{% /codetab %}}

{{< /tabs >}}

## 解密

{{< tabs "Python" "JavaScript" ".NET" "Go" >}}

{{% codetab %}}

<!--python-->

要解密数据流，请使用`decrypt`。

```python
def encrypt_decrypt_string(dapr: DaprClient):
    message = 'The secret is "passw0rd"'

    # ...

    # 解密加密数据
    resp = dapr.decrypt(
        data=encrypt_bytes,
        options=DecryptOptions(
            # 加密组件的名称（必需）
            component_name=CRYPTO_COMPONENT_NAME,
            # 存储在加密组件中的密钥（必需）
            key_name=RSA_KEY_NAME,
        ),
    )

    # 该方法返回一个可读流，我们将其完整读取到内存中
    decrypt_bytes = resp.read()
    print(f'解密后的消息长度为 {len(decrypt_bytes)} 字节')

    print(decrypt_bytes.decode())
    assert message == decrypt_bytes.decode()
```

{{% /codetab %}}

{{% codetab %}}

<!--JavaScript-->

使用Dapr SDK，您可以解密缓冲区中的数据或使用流。

```js
// 当传递数据作为缓冲区时，`decrypt`会返回一个包含解密信息的缓冲区
const plaintext = await client.crypto.decrypt(ciphertext, {
    // 唯一必需的选项是组件名称
    componentName: "mycryptocomponent",
});

// `decrypt`也可以用作双工流
await pipeline(
    fs.createReadStream("ciphertext.out"),
    await client.crypto.decrypt({
        // 唯一必需的选项是组件名称
        componentName: "mycryptocomponent",
    }),
    fs.createWriteStream("plaintext.out"),
);
```

{{% /codetab %}}

{{% codetab %}}

<!-- .NET -->
要解密字符串，请在您的项目中使用'解密Async' gRPC API。

在以下示例中，我们将获取一个字节数组（例如上面的示例）并将其解密为UTF-8编码的字符串。

```csharp
public async Task<string> DecryptBytesAsync(byte[] encryptedBytes)
{
  using var client = new DaprClientBuilder().Build();

  const string componentName = "azurekeyvault"; //更改此以匹配您的加密组件
  const string keyName = "myKey"; //更改此以匹配您加密存储中的密钥名称

  var decryptedBytes = await client.DecryptAsync(componentName, encryptedBytes, keyName);
  var decryptedString = Encoding.UTF8.GetString(decryptedBytes.ToArray());
  return decryptedString;
}
```

{{% /codetab %}}

{{% codetab %}}

<!--go-->

要解密文件，请在您的项目中使用`Decrypt` gRPC API。

在以下示例中，`out`是一个可以写入文件或在内存中读取的流，如上面的示例中所示。

```go
out, err := sdkClient.Decrypt(context.Background(), rf, dapr.EncryptOptions{
	// 唯一必需的选项是组件名称
	ComponentName: "mycryptocomponent",
})
```

{{% /codetab %}}

{{< /tabs >}}

## 下一步
[加密组件规范]({{< ref supported-cryptography >}})
