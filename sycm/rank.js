async function scrapeSearchRank() {
	// Example logic to scrape search rank data
	console.log("开始扫描一级搜索");
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for page to load
	waitForElement(".oui-date-picker-particle-button");
	const dateContainer = document.querySelectorAll(
		".oui-date-picker-particle-button"
	);
	const btns = dateContainer[i].querySelectorAll("button");
	const selectors = ["30天", "7天"];
	if (btns.length > 0) {
		for (let i in selectors) {
			for (let j = 0; j < btns.length; j++) {
				if (btns[j].innerText.includes(selectors[i])) {
					btns[j].click();
					console.log("选择时间范围:", selectors[i]);
					break;
				}
			}
		}
	}
	await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for page to load
	const tableList = [];
	await scrapePages(tableList);
}

function getTargetTable(node = "thead") {
	const target = document
		.querySelectorAll(".ant-table-body")[0]
		.getElementsByTagName("table");
	return target.getElementsByTagName(node) || null;
}

// 判断是否还有可以获取的内容
let lastTableContent = "";
async function scrapePages(tableList, maxPageNum = 5) {
	const pageSelector = document.querySelector("ant-pagination");
	if (!pageSelector) {
		return;
	}
	const nextPageButton = pageSelector.querySelector("li.ant-pagination-next");
	// const pagesNode = pageSelector.querySelectorAll("li.ant-pagination-item");
	let activePageNode = pageSelector.querySelector(
		"li.ant-pagination-item-active"
	);
	let curPageNum = activePageNode
		? Number(activePageNode.textContent.trim())
		: 1;

	console.log("当前选中页码", curPageNum);

	await getPageData(tableList);

	for (let i = 0; i < maxPageNum; i++) {
		chrome.runtime.sendMessage({
			from: "sycm",
			action: "updateTipContent",
			data: `正在读取第 ${i + curPageNum} 页数据……`,
		});
		nextPageButton.click();
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
						resolve(getPageData(tableList));
					});
				}
				--timeout;
			}, 1000);
		});
	}
}

async function getPageData(result) {
	lastTableContent = JSON.stringify(getTargetTable("tbody")?.innerHTML);
	let trList = Array.from(getTargetTable("tbody").getElementsByTagName("tr")); // .slice(0,20)
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
