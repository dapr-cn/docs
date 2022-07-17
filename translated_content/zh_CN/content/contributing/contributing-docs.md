---
type: docs
title: "文档贡献"
linkTitle: "Docs"
weight: 2000
description: >
  向Dapr Docs投稿的准则
---

本指南包含有关对 [Dapr 文档库](https://github.com/dapr/docs) 的贡献信息。 请在对 Dapr docs 作出贡献之前，请先阅读以下准则。 本指南假定您已阅读了适用于任何Dapr项目贡献的[通用指南]({{< ref contributing-overview>}})。

Dapr 文档已发布到 [docs.dapr.io](https://docs.dapr.io)。 因此，任何贡献都必须确保文档能够正确编译和发布。

## 先决条件
Dapr docs 使用 [Hugo](https://gohugo.io/) 的[Docsy](https://docsy.dev) 主题构建。 要在提交添加项之前验证文档是否正确构建，您应该设置本地环境以在本地构建和显示文档。

Fork [文档 repo](https://github.com/dapr/docs) 以处理任何更改

遵循存储库 [README.md](https://github.com/dapr/docs/blob/master/README.md#environment-setup) 中的指示信息以在本地安装 Hugo 并构建 docs Web站点。

## 分支指南
Dapr 文档处理分支的方式与大多数代码存储库不同。 每个分支都标记为运行时发行版的主版本和次要版本，而不存在 `master` 或 `main` 分支。 完整列表，请访问 [Docs repo](https://github.com/dapr/docs#branch-guidance)

总体而言，所有更新都应进入对应 Dapr 最新版本的文档分支。 您可以直接在 [https://github.com/dapr/docs](https://github.com/dapr/docs)找到这个选项，因为最新版本将是默认分支。 对于适用于发布候选版本或文档的预发行版本的任何文档更改，请对该特定分支修改。

例如，如果要修复拼写错误、添加注释或澄清点，请在默认 Dapr 分支上变更。 如果要记录即将发生的组件或运行时的变更，请对预发行版分支进行修改。 分支可以在 [ Docs repo](https://github.com/dapr/docs#branch-guidance) 中找到

## 风格和语气
应在所有 Dapr 文档中遵循这些约定，以确保所有文档的体验一致。

- **大小写** - 只在句子开头或专有名词(包括技术名称 Dapr、Redis、Kubernetes等) 时使用大写。
- **页眉和标题** - 页眉和标题必须是描述性的和清晰的，使用句子大小写，即对页眉和标题也使用上述的大小写指导。
- **使用简单的句子** - 易于阅读的句子意味着读者可以快速使用您所共享的指导。
- **避免使用第一人称** - 用第二人称 "你"、"你的 "代替 "我"、"我们"、"我们的"。
- **假设一个新的开发者受众** - 一些明显的步骤可能看起来很难。 例如: 现在将环境变量 Dapr 设置为值 X。最好给读者一个明确的命令来做这个，而不是让他们自己去想办法。
- **使用现在时** - 避免使用 "这个命令将安装 redis"这样的句子，因为这意味着操作是在未来发生。 请改为使用 " 此命令安装 redis" (现在时态) 。

## Diagrams and images
It is strongly encouraged to create diagrams and images where ever possible for documentation pages. All diagrams are kept in a Dapr Diagrams Deck, which has guidance on style and icons. The diagram images are saved as PNG files into the [images folder](/images). Diagrams should be;
- Saved as PNG files with a high resolution
- Named using the convention of a concept or building block so that they are grouped. For example `service-invocation-overview.png`. Also see Images guidance section below.
- Added to the correct section in the `Dapr-Diagrams.pptx` deck so that they can be amended and updated.

{{< button text="Download the Dapr Diagrams Deck" link="/presentations/Dapr-Diagrams.pptx.zip" >}}


## 贡献新页面
- 确保你所写的文件在层次结构中的位置是正确的。
- 在可能的情况下，避免创建新的部分，很有可能在文档的层次结构中已经有一个合适的位置。
- 确保包括完整的 [Hugo front-matter](#front-matter)。

### 贡献一个新的概念文档
- 请确保读者能够理解为什么他们应该关注此功能。 它能帮他们解决什么问题?
- 请确保文档引用该规范以获取使用 API 的示例。
- 确保规范在名称，参数和术语方面与概念一致。 根据需要更新概念和规范。
- 请避免重复该规范。 这个想法是为了给读者提供更多关于能力的信息和背景，以便他们可以尝试这个。 因此，尽可能提供更多的信息和实施细节。
- 提供指向[参考资料]({{<ref reference >}})中规范的链接。
- 在可能的情况下，参考一个实用的How-To文档。

### 贡献新的 How-To 指南
- `如何操作` 文章旨在为希望启用某项功能、整合某项技术或在特定场景下使用 Dapr 的读者提供逐步的实用指导。
- 子目录命名 - 目录名称应该是描述性的，如果引用特定组件或概念，那么应以相关名称开头。 示例： *pubsub-namespaces*。
- 请勿假定读者使用特定环境，除非文章本身是特定的环境。 这包括操作系统 ( Windows/Linux/MacOS )，部署目标 ( Kubernetes， IoT 等 ) 或编程语言。 如果不同操作系统的说明不同，请为所有系统提供指导。
- 包括易于复制和粘贴的 代码/示例/配置 片段。
- 在文章末尾，为读者提供相关链接和后续步骤 ( 这可以是其他相关的 "如何操作 " ，参考样本或相关概念 ) 。

## docs.dapr.io 的要求
任何贡献都必须确保 Web 站点构建成功。 Hugo 构建 Web 站点的方式需要遵循以下指导。

### 文件和文件夹名称
文件和文件夹名称应该是全局唯一的。
    - `\service-invocation`
    - `service-invocation-overview.md`

### Front-matter
[Front-matter](https://www.docsy.dev/docs/adding-content/content/#page-frontmatter) 是将常规 markdown 文档升级到 Hugo 兼容文档，用以呈现到导航栏和 ToC 目录中的功能组件。

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

#### 示例
```yaml
---
type: docs
title: "Service invocation overview"
linkTitle: "Overview"
weight: 10
description: "A quick overview of Dapr service invocation and how to use it to invoke services within your application"
---
```

> 权重确定左侧栏中页面的顺序，其中 0 是最顶部。

Front-matter 应填写所有字段，包括类型、标题、链接标题、权重和描述。
- `title` 应该仅有一句话，最后没有句号
- `linkTitle` 应该是 1到 3 个字，前面的How-to除外。
- `描述` 应该是 1-2 个句子，描述读者将在此文档中学习，完成或执行什么。

根据 [styling conventions](#styling-conventions)，标题只能大写第一个字和专有名词，但 "How-To："除外。
    - "Getting started with Dapr service invocation"
    - "How-To: Setup a local Redis instance"

### 引用其他页面
Hugo `ref` 和 `relref` [shortcodes](https://gohugo.io/content-management/cross-references/) 用于引用其他页面和部分。 如果某一页面被错误重命名或删除，它会中断构建。

这个 shortcodes 在 Markdown 页面中写入，将链接到该节/文件夹名称的 _index.md 页面
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

通常，节短名称是节标题的文本，全部为小写，空格更改为"-"。 您可以通过访问 Web 站点页面，单击该部分旁边的链接图标 (🔗) 来检查区段短名称，并查看在导航栏中呈现 URL 的方式。 "#" 后面的内容是您的段节短名称。

例如，对于此特定段节，完整引用页面和部分将是:

```md
{{</* ref "contributing-docs.md#referencing-sections-in-other-pages" */>}}
```

## Shortcodes

以下是编写 Dapr 文档的有用 shortcodes

### Images
Docsy 和 Hugo 使用的 markdown 规范没有提供使用 markdown 语法来调整图片大小。 而是使用原始 HTML 。

首先将图片放置在 `/daprdocs/static/images` 下，命名惯例为 `[page-name]-[image-name].[png|jpg|svg]`.

然后使用以下项链接到图片:
```md
<img src="/images/[image-filename]" width=1000 alt="Description of image">
```
> 请不要忘记设置 alt 属性，以保留视觉受损用户的文档可读。

#### 示例

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
{{% /codetab %}}

{{% codetab %}}
[Content for Tab2]
{{% /codetab %}}

{{< /tabs */>}}
```

您所编写的所有内容都将被渲染为Markdown，因此您可以包含图像、代码块、YouTube视频等。

#### 示例
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
这个示例将为此呈现：
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

### 嵌入代码片段

使用 `code-snippet` 快捷码从 `静态/代码` 目录中的引用代码片段。

```
{{</* code-snippet file="myfile.py" lang="python" */>}}
```

{{% alert title="Warning" color="warning" %}}
所有Dapr示例代码都应该在单独的文件中自成一体，而不是在Markdown中。 使用这里描述的技术来突出示例代码的部分用户应该关注的问题。
{{% /alert %}}

使用 `lang` (默认 `txt`) 参数来配置用于语法高亮的语言。

使用 `marker` 参数限制嵌入式到部分示例文件中。 当您只想显示较大文件的一部分时，这是非常有用的。 典型的方法是用注释包围感兴趣的代码，然后将注释文本传递给`marker`。

下面的短代码和代码示例:

```
{{</* code-snippet file="./contributing-1.py" lang="python" marker="#SAMPLE" */>}}
```

```python
import json
import time

from dapr.clients import DaprClient

#SAMPLE
with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
#SAMPLE
```

将产生以下产出：

{{< code-snippet file="contributing-1.py" lang="python" marker="#SAMPLE" >}}

Use the `replace-key-[token]` and `replace-value-[token]` parameters to limit the embedded snipped to a portion of the sample file. This is useful when you want abbreviate a portion of the code sample. Multiple replacements are supported with multiple values of `token`.

下面的短代码和代码示例:

```
{{</* code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  */>}}
```

```python
#IMPORTS
import json
import time
#IMPORTS

from dapr.clients import DaprClient

with DaprClient() as d:
    req_data = {
        'id': 1,
        'message': 'hello world'
    }

    while True:
        # Create a typed message with content type and body
        resp = d.invoke_method(
            'invoke-receiver',
            'my-method',
            data=json.dumps(req_data),
        )

        # Print the response
        print(resp.content_type, flush=True)
        print(resp.text(), flush=True)

        time.sleep(2)
```

将产生以下产出：

{{< code-snippet file="./contributing-2.py" lang="python" replace-key-imports="#IMPORTS" replace-value-imports="# Import statements"  >}}

### YouTube videos
Hugo can automatically embed YouTube videos using a shortcode:
```
{{</* youtube [VIDEO ID] */>}}
```

#### 示例

给定视频：https://youtu.be/dQw4w9WgXcQ

短代码为：
```
{{</* youtube dQw4w9WgXcQ */>}}
```

### 按钮

若要在网页上创建按钮，请使用 `button` 短码。

可选的"Newtab"参数将指示页面是否应在新的选项卡中打开。 选项为“true”或“false”。 默认情况为“false”，在同一个标签页中打开页面。

#### 链接到外部文件

```
{{</* button text="My Button" link="https://example.com" */>}}
```

{{< button text="My Button" link="https://example.com" >}}

#### 链接到另一个文档

您还可以在按钮中引用页面：
```
{{</* button text="My Button" page="contributing" newtab="true" */>}}
```

{{< button text="My Button" page="contributing" newtab="true" >}}

#### 按钮颜色

您可以使用 Bootstrap 颜色自定义颜色：
```
{{</* button text="My Button" link="https://example.com" color="primary" */>}}
{{</* button text="My Button" link="https://example.com" color="secondary" */>}}
{{</* button text="My Button" link="https://example.com" color="success" */>}}
{{</* button text="My Button" link="https://example.com" color="danger" */>}}
{{</* button text="My Button" link="https://example.com" color="warning" */>}}
{{</* button text="My Button" link="https://example.com" color="info" */>}}
```

{{< button text="My Button" link="https://example.com" color="primary" >}}
{{< button text="My Button" link="https://example.com" color="secondary" >}}
{{< button text="My Button" link="https://example.com" color="success" >}}
{{< button text="My Button" link="https://example.com" color="danger" >}}
{{< button text="My Button" link="https://example.com" color="warning" >}}
{{< button text="My Button" link="https://example.com" color="info" >}}

### 参考资料
- [Docsy 编写指南](https://www.docsy.dev/docs/adding-content/)

## 翻译

添加语言的步骤：

您可以在 [PR 1286](https://github.com/dapr/docs/pull/1286) 中找到一个添加中文语言支持的PR 示例。

添加语言的步骤：
- 在 Docs Repo 中打开一个issue，请求创建一个新的特定语言文档
- 创建完成后，在文档仓库中创建 git 子模块：
   ```sh
   git submodule add <remote_url> translations/<language_code>
   ```
- 在 `daprdocs/config.toml` 中添加语言条目：
   ```toml
    [languages.<language_code>]
      title = "Dapr Docs"
      weight = 3
      contentDir = "content/<language_code>"
      languageName = "<language_name>"
   ```
- 在 `daprdocs/config.toml` 中创建一个挂载：
   ```toml
   [[module.mounts]]
     source = "../translations/docs-<language_code>/content/<language_code>"
     target = "content"
     lang = "<language_code>"
   ```
- 所有其他翻译目录视需要重复上述步骤