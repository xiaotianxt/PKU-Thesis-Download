// ==UserScript==
// @name         PKU-Thesis-Download 北大论文平台下载工具
// @namespace    https://greasyfork.org/zh-CN/scripts/442310-pku-thesis-download
// @supportURL   https://github.com/xiaotianxt/PKU-Thesis-Download
// @homepageURL  https://github.com/xiaotianxt/PKU-Thesis-Download
// @version      1.3.1
// @description  北大论文平台下载工具，请勿传播下载的文件，否则后果自负。
// @author       xiaotianxt
// @match        http://162.105.134.201/pdfindex*
// @match        https://drm.lib.pku.edu.cn/pdfindex*
// @match        https://drm-lib-pku-edu-cn-443.webvpn.bjmu.edu.cn/pdfindex*
// @match        https://wpn.pku.edu.cn/https/*/pdfindex*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pku.edu.cn
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.min.js
// @license      GNU GPLv3
// @grant        GM_addStyle
// @history      1.2.2 修复了横屏图片的加载样式和pdf渲染样式
// @history      1.2.3 支持北医 Web VPN 系统
// @history      1.2.4 适配限流问题
// @history      1.2.5 适当降低请求频率，避免触发过多限流
// @history      1.2.6 支持北大 Web VPN 系统
// @history      1.3.0 优化图片加载失败重试机制
// @history      1.3.1 恢复重试时的loading动画
// @downloadURL https://update.greasyfork.org/scripts/442310/PKU-Thesis-Download%20%E5%8C%97%E5%A4%A7%E8%AE%BA%E6%96%87%E5%B9%B3%E5%8F%B0%E4%B8%8B%E8%BD%BD%E5%B7%A5%E5%85%B7.user.js
// @updateURL https://update.greasyfork.org/scripts/442310/PKU-Thesis-Download%20%E5%8C%97%E5%A4%A7%E8%AE%BA%E6%96%87%E5%B9%B3%E5%8F%B0%E4%B8%8B%E8%BD%BD%E5%B7%A5%E5%85%B7.meta.js
// ==/UserScript==

(function () {
  "use strict";

  class ParallelRateLimiter {
    constructor(maxParallel) {
      this.queue = [];
      this.running = 0;
      this.maxParallel = maxParallel;
    }

    add(fn) {
      return new Promise((resolve, reject) => {
        const wrappedFn = async () => {
          this.running++;
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            this.running--;
            this.runNext();
          }
        };

        if (this.running < this.maxParallel) {
          wrappedFn();
        } else {
          this.queue.push(wrappedFn);
        }
      });
    }

    runNext() {
      if (this.queue.length > 0 && this.running < this.maxParallel) {
        const nextFn = this.queue.shift();
        if (nextFn) {
          nextFn();
        }
      }
    }
  }

  async function retry(fn, retries = 3, initialDelay = 1000) {
    let attempt = 0;
    while (true) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          console.error(`Failed after ${retries} attempts`);
          throw error;
        }

        // 计算指数退避延迟时间: initialDelay * 2^attempt + 随机抖动
        const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  const limiter = new ParallelRateLimiter(3);
  const print = (...args) => console.log("[PKU-Thesis-Download]", ...args);
  const OPTIMIZATION = "pku_thesis_download.optimization";
  const fid = $("#fid").val();
  const totalPage = parseInt($("#totalPages").html().replace(/ \/ /, ""));
  const baseUrl = `/jumpServlet?fid=${fid}`;
  const msgBox = initUI();
  const isWPN = location.href.includes('wpn.pku.edu.cn')


  if (localStorage.getItem(OPTIMIZATION) === "true" || !localStorage.getItem(OPTIMIZATION)) {
    optimizeImgLoading();
  }

  function initUI() {
    // 下载按钮
    const downloadButton = document.querySelector("#thumbtab").cloneNode(true);
    downloadButton.innerHTML = `
    <div class="panel-bg" style="background: url(&quot;data:image/png;base64,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&quot;) center center no-repeat;"></div>
    <span class="panel-name">下载</span>
    `;
    document.querySelector("#btnList").appendChild(downloadButton);
    downloadButton.addEventListener("click", download);

    // 论文加载优化
    const optimizeImg = document.querySelector("#thumbtab").cloneNode(true);
    optimizeImg.innerHTML = `
    <input type="checkbox" id="optimizeImg" name="optimizeImg" value="true"><label for="optimizeImg">优化加载</label>
    `;
    optimizeImg.querySelector("input").checked = localStorage.getItem(OPTIMIZATION) === "true" || localStorage.getItem(OPTIMIZATION) === null;
    optimizeImg.addEventListener("click", (e) => {
      const checked = e.target.checked;
      localStorage.setItem(OPTIMIZATION, checked);
      if (checked) {
        optimizeImgLoading();
      }
    });

    document.querySelector("#btnList").appendChild(optimizeImg);

    GM_addStyle(`
      .loadingBg {
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `);

    const observer = new MutationObserver((mutationsList) => {
      for (let mutation of mutationsList) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'IMG' && node.parentElement.classList.contains('loadingBg')) {
              node.addEventListener('load', function () {
                const img = node;
                if (img.naturalWidth > img.naturalHeight) {
                  // 横向图片
                  img.style.height = 'min(100%, 90vw / 1.414)';
                  img.style.width = 'auto';
                }
              });
            }
          });
        }
      }
    });

    observer.observe(document.querySelector(".jspPane-scroll"), { childList: true, subtree: true });

    // msgBox
    const msgBox = downloadButton.querySelector("span");
    return msgBox;
  }

  function processWPN(url) {
    const baseWPN = location.href.split('pdfindex')[0];
    return `${baseWPN}pdfboxServlet` + url.split('pdfboxServlet')[1] + '&vpn=1'
  }


  async function download(e) {
    e.preventDefault();
    e.target.disabled = true;
    await solveSrc().then(solveImg).then(solvePDF);
    e.target.disabled = false;
  }

  /**
   * 解析pdf图片链接
   */
  async function solveSrc() {
    async function downloadSrcInfo(url) {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
      finished += 2;
      msgBox.innerHTML = `${finished}/${totalPage}`;
      return json.list;
    }

    let finished = 0;

    const tasks = [];
    for (let page = 0; page < totalPage; page += 2) {
      const url = `${baseUrl}&page=${page}`;
      tasks.push(() => retry(async () => downloadSrcInfo(url)));
    }

    const results = await Promise.all(tasks.map(task => limiter.add(task)));
    return results.flat(); // 假设我们想要一个扁平化的结果数组
  }

  /**
   * 下载图片
   */
  async function solveImg(urls) {
    let numFinished = 0;
    async function downloadPdf(url) {
      if (isWPN) {
        url = processWPN(url)
      }
      return fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          return new Promise((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = reader.result;
              const img = new Image();
              img.src = base64;

              img.onload = () => {
                const orientation = img.width > img.height ? "landscape" : "portrait";
                resolve({ base64, orientation });
                numFinished++;
                msgBox.innerHTML = numFinished + "/" + numTotal;
              };

              img.onerror = () => {
                console.error("Failed to load image", url);
                reject(null);
              }
            };
          });
        });
    }

    // remove duplicated
    const map = new Map(urls.flat().map((item) => [item.id, item.src]));

    // assert that all pages are loaded
    if (map.size !== totalPage) {
      const missing = Array.from({ length: totalPage }, (_, i) => i + 1).filter((i) => !map.has(`${i}`));
      alert(`部分页面没有加载出来，请联系开发者。\n缺少：${missing.join(",")}`);
    }

    // sort and clear index
    const sortedUrls = [...map.entries()]
      .sort((a, b) => a[0] - b[0])
      .map((item) => item[1]);

    // download images
    const tasks = [];
    const numTotal = sortedUrls.length;

    sortedUrls.forEach((url) => {
      tasks.push(async () => await retry(async () => await downloadPdf(url)));
    });

    return Promise.all(tasks.map(task => limiter.add(task)));
  }

  /**
   * PDF生成与保存
   * @param {Array} base64s - 包含图片base64数据和方向信息的数组
   */
  async function solvePDF(base64s) {
    msgBox.innerHTML = "拼接中";
    const doc = new jspdf.jsPDF({ format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < base64s.length; i++) {
      const { base64, orientation } = base64s[i];
      const isLandscape = orientation === "landscape";

      // 根据方向设置不同的尺寸
      if (isLandscape) {
        doc.addImage(base64, "JPEG", 0, 0, 297, 210);
      } else {
        doc.addImage(base64, "JPEG", 0, 0, 210, 297);
      }

      // 如果不是最后一页，添加新页面
      if (i + 1 < base64s.length) {
        doc.addPage("a4", base64s[i + 1].orientation);
      }
    }

    msgBox.innerHTML = "保存中";
    doc.save(document.title + ".pdf");
    msgBox.innerHTML = "完成！";
  }

  /**
   * 优化图片加载策略
   * 实现懒加载、预加载和加载失败自动重试机制
   */
  async function optimizeImgLoading() {
    /**
     * 为指定页面加载图片
     * @param {Element} element - 页面元素
     * @param {IntersectionObserver} observer - 观察器实例
     */
    function loadImgForPage(element, observer) {
      const pages = document.getElementsByClassName('fwr_page_box');
      const index = Array.from(pages).indexOf(element) + 1;
      observer.unobserve(element);

      // 每三页触发一次预加载
      if (index % 3 !== 1) return;

      print(`load page ${index + 3} - ${index + 5}.`);
      omg(index + 3); // 提前加载3页
    }

    /**
     * 设置图片加载监控和自动重试机制
     */
    function setupImgLoadMonitor() {
      const imgObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type !== 'childList') return;

          mutation.addedNodes.forEach(node => {
            // 筛选需要监控的图片元素
            const isTargetImage =
              node.nodeName === 'IMG' &&
              node.classList.contains('fwr_page_bg_image') &&
              node.parentElement?.classList.contains('loadingBg');

            if (!isTargetImage) return;

            // 保存原始src用于重试
            const originalSrc = node.src;
            node.setAttribute('data-original-src', originalSrc);

            // 延迟检查图片加载状态
            setTimeout(() => checkAndRetryIfNeeded(node), 1000);
          });
        });
      });

      /**
       * 检查图片加载状态并在需要时重试
       * @param {HTMLImageElement} img - 图片元素
       * @param {number} retryCount - 当前重试次数
       */
      const checkAndRetryIfNeeded = (img, retryCount = 0) => {
        const maxRetries = 10;

        // 图片已成功加载
        if (img.complete && img.naturalWidth > 0) {
          return;
        }

        // 达到最大重试次数
        if (retryCount >= maxRetries) {
          console.error(`[PKU-Thesis-Download] Failed to load image after ${maxRetries} attempts: ${img.id}`);
          return;
        }

        // 使用指数退避算法计算下次重试延迟
        const baseDelay = 1000 * Math.pow(2, retryCount);
        const jitter = Math.random() * 1000;
        const delay = baseDelay + jitter;

        console.warn(
          `[PKU-Thesis-Download] Image not loaded properly, retry ${retryCount + 1} of ${maxRetries} ` +
          `in ${Math.round(delay)}ms: ${img.id}`
        );

        // 延迟后重试加载
        setTimeout(() => {
          // 清除错误状态
          img.style.display = '';
          
          // 重新显示loading动画（在父元素loadingBg上）
          const loadingBgParent = img.closest('.loadingBg');
          if (loadingBgParent) {
            // 确保loadingBg显示
            loadingBgParent.style.display = 'block';
          }
          
          // 将图片设置为透明，这样可以看到背景的loading动画
          img.style.opacity = '0';
          
          // 当图片加载成功时恢复透明度
          img.onload = function() {
            img.style.opacity = '1';
          };

          // 添加时间戳参数避免缓存
          const timestamp = new Date().getTime();
          const originalSrc = img.getAttribute('data-original-src');
          const separator = originalSrc.includes('?') ? '&' : '?';
          const newSrc = `${originalSrc}${separator}_retry=${timestamp}`;

          // 重新设置src触发加载
          img.src = newSrc;

          // 安排下一次检查
          setTimeout(() => checkAndRetryIfNeeded(img, retryCount + 1), 1000);
        }, delay);
      };

      // 观察整个文档的DOM变化
      imgObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    // 创建交叉观察器用于懒加载
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            loadImgForPage(entry.target, observer);
          }
        });
      },
      {
        root: document.querySelector('#jspPane'),
        rootMargin: '0px',
        threshold: 0
      }
    );

    // 选择性地观察页面容器
    const pages = document.querySelectorAll('.fwr_page_box:nth-child(3n+1)');
    pages.forEach(page => observer.observe(page));

    // 启动图片加载监控
    setupImgLoadMonitor();
  }
})();
