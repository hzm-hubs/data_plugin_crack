async function scrapeQuestions(maxAskNum) {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	console.log("开始抓取问题");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在抓取问题...",
	});
	maxAskNum = appInfo.tbAskNum || 100;
	try {
		console.log("尝试获取问题总数");
		let questionCount = maxAskNum;
		const selectors = ['[class*="askAnswerTitle--"]'];
		function parseCommentCount1(text) {
			console.log(`解析问题数量文本: "${text}"`);
			text = text.replace(new RegExp("\\s+", "g"), "");
			let questionCount1 = text.match(/问大家·(\d+)/);
			if (questionCount1) {
				const questionCount11 = questionCount1[1];
				console.log(`提取括号内容: "${questionCount11}"`);
				if (questionCount11.includes("万")) {
					console.log(
						`检测到"万"字，问题数量肯定超过${maxAskNum}，使用最大值 ${maxAskNum}`
					);
					return maxAskNum;
				}
				const num = parseInt(questionCount11, 10);
				if (!isNaN(num)) {
					console.log(`解析为数字: ${num}`);
					if (num >= maxAskNum) {
						console.log(
							`问题数量 ${num} >= ${maxAskNum}，使用最大值 ${maxAskNum}`
						);
						return maxAskNum;
					}
					return num;
				}
				if (questionCount11.includes("+")) {
					console.log(`检测到"+"号，问题数量可能很大，使用最大值 ${maxAskNum}`);
					return maxAskNum;
				}
			}
			const num = parseInt(text, 10);
			if (!isNaN(num)) {
				console.log(`直接解析为数字: ${num}`);
				if (num >= maxAskNum) {
					console.log(
						`问题数量 ${num} >= ${maxAskNum}，使用最大值 ${maxAskNum}`
					);
					return maxAskNum;
				}
				return num;
			}
			console.log(`无法解析问题数量，使用默认最大值: ${maxAskNum}`);
			return maxAskNum;
		}
		for (const selector of selectors) {
			try {
				if (selector.includes(":contains(")) {
					const spanElements = document.querySelectorAll("span");
					for (const spanElement of spanElements) {
						if (spanElement.textContent.includes("全部(")) {
							console.log(
								`找到可能包含问题数的元素: "${spanElement.textContent}"`
							);
							const count = parseCommentCount1(spanElement.textContent);
							if (count !== null) {
								questionCount = count;
								console.log(`成功解析问题总数: ${questionCount}`);
								break;
							}
						}
					}
				} else {
					const element = document.querySelector(selector);
					if (element) {
						console.log(`找到可能包含问题数的元素: "${element.textContent}"`);
						const count = parseCommentCount1(element.textContent);
						if (count !== null) {
							questionCount = count;
							console.log(
								`成功解析问题总数: ${questionCount} (从 ${selector})`
							);
							break;
						}
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		if (isNaN(questionCount) || questionCount <= 0) {
			questionCount = maxAskNum;
			console.log(`未找到有效的问题总数，使用默认值: ${maxAskNum}`);
		} else {
			console.log(`使用实际问题总数: ${questionCount}`);
		}
		const minQuestions = Math.min(questionCount, maxAskNum);
		console.log(`期望获取的问题数量: ${minQuestions}`);

		console.log('尝试点击"全部问答"按钮');
		const parseCommentCount = [
			'div[class*="bottomBtn--"]',
			'div:contains("全部问答")',
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
					const questionBtn = document.querySelector(selector);
					if (questionBtn) {
						parseCommentCount2 = questionBtn;
						console.log(`找到全部问答按钮:`, selector);
						break;
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		console.log("parseCommentCount2", parseCommentCount2);
		if (parseCommentCount2) {
			console.log('点击"全部问答"按钮');
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: '正在点击"全部问答"按钮...',
			});
			parseCommentCount2.click();
			console.log("等待问题面板加载");
			await new Promise((r) => setTimeout(r, 5000));
			console.log("查找leftDrawer容器");
			const leftDrawer = document.querySelector('div[class*="leftDrawer--"]');
			if (leftDrawer) {
				console.log("找到leftDrawer容器");
				const questionsContainer = leftDrawer.querySelector(
					'div[class*="ContentArea--"][class*="beautify-scroll-bar"], div[class*="ContentArea--"], .beautify-scroll-bar, div[class*="beautify-scroll"]'
				);
				if (questionsContainer) {
					console.log("找到问题容器:", questionsContainer.className);
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status: "正在加载问题...",
					});
					await loadAllQuestions(questionsContainer, minQuestions);
					let questions = extractQuestions(questionsContainer);
					if (questions && questions.length > minQuestions) {
						console.log(`问题数量超过期望值，截取前 ${minQuestions} 条`);
						questions = questions.slice(0, minQuestions);
					}
					if (questions && questions.length > 0) {
						console.log(
							`成功从问题容器提取 ${questions.length} 条问题 (总数: ${questionCount})`
						);
						closeQuestionOverlay();
						chrome.runtime.sendMessage({
							action: "updateStatus",
							status: `成功抓取 ${questions.length}/${questionCount} 条问题`,
						});
						return questions;
					} else {
						console.log("问题容器中没有找到问题，尝试从整个leftDrawer中提取");
						let questionsFromDrawer = extractQuestions(leftDrawer);
						if (
							questionsFromDrawer &&
							questionsFromDrawer.length > minQuestions
						) {
							console.log(`问题数量超过期望值，截取前 ${minQuestions} 条`);
							questionsFromDrawer = questionsFromDrawer.slice(0, minQuestions);
						}
						if (questionsFromDrawer && questionsFromDrawer.length > 0) {
							console.log(
								`成功从leftDrawer提取 ${questionsFromDrawer.length} 条问题 (总数: ${questionCount})`
							);
							closeQuestionOverlay();
							chrome.runtime.sendMessage({
								action: "updateStatus",
								status: `成功抓取 ${questionsFromDrawer.length}/${questionCount} 条问题`,
							});
							return questionsFromDrawer;
						}
					}
				} else {
					console.log(
						"在leftDrawer中未找到问题容器，尝试从整个leftDrawer中提取问题"
					);
					let questionsFromDrawer = extractQuestions(leftDrawer);
					if (
						questionsFromDrawer &&
						questionsFromDrawer.length > minQuestions
					) {
						console.log(`问题数量超过期望值，截取前 ${minQuestions} 条`);
						questionsFromDrawer = questionsFromDrawer.slice(0, minQuestions);
					}
					if (questionsFromDrawer && questionsFromDrawer.length > 0) {
						console.log(
							`成功从leftDrawer提取 ${questionsFromDrawer.length} 条问题 (总数: ${questionCount})`
						);
						closeQuestionOverlay();
						chrome.runtime.sendMessage({
							action: "updateStatus",
							status: `成功抓取 ${questionsFromDrawer.length}/${questionCount} 条问题`,
						});
						return questionsFromDrawer;
					}
				}
				closeQuestionOverlay();
			} else {
				console.log("未找到leftDrawer容器");
			}
		} else {
			console.log('未找到"全部问答"按钮，尝试直接查找问题');
		}

		console.log("尝试使用备用方法");
		let parseCommentCount4 = await scrapeQuestionsFromCurrentPage();
		if (parseCommentCount4 && parseCommentCount4.length > minQuestions) {
			console.log(`问题数量超过期望值，截取前 ${minQuestions} 条`);
			parseCommentCount4 = parseCommentCount4.slice(0, minQuestions);
		}
		if (parseCommentCount4 && parseCommentCount4.length > 0) {
			console.log(
				`成功使用备用方法提取 ${parseCommentCount4.length} 条问题 (总数: ${questionCount})`
			);
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: `成功抓取 ${parseCommentCount4.length}/${questionCount} 条问题`,
			});
			return parseCommentCount4;
		}
		console.log("所有方法都失败，无法提取问题");
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "无法抓取问题",
		});
		return [];
	} catch (error) {
		console.error("抓取问题时出错:", error);
		return [];
	}
}

function closeQuestionOverlay() {
	try {
		console.log("尝试关闭问题遮罩");
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
			console.log("已关闭问题遮罩");
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
							console.log("已关闭问题遮罩");
							return true;
						}
					} catch (e) {
						console.error(`在leftDrawer中查找关闭按钮 ${selector} 出错:`, e);
					}
				}
			}
			console.log("无法关闭问题遮罩");
			return false;
		}
	} catch (error) {
		console.error("关闭问题遮罩出错:", error);
		return false;
	}
}

function loadAllQuestions(questionsPanel, maxAskNum = 100) {
	return new Promise(async (resolve) => {
		console.log(`开始加载问题，最大数量: ${maxAskNum}`);
		if (!questionsPanel) {
			console.log("问题面板不存在，无法加载问题");
			resolve(0);
			return;
		}
		const maxScrollAttempts =
			maxAskNum > 1000 ? 200 : maxAskNum > 100 ? 20 : maxAskNum < 10 ? 5 : 20;
		console.log(`设置最大滚动尝试次数: ${maxScrollAttempts}`);
		let questionCount = 0;
		let scrollFailures = 0;
		const maxFails = 15;
		function getQuestions() {
			const selectors = ['div[class*="qaItem--"]', ".qaItem"];
			let questionElements = [];
			for (const selector of selectors) {
				try {
					const questionNodes = questionsPanel.querySelectorAll(selector);
					if (questionNodes && questionNodes.length > questionElements.length) {
						questionElements = Array.from(questionNodes);
					}
				} catch (e) {
					console.error(`选择器 ${selector} 查找问题元素出错:`, e);
				}
			}
			return questionElements;
		}
		function scrollHandler(attempt = 0) {
			const questions = getQuestions();
			const questionCount1 = questions.length;
			console.log(
				`滚动尝试 #${attempt}: 当前问题数量 ${questionCount1}/${maxAskNum}`
			);
			const hasNewQuestions = questionCount1 > questionCount;
			if (!hasNewQuestions && attempt > 10) {
				scrollFailures++;
				console.log(`连续 ${scrollFailures}/${maxFails} 次没有新问题`);
			} else {
				scrollFailures = 0;
			}
			questionCount = questionCount1;
			if (
				questionCount1 >= maxAskNum ||
				attempt >= maxScrollAttempts ||
				(scrollFailures >= maxFails && attempt > 50)
			) {
				if (questionCount1 >= maxAskNum) {
					console.log(`已达到目标问题数量: ${questionCount1}/${maxAskNum}`);
				} else {
					if (attempt >= maxScrollAttempts) {
						console.log(
							`已达到最大滚动尝试次数: ${attempt}/${maxScrollAttempts}`
						);
					} else {
						console.log(`连续 ${scrollFailures} 次没有新问题，停止滚动`);
					}
				}
				console.log(`最终问题数量: ${questionCount1}/${maxAskNum}`);
				resolve(questionCount1);
				return;
			}
			try {
				const scrollStart = questionsPanel.scrollTop;
				const scrollHeight = questionsPanel.scrollHeight;
				questionsPanel.scrollTop = questionsPanel.scrollHeight;
				if (questionsPanel.scrollTop === scrollStart && attempt % 5 === 0) {
					console.log("常规滚动无效，尝试使用其他滚动方法");
					questionsPanel.scrollBy(0, 500);
					if (questions.length > 0) {
						const lastComment = questions[questions.length - 1];
						lastComment.scrollIntoView({
							behavior: "smooth",
							block: "end",
						});
					}
				}
				console.log("滚动状态:", {
					beforeScrollTop: scrollStart,
					afterScrollTop: questionsPanel.scrollTop,
					beforeScrollHeight: scrollHeight,
					afterScrollHeight: questionsPanel.scrollHeight,
					scrollDelta: questionsPanel.scrollTop - scrollStart,
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

function extractQuestions(questionsPanel, bestSelector) {
	console.log("开始提取问题");
	const questionSelectors = ['div[class*="qaItem--"]', ".qaItem--"];
	let questions = [];
	bestSelector = "";
	if (questionsPanel) {
		for (const selector of questionSelectors) {
			try {
				const elements = questionsPanel.querySelectorAll(selector);
				if (elements && elements.length > 0) {
					if (elements.length > questions.length) {
						questions = Array.from(elements);
						bestSelector = selector;
						console.log(
							`在问题面板中使用选择器 ${selector} 找到 ${elements.length} 条问题 (当前最佳)`
						);
					} else {
						console.log(
							`在问题面板中使用选择器 ${selector} 找到 ${elements.length} 条问题`
						);
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		console.log(
			`最终使用选择器 ${bestSelector} 找到 ${questions.length} 条问题`
		);
		if (questions.length === 0) {
			console.log("在问题面板中未找到问题元素，尝试查找所有子元素");
			const childElements = questionsPanel.children;
			if (childElements && childElements.length > 0) {
				questions = Array.from(childElements).filter(
					(child) =>
						!child.className.includes("footer") &&
						!child.className.includes("loading") &&
						!child.className.includes("title")
				);
				console.log(
					`在问题面板中找到 ${questions.length} 个可能的问题元素(直接子元素)`
				);
			}
		}
		if (questions.length === 0) {
			console.log("尝试查找所有可能的div元素作为问题");
			const allDivs = questionsPanel.querySelectorAll("div");
			questions = Array.from(allDivs).filter((div) => {
				const rect = div.getBoundingClientRect();
				return rect.height > 50 && div.textContent.length > 50;
			});
			console.log(`找到 ${questions.length} 个可能的div问题元素`);
		}
	} else {
		for (const selector of questionSelectors) {
			try {
				const elements = document.querySelectorAll(selector);
				if (elements && elements.length > 0) {
					if (elements.length > questions.length) {
						questions = Array.from(elements);
						bestSelector = selector;
						console.log(
							`在文档中使用选择器 ${selector} 找到 ${elements.length} 条问题 (当前最佳)`
						);
					} else {
						console.log(
							`在文档中使用选择器 ${selector} 找到 ${elements.length} 条问题`
						);
					}
				}
			} catch (e) {
				console.error(`选择器 ${selector} 出错:`, e);
			}
		}
		console.log(
			`最终使用选择器 ${bestSelector} 找到 ${questions.length} 条问题`
		);
	}
	const extractedQuestions = [];
	const questionSet = new Set();
	questions.forEach((element, index) => {
		try {
			console.log(`处理第 ${index + 1}/${questions.length} 条问题`);
			const questionText = element.textContent.trim();
			if (questionSet.has(questionText)) {
				console.log(`跳过重复问题: ${questionText.substring(0, 30)}...`);
				return;
			}
			console.log(
				`问题 ${index + 1} 完整文本:`,
				questionText.substring(0, 100) +
					(questionText.length > 100 ? "..." : "")
			);
			let questionContent = "";
			const questionSelectors = [
				'div[class*="questionTitle--"] span',
				'div[class*="questionTitle--"] span',
				'div[class*="questionSection--"] span',
				'div[class*="question"]',
			];
			for (const selector of questionSelectors) {
				try {
					const quesElement = element.querySelector(selector);
					if (quesElement && quesElement.textContent.trim()) {
						questionContent = quesElement.textContent.trim();
						console.log(`从选择器 ${selector} 找到问题: ${questionContent}`);
						break;
					}
				} catch (e) {
					console.error(`问题选择器 ${selector} 出错:`, e);
				}
			}
			let answerList = [];
			const answerSelectors = ['div[class*="answerSection--"]'];
			for (const selector of answerSelectors) {
				try {
					const answerContainer = element.querySelector(selector);
					if (answerContainer) {
						const answerElements = answerContainer.querySelectorAll(
							'div[class*="answerItem--"]'
						);
						console.log(
							`从选择器 ${selector} 找到 ${answerElements.length} 条答案`
						);
						for (const ansElement of answerElements) {
							let answerImg =
								ansElement.querySelector('div[class*="userInfo--"] img') || "";
							if (answerImg) {
								answerImg = answerImg.src || "";
							}

							const answerName = findItemContent(
								'div[class*="userNick--"]',
								ansElement
							);

							const answerContent = findItemContent(
								'div[class*="initContent"] [class*="convertEmoji--"],div[class*="answerContent--"]',
								ansElement
							);

							// const dateMatch = questionText.match(
							// 	new RegExp("\\d{4}年\\d{1,2}月\\d{1,2}日", "")
							// );
							const answerMeta = findItemContent(
								'div[class*="answerMeta--"] span',
								ansElement
							);

							answerList.push({
								img: answerImg,
								name: answerName,
								content: answerContent,
								meta: answerMeta,
							});
						}
					}
				} catch (e) {
					console.error(`答案选择器 ${selector} 出错:`, e);
				}
			}

			if (questionContent) {
				extractedQuestions.push({
					// answerList,
					lastAnswer: answerList.length > 0 ? answerList[0].content : "",
					content: questionContent,
				});
				questionSet.add(questionText);
				console.log(`成功提取第 ${index + 1} 条问题:`, questionContent);
			} else {
				console.log(
					`跳过无效问题:`,
					questionContent,
					questionContent.substring(0, 30) + "..."
				);
			}
		} catch (e) {
			console.error(`提取第 ${index + 1} 条问题时出错:`, e);
		}
	});
	console.log(`共提取到 ${extractedQuestions.length} 条有效问题`);
	return extractedQuestions;
}

function scrapeQuestionsFromCurrentPage() {
	console.log("开始从当前页面抓取问题");
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "正在从当前页面抓取问题...",
	});
	try {
		console.log("尝试查找leftDrawer容器");
		const leftDrawer = document.querySelector('div[class*="leftDrawer--"]');
		if (leftDrawer) {
			console.log("找到leftDrawer容器");
			const questionsContainer = leftDrawer.querySelector(
				'div[class*="qaListContainer--"]'
			);
			if (questionsContainer) {
				console.log("找到问题容器:", questionsContainer.className);
				const questions1 = questionsContainer.querySelectorAll(
					'div[class*="qaItem--"]'
				);
				if (questions1 && questions1.length > 0) {
					console.log(`在问题容器中找到 ${questions1.length} 条问题元素`);
					const questions = extractQuestions(questionsContainer);
					if (questions && questions.length > 0) {
						console.log(`成功从问题容器提取 ${questions.length} 条问题`);
						return questions;
					}
				} else {
					console.log("在问题容器中未找到问题元素，尝试从整个leftDrawer中提取");
				}
			} else {
				console.log("在leftDrawer中未找到问题容器，尝试从整个leftDrawer中提取");
			}
			const extractedQuestions = extractQuestions(leftDrawer);
			if (extractedQuestions && extractedQuestions.length > 0) {
				console.log(`成功从leftDrawer提取 ${extractedQuestions.length} 条问题`);
				return extractedQuestions;
			}
		} else {
			console.log("未找到leftDrawer容器，尝试查找其他可能的遮罩容器");
		}
		console.log("尝试查找其他可能的遮罩容器");
		const maskSelectors = [
			'div[class*="AskAnswersWrap--"]',
			".beautify-scroll-bar",
			'div[class*="beautify-scroll-bar"]',
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
			console.log("从遮罩容器中提取问题");
			const questions = extractQuestions(maskContainer);
			if (questions && questions.length > 0) {
				console.log(`成功从遮罩容器中提取 ${questions.length} 条问题`);
				return questions;
			}
		}
		const questions = [];
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: `成功抓取 ${questions.length} 条问题`,
		});
		return questions;
	} catch (error) {
		console.error("从当前页面抓取问题出错:", error);
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "从当前页面抓取问题出错",
		});
		return [];
	}
}

function findItemContent(eleExpression, parentElement) {
	let result = "";
	try {
		const contentElement = parentElement.querySelector(eleExpression);
		if (contentElement) {
			result = contentElement.textContent.trim();
		}
	} catch (e) {
		console.error("查找内容元素出错:", eleExpression);
	}
	return result;
}
