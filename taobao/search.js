async function scrapeTaobaoSearchData() {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	console.log("准备抓取淘宝搜索页数据...");
	const products = [];
	let isFirst = true;
	let tryTimes = 10;
	while (products.length < appInfo.tbSearchListNum && tryTimes > 0) {
		if (!isFirst) {
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: "正在加载下一页数据，请稍候...",
			});
			getPagination()?.click();
			await new Promise((resolve) => setTimeout(resolve, 5000));
		}
		const currentData = await scrapeCurrentPage(
			appInfo.tbSearchListNum - products.length
		);
		if (!currentData?.length) {
			tryTimes -= 1;
		}
		products.push(...currentData);
		console.log("当前已抓取总数:", products);
		if (isFirst) {
			isFirst = false;
		}
	}
	return products;
}

function getPagination(targetEle = "下一页") {
	const paginationElement = document.querySelectorAll(".next-pagination-item");
	const targetElement = Array.from(paginationElement).find((el) =>
		el.textContent.includes(targetEle)
	);
	return targetElement;
}

async function scrapeCurrentPage(diffNum = 100) {
	const result = [];
	await scrollTaobaoSearchPage();
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const searchContainer = document.querySelector(".content--CUnfXXxv");
	if (!searchContainer) {
		console.error("找不到商品列表容器");
		return result;
	}

	let productList =
		Array.from(
			searchContainer.querySelectorAll("div.tbpc-col.search-content-col")
		) || [];
	console.log("找到商品列表数量:", productList.length);
	const currentNum = Math.min(productList.length, diffNum);
	for (let i = 0; i < productList.length; i++) {
		if (result.length >= currentNum) {
			break;
		}
		const item = productList[i];
		const titleElement = item.querySelector(".title--ASSt27UY span");
		const title = titleElement ? titleElement.innerText.trim() : "";
		const priceInt = item.querySelector(".priceInt--yqqZMJ5a");
		const priceFloat = item.querySelector(".priceFloat--XpixvyQ1");
		const priceString = priceInt
			? priceInt.innerText.trim() +
			  (priceFloat ? priceFloat.innerText.trim() : "")
			: "";
		const imageElement = item.querySelector(
			".mainPicAdaptWrapper--V_ayd2hD img"
		);
		const imageSrc = imageElement ? imageElement.src : "";
		const linkElement = item.querySelector("a");
		let itemLink = "";
		if (linkElement) {
			itemLink = linkElement.href;
			if (itemLink.startsWith("//")) {
				itemLink = "https:" + itemLink;
			}
		}
		const salesInfo = item.querySelector(".realSales--XZJiepmt");
		const salesInfo2 = salesInfo ? salesInfo.innerText.trim() : "";
		if (title || priceString) {
			result.push({
				title: title,
				price: priceString,
				image: imageSrc,
				link: itemLink,
				sales: salesInfo2,
			});
		}
	}
	console.log("本次抓取到搜索页数据:", result.length, "条");
	return result;
}

async function scrollTaobaoSearchPage() {
	console.log("开始滚动淘宝搜索页面以加载所有商品...");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在加载搜索结果，请稍候...",
	});
	try {
		const docHeight = Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight
		);
		const scrollStep = docHeight / 15;
		let scrollPos = 0;
		console.log("开始滚动，页面总高度:", docHeight, "px");
		for (let i = 0; i < 15; i++) {
			window.scrollTo({
				top: scrollPos,
				behavior: "smooth",
			});
			scrollPos += scrollStep;
			if (i % 3 === 0) {
				console.log(
					"滚动中...",
					Math.min(scrollPos, docHeight),
					"/",
					docHeight,
					"px"
				);
			}
			await new Promise((resolve) => setTimeout(resolve, 200));
		}
		console.log("滚动到底部完成，等待内容加载...");
		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log("滚动回顶部...");
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
		await new Promise((resolve) => setTimeout(resolve, 500));
		console.log("完成滚动和等待，页面应已完全加载");
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "页面加载完成，开始抓取数据...",
		});
		return true;
	} catch (error) {
		console.error("滚动过程中出错:", error);
		return false;
	}
}
