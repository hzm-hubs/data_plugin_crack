async function scrapeComments(maxComments) {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	console.log("开始抓取评论");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在抓取评论...",
	});
	maxComments = appInfo?.tbCommentNum || 100;
	try {
		console.log(
			"初始HTML状态:",
			document.body.innerHTML.substring(0, 500) + "..."
		);
		console.log("尝试获取评论总数");
		let commentCount = maxComments;
		const selectors = [
			'span[class*="tagItem"][class*="isSelected"]',
			'span:contains("全部(")',
			".rate-counter",
			".comment-count",
			".review-count",
		];
		function parseCommentCount1(text) {
			console.log(`解析评论数量文本: "${text}"`);
			text = text.replace(new RegExp("\\s+", "g"), "");
			let commentCount1 = text.match(new RegExp("全部\\(([^)]+)\\)", ""));
			if (commentCount1) {
				const commentCount11 = commentCount1[1];
				console.log(`提取括号内容: "${commentCount11}"`);
				if (commentCount11.includes("万")) {
					console.log(
						`检测到"万"字，评论数量肯定超过${maxComments}，使用最大值 ${maxComments}`
					);
					return maxComments;
				}
				const num = parseInt(commentCount11, 10);
				if (!isNaN(num)) {
					console.log(`解析为数字: ${num}`);
					if (num >= maxComments) {
						console.log(
							`评论数量 ${num} >= ${maxComments}，使用最大值 ${maxComments}`
						);
						return maxComments;
					}
					return num;
				}
				if (commentCount11.includes("+")) {
					console.log(
						`检测到"+"号，评论数量可能很大，使用最大值 ${maxComments}`
					);
					return maxComments;
				}
			}
			const num = parseInt(text, 10);
			if (!isNaN(num)) {
				console.log(`直接解析为数字: ${num}`);
				if (num >= maxComments) {
					console.log(
						`评论数量 ${num} >= ${maxComments}，使用最大值 ${maxComments}`
					);
					return maxComments;
				}
				return num;
			}
			console.log(`无法解析评论数量，使用默认最大值: ${maxComments}`);
			return maxComments;
		}
		for (const selector of selectors) {
			try {
				if (selector.includes(":contains(")) {
					const spanElements = document.querySelectorAll("span");
					for (const spanElement of spanElements) {
						if (spanElement.textContent.includes("全部(")) {
							console.log(
								`找到可能包含评论数的元素: "${spanElement.textContent}"`
							);
							const count = parseCommentCount1(spanElement.textContent);
							if (count !== null) {
								commentCount = count;
								console.log(`成功解析评论总数: ${commentCount}`);
								break;
							}
						}
					}
				} else {
					const element = document.querySelector(selector);
					if (element) {
						console.log(`找到可能包含评论数的元素: "${element.textContent}"`);
						const count = parseCommentCount1(element.textContent);
						if (count !== null) {
							commentCount = count;
							console.log(`成功解析评论总数: ${commentCount} (从 ${selector})`);
							break;
						}
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		if (isNaN(commentCount) || commentCount <= 0) {
			commentCount = maxComments;
			console.log(`未找到有效的评论总数，使用默认值: ${maxComments}`);
		} else {
			console.log(`使用实际评论总数: ${commentCount}`);
		}
		const minComments = Math.min(commentCount, maxComments);
		console.log(`期望获取的评论数量: ${minComments}`);
		console.log("尝试滚动到参数信息");
		const infoSelectors = [
			"p.tabDetailItemTitle--RW7pKjfx",
			'p[class*="tabDetailItemTitle"]',
			'p[data-spm-anchor-id*="pc_detail.29232929.202205"]',
			'p:contains("参数信息")',
		];
		let infoElement = null;
		for (const selector of infoSelectors) {
			try {
				if (selector.includes(":contains(")) {
					const params = document.querySelectorAll("p");
					for (const p of params) {
						if (p.textContent.includes("参数信息")) {
							infoElement = p;
							console.log("找到参数信息元素:", p.textContent);
							break;
						}
					}
				} else {
					const element = document.querySelector(selector);
					if (element) {
						infoElement = element;
						console.log(`找到参数信息元素: ${selector}`);
						break;
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		if (infoElement) {
			console.log("滚动到参数信息元素");
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: "正在滚动到参数信息...",
			});
			const scrollTo = async (element) => {
				const elementTop =
					element.getBoundingClientRect().top + window.pageYOffset;
				const startPosition = window.pageYOffset;
				const distance = elementTop - startPosition;
				if (Math.abs(distance) > 1000) {
					const steps = 5;
					const stepDistance = distance / steps;
					for (let i = 1; i <= steps; i++) {
						const targetPosition = startPosition + stepDistance * i;
						window.scrollTo({
							top: targetPosition,
							behavior: "smooth",
						});
						await new Promise((r) => setTimeout(r, 800));
					}
					element.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
					await new Promise((r) => setTimeout(r, 1000));
				} else {
					element.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
					await new Promise((r) => setTimeout(r, 1500));
				}
			};
			await scrollTo(infoElement);
			console.log("已滚动到参数信息元素");
		} else {
			console.log("未找到参数信息元素，尝试平滑滚动到页面中部");
			const smoothScroll = async () => {
				const scrollHeight = document.body.scrollHeight;
				const startPosition = window.pageYOffset;
				const targetPosition = scrollHeight / 3;
				const distance = targetPosition - startPosition;
				const steps = 8;
				const stepDistance = distance / steps;
				for (let i = 1; i <= steps; i++) {
					const scrollTop = startPosition + stepDistance * i;
					window.scrollTo({
						top: scrollTop,
						behavior: "smooth",
					});
					await new Promise((r) => setTimeout(r, 400));
				}
				await new Promise((r) => setTimeout(r, 1000));
			};
			await smoothScroll();
		}
		console.log('尝试点击"全部评价"按钮');
		const parseCommentCount = [
			'div[class*="ShowButton"]',
			'a:contains("全部评价")',
			'button:contains("全部评价")',
			'div:contains("全部评价")',
			'span:contains("全部评价")',
		];
		function findElements(selector, text) {
			const elements = document.querySelectorAll(selector);
			return Array.from(elements).filter((el) => el.textContent.includes(text));
		}
		let parseCommentCount2 = null;
		for (const selector of parseCommentCount) {
			try {
				if (selector.includes(":contains(")) {
					const selectorMatch = selector.match(new RegExp("([a-z]+):", "i"));
					const buttonId = selector.match(new RegExp('"([^"]+)"', ""));
					if (selectorMatch && buttonId) {
						const matchedSelector = selectorMatch[1];
						const buttonId1 = buttonId[1];
						const elements = findElements(matchedSelector, buttonId1);
						if (elements.length > 0) {
							parseCommentCount2 = elements[0];
							console.log(`找到"${buttonId1}"按钮:`, parseCommentCount2);
							break;
						}
					}
				} else {
					const commentBtn = document.querySelector(selector);
					if (commentBtn) {
						parseCommentCount2 = commentBtn;
						console.log(`找到全部评价按钮:`, selector);
						break;
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		if (parseCommentCount2) {
			console.log('点击"全部评价"按钮');
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: '正在点击"全部评价"按钮...',
			});
			parseCommentCount2.click();
			console.log("等待评论面板加载");
			await new Promise((r) => setTimeout(r, 5000));
			console.log("查找leftDrawer容器");
			const leftDrawer = document.querySelector('div[class*="leftDrawer--"]');
			if (leftDrawer) {
				console.log("找到leftDrawer容器");
				const commentsContainer = leftDrawer.querySelector(
					'div[class*="comments--"][class*="beautify-scroll-bar"], div[class*="comments--"], .beautify-scroll-bar, div[class*="beautify-scroll"]'
				);
				if (commentsContainer) {
					console.log("找到评论容器:", commentsContainer.className);
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: "正在加载评论...",
					});
					await loadAllComments(commentsContainer, minComments);
					let comments = extractComments(commentsContainer);
					if (comments && comments.length > minComments) {
						console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
						comments = comments.slice(0, minComments);
					}
					if (comments && comments.length > 0) {
						console.log(
							`成功从评论容器提取 ${comments.length} 条评论 (总数: ${commentCount})`
						);
						closeCommentOverlay();
						chrome.runtime.sendMessage({
							action: "updateStatus",
							status: `成功抓取 ${comments.length}/${commentCount} 条评论`,
						});
						return comments;
					} else {
						console.log("评论容器中没有找到评论，尝试从整个leftDrawer中提取");
						let commentsFromDrawer = extractComments(leftDrawer);
						if (commentsFromDrawer && commentsFromDrawer.length > minComments) {
							console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
							commentsFromDrawer = commentsFromDrawer.slice(0, minComments);
						}
						if (commentsFromDrawer && commentsFromDrawer.length > 0) {
							console.log(
								`成功从leftDrawer提取 ${commentsFromDrawer.length} 条评论 (总数: ${commentCount})`
							);
							closeCommentOverlay();
							chrome.runtime.sendMessage({
								action: "updateStatus",
								status: `成功抓取 ${commentsFromDrawer.length}/${commentCount} 条评论`,
							});
							return commentsFromDrawer;
						}
					}
				} else {
					console.log(
						"在leftDrawer中未找到评论容器，尝试从整个leftDrawer中提取评论"
					);
					let commentsFromDrawer = extractComments(leftDrawer);
					if (commentsFromDrawer && commentsFromDrawer.length > minComments) {
						console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
						commentsFromDrawer = commentsFromDrawer.slice(0, minComments);
					}
					if (commentsFromDrawer && commentsFromDrawer.length > 0) {
						console.log(
							`成功从leftDrawer提取 ${commentsFromDrawer.length} 条评论 (总数: ${commentCount})`
						);
						closeCommentOverlay();
						chrome.runtime.sendMessage({
							action: "updateStatus",
							status: `成功抓取 ${commentsFromDrawer.length}/${commentCount} 条评论`,
						});
						return commentsFromDrawer;
					}
				}
				closeCommentOverlay();
			} else {
				console.log("未找到leftDrawer容器，尝试查找其他可能的评论面板");
			}
			console.log("尝试查找其他可能的评论面板");
			const commentSelectors = [
				// 'div[class*="Comments--"]',
				'div[class*="comments--"]',
				"div.content--ew3Y4lVg",
				".tb-revbd",
				".rate-grid",
				".comment-list",
				".beautify-scroll-bar",
				".modal-content",
				".dialog-content",
				".popup-content",
				".overlay-content",
			];
			let commentsPanel = null;
			for (const selector of commentSelectors) {
				try {
					const commentsPanel1 = document
						.querySelector('div[class*="Drawer--"]')
						.querySelector(selector);
					if (commentsPanel1) {
						commentsPanel = commentsPanel1;
						console.log(`找到评论面板:`, selector);
						break;
					}
				} catch (e) {
					console.error(`选择器 ${selector} 出错:`, e);
				}
			}
			if (commentsPanel) {
				console.log("找到评论面板，加载所有评论");
				chrome.runtime.sendMessage({
					action: "updateStatus",
					status: "正在加载评论...",
				});
				await loadAllComments(commentsPanel, minComments);
				let comments = extractComments(commentsPanel);
				if (comments && comments.length > minComments) {
					console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
					comments = comments.slice(0, minComments);
				}
				if (comments && comments.length > 0) {
					console.log(
						`成功从评论面板提取 ${comments.length} 条评论 (总数: ${commentCount})`
					);
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: `成功抓取 ${comments.length}/${commentCount} 条评论`,
					});
					return comments;
				}
			}
		} else {
			console.log('未找到"全部评价"按钮，尝试直接查找评论');
		}
		console.log("尝试直接查找评论面板");
		let commentsPanel = document.querySelector(
			'div[class*="Comments--"], div.content--ew3Y4lVg, .tb-revbd, .rate-grid, .comment-list'
		);
		if (commentsPanel) {
			console.log("找到评论面板，尝试加载所有评论");
			await loadAllComments(commentsPanel, minComments);
			let comments = extractComments(commentsPanel);
			if (comments && comments.length > minComments) {
				console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
				comments = comments.slice(0, minComments);
			}
			if (comments && comments.length > 0) {
				console.log(
					`成功从评论面板提取 ${comments.length} 条评论 (总数: ${commentCount})`
				);
				chrome.runtime.sendMessage({
					action: "updateStatus",
					status: `成功抓取 ${comments.length}/${commentCount} 条评论`,
				});
				return comments;
			}
		}
		console.log("尝试直接从页面中查找评论");
		let parseCommentCount3 = await findCommentsDirectly();
		if (parseCommentCount3 && parseCommentCount3.length > minComments) {
			console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
			parseCommentCount3 = parseCommentCount3.slice(0, minComments);
		}
		if (parseCommentCount3 && parseCommentCount3.length > 0) {
			console.log(
				`成功直接从页面提取 ${parseCommentCount3.length} 条评论 (总数: ${commentCount})`
			);
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: `成功抓取 ${parseCommentCount3.length}/${commentCount} 条评论`,
			});
			return parseCommentCount3;
		}
		console.log("尝试使用备用方法");
		let parseCommentCount4 = await scrapeCommentsFromCurrentPage();
		if (parseCommentCount4 && parseCommentCount4.length > minComments) {
			console.log(`评论数量超过期望值，截取前 ${minComments} 条`);
			parseCommentCount4 = parseCommentCount4.slice(0, minComments);
		}
		if (parseCommentCount4 && parseCommentCount4.length > 0) {
			console.log(
				`成功使用备用方法提取 ${parseCommentCount4.length} 条评论 (总数: ${commentCount})`
			);
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: `成功抓取 ${parseCommentCount4.length}/${commentCount} 条评论`,
			});
			return parseCommentCount4;
		}
		console.log("所有方法都失败，无法提取评论");
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "无法抓取评论",
		});
		return [];
	} catch (error) {
		console.error("抓取评论时出错:", error);
		return [];
	}
}
function closeCommentOverlay() {
	try {
		console.log("尝试关闭评论遮罩");
		const closeSelectors = [
			".closeIcon--NdjsxNY9",
			'img[src*="closeIcon"]',
			'img[src*="close"]',
			'img[class*="closeIcon"]',
			'div[class*="closeIcon"]',
			'span[class*="closeIcon"]',
			'button[class*="closeIcon"]',
			'button[class*="close"]',
			'div[class*="close"]',
			'span[class*="close"]',
		];
		let closeButton = null;
		for (const selector of closeSelectors) {
			try {
				const button = document.querySelector(selector);
				if (button) {
					closeButton = button;
					console.log(`找到关闭按钮:`, selector);
					break;
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		if (closeButton) {
			console.log("点击关闭按钮");
			closeButton.click();
			console.log("已关闭评论遮罩");
			return true;
		} else {
			console.log("未找到关闭按钮");
			const leftDrawer = document.querySelector(
				'.leftDrawer--4H_p9fnt, div[class*="leftDrawer--"]'
			);
			if (leftDrawer) {
				for (const selector of closeSelectors) {
					try {
						const button = leftDrawer.querySelector(selector);
						if (button) {
							console.log(`在leftDrawer中找到关闭按钮:`, selector);
							button.click();
							console.log("已关闭评论遮罩");
							return true;
						}
					} catch (e) {
						console.error(`在leftDrawer中查找关闭按钮 ${selector} 出错:`, e);
					}
				}
			}
			console.log("无法关闭评论遮罩");
			return false;
		}
	} catch (error) {
		console.error("关闭评论遮罩出错:", error);
		return false;
	}
}
function loadAllComments(commentsPanel, maxComments = 100) {
	return new Promise(async (resolve) => {
		console.log(`开始加载评论，最大数量: ${maxComments}`);
		if (!commentsPanel) {
			console.log("评论面板不存在，无法加载评论");
			resolve(0);
			return;
		}
		const maxScrollAttempts =
			maxComments > 1000
				? 200
				: maxComments > 100
				? 20
				: maxComments < 10
				? 5
				: 20;
		console.log(`设置最大滚动尝试次数: ${maxScrollAttempts}`);
		let commentCount = 0;
		let scrollFailures = 0;
		const maxFails = 15;
		function getComments() {
			const selectors = [
				".Comment--H5QmJwe9",
				'div[class*="Comment--"]',
				".comment-item",
				"div.contentWrapper--uAdAlCgC",
				".rate-item",
				".tb-revbd .tb-r-review",
				".review-item",
				".comment-container",
				".comment-list > div",
				".comment-list > li",
				'div[class*="rate-item"]',
				'div[class*="review-item"]',
				'div[class*="comment-item"]',
				"div[data-index]",
			];
			let commentElements = [];
			for (const selector of selectors) {
				try {
					const commentNodes = commentsPanel.querySelectorAll(selector);
					if (commentNodes && commentNodes.length > commentElements.length) {
						commentElements = Array.from(commentNodes);
					}
				} catch (e) {
					console.error(`选择器 ${selector} 查找评论元素出错:`, e);
				}
			}
			return commentElements;
		}
		function scrollHandler(attempt = 0) {
			const comments = getComments();
			const commentCount1 = comments.length;
			console.log(
				`滚动尝试 #${attempt}: 当前评论数量 ${commentCount1}/${maxComments}`
			);
			const hasNewComments = commentCount1 > commentCount;
			if (!hasNewComments && attempt > 10) {
				scrollFailures++;
				console.log(`连续 ${scrollFailures}/${maxFails} 次没有新评论`);
			} else {
				scrollFailures = 0;
			}
			commentCount = commentCount1;
			if (
				commentCount1 >= maxComments ||
				attempt >= maxScrollAttempts ||
				(scrollFailures >= maxFails && attempt > 50)
			) {
				if (commentCount1 >= maxComments) {
					console.log(`已达到目标评论数量: ${commentCount1}/${maxComments}`);
				} else {
					if (attempt >= maxScrollAttempts) {
						console.log(
							`已达到最大滚动尝试次数: ${attempt}/${maxScrollAttempts}`
						);
					} else {
						console.log(`连续 ${scrollFailures} 次没有新评论，停止滚动`);
					}
				}
				console.log(`最终评论数量: ${commentCount1}/${maxComments}`);
				resolve(commentCount1);
				return;
			}
			try {
				const scrollStart = commentsPanel.scrollTop;
				const scrollHeight = commentsPanel.scrollHeight;
				commentsPanel.scrollTop = commentsPanel.scrollHeight;
				if (commentsPanel.scrollTop === scrollStart && attempt % 5 === 0) {
					console.log("常规滚动无效，尝试使用其他滚动方法");
					commentsPanel.scrollBy(0, 500);
					if (comments.length > 0) {
						const lastComment = comments[comments.length - 1];
						lastComment.scrollIntoView({
							behavior: "smooth",
							block: "end",
						});
					}
				}
				console.log("滚动状态:", {
					beforeScrollTop: scrollStart,
					afterScrollTop: commentsPanel.scrollTop,
					beforeScrollHeight: scrollHeight,
					afterScrollHeight: commentsPanel.scrollHeight,
					scrollDelta: commentsPanel.scrollTop - scrollStart,
				});
				const delay = Math.min(1000, 500 + attempt * 10);
				setTimeout(() => {
					scrollHandler(attempt + 1);
				}, delay);
			} catch (e) {
				console.error("滚动出错:", e);
				resolve(false);
			}
		}
		scrollHandler(0);
	});
}
function extractComments(commentsPanel, bestSelector) {
	console.log("开始提取评论");
	const commentSelectors = [
		".Comment--KkPcz74T",
		'div[class*="Comment--"]',
		".comment-item",
		"div.contentWrapper--uAdAlCgC",
		".rate-item",
		".tb-revbd .tb-r-review",
		".review-item",
		".comment-container",
		".comment-list > div",
		".comment-list > li",
		'div[class*="rate-item"]',
		'div[class*="review-item"]',
		'div[class*="comment-item"]',
		"div[data-index]",
	];
	let comments = [];
	bestSelector = "";
	if (commentsPanel) {
		for (const selector of commentSelectors) {
			try {
				const elements = commentsPanel.querySelectorAll(selector);
				if (elements && elements.length > 0) {
					if (elements.length > comments.length) {
						comments = Array.from(elements);
						bestSelector = selector;
						console.log(
							`在评论面板中使用选择器 ${selector} 找到 ${elements.length} 条评论 (当前最佳)`
						);
					} else {
						console.log(
							`在评论面板中使用选择器 ${selector} 找到 ${elements.length} 条评论`
						);
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		console.log(
			`最终使用选择器 ${bestSelector} 找到 ${comments.length} 条评论`
		);
		if (comments.length === 0) {
			console.log("在评论面板中未找到评论元素，尝试查找所有子元素");
			const childElements = commentsPanel.children;
			if (childElements && childElements.length > 0) {
				comments = Array.from(childElements).filter(
					(child) =>
						!child.className.includes("footer") &&
						!child.className.includes("loading") &&
						!child.className.includes("title")
				);
				console.log(
					`在评论面板中找到 ${comments.length} 个可能的评论元素(直接子元素)`
				);
			}
		}
		if (comments.length === 0) {
			console.log("尝试查找所有可能的div元素作为评论");
			const allDivs = commentsPanel.querySelectorAll("div");
			comments = Array.from(allDivs).filter((div) => {
				const rect = div.getBoundingClientRect();
				return rect.height > 50 && div.textContent.length > 50;
			});
			console.log(`找到 ${comments.length} 个可能的div评论元素`);
		}
	} else {
		for (const selector of commentSelectors) {
			try {
				const elements = document.querySelectorAll(selector);
				if (elements && elements.length > 0) {
					if (elements.length > comments.length) {
						comments = Array.from(elements);
						bestSelector = selector;
						console.log(
							`在文档中使用选择器 ${selector} 找到 ${elements.length} 条评论 (当前最佳)`
						);
					} else {
						console.log(
							`在文档中使用选择器 ${selector} 找到 ${elements.length} 条评论`
						);
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		console.log(
			`最终使用选择器 ${bestSelector} 找到 ${comments.length} 条评论`
		);
	}
	if (comments.length === 0) {
		console.log("尝试查找包含用户名和日期的元素");
		const allDivs = commentsPanel
			? commentsPanel.querySelectorAll("div")
			: document.querySelectorAll("div");
		comments = Array.from(allDivs).filter((div) => {
			const divText = div.textContent;
			const hasPattern =
				divText.includes("t**") ||
				divText.match(new RegExp("[a-z]\\*\\*\\d*", "i"));
			const dateMatch = divText.match(
				new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
			);
			return hasPattern && dateMatch && divText.length > 50;
		});
		console.log(`找到 ${comments.length} 个可能的评论元素`);
	}
	const extractedComments = [];
	const commentSet = new Set();
	comments.forEach((element, index) => {
		try {
			console.log(`处理第 ${index + 1}/${comments.length} 条评论`);
			const commentText = element.textContent.trim();
			if (commentSet.has(commentText)) {
				console.log(`跳过重复评论: ${commentText.substring(0, 30)}...`);
				return;
			}
			console.log(
				`评论 ${index + 1} 完整文本:`,
				commentText.substring(0, 100) + (commentText.length > 100 ? "..." : "")
			);
			let userName = "";
			const userSelectors = [
				'div[class*="userName"] span',
				".userName--mmxkxkd0 span",
				'div[class*="userName--"] span',
				".user-name span",
				".username span",
				".name span",
				'div[class*="userName"]',
				".userName--mmxkxkd0",
				'div[class*="userName--"]',
				".user-name",
				".username",
				".name",
			];
			for (const selector of userSelectors) {
				try {
					const userElement = element.querySelector(selector);
					if (userElement && userElement.textContent.trim()) {
						userName = userElement.textContent.trim();
						console.log(`从选择器 ${selector} 找到用户名: ${userName}`);
						break;
					}
				} catch (e) {
					console.error(`用户名选择器 ${selector} 出错:`, e);
				}
			}
			if (!userName) {
				const userMatch = commentText.match(new RegExp("[a-z]\\*\\*\\d+", "i"));
				if (userMatch) {
					userName = userMatch[0];
					console.log(`从文本中提取用户名: ${userName}`);
				}
			}
			let purchaseDate = "";
			let style = "";
			const metaSelectors = [
				'div[class*="meta"]',
				".meta--TDfRej2n",
				'div[class*="meta--"]',
				".date",
				".spec",
				'div[class*="date"]',
				'div[class*="spec"]',
				'span[class*="date"]',
				'span[class*="spec"]',
			];
			for (const selector of metaSelectors) {
				try {
					const metaElement = element.querySelector(selector);
					if (metaElement && metaElement.textContent.trim()) {
						const metaText = metaElement.textContent.trim();
						console.log(`从选择器 ${selector} 找到meta信息: ${metaText}`);
						const metaParts = metaText.split(new RegExp("\\s*·\\s*", ""));
						if (metaParts.length >= 1) {
							const dateMatch = metaParts[0].match(
								new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
							);
							if (dateMatch) {
								purchaseDate = dateMatch[0];
								console.log(`从meta中提取日期: ${purchaseDate}`);
							}
						}
						if (metaParts.length >= 2) {
							style = metaParts.slice(1).join(" · ");
							console.log(`从meta中提取款式: ${style}`);
						}
						if (purchaseDate && style) {
							break;
						}
					}
				} catch (e) {
					console.error(`meta选择器 ${selector} 出错:`, e);
				}
			}
			if (!purchaseDate) {
				const dateMatch = commentText.match(
					new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
				);
				if (dateMatch) {
					purchaseDate = dateMatch[0];
					console.log(`从文本中提取日期: ${purchaseDate}`);
				}
			}
			if (!style) {
				const extractedData = [
					commentText.match(new RegExp("规格[：:]\\s*([^，。,]+)", "")),
					commentText.match(new RegExp("颜色分类[：:]\\s*([^，。,]+)", "")),
					commentText.match(new RegExp("型号[：:]\\s*([^，。,]+)", "")),
					purchaseDate &&
						commentText.includes(purchaseDate) &&
						commentText
							.substring(
								commentText.indexOf(purchaseDate) + purchaseDate.length
							)
							.match(new RegExp("[^，。,:：]+", "")),
					commentText.match(
						new RegExp("左右排烟\\s*\\/\\s*天然气\\s*\\/\\s*([^，。,]+)", "")
					),
					commentText.match(new RegExp("([【\\[].+[】\\]])", "")),
					commentText.match(
						new RegExp("(\\d+m³\\/min\\s*[黑白金银铜灰色]+)", "")
					),
				];
				for (const styleEntry of extractedData) {
					if (
						styleEntry &&
						(styleEntry[1] || styleEntry[0]) &&
						(styleEntry[1] || styleEntry[0]).trim()
					) {
						style = (styleEntry[1] || styleEntry[0]).trim();
						console.log(`从文本中提取款式: ${style}`);
						break;
					}
				}
			}
			let commentContent = "";
			const commentSelectors1 = [
				".content",
				".text",
				".comment",
				'div[class*="content"]',
				'span[class*="content"]',
				'div[class*="text"]',
				'span[class*="text"]',
				'div[class*="comment"]',
				'span[class*="comment"]',
			];
			for (const selector of commentSelectors1) {
				try {
					const selectedElement = element.querySelector(selector);
					if (selectedElement && selectedElement.textContent.trim()) {
						commentContent = selectedElement.textContent.trim();
						console.log(
							`从选择器 ${selector} 找到内容: ${commentContent.substring(
								0,
								50
							)}...`
						);
						break;
					}
				} catch (e) {
					console.error(`内容选择器 ${selector} 出错:`, e);
				}
			}
			console.log("commentContent", commentContent);
			if (!commentContent) {
				commentContent = commentText;
				if (userName) {
					commentContent = commentContent.replace(userName, "");
				}
				if (purchaseDate) {
					commentContent = commentContent.replace(purchaseDate, "");
				}
				if (style) {
					commentContent = commentContent.replace(style, "");
				}
				commentContent = commentContent
					.replace(new RegExp("有用\\s*\\(\\d+\\)", "g"), "")
					.replace(new RegExp("回复\\s*\\(\\d+\\)", "g"), "")
					.replace(new RegExp("举报", "g"), "")
					.replace(new RegExp("此用户没有填写评价", "g"), "")
					.replace(new RegExp("追加评论", "g"), "")
					.replace(new RegExp("评价方式：", "g"), "")
					.replace(new RegExp("评价时间：", "g"), "")
					.replace(new RegExp("购买时间：", "g"), "")
					.replace(new RegExp("\\s*·\\s*", "g"), "");
				commentContent = commentContent.trim();
				console.log(
					`从完整文本提取内容: ${commentContent.substring(0, 50)}...`
				);
			}
			let commentimgs = [];
			let commentImgBlocks = element.querySelectorAll("div[class*=photo--]");
			if (commentImgBlocks?.length) {
				commentImgBlocks.forEach((it) => {
					const tempImg = it.querySelector("img")?.src || "";
					if (tempImg) {
						commentimgs.push(tempImg);
					}
				});
			}
			if (
				userName &&
				commentContent &&
				commentContent !== "此用户没有填写评价"
			) {
				extractedComments.push({
					userName: userName,
					purchaseDate: purchaseDate,
					purchaseSpec: style,
					content: commentContent,
					imgs: commentimgs,
				});
				commentSet.add(commentText);
				console.log(
					`成功提取第 ${index + 1} 条评论:`,
					userName,
					purchaseDate,
					style
				);
			} else {
				console.log(
					`跳过无效评论:`,
					userName,
					commentContent.substring(0, 30) + "..."
				);
			}
		} catch (e) {
			console.error(`提取第 ${index + 1} 条评论时出错:`, e);
		}
	});
	console.log(`共提取到 ${extractedComments.length} 条有效评论`);
	return extractedComments;
}
function scrapeCommentsFromCurrentPage() {
	console.log("开始从当前页面抓取评论");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在从当前页面抓取评论...",
	});
	try {
		console.log("尝试查找leftDrawer容器");
		const leftDrawer = document.querySelector(
			'.leftDrawer--4H_p9fnt, div[class*="leftDrawer--"]'
		);
		if (leftDrawer) {
			console.log("找到leftDrawer容器");
			const commentsContainer = leftDrawer.querySelector(
				'.comments--vOMSBfi2.beautify-scroll-bar, div[class*="comments--"][class*="beautify-scroll-bar"], .comments--vOMSBfi2, div[class*="comments--"], .beautify-scroll-bar, div[class*="beautify-scroll"]'
			);
			if (commentsContainer) {
				console.log("找到评论容器:", commentsContainer.className);
				const comments1 = commentsContainer.querySelectorAll(
					'.Comment--KkPcz74T, div[class*="Comment--"]'
				);
				if (comments1 && comments1.length > 0) {
					console.log(`在评论容器中找到 ${comments1.length} 条评论元素`);
					const comments = extractComments(commentsContainer);
					if (comments && comments.length > 0) {
						console.log(`成功从评论容器提取 ${comments.length} 条评论`);
						return comments;
					}
				} else {
					console.log("在评论容器中未找到评论元素，尝试从整个leftDrawer中提取");
				}
			} else {
				console.log("在leftDrawer中未找到评论容器，尝试从整个leftDrawer中提取");
			}
			const extractedComments = extractComments(leftDrawer);
			if (extractedComments && extractedComments.length > 0) {
				console.log(`成功从leftDrawer提取 ${extractedComments.length} 条评论`);
				return extractedComments;
			}
		} else {
			console.log("未找到leftDrawer容器，尝试查找其他可能的遮罩容器");
		}
		console.log("尝试查找其他可能的遮罩容器");
		const maskSelectors = [
			".content--ew3Y4lVg",
			'div[class*="content--"]',
			".modal-content",
			".dialog-content",
			".popup-content",
			".overlay-content",
			".beautify-scroll-bar",
			'div[class*="beautify-scroll"]',
		];
		let maskContainer = null;
		for (const selector of maskSelectors) {
			try {
				const container = document.querySelector(selector);
				if (container) {
					maskContainer = container;
					console.log(`找到遮罩容器: ${selector}`);
					break;
				}
			} catch (e) {
				console.error(`查找遮罩容器 ${selector} 出错:`, e);
			}
		}
		if (maskContainer) {
			console.log("从遮罩容器中提取评论");
			const comments = extractComments(maskContainer);
			if (comments && comments.length > 0) {
				console.log(`成功从遮罩容器中提取 ${comments.length} 条评论`);
				return comments;
			}
		}
		console.log("尝试查找评论容器");
		const commentSelectors = [
			"div.用户评价",
			'div:has(> h2:contains("用户评价"))',
			'div[class*="rate"]',
			"div.tb-reviews",
			'div[class*="comment"]',
			'div[class*="Comment"]',
			'div[class*="review"]',
			'div[class*="Review"]',
			'div[class*="评价"]',
			'div[class*="评论"]',
		];
		let commentContainer = null;
		for (const selector of commentSelectors) {
			try {
				if (selector.includes(":has(")) {
					const allDivs = document.querySelectorAll("div");
					for (const userReview of allDivs) {
						const reviewTitle = userReview.querySelector("h2");
						if (reviewTitle && reviewTitle.textContent.includes("用户评价")) {
							commentContainer = userReview;
							console.log('找到包含"用户评价"标题的容器');
							break;
						}
					}
				} else {
					const container = document.querySelector(selector);
					if (container) {
						commentContainer = container;
						console.log(`找到评论容器: ${selector}`);
						break;
					}
				}
			} catch (e) {
				console.error(`查找评论容器 ${selector} 出错:`, e);
			}
		}
		if (commentContainer) {
			console.log("从评论容器中提取评论");
			const comments = extractComments(commentContainer);
			if (comments && comments.length > 0) {
				console.log(`成功从评论容器中提取 ${comments.length} 条评论`);
				return comments;
			}
		}
		console.log("尝试查找所有可能的评论元素");
		const allDivs = document.querySelectorAll("div");
		const possibleComments = Array.from(allDivs).filter((div) => {
			const textContent = div.textContent;
			const containsPattern =
				textContent.includes("t**") ||
				textContent.match(new RegExp("[a-z]\\*\\*\\d*", "i"));
			const dateMatch = textContent.match(
				new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
			);
			return containsPattern && dateMatch && textContent.length > 50;
		});
		console.log(`找到 ${possibleComments.length} 个可能的评论元素`);
		const comments = [];
		possibleComments.forEach((element, index) => {
			try {
				console.log(`处理第 ${index + 1} 个可能的评论元素`);
				const commentText = element.textContent.trim();
				console.log(
					`评论 ${index + 1} 完整文本:`,
					commentText.substring(0, 100) +
						(commentText.length > 100 ? "..." : "")
				);
				let userName = "";
				const userSelectors = [
					'div[class*="userName"] span',
					".userName--mmxkxkd0 span",
					'div[class*="userName--"] span',
					".user-name span",
					".username span",
					".name span",
				];
				for (const selector of userSelectors) {
					try {
						const userElement = element.querySelector(selector);
						if (userElement && userElement.textContent.trim()) {
							userName = userElement.textContent.trim();
							console.log(`从选择器 ${selector} 找到用户名: ${userName}`);
							break;
						}
					} catch (e) {
						console.error(`用户名选择器 ${selector} 出错:`, e);
					}
				}
				if (!userName) {
					const username = commentText.match(
						new RegExp("[a-z]\\*\\*\\d+", "i")
					);
					if (username) {
						userName = username[0];
						console.log(`从文本中提取用户名: ${userName}`);
					}
				}
				let purchaseDate = "";
				let style = "";
				const metaSelectors = [
					'div[class*="meta"]',
					".meta--TDfRej2n",
					'div[class*="meta--"]',
					".date",
					".spec",
				];
				for (const selector of metaSelectors) {
					try {
						const metaElem = element.querySelector(selector);
						if (metaElem && metaElem.textContent.trim()) {
							const metaText = metaElem.textContent.trim();
							console.log(`从选择器 ${selector} 找到meta信息: ${metaText}`);
							const metaParts = metaText.split(new RegExp("\\s*·\\s*", ""));
							if (metaParts.length >= 1) {
								const dateMatch = metaParts[0].match(
									new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
								);
								if (dateMatch) {
									purchaseDate = dateMatch[0];
									console.log(`从meta中提取日期: ${purchaseDate}`);
								}
							}
							if (metaParts.length >= 2) {
								style = metaParts.slice(1).join(" · ");
								console.log(`从meta中提取款式: ${style}`);
							}
							if (purchaseDate && style) {
								break;
							}
						}
					} catch (e) {
						console.error(`meta选择器 ${selector} 出错:`, e);
					}
				}
				if (!purchaseDate) {
					const dateMatch = commentText.match(
						new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
					);
					if (dateMatch) {
						purchaseDate = dateMatch[0];
						console.log(`从文本中提取日期: ${purchaseDate}`);
					}
				}
				if (!style) {
					const extractedDetails = [
						commentText.match(new RegExp("规格[：:]\\s*([^，。,]+)", "")),
						commentText.match(new RegExp("颜色分类[：:]\\s*([^，。,]+)", "")),
						commentText.match(new RegExp("型号[：:]\\s*([^，。,]+)", "")),
						purchaseDate &&
							commentText.includes(purchaseDate) &&
							commentText
								.substring(
									commentText.indexOf(purchaseDate) + purchaseDate.length
								)
								.match(new RegExp("[^，。,:：]+", "")),
						commentText.match(
							new RegExp("左右排烟\\s*\\/\\s*天然气\\s*\\/\\s*([^，。,]+)", "")
						),
						commentText.match(new RegExp("([【\\[].+[】\\]])", "")),
						commentText.match(
							new RegExp("(\\d+m³\\/min\\s*[黑白金银铜灰色]+)", "")
						),
					];
					for (const detail of extractedDetails) {
						if (
							detail &&
							(detail[1] || detail[0]) &&
							(detail[1] || detail[0]).trim()
						) {
							style = (detail[1] || detail[0]).trim();
							console.log(`从文本中提取款式: ${style}`);
							break;
						}
					}
				}
				let content = "";
				const contentSelectors = [
					".content",
					".text",
					".comment",
					'div[class*="content"]',
					'span[class*="content"]',
					'div[class*="text"]',
					'span[class*="text"]',
					'div[class*="comment"]',
					'span[class*="comment"]',
				];
				for (const selector of contentSelectors) {
					try {
						const selectedElement = element.querySelector(selector);
						if (selectedElement && selectedElement.textContent.trim()) {
							content = selectedElement.textContent.trim();
							console.log(
								`从选择器 ${selector} 找到内容: ${content.substring(0, 50)}...`
							);
							break;
						}
					} catch (e) {
						console.error(`内容选择器 ${selector} 出错:`, e);
					}
				}
				if (!content) {
					content = commentText;
					if (userName) {
						content = content.replace(userName, "");
					}
					if (purchaseDate) {
						content = content.replace(purchaseDate, "");
					}
					if (style) {
						content = content.replace(style, "");
					}
					content = content
						.replace(new RegExp("有用\\s*\\(\\d+\\)", "g"), "")
						.replace(new RegExp("回复\\s*\\(\\d+\\)", "g"), "")
						.replace(new RegExp("举报", "g"), "")
						.replace(new RegExp("此用户没有填写评价", "g"), "")
						.replace(new RegExp("追加评论", "g"), "")
						.replace(new RegExp("评价方式：", "g"), "")
						.replace(new RegExp("评价时间：", "g"), "")
						.replace(new RegExp("购买时间：", "g"), "")
						.replace(new RegExp("\\s*·\\s*", "g"), "");
					content = content.trim();
					console.log(`从完整文本提取内容: ${content.substring(0, 50)}...`);
				}
				if (userName && content && content !== "此用户没有填写评价") {
					comments.push({
						userName: userName,
						purchaseDate: purchaseDate,
						purchaseSpec: style,
						content: content,
					});
					console.log(
						`成功提取第 ${index + 1} 条评论:`,
						userName,
						purchaseDate,
						style
					);
				} else {
					console.log(
						`跳过无效评论:`,
						userName,
						content.substring(0, 30) + "..."
					);
				}
			} catch (e) {
				console.error(`提取第 ${index + 1} 条评论时出错:`, e);
			}
		});
		console.log(`共提取到 ${comments.length} 条有效评论`);
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: `成功抓取 ${comments.length} 条评论`,
		});
		return comments;
	} catch (error) {
		console.error("从当前页面抓取评论出错:", error);
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "从当前页面抓取评论出错",
		});
		return [];
	}
}
function debugCommentElements() {
	console.log("===== 调试：查找页面中所有可能的评论相关元素 =====");
	console.log("--- 可能的评论按钮 ---");
	const commentButtons = [
		document.querySelector(".ShowButton--o4XEG7ih"),
		document.querySelector('div[class*="ShowButton"]'),
		Array.from(document.querySelectorAll("div")).find((el) =>
			el.textContent.includes("全部评价")
		),
		document.querySelector(".tabDetailItemTitle--_KkXcMDu"),
	];
	commentButtons.forEach((btn, index) => {
		if (btn) {
			console.log(`按钮 ${index + 1} 存在:`, btn.className, btn.textContent);
		} else {
			console.log(`按钮 ${index + 1} 不存在`);
		}
	});
	console.log("--- 可能的评论面板 ---");
	const commentPanels = [
		document.querySelector(".Comments--vOMSBfi2"),
		document.querySelector(".comments--vOMSBfi2"),
		document.querySelector(".beautify-scroll-bar"),
		document.querySelector('div[class*="Comments--"]'),
		document.querySelector("div.content--ew3Y4lVg"),
	];
	commentPanels.forEach((panel, index) => {
		if (panel) {
			console.log(`面板 ${index + 1} 存在:`, panel.className);
			const commentCount = panel.querySelectorAll(
				'.Comment--KkPcz74T, div[class*="Comment--"], .comment-item, div.contentWrapper--uAdAlCgC'
			).length;
			console.log(`面板 ${index + 1} 中包含 ${commentCount} 条评论`);
		} else {
			console.log(`面板 ${index + 1} 不存在`);
		}
	});
	console.log("--- 直接查找评论元素 ---");
	const commentSelectors = [
		".Comment--KkPcz74T",
		'div[class*="Comment--"]',
		".comment-item",
		"div.contentWrapper--uAdAlCgC",
	];
	commentSelectors.forEach((selector, index) => {
		try {
			const comments = document.querySelectorAll(selector);
			console.log(`选择器 ${selector} 找到 ${comments.length} 条评论`);
			if (comments.length > 0) {
				console.log(
					"第一条评论结构:",
					comments[0].outerHTML.substring(0, 200) + "..."
				);
			}
		} catch (e) {
			console.error(`选择器 ${selector} 出错:`, e);
		}
	});
	console.log("===== 调试结束 =====");
}
function findCommentsDirectly() {
	console.log("开始直接查找评论");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在直接查找评论...",
	});
	return new Promise((resolve) => {
		try {
			console.log("尝试查找leftDrawer容器");
			const leftDrawer = document.querySelector(
				'.leftDrawer--4H_p9fnt, div[class*="leftDrawer--"]'
			);
			if (leftDrawer) {
				console.log("找到leftDrawer容器");
				const commentsContainer = leftDrawer.querySelector(
					'.comments--vOMSBfi2.beautify-scroll-bar, div[class*="comments--"][class*="beautify-scroll-bar"], .comments--vOMSBfi2, div[class*="comments--"], .beautify-scroll-bar, div[class*="beautify-scroll"]'
				);
				if (commentsContainer) {
					console.log("找到评论容器:", commentsContainer.className);
					const commentsList = commentsContainer.querySelectorAll(
						'.Comment--KkPcz74T, div[class*="Comment--"]'
					);
					if (commentsList && commentsList.length > 0) {
						console.log(`在评论容器中找到 ${commentsList.length} 条评论元素`);
						const comments = extractComments(commentsContainer);
						if (comments && comments.length > 0) {
							console.log(`成功从评论容器提取 ${comments.length} 条评论`);
							chrome.runtime.sendMessage({
								action: "updateStatus",
								status: `成功抓取 ${comments.length} 条评论`,
							});
							resolve(comments);
							return;
						}
					} else {
						console.log(
							"在评论容器中未找到评论元素，尝试从整个leftDrawer中提取"
						);
					}
				} else {
					console.log(
						"在leftDrawer中未找到评论容器，尝试从整个leftDrawer中提取"
					);
				}
				const extractedComments = extractComments(leftDrawer);
				if (extractedComments && extractedComments.length > 0) {
					console.log(
						`成功从leftDrawer提取 ${extractedComments.length} 条评论`
					);
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: `成功抓取 ${extractedComments.length} 条评论`,
					});
					resolve(extractedComments);
					return;
				}
			} else {
				console.log("未找到leftDrawer容器，尝试查找其他可能的遮罩容器");
			}
			console.log("尝试查找其他可能的遮罩容器");
			const selectors = [
				".content--ew3Y4lVg",
				'div[class*="content--"]',
				".modal-content",
				".dialog-content",
				".popup-content",
				".overlay-content",
				".beautify-scroll-bar",
				'div[class*="beautify-scroll"]',
			];
			let overlay = null;
			for (const selector of selectors) {
				try {
					const container = document.querySelector(selector);
					if (container) {
						overlay = container;
						console.log(`找到遮罩容器: ${selector}`);
						break;
					}
				} catch (e) {
					console.error(`查找遮罩容器 ${selector} 出错:`, e);
				}
			}
			if (overlay) {
				console.log("从遮罩容器中提取评论");
				const comments = extractComments(overlay);
				if (comments && comments.length > 0) {
					console.log(`成功从遮罩容器中提取 ${comments.length} 条评论`);
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: `成功抓取 ${comments.length} 条评论`,
					});
					resolve(comments);
					return;
				}
			}
			console.log("从整个页面查找评论");
			const commentSelectors = [
				"div.用户评价",
				'div:has(> h2:contains("用户评价"))',
				'div[class*="rate"]',
				"div.tb-reviews",
				'div[class*="comment"]',
				'div[class*="Comment"]',
				'div[class*="review"]',
				'div[class*="Review"]',
				'div[class*="评价"]',
				'div[class*="评论"]',
			];
			let comments1 = [];
			for (const selector of commentSelectors) {
				try {
					if (selector.includes(":has(")) {
						const allDivs = document.querySelectorAll("div");
						for (const reviewContainer of allDivs) {
							const reviewHeader = reviewContainer.querySelector("h2");
							if (
								reviewHeader &&
								reviewHeader.textContent.includes("用户评价")
							) {
								console.log('找到包含"用户评价"标题的容器');
								const comments = extractComments(reviewContainer);
								if (comments && comments.length > 0) {
									console.log(
										`从包含"用户评价"标题的容器中提取到 ${comments.length} 条评论`
									);
									comments1 = comments1.concat(comments);
								}
							}
						}
					} else {
						const commentContainers = document.querySelectorAll(selector);
						if (commentContainers && commentContainers.length > 0) {
							console.log(
								`找到 ${commentContainers.length} 个评论容器: ${selector}`
							);
							for (const container of commentContainers) {
								const comments = extractComments(container);
								if (comments && comments.length > 0) {
									console.log(
										`从容器 ${selector} 中提取到 ${comments.length} 条评论`
									);
									comments1 = comments1.concat(comments);
								}
							}
						}
					}
				} catch (e) {
					console.error(`查找评论容器 ${selector} 出错:`, e);
				}
			}
			if (comments1.length > 0) {
				const uniqueComments = [];
				const commentSet = new Set();
				for (const comment of comments1) {
					const commentId = `${comment.userName}-${comment.content.substring(
						0,
						50
					)}`;
					if (!commentSet.has(commentId)) {
						commentSet.add(commentId);
						uniqueComments.push(comment);
					}
				}
				console.log(
					`从所有容器中共提取到 ${comments1.length} 条评论，去重后剩余 ${uniqueComments.length} 条`
				);
				if (uniqueComments.length > 0) {
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: `成功抓取 ${uniqueComments.length} 条评论`,
					});
					resolve(uniqueComments);
					return;
				}
			}
			console.log("尝试查找所有可能的评论元素");
			const allDivs = document.querySelectorAll("div");
			const filterDivs = Array.from(allDivs).filter((div) => {
				const content = div.textContent;
				const hasSpecialContent =
					content.includes("t**") ||
					content.match(new RegExp("[a-z]\\*\\*\\d*", "i"));
				const dateMatch = content.match(
					new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
				);
				return hasSpecialContent && dateMatch && content.length > 50;
			});
			console.log(`找到 ${filterDivs.length} 个可能的评论元素`);
			const comments = [];
			const commentContainer = new Set();
			filterDivs.forEach((element, index) => {
				try {
					console.log(
						`处理第 ${index + 1}/${filterDivs.length} 个可能的评论元素`
					);
					const commentText = element.textContent.trim();
					if (commentContainer.has(commentText)) {
						console.log(`跳过重复评论: ${commentText.substring(0, 30)}...`);
						return;
					}
					console.log(
						`评论 ${index + 1} 完整文本:`,
						commentText.substring(0, 100) +
							(commentText.length > 100 ? "..." : "")
					);
					let userName = "";
					const userSelectors = [
						'div[class*="userName"] span',
						".userName--mmxkxkd0 span",
						'div[class*="userName--"] span',
						".user-name span",
						".username span",
						".name span",
						'div[class*="userName"]',
						".userName--mmxkxkd0",
						'div[class*="userName--"]',
						".user-name",
						".username",
						".name",
					];
					for (const selector of userSelectors) {
						try {
							const selectedElement = element.querySelector(selector);
							if (selectedElement && selectedElement.textContent.trim()) {
								userName = selectedElement.textContent.trim();
								console.log(`从选择器 ${selector} 找到用户名: ${userName}`);
								break;
							}
						} catch (e) {
							console.error(`用户名选择器 ${selector} 出错:`, e);
						}
					}
					if (!userName) {
						const userMatch = commentText.match(
							new RegExp("[a-z]\\*\\*\\d+", "i")
						);
						if (userMatch) {
							userName = userMatch[0];
							console.log(`从文本中提取用户名: ${userName}`);
						}
					}
					let purchaseDate = "";
					let style = "";
					const metaSelectors = [
						'div[class*="meta"]',
						".meta--TDfRej2n",
						'div[class*="meta--"]',
						".date",
						".spec",
						'div[class*="date"]',
						'div[class*="spec"]',
						'span[class*="date"]',
						'span[class*="spec"]',
					];
					for (const selector of metaSelectors) {
						try {
							const metaInfo = element.querySelector(selector);
							if (metaInfo && metaInfo.textContent.trim()) {
								const metaText = metaInfo.textContent.trim();
								console.log(`从选择器 ${selector} 找到meta信息: ${metaText}`);
								const metaParts = metaText.split(new RegExp("\\s*·\\s*", ""));
								if (metaParts.length >= 1) {
									const dateMatch = metaParts[0].match(
										new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
									);
									if (dateMatch) {
										purchaseDate = dateMatch[0];
										console.log(`从meta中提取日期: ${purchaseDate}`);
									}
								}
								if (metaParts.length >= 2) {
									style = metaParts.slice(1).join(" · ");
									console.log(`从meta中提取款式: ${style}`);
								}
								if (purchaseDate && style) {
									break;
								}
							}
						} catch (e) {
							console.error(`meta选择器 ${selector} 出错:`, e);
						}
					}
					if (!purchaseDate) {
						const dateMatch = commentText.match(
							new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
						);
						if (dateMatch) {
							purchaseDate = dateMatch[0];
							console.log(`从文本中提取日期: ${purchaseDate}`);
						}
					}
					if (!style) {
						const extractedPatterns = [
							commentText.match(new RegExp("规格[：:]\\s*([^，。,]+)", "")),
							commentText.match(new RegExp("颜色分类[：:]\\s*([^，。,]+)", "")),
							commentText.match(new RegExp("型号[：:]\\s*([^，。,]+)", "")),
							purchaseDate &&
								commentText.includes(purchaseDate) &&
								commentText
									.substring(
										commentText.indexOf(purchaseDate) + purchaseDate.length
									)
									.match(new RegExp("[^，。,:：]+", "")),
							commentText.match(
								new RegExp(
									"左右排烟\\s*\\/\\s*天然气\\s*\\/\\s*([^，。,]+)",
									""
								)
							),
							commentText.match(new RegExp("([【\\[].+[】\\]])", "")),
							commentText.match(
								new RegExp("(\\d+m³\\/min\\s*[黑白金银铜灰色]+)", "")
							),
						];
						for (const pattern of extractedPatterns) {
							if (
								pattern &&
								(pattern[1] || pattern[0]) &&
								(pattern[1] || pattern[0]).trim()
							) {
								style = (pattern[1] || pattern[0]).trim();
								console.log(`从文本中提取款式: ${style}`);
								break;
							}
						}
					}
					let commentContent = "";
					const commentSelectors1 = [
						".content",
						".text",
						".comment",
						'div[class*="content"]',
						'span[class*="content"]',
						'div[class*="text"]',
						'span[class*="text"]',
						'div[class*="comment"]',
						'span[class*="comment"]',
					];
					for (const selector of commentSelectors1) {
						try {
							const selectedElement = element.querySelector(selector);
							if (selectedElement && selectedElement.textContent.trim()) {
								commentContent = selectedElement.textContent.trim();
								console.log(
									`从选择器 ${selector} 找到内容: ${commentContent.substring(
										0,
										50
									)}...`
								);
								break;
							}
						} catch (e) {
							console.error(`内容选择器 ${selector} 出错:`, e);
						}
					}
					if (!commentContent) {
						commentContent = commentText;
						if (userName) {
							commentContent = commentContent.replace(userName, "");
						}
						if (purchaseDate) {
							commentContent = commentContent.replace(purchaseDate, "");
						}
						if (style) {
							commentContent = commentContent.replace(style, "");
						}
						commentContent = commentContent
							.replace(new RegExp("有用\\s*\\(\\d+\\)", "g"), "")
							.replace(new RegExp("回复\\s*\\(\\d+\\)", "g"), "")
							.replace(new RegExp("举报", "g"), "")
							.replace(new RegExp("此用户没有填写评价", "g"), "")
							.replace(new RegExp("追加评论", "g"), "")
							.replace(new RegExp("评价方式：", "g"), "")
							.replace(new RegExp("评价时间：", "g"), "")
							.replace(new RegExp("购买时间：", "g"), "")
							.replace(new RegExp("\\s*·\\s*", "g"), "");
						commentContent = commentContent.trim();
						console.log(
							`从完整文本提取内容: ${commentContent.substring(0, 50)}...`
						);
					}
					if (
						userName &&
						commentContent &&
						commentContent !== "此用户没有填写评价"
					) {
						comments.push({
							userName: userName,
							purchaseDate: purchaseDate,
							purchaseSpec: style,
							content: commentContent,
						});
						commentContainer.add(commentText);
						console.log(
							`成功提取第 ${index + 1} 条评论:`,
							userName,
							purchaseDate,
							style
						);
					} else {
						console.log(
							`跳过无效评论:`,
							userName,
							commentContent.substring(0, 30) + "..."
						);
					}
				} catch (e) {
					console.error(`提取第 ${index + 1} 条评论时出错:`, e);
				}
			});
			console.log(`共提取到 ${comments.length} 条有效评论`);
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: `成功抓取 ${comments.length} 条评论`,
			});
			resolve(comments);
		} catch (error) {
			console.error("直接查找评论出错:", error);
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: "直接查找评论出错",
			});
			resolve([]);
		}
	});
}
