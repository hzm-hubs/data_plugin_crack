async function scrapeXiaohongshuSearchData(refresh = false) {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	console.log("开始抓取小红书搜索数据");
	return new Promise(async (resolve, reject) => {
		try {
			sendStatusToPopup("正在查找笔记元素...");
			let isProcessing = false;
			const noteLinks = new Set();
			const notesData = [];
			const maxNotes = appInfo.xhsSearchListNum || 100;
			const maxRetries = 15;
			let retryCount = 0;
			let noNewDataCount = 0;
			function updateProgress(count, total) {
				sendStatusToPopup(`已找到 ${count}/${total} 个笔记，继续加载中...`);
			}
			function countNotes(noteCount) {
				const noteItems = document.querySelectorAll(".note-item");
				console.log(`当前页面找到 ${noteItems.length} 个笔记元素`);
				noteCount = 0;
				for (const noteItem of noteItems) {
					try {
						const coverLink =
							noteItem.querySelector("a.cover") ||
							noteItem.querySelector('a[href*="/explore/note/"]');
						if (!coverLink) {
							console.warn("找不到链接元素，跳过此笔记");
							continue;
						}
						const coverLink2 = coverLink.href;
						if (noteLinks.has(coverLink2)) {
							continue;
						}
						noteLinks.add(coverLink2);
						noteCount++;
						const coverImage =
							noteItem.querySelector("img[data-xhs-img]") ||
							noteItem.querySelector("img.cover");
						const coverSrc = coverImage ? coverImage.src : "";
						const noteTitle =
							noteItem.querySelector(".title span") ||
							noteItem.querySelector(".content");
						const noteTitle2 = noteTitle ? noteTitle.textContent.trim() : "";
						const authorElement =
							noteItem.querySelector(".author") ||
							noteItem.querySelector(".user-name");
						const authorName = authorElement
							? authorElement.textContent.trim()
							: "";
						const authorLink =
							noteItem.querySelector(".author a") ||
							noteItem.querySelector(".user-name a") ||
							authorElement;
						const authorLink2 =
							authorLink && authorLink.href ? authorLink.href : "";
						const authorImage =
							noteItem.querySelector(".author img") ||
							noteItem.querySelector(".avatar img");
						const authorAvatarSrc = authorImage ? authorImage.src : "";
						const likeCount =
							noteItem.querySelector(".like-wrapper .count") ||
							noteItem.querySelector(".like-count");
						const likeCount2 = likeCount ? likeCount.textContent.trim() : "0";
						notesData.push({
							title: noteTitle2,
							cover: coverSrc,
							author: authorName,
							authorID: "",
							authorLink: authorLink2,
							authorAvatar: authorAvatarSrc,
							link: coverLink2,
							likes: likeCount2,
							isTop: false,
							duration: "",
							publishTime: "",
						});
						if (notesData.length >= maxNotes) {
							break;
						}
					} catch (error) {
						console.error("抓取单个笔记时出错:", error);
					}
				}
				console.log(
					`本次新增 ${noteCount} 个笔记，当前总数: ${notesData.length}`
				);
				return noteCount;
			}
			async function loadMoreNotes() {
				if (isProcessing) {
					return;
				}
				isProcessing = true;
				try {
					const noteCount = countNotes();
					updateProgress(notesData.length, maxNotes);
					if (notesData.length >= maxNotes) {
						console.log(`已达到目标数量 ${maxNotes} 个笔记，停止滚动`);
						isProcessing = false;
						resolve(notesData);
						return;
					}
					if (noteCount === 0) {
						noNewDataCount++;
						console.log(
							`本次滚动没有新增笔记，无新数据计数: ${noNewDataCount}`
						);
						if (noNewDataCount >= 3) {
							console.log(
								`连续 ${noNewDataCount} 次没有新增笔记，可能已加载完全部内容`
							);
							isProcessing = false;
							resolve(notesData);
							return;
						}
					} else {
						noNewDataCount = 0;
					}
					retryCount++;
					if (retryCount >= maxRetries) {
						console.log(`已达到最大重试次数 ${maxRetries}，停止滚动`);
						isProcessing = false;
						resolve(notesData);
						return;
					}
					console.log(`滚动加载更多内容，当前已有 ${notesData.length} 个笔记`);
					window.scrollTo(0, document.body.scrollHeight);
					await new Promise((resolve) => setTimeout(resolve, 2000));
					isProcessing = false;
					await loadMoreNotes();
				} catch (error) {
					console.error("滚动加载时出错:", error);
					isProcessing = false;
					if (notesData.length > 0) {
						console.log(
							`虽然出错，但已抓取到 ${notesData.length} 个笔记，返回现有数据`
						);
						resolve(notesData);
					} else {
						reject(error);
					}
				}
			}
			loadMoreNotes();
		} catch (error) {
			console.error("抓取小红书搜索数据时出错:", error);
			reject(error);
		}
	});
}
function sendStatusToPopup(status) {
	try {
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: status,
		});
	} catch (error) {
		console.error("发送状态更新失败:", error);
	}
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "scrapeData") {
		console.log("收到抓取数据请求");
		scrapeXiaohongshuSearchData()
			.then((results) => {
				console.log("抓取完成，发送结果到popup");
				sendResponse({
					success: true,
					data: results,
				});
			})
			.catch((error) => {
				console.error("抓取失败:", error);
				sendResponse({
					success: false,
					error: error.message,
				});
			});
		return true;
	}
});
