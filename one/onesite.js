console.log("页面初始化");

let tableHeads = [];
function getTargetTable(type = "head") {
  const tables = document
    .querySelectorAll('div[mxv^="biz,params"]')[0]
    .getElementsByTagName("table");
  if (type == "tbody") {
    return tables[1] || null;
  }
  return tables[0] || null;
}

// 判断是否还有可以获取的内容
let lastTableContent = "";
async function getPageData(tableList) {
  // 前一版本 asiYysdGuS （常规） asiYysdGuW（选中）
  // 现在版本 asiYyskwuM         asiYyskwuQ
  const nodeSelector = document.querySelector("[mxv=pageSizes]");
  if (!nodeSelector) {
    return;
  }
  // document.querySelectorAll('a[mx-click*="magix-portses"]')
  const pagesNode = nodeSelector.getElementsByTagName("a");
  let maxClassValue = 0;
  let curPageNum = 0;
  Array.from(pagesNode)
    .filter((it) => !isNaN(it.textContent))
    .forEach((it, index) => {
      // 根据css样式长度，找到当前选中的页码
      if (it.classList.length > maxClassValue) {
        maxClassValue = it.classList.length;
        curPageNum = it.textContent;
      }
    });
  console.log("当前选中页码", curPageNum);
  if (curPageNum == 1) {
    await getCurrentTables(tableList);
  }
  return;
  for (let i = curPageNum == 1 ? 1 : 0; i < pagesNode.length; i++) {
    chrome.runtime.sendMessage({
      from: "myseller",
      action: "updateTipContent",
      data: `正在读取第 ${i + 1} 页数据……`,
    });
    pagesNode[i].click();
    await new Promise((resolve) => {
      let timeout = 20;
      let timer = setInterval(() => {
        if (
          timeout == 0 ||
          lastTableContent !==
            JSON.stringify(getTargetTable("tbody")?.innerHTML)
        ) {
          clearInterval(timer);
          timer = null;
          timeout = 20;
          waitForRenderComplete2().then(() => {
            resolve(getCurrentTables(tableList));
          });
        }
        --timeout;
      }, 1000);
    });
  }
}

function waitForRenderComplete2(
  ele = document,
  targetId = 'div[mxv^="cubeAction,params"]'
) {
  return new Promise((resolve) => {
    let timeCount = 9;
    const checkExist = setInterval(() => {
      if (ele.querySelectorAll(targetId)?.[0] || !timeCount) {
        clearInterval(checkExist);
        resolve();
      }
      --timeCount;
    }, 500);
  });
}

const fieldsList = [
  "goodsInfo",
  "url",
  "radar",
  "budget",
  "bidding",
  "proRatio",
  "spending",
  "directAmount",
  "totalAmount",
  "display",
  "clicks",
  "clickRate",
  "totalTransactions",
  "directTransactions",
  "averageClickCost",
  "thousandDisplayCost",
  "clickConversionRate",
  "totalShoppingCarts",
  "collectedNums",
  "collectAndPurchase",
  "totalPreSaleAmount",
  "totaPreSaleTrans",
  "directPreSale",
  "directPreTrans",
  "includePreProRatio",
  "boostingDisplayVolume",
  "boostingDrivingClick",
];

// 获取剪贴板文本内容
async function getClipboardText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log("剪贴板内容:", text);
    return text;
  } catch (err) {
    console.error("无法读取剪贴板:", err);
    return "";
  }
}

function closeDialog(delay = 0) {
  return new Promise((resolve) => {
    const dialog = document.querySelector(
      'span[data-spm-click*="_dialog_close"]'
    );
    dialog && dialog.click();
    setTimeout(() => {
      resolve();
    }, delay);
  });
}

function readItDetail() {
  return new Promise(async (resolve) => {
    const result = [];
    await waitForRenderComplete2(document, ".dialog-modal-body");
    const dialogBody = document.querySelector(".dialog-modal-body");
    dialogBody.getElementsByTagName("a")[2].click();

    await waitForRenderComplete2(dialogBody, '[mxv="detailMode"]');

    await waitForRenderComplete2(
      dialogBody.querySelectorAll('[mxv="detailMode"]')[1],
      '[mxv="detailMode"]'
    );

    dialogBody
      .querySelectorAll('[mxv="detailMode"]')[1]
      .querySelectorAll("[mx-click*=magix-portsu]")[1]
      .click(); // 切换显示模式 到 表格

    await waitForRenderComplete2(dialogBody, 'div[mxv*="listPrefix,fields"]');

    dialogBody
      .querySelectorAll('div[mxv*="listPrefix,fields"]')[0]
      .scrollIntoView();

    await waitForRenderComplete2(
      dialogBody.querySelectorAll('div[mxv*="listPrefix,fields"]')[0],
      "table"
    );

    const targetTable = dialogBody
      .querySelectorAll('div[mxv*="listPrefix,fields"]')[0]
      .querySelectorAll("table");

    const theads = Array.from(
      targetTable[0].querySelector("thead").getElementsByTagName("th")
    ).map((it) => it.textContent);

    Array.from(
      targetTable[1].querySelector("tbody").getElementsByTagName("tr")
    ).forEach((item) => {
      let itemObj = {};
      const valueList = item.innerText.split("\t");
      valueList.forEach((it, index) => {
        if (!it.includes("\n")) {
          itemObj[theads[index]] = it;
        } else {
          itemObj[theads[index]] = it.split("\n").filter((value) => value);
        }
      });
      result.push(itemObj);
    });
    await closeDialog(2500);
    resolve(result);
  });
}

async function getCurrentTables(result) {
  lastTableContent = JSON.stringify(getTargetTable("tbody")?.innerHTML);
  let trList = Array.from(getTargetTable("tbody").getElementsByTagName("tr"));
  for (let i = 0; i < trList.length; i++) {
    const tempTR = trList[i];
    // 排除子项下方操作项，并且不包含合计项
    if (tempTR.getAttribute("mx-stickytable-operation")) {
      tempTR.querySelector('button[mxv="popData"]').click();
      const data = await readItDetail();
      if (result.length) {
        result[result.length - 1]["基础指标"] = data;
      }
    } else {
      if (
        Array.from(tempTR.children).length > 2 &&
        !tempTR.childNodes[0].textContent.includes("合计")
      ) {
        const detailUrl = tempTR.querySelector("a")?.href || "";
        const imageUrl = tempTR.querySelector("img")?.src || "";
        const trInfo = Array.from(tempTR.children).map((item) => {
          // 双引号使其表内换行 innerText 可以保留换行
          // \uE000-\uF8FF 替换一些图标
          return item.innerText.replace(/[\uE000-\uF8FF]/g, "").trim();
        });
        trInfo.splice(2, 0, detailUrl);
        trInfo.splice(2, 0, imageUrl);
        const tempObj = {};
        trInfo.forEach((it, index) => {
          // 排除状态和操作项目
          if (index !== 0 && index !== trInfo.length - 1) {
            tempObj[tableHeads[index]] = it;
          }
        });
        result.push(tempObj);
      }
    }
  }
  // Array.from(getTargetTable("tbody").getElementsByTagName("tr"))
  //   .slice(1, 2)
  //   .forEach(async (it, index) => {
  //     // 排除子项下方操作项，并且不包含合计项
  //     console.log("操作栏1", it.getAttribute("mx-stickytable-operation"));
  //     if (it.getAttribute("mx-stickytable-operation")) {
  //       it.querySelector('button[mxv="popData"]').click();
  //       const data = await readItDetail();
  //       console.log("操作栏2", data);
  //     } else {
  //       console.log("数据项");
  //       if (
  //         Array.from(it.children).length > 2 &&
  //         !it.childNodes[0].textContent.includes("合计")
  //       ) {
  //         const detailUrl = it.querySelector("a")?.href || "";
  //         const imageUrl = it.querySelector("img")?.src || "";
  //         const trInfo = Array.from(it.children).map((item) => {
  //           // 双引号使其表内换行 innerText 可以保留换行
  //           // \uE000-\uF8FF 替换一些图标
  //           return item.innerText.replace(/[\uE000-\uF8FF]/g, "").trim();
  //         });
  //         trInfo.splice(2, 0, detailUrl);
  //         trInfo.splice(2, 0, imageUrl);
  //         const tempObj = {};
  //         trInfo.forEach((it, index) => {
  //           // 排除状态和操作项目
  //           if (index !== 0 && index !== trInfo.length - 1) {
  //             tempObj[tableHeads[index]] = it;
  //           }
  //         });
  //         result.push(tempObj);
  //       }
  //     }
  //   });
}

async function scrapeOneData(callBack) {
  try {
    await closeDialog();
    // 获取表头
    const targetHead = getTargetTable();
    if (!targetHead) {
      throw "no table data";
    }
    targetHead.scrollIntoView();
    tableHeads = Array.from(
      targetHead.getElementsByTagName("thead")?.[0].getElementsByTagName("th")
    ).map((it) => it.innerText.split("\n")[0]);
    tableHeads.splice(2, 0, "详情页");
    tableHeads.splice(2, 0, "商品图片");
    // 设置表数据
    const tableList = [];
    await getPageData(tableList);
    return tableList;
  } catch (e) {
    console.log("uploadFile error: ", e);
    return [];
  }
}
