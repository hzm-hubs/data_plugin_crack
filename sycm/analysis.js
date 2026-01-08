async function scrapeSearchAnalysis() {
	console.log("开始扫描二级关键词");
	const keyword = document
		.querySelector(".op-market-search-analysis-keyword span")
		.textContent.trim();
	console.log("当前关键词:", keyword);
	await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for page to load
	waitForElement(".oui-date-picker-particle-button");
	const dateContainer = document.querySelector(
		".oui-date-picker-particle-button"
	);
	const btns = dateContainer.querySelectorAll("button");
	const targetDate = "30天";
	if (btns.length > 0) {
		for (let j = 0; j < btns.length; j++) {
			if (btns[j].innerText.includes(targetDate)) {
				btns[j].click();
				console.log("选择时间范围:", targetDate);
				break;
			}
		}
	}
	await new Promise((resolve) => setTimeout(resolve, 4000)); // Wait for page to load
	const relatedList = [];
	await scrapePages(relatedList);
	console.log("关键词数据抓取完成");
	return {
		keyword,
		list: relatedList,
	};
}

function getTargetTable(node = "thead") {
	const target = document
		.querySelectorAll(".ant-table-body")[0]
		.querySelector("table");
	return target.querySelector(node) || null;
}

// 判断是否还有可以获取的内容
let lastTableContent = "";
async function scrapePages(relatedList, maxPageNum = 5) {
	const pageSelector = document.querySelector(".ant-pagination");
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

	await getPageData(relatedList);

	for (let i = 1; i < maxPageNum; i++) {
		chrome.runtime.sendMessage({
			from: "sycm",
			action: "updateStatus",
			status: `正在读取第 ${i + curPageNum} 页数据……`,
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
						resolve(getPageData(relatedList));
					});
				}
				--timeout;
			}, 1000);
		});
	}
}

const relatedColumn = [
	{
		prop: "keyword",
		label: "相关搜索词",
	},
	{
		prop: "searchPopularity",
		label: "搜索人气",
	},
	{
		prop: "clickRate",
		label: "点击率",
	},
	{
		prop: "payConversionRate",
		label: "支付转化率",
	},
];

function formatNumberRange(text) {
	// 匹配模式：数字范围 ~ 数字范围 \n 百分比
	// "2500 ~ 5000\n10%"; => "2500 ~ 5000(10%)"
	return text.replace(/(\d+)\s*~\s*(\d+)\s*\n\s*(\d+%)/g, "$1 ~ $2($3)");
}

async function getPageData(result) {
	lastTableContent = JSON.stringify(getTargetTable("tbody")?.innerHTML);
	let trList = Array.from(getTargetTable("tbody").getElementsByTagName("tr")); // .slice(0,20)
	for (let i = 0; i < trList.length; i++) {
		const tempTR = trList[i];
		// 排除子项下方操作项，并且不包含合计项
		const trInfo = Array.from(tempTR.children).map((item) => {
			// 双引号使其表内换行 innerText 可以保留换行
			// \uE000-\uF8FF 替换一些图标
			return item.innerText.replace(/[\uE000-\uF8FF]/g, "").trim();
		});
		const curTr = {};
		for (let j = 0; j < relatedColumn.length; j++) {
			const result = trInfo[j].split("\n");
			curTr[relatedColumn[j].prop] = result[0] || "";
			if (result[1]) {
				curTr[`${relatedColumn[j].prop}Increase`] = result[1];
			}
		}
		result.push(curTr);
	}
}
