---
type: docs
title: "Docs contributions"
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

- **大小写** - 只在句子开头或专有名词（包括技术名称 Dapr、Redis、Kubernetes等）时使用大写。
- **页眉和标题** - 页眉和标题必须是描述性的和清晰的，使用句子大小写，即对页眉和标题也使用上述的大小写指导。
- **使用简单的句子** - 易于阅读的句子意味着读者可以快速使用您所共享的指导。
- **避免使用第一人称** - 用第二人称 "你"、"你的 "代替 "我"、"我们"、"我们的"。
- **假设一个新的开发者受众** - 一些明显的步骤可能看起来很难。 例如: 现在将环境变量 Dapr 设置为值 X。最好给读者一个明确的命令来做这个，而不是让他们自己去想办法。
- **使用现在时** - 避免使用 "这个命令将安装 redis"这样的句子，因为这意味着操作是在未来发生。 请改为使用 " 此命令安装 redis" ( 现在时态 ) 。

## 贡献新文档页面
- 确保你所写的文件在层次结构中的位置是正确的。
- 在可能的情况下，避免创建新的部分，很有可能在文档的层次结构中已经有一个合适的位置。
- 确保包括完整的 [Hugo front-matter](front-matter)。

### 贡献一个新的概念文档
- Ensure the reader can understand why they should care about this feature. What problems does it help them solve?
- Ensure the doc references the spec for examples of using the API.
- Ensure the spec is consistent with concept in terms of names, parameters and terminology. Update both the concept and the spec as needed.
- Avoid just repeating the spec. The idea is to give the reader more information and background on the capability so that they can try this out. Hence provide more information and implementation details where possible.
- Provide a link to the spec in the [Reference]({{X44X}}) section.
- Where possible reference a practical How-To doc.

### 贡献新的 How-To 指南

- `How To` articles are meant to provide step-by-step practical guidance on to readers who wish to enable a feature, integrate a technology or use Dapr in a specific scenario.
- Sub directory naming - the directory name should be descriptive and if referring to specific component or concept should begin with the relevant name. Example *pubsub-namespaces*.
- Do not assume the reader is using a specific environment unless the article itself is specific to an environment. This include OS (Windows/Linux/MacOS), deployment target (Kubernetes, IoT etc.) or programming language. If instructions vary between operating systems, provide guidance for all.
- Include code/sample/config snippets that can be easily copied and pasted.
- At the end of the article, provide the reader with related links and next steps (this can be other relevant "how-to", samples for reference or related concepts).

## Docs.dapr.io 的要求
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

#### 例子
```yaml
---
type: docs
title: "Service invocation overview"
linkTitle: "Overview"
weight: 10
description: "A quick overview of Dapr service invocation and how to use it to invoke services within your application"
---
```

> Weight determines the order of the pages in the left sidebar, with 0 being the top-most.

Front-matter should be completed with all fields including type, title, linkTitle, weight, and description.
- `title` should be 1 sentence, no period at the end
- `linkTitle` should be 1-3 words, with the exception of How-to at the front.
- `description` should be 1-2 sentences on what the reader will learn, accomplish, or do in this doc.

As per the [styling conventions](#styling-conventions), titles should only capitalize the first word and proper nouns, with the exception of "How-To:"
    - "Getting started with Dapr service invocation"
    - "How-To: Setup a local Redis instance"

### Referencing other pages
Hugo `ref` and `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) are used to reference other pages and sections. It also allows the build to break if a page is incorrectly renamed or removed.

This shortcode, written inline with the rest of the markdown page, will link to the _index.md of the section/folder name:
```md
{{</* ref "folder" */>}}
```

This shortcode will link to a specific page:
```md
{{</* ref "page.md" */>}}
```
> Note that all pages and folders need to have globally unique names in order for the ref shortcode to work properly. If there are duplicate names the build will break and an error will be thrown.

#### Referencing sections in other pages

To reference a specific section in another page, add `#section-short-name` to the end of your reference.

As a general rule, the section short name is the text of the section title, all lowercase, with spaces changed to "-". You can check the section short name by visiting the website page, clicking the link icon (🔗) next to the section, and see how the URL renders in the nav bar. The content after the "#" is your section shortname.

As an example, for this specific section the complete reference to the page and section would be:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

### Images
The markdown spec used by Docsy and Hugo does not give an option to resize images using markdown notation. Instead, raw HMTL is used.

Begin by placing images under `/daprdocs/static/images` with the naming convention of `[page-name]-[image-name].[png|jpg|svg]`.

Then link to the image using:
```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```
> Don't forget to set the alt attribute to keep the docs readable for our visually impaired users.

#### Example

This HTML will display the `dapr-overview.png` image on the `overview.md` page:
```md
<img src="/images/overview-dapr-overview.png" width=1000 alt="Overview diagram of Dapr and its building blocks">
```

### Tabbed content
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

#### Example
````
{{</* tabs Windows Linux MacOS>}}

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

{{< /tabs */>}}
````

This example will render to this:

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

### YouTube videos
Hugo can automatically embed YouTube videos using a shortcode:
```
{{</* youtube [VIDEO ID] */>}}
```

#### Example

Given the video https://youtu.be/dQw4w9WgXcQ

The shortcode would be:
```
{{</* youtube dQw4w9WgXcQ */>}}
```

### References
- [Docsy authoring guide](https://www.docsy.dev/docs/adding-content/)
