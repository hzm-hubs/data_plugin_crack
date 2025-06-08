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

  await getCurrentTables(tableList);
  return;

  if (curPageNum == 1) {
    await getCurrentTables(tableList);
  }

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

function getDetailMode(
  ele,
  sort = 0,
  targetName = "实际投产比",
  type = "hour"
) {
  return new Promise(async (resolve) => {
    const result = [];

    ele[sort].scrollIntoView();

    // 切换显示模式 到 表格展示
    ele[sort].querySelectorAll("[mx-click*=magix-portsu]")[1].click();

    // 等待表格数据加载
    await waitForRenderComplete2(ele[sort], 'div[mxv*="listPrefix,fields"]');

    const theads = Array.from(
      ele[sort].querySelector("thead").getElementsByTagName("th")
    ).map((it) => it.textContent);

    const targetKeyIndex = theads.findIndex((it) => it == targetName);

    let trList = Array.from(
      ele[sort].querySelector("tbody").getElementsByTagName("tr")
    );

    if (type == "hour") {
      trList = trList.slice(currentHour - 2, currentHour + 1);
    }

    trList.forEach((item) => {
      let itemObj = {};
      // 只获取时间 和 targetName 数据
      itemObj[theads[0]] = item.children[0].innerText;
      // 去除百分数影响
      const targetText = item.children[targetKeyIndex].innerText.replace(
        /([+-])[\d.]+%/,
        ""
      );
      const targetList = targetText.includes("\n")
        ? targetText.split("\n")
        : targetText;
      itemObj.value = targetList;

      // 获取所有表格数据
      // const valueList = item.innerText.split("\t");
      // valueList.forEach((it, index) => {
      //   // 获取到展现量
      //   if (!it.includes("\n")) {
      //     itemObj[theads[index]] = it;
      //   } else {
      //     itemObj[theads[index]] = it.split("\n").filter((value) => value);
      //   }
      // });
      result.push(itemObj);
    });
    resolve(result);
  });
}

function readItDetail() {
  return new Promise(async (resolve) => {
    const result = {};

    await waitForRenderComplete2(document, ".dialog-modal-body");

    const dialogBody = document.querySelector(".dialog-modal-body");

    // 切换到 分时数据 维度
    dialogBody.getElementsByTagName("a")[2].click();

    await waitForRenderComplete2(dialogBody, ".dialog-body");

    // 过去三小时 实际投产
    const sdf = await getDetailMode(
      dialogBody.querySelectorAll(".dialog-body"),
      0
    );

    result.pastHourPut = sdf;

    // 过去三小时 展现量
    const sdf1 = await getDetailMode(
      dialogBody.querySelectorAll(".dialog-body"),
      1,
      "展现量"
    );

    result.pastHourDisplay = sdf1;

    // 点击获取7天数据
    dialogBody
      .querySelector('div[mxv*="outQuicks"]')
      .querySelectorAll('div[mx-click*="magix-portsu"]')[2]
      .click();

    await waitForRenderComplete2(dialogBody, ".dialog-body");

    // 过去七天
    const sdf2 = await getDetailMode(
      dialogBody.querySelectorAll(".dialog-body"),
      0,
      "实际投产比",
      "date"
    );

    result.pastDatePut = sdf2;

    const sdf3 = await getDetailMode(
      dialogBody.querySelectorAll(".dialog-body"),
      1,
      "展现量",
      "date"
    );

    result.pastDateDisplay = sdf3;

    await closeDialog(2500);

    resolve(result);
  });
}

const currentHour = new Date().getHours();

async function getCurrentTables(result) {
  lastTableContent = JSON.stringify(getTargetTable("tbody")?.innerHTML);
  let trList = Array.from(
    getTargetTable("tbody").getElementsByTagName("tr")
  ).slice(0, 4);
  for (let i = 0; i < trList.length; i++) {
    const tempTR = trList[i];
    // 排除子项下方操作项，并且不包含合计项
    if (tempTR.getAttribute("mx-stickytable-operation")) {
      tempTR.querySelector('button[mxv="popData"]').click();
      const timeData = await readItDetail();
      if (result.length) {
        result[result.length - 1]["timeData"] = timeData;
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
