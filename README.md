<h1 align="center">
北京大学学位论文数据库下载工具
</h1>

<div align="center">
  <a href="https://github.com/xiaotianxt/PKU-Thesis-Download" style="text-decoration: none;">
    <img alt="Static Badge" src="https://img.shields.io/github/stars/xiaotianxt/PKU-Thesis-Download">
  </a>
  <a href="https://github.com/xiaotianxt/PKU-Thesis-Download" style="text-decoration: none;">
    <img src="https://img.shields.io/greasyfork/v/442310" alt="version">
  </a>
  <a href="https://github.com/xiaotianxt/PKU-Thesis-Download" style="text-decoration: none;">
    <img src="https://img.shields.io/greasyfork/dt/442310" alt="total installs">
  </a>
  <a href="https://github.com/xiaotianxt/PKU-Thesis-Download" style="text-decoration: none;">
    <img src="https://img.shields.io/greasyfork/l/442310" alt="license">
  </a>
</div>

<h3 align="center">重要法律风险提示</h3>

本脚本旨在便利学术研究，但其使用可能涉及法律风险。请仔细阅读以下内容:

1. 使用目的：本脚本仅限于个人学习、研究或欣赏，以及教学、科学研究等非商业用途。严禁用于任何商业目的。

2. 著作权风险：使用本脚本下载论文可能被视为规避技术保护措施，违反[《中华人民共和国著作权法》](https://www.gov.cn/guoqing/2021-10/29/content_5647633.htm)第四十九条的规定。

3. 未经授权：本脚本未获得北京大学或论文作者的明确授权。使用者应自行承担可能的法律后果。

4. 潜在侵权：大规模或系统性地下载论文将会构成侵犯著作权的行为，违反[《中华人民共和国著作权法》](https://www.gov.cn/guoqing/2021-10/29/content_5647633.htm)第五十二条。

5. 责任声明：脚本作者不对使用者因使用本脚本而可能面临的任何法律风险或后果承担责任。

6. 建议措施：使用者应当:
   
   - 仅在必要时谨慎使用本脚本

   - 尊重著作权，不传播下载的论文

   - 考虑联系北京大学或论文作者获得使用许可

使用本脚本即表示您已完全理解并接受上述风险。如有疑虑，请勿使用本脚本。

为促进学术交流与知识传播，呼吁相关机构考虑为合法学术用途提供更便利的论文获取方式。

## 用途

本工具可以：

1. 下载[北京大学学位论文数据库](https://thesis.lib.pku.edu.cn/)中可查看的论文。
2. 优化论文阅读体验，即通过预先加载剩余页面，降低等待缓冲时间。

本工具不能：

1. 下载还未公开的论文（即没有“查看全文”按钮的论文）。
2. 为无北京大学学位论文数据库权限的用户提供权限。
3. 选中、复制、修改论文内容。

## 用法

1. 安装[tampermonkey](https://www.tampermonkey.net/index.php?ext=dhdg)，无法科学上网可以参考[这里](https://zhuanlan.zhihu.com/p/128453110)。
2. 安装[此脚本](https://greasyfork.org/zh-CN/scripts/442310-pku-thesis-download)。
3. 打开某篇论文在线阅读，在左侧列表点击下载文件按钮。

## 原理

脚本会批量请求论文图片，合并渲染 pdf 文件并导出。

## 我想获得可编辑的文本，怎么办？

北京大学学位论文数据库接口只提供图片下载，因此只能间接获得可编辑的文本。可以使用 OCR 工具识别文本。

如果为了获得整篇文章文本，可以考虑使用学校免费提供的 Adobe Acrobat（[北京大学软件平台](https://software.w.pku.edu.cn/) > 使用帮助 > ADOBE ID）, 福昕（[北京大学软件平台](https://software.w.pku.edu.cn/) > 福昕 PDF 编辑软件） 等进行扫描。
亦可采用如 GPT-4o, [Marker](https://github.com/VikParuchuri/marker) 等方式提取文本。

如果只需要获得某一段落或部分文本，可以使用如 [白描](https://baimiao.uzero.cn/)、[Bob](https://github.com/ripperhe/Bob) 等 OCR 工具进行小段落内容识别。
