# RUC Thesis Download 人大论文平台下载工具

## 用途

本工具可以：

1. 下载人民大学学位论文库中可查看的论文。
2. 调整论文清晰度。

本工具不能：

1. 下载未公开的论文。
2. 为**无访问权限**的用户提供权限。
3. 将论文转化为可选中/编辑的格式。

**本脚本仅作为学术工具使用，下载的文件如果泄露，可能会被追究法律责任，本人不承担使用此脚本的一切后果。**

## 用法

1. 安装[tampermonkey](https://www.tampermonkey.net/index.php?ext=dhdg)，无法科学上网可以参考[这里](https://zhuanlan.zhihu.com/p/128453110)。
2. 安装[此脚本](https://greasyfork.org/zh-CN/scripts/459341-ruc-thesis-download)。
3. 打开某篇论文在线阅读，在左侧列表可以调整清晰度、下载文件，根据需要点击即可。

## 原理

脚本会首先请求所有 pdf 图片链接，随后异步请求图片，最后调用 jsPDF 渲染 pdf 文件并导出。

## 我想获得可编辑的文本，怎么办？

人民大学论文平台接口只提供图片下载，因此只能间接获得可编辑的文本。可以使用 OCR 工具识别文本。

如果为了获得整篇文章文本，可以考虑使用 Adobe Acrobat、福昕等进行扫描。

如果只需要获得某一段落或部分文本，考虑使用如 [白描](https://baimiao.uzero.cn/)、[Bob](https://github.com/ripperhe/Bob) 等 OCR 工具进行小段落内容识别。
