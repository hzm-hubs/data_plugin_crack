async function scrapeDouyinSearchData() {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	console.log("开始抓取抖音搜索页数据...");
	const _0x51407b = window.location.href;
	let _0x2e0b2d = "searchGeneral";
	if (_0x51407b.includes("type=general")) {
		_0x2e0b2d = "searchGeneral";
	} else if (_0x51407b.includes("type=video")) {
		_0x2e0b2d = "searchVideo";
	}
	const maxSearchNum = appInfo.dySearchListNum || 100;
	class _0x55664f {
		constructor(_0x28cfac) {
			this.type = _0x28cfac;
			this.videoListContainer = undefined;
		}
		async getData(_0x11a7f2 = 100) {
			if (this.type === "searchGeneral") {
				this.videoListContainerSelector = "div#waterFallScrollContainer";
				this.videoListContainer = document.querySelector(
					this.videoListContainerSelector
				);
				console.log("视频综合容器:", this.videoListContainer);
				return await this.scrapeGeneral(_0x11a7f2);
			} else if (this.type === "searchVideo") {
				this.videoListContainerSelector =
					'div#search-result-container>div[style*="display: block"]:nth-child(2)';
				this.videoListContainer = document.querySelector(
					this.videoListContainerSelector + '>ul[data-e2e="scroll-list"]'
				);
				console.log("视频列表容器:", this.videoListContainer);
				if (!this.videoListContainer) {
					console.log("未找到视频列表容器，尝试其他选择器...");
					const _0x4eb598 = [
						'ul[data-e2e="scroll-list"]',
						'ul[class*="gZq36zrh"]',
						'ul[class*="PAjzsG5a"]',
						".search-result-container > ul",
						'div[data-e2e="search-result-container"] > ul',
					];
					for (const _0x54b3d8 of _0x4eb598) {
						const _0x33bd78 = document.querySelector(_0x54b3d8);
						if (_0x33bd78) {
							console.log("找到容器，使用选择器: " + _0x54b3d8);
							this.videoListContainer = _0x33bd78;
							break;
						}
					}
				}
				return await this.scrapeVideos(_0x11a7f2);
			}
		}
		async scrapeGeneral(
			_0x25897c = 100,
			_0x3c45e8 = [],
			_0x4da5fa = 0,
			_0x4ed0e9 = 10
		) {
			let _0x25334c = false;
			const _0x4381c3 = document.querySelectorAll(
				this.videoListContainerSelector + ">div:last-child"
			);
			for (const _0x612d74 of _0x4381c3) {
				if (utils.getTextNodeValue(_0x612d74).includes("暂时没有更多了")) {
					console.log('检测到"暂时没有更多了"提示，已到达页面底部');
					_0x25334c = true;
					break;
				}
			}
			if (_0x25334c) {
				console.log("已抓取到底部，返回当前结果");
				return _0x3c45e8;
			}
			let _0x28a75d = [];
			if (this.videoListContainer) {
				_0x28a75d = this.videoListContainer.querySelectorAll(
					"div.search-result-card"
				);
				console.log("从容器中找到 " + _0x28a75d.length + " 个视频项");
			}
			if (_0x28a75d.length === 0) {
				console.log("在容器中未找到视频项，尝试在全页面中查找...");
				_0x28a75d = document.querySelectorAll("div.search-result-card");
				console.log("在全页面中找到 " + _0x28a75d.length + " 个视频项");
			}
			function _0x3a6eef(_0x51fd4a, _0x13f047 = 5) {
				const _0x412e1c = [];
				let _0x64f106 = _0x51fd4a;
				let _0x486ea6 = 0;
				while (_0x64f106 && _0x486ea6 < _0x13f047) {
					const _0x566b15 = _0x64f106.className
						? ' (class="' + _0x64f106.className + '")'
						: "";
					const _0x1e777c = _0x64f106.id ? ' (id="' + _0x64f106.id + '")' : "";
					_0x412e1c.push(
						"" + _0x64f106.tagName.toLowerCase() + _0x566b15 + _0x1e777c
					);
					_0x64f106 = _0x64f106.parentElement;
					_0x486ea6++;
				}
				return _0x412e1c;
			}
			if (_0x28a75d.length === 0) {
				console.log("未找到视频项，输出页面结构以辅助调试:");
				const _0x9cdad3 = document.querySelectorAll('a[href*="/video/"]');
				console.log("包含/video/字符串的链接数量:", _0x9cdad3.length);
				if (_0x9cdad3.length > 0) {
					console.log("第一个视频链接:", _0x9cdad3[0]);
					console.log("包含该链接的父元素链:", _0x3a6eef(_0x9cdad3[0]));
				}
				const _0xc191b0 = document.querySelectorAll("li");
				console.log("页面上的列表项数量:", _0xc191b0.length);
				console.log("页面上前5个列表项的类名:");
				for (
					let _0x351e1f = 0;
					_0x351e1f < Math.min(5, _0xc191b0.length);
					_0x351e1f++
				) {
					console.log(
						"列表项 " + (_0x351e1f + 1) + " 类名:",
						_0xc191b0[_0x351e1f].className
					);
					if (_0xc191b0[_0x351e1f].querySelector('a[href*="/video/"]')) {
						console.log("列表项 " + (_0x351e1f + 1) + " 包含视频链接");
						_0x28a75d = [_0xc191b0[_0x351e1f]];
						break;
					}
				}
			}
			const _0x330524 = [];
			const _0x5139ec = new Set(_0x3c45e8.map((_0x1154c9) => _0x1154c9.link));
			for (let _0x2a8f83 = 0; _0x2a8f83 < _0x28a75d.length; _0x2a8f83++) {
				const _0x125edd = _0x28a75d[_0x2a8f83];
				console.log(
					"处理第 " +
						(_0x2a8f83 + 1) +
						"/" +
						_0x28a75d.length +
						" 个视频数据 (总计 " +
						(_0x3c45e8.length + _0x330524.length) +
						"/" +
						_0x25897c +
						")"
				);
				let _0x3feae5 = _0x125edd
					.querySelector("div#sliderVideo")
					?.getAttribute("data-e2e-vid");
				if (!_0x3feae5) {
					_0x3feae5 =
						_0x125edd.parentElement.id.split("_").length == 3
							? _0x125edd.parentElement.id.split("_")[2]
							: "";
				}
				let _0xfad753 = "";
				if (_0x3feae5) {
					_0xfad753 = "https://www.douyin.com/video/" + _0x3feae5;
					if (_0x5139ec.has(_0xfad753)) {
						console.log("跳过重复视频:", _0xfad753);
						continue;
					}
					console.log("提取到链接:", _0xfad753);
				} else {
					console.log("未找到链接元素，跳过此项");
					continue;
				}
				if (
					_0x125edd
						.querySelector(".semi-tag-content.semi-tag-content-ellipsis")
						?.textContent.includes("直播中")
				) {
					console.log("跳过直播视频，index:", _0x2a8f83);
					continue;
				}
				const _0x56504f = _0x125edd.querySelector(
					'.FWkvEMo5, img[src*="douyinpic"]'
				);
				let _0x13a647 = "";
				if (_0x56504f) {
					if (_0x56504f.style && _0x56504f.style.backgroundImage) {
						const _0x52497d = _0x56504f.style.backgroundImage;
						const _0x546704 = _0x52497d.match(/url\(['"]?(.*?)['"]?\)/);
						if (_0x546704 && _0x546704[1]) {
							_0x13a647 = _0x546704[1];
						}
					} else if (_0x56504f.src) {
						_0x13a647 = _0x56504f.src;
					}
					console.log("提取到封面图:", _0x13a647);
				} else {
					console.log("未找到封面图元素");
				}
				const _0x4ef5ea = _0x125edd.querySelector(
					".BjLsdJMi , .j5WZzJdp.IoRNNcMW.hVNC9qgC"
				);
				const _0x2d5031 = _0x4ef5ea ? _0x4ef5ea.innerText.trim() : "";
				let _0x5a34bd = null;
				const _0x14211b = _0x125edd.querySelector(".VuNDHHqb");
				if (_0x14211b) {
					_0x14211b.click();
					const _0x331a7b = await waitForElement(
						".transition-mask-appear-done"
					);
					if (_0x331a7b) {
						const _0x1301b6 = async () => {
							for (let _0x4319d8 = 0; _0x4319d8 < 5; _0x4319d8++) {
								const _0x1a644d = await waitForElement(
									".transition-mask-appear-done .vs9hmvGz"
								);
								const _0x3fa4d9 = _0x1a644d ? _0x1a644d.innerText.trim() : "";
								if (_0x3fa4d9) {
									return _0x3fa4d9;
								}
							}
						};
						await utils.sleep(1000);
						const _0x2c5815 = await _0x1301b6();
						const _0x53b63d = _0x331a7b.querySelector(".sULNCyZ4>span");
						const _0x360463 = _0x53b63d ? _0x53b63d.innerText.trim() : "";
						const _0x12010e = _0x331a7b.querySelector(".r9__IJQQ");
						const _0x3662f8 = _0x12010e ? _0x12010e.innerText.trim() : "";
						const _0xcb810f = _0x331a7b.querySelector(".SDhAOg0k");
						const _0x4b38ff = _0xcb810f ? _0xcb810f.innerText.trim() : "";
						const _0xd84bcb = _0x331a7b.querySelectorAll(
							".swiper-wrapper>div.swiper-slide img"
						);
						const _0x5bb20c = new Set();
						_0xd84bcb.forEach((_0x5bec3a) => {
							_0x5bb20c.add(_0x5bec3a.src);
						});
						const _0x36865c = Array.from(_0x5bb20c);
						const _0x3a6b19 = [];
						const _0x5c1e02 = _0x331a7b.querySelectorAll(".hIRfCKxu");
						_0x5c1e02.forEach((_0x4b10d2) => {
							const _0x531dbc = _0x4b10d2.querySelector(".dxbiuoJ_");
							const _0x5e4c1a = _0x4b10d2.querySelector(".GmHYc224");
							_0x3a6b19.push({
								name: _0x531dbc ? _0x531dbc.innerText.trim() : "",
								value: _0x5e4c1a ? _0x5e4c1a.innerText.trim() : "",
							});
						});
						const _0x530a3a = _0x331a7b.querySelectorAll(
							".p1kE0uFd.S25T9aPi .nPQ6wC4v"
						);
						const _0x274bca = _0x530a3a
							? Array.from(_0x530a3a)
									.map((_0x91221) => _0x91221.src)
									.filter(
										(_0x412649) =>
											_0x412649 && !_0x412649.startsWith("data:image")
									)
							: [];
						const _0xfdc6b = _0x331a7b.querySelector(".xgTWV_ga");
						let _0x8c622f = [];
						let _0x34d92f = _0xfdc6b
							? _0xfdc6b.textContent.replace(/[^\d]+/g, "")
							: 0;
						if (_0x34d92f) {
							_0x34d92f = parseInt(_0x34d92f);
							const _0x109d7a = Math.min(_0x34d92f, _0x25897c);
							const _0x292cf0 = _0x331a7b.querySelector("._3IrIRgz3");
							await utils.waitForChildListChange(
								() => {
									_0xfdc6b.click();
								},
								_0x292cf0,
								10000
							);
							await utils.sleep(500);
							const _0x1aeb94 = async () => {
								const _0x14a5f8 = _0x331a7b.querySelector(
									"._3IrIRgz3 .Ao_Mqy8Y"
								);
								if (!_0x14a5f8) {
									return false;
								}
								const _0x17fe21 = await utils.waitForChildListChange(
									async () => {
										utils.scrollToElementBottom(_0x292cf0);
									},
									_0x292cf0,
									10000
								);
								await utils.sleep(500);
								return _0x17fe21;
							};
							const _0xb1e37e = new Set();
							const _0x4db6b0 = async () => {
								while (true) {
									const _0x3647a6 = _0x331a7b.querySelectorAll(
										"._3IrIRgz3 .Ez3MC6d7.BZvFf5vb"
									);
									for (const _0x2e18bc of _0x3647a6) {
										const _0x2b2188 = _0x2e18bc
											.querySelector(".j6DkqvoQ")
											?.textContent.trim();
										const _0x5c9e8a = _0x2e18bc.querySelector(".VRnGuKXU")?.src;
										const _0x5ecd66 = _0x2e18bc.querySelector(".mgNuPdjB");
										const _0x147360 = _0x2e18bc.querySelector(".mVx_hWUO");
										const _0x371e4b =
											(_0x5ecd66 ? _0x5ecd66.textContent.trim() : "") +
											(_0x147360 ? _0x147360.textContent.trim() : "");
										const _0x15054a =
											_0x2e18bc.querySelectorAll(".qZmIVPuL>img");
										const _0x488b01 = _0x15054a
											? Array.from(_0x15054a)
													.map((_0x21ff2c) => _0x21ff2c.src)
													.filter(
														(_0x12be37) =>
															_0x12be37 && !_0x12be37.startsWith("data:image")
													)
											: [];
										const _0x511da4 = _0x2e18bc.querySelector(".X2TC7MK5");
										const _0x1f6f02 = utils.getElementTextToNumber(
											_0x511da4,
											false
										);
										const _0x3c4575 = _0x2e18bc.querySelector(".Xug6qnCc");
										const _0x335dc2 = utils
											.getElementText(_0x3c4575, false)
											.replace("评价", "");
										const _0x1e0120 = "";
										const _0x2d0c5b = _0x2e18bc.querySelector(".US7h0vvt");
										const _0x97613d = utils.getElementTextToNumber(
											_0x2d0c5b,
											false
										);
										const _0xfd6347 = {
											userName: _0x2b2188,
											avatar: _0x5c9e8a,
											content: _0x371e4b,
											contentImgs: _0x488b01,
											likes: _0x1f6f02,
											date: _0x335dc2,
											location: _0x1e0120,
											isAuthor: false,
											view: _0x97613d,
										};
										_0xb1e37e.add(_0xfd6347);
										if (_0xb1e37e.size >= _0x109d7a) {
											break;
										}
									}
									if (_0xb1e37e.size >= _0x109d7a) {
										break;
									}
									const _0x3c1a8f = await _0x1aeb94();
									if (!_0x3c1a8f) {
										break;
									}
									await utils.sleep(500);
								}
							};
							await _0x4db6b0();
							_0x8c622f = Array.from(_0xb1e37e);
						}
						const _0x588027 = _0x331a7b.querySelector(".AjnzIIcY");
						const _0x154ca9 = _0x588027 ? _0x588027.textContent.trim() : "";
						const _0x2eeacb = _0x331a7b.querySelector(".HBp3n39I");
						const _0x4b6cea = utils.getElementTextToNumber(_0x2eeacb, false);
						const _0x3d87af = _0x331a7b.querySelector(".iVp55Gc1");
						const _0x199d39 = _0x3d87af ? _0x3d87af.textContent.trim() : "";
						_0x5a34bd = {
							shopName: _0x154ca9,
							score: _0x4b6cea,
							sales: _0x199d39,
							title: _0x2c5815,
							seller: _0x360463,
							price: _0x3662f8,
							guarantee: _0x4b38ff,
							banners: _0x36865c,
							params: _0x3a6b19,
							imgs: _0x274bca,
							comments: _0x8c622f,
						};
					}
					const _0x521d41 = document.querySelector(
						".transition-mask-appear-done .xRcNm_F4"
					);
					if (_0x521d41) {
						_0x521d41.click();
					} else {
						_0x14211b.click();
					}
				}
				const _0x54caa1 = _0x125edd.querySelector(
					".pMq55q1M>span , .M7M0nmSI.aKy92uTH.Y7dISI5p"
				);
				const _0x4a0236 = _0x54caa1 ? _0x54caa1.innerText.trim() : "";
				console.log("提取到点赞数:", _0x4a0236);
				const _0x3834e0 = _0x125edd.querySelector(
					".FnM1bbIQ , .xgplayer-time .time-duration"
				);
				const _0x53e242 = _0x3834e0 ? _0x3834e0.innerText.trim() : "";
				console.log("提取到时长:", _0x53e242);
				if (!_0x53e242) {
					continue;
				}
				const _0x1ebcee = _0x125edd.querySelector(".WldPmwm5 , .j5WZzJdp");
				const _0x3fd8d6 = _0x1ebcee ? _0x1ebcee.innerText.trim() : "";
				console.log("提取到作者:", _0x3fd8d6);
				const _0x5c1f76 = _0x125edd.querySelector(".dO8W7uoF");
				const _0x90a02 = _0x5c1f76
					? _0x5c1f76.innerText.trim().replace(/^[·\s]+/, "")
					: "";
				console.log("提取到发布时间:", _0x90a02);
				_0x330524.push({
					title: _0x2d5031,
					cover: _0x13a647,
					author: _0x3fd8d6,
					authorID: "",
					authorLink: "",
					authorAvatar: "",
					link: _0xfad753,
					likes: _0x4a0236,
					isTop: false,
					duration: _0x53e242,
					publishTime: _0x90a02,
					product: _0x5a34bd,
				});
				_0x5139ec.add(_0xfad753);
				console.log(
					"成功添加第 " +
						(_0x2a8f83 + 1) +
						" 项视频数据 (总计 " +
						(_0x3c45e8.length + _0x330524.length) +
						"/" +
						_0x25897c +
						")"
				);
				try {
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status:
							"已抓取 " +
							(_0x3c45e8.length + _0x330524.length) +
							"/" +
							_0x25897c +
							" 个视频，继续抓取中...",
					});
				} catch (_0x218c22) {
					console.error("发送进度消息失败:", _0x218c22);
				}
			}
			const _0x2487d3 = [..._0x3c45e8, ..._0x330524];
			console.log("当前已抓取 " + _0x2487d3.length + " 个视频数据");
			if (_0x2487d3.length >= _0x25897c) {
				return _0x2487d3.slice(0, _0x25897c);
			}
			if (_0x330524.length === 0) {
				_0x4da5fa++;
				if (_0x4da5fa >= _0x4ed0e9) {
					console.log(
						"已尝试滚动 " + _0x4da5fa + " 次但没有找到新视频，停止抓取"
					);
					return _0x2487d3;
				}
			}
			await new Promise(
				(
					_0x38d6db // TOLOOK
				) => setTimeout(_0x38d6db, 500)
			);
			await _0x4c337c();
			return await this.scrapeGeneral(
				_0x25897c,
				_0x2487d3,
				_0x4da5fa,
				_0x4ed0e9
			);
		}
		async scrapeVideos(
			_0x41f964 = 100,
			_0x2d6a46 = [],
			_0x499d43 = 0,
			_0x22258e = 10
		) {
			let _0x47f909 = false;
			const _0x5b1e41 = document.querySelectorAll(
				this.videoListContainerSelector + ">div:last-child"
			);
			for (const _0x2914c7 of _0x5b1e41) {
				if (utils.getTextNodeValue(_0x2914c7).includes("暂时没有更多了")) {
					console.log('检测到"暂时没有更多了"提示，已到达页面底部');
					_0x47f909 = true;
					break;
				}
			}
			if (_0x47f909) {
				console.log("已抓取到底部，返回当前结果");
				return _0x2d6a46;
			}
			let _0x574f50 = [];
			if (this.videoListContainer) {
				_0x574f50 = this.videoListContainer.querySelectorAll(
					"li.SwZLHMKk.SEbmeLLH"
				);
				console.log("从容器中找到 " + _0x574f50.length + " 个视频项");
			}
			if (_0x574f50.length === 0) {
				console.log("在容器中未找到视频项，尝试在全页面中查找...");
				_0x574f50 = document.querySelectorAll("li.SwZLHMKk.SEbmeLLH");
				console.log("在全页面中找到 " + _0x574f50.length + " 个视频项");
			}
			function _0x4b5e21(_0x4fd1c6, _0xfc6ad3 = 5) {
				const _0x2d5bdf = [];
				let _0x880b1d = _0x4fd1c6;
				let _0x15cd03 = 0;
				while (_0x880b1d && _0x15cd03 < _0xfc6ad3) {
					const _0xd63511 = _0x880b1d.className
						? ' (class="' + _0x880b1d.className + '")'
						: "";
					const _0x45d9c8 = _0x880b1d.id ? ' (id="' + _0x880b1d.id + '")' : "";
					_0x2d5bdf.push(
						"" + _0x880b1d.tagName.toLowerCase() + _0xd63511 + _0x45d9c8
					);
					_0x880b1d = _0x880b1d.parentElement;
					_0x15cd03++;
				}
				return _0x2d5bdf;
			}
			if (_0x574f50.length === 0) {
				console.log("未找到视频项，输出页面结构以辅助调试:");
				const _0x10b576 = document.querySelectorAll('a[href*="/video/"]');
				console.log("包含/video/字符串的链接数量:", _0x10b576.length);
				if (_0x10b576.length > 0) {
					console.log("第一个视频链接:", _0x10b576[0]);
					console.log("包含该链接的父元素链:", _0x4b5e21(_0x10b576[0]));
				}
				const _0x14f92c = document.querySelectorAll("li");
				console.log("页面上的列表项数量:", _0x14f92c.length);
				console.log("页面上前5个列表项的类名:");
				for (
					let _0x359ab3 = 0;
					_0x359ab3 < Math.min(5, _0x14f92c.length);
					_0x359ab3++
				) {
					console.log(
						"列表项 " + (_0x359ab3 + 1) + " 类名:",
						_0x14f92c[_0x359ab3].className
					);
					if (_0x14f92c[_0x359ab3].querySelector('a[href*="/video/"]')) {
						console.log("列表项 " + (_0x359ab3 + 1) + " 包含视频链接");
						_0x574f50 = [_0x14f92c[_0x359ab3]];
						break;
					}
				}
			}
			const _0x1cedf8 = [];
			const _0x5daf71 = new Set(_0x2d6a46.map((_0x2b028e) => _0x2b028e.link));
			for (let _0x516181 = 0; _0x516181 < _0x574f50.length; _0x516181++) {
				const _0x526580 = _0x574f50[_0x516181];
				console.log(
					"处理第 " +
						(_0x516181 + 1) +
						"/" +
						_0x574f50.length +
						" 个视频数据 (总计 " +
						(_0x2d6a46.length + _0x1cedf8.length) +
						"/" +
						_0x41f964 +
						")"
				);
				const _0x42d3a6 = _0x526580.querySelector('a[href*="/video/"]');
				let _0x1aea3b = "";
				if (_0x42d3a6 && _0x42d3a6.href) {
					_0x1aea3b = _0x42d3a6.href;
					if (_0x1aea3b.startsWith("//")) {
						_0x1aea3b = "https:" + _0x1aea3b;
					}
					if (_0x5daf71.has(_0x1aea3b)) {
						console.log("跳过重复视频:", _0x1aea3b);
						continue;
					}
					console.log("提取到链接:", _0x1aea3b);
				} else {
					console.log("未找到链接元素，跳过此项");
					continue;
				}
				if (
					_0x526580
						.querySelector(".semi-tag-content.semi-tag-content-ellipsis")
						?.textContent.includes("直播中")
				) {
					console.log("跳过直播视频，index:", _0x516181);
					continue;
				}
				const _0x5e2b41 = _0x526580.querySelector(
					'.FWkvEMo5, img[src*="douyinpic"]'
				);
				let _0x44d722 = "";
				if (_0x5e2b41) {
					if (_0x5e2b41.style && _0x5e2b41.style.backgroundImage) {
						const _0x169a3f = _0x5e2b41.style.backgroundImage;
						const _0x2e9943 = _0x169a3f.match(/url\(['"]?(.*?)['"]?\)/);
						if (_0x2e9943 && _0x2e9943[1]) {
							_0x44d722 = _0x2e9943[1];
						}
					} else if (_0x5e2b41.src) {
						_0x44d722 = _0x5e2b41.src;
					}
					console.log("提取到封面图:", _0x44d722);
				} else {
					console.log("未找到封面图元素");
				}
				const _0x24add3 = _0x526580.querySelector(".VDYK8Xd7");
				const _0x5d954f = _0x24add3 ? _0x24add3.innerText.trim() : "";
				console.log("提取到标题:", _0x5d954f);
				if (!_0x5d954f) {
					continue;
				}
				const _0x16f8eb = _0x526580.querySelector(".cIiU4Muu");
				const _0xe3e868 = _0x16f8eb ? _0x16f8eb.innerText.trim() : "";
				console.log("提取到点赞数:", _0xe3e868);
				const _0x4e9f17 = _0x526580.querySelector(".ckopQfVu");
				const _0x27c964 = _0x4e9f17 ? _0x4e9f17.innerText.trim() : "";
				console.log("提取到时长:", _0x27c964);
				const _0x2f65a9 = _0x526580.querySelector(".MZNczJmS");
				const _0x4a6fbe = _0x2f65a9 ? _0x2f65a9.innerText.trim() : "";
				console.log("提取到作者:", _0x4a6fbe);
				const _0x5e873b = _0x526580.querySelector(".faDtinfi");
				const _0x42ec74 = _0x5e873b
					? _0x5e873b.innerText.trim().replace(/^[·\s]+/, "")
					: "";
				console.log("提取到发布时间:", _0x42ec74);
				_0x1cedf8.push({
					title: _0x5d954f,
					cover: _0x44d722,
					author: _0x4a6fbe,
					authorID: "",
					authorLink: "",
					authorAvatar: "",
					link: _0x1aea3b,
					likes: _0xe3e868,
					isTop: false,
					duration: _0x27c964,
					publishTime: _0x42ec74,
				});
				_0x5daf71.add(_0x1aea3b);
				console.log(
					"成功添加第 " +
						(_0x516181 + 1) +
						" 项视频数据 (总计 " +
						(_0x2d6a46.length + _0x1cedf8.length) +
						"/" +
						_0x41f964 +
						")"
				);
				try {
					chrome.runtime.sendMessage({
						action: "updateStatus",
						status:
							"已抓取 " +
							(_0x2d6a46.length + _0x1cedf8.length) +
							"/" +
							_0x41f964 +
							" 个视频，继续抓取中...",
					});
				} catch (_0x4bffa2) {
					console.error("发送进度消息失败:", _0x4bffa2);
				}
			}
			const _0x3f18c5 = [..._0x2d6a46, ..._0x1cedf8];
			console.log("当前已抓取 " + _0x3f18c5.length + " 个视频数据");
			if (_0x3f18c5.length >= _0x41f964) {
				const _0x395722 = _0x3f18c5.slice(0, _0x41f964);
				return _0x395722;
			}
			if (_0x1cedf8.length === 0) {
				_0x499d43++;
				if (_0x499d43 >= _0x22258e) {
					console.log(
						"已尝试滚动 " + _0x499d43 + " 次但没有找到新视频，停止抓取"
					);
					return _0x3f18c5;
				}
			}
			await new Promise(
				(
					_0x32d80b // TOLOOK
				) => setTimeout(_0x32d80b, 500)
			);
			await _0x4c337c();
			return await this.scrapeVideos(
				_0x41f964,
				_0x3f18c5,
				_0x499d43,
				_0x22258e
			);
		}
	}

	async function _0x4c337c() {
		return new Promise((_0x12d8f0) => {
			console.log("滚动加载更多视频...");
			try {
				chrome.runtime.sendMessage({
					action: "updateStatus",
					status: "正在滚动加载更多视频...",
				});
			} catch (_0x33ad08) {
				console.error("发送滚动进度消息失败:", _0x33ad08);
			}
			const _0x593895 =
				document.querySelector(`.parent-route-container.route-scroll-container
        , .parent-route-container.bX97FWk8.route-scroll-container.h5AVrOfS
        , .child-route-container.route-scroll-container.h5AVrOfS`);
			if (!_0x593895) {
				console.log("未找到滚动容器，使用window滚动到页面底部");
				window.scrollTo(0, document.body.scrollHeight);
				// TOLOOK
				setTimeout(_0x12d8f0, 1500);
				return;
			}
			console.log("找到滚动容器:", _0x593895);
			const _0x1b0dc4 = _0x593895.scrollTop;
			const _0x15460c = _0x593895.scrollHeight;
			const _0x475010 = _0x593895.clientHeight;
			const _0xd058cf = _0x1b0dc4 + 1000;
			console.log(
				"滚动容器信息 - 当前位置: " +
					_0x1b0dc4 +
					", 容器高度: " +
					_0x475010 +
					", 总高度: " +
					_0x15460c
			);
			const _0x5bc9b2 = 10;
			const _0x219410 = 1000 / _0x5bc9b2;
			const _0x1da119 = 50;
			let _0x22de86 = 0;
			const _0x5a0de9 = // TOLOOK
				setInterval(() => {
					if (_0x22de86 >= _0x5bc9b2) {
						clearInterval(_0x5a0de9);
						// TOLOOK
						setTimeout(() => {
							console.log("等待新视频加载完成...");
							try {
								chrome.runtime.sendMessage({
									action: "updateStatus",
									status: "正在等待新视频加载...",
								});
							} catch (_0x415015) {
								console.error("发送等待消息失败:", _0x415015);
							}
							_0x12d8f0();
						}, 1500);
						return;
					}
					_0x22de86++;
					_0x593895.scrollTop = _0x1b0dc4 + _0x219410 * _0x22de86;
					console.log(
						"滚动步骤 " +
							_0x22de86 +
							"/" +
							_0x5bc9b2 +
							", 当前位置: " +
							_0x593895.scrollTop
					);
				}, _0x1da119);
		});
	}
	const _0x54689a = new _0x55664f(_0x2e0b2d);
	const _0x1dd55a = await _0x54689a.getData(maxSearchNum);
	console.log("共抓取到 " + _0x1dd55a.length + " 个视频数据");
	return _0x1dd55a;
}
