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
  const nodeSelectors = document.querySelectorAll("[mxv=pageSizes]");
  if (!nodeSelectors.length) {
    return;
  }
  const pagesNode = nodeSelectors[0].getElementsByTagName("a");
  let maxClassValue = 0;
  let curPageNum = 0;
  Array.from(pagesNode).forEach((it, index) => {
    // 根据css样式长度，找到当前选中的页码
    if (it.classList.length > maxClassValue) {
      maxClassValue = it.classList.length;
      curPageNum = it.textContent;
    }
  });
  console.log("当前选中页码", curPageNum);
  if (curPageNum == 1) {
    getCurrentTables(tableList);
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

function waitForRenderComplete2() {
  return new Promise((resolve) => {
    let timeCount = 9;
    const checkExist = setInterval(() => {
      if (
        document.querySelectorAll('div[mxv^="cubeAction,params"]')?.[0] ||
        !timeCount
      ) {
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

function getCurrentTables(result) {
  lastTableContent = JSON.stringify(getTargetTable("tbody")?.innerHTML);
  Array.from(getTargetTable("tbody").getElementsByTagName("tr")).forEach(
    (it, index) => {
      // 排除子项下方操作项，并且不包含合计项
      if (
        Array.from(it.children).length > 2 &&
        !it.childNodes[0].textContent.includes("合计")
      ) {
        const detailUrl = it.querySelector("a")?.href || "";
        const imageUrl = it.querySelector("img")?.src || "";
        const trInfo = Array.from(it.children).map((item) => {
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
  );
}

async function scrapeOneData(callBack) {
  try {
    // 获取表头
    // const targetHead = getTargetTable();
    // if (!targetHead) {
    //   throw "no table data";
    // }
    // targetHead.scrollIntoView();
    // tableHeads = Array.from(
    //   targetHead.getElementsByTagName("thead")?.[0].getElementsByTagName("th")
    // ).map((it) => it.innerText.split("\n")[0]);
    // tableHeads.splice(2, 0, "详情页");
    // tableHeads.splice(2, 0, "商品图片");
    // // 设置表数据
    // const tableList = [];
    // await getPageData(tableList);
    // return tableList;
  } catch (e) {
    console.log("uploadFile error: ", e);
    return [];
  }
}
