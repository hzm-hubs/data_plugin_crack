function scrollToBottom() {
	return new Promise((resolve) => {
		const scrollHeight = document.body.scrollHeight;
		const scrollInc = scrollHeight / 10;
		let scrollPos = 0;
		const scrollTimer = setInterval(() => {
			if (scrollPos < scrollHeight) {
				window.scrollTo(0, scrollPos, {
					behavior: "smooth",
				});
				scrollPos += scrollInc;
			} else {
				window.scrollTo(0, 0, {
					behavior: "smooth",
				});
				clearInterval(scrollTimer);
				resolve();
			}
		}, 200);
	});
}

function getParentChain(element, maxLevels = 5, level) {
	const parentHierarchy = [];
	let currentElement = element;
	level = 0;
	while (currentElement && level < maxLevels) {
		const classDetails = currentElement.className
			? ` (class="${currentElement.className}")`
			: "";
		const idDetail = currentElement.id ? ` (id="${currentElement.id}")` : "";
		parentHierarchy.push(
			`${currentElement.tagName.toLowerCase()}${classDetails}${idDetail}`
		);
		currentElement = currentElement.parentElement;
		level++;
	}
	return parentHierarchy;
}
function waitForElement(selector, timeout = 5000) {
	return new Promise((resolve, reject) => {
		console.log(`等待元素加载: ${selector}, 超时: ${timeout}ms`);
		const element = document.querySelector(selector);
		if (element) {
			console.log("元素已存在，无需等待");
			return resolve(element);
		}
		const timeoutId = setTimeout(() => {
			if (observer) {
				observer.disconnect();
				console.log(`等待元素超时: ${selector}`);
				const foundElement = document.querySelector(selector);
				if (foundElement) {
					console.log("超时后找到元素");
					resolve(foundElement);
				} else {
					reject(new Error(`等待元素超时: ${selector}`));
				}
			}
		}, timeout);
		const observer = new MutationObserver((mutations, obs) => {
			console.log("...测检化变MOD".split("").reverse().join(""));
			const element1 = document.querySelector(selector);
			if (element1) {
				console.log(`找到元素: ${selector}`);
				clearTimeout(timeoutId);
				obs.disconnect();
				resolve(element1);
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
			attributes: true,
			attributeFilter: ["ssalc".split("").reverse().join(""), "data-e2e"],
		});
		console.log("动启已revresbOnoitatuM".split("").reverse().join(""));
	});
}

class Uitls {
	constructor() {}
	sleep = async (_0x420b36) => {
		return new Promise(
			(
				_0xc46ef8 // TOLOOK
			) => setTimeout(_0xc46ef8, _0x420b36)
		);
	};
	sendMessage = (_0x1abccf) => {
		chrome.runtime.sendMessage({
			action: "updateStatus",
			status: _0x1abccf,
		});
	};
	openPopup = () => {
		chrome.runtime.sendMessage({
			action: "openPopup",
		});
	};
	elementHover = (_0x1067b8, _0x4454db = true) => {
		_0x1067b8.dispatchEvent(
			new MouseEvent(_0x4454db ? "mouseover" : "mouseout", {
				bubbles: true,
			})
		);
	};
	setElementAnimation = (_0x5b1369) => {
		const _0x54c6f2 = "266A247A-6C68-4F89-8D11-B767B4E7A71C";
		const _0x3cbc93 = "animation_" + _0x54c6f2.slice(0, 8);
		const _0x456cdb = "class_" + _0x54c6f2.slice(0, 8);
		if (!document.head.querySelector("style[data-id='" + _0x54c6f2 + "']")) {
			const _0x4b883b = document.createElement("style");
			_0x4b883b.type = "text/css";
			_0x4b883b.setAttribute("data-id", _0x54c6f2);
			const _0x299b00 =
				"\n      @keyframes " +
				_0x3cbc93 +
				`{
        to {  background-color :rgb(255, 0, 0);
              border: 1px solid blue;
              border-radius: 3px;
        }
      }
    `;
			const _0x20d15e =
				"\n      ." +
				_0x456cdb +
				" {\n        animation: " +
				_0x3cbc93 +
				` 0.5s ease-in-out 0s 2 alternate none;
      }
    `;
			_0x4b883b.innerHTML = _0x299b00 + _0x20d15e;
			document.head.appendChild(_0x4b883b);
		}
		_0x5b1369.classList.remove(_0x456cdb);
		_0x5b1369.offsetHeight;
		_0x5b1369.classList.add(_0x456cdb);
		return _0x5b1369;
	};
	waitForChildListChange = async (_0x4e4862, _0x284e4d, _0x5a35dc = 5000) => {
		return new Promise((_0x48d052, _0x3d8f1a) => {
			console.log("等待元素更新:", _0x284e4d, " 超时: " + _0x5a35dc + "ms");
			const _0x2a63ba = // TOLOOK
				setTimeout(() => {
					if (_0x4009f9) {
						_0x4009f9.disconnect();
						console.log(
							"等待元素更新超时: ",
							_0x284e4d,
							"超时时间：" + _0x5a35dc + "ms"
						);
						_0x48d052(false);
					}
				}, _0x5a35dc);
			const _0x4009f9 = new MutationObserver((_0x2e9ca1, _0x1e2a7a) => {
				if (_0x2e9ca1.length > 0) {
					for (const _0x31d7b7 of _0x2e9ca1) {
						if (_0x31d7b7.type === "attributes") {
							if (_0x31d7b7.attributeName === "class") {
							}
						} else if (_0x31d7b7.type === "childList") {
							clearTimeout(_0x2a63ba);
							_0x1e2a7a.disconnect();
							_0x48d052(true);
							return;
						} else if (_0x31d7b7.type === "characterData") {
						}
					}
				}
			});
			_0x4009f9.observe(_0x284e4d, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeOldValue: true,
				characterData: true,
				characterDataOldValue: true,
			});
			if (_0x4e4862) {
				_0x4e4862();
			}
		});
	};
	waitForElementTextChange = async (_0x45fe21, _0x4fb1bd, _0x1e1e91 = 5000) => {
		return new Promise((_0x665d55, _0x1ef8be) => {
			console.log("等待元素更新:", _0x4fb1bd, " 超时: " + _0x1e1e91 + "ms");
			const _0x3ab636 = // TOLOOK
				setTimeout(() => {
					if (_0x5af9d0) {
						_0x5af9d0.disconnect();
						console.log(
							"等待元素更新超时: ",
							_0x4fb1bd,
							"超时时间：" + _0x1e1e91 + "ms"
						);
						_0x665d55(false);
					}
				}, _0x1e1e91);
			const _0x5af9d0 = new MutationObserver((_0x14afed, _0x2fad75) => {
				if (_0x14afed.length > 0) {
					for (const _0x1c6684 of _0x14afed) {
						if (_0x1c6684.type === "attributes") {
							if (_0x1c6684.attributeName === "class") {
							}
						} else if (_0x1c6684.type === "childList") {
						} else if (_0x1c6684.type === "characterData") {
							clearTimeout(_0x3ab636);
							_0x2fad75.disconnect();
							_0x665d55(true);
							return;
						}
					}
				}
			});
			_0x5af9d0.observe(_0x4fb1bd, {
				childList: true,
				subtree: true,
				attributes: true,
				attributeOldValue: true,
				characterData: true,
				characterDataOldValue: true,
			});
			if (_0x45fe21) {
				_0x45fe21();
			}
		});
	};
	waitForElementListTextChange = async (
		_0x5db88c,
		_0x3b6333,
		_0x241fd3 = 5000,
		_0x4d97c3 = true
	) => {
		let _0x36cb38 = [];
		return new Promise((_0x5dda3e, _0x200fa3) => {
			_0x3b6333.forEach((_0x27151b) => {
				this.waitForElementTextChange(undefined, _0x27151b, _0x241fd3).then(
					async (_0x4db317) => {
						_0x36cb38.push({
							target: _0x27151b,
							result: _0x4db317,
						});
						if (_0x4d97c3) {
							if (_0x36cb38.length === _0x3b6333.length) {
								_0x5dda3e(_0x36cb38);
							}
						} else if (_0x36cb38.length == 1) {
							await this.sleep(500);
							_0x5dda3e(_0x36cb38);
						}
					}
				);
			});
			if (_0x5db88c) {
				_0x5db88c();
			}
		});
	};
	waitForElementRemove = async (_0x1ead0e, _0x567cff = 5000) => {
		return new Promise((_0x5724c3, _0x514b15) => {
			const _0x511369 = 10;
			const _0x4780e8 = _0x567cff / _0x511369;
			let _0x44c2b6 = 0;
			const _0x27abaa = // TOLOOK
				setInterval(() => {
					const _0x4be0ad = document.querySelector(_0x1ead0e);
					if (!_0x4be0ad) {
						clearInterval(_0x27abaa);
						_0x5724c3(true);
						return;
					}
					_0x44c2b6++;
					if (_0x44c2b6 < _0x4780e8) {
						console.log(
							"等待元素移除:",
							_0x1ead0e,
							" 超时: " + _0x567cff + "ms",
							"剩余时间：" + (_0x567cff - _0x44c2b6 * _0x511369) + "ms"
						);
					} else {
						console.log(
							"等待元素移除超时: ",
							_0x1ead0e,
							"超时时间：" + _0x567cff + "ms"
						);
						clearInterval(_0x27abaa);
						_0x514b15(false);
					}
				}, _0x511369);
		});
	};
	scrollToElementTop = (_0xc3a3ac) => {
		_0xc3a3ac.scrollIntoView({
			behavior: "smooth",
			block: "start",
			inline: "nearest",
		});
	};
	scrollToElement = (_0x32d485) => {
		_0x32d485.scrollIntoView({
			behavior: "smooth",
			block: "center",
			inline: "nearest",
		});
	};
	scrollToElementBottom = (_0x542188) => {
		_0x542188.scrollIntoView({
			behavior: "smooth",
			block: "end",
			inline: "nearest",
		});
	};
	deepScroll(_0xe50847) {
		return new Promise((_0x21b013, _0x24d9fe) => {
			const _0xcb537b = {
				element: window,
				duration: 500,
				easing: "easeInOutQuad",
				scrollContainers: [],
				..._0xe50847,
			};
			function _0x2fd9ad(_0x41e0c7) {
				const _0x4980e1 = [];
				let _0x5107d6 = _0x41e0c7;
				while (_0x5107d6 && _0x5107d6 !== document.documentElement) {
					if (_0x41f1dd(_0x5107d6)) {
						_0x4980e1.push(_0x5107d6);
					}
					_0x5107d6 = _0x5107d6.parentElement;
				}
				if (_0x4a1c4c()) {
					_0x4980e1.push(window);
				}
				return _0x4980e1;
			}
			function _0x41f1dd(_0x1c4a42) {
				if (_0x1c4a42 === window) {
					return true;
				}
				const _0x2482b0 = getComputedStyle(_0x1c4a42);
				const _0x319b5c =
					_0x2482b0.overflowY === "auto" || _0x2482b0.overflowY === "scroll";
				const _0x462fb8 =
					_0x2482b0.overflowX === "auto" || _0x2482b0.overflowX === "scroll";
				return (
					(_0x319b5c && _0x1c4a42.scrollHeight > _0x1c4a42.clientHeight) ||
					(_0x462fb8 && _0x1c4a42.scrollWidth > _0x1c4a42.clientWidth)
				);
			}
			function _0x4a1c4c() {
				return document.documentElement.scrollHeight > window.innerHeight;
			}
			function _0x27a22e(_0x24e76e, _0x3a859c) {
				const _0x3e69d5 = _0x3a859c.getBoundingClientRect();
				if (_0x24e76e === window) {
					return {
						top: _0x2a4865(
							_0x3e69d5.top - window.pageYOffset + window.outerHeight,
							_0x3e69d5.height,
							window.innerHeight,
							window.outerHeight
						),
						left: _0x2a4865(
							_0x3e69d5.left - window.pageXOffset + window.outerWidth,
							_0x3e69d5.width,
							window.innerWidth,
							window.outerWidth
						),
					};
				}
				const _0x388993 = _0x24e76e.getBoundingClientRect();
				return {
					top: _0x2a4865(
						_0x3e69d5.top - _0x388993.top + _0x24e76e.scrollTop,
						_0x3e69d5.height,
						_0x24e76e.clientHeight,
						_0x24e76e.scrollTop
					),
					left: _0x2a4865(
						_0x3e69d5.left - _0x388993.left + _0x24e76e.scrollLeft,
						_0x3e69d5.width,
						_0x24e76e.clientWidth,
						_0x24e76e.scrollLeft
					),
				};
			}
			function _0x2a4865(_0x1af309, _0x20a909, _0x298d9e, _0x25c75b) {
				const _0x1e634a = _0x25c75b;
				const _0x405bbe = _0x25c75b + _0x298d9e;
				const _0x32cc92 = _0x1af309 + _0x20a909;
				if (_0x1af309 >= _0x1e634a && _0x32cc92 <= _0x405bbe) {
					return _0x25c75b;
				}
				if (_0x1af309 < _0x1e634a) {
					return _0x1af309;
				}
				return _0x32cc92 - _0x298d9e;
			}
			function _0x23cdd3(_0x5f2f28) {
				if (_0x5f2f28 === window) {
					return window.pageYOffset;
				} else {
					return _0x5f2f28.scrollTop;
				}
			}
			function _0x451c03(_0x17b192) {
				if (_0x17b192 === window) {
					return window.pageXOffset;
				} else {
					return _0x17b192.scrollLeft;
				}
			}
			function _0x210323(_0x435de5, _0x19189c, _0x1e1707) {
				if (_0x435de5 === window) {
					window.scrollTo(_0x1e1707, _0x19189c);
				} else {
					_0x435de5.scrollTop = _0x19189c;
					_0x435de5.scrollLeft = _0x1e1707;
				}
			}
			if (_0xcb537b.target) {
				const _0x8ea055 = _0x2fd9ad(_0xcb537b.target);
				let _0x55563e = _0xcb537b.target;
				_0x8ea055.forEach((_0x58303f) => {
					const _0x2944ff = _0x27a22e(_0x58303f, _0x55563e);
					_0xcb537b.scrollContainers.push({
						element: _0x58303f,
						startTop: _0x23cdd3(_0x58303f),
						targetTop: _0x2944ff.top,
						startLeft: _0x451c03(_0x58303f),
						targetLeft: _0x2944ff.left,
					});
					_0x55563e = _0x58303f;
				});
			} else {
				_0xcb537b.scrollContainers.push({
					element: _0xcb537b.element,
					startTop: _0x23cdd3(_0xcb537b.element),
					targetTop: _0xcb537b.top ?? _0x23cdd3(_0xcb537b.element),
					startLeft: _0x451c03(_0xcb537b.element),
					targetLeft: _0xcb537b.left ?? _0x451c03(_0xcb537b.element),
				});
			}
			const _0x187838 = {
				linear: (_0x1309b9) => _0x1309b9,
				easeInQuad: (_0x3036ff) => _0x3036ff * _0x3036ff,
				easeOutQuad: (_0x58abdc) => _0x58abdc * (2 - _0x58abdc),
				easeInOutQuad: (_0x5f2c6f) =>
					_0x5f2c6f < 0.5
						? _0x5f2c6f * 2 * _0x5f2c6f
						: -1 + (4 - _0x5f2c6f * 2) * _0x5f2c6f,
			};
			const _0x35a4ec = _0x187838[_0xcb537b.easing] || _0x187838.easeInOutQuad;
			let _0x3cab40 = null;
			const _0x3e43c6 = () => {
				_0x21b013();
				if (_0xcb537b.target) {
				}
				_0xcb537b.callback?.();
			};
			const _0x53a78b = (_0x133add) => {
				if (!_0x3cab40) {
					_0x3cab40 = _0x133add;
				}
				const _0x40dae7 = _0x133add - _0x3cab40;
				const _0x260317 = Math.min(_0x40dae7 / _0xcb537b.duration, 1);
				const _0x40b178 = _0x35a4ec(_0x260317);
				_0xcb537b.scrollContainers.forEach(
					({
						element: _0x5e1da2,
						startTop: _0x3e5468,
						targetTop: _0x3fa673,
						startLeft: _0x2985c3,
						targetLeft: _0x33b4ae,
					}) => {
						const _0x343f56 = _0x3e5468 + (_0x3fa673 - _0x3e5468) * _0x40b178;
						const _0x9c7923 = _0x2985c3 + (_0x33b4ae - _0x2985c3) * _0x40b178;
						_0x210323(_0x5e1da2, _0x343f56, _0x9c7923);
					}
				);
				if (_0x40dae7 < _0xcb537b.duration) {
					requestAnimationFrame(_0x53a78b);
				} else {
					_0x3e43c6();
				}
			};
			requestAnimationFrame(_0x53a78b);
		});
	}
	ensureElementVisible = (_0x1409f5) => {
		let _0x9c42f6 = _0x1409f5;
		while (_0x9c42f6 && _0x9c42f6 !== document.body) {
			const _0xc0deae = _0x9c42f6.parentNode;
			if (!_0xc0deae) {
				break;
			}
			const _0x4b70d7 = _0xc0deae.scrollHeight > _0xc0deae.clientHeight;
			const _0x2c1092 = _0xc0deae.scrollWidth > _0xc0deae.clientWidth;
			if (_0x4b70d7 || _0x2c1092) {
				const _0x1f88ec = _0xc0deae.getBoundingClientRect();
				const _0x42342a = _0x9c42f6.getBoundingClientRect();
				if (_0x4b70d7) {
					if (_0x42342a.top < _0x1f88ec.top) {
						_0xc0deae.scrollTop -= _0x1f88ec.top - _0x42342a.top;
					} else if (_0x42342a.bottom > _0x1f88ec.bottom) {
						_0xc0deae.scrollTop += _0x42342a.bottom - _0x1f88ec.bottom;
					}
				}
				if (_0x2c1092) {
					if (_0x42342a.left < _0x1f88ec.left) {
						_0xc0deae.scrollLeft -= _0x1f88ec.left - _0x42342a.left;
					} else if (_0x42342a.right > _0x1f88ec.right) {
						_0xc0deae.scrollLeft += _0x42342a.right - _0x1f88ec.right;
					}
				}
			}
			_0x9c42f6 = _0xc0deae;
		}
		const _0x1fa66f = window.scrollY;
		const _0x17d4ff = _0x1fa66f + window.innerHeight;
		const _0x2f0221 = _0x1409f5.offsetTop;
		const _0x45fc68 = _0x2f0221 + _0x1409f5.offsetHeight;
		if (_0x2f0221 < _0x1fa66f) {
			window.scrollTo({
				top: _0x2f0221,
				behavior: "smooth",
			});
		} else if (_0x45fc68 > _0x17d4ff) {
			window.scrollTo({
				top: _0x45fc68 - window.innerHeight,
				behavior: "smooth",
			});
		}
	};
	getTextNodeValue = (_0x4aa8bb, _0xbf55ae = false) => {
		this.setElementAnimation(_0x4aa8bb);
		const _0x3b9a3a = Array.from(_0x4aa8bb.childNodes)
			.filter((_0x5ddf68) => _0x5ddf68.nodeType === Node.TEXT_NODE)
			.map((_0x34cdb6) => _0x34cdb6.textContent)
			.join("");
		if (_0xbf55ae) {
			return +_0x3b9a3a.replace(/[^\d-.]/g, "");
		} else {
			return _0x3b9a3a;
		}
	};
	getElementText = (_0x3aa32e, _0x73dad2 = true) => {
		if (_0x3aa32e) {
			if (_0x73dad2) {
				this.setElementAnimation(_0x3aa32e);
			}
			return _0x3aa32e.textContent;
		}
		return "";
	};
	getElementTextToNumber = (_0x4facb4, _0x5a3362 = true) => {
		if (_0x4facb4) {
			const _0x4ff66e = this.getElementText(_0x4facb4, _0x5a3362).replace(
				/[^\d-.]/g,
				""
			);
			if (_0x4ff66e && !isNaN(_0x4ff66e)) {
				return +_0x4ff66e;
			} else {
				return _0x4ff66e;
			}
		}
		return 0;
	};
	async showInput(_0x2da743) {
		return new Promise((_0x49a3d0, _0x3241a5) => {
			const _0x615fe = chrome.runtime.sendMessage(
				{
					action: "showInput",
					placeholder: _0x2da743,
				},
				(_0x5fafdd) => {
					_0x49a3d0(_0x5fafdd.value);
				}
			);
		});
	}
	getUserInputNumber = async (
		_0x127ba6 = 10,
		_0xffbe5e = "请输入最大数据条数，默认10条，最小1条，最大100条",
		_0x385169 = 100
	) => {
		let _0x105d76 = await this.showInput(_0xffbe5e);
		while (_0x105d76) {
			let _0x42fa18 = 0;
			if (!isNaN(_0x105d76)) {
				_0x42fa18 = parseInt(_0x105d76);
				if (_0x42fa18 > 0 && _0x42fa18 <= _0x385169) {
					_0x127ba6 = _0x42fa18;
					break;
				}
			}
			_0x105d76 = await this.showInput(_0xffbe5e);
		}
		return _0x127ba6;
	};
	waitElementInViewportUseObserver = async (_0x435427, _0x4d96a8 = 5000) => {
		return new Promise((_0x21321a, _0x396738) => {
			const _0x828765 = // TOLOOK
				setTimeout(() => {
					_0x21321a(false);
					_0x1f179c.disconnect();
				}, _0x4d96a8);
			const _0x1f179c = new IntersectionObserver((_0x3fbea4) => {
				_0x3fbea4.forEach(async (_0x5b41bd) => {
					if (_0x5b41bd.isIntersecting) {
						await this.sleep(50);
						_0x21321a(true);
						_0x1f179c.disconnect();
					} else {
						_0x21321a(false);
						_0x1f179c.disconnect();
					}
				});
			});
			_0x1f179c.observe(_0x435427);
		});
	};
	waitElementInViewportUseClientRect = async (
		_0x4e67cc,
		_0x2cbae2 = false,
		_0x328523 = 5000
	) => {
		new Promise(async (_0x2e483b, _0x8b38af) => {
			if (!_0x4e67cc || typeof _0x4e67cc.getBoundingClientRect !== "function") {
				return _0x2e483b(false);
			}
			let _0x151c14 = null;
			const _0x2af8e5 = () => {
				const _0x58f02a = _0x4e67cc.getBoundingClientRect();
				const _0x1b6f3d =
					window.innerHeight || document.documentElement.clientHeight;
				const _0xe69a22 =
					window.innerWidth || document.documentElement.clientWidth;
				let _0x14402c = false;
				if (_0x2cbae2) {
					_0x14402c =
						_0x58f02a.top >= 0 &&
						_0x58f02a.bottom <= _0x1b6f3d &&
						_0x58f02a.left >= 0 &&
						_0x58f02a.right <= _0xe69a22;
				} else {
					const _0x111644 = _0x58f02a.top <= _0x1b6f3d && _0x58f02a.bottom >= 0;
					const _0x3df32a = _0x58f02a.left <= _0xe69a22 && _0x58f02a.right >= 0;
					_0x14402c = _0x111644 && _0x3df32a;
				}
				if (_0x14402c) {
					clearInterval(_0x151c14);
					_0x2e483b(true);
				}
			};
			const _0x3e9d0e = 10;
			const _0x5ecd00 =
				parseInt(_0x328523 / _0x3e9d0e) > 0
					? parseInt(_0x328523 / _0x3e9d0e)
					: 1;
			let _0x3ae192 = 0;
			_0x151c14 = // TOLOOK
				setInterval(() => {
					_0x3ae192++;
					if (_0x3ae192 > _0x5ecd00) {
						clearInterval(_0x151c14);
						_0x2e483b(false);
					} else {
						_0x2af8e5();
					}
				}, _0x3e9d0e);
		});
	};
	simpleUUID() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			(_0xd24d76) => {
				const _0x28c63a = (Math.random() * 16) | 0;
				return (_0xd24d76 === "x" ? _0x28c63a : (_0x28c63a & 3) | 8).toString(
					16
				);
			}
		);
	}
	formatDateTime(_0x1df44d, _0x31d1e3 = false) {
		if (typeof _0x1df44d === "string") {
			_0x1df44d = new Date(_0x1df44d);
		} else if (typeof _0x1df44d === "number") {
			_0x1df44d = new Date(_0x1df44d);
		} else if (!_0x1df44d instanceof Date) {
			return "";
		}
		if (isNaN(_0x1df44d)) {
			return "";
		}
		const _0x4c04ab = {
			year: _0x1df44d.getFullYear(),
			mounth: _0x1df44d.getMonth() + 1,
			day: _0x1df44d.getDate(),
			hour: _0x1df44d.getHours(),
			minute: _0x1df44d.getMinutes(),
			second: _0x1df44d.getSeconds(),
			ms: _0x1df44d.getMilliseconds(),
		};
		const _0x44c904 = (_0x2335b5, _0x4c7919 = 2) => {
			return (_0x2335b5 + "").padStart(_0x4c7919, "0");
		};
		let _0x171970 =
			_0x4c04ab.year +
			"-" +
			_0x44c904(_0x4c04ab.mounth) +
			"-" +
			_0x44c904(_0x4c04ab.day) +
			" " +
			_0x44c904(_0x4c04ab.hour) +
			":" +
			_0x44c904(_0x4c04ab.minute) +
			":" +
			_0x44c904(_0x4c04ab.second);
		if (_0x31d1e3) {
			_0x171970 += ":" + _0x4c04ab.ms;
		}
		return _0x171970;
	}
	formatDate(_0x3ef21c) {
		const _0x461c9a = formatDateTime(_0x3ef21c);
		if (!_0x461c9a) {
			return "";
		} else {
			return _0x461c9a.split(" ")[0];
		}
	}
	parseChineseNumber(_0x4ffdcb) {
		const _0x1b8431 = {
			万亿: 1000000000000,
			千亿: 100000000000,
			百亿: 10000000000,
			十亿: 1000000000,
			亿: 100000000,
			千万: 10000000,
			百万: 1000000,
			万: 10000,
			千: 1000,
			百: 100,
			十: 10,
		};
		let _0x4d2cea = "";
		for (const _0x14a028 in _0x1b8431) {
			if (_0x4d2cea) {
				_0x4d2cea += "|" + _0x14a028;
			} else {
				_0x4d2cea += _0x14a028;
			}
		}
		const _0x3ee9e6 = String(_0x4ffdcb).match(
			new RegExp("^(\\d+.?\\d*)([" + _0x4d2cea + ")]*)")
		);
		if (!_0x3ee9e6) {
			return 0;
		}
		const _0x13c91b = parseFloat(_0x3ee9e6[1]);
		const _0x3e9018 = _0x3ee9e6[2].trim();
		const _0x1242f8 = Object.keys(_0x1b8431).find((_0x5134c7) =>
			_0x3e9018.startsWith(_0x5134c7)
		);
		const _0x9a78a3 = _0x1242f8 ? _0x1b8431[_0x1242f8] : 1;
		if (_0x3e9018 === "千万") {
			return _0x13c91b * 10000000;
		}
		return _0x13c91b * _0x9a78a3;
	}
	querySelector(_0x203254, _0x9b976 = []) {
		let _0x10c585 = null;
		for (const _0x52ee77 of _0x9b976) {
			const _0x3bbe4e = _0x52ee77.match(/(.+):contains\(['"](.+)['"]\)/);
			if (_0x3bbe4e) {
				const _0x48fc93 = _0x3bbe4e[1];
				const _0x4e99ba = _0x3bbe4e[2];
				_0x10c585 = _0x203254.querySelector(_0x48fc93);
				if (_0x10c585 && _0x10c585.textContent.includes(_0x4e99ba)) {
					break;
				}
			} else {
				_0x10c585 = _0x203254.querySelector(_0x52ee77);
				if (_0x10c585) {
					break;
				}
			}
		}
		return _0x10c585;
	}
	querySelectorAll(_0x38854b, _0x6de9d = []) {
		for (const _0x34fbf6 of _0x6de9d) {
			const _0x12a566 = _0x34fbf6.match(/(.+):contains\(['"](.+)['"]\)/);
			if (_0x12a566) {
				const _0xceb35a = _0x12a566[1];
				const _0x32b8f2 = _0x12a566[2];
				node = _0x38854b.querySelectorAll(_0xceb35a);
				if (node && node.length > 0) {
					const _0x2e395f = node.filter((_0x1d7672) =>
						_0x1d7672.textContent.includes(_0x32b8f2)
					);
				}
			} else {
				const _0x52410d = _0x38854b.querySelectorAll(_0x34fbf6);
				if (_0x52410d.length > 0) {
					return _0x52410d;
				}
			}
		}
		return null;
	}
	querySelectorWithText(_0x24d8c4, _0x3ded52 = [], _0x47101b = "") {
		let _0x3f8c55 = null;
		for (const _0x21d53a of _0x3ded52) {
			_0x3f8c55 = _0x24d8c4.querySelectorAll(_0x21d53a);
			if (_0x3f8c55.length > 0) {
				for (const _0x106120 of _0x3f8c55) {
					if (_0x106120.textContent.includes(_0x47101b)) {
						return _0x106120;
					}
				}
			}
		}
		return null;
	}
	querySelectorAllWithText(_0x539bad, _0x4083fd = [], _0xa1f3f5 = "") {
		let _0x4a0577 = null;
		for (const _0x5f3fed of _0x4083fd) {
			_0x4a0577 = _0x539bad.querySelectorAll(_0x5f3fed);
			if (_0x4a0577.length > 0) {
				return _0x4a0577.filter((_0x2db720) =>
					_0x2db720.textContent.includes(_0xa1f3f5)
				);
			}
		}
		return null;
	}
}
const utils = new Uitls();
