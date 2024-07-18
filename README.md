## chrome-extension-dataworks-enhance

**增强阿里云 DataWorks 页面搜索功能的 Chrome 扩展程序**

**项目地址：** [https://github.com/argszero/chrome-extension-dataworks-enhance](https://github.com/argszero/chrome-extension-dataworks-enhance)

**问题描述：**

阿里云 DataWorks 目前仅支持根据文件名进行搜索，无法根据文件内容进行搜索。这导致用户在查找特定数据来源、使用节点、或包含特定内容的文件时，难以进行快速定位。

**解决方案：**

`chrome-extension-dataworks-enhance` 是一款 Chrome 扩展程序，它通过增强 DataWorks 页面搜索功能，解决以上问题。该扩展程序能够：

将所有节点以文件的形式同步到本地用户指定的目录，并且保持和线上相同的目录结构和文件名。
你可以:
* **使用VSCode本地搜索：** 用户可以输入关键字搜索所有文件的内容，包括表名、文件代码、注释、配置等。很容易根据表名找到有哪些节点使用了这个表。
* **使用git完成流程备份和版本管理：** 用户可以输入关键字搜索所有节点的内容，包括文件代码、注释、配置等。

**功能特点：**

* **实时同步：** 扩展程序每格1个小时自动将数据同步到本地指定的目录。
* **增量同步：** 扩展程序在每次同步时，会自动检查哪些节点发生过变更，将这些节点同步到本地指定的目录。避免无用的同步。
* **开源免费：** 该扩展程序完全开源免费，用户可以自由使用、修改和分享。

**安装使用：**

**1. 手动安装:**

* **下载项目代码：**  从项目的 GitHub 页面 [https://github.com/argszero/chrome-extension-dataworks-enhance/releases](https://github.com/argszero/chrome-extension-dataworks-enhance/releases)  下载安装包(chrome-extension-dataworks-enhance.zip
)并解压缩。
* **打开扩展程序页面：** 在 Chrome 浏览器中打开 `chrome://extensions` 页面。
* **启用开发者模式：**  启用页面右上角的“开发者模式”。
* **加载解压缩的扩展程序：** 点击“加载解压缩的扩展程序”，选择解压缩的项目文件夹。
* **完成安装：** 该扩展程序将被加载到 Chrome 浏览器中。打开dataworks页面https://ide2-cn-beijing.data.aliyun.com/?defaultProjectId=xxx,在页面左上角会新增一个sync按钮，点击按钮设置本地同步目录。

**2.  Chrome 网上应用店安装 (待上线):**

*  待扩展程序通过审核后，您可以在 Chrome 网上应用店搜索并安装。

**贡献：**

我们欢迎任何形式的贡献，包括：

* 提交 bug 报告
* 提出改进建议
* 编写代码
* 翻译文档

**联系方式：**

您可以通过以下方式联系我们：

* 提交 Issue

**License:**

该项目采用 Apache 2.0 许可证。

**致谢：**

感谢所有为该项目做出贡献的人员。


