---
type: docs
title: "文档贡献"
linkTitle: "Docs"
weight: 2000
description: >
  向Dapr Docs投稿的准则
---

本指南包含有关对 [Dapr 文档库](https://github.com/dapr/docs) 的贡献信息。 请在对 Dapr docs 作出贡献之前，请先阅读以下准则。 本指南假定您已阅读了 [指南]({{< ref contributing-overview>}}) ，适用于任何 Dapr 项目贡献。

Dapr 文档已发布到 [docs.dapr.io](https://docs.dapr.io)。 因此，任何贡献都必须确保文档能够正确编译和发布。

## 先决条件
Dapr docs 使用 [Hugo](https://gohugo.io/) 与 [Docsy](https://docsy.dev) 主题构建。 要在提交添加项之前验证文档是否正确构建，您应该设置本地环境以在本地构建和显示文档。

Fork [文档存储库](https://github.com/dapr/docs) 以处理任何更改

遵循存储库 [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup) 中的指示信息以在本地安装 Hugo 并构建 docs Web站点。

## 风格和语气
应在所有 Dapr 文档中遵循这些约定，以确保所有文档的体验一致。

- **大小写** - 只在句子开头或专有名词(包括技术名称 Dapr、Redis、Kubernetes等) 时使用大写。
- **页眉和标题** - 页眉和标题必须是描述性的和清晰的，使用句子大小写，即对页眉和标题也使用上述的大小写指导。
- **使用简单的句子** - 易于阅读的句子意味着读者可以快速使用您所共享的指导。
- **避免使用第一人称** - 用第二人称 "你"、"你的 "代替 "我"、"我们"、"我们的"。
- **假设一个新的开发者受众** - 一些明显的步骤可能看起来很难。 例如: 现在将环境变量 Dapr 设置为值 X。最好给读者一个明确的命令来做这个，而不是让他们自己去想办法。
- **使用现在时** - 避免使用 "这个命令将安装 redis"这样的句子，因为这意味着操作是在未来发生。 请改为使用 " 此命令安装 redis" (现在时态) 。

## 贡献新文档页面
- 确保你所写的文件在层次结构中的位置是正确的。
- 在可能的情况下，避免创建新的部分，很有可能在文档的层次结构中已经有一个合适的位置。
- 确保包括完整的 [Hugo front-matter](front-matter)。

### 贡献一个新的概念文档
- 请确保读者能够理解为什么他们应该关注此功能。 它能帮他们解决什么问题?
- 请确保文档引用该规范以获取使用 API 的示例。
- 确保规范在名称，参数和术语方面与概念一致。 根据需要更新概念和规范。
- 请避免重复该规范。 这个想法是为了给读者提供更多关于能力的信息和背景，以便他们可以尝试这个。 因此，尽可能提供更多的信息和实施细节。
- 提供指向 [参考资料]({{X44X}}) 中的规范的链接。
- 在可能的情况下，参考一个实用的How-To文档。

### 贡献新的 How-To 指南

- `如何操作` 文章旨在为希望启用某项功能、整合某项技术或在特定场景下使用 Dapr 的读者提供逐步的实用指导。
- 子目录命名 - 目录名称应该是描述性的，如果引用特定组件或概念，那么应以相关名称开头。 示例： *pubsub-namespaces*。
- 请勿假定读者使用特定环境，除非文章本身是特定的环境。 这包括操作系统 ( Windows/Linux/MacOS )，部署目标 ( Kubernetes， IoT 等 ) 或编程语言。 如果不同操作系统的说明不同，请为所有系统提供指导。
- 包括易于复制和粘贴的 代码/示例/配置 片段。
- 在文章末尾，为读者提供相关链接和后续步骤 ( 这可以是其他相关的 "如何操作 " ，参考样本或相关概念 ) 。

## Docs.dapr.io 的要求
任何贡献都必须确保不中断 Web 站点构建。 Hugo 构建 Web 站点的方式需要遵循以下指导。

### 文件和文件夹名称
文件和文件夹名称应该是全局唯一的。
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter
[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) 是常规标记文件的内容，并将其升级到 Hugo 兼容文档，以呈现到导航栏和 ToC 目录中。

每个页面都需要在文档的顶部有一个这样的部分:
```yaml
---
type: docs
title: "TITLE FOR THE PAGE"
linkTitle: "SHORT TITLE FOR THE NAV BAR"
weight: (number)
description: "1+ SENTENCES DESCRIBING THE ARTICLE"
---
```

#### 例子
```yaml
---
type: docs
title: "服务调用概述"
linkTitle: "Overview"
weight: 10
description: "Dapr服务调用的快速概述，以及如何在应用程序中使用它来调用服务。"
---
```

> 权重确定左侧栏中页面的顺序，其中 0 是最顶部。

Front-matter应完成所有字段，包括类型、标题、链接标题、重量和描述。
- `title` 应该仅有一句话，最后没有句号
- `linkTitle` 应该是 1到 3 个字，前面的How-to除外。
- `description` 应该用1-2句话来说明读者将在本文档中学到什么，完成什么，或做什么。

根据 [样式惯例](#styling-conventions)，标题只能大写第一个字和专有名词，但 "How-To："除外。
    - "Dapr 服务调用入门"
    - "How-To: 设置本地 Redis 实例"

### 引用其他页面
Hugo `ref` 和 `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) 用于引用其他页面和章节。 如果一个页面被错误地重命名或删除，它也允许构建中断。

此shortcode与markdown页面的其余部分内联，将链接到章节/文件夹名称的 _index.md:
```md
{{</* ref "folder" */>}}
```

这个shortcode将链接到一个特定的页面。
```md
{{</* ref "page.md" */>}}
```
> 请注意，所有的页面和文件夹都需要有全局唯一的名称，以使ref shortcode正常工作。 如果存在重复的名称，那么构建将中断，并且将抛出错误。

#### 引用其他页面中的部分

要引用另一页面中的特定部分，请在引用末尾添加 `#section-short-name`。

通常，节短名称是节标题的文本，全部为小写，空格更改为"-"。 您可以通过访问 Web 站点页面，单击该部分旁边的链接图标 (🔗) 来检查区段短名称，并查看在导航栏中呈现 URL 的方式。 "#" 后面的内容是您的区段短名称。

例如，对于此特定部分，完整引用页面和部分将是:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

### 图片
Docsy和Hugo使用的markdown规范没有提供使用markdown符号调整图片大小的选项。 而是使用原始 HMTL 。

首先将图片放置在 `/daprdocs/static/images` 下，命名惯例为 `[page-name]-[image-name].[png|jpg|svg]`.

然后使用以下项链接到图片:
```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```
> 请不要忘记设置 alt 属性，以保留视觉受损用户的文档可读。

#### 例子

此 HTML 将在 `overview.md` 页面上显示 `dapr-overview.png` 图片:
```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

### 标签内容
通过 [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/) 可以实现标签。

总体格式为:
```
{{</* tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Content for Tab1]
{{% /codetailb %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetailb %}}

{{< /tabs */>}}
```

您所编写的所有内容都将被渲染为Markdown，因此您可以包含图像、代码块、YouTube视频等。

#### 例子
````
{{</* tabs Windows Linux MacOS>}}

{{% codetab %}}
`` powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
````
{{% /codetab %}}

{{% codetab %}}
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{< /tabs */>}}
````

这个例子将呈现为：

{{< tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
````
{{% /codetab %}}

{{% codetab %}}
```bash
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash
```
{{% /codetab %}}

{{% codetab %}}
```bash
brew install dapr/tap/dapr-cli
```
{{% /codetab %}}

{{< /tabs >}}

### YouTube 视频
Hugo 可以使用短代码自动嵌入 YouTube 视频:
```
{{</* youtube [VIDEO ID] */>}}
```

#### 例子

给定视频：https://youtu.be/dQw4w9WgXcQ

短代码为：
```
{{</* youtube dQw4w9WgXcQ */>}}
```

### 参考资料
- [Docsy 编写指南](https://www.docsy.dev/docs/adding-content/)
