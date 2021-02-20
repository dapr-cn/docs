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

## 前期准备
The Dapr docs are built using [Hugo](https://gohugo.io/) with the [Docsy](https://docsy.dev) theme. 要在提交添加项之前验证文档是否正确构建，您应该设置本地环境以在本地构建和显示文档。

Fork the [docs repository](https://github.com/dapr/docs) to work on any changes

遵循存储库 [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup) 中的指示信息以在本地安装 Hugo 并构建 docs Web站点。

## 分支指南

Dapr 文档处理分支的方式与大多数代码存储库不同。 每个分支都标记为运行时发行版的主版本和次要版本，而不存在 `master` 或 `main` 分支。 完整列表，请访问 [Docs repo](https://github.com/dapr/docs#branch-guidance)

总体而言，所有更新都应进入对应 Dapr 最新版本的文档分支。 您可以直接在 https://github.com/dapr/docs 找到，因为最新版本将是默认分支。 对于适用于发布候选版本或文档的预发行版本的任何文档更改，请对该特定分支修改。

例如，如果要修复拼写错误、添加注释或澄清点，请在默认 Dapr 分支上变更。 如果要记录即将发生的组件或运行时的变更，请对预发行版分支进行修改。 分支可以在 [ Docs repo](https://github.com/dapr/docs#branch-guidance) 中找到

## Style and tone
These conventions should be followed throughout all Dapr documentation to ensure a consistent experience across all docs.

- **大小写** - 只在句子开头或专有名词(包括技术名称 Dapr、Redis、Kubernetes等) 时使用大写。
- **页眉和标题** - 页眉和标题必须是描述性的和清晰的，使用句子大小写，即对页眉和标题也使用上述的大小写指导。
- **使用简单的句子** - 易于阅读的句子意味着读者可以快速使用您所共享的指导。
- **避免使用第一人称** - 用第二人称 "你"、"你的 "代替 "我"、"我们"、"我们的"。
- **假设一个新的开发者受众** - 一些明显的步骤可能看起来很难。 例如: 现在将环境变量 Dapr 设置为值 X。最好给读者一个明确的命令来做这个，而不是让他们自己去想办法。
- **使用现在时** - 避免使用 "这个命令将安装 redis"这样的句子，因为这意味着操作是在未来发生。 请改为使用 " 此命令安装 redis" (现在时态) 。

## Contributing a new docs page
- 确保你所写的文件在层次结构中的位置是正确的。
- 在可能的情况下，避免创建新的部分，很有可能在文档的层次结构中已经有一个合适的位置。
- Make sure to include a complete [Hugo front-matter](#front-matter).

### 贡献一个新的概念文档
- 请确保读者能够理解为什么他们应该关注此功能。 它能帮他们解决什么问题?
- 请确保文档引用该规范以获取使用 API 的示例。
- 确保规范在名称，参数和术语方面与概念一致。 根据需要更新概念和规范。
- 请避免重复该规范。 这个想法是为了给读者提供更多关于能力的信息和背景，以便他们可以尝试这个。 因此，尽可能提供更多的信息和实施细节。
- 提供指向 [参考资料]({{X45X}}) 中的规范的链接。
- 在可能的情况下，参考一个实用的How-To文档。

### 贡献新的 How-To 指南

- `如何操作` 文章旨在为希望启用某项功能、整合某项技术或在特定场景下使用 Dapr 的读者提供逐步的实用指导。
- 子目录命名 - 目录名称应该是描述性的，如果引用特定组件或概念，那么应以相关名称开头。 示例： *pubsub-namespaces*。
- 请勿假定读者使用特定环境，除非文章本身是特定的环境。 这包括操作系统 ( Windows/Linux/MacOS )，部署目标 ( Kubernetes， IoT 等 ) 或编程语言。 如果不同操作系统的说明不同，请为所有系统提供指导。
- 包括易于复制和粘贴的 代码/示例/配置 片段。
- 在文章末尾，为读者提供相关链接和后续步骤 ( 这可以是其他相关的 "如何操作 " ，参考样本或相关概念 ) 。

## Requirements for docs.dapr.io
Any contribution must ensure not to break the website build. The way Hugo builds the website requires following the below guidance.

### 文件和文件夹名称
File and folder names should be globally unique.
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter
[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) is what takes regular markdown files and upgrades them into Hugo compatible docs for rendering into the nav bars and ToCs.

Every page needs a section at the top of the document like this:
```yaml
---
type: docs
title: "TITLE FOR THE PAGE"
linkTitle: "SHORT TITLE FOR THE NAV BAR"
weight: (number)
description: "1+ SENTENCES DESCRIBING THE ARTICLE"
---
```

#### 示例
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

Front-matter should be completed with all fields including type, title, linkTitle, weight, and description.
- `title` 应该仅有一句话，最后没有句号
- `linkTitle` 应该是 1到 3 个字，前面的How-to除外。
- `description` should be 1-2 sentences on what the reader will learn, accomplish, or do in this doc.

As per the [styling conventions](#styling-conventions), titles should only capitalize the first word and proper nouns, with the exception of "How-To:"
    - "Dapr 服务调用入门"
    - "How-To: 设置本地 Redis 实例"

### 引用其他页面
Hugo `ref` and `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) are used to reference other pages and sections. It also allows the build to break if a page is incorrectly renamed or removed.

This shortcode, written inline with the rest of the markdown page, will link to the _index.md of the section/folder name:
```md
{{</* ref "folder" */>}}
```

This shortcode will link to a specific page:
```md
{{</* ref "page.md" */>}}
```
> 请注意，所有的页面和文件夹都需要有全局唯一的名称，以使ref shortcode正常工作。 如果存在重复的名称，那么构建将中断，并且将抛出错误。

#### 引用其他页面中的部分

To reference a specific section in another page, add `#section-short-name` to the end of your reference.

As a general rule, the section short name is the text of the section title, all lowercase, with spaces changed to "-". You can check the section short name by visiting the website page, clicking the link icon (🔗) next to the section, and see how the URL renders in the nav bar. The content after the "#" is your section shortname.

As an example, for this specific section the complete reference to the page and section would be:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

### 图片
The markdown spec used by Docsy and Hugo does not give an option to resize images using markdown notation. Instead, raw HMTL is used.

Begin by placing images under `/daprdocs/static/images` with the naming convention of `[page-name]-[image-name].[png|jpg|svg]`.

Then link to the image using:
```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```
> 请不要忘记设置 alt 属性，以保留视觉受损用户的文档可读。

#### Example:

This HTML will display the `dapr-overview.png` image on the `overview.md` page:
```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

### 标签内容
Tabs are made possible through [Hugo shortcodes](https://gohugo.io/content-management/shortcodes/).

The overall format is:
```
{{</* tabs [Tab1] [Tab2]>}}

{{% codetab %}}
[Content for Tab1]
{{% /codetab %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetab %}}

{{< /tabs */>}}
```

All content you author will be rendered to Markdown, so you can include images, code blocks, YouTube videos, and more.

#### 例子
````
{{</* tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
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
This example will render to this:
{{< tabs Windows Linux MacOS>}}
{{% codetab %}}
```powershell
这个例子将呈现为：

{{< tabs Windows Linux MacOS>}}

{{% codetab %}}
```powershell
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"
```
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
