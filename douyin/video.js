async function isDouyinVideoModal() {
	console.log("检查是否为抖音视频详情modal...");
	const _0x2f5b07 = window.location.href.includes("modal_id=");
	console.log("URL是否包含modal_id参数:", _0x2f5b07);
	const _0xd868bd = [
		'div[data-e2e="modal-video-container"]',
		".vtCDirga.modal-video-container",
		".vtCDirga.modal-video-container.m3vr37Qp",
		".modal-video-container",
	];
	for (const _0xb4969b of _0xd868bd) {
		const _0x3cbe32 = document.querySelector(_0xb4969b);
		console.log("检查选择器 " + _0xb4969b + ":", _0x3cbe32 !== null);
	}
	const _0x5cee2d = document.querySelector(_0xd868bd.join(", "));
	console.log("是否找到视频modal容器:", _0x5cee2d !== null);
	if (_0x5cee2d) {
		const _0x3f8026 = _0x5cee2d.querySelector(
			'.AXQAavwp div[data-e2e="video-info"], .video-info-detail'
		);
		console.log("是否找到视频信息区域:", _0x3f8026 !== null);
		const _0x2f9178 = _0x5cee2d.querySelector(
			".MarSXdLE, .MarSXdLE.YmptQEz6.nRO8QGrO.positionBox"
		);
		console.log("是否找到视频交互区域:", _0x2f9178 !== null);
	}
	const _0xc00a7 = _0x2f5b07 && _0x5cee2d !== null;
	console.log("当前页面是否为视频详情modal:", _0xc00a7);
	return _0xc00a7;
}
async function scrapeDouyinVideoModal() {
	console.log("开始抓取抖音视频详情modal...");
	console.log("当前URL:", window.location.href);
	console.log("是否包含modal_id:", window.location.href.includes("modal_id="));
	sniffedVideoUrl = "";
	if (!window.sniffedVideoUrls) {
		window.sniffedVideoUrls = [];
	} else {
		console.log(
			"已有嗅探视频URL列表，共",
			window.sniffedVideoUrls.length,
			"个"
		);
	}
	videoSearchAttempts = 0;
	let _0xdce7 = false;
	let _0x4dceec = "";
	const _0x39e683 = window.location.href.match(/modal_id=([0-9]+)/);
	if (_0x39e683 && _0x39e683[1]) {
		_0x4dceec = _0x39e683[1];
		console.log("从URL提取视频ID:", _0x4dceec);
	} else {
		const _0x199fef = window.location.href.match(
			/(\/video\/(\d+)$)|(\/video\/(\d+)[?|\/])/
		);
		if ((_0x199fef && _0x199fef[2]) || _0x199fef[4]) {
			_0x4dceec = _0x199fef[2] || _0x199fef[4];
			_0xdce7 = true;
			console.log("从URL提取视频ID:", _0x4dceec);
		} else {
			console.error("URL中未找到modal_id参数");
			return {
				error: true,
				message: "URL中未找到modal_id参数",
				title: "无法获取视频数据",
				description: "请确认当前URL包含modal_id参数",
				link: window.location.href,
			};
		}
	}
	const _0x3583e5 =
		window.location.href.includes("/search/") ||
		window.location.href.includes("/discover/search");
	console.log("视频弹窗来源:", _0x3583e5 ? "搜索页面" : "用户页面/其他");
	if (_0x3583e5) {
		console.log("检测到来自搜索页的视频弹窗，使用增强嗅探");
		await new Promise(
			(
				_0x1b9fb1 // TOLOOK
			) => setTimeout(_0x1b9fb1, 1000)
		);
		const _0x160614 = [
			"video.xgplayer-video",
			".xg-video video",
			".player-container video",
			".xgplayer-inner video",
			'[class*="player"] video',
		];
		for (const _0x151b9d of _0x160614) {
			const _0x1da49e = document.querySelectorAll(_0x151b9d);
			console.log(
				'使用选择器 "' +
					_0x151b9d +
					'" 找到 ' +
					_0x1da49e.length +
					" 个视频元素"
			);
			for (const _0x1cf077 of _0x1da49e) {
				try {
					if (_0x1cf077 && !_0x1cf077.src) {
						console.log("尝试播放视频以触发资源加载");
						_0x1cf077
							.play()
							.catch((_0x2ea6bb) =>
								console.log("播放视频失败，这是预期的行为")
							);
						await new Promise(
							(
								_0x2a346e // TOLOOK
							) => setTimeout(_0x2a346e, 500)
						);
					}
					if (_0x1cf077.src) {
						console.log("找到视频元素src:", _0x1cf077.src);
						if (
							_0x1cf077.src.includes("v3-dy-o.zjcdn.com/") ||
							_0x1cf077.src.includes("v26-dy.ixigua.com/") ||
							_0x1cf077.src.includes("v9-dy.ixigua.com/") ||
							_0x1cf077.src.includes("v3-dy.ixigua.com/") ||
							_0x1cf077.src.includes("douyinvod.com/") ||
							(_0x1cf077.src.includes(".mp4") &&
								_0x1cf077.src.includes("douyin"))
						) {
							sniffedVideoUrl = _0x1cf077.src;
							console.log("在搜索页视频元素中找到视频URL:", sniffedVideoUrl);
						}
					}
					if (!sniffedVideoUrl) {
						const _0x3364de = _0x1cf077.attributes;
						for (let _0xa9c2dc = 0; _0xa9c2dc < _0x3364de.length; _0xa9c2dc++) {
							const _0x256153 = _0x3364de[_0xa9c2dc].name;
							const _0x5ec53d = _0x3364de[_0xa9c2dc].value;
							if (
								_0x256153.startsWith("data-") &&
								_0x5ec53d &&
								(_0x5ec53d.includes(".mp4") ||
									_0x5ec53d.includes("douyinvod") ||
									_0x5ec53d.includes("-dy.") ||
									_0x5ec53d.includes("v3-dy"))
							) {
								console.log(
									"在视频元素的属性 " + _0x256153 + " 中找到可能的URL:",
									_0x5ec53d
								);
								try {
									const _0x56dc24 = JSON.parse(_0x5ec53d);
									searchForVideoURLInObject(_0x56dc24);
								} catch (_0x455f13) {
									if (_0x5ec53d.startsWith("http")) {
										sniffedVideoUrl = _0x5ec53d;
										console.log("从视频属性中获取视频URL:", sniffedVideoUrl);
									}
								}
							}
						}
					}
				} catch (_0x1d395f) {
					console.error("处理视频元素时出错:", _0x1d395f);
				}
			}
			if (sniffedVideoUrl) {
				break;
			}
		}
		if (!sniffedVideoUrl) {
			const _0x121140 = document.querySelectorAll(
				'.xgplayer, [class*="player"], [class*="Player"], .swiper-slide-active'
			);
			console.log("找到 " + _0x121140.length + " 个可能的播放器容器");
			for (const _0x1f105b of _0x121140) {
				try {
					const _0x41d608 = _0x1f105b.attributes;
					for (let _0xf4c437 = 0; _0xf4c437 < _0x41d608.length; _0xf4c437++) {
						const _0x21df86 = _0x41d608[_0xf4c437].name;
						const _0x2d6851 = _0x41d608[_0xf4c437].value;
						if (
							_0x2d6851 &&
							(_0x2d6851.includes(".mp4") ||
								_0x2d6851.includes("douyinvod") ||
								_0x2d6851.includes("-dy.") ||
								_0x2d6851.includes("v3-dy"))
						) {
							console.log(
								"在播放器容器的属性 " + _0x21df86 + " 中找到可能的URL:",
								_0x2d6851
							);
							if (_0x2d6851.startsWith("http")) {
								sniffedVideoUrl = _0x2d6851;
								console.log("从播放器容器属性中获取视频URL:", sniffedVideoUrl);
								break;
							}
						}
						if (_0x21df86.startsWith("data-")) {
							try {
								const _0x47d0d3 = JSON.parse(_0x2d6851);
								searchForVideoURLInObject(_0x47d0d3);
								if (sniffedVideoUrl) {
									break;
								}
							} catch (_0x4feb43) {}
						}
					}
					if (sniffedVideoUrl) {
						break;
					}
					const _0x91ae5c = _0x1f105b.style.backgroundImage;
					if (_0x91ae5c) {
						console.log("播放器容器背景图片:", _0x91ae5c);
						const _0x1dfa2d = _0x91ae5c.match(/\/([0-9]+)~noop/);
						if (_0x1dfa2d && _0x1dfa2d[1]) {
							const _0x6bcab = _0x1dfa2d[1];
							console.log("从背景图片中提取可能的视频ID:", _0x6bcab);
						}
					}
				} catch (_0x5a6b4c) {
					console.error("处理播放器容器时出错:", _0x5a6b4c);
				}
			}
		}
		if (!sniffedVideoUrl) {
			console.log("尝试拦截网络请求查找视频URL");
			if (window.performance && window.performance.getEntries) {
				const _0x19f298 = window.performance.getEntries();
				console.log("分析 " + _0x19f298.length + " 个网络请求");
				for (const _0x33b2f3 of _0x19f298) {
					try {
						if (_0x33b2f3.name && typeof _0x33b2f3.name === "string") {
							if (
								_0x33b2f3.name.includes("douyinvod.com") ||
								_0x33b2f3.name.includes("v3-dy") ||
								_0x33b2f3.name.includes("v26-dy") ||
								_0x33b2f3.name.includes("v9-dy") ||
								(_0x33b2f3.name.includes(".mp4") &&
									_0x33b2f3.name.includes("douyin"))
							) {
								console.log("从网络请求中找到视频URL:", _0x33b2f3.name);
								sniffedVideoUrl = _0x33b2f3.name;
								break;
							}
						}
					} catch (_0x23071f) {
						console.error("分析网络请求时出错:", _0x23071f);
					}
				}
			}
		}
	}
	for (let _0x202d67 = 0; _0x202d67 < 3; _0x202d67++) {
		const _0x3e0ec4 = document.querySelectorAll("video");
		for (const _0x578903 of _0x3e0ec4) {
			await utils.waitForChildListChange(() => {
				_0x578903.src = _0x578903.src + "?t=" + Date.now();
			}, _0x578903);
			await utils.sleep(500);
			if (_0x578903.src) {
				console.log("视频modal中发现视频元素src:", _0x578903.src);
				if (
					_0x578903.src.includes("v3-dy-o.zjcdn.com/") ||
					_0x578903.src.includes("v26-dy.ixigua.com/") ||
					_0x578903.src.includes("v9-dy.ixigua.com/") ||
					_0x578903.src.includes("v3-dy.ixigua.com/") ||
					_0x578903.src.includes("douyinvod.com/") ||
					(_0x578903.src.includes(".mp4") && _0x578903.src.includes("douyin"))
				) {
					sniffedVideoUrl = _0x578903.src;
					console.log("在视频元素中找到视频URL:", sniffedVideoUrl);
				}
			}
			const _0x54538f = _0x578903.querySelectorAll("source");
			_0x54538f.forEach((_0x17bf9f) => {
				if (_0x17bf9f.src) {
					console.log("发现视频source标签src:", _0x17bf9f.src);
					if (
						_0x17bf9f.src.includes("v3-dy-o.zjcdn.com/") ||
						_0x17bf9f.src.includes("v26-dy.ixigua.com/") ||
						_0x17bf9f.src.includes("v9-dy.ixigua.com/") ||
						_0x17bf9f.src.includes("v3-dy.ixigua.com/") ||
						_0x17bf9f.src.includes("douyinvod.com/") ||
						(_0x17bf9f.src.includes(".mp4") && _0x17bf9f.src.includes("douyin"))
					) {
						sniffedVideoUrl = _0x17bf9f.src;
						console.log("在source标签中找到视频URL:", sniffedVideoUrl);
					}
				}
			});
		}
		if (!sniffedVideoUrl) {
			console.log("第", _0x202d67 + 1, "次尝试从HTML中搜索视频URL");
			const _0x3522e1 = [
				/https:\/\/v3-web\.douyinvod\.com\/[^"'\s]+/g,
				/https:\/\/v(\d+)-\w+\.douyinvod\.com\/[^"'\s]+/g,
				/https:\/\/v(\d+)-dy\.ixigua\.com\/[^"'\s]+/g,
				/https:\/\/v(\d+)-dy-o\.zjcdn\.com\/[^"'\s]+/g,
				/"playAddr":\s*"([^"]+)"/g,
				/"play_url":\s*"([^"]+)"/g,
				/"downloadAddr":\s*"([^"]+)"/g,
				/playAddr:\s*'([^']+)'/g,
				/src="(https:\/\/[^"]+\.mp4[^"]*)"/g,
			];
			const _0xbd3c0f = document.documentElement.outerHTML;
			for (const _0x541a9e of _0x3522e1) {
				const _0xc144c6 = _0xbd3c0f.match(_0x541a9e);
				if (_0xc144c6 && _0xc144c6.length) {
					for (const _0x2df1de of _0xc144c6) {
						let _0x564b7f = _0x2df1de;
						if (
							_0x2df1de.includes('playAddr":') ||
							_0x2df1de.includes('play_url":') ||
							_0x2df1de.includes('downloadAddr":')
						) {
							const _0x50aa9c = /":\s*"([^"]+)"/.exec(_0x2df1de);
							if (_0x50aa9c && _0x50aa9c[1]) {
								_0x564b7f = _0x50aa9c[1].replace(/\\u002F/g, "/");
							}
						} else if (_0x2df1de.includes("playAddr:")) {
							const _0x389ddd = /'([^']+)'/.exec(_0x2df1de);
							if (_0x389ddd && _0x389ddd[1]) {
								_0x564b7f = _0x389ddd[1].replace(/\\u002F/g, "/");
							}
						} else if (_0x2df1de.includes('src="')) {
							const _0x243ad0 = /src="([^"]+)"/.exec(_0x2df1de);
							if (_0x243ad0 && _0x243ad0[1]) {
								_0x564b7f = _0x243ad0[1];
							}
						}
						console.log("从HTML中找到可能的视频URL:", _0x564b7f);
						if (
							_0x564b7f &&
							(_0x564b7f.includes("v3-dy-o.zjcdn.com/") ||
								_0x564b7f.includes("v26-dy.ixigua.com/") ||
								_0x564b7f.includes("v9-dy.ixigua.com/") ||
								_0x564b7f.includes("v3-dy.ixigua.com/") ||
								_0x564b7f.includes("douyinvod.com/") ||
								(_0x564b7f.includes(".mp4") && _0x564b7f.includes("douyin")))
						) {
							sniffedVideoUrl = _0x564b7f;
							console.log("从HTML中确认视频URL:", sniffedVideoUrl);
							break;
						}
					}
					if (sniffedVideoUrl) {
						break;
					}
				}
			}
		}
		if (!sniffedVideoUrl && window.RENDER_DATA) {
			try {
				console.log("尝试从RENDER_DATA提取视频URL");
				const _0x25feb4 = JSON.parse(decodeURIComponent(window.RENDER_DATA));
				function _0x8ea13a(_0x459185, _0x5db0a5 = 0) {
					if (_0x5db0a5 > 5) {
						return;
					}
					if (!_0x459185 || typeof _0x459185 !== "object") {
						return;
					}
					for (const _0x1ac3a2 in _0x459185) {
						if (
							_0x1ac3a2 === "playAddr" ||
							_0x1ac3a2 === "play_url" ||
							_0x1ac3a2 === "downloadAddr" ||
							_0x1ac3a2 === "video_url" ||
							_0x1ac3a2 === "url"
						) {
							const _0xcd9d08 = _0x459185[_0x1ac3a2];
							if (typeof _0xcd9d08 === "string" && _0xcd9d08.includes("http")) {
								console.log(
									"在RENDER_DATA." + _0x1ac3a2 + "中找到视频URL:",
									_0xcd9d08
								);
								if (
									_0xcd9d08.includes("v3-dy-o.zjcdn.com/") ||
									_0xcd9d08.includes("v26-dy.ixigua.com/") ||
									_0xcd9d08.includes("v9-dy.ixigua.com/") ||
									_0xcd9d08.includes("v3-dy.ixigua.com/") ||
									_0xcd9d08.includes("douyinvod.com/") ||
									(_0xcd9d08.includes(".mp4") && _0xcd9d08.includes("douyin"))
								) {
									sniffedVideoUrl = _0xcd9d08;
									return true;
								}
							}
						}
						if (
							_0x459185[_0x1ac3a2] &&
							typeof _0x459185[_0x1ac3a2] === "object"
						) {
							if (_0x8ea13a(_0x459185[_0x1ac3a2], _0x5db0a5 + 1)) {
								return true;
							}
						}
					}
					return false;
				}
				_0x8ea13a(_0x25feb4);
			} catch (_0x2dd64a) {
				console.log("从RENDER_DATA解析视频URL失败:", _0x2dd64a);
			}
		}
		if (sniffedVideoUrl) {
			console.log("成功找到视频URL，中止进一步搜索");
			break;
		}
		if (_0x202d67 < 2) {
			console.log("未找到视频URL，等待500ms后再次尝试");
			await new Promise(
				(
					_0x3690de // TOLOOK
				) => setTimeout(_0x3690de, 500)
			);
		}
	}
	const _0x5b7b79 = document.querySelectorAll("video");
	console.log("找到 " + _0x5b7b79.length + " 个视频元素");
	_0x5b7b79.forEach((_0x320dcc) => {
		if (_0x320dcc.src) {
			console.log("检查视频源URL:", _0x320dcc.src);
			if (
				_0x320dcc.src.startsWith("https://v3-dy-o.zjcdn.com/") ||
				_0x320dcc.src.startsWith("https://v26-dy.ixigua.com/") ||
				_0x320dcc.src.startsWith("https://v9-dy.ixigua.com/") ||
				_0x320dcc.src.startsWith("https://v3-dy.ixigua.com/")
			) {
				sniffedVideoUrl = _0x320dcc.src;
				console.log("直接从视频元素获取到视频URL:", sniffedVideoUrl);
			}
		}
	});
	if (!sniffedVideoUrl) {
		console.log("没有立即找到视频URL，将在后台继续嗅探");
	}
	const _0x3a7b80 = document.querySelectorAll(
		'.xgplayer-play, .xgplayer-start, [data-e2e="video-play"]'
	);
	if (_0x3a7b80.length > 0) {
		console.log("找到播放按钮，点击以触发视频加载");
		try {
			if (_0x3a7b80[0].getAttribute("data-state") != "play") {
				_0x3a7b80[0].click();
			}
		} catch (_0x21398f) {
			console.error("点击播放按钮失败:", _0x21398f);
		}
	}
	console.log("通过data-e2e-vid和video_ID属性查找当前视频元素...");
	let _0x355b41 = document.querySelector(
		'div[data-e2e="feed-active-video"][data-e2e-vid="' + _0x4dceec + '"]'
	);
	if (!_0x355b41) {
		_0x355b41 = document.querySelector(".video_" + _0x4dceec);
		console.log("通过video_class查找:", _0x355b41 ? "找到了" : "未找到");
	}
	if (!_0x355b41) {
		const _0x287539 = document.querySelectorAll(
			'div[data-e2e="feed-active-video"]'
		);
		console.log("找到" + _0x287539.length + "个feed-active-video元素");
		for (const _0x139029 of _0x287539) {
			console.log(
				"检查元素:",
				_0x139029.getAttribute("data-e2e-vid"),
				_0x139029.className
			);
			if (
				_0x139029.className.includes("ZTBYOIeC") &&
				(_0x139029.getAttribute("data-e2e-vid") === _0x4dceec ||
					_0x139029.className.includes("video_" + _0x4dceec))
			) {
				_0x355b41 = _0x139029;
				console.log("找到匹配的活跃视频元素!");
				break;
			}
		}
	}
	if (_0xdce7) {
		_0x355b41 = _0x355b41.parentElement;
	}
	let _0x1c147f = null;
	if (_0x355b41) {
		console.log("找到活跃视频元素:", _0x355b41);
		console.log(
			"活跃视频元素data-e2e-vid:",
			_0x355b41.getAttribute("data-e2e-vid")
		);
		console.log("活跃视频元素class:", _0x355b41.className);
		_0x1c147f = _0x355b41;
	} else {
		console.log("未找到精确匹配的活跃视频元素，回退到常规查找方式...");
		const _0x43ea8a = [
			'div[data-e2e="modal-video-container"]',
			".vtCDirga.modal-video-container",
			".vtCDirga.modal-video-container.m3vr37Qp",
			".modal-video-container",
			".AXQAavwp",
		];
		let _0xfde7ca = null;
		let _0x430be0 = 0;
		const _0x650f84 = 10;
		const _0xbd7e53 = 500;
		while (!_0xfde7ca && _0x430be0 < _0x650f84) {
			console.log("尝试查找modal容器，第" + (_0x430be0 + 1) + "次尝试...");
			for (const _0x45f6b2 of _0x43ea8a) {
				const _0x4d20c7 = document.querySelector(_0x45f6b2);
				if (_0x4d20c7) {
					_0xfde7ca = _0x4d20c7;
					console.log(
						"在第" + (_0x430be0 + 1) + "次尝试中找到modal容器，使用选择器:",
						_0x45f6b2
					);
					break;
				}
			}
			if (!_0xfde7ca) {
				_0x430be0++;
				await new Promise(
					(
						_0x2ace18 // TOLOOK
					) => setTimeout(_0x2ace18, _0xbd7e53)
				);
			}
		}
		if (!_0xfde7ca) {
			console.log("尝试使用MutationObserver等待modal容器加载...");
			try {
				_0xfde7ca = await waitForElement(_0x43ea8a.join(", "), 5000);
			} catch (_0x477833) {
				console.error("等待modal容器加载超时:", _0x477833);
			}
		}
		if (!_0xfde7ca) {
			console.error("未找到视频modal容器");
			console.log("当前页面结构:");
			console.log(document.body.innerHTML.substring(0, 500) + "...");
			return {
				error: true,
				message: "未找到视频modal容器",
				id: _0x4dceec,
				title: "无法获取视频数据",
				description: "未找到视频详情容器，请确认当前页面包含视频详情弹窗",
				link: window.location.href,
			};
		}
		_0x1c147f = _0xfde7ca;
		console.log("找到备选视频modal容器:", _0x1c147f);
	}
	console.log("Modal container HTML (前300字符):");
	console.log(_0x1c147f.innerHTML.substring(0, 300) + "...");
	let _0x2daef4 = "";
	const _0x4133e0 = _0x1c147f.querySelector(
		".slider-video .hiddenImgbackgroundPlugin"
	);
	if (_0x4133e0 && _0x4133e0.src) {
		_0x2daef4 = _0x4133e0.src;
		console.log("提取到封面图:", _0x2daef4);
	}
	let _0x40559a = "";
	const _0x3a9eca = [
		"div.video-info-detail div.title div>span>span>span:first-child ",
		'div[data-e2e-aweme-id="' + _0x4dceec + '"] span>span>span',
		'div[data-e2e="video-desc"], .video-desc, .title, .desc, .HKxbhvW_',
		".title-wrap h1",
		".video-info-title",
		"span.JI6vfzjc",
	];
	for (const _0x589943 of _0x3a9eca) {
		const _0x13fa25 = _0x1c147f.querySelector(_0x589943);
		if (_0x13fa25 && _0x13fa25.textContent.trim()) {
			const _0x2b5b5c = _0x13fa25.cloneNode(true);
			const _0x1a5b1b = _0x2b5b5c.querySelectorAll(
				'button, [role="button"], .expand-btn, [class*="expand"]'
			);
			_0x1a5b1b.forEach((_0x29ab72) => {
				if (_0x29ab72 && _0x29ab72.parentNode) {
					_0x29ab72.parentNode.removeChild(_0x29ab72);
				}
			});
			_0x40559a = _0x2b5b5c.textContent.trim();
			console.log(
				"从选择器 " + _0x589943 + " 提取到纯标题(不含按钮文本):",
				_0x40559a
			);
			if (_0x1a5b1b.length > 0) {
				console.log("在标题元素中找到展开按钮:", _0x1a5b1b.length);
				try {
					const _0xfba7c6 = _0x13fa25.querySelectorAll(
						'button, [role="button"], .expand-btn, [class*="expand"]'
					);
					if (_0xfba7c6 && _0xfba7c6.length > 0) {
						_0xfba7c6[0].click();
						console.log("点击展开按钮展开完整标题");
						// TOLOOK
						setTimeout(() => {
							if (_0x13fa25) {
								const _0x4fb773 = _0x13fa25.cloneNode(true);
								const _0x3a2cf5 = _0x4fb773.querySelectorAll(
									'button, [role="button"], .expand-btn, [class*="expand"]'
								);
								_0x3a2cf5.forEach((_0x203661) => {
									if (_0x203661 && _0x203661.parentNode) {
										_0x203661.parentNode.removeChild(_0x203661);
									}
								});
								const _0x8d6843 = _0x4fb773.textContent.trim();
								if (_0x8d6843 && _0x8d6843.length > _0x40559a.length) {
									_0x40559a = _0x8d6843;
									console.log(
										"展开后获取到更完整的标题(不含按钮文本):",
										_0x40559a
									);
								}
							}
						}, 300);
					}
				} catch (_0x7c5bd1) {
					console.log("点击展开按钮失败:", _0x7c5bd1);
				}
			}
			break;
		}
	}
	let _0x3a37bc = "";
	let _0x269283 = "";
	let _0x233d94 = "";
	const _0x2138b7 = [
		'div[data-e2e-aweme-id="' +
			_0x4dceec +
			'"] span>span>span>span:last-child>a',
		'a[data-e2e="video-author"], .video-author-name, .J6IbfgxH',
		".author-name span",
		".account-name",
		'a.hY8lWHgA, a[href*="/user/"]',
	];
	for (const _0x400520 of _0x2138b7) {
		const _0x2c9641 = _0x1c147f.querySelector(_0x400520);
		if (_0x2c9641) {
			_0x3a37bc = _0x2c9641.textContent.trim();
			console.log("从选择器 " + _0x400520 + " 提取到作者:", _0x3a37bc);
			if (_0x2c9641.tagName === "A" && _0x2c9641.href) {
				_0x233d94 = _0x2c9641.href;
				const _0x1a0bf5 = _0x233d94.match(/\/user\/([^?]+)/);
				if (_0x1a0bf5 && _0x1a0bf5[1]) {
					_0x269283 = _0x1a0bf5[1];
				}
				console.log("作者链接:", _0x233d94);
				console.log("作者ID:", _0x269283);
			}
			break;
		}
	}
	let _0x50ba0d = "";
	const _0x2d78ff = [
		'span[data-e2e="detail-video-publish-time"]',
		'.video-info-detail .SqVMXNQp, .publish-time, div[data-e2e="video-publish-time"]',
		".video-create-time",
		".create-time",
		".time-info",
	];
	for (const _0x35fa08 of _0x2d78ff) {
		const _0x10164c = _0x1c147f.querySelector(_0x35fa08);
		if (_0x10164c && _0x10164c.textContent.trim()) {
			_0x50ba0d = _0x10164c.textContent
				.trim()
				.replace(/^[·\s]+/, "")
				.replace(/\W+/, "");
			console.log("从选择器 " + _0x35fa08 + " 提取到发布时间:", _0x50ba0d);
			break;
		}
	}
	let _0x521b71 = "";
	let _0x8103b1 = "";
	let _0x16c2d9 = "";
	let _0x4834cf = "";
	const _0x80d20f = [
		'div[data-e2e="video-player-digg"] .M7M0nmSI',
		'div[data-e2e="video-player-digg"] + div',
		'div[data-e2e="video-player-digg"] .count',
		'div[data-e2e-state="video-player-digged"] .M7M0nmSI',
	];
	for (const _0x1307d2 of _0x80d20f) {
		const _0x161551 = _0x1c147f.querySelector(_0x1307d2);
		if (_0x161551 && _0x161551.textContent.trim()) {
			_0x521b71 = _0x161551.textContent.trim();
			console.log("从选择器 " + _0x1307d2 + " 提取到点赞数:", _0x521b71);
			break;
		}
	}
	const _0x42894d = [
		'div[data-e2e="feed-comment-icon"] .SfwAcdr1',
		'div[data-e2e="feed-comment-icon"] .JrV13Yco',
		'div[data-e2e="feed-comment-icon"] .count',
	];
	for (const _0x33fc79 of _0x42894d) {
		const _0x325e64 = _0x1c147f.querySelector(_0x33fc79);
		if (_0x325e64 && _0x325e64.textContent.trim()) {
			_0x8103b1 = _0x325e64.textContent.trim();
			console.log("从选择器 " + _0x33fc79 + " 提取到评论数:", _0x8103b1);
			break;
		}
	}
	const _0x41c504 = [
		'div[data-e2e="video-player-collect"] .JQCocDWm',
		'div[data-e2e="video-player-collect"] .NT67BHnx',
		'div[data-e2e="video-player-collect"] .count',
		'div[data-e2e-state="video-player-collected"] .JQCocDWm',
	];
	for (const _0x1dac5e of _0x41c504) {
		const _0x874133 = _0x1c147f.querySelector(_0x1dac5e);
		if (_0x874133 && _0x874133.textContent.trim()) {
			_0x16c2d9 = _0x874133.textContent.trim();
			console.log("从选择器 " + _0x1dac5e + " 提取到收藏数:", _0x16c2d9);
			break;
		}
	}
	const _0x28d96e = [
		'div[data-e2e="video-player-share"] .MQXEGdYW',
		'div[data-e2e="video-player-share"] .count',
	];
	for (const _0x3d6e83 of _0x28d96e) {
		const _0x4f6c15 = _0x1c147f.querySelector(_0x3d6e83);
		if (_0x4f6c15 && _0x4f6c15.textContent.trim()) {
			_0x4834cf = _0x4f6c15.textContent.trim();
			console.log("从选择器 " + _0x3d6e83 + " 提取到分享数:", _0x4834cf);
			break;
		}
	}
	let _0xd652fe = "";
	const _0x32b402 = _0x1c147f.querySelector(
		".ckopQfVu, .video-duration, .time-duration, span.time-duration"
	);
	if (_0x32b402) {
		_0xd652fe = _0x32b402.textContent.trim();
	} else {
		const _0x51b24a =
			_0x1c147f.querySelector(".xgplayer-time") ||
			document.querySelector(".xgplayer-time");
		if (_0x51b24a) {
			_0xd652fe = _0x51b24a.textContent.trim().split("/").pop().trim();
		} else {
			const _0x3f164a =
				_0x1c147f.querySelector(".current-time") ||
				document.querySelector(".current-time");
			if (_0x3f164a) {
				_0xd652fe = _0x3f164a.textContent.trim();
			}
		}
	}
	console.log("提取到时长:", _0xd652fe);
	let _0x4f5b37 = "";
	const _0x90193c = [
		".tag-item",
		"div.video-info-detail div.title div>span>span>span>a",
	];
	for (const _0x506b1e of _0x90193c) {
		const _0x1ae8c3 = _0x1c147f.querySelectorAll(_0x506b1e);
		if (_0x1ae8c3.length > 0) {
			_0x1ae8c3.forEach((_0x55b510) => {
				const _0x1092dc = _0x55b510.textContent.trim();
				if (_0x1092dc) {
					_0x4f5b37 += _0x1092dc + ", ";
				}
			});
			break;
		}
	}
	_0x4f5b37 = _0x4f5b37.trim();
	console.log("提取到标签:", _0x4f5b37);
	let _0x49e0ff = "";
	const _0x4dd84c = _0x1c147f.querySelector(".music-info");
	if (_0x4dd84c && _0x4dd84c.textContent.trim()) {
		_0x49e0ff = _0x4dd84c.textContent.trim();
		console.log("提取到音乐信息:", _0x49e0ff);
	}
	const _0x5826dc = isNaN(_0x8103b1) ? 0 : parseInt(_0x8103b1);
	const _0x3b79d2 = await scrapeVideoComments(_0x5826dc, _0xdce7);
	const _0x652068 = {
		author: {
			id: _0x269283,
			name: _0x3a37bc,
			avatar: "",
			link: _0x233d94,
		},
		post: {
			id: _0x4dceec,
			title: _0x40559a,
			coverImage: _0x2daef4,
			description: _0x40559a,
			link: "https://www.douyin.com/video/" + _0x4dceec,
			duration: _0xd652fe,
			publishTime: _0x50ba0d,
			musicInfo: _0x49e0ff,
			tags: _0x4f5b37,
		},
		interactions: {
			likes: _0x521b71,
			comments: _0x8103b1,
			favorites: _0x16c2d9,
			shares: _0x4834cf,
		},
		mediaContent: [
			{
				type: "video",
				url: sniffedVideoUrl,
				cover: "",
			},
		],
		commentsList: _0x3b79d2.map((_0x456b63) => ({
			userName: _0x456b63.userName || "",
			avatar: _0x456b63.avatar || "",
			content: _0x456b63.content || "",
			likes: _0x456b63.likes || "0",
			date: _0x456b63.date || "",
			location: _0x456b63.location || "",
			isAuthor: _0x456b63.isAuthor || false,
		})),
	};
	console.log("数据抓取完成，尝试打开评论");
	try {
		console.log("尝试创建视频URL列表UI元素");
		if (window.sniffedVideoUrls && window.sniffedVideoUrls.length > 0) {
			const _0x2c909d = document.querySelector(
				'.AXQAavwp div[data-e2e="video-info"], .video-info-detail'
			);
			if (_0x2c909d) {
				const _0x24294c = document.createElement("div");
				_0x24294c.className = "video-urls-container";
				_0x24294c.style.cssText =
					"margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;";
				const _0x332fbb = document.createElement("div");
				_0x332fbb.textContent =
					"视频URL列表 (共" + window.sniffedVideoUrls.length + "个)";
				_0x332fbb.style.cssText =
					"color: #f85959; font-weight: bold; margin-bottom: 5px; font-size: 14px;";
				_0x24294c.appendChild(_0x332fbb);
				const _0xe2dabf = document.createElement("div");
				_0xe2dabf.className = "video-urls-list";
				_0xe2dabf.style.cssText =
					"max-height: 120px; overflow-y: auto; font-size: 12px;";
				window.sniffedVideoUrls.forEach((_0x454a75, _0x5851e0) => {
					const _0x577797 = document.createElement("div");
					_0x577797.className = "video-url-item";
					_0x577797.style.cssText =
						"margin-bottom: 5px; word-break: break-all; color: #fff;";
					const _0xfc6188 = document.createElement("a");
					_0xfc6188.href = _0x454a75;
					_0xfc6188.textContent =
						_0x5851e0 + 1 + ". " + _0x454a75.slice(0, 50) + "...";
					_0xfc6188.title = _0x454a75;
					_0xfc6188.target = "_blank";
					_0xfc6188.style.cssText = "color: #66ccff; text-decoration: none;";
					_0xfc6188.onclick = function (_0x3aa163) {
						_0x3aa163.stopPropagation();
						navigator.clipboard
							.writeText(_0x454a75)
							.then(() => {
								alert("视频URL已复制到剪贴板");
							})
							.catch((_0x1b6047) => {
								console.error("复制失败: ", _0x1b6047);
							});
						return false;
					};
					_0x577797.appendChild(_0xfc6188);
					_0xe2dabf.appendChild(_0x577797);
				});
				_0x24294c.appendChild(_0xe2dabf);
				_0x2c909d.appendChild(_0x24294c);
				console.log("成功添加视频URL列表UI");
			} else {
				console.error("未找到合适的视频信息容器来添加URL列表");
			}
		} else {
			console.log("没有嗅探到的视频URL列表可显示");
		}
	} catch (_0x406b37) {
		console.error("添加视频URL列表UI时出错:", _0x406b37);
	}
	try {
		const _0x53b50e = [
			'div[data-e2e="feed-comment-icon"]',
			'div[data-e2e="video-player-comment"]',
			'div[class*="comment-icon"]',
		];
		let _0x2efb04 = null;
		for (const _0x1810d6 of _0x53b50e) {
			const _0x40d2f6 = _0x1c147f.querySelector(_0x1810d6);
			if (_0x40d2f6) {
				_0x2efb04 = _0x40d2f6;
				console.log("找到评论按钮: " + _0x1810d6);
				break;
			}
		}
		if (_0x2efb04) {
			console.log("点击评论按钮打开评论面板");
			_0x2efb04.click();
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: "已打开评论面板，准备抓取评论...",
			});
			await new Promise(
				(
					_0x4a3522 // TOLOOK
				) => setTimeout(_0x4a3522, 2000)
			);
			const _0x5b26bc = await scrapeVideoComments(_0x5826dc);
			_0x652068.commentsList = _0x5b26bc.map((_0x404b5d) => ({
				userName: _0x404b5d.userName || "",
				avatar: _0x404b5d.avatar || "",
				content: _0x404b5d.content || "",
				likes: _0x404b5d.likes || "0",
				date: _0x404b5d.date || "",
				location: _0x404b5d.location || "",
				isAuthor: _0x404b5d.isAuthor || false,
			}));
			chrome.runtime.sendMessage({
				action: "updateStatus",
				status: "已抓取 " + _0x5b26bc.length + " 条评论",
			});
			if (_0x5b26bc.length > 0) {
				console.log(
					"成功抓取 " + _0x5b26bc.length + " 条评论，已添加到结果数据"
				);
			} else {
				console.log("未抓取到评论，已添加空评论列表到结果数据");
			}
		} else {
			console.log("未找到评论按钮，无法打开评论");
		}
	} catch (_0x324cd0) {
		console.error("抓取评论过程出错:", _0x324cd0);
	}
	console.log("最终嗅探到的视频URL:", sniffedVideoUrl);
	console.log("抓取结果:", _0x652068);
	return _0x652068;
}
async function scrapeVideoComments(_0x30bed4 = 100, _0x3f8a55 = false) {
	const appInfo = await chrome.runtime.sendMessage({
		action: "getAppInfo",
	});
	_0x30bed4 = Math.min(appInfo.dyCommentNum, _0x30bed4);
	console.log("开始抓取视频评论，最多 " + _0x30bed4 + " 条");
	const _0x63f9a5 = document.querySelector('[data-e2e="comment-list"]');
	if (!_0x63f9a5) {
		console.error('未找到评论容器 [data-e2e="comment-list"]');
		const _0x320f98 = document.getElementById("merge-all-comment-container");
		if (!_0x320f98) {
			console.error("备用容器也未找到，无法抓取评论");
			return [];
		}
		console.log("使用备用评论容器进行抓取");
	}
	const _0x43d249 =
		_0x63f9a5 || document.getElementById("merge-all-comment-container");
	console.log("找到评论容器，开始处理评论");
	let _0x15a4c1 = _0x30bed4;
	try {
		const _0x352c58 = document.querySelector(".qx5s_hbj");
		if (_0x352c58 && _0x352c58.textContent) {
			const _0x3ef651 = _0x352c58.textContent.match(/\((\d+)\)/);
			if (_0x3ef651 && _0x3ef651[1]) {
				_0x15a4c1 = parseInt(_0x3ef651[1], 10);
				console.log("找到评论总数: " + _0x15a4c1);
				if (_0x15a4c1 < _0x30bed4) {
					_0x30bed4 = _0x15a4c1;
					console.log("调整抓取目标为实际评论总数: " + _0x30bed4);
				}
			}
		}
	} catch (_0x1939a1) {
		console.error("获取评论总数出错:", _0x1939a1);
	}
	const _0x8a629f = [];
	const _0x2ba161 = new Set();
	let _0xc8f32c = 0;
	let _0x29d70b = 0;
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "准备抓取评论，总评论数: " + _0x15a4c1,
	});
	async function _0x1035cf(_0xaa6e9b = 0, _0x4ab3fa = 30) {
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: "正在抓取评论 " + _0x8a629f.length + "/" + _0x30bed4 + "...",
		});
		if (
			_0xaa6e9b >= _0x4ab3fa ||
			_0x8a629f.length >= _0x30bed4 ||
			_0x29d70b >= 5
		) {
			if (_0x29d70b >= 5) {
				console.log("连续 " + _0x29d70b + " 次没有新评论加载，停止抓取");
			} else if (_0xaa6e9b >= _0x4ab3fa) {
				console.log("达到最大尝试次数 " + _0x4ab3fa + "，停止抓取");
			} else {
				console.log(
					"已抓取目标数量 " + _0x8a629f.length + "/" + _0x30bed4 + " 条评论"
				);
			}
			return;
		}
		await _0x2c81c5();
		const _0x4b3ccd = _0x8a629f.length > _0xc8f32c;
		if (_0x4b3ccd) {
			console.log("本次新增 " + (_0x8a629f.length - _0xc8f32c) + " 条评论");
			_0xc8f32c = _0x8a629f.length;
			_0x29d70b = 0;
		} else {
			_0x29d70b++;
			console.log("没有新评论加载，连续无变化次数: " + _0x29d70b);
		}
		if (_0x8a629f.length < _0x30bed4) {
			await _0x1af98b();
			const _0x1cfcad = 500 + Math.min(200, _0xaa6e9b * 20);
			console.log("等待 " + _0x1cfcad + "ms 加载新评论...");
			await new Promise(
				(
					_0x288e52 // TOLOOK
				) => setTimeout(_0x288e52, _0x1cfcad)
			);
			await _0x1035cf(_0xaa6e9b + 1, _0x4ab3fa);
		}
	}
	async function _0x2c81c5() {
		const _0x2037cb = _0x43d249.querySelectorAll(
			'div[data-e2e="comment-item"]'
		);
		console.log("当前找到 " + _0x2037cb.length + " 条评论元素");
		let _0x2aeb8e = 0;
		for (const _0x2eeaeb of _0x2037cb) {
			try {
				_0x2aeb8e++;
				// todo comment-item selector
				const _0x21b323 = _0x2eeaeb.querySelector(".Vrj4Q3zT .jzhUi9rG");
				const itemUserName = _0x21b323 ? _0x21b323.textContent.trim() : "";
				const _0x56366e = _0x2eeaeb.querySelector(".C7LroK_h");
				let itemContent = _0x56366e ? _0x56366e.textContent.trim() : "";
				const _0x46d565 = _0x2eeaeb.querySelector(".fJhvAqos");
				const _0x398ac6 = _0x46d565 ? _0x46d565.textContent.trim() : "";
				let itemDate = "";
				let itemLocation = "";
				if (_0x398ac6) {
					const _0x24aa52 = _0x398ac6.split("·");
					itemDate = _0x24aa52[0] ? _0x24aa52[0].trim() : "";
					itemLocation = _0x24aa52[1] ? _0x24aa52[1].trim() : "";
				}
				const _0x577294 = _0x2eeaeb.querySelector(".xZhLomAs span");
				const itemLIkes = _0x577294 ? _0x577294.textContent.trim() : "";
				const _0x5e24a5 =
					itemUserName + "-" + itemContent.substring(0, 50) + "-" + _0x2aeb8e;
				const avatarImg =
					_0x2eeaeb
						.querySelector('div[class*="comment-item-avatar"]')
						.querySelector("img")?.src || "";
				if (!_0x2ba161.has(_0x5e24a5)) {
					_0x2ba161.add(_0x5e24a5);
					_0x8a629f.push({
						userName: itemUserName,
						avatar: avatarImg,
						content: itemContent,
						likes: itemLIkes,
						date: itemDate,
						location: itemLocation,
						isAuthor: false,
					});
					if (_0x8a629f.length >= _0x30bed4) {
						console.log("已达到最大评论数 " + _0x30bed4);
						break;
					}
				}
			} catch (_0x91e270) {
				console.error("处理评论元素时出错:", _0x91e270);
			}
		}
	}
	async function _0x1af98b() {
		console.log("开始快速滚动加载更多评论");
		let _0x51b436 = _0x43d249;
		if (_0x3f8a55) {
			_0x51b436 = document.querySelector(
				"#douyin-right-container>div.parent-route-container"
			);
		}
		const _0x55489b = _0x51b436.scrollTop;
		const _0xd7c35f = _0x51b436.scrollHeight;
		const _0x8134a0 = _0x51b436.clientHeight;
		const _0x154136 = _0x51b436.scrollHeight - _0x8134a0;
		if (_0x154136 - _0x55489b < 200) {
			_0x51b436.scrollTop = _0x154136;
			console.log(
				"直接滚动到底部: " + _0x55489b + " -> " + _0x51b436.scrollTop
			);
			return;
		}
		const _0x37e8e2 = Math.min(1500, _0x51b436.scrollHeight / 1.5);
		_0x51b436.scrollTop = _0x55489b + _0x37e8e2;
		console.log(
			"完成快速滚动: " +
				_0x55489b +
				" -> " +
				_0x51b436.scrollTop +
				", 滚动距离: " +
				(_0x51b436.scrollTop - _0x55489b) +
				"px"
		);
	}
	console.log("开始滚动加载评论...");
	await _0x1035cf(0, 50);
	console.log(
		"评论抓取完成，共抓取 " + _0x8a629f.length + "/" + _0x15a4c1 + " 条评论"
	);
	chrome.runtime.sendMessage({
		action: "updateStatus",
		status: "已抓取 " + _0x8a629f.length + "/" + _0x15a4c1 + " 条评论",
	});
	return _0x8a629f.filter(
		(_0x1e512f) => _0x1e512f.userName && _0x1e512f.content
	);
}
