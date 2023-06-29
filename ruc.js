// ==UserScript==
// @name         RUC-Thesis-Download
// @namespace    https://greasyfork.org/zh-CN/scripts/459341-ruc-thesis-download
// @supportURL   https://github.com/xiaotianxt/PKU-Thesis-Download
// @homepageURL  https://github.com/xiaotianxt/PKU-Thesis-Download
// @version      0.2
// @description  人大论文平台下载工具，请勿传播下载的文件，否则后果自负。
// @author       xiaotianxt
// @match        http://*.ruc.edu.cn/foxit-htmlreader-web/Reader.do*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=ruc.edu.cn
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// @license      GNU GPLv3
// @grant        unsafeWindow
// ==/UserScript==

const RESOLUTION = "ruc_thesis_download.resolution";
const DEFAULT_RESOLUTION = '100';

(async function () {
  "use strict";

  const message = (msg) => {
    const msgBox = document.getElementById("msgBox");
    msgBox.textContent = msg;
  }

  const MAX_TOLERANCE = 3;

  const initUI = async () => waitForElm("#bmtab").then(element => {
    // 下载按钮
    const downloadButton = element.cloneNode(true);
    downloadButton.innerHTML = `
      <img style="width:49;height:49" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAxCAYAAABznEEcAAAACXBIWXMAAOxgAADsYAHjlJf+AAAGkmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4wLWMwMDAgNzkuMTcxYzI3ZmFiLCAyMDIyLzA4LzE2LTIyOjM1OjQxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjQuMSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDItMDJUMTg6NTc6MjYrMDg6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTAyLTAyVDE5OjAxOjM3KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTAyLTAyVDE5OjAxOjM3KzA4OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiZmNlZDhlOC1jMTkxLTRhMTQtOTAyOS0xYjgzYzRlNTFhY2YiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MzUyNDljMWQtNjg5ZC00YWJiLTgzYjUtN2M5OGU0OWI0MzliIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MzUyNDljMWQtNjg5ZC00YWJiLTgzYjUtN2M5OGU0OWI0MzliIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozNTI0OWMxZC02ODlkLTRhYmItODNiNS03Yzk4ZTQ5YjQzOWIiIHN0RXZ0OndoZW49IjIwMjMtMDItMDJUMTg6NTc6MjYrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4xIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMjFhMGRhNS1iNmY5LTRjNzEtOGE4Ni01YjA4NDYyMjIwZTEiIHN0RXZ0OndoZW49IjIwMjMtMDItMDJUMTg6NTg6MTYrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4xIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZmNlZDhlOC1jMTkxLTRhMTQtOTAyOS0xYjgzYzRlNTFhY2YiIHN0RXZ0OndoZW49IjIwMjMtMDItMDJUMTk6MDE6MzcrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4xIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pm8EcWkAAAG0SURBVGiB7Ze9Sh1BGEDPXU0kQVMIqcQ8gJ1FIGAvWCcPEMgTpPSNfAMTYpVGkk4IpEilCDZyE5QEf+I9FrNBc+P1emdnyAhzYGGH3fm+Pbs7M9/0VO47zf9+gBRUiVKoEqVQJUqhSpRClSiFKjGGd4DXjh1gLkeinBKnQ+2TXPlySlzc0M5S99cxUQpVYgznN7SPciSaThirARYJ0+gxMDt0/QmwAjwADoGv/Dv441BTHY36Rt1TP6s//JtTdVf9qb5Vp1LlTimBuqC+93a22vuS5U0tgfpM3R4h8EVdSp0zhwTqc/XbkEBffZkjXy4J1Ffq91ZgoK7nypVTAsMA/qVuqNO58vQ0qpxZa6fKBvgEHNxy72tgC9gfcf0p8ALoEdaSzYmfJtK+b5gyz+3+n6+qJ228fkyM2MXuMfCwPe+66jfAzJ93Ghsghut7ha6r7mBE3DuTonbqKtG59EhROz0C5gkDc1Ik/JpG9geInp2OuNov7xAKuqmIOBeEF7Dcto8JheJExEqcEabY1PyOiRs7Jj5E9hvHx5hOsV+iKOr2tBSqRClUiVKoEqVQJUqhSpTCJUa/YvjPuS6aAAAAAElFTkSuQmCC" >
      <div id="msgBox">下载</div>
      `;
    downloadButton.style.height = '70px';
    downloadButton.style.color = 'white';
    document.querySelector("#btnList").appendChild(downloadButton);
    downloadButton.addEventListener("click", downloadPDF);

    // 清晰度
    const resolution = localStorage.getItem(RESOLUTION) || DEFAULT_RESOLUTION;
    const resolutionRadioGroup = downloadButton.cloneNode(true);
    resolutionRadioGroup.innerHTML = `
      <input type="radio" name="resolution" id="standard" value="100"> <label for="standard">标清</label>
      <input type="radio" name="resolution" id="high" value="150"> <label for="high">超清</label>
      <input type="radio" name="resolution" id="super" value="200"> <label for="super">巨清</label>
      `;
    document.querySelector("#btnList").appendChild(resolutionRadioGroup);
    resolutionRadioGroup.querySelectorAll("input").forEach(elem => elem.addEventListener("click", (e) => {
      localStorage.setItem(RESOLUTION, e.target.value);
      rewriteFetch();
    }))
    resolutionRadioGroup.querySelector("[value='" + resolution + "']").checked = true
  })

  const rewriteFetch = async () => {
    const originOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (_, url) {
      if (url.includes("GetPageImg.do?")) {
        const epage = atob(url.split("epage=")[1]);
        const remain = epage.split('&zoom=')[0];
        const resolution = localStorage.getItem(RESOLUTION) || DEFAULT_RESOLUTION;
        const newEpage = remain + "&zoom=" + resolution;
        const newUrl = 'GetPageImg.do?epage=' + btoa(newEpage)
        const newArgs = [...arguments];
        newArgs[1] = newUrl;
        console.log('rewrite', { url, newUrl });
        originOpen.apply(this, newArgs);
      } else {
        originOpen.apply(this, arguments);
      }
    };
  }

  const downloadPDF = async () => {
    const totalPage = Number($("#totalPages").text().replace(/ \/ /, ""));
    const resolution = localStorage.getItem(RESOLUTION) || DEFAULT_RESOLUTION;
    const fileID = document.getElementById("fileid")?.value;
    const template = (page) => 'GetPageImg.do?epage=' + btoa(`fileid=${fileID}&page=${page}&zoom=${resolution}`)

    const urls = [];
    for (let page = 0; page < totalPage; page++) {
      urls.push(template(page));
    }

    let cnt = 0;
    message(cnt + "/" + urls.length);
    const base64s = await parallel(urls, async (url, index) => {
      const tryFetch = async (attempt = MAX_TOLERANCE) => {
        if (!attempt) return;
        const base64 = await fetch(url)
          .then((res) => res.blob())
          .then((blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return new Promise((resolve) => {
              reader.onloadend = () => {
                resolve(reader.result);
              };
            });
          });
        if (base64.length < 1000) {
          console.log(`error may occur on ${index}, try ${attempt}`);
          await new Promise((r) => setTimeout(r, 1000));
          return tryFetch(attempt - 1);
        }
        return base64;
      };
      const res = await tryFetch();
      cnt += 1
      message(cnt + "/" + urls.length);
      return res;
    }, 3)

    const doc = jspdf.jsPDF();
    const canvas = document.createElement('canvas');
    canvas.width = 210 * 4;
    canvas.height = 297 * 4;
    const ctx = canvas.getContext('2d');
    const next = (i) => {
      if (i >= base64s.length) {
        doc.save('download.pdf');
        return;
      }
      const base64 = base64s[i];
      const image = new Image();
      image.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        doc.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, 210, 297);
        doc.addPage();
        next(i + 1);
      }
      image.onerror = () => {
        const text = `img error on page ${i + 1}, url: ${urls[i]}}`
        doc.text(text, 10, 10);
        doc.addPage();
        next(i + 1);
      }
      image.src = base64;
    }
    next(0);
  }

  // wait until element exists
  // https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
  const waitForElm = (selector) => {
    return new Promise((resolve) => {
      const element = document.querySelector(selector);
      if (element) {
        return resolve(element);
      }

      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          observer.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  // parallel from https://zhuanlan.zhihu.com/p/360193435
  const parallel = async (jobs, fn, workerCount = 5) => {
    const ret = new Array(jobs.length);

    let cursor = 0
    async function worker(workerId) {
      let currentJob;
      while (cursor < jobs.length) {
        try {
          currentJob = cursor;
          cursor += 1;
          ret[currentJob] = await fn(jobs[currentJob], cursor);
        } catch (e) {
          console.error(`worker: ${workerId} job: ${currentJob}`, e)
        }
      }
    }

    const workers = []
    for (let i = 0; i < workerCount && i < jobs.length; i += 1) {
      workers.push(worker(i))
    }

    await Promise.all(workers);
    return ret;
  }

  initUI();
})();
