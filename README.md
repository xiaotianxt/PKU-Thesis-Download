# 北大论文平台下载工具

## 用途

本工具可以：

1. 下载[北京大学学位论文库](https://thesis.lib.pku.edu.cn/)中可查看的论文。
2. 根据需要调整下载论文的清晰度。

本工具不能：

1. 下载未公开的论文。
2. 为**无访问权限**的用户提供权限。
3. 将论文转化为可选中/编辑的格式。

**本脚本仅作为学术工具使用，下载的文件如果泄露，可能会被追究法律责任，本人不承担使用此脚本的一切后果。**

## 用法

1. 安装[tampermonkey](https://www.tampermonkey.net/index.php?ext=dhdg)，无法科学上网可以参考[这里](https://zhuanlan.zhihu.com/p/128453110)。
2. 安装[此脚本](https://greasyfork.org/zh-CN/scripts/442310-pku-thesis-download)。
3. 打开某篇论文在线阅读，在左侧列表中调整清晰度，直接点击下载按钮即可。

## 原理

脚本会首先请求所有pdf图片链接，随后异步请求图片，最后调用 jsPDF 渲染 pdf 文件并导出。

## 我想获得可编辑的文本，怎么办？

如果为了获得整篇文章文本，可以考虑使用 OCR 工具。如学校免费提供的 Adobe Acrobat 等进行扫描。

如果为了获得某一段落或部分文本，考虑使用如[白描](https://baimiao.uzero.cn/)、[Bob](https://github.com/ripperhe/Bob)等工具进行小段落内容识别。