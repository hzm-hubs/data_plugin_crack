document.addEventListener("DOMContentLoaded", function (dataType, domain) {
	// 配置信息
	const appInfo = generateAppInfo();
	console.log("默认设置项", appInfo);
	fetchAppInfo();
	let dataArray = [];
	dataType = "";
	domain = "";
	initFieldsForm(fieldsForm);
	let isLogin = false; // 是否登录过
	chrome.storage.local.get("isLogin", function (result) {
		if (result.isLogin) {
			isLogin = JSON.parse(result.isLogin) || false;
		}
		if (isLogin) {
			changeDisplay("controls", "remove");
			changeDisplay("result", "remove");
			setStatusContent("欢迎使用！");
			changeDisplay("settingBtnRow");
			changeDisplay("settingsPanel");
			fetchCurrentTabData();
		}
	});

	// 初始化表单
	function initFieldsForm(fieldsForm) {
		const fatherELe = document.getElementById("dataForm");
		console.log("生成设置页面表单", fatherELe);
		if (fatherELe) {
			console.log("生成设置页面表单");
			const childList = [];
			fieldsForm.forEach((group) => {
				const groupDiv = document.createElement("div");
				groupDiv.className = "settings-group";
				const groupTitle = document.createElement("div");
				groupTitle.className = "settings-group-title";
				groupTitle.textContent = group.groupName;
				groupDiv.appendChild(groupTitle);
				group.keys.forEach((field) => {
					const fieldDiv = document.createElement("div");
					fieldDiv.className = "settings-row";
					const label = document.createElement("label");
					label.textContent = field.label;
					label.className = "settings-label";
					const input = document.createElement("input");
					input.type = "text";
					input.id = field.key;
					input.className = "settings-input";
					input.value = appInfo[field.key] || field.default || "";
					fieldDiv.appendChild(label);
					fieldDiv.appendChild(input);
					groupDiv.appendChild(fieldDiv);
				});
				childList.push(groupDiv);
			});
			childList.forEach((child) => fatherELe.appendChild(child));
		}
	}

	function generateAppInfo() {
		return fieldsForm.reduce((acc, group) => {
			group.keys.forEach((field) => {
				acc[field.key] = field.default;
			});
			return acc;
		}, {});
	}

	// 设置初始值
	function setInitValue(targetId, value) {
		document.getElementById(targetId).value = value;
	}

	function fetchAppInfo() {
		chrome.storage.local.get("appInfo", function (result) {
			if (chrome.runtime.lastError) {
				console.log("读取 appInfo 失败", chrome.runtime.lastError);
			} else {
				for (let i in appInfo) {
					if (result.appInfo[i] === undefined) continue;
					appInfo[i] = result.appInfo[i];
					setInitValue(i, result.appInfo[i]);
				}
			}
		});
	}

	function changeDisplay(eleId = "", type = "add") {
		const targetEle = document.getElementById(eleId);
		if (type == "add") {
			targetEle.classList.add("hide-element");
		} else {
			targetEle.classList.remove("hide-element");
		}
	}

	function addListen(targetId, callBack = null, type = "click") {
		if (!document) {
			return;
		}
		switch (type) {
			case "change":
				document.getElementById(targetId).addEventListener("change", (e) => {
					callBack && callBack(e.target.value);
				});
				break;
			case "negation":
				document.getElementById(targetId).addEventListener("click", (e) => {
					callBack && callBack(e.target.value);
				});
				break;
			default: // click
				document.getElementById(targetId).addEventListener("click", (e) => {
					callBack && callBack(e);
				});
				break;
		}
	}
	function setStatusContent(text, type = "innerText") {
		const targetEle = document.getElementById("status");
		targetEle[type] = text;
	}
	function handleChange(key, value) {
		appInfo[key] = value;
		chrome.storage.local.set({
			appInfo,
		});
	}
	// 设置监听
	Object.keys(appInfo).map((it) =>
		addListen(it, (e) => handleChange(it, e), "change")
	);
	function saveSettings() {
		const cozeToken = document.getElementById("cozeToken").value.trim();
		if (!cozeToken) {
			return setStatusContent("请填写授权码");
		}
		const appId = document.getElementById("appId").value.trim();
		const feishuLink = document.getElementById("feishuLink").value.trim();
		const appKey = document.getElementById("appKey").value.trim();
		const dingdingLink = document.getElementById("dingdingLink").value.trim();

		if ((!appId && !feishuLink) && (!appKey && !dingdingLink)) {
			return setStatusContent("请填写飞书、钉钉设置");
		}

		changeDisplay("controls", "remove");
		changeDisplay("result", "remove");
		setStatusContent("欢迎使用！");
		changeDisplay("settingBtnRow");
		changeDisplay("settingsPanel");
		isLogin = true;
		chrome.storage.local.set({
			isLogin,
		});
	}
	document.getElementById("settingsBtn").addEventListener("click", function () {
		const triggerEle = document.getElementById("settingsBtn");
		const targetEle = document.getElementById("settingsPanel");
		if (targetEle.classList.contains("hide-element")) {
			targetEle.classList.remove("hide-element");
			triggerEle.innerText = "收起设置";
		} else {
			targetEle.classList.add("hide-element");
			triggerEle.innerText = "打开设置";
		}
	});
	document
		.getElementById("saveSettingsBtn")
		.addEventListener("click", function () {
			saveSettings();
		});
	function setPageTitle(domain) {
		const pageTitle = document.getElementById("pageTitle");
		if (domain === "myseller") {
			pageTitle.innerText = "千牛数据抓取";
			document.getElementById("exportBtn").style.display = "inline-block";
			document.getElementById("exportJsonBtn").style.display = "inline-block";
		} else if (domain == "one") {
			pageTitle.innerText = "万相台数据抓取";
			changeDisplay("exportBtn");
			changeDisplay("exportExcel", "remove");
		} else if (domain === "taobao" || domain === "tmall") {
			pageTitle.innerText = "淘宝数据抓取";
			document.getElementById("exportBtn").style.display = "inline-block";
			document.getElementById("exportJsonBtn").style.display = "inline-block";
		} else {
			if (domain === "douyin") {
				pageTitle.innerText = "抖音数据抓取";
				document.getElementById("exportBtn").style.display = "inline-block";
				document.getElementById("exportJsonBtn").style.display = "inline-block";
			} else {
				if (domain === "xiaohongshu") {
					pageTitle.innerText = "小红书数据抓取";
					document.getElementById("exportBtn").style.display = "inline-block";
					document.getElementById("exportJsonBtn").style.display =
						"inline-block";
				} else {
					pageTitle.innerText = "数聚通分析软件";
				}
			}
		}
	}
	function fetchCurrentTabData() {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			function (tabs) {
				const tabUrl = tabs[0].url;
				domain = "other";
				if (tabUrl.includes("myseller.taobao.com")) {
					domain = "myseller";
				} else if (tabUrl.includes("one.alimama.com")) {
					domain = "one";
				} else if (tabUrl.includes("taobao.com")) {
					domain = "taobao";
				} else {
					if (tabUrl.includes("tmall.com")) {
						domain = "tmall";
					} else {
						if (tabUrl.includes("douyin.com")) {
							domain = "douyin";
						} else {
							if (tabUrl.includes("xiaohongshu.com")) {
								domain = "xiaohongshu";
							}
						}
					}
				}
				setPageTitle(domain);
				const storedDataKey = "data_" + btoa(tabUrl);
				chrome.storage.local.get([storedDataKey], function (result) {
					if (result[storedDataKey] && result[storedDataKey].data) {
						console.log("从storage中获取到当前页面已保存的数据");
						dataType = result[storedDataKey].type;
						dataArray = result[storedDataKey].data;
						domain = result[storedDataKey].domain;
						setPageTitle(domain);
						displayDataByDomainAndType(domain, dataType, dataArray);
						if (result[storedDataKey].timestamp) {
							const fetchTime =
								result[storedDataKey].fetchTime ||
								new Date(result[storedDataKey].timestamp).toLocaleString();
							setStatusContent(
								statusText +
									` <span style="margin-left: 10px; font-size: 12px; color: #999;">(${fetchTime})</span>`,
								"innerHTML"
							);
						}
						return;
					}
					fetchData(tabs[0].id);
				});
			}
		);
	}
	function fetchData(tabId) {
		document.getElementById("result").innerText = "正在获取最新数据...";
		setStatusContent("正在抓取数据...");
		let intervalId = null;
		chrome.tabs.get(tabId, function (tab) {
			const isModal = tab.url.includes("modal_id=");
			const isUser = tab.url.includes("douyin.com/user/");
			const isSearch =
				tab.url.includes("douyin.com/search") ||
				tab.url.includes("douyin.com/discover/search");
			if (isModal) {
				setStatusContent("正在抓取视频详情，请稍候...");
				let dots = 0;
				intervalId = setInterval(() => {
					dots = (dots + 1) % 4;
					const dotStr = ".".repeat(dots);
					document.getElementById(
						"status"
					).innerText = `正在抓取视频详情，请稍候${dotStr}`;
				}, 1000);
			} else {
				if (isUser) {
					setStatusContent("正在抓取用户数据，可能需要一些时间，请稍候...");
					let dots = 0;
					intervalId = setInterval(() => {
						dots = (dots + 1) % 4;
						const dotStr = ".".repeat(dots);
						document.getElementById(
							"status"
						).innerText = `正在抓取用户数据，可能需要一些时间，请稍候${dotStr}`;
					}, 1000);
				} else {
					if (isSearch) {
						setStatusContent("正在抓取视频数据，最多抓取100个视频，请稍候...");
						let dots = 0;
						intervalId = setInterval(() => {
							dots = (dots + 1) % 4;
							const dotStr = ".".repeat(dots);
							document.getElementById(
								"status"
							).innerText = `正在抓取视频数据，最多抓取100个视频，请稍候${dotStr}`;
						}, 1000);
					}
				}
			}
		});
		chrome.tabs.sendMessage(
			tabId,
			{
				action: "getData",
				refresh: true,
			},
			function (response) {
				setStatusContent("正在抓取数据...");
				if (intervalId) {
					clearInterval(intervalId);
					intervalId = null;
				}
				if (chrome.runtime.lastError) {
					console.error("Chrome运行时错误:", chrome.runtime.lastError);
					document.getElementById("result").innerHTML = `
          <div class="error-message">
            <h3>无法获取数据</h3>
            <p>请确认当前页面为支持的页面类型</p>
            <p>错误详情: ${chrome.runtime.lastError.message || "未知错误"}</p>
          </div>
        `;
					setStatusContent("抓取失败");
					return;
				}
				if (!response || !response.data) {
					console.error("无效的响应:", response);
					document.getElementById("result").innerHTML = `
          <div class="error-message">
            <h3>返回数据无效</h3>
            <p>请刷新页面后重试</p>
          </div>
        `;
					setStatusContent("抓取失败");
					return;
				}
				domain = response.data.domain;
				dataType = response.data.type;
				dataArray = response.data.data;
				if (dataType === "video" && dataArray && dataArray.error) {
					console.error("视频数据抓取错误:", dataArray.message);
					document.getElementById("result").innerHTML = `
          <div class="error-message">
            <h3>视频数据抓取失败</h3>
            <p>${dataArray.message || "未知错误"}</p>
            <p>请确认当前页面包含视频详情弹窗</p>
          </div>
        `;
					setStatusContent("抓取失败");
					return;
				}
				const fetchTime =
					response.data.fetchTime || new Date().toLocaleString();
				setPageTitle(domain);
				displayDataByDomainAndType(domain, dataType, dataArray);
				setStatusContent(
					statusText +
						` <span style="margin-left: 10px; font-size: 12px; color: #999;">(${fetchTime})</span>`,
					"innerHTML"
				);
				chrome.tabs.query(
					{
						active: true,
						currentWindow: true,
					},
					function (tabs) {
						const tabUrl = tabs[0].url;
						const encodedUrl = "data_" + btoa(tabUrl);
						chrome.storage.local.set({
							storageKey: {
								domain: domain,
								type: dataType,
								data: dataArray,
								timestamp: new Date().getTime(),
								fetchTime: fetchTime,
								url: tabUrl,
							},
						});
					}
				);
			}
		);
	}
	document.getElementById("refreshBtn").addEventListener("click", function () {
		chrome.tabs.query(
			{
				active: true,
				currentWindow: true,
			},
			function (tabs) {
				fetchData(tabs[0].id);
			}
		);
	});
	document
		.getElementById("exportJsonBtn")
		.addEventListener("click", function () {
			if (dataArray) {
				chrome.tabs.query(
					{
						active: true,
						currentWindow: true,
					},
					function (tabs) {
						const tabUrl = tabs[0].url;
						const dataObj = {
							domain: domain,
							type: dataType,
							data: dataArray,
							url: tabUrl,
							fetchTime: new Date().toLocaleString(),
						};
						const currentDate = new Date();
						const filename = `${domain}_data_${currentDate.getFullYear()}${(
							currentDate.getMonth() + 1
						)
							.toString()
							.padStart(2, "0")}${currentDate
							.getDate()
							.toString()
							.padStart(2, "0")}_${currentDate
							.getHours()
							.toString()
							.padStart(2, "0")}${currentDate
							.getMinutes()
							.toString()
							.padStart(2, "0")}${currentDate
							.getSeconds()
							.toString()
							.padStart(2, "0")}.json`;
						const jsonData = JSON.stringify(dataObj, null, 2);
						const dataUrl =
							"data:application/json;charset=utf-8," +
							encodeURIComponent(jsonData);
						const downloadLink = document.createElement("a");
						downloadLink.setAttribute("href", dataUrl);
						downloadLink.setAttribute("download", filename);
						downloadLink.style.display = "none";
						document.body.appendChild(downloadLink);
						downloadLink.click();
						document.body.removeChild(downloadLink);
						document.getElementById(
							"status"
						).innerText = `已下载数据到 ${filename}`;
					}
				);
			} else {
				alert("没有可导出的数据");
			}
		});
	document.getElementById("exportBtn").addEventListener("click", function () {
		if (dataArray) {
			chrome.tabs.query(
				{
					active: true,
					currentWindow: true,
				},
				function (tabs, fetchTime) {
					const tabUrl = tabs[0].url;
					let domainName = domain;
					const storageKey = "data_" + btoa(tabUrl);
					chrome.storage.local.get([storageKey], function (result) {
						if (result[storageKey] && result[storageKey].fetchTime) {
							fetchTime = result[storageKey].fetchTime;
						} else {
							fetchTime = new Date().toLocaleString();
						}
						let exportData = {
							domain: domainName,
							type: dataType,
							data: dataArray,
							fetchTime: fetchTime,
							url: tabUrl,
						};
						if (!appInfo.feishuLink || !appInfo.dingdingLink) {
							alert("请先在设置中配置多维表格URL");
							changeDisplay("settingsPanel", "remove");
							return;
						}
						setStatusContent("正在导出数据到多维表格...");
						const workflowPayload = {
							parameters: {
								input: {
									data: exportData,
									app_id: appInfo.appId,
									documentLink: appInfo.documentLink,
									version: "1.5.3",
								},
							},
							workflow_id: "7505701175690477579",
						};
						fetch("https://api.coze.cn/v1/workflow/run", {
							method: "POST",
							headers: {
								Authorization: `Bearer ${appInfo.cozeToken}`,
								"Content-Type": "application/json",
							},
							body: JSON.stringify(workflowPayload),
						})
							.then((response) => {
								return response.json();
							})
							.then((backData) => {
								console.log("工作流API详细响应:", JSON.stringify(backData));
								if (backData.code !== 0) {
									if (backData.code == "700012006") {
										setStatusContent("授权码失效或格式有误");
									} else {
										setStatusContent(backData.msg);
									}
									return;
								}
								backData = JSON.parse(backData.data);
								setStatusContent(backData.msg);
							})
							.catch((error) => {
								console.error("调用工作流API失败:", error);
								setStatusContent("导出失败，请检查网络连接");
							});
					});
				}
			);
		} else {
			alert("没有可导出的数据");
		}
	});
	const splitString = (data, targetString) => {
		try {
			return data.split(targetString)[1].split("\n")[0];
		} catch {
			return data;
		}
	};
	document.getElementById("exportExcel").addEventListener("click", function () {
		if (dataArray) {
			setStatusContent("开始整理数据……");

			// 表内
			const xlsxHeads = ["计划名称", "计划ID", "目标投放比"];

			let csv = "";

			if (dataArray?.length) {
				dataArray.forEach((it, index) => {
					let itData = [];

					itData.push(splitString(it["宝贝信息"], "\n计划："));

					itData.push(splitString(it["宝贝信息"], "\n计划ID："));

					itData.push(splitString(it["出价方式"], "\n目标投产比:"));

					// if (it.timeData.pastHourPut) {
					//   it.timeData.pastHourPut?.forEach((hour) => {
					//     itData.push([...hour.value.map((it) => it.replace(",", ""))]);
					//   });
					// }

					if (it.timeData.pastHourDisplay?.length) {
						if (index == 0) {
							let phdHeads = it.timeData.pastHourDisplay.length;
							while (phdHeads > 0) {
								xlsxHeads.push(
									...[
										`过去第${phdHeads}小时展现(今)`,
										`过去第${phdHeads}小时展现(昨)`,
									]
								);
								phdHeads--;
							}
						}
						it.timeData.pastHourDisplay?.forEach((hour) => {
							itData.push([...hour.value.map((it) => it.replace(",", ""))]);
						});
					}
					if (it.timeData.pastDateDisplay?.length) {
						if (index == 0) {
							let pddHeads = it.timeData.pastDateDisplay.length;
							while (pddHeads > 0) {
								xlsxHeads.push(`过去第${pddHeads}天展现量`);
								pddHeads--;
							}
						}
						const tempValue = it.timeData.pastDateDisplay.map((it) =>
							it.value.replace(",", "")
						);
						itData.push([...tempValue]);
					}
					if (it.timeData.pastDatePut?.length) {
						if (index == 0) {
							let pdpHeads = it.timeData.pastDatePut.length;
							while (pdpHeads > 0) {
								xlsxHeads.push(`过去第${pdpHeads}天实际投产比`);
								pdpHeads--;
							}
						}
						const tempValue = it.timeData.pastDatePut.map((it) =>
							it.value.replace(",", "")
						);
						itData.push([...tempValue]);
					}
					if (index == 0) {
						csv += `${xlsxHeads.join(",")}\n`;
					}
					csv += `${itData.join(",")}\n`;
				});
			}

			// 触发下载
			setStatusContent("准备导出数据");
			const blob = new Blob(["\uFEFF" + csv], {
				type: "text/csv;charset=utf-8;",
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			const currentDate = new Date();
			const filename = `${domain}_data_${currentDate.getFullYear()}${(
				currentDate.getMonth() + 1
			)
				.toString()
				.padStart(2, "0")}${currentDate
				.getDate()
				.toString()
				.padStart(2, "0")}_${currentDate
				.getHours()
				.toString()
				.padStart(2, "0")}${currentDate
				.getMinutes()
				.toString()
				.padStart(2, "0")}${currentDate
				.getSeconds()
				.toString()
				.padStart(2, "0")}.csv`;
			a.download = filename;
			a.click();
			setStatusContent("表格数据导出成功!");
		} else {
			setStatusContent("没有可导出的数据");
		}
	});
	chrome.runtime.onMessage.addListener(function (
		message,
		sender,
		sendResponse
	) {
		console.log("收到消息:", message);
		if (message.action === "updateStatus") {
			console.log("更新状态文本:", message.status);
			const statusElement = document.getElementById("status");
			if (
				message.status.includes("评论面板") ||
				message.status.includes("抓取评论")
			) {
				const statusHTML = statusElement.innerHTML;
				const statusMatch = statusHTML.match(
					new RegExp(
						'<span style="margin-left: 10px; font-size: 12px; color: #999;">\\(.*?\\)<\\/span>',
						""
					)
				);
				const statusText = statusMatch ? statusMatch[0] : "";
				statusElement.innerHTML =
					message.status + (statusText ? " " + statusText : "");
			} else {
				statusElement.innerHTML = message.status;
			}
			return true;
		}
	});
});
function displayDataByDomainAndType(currentDomain, dataType, scrapedData) {
	if (currentDomain === "myseller") {
		if (dataType === "tableList") {
			displayTableData(scrapedData);
			statusText = `已抓取 <span id="item-count">${scrapedData.length}</span> 个商品`;
		} else {
			console.warn("未知的千牛数据类型:", dataType);
			document.getElementById("result").innerHTML = `
      <div class="error-message">
        <h3>无法显示数据</h3>
        <p>未知的千牛数据类型: ${dataType}</p>
      </div>
    `;
			statusText = "数据格式不支持";
		}
	}
	if (currentDomain === "one") {
		if (dataType === "tableList") {
			displayTableData(scrapedData);
			statusText = `已抓取 <span id="item-count">${scrapedData.length}</span> 个商品`;
		} else {
			console.warn("未知的万相台数据类型:", dataType);
			document.getElementById("result").innerHTML = `
      <div class="error-message">
        <h3>无法显示数据</h3>
        <p>未知的万相台数据类型: ${dataType}</p>
      </div>
    `;
			statusText = "数据格式不支持";
		}
	} else if (currentDomain === "taobao" || currentDomain === "tmall") {
		if (dataType === "search") {
			displayTaobaoSearchData(scrapedData);
			statusText = `已抓取 <span id="item-count">${scrapedData.length}</span> 个商品`;
		} else {
			if (dataType === "detail") {
				displayTaobaoDetailData(scrapedData);
				statusText = "已抓取淘宝商品详情";
			} else {
				console.warn("未知的淘宝/天猫数据类型:", dataType);
				document.getElementById("result").innerHTML = `
        <div class="error-message">
          <h3>无法显示数据</h3>
          <p>未知的淘宝/天猫数据类型: ${dataType}</p>
        </div>
      `;
				statusText = "数据格式不支持";
			}
		}
	} else {
		if (currentDomain === "douyin") {
			if (dataType === "search") {
				displayDouyinSearchData(scrapedData);
				statusText = `已抓取 <span id="item-count">${scrapedData.length}</span> 个视频`;
			} else {
				if (dataType === "user") {
					displayDouyinUserData(scrapedData);
					statusText = `已抓取抖音用户数据`;
				} else {
					if (dataType === "video") {
						if (scrapedData && scrapedData.error) {
							console.error("存储的视频数据包含错误:", scrapedData.message);
							document.getElementById("result").innerHTML = `
          <div class="error-message">
            <h3>视频数据存在问题</h3>
            <p>${scrapedData.message || "未知错误"}</p>
            <p>请刷新数据重试</p>
          </div>
        `;
							setStatusContent("数据有误");
							return;
						}
						displayDouyinVideoData(scrapedData);
						statusText = `已抓取抖音视频数据`;
					} else {
						console.warn("未知的抖音数据类型:", dataType);
						document.getElementById("result").innerHTML = `
        <div class="error-message">
          <h3>无法显示数据</h3>
          <p>未知的抖音数据类型: ${dataType}</p>
        </div>
      `;
						statusText = "数据格式不支持";
					}
				}
			}
		} else {
			if (currentDomain === "xiaohongshu") {
				if (dataType === "search") {
					displayXiaohongshuSearchData(scrapedData);
					statusText = `已抓取小红书笔记列表`;
				} else {
					if (dataType === "user") {
						displayXiaohongshuUserData(scrapedData);
						statusText = `已抓取小红书用户数据`;
					} else {
						if (dataType === "note") {
							if (scrapedData && scrapedData.error) {
								console.error("存储的笔记数据包含错误:", scrapedData.message);
								document.getElementById("result").innerHTML = `
          <div class="error-message">
            <h3>笔记数据存在问题</h3>
            <p>${scrapedData.message || "未知错误"}</p>
            <p>请刷新数据重试</p>
          </div>
        `;
								setStatusContent("数据有误");
								return;
							}
							displayXiaohongshuNoteData(scrapedData);
							statusText = `已抓取小红书笔记数据`;
						} else {
							console.warn("未知的小红书数据类型:", dataType);
							document.getElementById("result").innerHTML = `
        <div class="error-message">
          <h3>无法显示数据</h3>
          <p>未知的小红书数据类型: ${dataType}</p>
        </div>
      `;
							statusText = "数据格式不支持";
						}
					}
				}
			} else {
				console.warn("不支持域名，尝试通用显示:", currentDomain);
				if (Array.isArray(scrapedData)) {
					displayTaobaoSearchData(scrapedData);
					statusText = `已抓取 <span id="item-count">${scrapedData.length}</span> 个数据项`;
				} else {
					document.getElementById("result").innerHTML = `
        <div class="error-message">
          <h3>无法显示数据</h3>
          <p>不支持的域名: ${currentDomain}</p>
        </div>
      `;
					statusText = "数据格式不支持";
				}
			}
		}
	}
}
function displayTableData(list) {
	const resultContainer = document.getElementById("result");
	resultContainer.innerHTML = "";
	if (!list) {
		resultContainer.innerHTML = "<p>没有抓取到数据</p>";
		return;
	}
	if (!Array.isArray(list)) {
		console.error("displayTaobaoSearchData: 接收到非数组数据", list);
		if (typeof list === "object") {
			resultContainer.innerHTML = `
        <div class="error-message">
          <h3>收到非列表数据</h3>
          <p>数据类型: ${typeof list}</p>
          <p>数据内容: ${JSON.stringify(list).substring(0, 100)}...</p>
        </div>
      `;
		} else {
			resultContainer.innerHTML = "<p>收到的数据格式错误，不是列表类型</p>";
		}
		return;
	}
	if (list.length === 0) {
		resultContainer.innerHTML = "<p>没有抓取到数据</p>";
		return;
	}
	const itemCount = document.getElementById("item-count");
	if (itemCount) {
		itemCount.textContent = list.length;
	}
	list.forEach((item) => {
		const itemDiv = document.createElement("div");
		itemDiv.className = "item";
		itemDiv.innerHTML = `
      <div class="item-image">
        <img src="${item["商品图片"] || "images/no-image.png"}" alt="商品图片">
      </div>
      <div class="item-details">
        <div class="item-title">${item["宝贝信息"]}</div>
        <div class="item-meta">花费 ${item["花费"]}</div>
        <div class="item-meta">展现量: ${item["展现量"]}</div>
        <div class="item-link"><a href="${
					item["详情页"]
				}" target="_blank">查看详情</a></div>
      </div>
    `;
		resultContainer.appendChild(itemDiv);
	});
}
function displayTaobaoSearchData(items) {
	const resultContainer = document.getElementById("result");
	resultContainer.innerHTML = "";
	if (!items) {
		resultContainer.innerHTML = "<p>没有抓取到数据</p>";
		return;
	}
	if (!Array.isArray(items)) {
		console.error("displayTaobaoSearchData: 接收到非数组数据", items);
		if (typeof items === "object") {
			resultContainer.innerHTML = `
        <div class="error-message">
          <h3>收到非列表数据</h3>
          <p>数据类型: ${typeof items}</p>
          <p>数据内容: ${JSON.stringify(items).substring(0, 100)}...</p>
        </div>
      `;
		} else {
			resultContainer.innerHTML = "<p>收到的数据格式错误，不是列表类型</p>";
		}
		return;
	}
	if (items.length === 0) {
		resultContainer.innerHTML = "<p>没有抓取到数据</p>";
		return;
	}
	const itemCount = document.getElementById("item-count");
	if (itemCount) {
		itemCount.textContent = items.length;
	}
	items.forEach((item) => {
		const itemDiv = document.createElement("div");
		itemDiv.className = "item";
		itemDiv.innerHTML = `
      <div class="item-image">
        <img src="${item.image || "images/no-image.png"}" alt="商品图片">
      </div>
      <div class="item-details">
        <div class="item-title">${item.title}</div>
        <div class="item-meta">价格: ${item.price}</div>
        <div class="item-meta">销量: ${item.sales}</div>
        <div class="item-link"><a href="${
					item.link
				}" target="_blank">查看详情</a></div>
      </div>
    `;
		resultContainer.appendChild(itemDiv);
	});
}
function displayTaobaoDetailData(
	item,
	commentList,
	comments,
	itemDetail,
	commentList2
) {
	const resultElement = document.getElementById("result");
	resultElement.innerHTML = "";
	if (!item) {
		resultElement.innerHTML = "<p>没有抓取到数据</p>";
		return;
	}
	const detailDiv = document.createElement("div");
	detailDiv.className = "detail-item";
	commentList = "";
	if (item.coupons && item.coupons.length > 0) {
		commentList = '<div class="item-section"><h3>优惠券</h3><ul>';
		item.coupons.forEach((coupon) => {
			commentList += `<li>${coupon}</li>`;
		});
		commentList += "</ul></div>";
	}
	comments = "";
	if (item.images && item.images.length > 0) {
		comments =
			'<div class="item-section"><h3>商品图片</h3><div class="image-gallery">';
		item.images.forEach((imgSrc) => {
			comments += `<div class="gallery-image"><img src="${imgSrc}" alt="商品图片"></div>`;
		});
		comments += "</div></div>";
	}
	itemDetail = "";
	if (item.videoUrl) {
		itemDetail = `
      <div class="item-section">
        <h3>商品视频</h3>
        <div class="video-container">
          <video controls src="${item.videoUrl}" style="max-width:100%;"></video>
        </div>
      </div>
    `;
	}
	commentList2 = "";
	if (item.comments && item.comments.length > 0) {
		commentList2 = `
      <div class="item-section">
        <h3>用户评价 (${item.comments.length}条)</h3>
        <div class="comments-container">
          ${item.comments
						.map(
							(comment) => `
            <div class="comment-item">
              <div class="comment-header">
                <div class="comment-user">${comment.userName}</div>
                <div class="comment-meta">
                  <span class="comment-date">${comment.purchaseDate}</span>
                  ${
										comment.purchaseSpec
											? `<span class="comment-spec">${comment.purchaseSpec}</span>`
											: ""
									}
                </div>
              </div>
              <div class="comment-content">${comment.content}</div>
            </div>
          `
						)
						.join("")}
        </div>
      </div>
    `;
	}
	detailDiv.innerHTML = `
    <div class="detail-header">
      <div class="detail-image">
        <img src="${item.mainImage || "images/no-image.png"}" alt="商品主图">
      </div>
      <div class="detail-info">
        <h2 class="detail-title">${item.title}</h2>
        <div class="detail-price">
          <div class="price-item">优惠价: ¥${item.price.discount}</div>
          <div class="price-item original">原价: ¥${item.price.original}</div>
        </div>
        <div class="detail-meta">销量: ${item.sales}</div>
      </div>
    </div>
    
    ${commentList}
    
    <div class="item-section">
      <h3>配送信息</h3>
      <div class="shipping-info">
        <div>${item.shipping.info}</div>
        <div>${item.shipping.freight}</div>
        <div>发货地: ${item.shipping.fromAddr}</div>
      </div>
    </div>
    
    <div class="item-section">
      <h3>保障资质</h3>
      <div>${item.guarantee}</div>
    </div>
    
    <!-- 添加款式选项展示 -->
    ${
			item.skuOptions && item.skuOptions.length > 0
				? `
    <div class="item-section">
      <h3>款式选项</h3>
      <div class="sku-options-container">
        ${item.skuOptions
					.map(
						(skuType) => `
          <div class="sku-type">
            <div class="sku-type-name">${skuType.typeName}</div>
            ${
							skuType.options
								? `
              <div class="sku-options">
                ${skuType.options
									.map(
										(option) => `
                  <div class="sku-option ${!option.hasStock ? "disabled" : ""}">
                    ${
											option.imgUrl
												? `<div class="sku-option-image"><img src="${option.imgUrl}" alt="${option.text}"></div>`
												: ""
										}
                    <div class="sku-option-text">${option.text}</div>
                    ${
											!option.hasStock
												? '<div class="sku-option-status">缺货</div>'
												: ""
										}
                  </div>
                `
									)
									.join("")}
              </div>
            `
								: ""
						}
            ${
							skuType.stockStatus
								? `<div class="sku-stock-status">${skuType.stockStatus}</div>`
								: ""
						}
          </div>
        `
					)
					.join("")}
      </div>
    </div>
    `
				: ""
		}
    
    <!-- 添加参数信息(SKU)展示 -->
    ${
			item.sku && item.sku.keys && item.sku.keys.length > 0
				? `
    <div class="item-section">
      <h3>参数信息</h3>
      <div class="sku-info">
        <table class="sku-table">
          <tbody>
            ${item.sku.keys
							.map(
								(key, index) => `
              <tr>
                <td class="sku-key">${key}</td>
                <td class="sku-value">${item.sku.values[index] || ""}</td>
              </tr>
            `
							)
							.join("")}
          </tbody>
        </table>
      </div>
    </div>
    `
				: ""
		}
    
    ${commentList2}
    
    ${comments}
    
    ${itemDetail}
    
    <!-- 添加图文详情展示 -->
    ${
			item.detail &&
			(item.detail.content ||
				(item.detail.images && item.detail.images.length > 0))
				? `
    <div class="item-section">
      <h3>图文详情</h3>
      ${
				item.detail.content
					? `
        <div class="detail-content">
          ${item.detail.content
						.split("\n")
						.map((line) => {
							if (
								line.includes("公益宝贝") ||
								line.includes("送货入户") ||
								line.includes("预约安装")
							) {
								return `<h4 class="detail-section-title">${line}</h4>`;
							} else {
								return `<p>${line}</p>`;
							}
						})
						.join("")}
        </div>
      `
					: ""
			}
      ${
				item.detail.images && item.detail.images.length > 0
					? `
        <div class="detail-images">
          ${item.detail.images
						.map(
							(imgSrc) => `
            <div class="detail-image-item">
              <img src="${imgSrc}" alt="详情图片">
            </div>
          `
						)
						.join("")}
        </div>
      `
					: ""
			}
    </div>
    `
				: ""
		}
  `;
	resultElement.appendChild(detailDiv);
	const itemComments = document.createElement("style");
	itemComments.textContent = `
    .detail-item { padding: 15px; }
    .detail-header { display: flex; margin-bottom: 20px; }
    .detail-image { width: 200px; margin-right: 20px; }
    .detail-image img { width: 100%; border: 1px solid #eee; }
    .detail-info { flex: 1; }
    .detail-title { font-size: 18px; margin-bottom: 10px; }
    .detail-price { margin-bottom: 10px; }
    .price-item { font-size: 16px; color: #ff4400; }
    .price-item.original { color: #999; text-decoration: line-through; font-size: 14px; }
    .item-section { margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px; }
    .item-section h3 { margin-bottom: 10px; font-size: 16px; color: #333; }
    .shipping-info div { margin-bottom: 5px; }
    .image-gallery { display: flex; flex-wrap: wrap; }
    .gallery-image { width: 100px; height: 100px; margin: 5px; }
    .gallery-image img { width: 100%; height: 100%; object-fit: cover; border: 1px solid #ddd; }
    .sku-table { width: 100%; border-collapse: collapse; }
    .sku-table tr { border-bottom: 1px solid #f0f0f0; }
    .sku-table tr:last-child { border-bottom: none; }
    .sku-key { width: 30%; padding: 8px 5px; color: #666; font-size: 14px; }
    .sku-value { padding: 8px 5px; color: #333; font-size: 14px; }
    .detail-content { max-height: 200px; overflow-y: auto; margin-bottom: 15px; line-height: 1.5; color: #333; font-size: 14px; }
    .detail-images { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }
    .detail-image-item { width: 100%; }
    .detail-image-item img { width: 100%; max-width: 100%; height: auto; border: 1px solid #eee; }
    
    /* 款式选项样式 */
    .sku-options-container { margin-top: 10px; }
    .sku-type { margin-bottom: 15px; }
    .sku-type-name { font-weight: bold; margin-bottom: 8px; color: #333; }
    .sku-options { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 5px; }
    .sku-option { border: 1px solid #ddd; border-radius: 4px; padding: 5px 10px; display: flex; align-items: center; font-size: 13px; }
    .sku-option.selected { border-color: #ff4400; color: #ff4400; }
    .sku-option.disabled { border-color: #ccc; color: #999; background-color: #f5f5f5; position: relative; }
    .sku-option-image { width: 30px; height: 30px; margin-right: 5px; }
    .sku-option-image img { width: 100%; height: 100%; object-fit: cover; border-radius: 2px; }
    .sku-option-text { flex: 1; }
    .sku-option-status { font-size: 12px; color: #ff4400; margin-left: 5px; }
    .sku-stock-status { color: #009900; font-size: 13px; margin-top: 5px; }
    
    /* 评论样式 */
    .comments-container { max-height: 300px; overflow-y: auto; }
    .comment-item { border-bottom: 1px solid #f0f0f0; padding: 10px 0; }
    .comment-item:last-child { border-bottom: none; }
    .comment-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .comment-user { font-weight: bold; color: #333; }
    .comment-meta { color: #999; font-size: 12px; }
    .comment-date { margin-right: 10px; }
    .comment-spec { color: #666; }
    .comment-content { line-height: 1.5; color: #333; }
  `;
	document.head.appendChild(itemComments);
}
function displayDouyinSearchData(items) {
	const resultSection = document.getElementById("result");
	resultSection.innerHTML = "";
	if (!items || items.length === 0) {
		resultSection.innerText = "未找到视频数据";
		return;
	}
	console.log("显示抖音数据:", items);
	const dataTable = document.createElement("table");
	dataTable.className = "data-table";
	const tableHeader = document.createElement("thead");
	tableHeader.innerHTML = `
    <tr>
      <th>封面</th>
      <th>标题</th>
      <th>作者</th>
      <th>点赞数</th>
      <th>时长</th>
      <th>发布时间</th>
    </tr>
  `;
	dataTable.appendChild(tableHeader);
	const tableBody = document.createElement("tbody");
	items.forEach((item) => {
		const tableRow = document.createElement("tr");
		const coverCell = document.createElement("td");
		if (item.cover) {
			const imageElement = document.createElement("img");
			imageElement.src = item.cover;
			imageElement.alt = item.title || "视频";
			imageElement.style.width = "60px";
			imageElement.style.height = "60px";
			imageElement.style.objectFit = "cover";
			if (item.link) {
				imageElement.style.cursor = "pointer";
				imageElement.addEventListener("click", function () {
					chrome.tabs.create({
						url: item.link,
					});
				});
			}
			coverCell.appendChild(imageElement);
		} else {
			coverCell.innerText = "无封面";
		}
		const titleCell = document.createElement("td");
		titleCell.className = "title-cell";
		if (item.title) {
			const linkElement = document.createElement("a");
			linkElement.innerText = item.title;
			if (item.link) {
				linkElement.href = item.link;
				linkElement.target = "_blank";
			}
			titleCell.appendChild(linkElement);
		} else {
			titleCell.innerText = "无标题";
		}
		const authorCell = document.createElement("td");
		authorCell.innerText = item.author || "未知作者";
		const likes = document.createElement("td");
		likes.innerText = item.likes || "0";
		const duration = document.createElement("td");
		duration.innerText = item.duration || "";
		const pubTime = document.createElement("td");
		pubTime.innerText = item.publishTime || "";
		tableRow.appendChild(coverCell);
		tableRow.appendChild(titleCell);
		tableRow.appendChild(authorCell);
		tableRow.appendChild(likes);
		tableRow.appendChild(duration);
		tableRow.appendChild(pubTime);
		tableBody.appendChild(tableRow);
	});
	dataTable.appendChild(tableBody);
	resultSection.appendChild(dataTable);
}
function displayDouyinUserData(data) {
	const resultDiv = document.getElementById("result");
	resultDiv.innerHTML = "";
	if (!data) {
		resultDiv.innerText = "未找到用户数据";
		return;
	}
	console.log("显示抖音用户数据:", data);
	const userCard = document.createElement("div");
	userCard.className = "user-info";
	userCard.style.display = "flex";
	userCard.style.marginBottom = "20px";
	userCard.style.padding = "15px";
	userCard.style.backgroundColor = "#f9f9f9";
	userCard.style.borderRadius = "8px";
	if (data.avatar) {
		const avatarDiv = document.createElement("div");
		avatarDiv.style.marginRight = "15px";
		const avatarImg = document.createElement("img");
		avatarImg.src = data.avatar;
		avatarImg.alt = data.username;
		avatarImg.style.width = "80px";
		avatarImg.style.height = "80px";
		avatarImg.style.borderRadius = "50%";
		avatarImg.style.objectFit = "cover";
		avatarDiv.appendChild(avatarImg);
		userCard.appendChild(avatarDiv);
	}
	const userDetail = document.createElement("div");
	userDetail.style.flex = "1";
	if (data.username) {
		const userDiv = document.createElement("div");
		userDiv.style.fontSize = "18px";
		userDiv.style.fontWeight = "bold";
		userDiv.style.marginBottom = "5px";
		userDiv.innerText = data.username;
		userDetail.appendChild(userDiv);
	}
	if (data.verified) {
		const userInfo1 = document.createElement("div");
		userInfo1.style.fontSize = "14px";
		userInfo1.style.color = "#666";
		userInfo1.style.marginBottom = "5px";
		userInfo1.innerText = data.verified;
		userDetail.appendChild(userInfo1);
	}
	if (data.userId) {
		const userDiv = document.createElement("div");
		userDiv.style.fontSize = "14px";
		userDiv.style.color = "#666";
		userDiv.style.marginBottom = "5px";
		userDiv.innerText = `抖音号：${data.userId}`;
		userDetail.appendChild(userDiv);
	}
	if (data.location || data.age || data.gender) {
		if (data.location) {
			const ipLocation = document.createElement("div");
			ipLocation.style.fontSize = "14px";
			ipLocation.style.color = "#666";
			ipLocation.style.marginBottom = "5px";
			ipLocation.innerText = `IP属地：${data.location}`;
			userDetail.appendChild(ipLocation);
		}
		if (data.gender || data.age) {
			const userInfo1 = document.createElement("div");
			userInfo1.style.fontSize = "14px";
			userInfo1.style.color = "#666";
			userInfo1.style.marginBottom = "5px";
			if (data.gender) {
				const genderIcon = document.createElement("span");
				if (data.gender === "female") {
					genderIcon.innerHTML =
						'<svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><g stroke="#F5588E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.2" cy="4.896" r="3.25"></circle><path d="M1.617 10.511l3.115-3.115M1.904 7.396l2.828 2.829"></path></g></svg>';
					genderIcon.appendChild(document.createTextNode("女"));
				} else {
					if (data.gender === "male") {
						genderIcon.innerHTML =
							'<svg width="12" height="12" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" style="margin-right: 4px; display: inline-block; vertical-align: middle;"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 1.25a.75.75 0 0 0 0 1.5h1.09L7.54 4.298a.757.757 0 0 0-.058.066 4 4 0 1 0 .968 1.112.752.752 0 0 0 .15-.117L10.25 3.71V5a.75.75 0 0 0 1.5 0V2a.75.75 0 0 0-.75-.75H8zM5 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" fill="#168EF9"></path></svg>';
						genderIcon.appendChild(document.createTextNode("男"));
					}
				}
				userInfo1.appendChild(genderIcon);
				if (data.age) {
					userInfo1.appendChild(document.createTextNode(" "));
				}
			}
			if (data.age) {
				const ageText = document.createTextNode(`${data.age}岁`);
				userInfo1.appendChild(ageText);
			}
			userDetail.appendChild(userInfo1);
		}
	}
	if (data.description) {
		const descriptionDiv = document.createElement("div");
		descriptionDiv.style.fontSize = "14px";
		descriptionDiv.style.marginBottom = "10px";
		descriptionDiv.innerText = data.description;
		userDetail.appendChild(descriptionDiv);
	}
	const userStats = document.createElement("div");
	userStats.style.display = "flex";
	userStats.style.gap = "15px";
	const followingCount = document.createElement("span");
	followingCount.innerText = `关注：${data.following || "0"}`;
	const followers = document.createElement("span");
	followers.innerText = `粉丝：${data.followers || "0"}`;
	const likes = document.createElement("span");
	likes.innerText = `获赞：${data.likes || "0"}`;
	const postCount = document.createElement("span");
	postCount.innerText = `作品：${data.postCount || "0"}`;
	userStats.appendChild(followingCount);
	userStats.appendChild(followers);
	userStats.appendChild(likes);
	userStats.appendChild(postCount);
	userDetail.appendChild(userStats);
	userCard.appendChild(userDetail);
	resultDiv.appendChild(userCard);
	const userDetail2 = document.createElement("h3");
	userDetail2.innerText = "用户作品";
	userDetail2.style.marginTop = "20px";
	resultDiv.appendChild(userDetail2);
	if (!data.videos || data.videos.length === 0) {
		const errorDiv = document.createElement("div");
		errorDiv.innerText = "未找到作品数据";
		resultDiv.appendChild(errorDiv);
		return;
	}
	const userInfo = document.createElement("table");
	userInfo.className = "data-table";
	const userInfo2 = document.createElement("thead");
	userInfo2.innerHTML = `
    <tr>
      <th>封面</th>
      <th>标题</th>
      <th>点赞数</th>
      <th>时长</th>
      <th>发布时间</th>
    </tr>
  `;
	userInfo.appendChild(userInfo2);
	const userData = document.createElement("tbody");
	data.videos.forEach((video) => {
		const videoRow = document.createElement("tr");
		const coverCell = document.createElement("td");
		if (video.cover) {
			const videoImg = document.createElement("img");
			videoImg.src = video.cover;
			videoImg.alt = video.title;
			videoImg.style.width = "60px";
			videoImg.style.height = "60px";
			videoImg.style.objectFit = "cover";
			if (video.link) {
				videoImg.style.cursor = "pointer";
				videoImg.addEventListener("click", function () {
					chrome.tabs.create({
						url: video.link,
					});
				});
			}
			coverCell.appendChild(videoImg);
		}
		const titleCell = document.createElement("td");
		titleCell.className = "title-cell";
		if (video.title) {
			const videoContainer = document.createElement("div");
			videoContainer.style.display = "flex";
			videoContainer.style.alignItems = "center";
			if (video.isTop) {
				const tag = document.createElement("span");
				tag.style.fontSize = "12px";
				tag.style.backgroundColor = "rgb(250, 206, 21)";
				tag.style.color = "#000";
				tag.style.padding = "2px 4px";
				tag.style.borderRadius = "2px";
				tag.style.marginRight = "5px";
				tag.innerText = "置顶";
				videoContainer.appendChild(tag);
			}
			const videoLink = document.createElement("a");
			videoLink.innerText = video.title;
			if (video.link) {
				videoLink.href = video.link;
				videoLink.target = "_blank";
			}
			videoContainer.appendChild(videoLink);
			titleCell.appendChild(videoContainer);
		}
		const likesCell = document.createElement("td");
		likesCell.innerText = video.likes || "";
		const duration = document.createElement("td");
		duration.innerText = video.duration || "";
		const publishCell = document.createElement("td");
		publishCell.innerText = video.publishTime || "";
		videoRow.appendChild(coverCell);
		videoRow.appendChild(titleCell);
		videoRow.appendChild(likesCell);
		videoRow.appendChild(duration);
		videoRow.appendChild(publishCell);
		userData.appendChild(videoRow);
	});
	userInfo.appendChild(userData);
	resultDiv.appendChild(userInfo);
}
function displayDouyinVideoData(data) {
	const resultContainer = document.getElementById("result");
	resultContainer.innerHTML = "";
	if (!data) {
		resultContainer.innerHTML =
			'<div class="error-message">无法获取视频数据</div>';
		return;
	}
	if (data.error) {
		resultContainer.innerHTML = `<div class="error-message">${
			data.message || "无法获取视频数据"
		}</div>`;
		return;
	}
	console.log("展示抖音视频数据", data);
	const videoContainer = document.createElement("div");
	videoContainer.className = "video-detail-container";
	const videoInfo = document.createElement("div");
	videoInfo.className = "video-basic-info";
	if (data.post.coverImage) {
		const coverImg = document.createElement("img");
		coverImg.src = data.post.coverImage;
		coverImg.className = "video-cover";
		coverImg.alt = data.post.title || "视频封面";
		videoInfo.appendChild(coverImg);
	}
	const videoInfo2 = document.createElement("div");
	videoInfo2.className = "video-text-info";
	if (data.post.title) {
		const videoTitle = document.createElement("h2");
		videoTitle.className = "video-title";
		videoTitle.textContent = data.post.title;
		videoInfo2.appendChild(videoTitle);
	}
	if (data.author.name) {
		const authorInfo = document.createElement("div");
		authorInfo.className = "author-info";
		const authorLink = document.createElement("a");
		authorLink.href =
			data.author.link || `https://www.douyin.com/user/${data.author.id}`;
		authorLink.className = "author-name";
		authorLink.textContent = data.author.name;
		authorLink.target = "_blank";
		authorInfo.appendChild(authorLink);
		if (data.author.id) {
			const authorSpan = document.createElement("span");
			authorSpan.className = "author-id";
			authorSpan.textContent = `抖音ID: ${data.author.id}`;
			authorInfo.appendChild(authorSpan);
		}
		videoInfo2.appendChild(authorInfo);
	}
	if (data.post.publishTime) {
		const publishTimeDiv = document.createElement("div");
		publishTimeDiv.className = "publish-time";
		publishTimeDiv.textContent = `发布时间: ${data.post.publishTime}`;
		videoInfo2.appendChild(publishTimeDiv);
	}
	if (data.post.description) {
		const videoDesc = document.createElement("div");
		videoDesc.className = "video-description";
		videoDesc.textContent = data.post.description;
		videoInfo2.appendChild(videoDesc);
	}
	if (data.post.tags && data.post.tags.length > 0) {
		const tagsDiv = document.createElement("div");
		tagsDiv.className = "video-tags";
		for (const tag of data.post.tags) {
			const tagSpan = document.createElement("span");
			tagSpan.className = "tag";
			tagSpan.textContent = tag;
			tagsDiv.appendChild(tagSpan);
		}
		videoInfo2.appendChild(tagsDiv);
	}
	if (data.post.duration) {
		const durationDiv = document.createElement("div");
		durationDiv.className = "video-duration";
		durationDiv.innerHTML = `<span class="duration-label">时长:</span> <span class="duration-value">${data.post.duration}</span>`;
		videoInfo2.appendChild(durationDiv);
	}
	if (data.post.musicInfo) {
		const musicDiv = document.createElement("div");
		musicDiv.className = "video-music";
		musicDiv.innerHTML = `<span class="music-label">音乐:</span> <span class="music-value">${data.post.musicInfo}</span>`;
		videoInfo2.appendChild(musicDiv);
	}
	videoInfo.appendChild(videoInfo2);
	const videoStats = document.createElement("div");
	videoStats.className = "video-stats";
	const videoStats2 = [
		{
			label: "点赞",
			value: data.interactions.likes,
		},
		{
			label: "评论",
			value: data.interactions.comments,
		},
		{
			label: "收藏",
			value: data.interactions.favorites,
		},
		{
			label: "分享",
			value: data.interactions.shares,
		},
	];
	for (const stat of videoStats2) {
		if (stat.value) {
			const statDiv = document.createElement("div");
			statDiv.className = "stat-item";
			statDiv.innerHTML = `<span class="stat-label">${stat.label}:</span> <span class="stat-value">${stat.value}</span>`;
			videoStats.appendChild(statDiv);
		}
	}
	const videoLink = document.createElement("div");
	videoLink.className = "video-link-container";
	if (data.post.id) {
		const videoIdDiv = document.createElement("div");
		videoIdDiv.className = "video-id";
		videoIdDiv.textContent = `视频ID: ${data.post.id}`;
		videoLink.appendChild(videoIdDiv);
	}
	if (data.post.link) {
		const videoLink1 = document.createElement("a");
		videoLink1.href = data.post.link;
		videoLink1.className = "video-link";
		videoLink1.textContent = "打开视频页面";
		videoLink1.target = "_blank";
		videoLink.appendChild(videoLink1);
	}
	videoContainer.appendChild(videoInfo);
	videoContainer.appendChild(videoStats);
	videoContainer.appendChild(videoLink);
	resultContainer.appendChild(videoContainer);
	if (data.mediaContent[0].url) {
		const videoSection = document.createElement("div");
		videoSection.className = "video-url-section";
		videoSection.style.marginTop = "20px";
		videoSection.style.paddingTop = "10px";
		videoSection.style.borderTop = "1px solid #eee";
		const videoTitle = document.createElement("h3");
		videoTitle.textContent = "视频地址";
		videoSection.appendChild(videoTitle);
		const urlContainer = document.createElement("div");
		urlContainer.className = "video-url-container";
		const videoLink1 = document.createElement("a");
		videoLink1.href = data.mediaContent[0].url;
		videoLink1.className = "video-url-link";
		videoLink1.textContent = "打开视频源文件";
		videoLink1.target = "_blank";
		videoLink1.style.display = "inline-block";
		videoLink1.style.padding = "8px 16px";
		videoLink1.style.backgroundColor = "#1890ff";
		videoLink1.style.color = "white";
		videoLink1.style.textDecoration = "none";
		videoLink1.style.borderRadius = "4px";
		videoLink1.style.marginRight = "10px";
		const downloadLink = document.createElement("a");
		downloadLink.href = data.mediaContent[0].url;
		downloadLink.className = "video-download-link";
		downloadLink.textContent = "下载视频";
		downloadLink.download = `douyin_video_${
			data.post.id || new Date().getTime()
		}.mp4`;
		downloadLink.style.display = "inline-block";
		downloadLink.style.padding = "8px 16px";
		downloadLink.style.backgroundColor = "#52c41a";
		downloadLink.style.color = "white";
		downloadLink.style.textDecoration = "none";
		downloadLink.style.borderRadius = "4px";
		urlContainer.appendChild(videoLink1);
		urlContainer.appendChild(downloadLink);
		const videoUrl = document.createElement("div");
		videoUrl.className = "video-url-text";
		videoUrl.textContent = data.mediaContent[0].url;
		videoUrl.style.marginTop = "10px";
		videoUrl.style.padding = "10px";
		videoUrl.style.backgroundColor = "#f5f5f5";
		videoUrl.style.borderRadius = "4px";
		videoUrl.style.wordBreak = "break-all";
		videoUrl.style.fontSize = "12px";
		urlContainer.appendChild(videoUrl);
		videoSection.appendChild(urlContainer);
		resultContainer.appendChild(videoSection);
	}
	if (data.commentsList && data.commentsList.length > 0) {
		const commentTitle = document.createElement("h3");
		commentTitle.textContent = `评论 (${data.commentsList.length})`;
		commentTitle.style.marginTop = "20px";
		commentTitle.style.paddingTop = "10px";
		commentTitle.style.borderTop = "1px solid #eee";
		resultContainer.appendChild(commentTitle);
		const commentsDiv = document.createElement("div");
		commentsDiv.className = "comments-container";
		commentsDiv.style.maxHeight = "300px";
		commentsDiv.style.overflowY = "auto";
		data.commentsList.forEach((comment) => {
			const commentDiv = document.createElement("div");
			commentDiv.className = "comment-item";
			commentDiv.style.padding = "10px";
			commentDiv.style.marginBottom = "10px";
			commentDiv.style.borderBottom = "1px solid #f0f0f0";
			const commentHeader = document.createElement("div");
			commentHeader.style.display = "flex";
			commentHeader.style.justifyContent = "space-between";
			commentHeader.style.marginBottom = "5px";
			const userName = document.createElement("div");
			userName.className = "comment-username";
			userName.textContent = comment.userName;
			userName.style.fontWeight = "bold";
			commentHeader.appendChild(userName);
			commentDiv.appendChild(commentHeader);
			const commentBody = document.createElement("div");
			commentBody.className = "comment-content";
			commentBody.textContent = ` ： ${comment.content}`;
			commentBody.style.marginBottom = "5px";
			commentDiv.appendChild(commentBody);
			const commentMeta = document.createElement("div");
			commentMeta.className = "comment-meta";
			commentMeta.style.fontSize = "12px";
			commentMeta.style.color = "#999";
			commentMeta.style.marginRight = "10px";
			let metaInfo = "";
			if (comment.date) {
				metaInfo += comment.date;
			}
			if (comment.location) {
				metaInfo += comment.location ? ` · ${comment.location}` : "";
			}
			commentMeta.textContent = metaInfo;
			commentDiv.appendChild(commentMeta);
			if (comment.likes) {
				const likesDiv = document.createElement("div");
				likesDiv.className = "comment-likes";
				likesDiv.textContent = `👍 ${comment.likes}`;
				likesDiv.style.fontSize = "12px";
				likesDiv.style.color = "#999";
				commentDiv.appendChild(likesDiv);
			}
			commentsDiv.appendChild(commentDiv);
		});
		resultContainer.appendChild(commentsDiv);
	}
}
function displayXiaohongshuSearchData(items) {
	const resultDiv = document.getElementById("result");
	resultDiv.innerHTML = "";
	if (!items || items.length === 0) {
		resultDiv.innerText = "未找到笔记数据";
		return;
	}
	console.log("显示小红书数据:", items);
	const notesContainer = document.createElement("div");
	notesContainer.className = "notes-grid";
	notesContainer.style.display = "grid";
	notesContainer.style.gridTemplateColumns =
		"repeat(auto-fill, minmax(180px, 1fr))";
	notesContainer.style.gap = "16px";
	notesContainer.style.padding = "16px";
	items.forEach((item) => {
		const noteCard = document.createElement("div");
		noteCard.className = "note-card";
		noteCard.style.backgroundColor = "#fff";
		noteCard.style.borderRadius = "12px";
		noteCard.style.overflow = "hidden";
		noteCard.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
		noteCard.style.transition = "all 0.3s ease";
		noteCard.style.cursor = "pointer";
		noteCard.onmouseover = () => {
			noteCard.style.transform = "translateY(-4px)";
			noteCard.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.12)";
		};
		noteCard.onmouseout = () => {
			noteCard.style.transform = "translateY(0)";
			noteCard.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
		};
		if (item.link) {
			noteCard.onclick = () => {
				chrome.tabs.create({
					url: item.link,
				});
			};
		}
		const coverArea = document.createElement("div");
		coverArea.style.position = "relative";
		coverArea.style.paddingTop = "100%";
		coverArea.style.backgroundColor = "#f5f5f5";
		if (item.cover) {
			const coverImage = document.createElement("img");
			coverImage.src = item.cover;
			coverImage.alt = item.title || "笔记封面";
			coverImage.style.position = "absolute";
			coverImage.style.top = "0";
			coverImage.style.left = "0";
			coverImage.style.width = "100%";
			coverImage.style.height = "100%";
			coverImage.style.objectFit = "cover";
			coverArea.appendChild(coverImage);
		}
		const noteContent = document.createElement("div");
		noteContent.style.padding = "12px";
		if (item.title) {
			const noteTitle = document.createElement("div");
			noteTitle.className = "note-title";
			noteTitle.textContent = item.title;
			noteTitle.style.fontSize = "14px";
			noteTitle.style.fontWeight = "bold";
			noteTitle.style.marginBottom = "10px";
			noteTitle.style.display = "-webkit-box";
			noteTitle.style.webkitLineClamp = "2";
			noteTitle.style.webkitBoxOrient = "vertical";
			noteTitle.style.overflow = "hidden";
			noteTitle.style.lineHeight = "1.4";
			noteContent.appendChild(noteTitle);
		}
		const authorInfo = document.createElement("div");
		authorInfo.style.display = "flex";
		authorInfo.style.alignItems = "center";
		authorInfo.style.fontSize = "12px";
		authorInfo.style.color = "#999";
		authorInfo.style.marginBottom = "8px";
		if (item.authorAvatar) {
			const avatar = document.createElement("div");
			avatar.style.width = "20px";
			avatar.style.height = "20px";
			avatar.style.marginRight = "6px";
			avatar.style.borderRadius = "50%";
			avatar.style.overflow = "hidden";
			avatar.style.flexShrink = "0";
			const avatarImg = document.createElement("img");
			avatarImg.src = item.authorAvatar;
			avatarImg.alt = item.author || "作者头像";
			avatarImg.style.width = "100%";
			avatarImg.style.height = "100%";
			avatarImg.style.objectFit = "cover";
			avatar.appendChild(avatarImg);
			authorInfo.appendChild(avatar);
		}
		if (item.author) {
			const authorSpan = document.createElement("span");
			authorSpan.textContent = item.author;
			authorSpan.style.flex = "1";
			authorSpan.style.overflow = "hidden";
			authorSpan.style.textOverflow = "ellipsis";
			authorSpan.style.whiteSpace = "nowrap";
			authorInfo.appendChild(authorSpan);
		}
		noteContent.appendChild(authorInfo);
		const noteStats = document.createElement("div");
		noteStats.style.display = "flex";
		noteStats.style.alignItems = "center";
		noteStats.style.fontSize = "12px";
		noteStats.style.color = "#999";
		if (item.likes) {
			const likeIcon = document.createElement("span");
			likeIcon.innerHTML = `<span style="color: #ff2442;">♥</span> ${item.likes}`;
			likeIcon.style.marginRight = "12px";
			noteStats.appendChild(likeIcon);
		}
		if (item.collects) {
			const collectSpan = document.createElement("span");
			collectSpan.innerHTML = `<span style="color: #ffc107;">★</span> ${item.collects}`;
			collectSpan.style.marginRight = "12px";
			noteStats.appendChild(collectSpan);
		}
		if (item.publishTime) {
			const timeSpan = document.createElement("span");
			timeSpan.textContent = item.publishTime;
			timeSpan.style.flex = "1";
			timeSpan.style.textAlign = "right";
			noteStats.appendChild(timeSpan);
		}
		noteContent.appendChild(noteStats);
		noteCard.appendChild(coverArea);
		noteCard.appendChild(noteContent);
		notesContainer.appendChild(noteCard);
	});
	resultDiv.appendChild(notesContainer);
}
function displayXiaohongshuUserData(data) {
	const resultDiv = document.getElementById("result");
	resultDiv.innerHTML = "";
	if (!data) {
		resultDiv.innerText = "未找到用户数据";
		return;
	}
	console.log("显示小红书用户数据:", data);
	const userInfo = document.createElement("div");
	userInfo.className = "user-info";
	userInfo.style.display = "flex";
	userInfo.style.marginBottom = "20px";
	userInfo.style.padding = "24px";
	userInfo.style.backgroundColor = "#f9f9f9";
	userInfo.style.borderRadius = "16px";
	userInfo.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
	const avatarContainer = document.createElement("div");
	avatarContainer.style.marginRight = "24px";
	avatarContainer.style.textAlign = "center";
	if (data.avatar) {
		const avatarContainer = document.createElement("div");
		avatarContainer.style.width = "100px";
		avatarContainer.style.height = "100px";
		avatarContainer.style.marginBottom = "12px";
		avatarContainer.style.position = "relative";
		const avatarImg1 = document.createElement("img");
		avatarImg1.src = data.avatar;
		avatarImg1.alt = data.username || "用户头像";
		avatarImg1.style.width = "100%";
		avatarImg1.style.height = "100%";
		avatarImg1.style.borderRadius = "50%";
		avatarImg1.style.objectFit = "cover";
		avatarImg1.style.border = "3px solid #ff2442";
		avatarContainer.appendChild(avatarImg1);
	}
	userInfo.appendChild(avatarContainer);
	const userDetails = document.createElement("div");
	userDetails.style.flex = "1";
	const userInfoHeader = document.createElement("div");
	userInfoHeader.style.display = "flex";
	userInfoHeader.style.alignItems = "center";
	userInfoHeader.style.marginBottom = "12px";
	const username = document.createElement("div");
	username.style.fontSize = "24px";
	username.style.fontWeight = "bold";
	username.style.marginRight = "12px";
	username.innerText = data.username;
	userInfoHeader.appendChild(username);
	if (data.verified) {
		const infoBox = document.createElement("div");
		infoBox.style.fontSize = "14px";
		infoBox.style.color = "#ff2442";
		infoBox.style.padding = "2px 8px";
		infoBox.style.backgroundColor = "rgba(255, 36, 66, 0.1)";
		infoBox.style.borderRadius = "4px";
		infoBox.innerText = data.verified;
		userInfoHeader.appendChild(infoBox);
	}
	userDetails.appendChild(userInfoHeader);
	const userId = document.createElement("div");
	userId.style.fontSize = "13px";
	userId.style.color = "#666";
	userId.style.marginBottom = "8px";
	userId.innerText = data.userId;
	userDetails.appendChild(userId);
	const description = document.createElement("div");
	description.style.fontSize = "14px";
	description.style.marginBottom = "16px";
	description.style.lineHeight = "1.6";
	description.style.color = "#333";
	description.style.whiteSpace = "pre-wrap";
	description.innerText = data.description;
	userDetails.appendChild(description);
	const infoTags = document.createElement("div");
	infoTags.style.display = "flex";
	infoTags.style.alignItems = "center";
	infoTags.style.flexWrap = "wrap";
	infoTags.style.gap = "8px";
	infoTags.style.marginBottom = "12px";
	const addTag = (text, color = "#666") => {
		if (!text) {
			return;
		}
		const spanElement = document.createElement("span");
		spanElement.style.fontSize = "12px";
		spanElement.style.color = color;
		spanElement.style.padding = "2px 8px";
		spanElement.style.backgroundColor = "#f5f5f5";
		spanElement.style.borderRadius = "4px";
		spanElement.innerText = text;
		infoTags.appendChild(spanElement);
	};
	if (data.gender) {
		const genderTag =
			data.gender === "female"
				? "👩 女"
				: data.gender === "male"
				? "👨 男"
				: data.gender;
		addTag(genderTag);
	}
	if (data.age) {
		addTag(`${data.age}`);
	}
	if (data.constellation) {
		addTag(`✨ ${data.constellation}`);
	}
	if (data.location) {
		addTag(`📍 ${data.location}`);
	}
	if (data.ipLocation) {
		addTag(`🌐 ${data.ipLocation}`);
	}
	userDetails.appendChild(infoTags);
	const statsDiv = document.createElement("div");
	statsDiv.style.display = "flex";
	statsDiv.style.gap = "32px";
	statsDiv.style.paddingRight = "16px";
	statsDiv.style.marginTop = "16px";
	const stats = [
		{
			label: "关注",
			value: data.following || "0",
		},
		{
			label: "粉丝",
			value: data.followers || "0",
		},
		{
			label: "获赞",
			value: data.likes || "0",
		},
		{
			label: "笔记",
			value: data.postCount || "0",
		},
	];
	stats.forEach((item) => {
		const itemDiv = document.createElement("div");
		itemDiv.style.textAlign = "center";
		const itemValue = document.createElement("div");
		itemValue.style.fontSize = "20px";
		itemValue.style.fontWeight = "bold";
		itemValue.style.color = "#333";
		itemValue.style.marginBottom = "4px";
		itemValue.innerText = item.value;
		const itemLabel = document.createElement("div");
		itemLabel.style.fontSize = "13px";
		itemLabel.style.color = "#999";
		itemLabel.innerText = item.label;
		itemDiv.appendChild(itemValue);
		itemDiv.appendChild(itemLabel);
		statsDiv.appendChild(itemDiv);
	});
	userDetails.appendChild(statsDiv);
	userInfo.appendChild(userDetails);
	resultDiv.appendChild(userInfo);
	const avatarImg = document.createElement("h3");
	avatarImg.innerText = "用户笔记";
	avatarImg.style.margin = "24px 0 16px";
	avatarImg.style.fontSize = "18px";
	avatarImg.style.fontWeight = "bold";
	avatarImg.style.color = "#333";
	resultDiv.appendChild(avatarImg);
	if (!data.notes || data.notes.length === 0) {
		const notFoundMsg = document.createElement("div");
		notFoundMsg.innerText = "未找到笔记数据";
		notFoundMsg.style.textAlign = "center";
		notFoundMsg.style.color = "#999";
		notFoundMsg.style.padding = "32px";
		notFoundMsg.style.backgroundColor = "#f8f8f8";
		notFoundMsg.style.borderRadius = "12px";
		resultDiv.appendChild(notFoundMsg);
		return;
	}
	const avatarImg2 = document.createElement("div");
	avatarImg2.className = "notes-grid";
	avatarImg2.style.display = "grid";
	avatarImg2.style.gridTemplateColumns =
		"repeat(auto-fill, minmax(180px, 1fr))";
	avatarImg2.style.gap = "16px";
	avatarImg2.style.padding = "0 16px";
	data.notes.forEach((note) => {
		const noteCard = document.createElement("div");
		noteCard.className = "note-card";
		noteCard.style.backgroundColor = "#fff";
		noteCard.style.borderRadius = "12px";
		noteCard.style.overflow = "hidden";
		noteCard.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
		noteCard.style.transition = "all 0.3s ease";
		noteCard.style.cursor = "pointer";
		noteCard.onmouseover = () => {
			noteCard.style.transform = "translateY(-4px)";
			noteCard.style.boxShadow = "0 4px 16px rgba(0, 0, 0, 0.12)";
		};
		noteCard.onmouseout = () => {
			noteCard.style.transform = "translateY(0)";
			noteCard.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.08)";
		};
		if (note.link) {
			noteCard.onclick = () => {
				chrome.tabs.create({
					url: note.link,
				});
			};
		}
		const coverWrapper = document.createElement("div");
		coverWrapper.style.position = "relative";
		coverWrapper.style.paddingTop = "100%";
		coverWrapper.style.backgroundColor = "#f5f5f5";
		if (note.cover) {
			const coverImg = document.createElement("img");
			coverImg.src = note.cover;
			coverImg.alt = note.title || "笔记封面";
			coverImg.style.position = "absolute";
			coverImg.style.top = "0";
			coverImg.style.left = "0";
			coverImg.style.width = "100%";
			coverImg.style.height = "100%";
			coverImg.style.objectFit = "cover";
			coverWrapper.appendChild(coverImg);
		}
		const noteBody = document.createElement("div");
		noteBody.style.padding = "12px";
		if (note.title) {
			const noteDiv = document.createElement("div");
			noteDiv.style.display = "flex";
			noteDiv.style.alignItems = "flex-start";
			noteDiv.style.marginBottom = "8px";
			if (note.isTop) {
				const highlight = document.createElement("span");
				highlight.style.fontSize = "12px";
				highlight.style.backgroundColor = "rgb(250, 206, 21)";
				highlight.style.color = "#000";
				highlight.style.padding = "2px 4px";
				highlight.style.borderRadius = "4px";
				highlight.style.marginRight = "6px";
				highlight.style.flexShrink = "0";
				highlight.innerText = "置顶";
				noteDiv.appendChild(highlight);
			}
			const noteTitle = document.createElement("div");
			noteTitle.className = "note-title";
			noteTitle.textContent = note.title;
			noteTitle.style.fontSize = "14px";
			noteTitle.style.fontWeight = "bold";
			noteTitle.style.display = "-webkit-box";
			noteTitle.style.webkitLineClamp = "2";
			noteTitle.style.webkitBoxOrient = "vertical";
			noteTitle.style.overflow = "hidden";
			noteTitle.style.lineHeight = "1.4";
			noteTitle.style.flex = "1";
			noteDiv.appendChild(noteTitle);
			noteBody.appendChild(noteDiv);
		}
		if (note.authorAvatar || note.author) {
			const noteContainer = document.createElement("div");
			noteContainer.style.display = "flex";
			noteContainer.style.alignItems = "center";
			noteContainer.style.marginBottom = "8px";
			if (note.authorAvatar) {
				const avatarContainer = document.createElement("div");
				avatarContainer.style.width = "20px";
				avatarContainer.style.height = "20px";
				avatarContainer.style.marginRight = "6px";
				avatarContainer.style.borderRadius = "50%";
				avatarContainer.style.overflow = "hidden";
				avatarContainer.style.flexShrink = "0";
				const avatarImg1 = document.createElement("img");
				avatarImg1.src = note.authorAvatar;
				avatarImg1.alt = note.author || "作者头像";
				avatarImg1.style.width = "100%";
				avatarImg1.style.height = "100%";
				avatarImg1.style.objectFit = "cover";
				avatarContainer.appendChild(avatarImg1);
				noteContainer.appendChild(avatarContainer);
			}
			if (note.author) {
				const authorSpan = document.createElement("span");
				authorSpan.textContent = note.author;
				authorSpan.style.fontSize = "12px";
				authorSpan.style.color = "#999";
				authorSpan.style.flex = "1";
				authorSpan.style.overflow = "hidden";
				authorSpan.style.textOverflow = "ellipsis";
				authorSpan.style.whiteSpace = "nowrap";
				noteContainer.appendChild(authorSpan);
			}
			noteBody.appendChild(noteContainer);
		}
		const noteInfo = document.createElement("div");
		noteInfo.style.display = "flex";
		noteInfo.style.alignItems = "center";
		noteInfo.style.fontSize = "12px";
		noteInfo.style.color = "#999";
		if (note.likes) {
			const likeSpan = document.createElement("span");
			likeSpan.innerHTML = `<span style="color: #ff2442;">♥</span> ${note.likes}`;
			likeSpan.style.marginRight = "12px";
			noteInfo.appendChild(likeSpan);
		}
		if (note.collects) {
			const starSpan = document.createElement("span");
			starSpan.innerHTML = `<span style="color: #ffc107;">★</span> ${note.collects}`;
			starSpan.style.marginRight = "12px";
			noteInfo.appendChild(starSpan);
		}
		if (note.publishTime) {
			const spanElement = document.createElement("span");
			spanElement.textContent = note.publishTime;
			spanElement.style.flex = "1";
			spanElement.style.textAlign = "right";
			noteInfo.appendChild(spanElement);
		}
		noteBody.appendChild(noteInfo);
		noteCard.appendChild(coverWrapper);
		noteCard.appendChild(noteBody);
		avatarImg2.appendChild(noteCard);
	});
	resultDiv.appendChild(avatarImg2);
}
function displayXiaohongshuNoteData(data) {
	const resultContainer = document.getElementById("result");
	resultContainer.innerHTML = "";
	if (!data) {
		resultContainer.innerText = "未找到笔记数据";
		return;
	}
	console.log("显示小红书笔记数据:", data);
	const noteContainer = document.createElement("div");
	noteContainer.className = "note-detail-container";
	const authorInfo = document.createElement("div");
	authorInfo.className = "note-author-info";
	authorInfo.innerHTML = `
        <img class="note-author-avatar" src="${
					data.author.avatar || ""
				}" alt="${data.author.name || ""}">
        <div class="note-author-details">
            <div class="note-author-name">${data.author.name || ""}</div>
            ${
							data.author.id
								? `<div class="note-author-id">ID: ${data.author.id}</div>`
								: ""
						}
        </div>
    `;
	noteContainer.appendChild(authorInfo);
	const noteContent = document.createElement("div");
	noteContent.className = "note-content";
	noteContent.innerHTML = `
        <div class="note-title">${data.post.title || ""}</div>
        <div class="note-description">${data.post.description || ""}</div>
    `;
	noteContainer.appendChild(noteContent);
	const noteStats = document.createElement("div");
	noteStats.className = "note-stats";
	noteStats.innerHTML = `
        <div class="note-stat-item">
            <span class="note-stat-icon">👍</span>
            <span>${data.interactions?.likes || 0} 赞</span>
        </div>
        <div class="note-stat-item">
            <span class="note-stat-icon">💬</span>
            <span>${data.interactions?.comments || 0} 评论</span>
        </div>
        <div class="note-stat-item">
            <span class="note-stat-icon">⭐</span>
            <span>${data.interactions?.favorites || 0} 收藏</span>
        </div>
    `;
	noteContainer.appendChild(noteStats);
	if (data.post.tags && data.post.tags.length > 0) {
		const tagList = document.createElement("div");
		tagList.className = "note-tags";
		tagList.innerHTML = data.post.tags
			.map((tag) => `<span class="tag">${tag}</span>`)
			.join("");
		noteContainer.appendChild(tagList);
	}
	if (data.commentsList && data.commentsList.length > 0) {
		const commentsContainer = document.createElement("div");
		commentsContainer.className = "comments-container";
		commentsContainer.innerHTML = `<div class="comments-title">评论 (${data.commentsList.length})</div>`;
		const commentsList = document.createElement("div");
		commentsList.className = "comments-list";
		data.commentsList.forEach((comment) => {
			const commentDiv = document.createElement("div");
			commentDiv.className = "comment-item";
			commentDiv.innerHTML = `
                <img class="comment-avatar" src="${
									comment.avatar || ""
								}" alt="${comment.userName || ""}">
                <div class="comment-content">
                    <div class="comment-author">
                        <span class="comment-author-name">${
													comment.userName || ""
												}</span>
                        ${
													comment.isAuthor
														? '<span class="comment-author-tag">作者</span>'
														: ""
												}
                    </div>
                    <div class="comment-text">${comment.content || ""}</div>
                    <div class="comment-meta">
                        <span>${comment.date || ""}</span>
                        ${
													comment.location
														? `<span class="comment-location">${comment.location}</span>`
														: ""
												}
                        <span>👍 ${comment.likes || "0"}</span>
                    </div>
                </div>
            `;
			commentsList.appendChild(commentDiv);
		});
		commentsContainer.appendChild(commentsList);
		noteContainer.appendChild(commentsContainer);
	}
	resultContainer.appendChild(noteContainer);
}
