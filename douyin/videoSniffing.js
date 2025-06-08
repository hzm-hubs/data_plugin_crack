let sniffedVideoUrl = "";
window.sniffedVideoUrls = window.sniffedVideoUrls || [];
let videoSearchAttempts = 0;
(function () {
  const _0x3f61a7 = [
    ".mp4",
    ".m3u8",
    ".webm",
    ".flv",
    "video",
    "audio",
    "play_url",
    "video_url",
  ];
  function _0x3507e8() {
    const _0x43ea9e = document.querySelectorAll("video");
    for (const _0x2c47bf of _0x43ea9e) {
      if (_0x2c47bf.src) {
        console.log("发现视频元素src:", _0x2c47bf.src);
        _0x23e01b(_0x2c47bf.src);
      }
      const _0x3caf1a = _0x2c47bf.querySelectorAll("source");
      for (const _0x39a9c2 of _0x3caf1a) {
        if (_0x39a9c2.src) {
          console.log("发现视频source元素src:", _0x39a9c2.src);
          _0x23e01b(_0x39a9c2.src);
        }
      }
    }
  }
  function _0x3b6b18() {
    try {
      const _0x8d4633 = [
        "window.__INITIAL_STATE__",
        "window.rawData",
        "window.ssrData",
        "window.__NEXT_DATA__",
        "window.__playInfo__",
        "window.videoData",
        "window.SIGI_STATE",
        "window.VIDEO_INFO",
      ];
      for (const _0x288124 of _0x8d4633) {
        try {
          const _0x452433 = new Function(
            "try { return " + _0x288124 + "; } catch(e) { return null; }"
          )();
          if (_0x452433) {
            console.log("在" + _0x288124 + "中找到数据:", _0x452433);
            _0x34354b(_0x452433);
          }
        } catch (_0xda4823) {
          console.log("尝试提取" + _0x288124 + "时出错:", _0xda4823);
        }
      }
      if (window.RENDER_DATA) {
        try {
          const _0x5b4e15 = JSON.parse(decodeURIComponent(window.RENDER_DATA));
          console.log("找到RENDER_DATA:", _0x5b4e15);
          _0x34354b(_0x5b4e15);
        } catch (_0x127b27) {
          console.log("解析RENDER_DATA时出错:", _0x127b27);
        }
      }
      for (const _0x59dc75 in window) {
        if (
          _0x59dc75.toLowerCase().includes("video") ||
          _0x59dc75.toLowerCase().includes("player") ||
          _0x59dc75.toLowerCase().includes("media") ||
          _0x59dc75.toLowerCase().includes("douyin")
        ) {
          try {
            const _0x2d1c4e = window[_0x59dc75];
            if (_0x2d1c4e && typeof _0x2d1c4e === "object") {
              console.log("在window." + _0x59dc75 + "中找到可能的视频相关对象");
              _0x34354b(_0x2d1c4e);
            }
          } catch (_0x1db1d1) {}
        }
      }
    } catch (_0x2d39d9) {
      console.error("从window提取视频信息出错:", _0x2d39d9);
    }
  }
  function _0x367f3f() {
    const _0x463ebd =
      window.location.href.includes("/search/") ||
      window.location.href.includes("/discover/search");
    console.log(
      "searchForVideoURLInPage - 当前页面类型:",
      _0x463ebd ? "搜索页面" : "普通页面"
    );
    const _0x490e43 = [
      /https:\/\/v(\d+)-\w+\.douyinvod\.com\/[^"'\s]+/g,
      /https:\/\/v(\d+)-dy\.ixigua\.com\/[^"'\s]+/g,
      /https:\/\/v(\d+)-dy-o\.zjcdn\.com\/[^"'\s]+/g,
      /"playAddr":\s*"([^"]+)"/g,
      /"play_url":\s*"([^"]+)"/g,
      /"downloadAddr":\s*"([^"]+)"/g,
      /playAddr:\s*'([^']+)'/g,
      /src="(https:\/\/[^"]+\.mp4[^"]*)"/,
    ];
    if (_0x463ebd) {
      _0x490e43.push(
        /"src":\s*"([^"]+\.mp4[^"]*)"/g,
        /"url":\s*"([^"]+)"/g,
        /"video_url":\s*"([^"]+)"/g,
        /url:'([^']+\.mp4[^']*)'/g,
        /source:"([^"]+\.mp4[^"]*)"/g,
        /https:\/\/[^"'\s]*\.mp4[^"'\s]*/g
      );
    }
    const _0x4b80b2 = document.documentElement.outerHTML;
    for (const _0x306750 of _0x490e43) {
      const _0x362e7d = _0x4b80b2.match(_0x306750);
      if (_0x362e7d && _0x362e7d.length) {
        for (const _0x583db9 of _0x362e7d) {
          let _0xb2d259 = _0x583db9;
          if (
            _0x583db9.includes('playAddr":') ||
            _0x583db9.includes('play_url":') ||
            _0x583db9.includes('downloadAddr":') ||
            _0x583db9.includes('video_url":') ||
            _0x583db9.includes('src":') ||
            _0x583db9.includes('url":')
          ) {
            const _0x4d00d4 = /":\s*"([^"]+)"/.exec(_0x583db9);
            if (_0x4d00d4 && _0x4d00d4[1]) {
              _0xb2d259 = _0x4d00d4[1].replace(/\\u002F/g, "/");
            }
          } else if (
            _0x583db9.includes("playAddr:") ||
            _0x583db9.includes("url:") ||
            _0x583db9.includes("source:")
          ) {
            const _0x121a32 = /'([^']+)'/.exec(_0x583db9);
            if (_0x121a32 && _0x121a32[1]) {
              _0xb2d259 = _0x121a32[1].replace(/\\u002F/g, "/");
            }
          } else if (_0x583db9.includes('src="')) {
            const _0x5e4702 = /src="([^"]+)"/.exec(_0x583db9);
            if (_0x5e4702 && _0x5e4702[1]) {
              _0xb2d259 = _0x5e4702[1];
            }
          }
          console.log("从页面HTML中找到视频URL:", _0xb2d259);
          if (_0xb2d259.startsWith("http")) {
            _0x23e01b(_0xb2d259);
          }
        }
      }
    }
    if (_0x463ebd) {
      const _0x55f20d = document.querySelectorAll("video");
      if (_0x55f20d && _0x55f20d.length > 0) {
        console.log("搜索页面找到 " + _0x55f20d.length + " 个视频元素");
        for (const _0x464050 of _0x55f20d) {
          try {
            if (_0x464050.currentSrc) {
              console.log("视频元素currentSrc:", _0x464050.currentSrc);
              _0x23e01b(_0x464050.currentSrc);
            }
            if (_0x464050.src) {
              console.log("视频元素src:", _0x464050.src);
              _0x23e01b(_0x464050.src);
            }
            if (_0x464050.srcObject) {
              console.log("视频元素srcObject:", _0x464050.srcObject);
            }
            for (
              let _0x42913b = 0;
              _0x42913b < _0x464050.attributes.length;
              _0x42913b++
            ) {
              const _0x32e520 = _0x464050.attributes[_0x42913b];
              if (
                _0x32e520.value &&
                (_0x32e520.value.includes(".mp4") ||
                  _0x32e520.value.includes("douyinvod") ||
                  _0x32e520.value.includes("-dy.") ||
                  _0x32e520.value.includes("ixigua"))
              ) {
                console.log(
                  "视频元素属性 " + _0x32e520.name + ":",
                  _0x32e520.value
                );
                _0x23e01b(_0x32e520.value);
              }
            }
          } catch (_0x36d9cb) {
            console.error("访问视频元素属性时出错:", _0x36d9cb);
          }
        }
      }
      const _0x287dc9 = document.querySelectorAll(
        "[data-e2e], [data-src], [data-video], [data-player]"
      );
      if (_0x287dc9 && _0x287dc9.length > 0) {
        console.log(
          "搜索页面找到 " + _0x287dc9.length + " 个可能包含视频数据的元素"
        );
        for (const _0x13d7b8 of _0x287dc9) {
          for (
            let _0x1d52fa = 0;
            _0x1d52fa < _0x13d7b8.attributes.length;
            _0x1d52fa++
          ) {
            const _0x4ec71f = _0x13d7b8.attributes[_0x1d52fa];
            if (_0x4ec71f.name.startsWith("data-") && _0x4ec71f.value) {
              try {
                const _0xf4ad3d = JSON.parse(_0x4ec71f.value);
                _0x34354b(_0xf4ad3d);
              } catch (_0x72bd7e) {
                if (
                  _0x4ec71f.value.includes(".mp4") ||
                  _0x4ec71f.value.includes("douyinvod") ||
                  _0x4ec71f.value.includes("-dy.") ||
                  _0x4ec71f.value.includes("ixigua")
                ) {
                  console.log(
                    "在元素 " +
                      _0x13d7b8.tagName +
                      " 的 " +
                      _0x4ec71f.name +
                      " 属性中找到潜在视频URL:",
                    _0x4ec71f.value
                  );
                  _0x23e01b(_0x4ec71f.value);
                }
              }
            }
          }
        }
      }
    }
    const _0x41200f = document.querySelectorAll('.xgplayer, [class*="player"]');
    if (_0x41200f && _0x41200f.length > 0) {
      console.log("找到视频播放器，尝试获取数据属性");
      for (const _0xc2846f of _0x41200f) {
        for (const _0x4d5bb1 of _0xc2846f.attributes) {
          const _0x12125d = _0x4d5bb1.name;
          const _0x49e3dd = _0x4d5bb1.value;
          if (
            _0x49e3dd &&
            (_0x49e3dd.includes(".mp4") ||
              _0x49e3dd.includes("-dy.") ||
              _0x49e3dd.includes("douyinvod") ||
              _0x49e3dd.includes("https://v"))
          ) {
            console.log(
              "在播放器属性" + _0x12125d + "中找到视频URL:",
              _0x49e3dd
            );
            _0x23e01b(_0x49e3dd);
          }
          if (_0x12125d.startsWith("data-")) {
            try {
              const _0xc8e66b = JSON.parse(_0x49e3dd);
              _0x34354b(_0xc8e66b);
            } catch (_0x418478) {
              if (
                _0x49e3dd &&
                (_0x49e3dd.includes(".mp4") ||
                  _0x49e3dd.includes("-dy.") ||
                  _0x49e3dd.includes("douyinvod"))
              ) {
                console.log(
                  "在播放器数据属性" + _0x12125d + "中找到视频URL:",
                  _0x49e3dd
                );
                _0x23e01b(_0x49e3dd);
              }
            }
          }
        }
      }
    }
    if (!sniffedVideoUrl && _0x463ebd) {
      if (window.performance && window.performance.getEntries) {
        try {
          const _0x57cdd0 = window.performance.getEntries();
          for (const _0x2615b1 of _0x57cdd0) {
            if (_0x2615b1.name && typeof _0x2615b1.name === "string") {
              if (
                _0x2615b1.name.includes("douyinvod.com") ||
                _0x2615b1.name.includes("v3-dy") ||
                _0x2615b1.name.includes("v26-dy") ||
                _0x2615b1.name.includes("v9-dy")
              ) {
                console.log("在网络请求中发现视频URL:", _0x2615b1.name);
                _0x23e01b(_0x2615b1.name);
                if (sniffedVideoUrl) {
                  break;
                }
              }
            }
          }
        } catch (_0x4adb01) {
          console.error("分析网络请求时出错:", _0x4adb01);
        }
      }
    }
  }
  function _0x34354b(_0x4b4719, _0x4871b8 = 0) {
    if (_0x4871b8 > 5) {
      return;
    }
    if (!_0x4b4719 || typeof _0x4b4719 !== "object") {
      return;
    }
    const _0xf4d14d =
      window.location.href.includes("/search/") ||
      window.location.href.includes("/discover/search");
    const _0x574b76 = [
      "playAddr",
      "play_url",
      "downloadAddr",
      "video_url",
      "videoUrl",
      "url",
      "src",
      "download_url",
      "play_addr",
      "video_id",
      "mp4url",
      "bitrate",
      "urlList",
      "video_list",
    ];
    if (_0xf4d14d) {
      _0x574b76.push(
        "source",
        "media",
        "mediaUrl",
        "file",
        "uri",
        "display_url",
        "srcUrl",
        "videoResource",
        "videoData",
        "video_origin_url",
        "main_url",
        "backup_url",
        "download_url",
        "download_uri"
      );
    }
    for (const _0x1a90cf in _0x4b4719) {
      const _0x578111 = _0x4b4719[_0x1a90cf];
      if (_0x574b76.includes(_0x1a90cf)) {
        if (typeof _0x578111 === "string" && _0x578111.includes("http")) {
          console.log("在对象属性" + _0x1a90cf + "中找到视频URL:", _0x578111);
          _0x23e01b(_0x578111);
          if (sniffedVideoUrl) {
            return;
          }
        } else if (Array.isArray(_0x578111)) {
          for (const _0x5957d3 of _0x578111) {
            if (typeof _0x5957d3 === "string" && _0x5957d3.includes("http")) {
              console.log(
                "在对象属性" + _0x1a90cf + "数组中找到视频URL:",
                _0x5957d3
              );
              _0x23e01b(_0x5957d3);
              if (sniffedVideoUrl) {
                return;
              }
            } else if (typeof _0x5957d3 === "object") {
              _0x34354b(_0x5957d3, _0x4871b8 + 1);
              if (sniffedVideoUrl) {
                return;
              }
            }
          }
        }
      }
      if (_0xf4d14d) {
        if (
          _0x1a90cf === "video" ||
          _0x1a90cf === "aweme" ||
          _0x1a90cf === "detail" ||
          _0x1a90cf === "item" ||
          _0x1a90cf === "media" ||
          _0x1a90cf === "stream"
        ) {
          console.log("发现可能包含视频数据的对象: " + _0x1a90cf);
          if (typeof _0x578111 === "object") {
            _0x34354b(_0x578111, _0x4871b8 + 1);
            if (sniffedVideoUrl) {
              return;
            }
          }
        }
        if (
          typeof _0x578111 === "string" &&
          (_0x578111.includes(".mp4") ||
            _0x578111.includes("douyinvod.com") ||
            _0x578111.includes("-dy.ixigua.com") ||
            _0x578111.includes("v3-dy-o.zjcdn.com"))
        ) {
          console.log("在属性" + _0x1a90cf + "中找到视频URL:", _0x578111);
          _0x23e01b(_0x578111);
          if (sniffedVideoUrl) {
            return;
          }
        }
      }
      if (_0x578111 && typeof _0x578111 === "object") {
        _0x34354b(_0x578111, _0x4871b8 + 1);
        if (sniffedVideoUrl) {
          return;
        }
      }
    }
  }
  const _0x4c5418 = ["/media-audio"];
  function _0x23e01b(_0x421766) {
    if (!_0x421766) {
      return;
    }
    try {
      _0x421766 = decodeURIComponent(_0x421766);
    } catch (_0x2d543b) {}
    if (
      _0x421766.includes("v3-dy-o.zjcdn.com/") ||
      _0x421766.includes("v26-dy.ixigua.com/") ||
      _0x421766.includes("v9-dy.ixigua.com/") ||
      _0x421766.includes("v3-dy.ixigua.com/") ||
      _0x421766.includes("douyinvod.com/") ||
      (_0x421766.includes(".mp4") && _0x421766.includes("douyin"))
    ) {
      for (let _0x3a01cb of _0x4c5418) {
        if (_0x421766.includes(_0x3a01cb)) {
          return;
        }
      }
      console.log("检测到抖音视频资源：", _0x421766);
      if (!window.sniffedVideoUrls.includes(_0x421766)) {
        window.sniffedVideoUrls.push(_0x421766);
        console.log(
          "新的视频URL已添加到数组，当前共有",
          window.sniffedVideoUrls.length,
          "个URL"
        );
      }
      sniffedVideoUrl = _0x421766;
      return;
    }
    for (let _0x205819 of _0x3f61a7) {
      if (_0x421766.indexOf(_0x205819) !== -1) {
        console.log("检测到媒体资源：", _0x421766);
        if (!window.sniffedVideoUrls.includes(_0x421766)) {
          window.sniffedVideoUrls.push(_0x421766);
        }
        if (!sniffedVideoUrl) {
          sniffedVideoUrl = _0x421766;
        }
        break;
      }
    }
  }
  chrome.runtime.onMessage.addListener((_0x5f169d, _0x558fc1, _0x499252) => {
    if (_0x5f169d.action === "watchRequest") {
      _0x23e01b(_0x5f169d.url);
    }
  });
  // TOLOOK
  setInterval(_0x3507e8, 1000);
  // TOLOOK
  setInterval(() => {
    if (!sniffedVideoUrl && videoSearchAttempts < 10) {
      _0x367f3f();
      _0x3b6b18();
      videoSearchAttempts++;
    }
  }, 1000);
  const _0x389d99 = new MutationObserver((_0x309b8f) => {
    if (!sniffedVideoUrl) {
      _0x3507e8();
      for (const _0x237caa of _0x309b8f) {
        if (_0x237caa.type === "childList") {
          for (const _0x2999de of _0x237caa.addedNodes) {
            if (_0x2999de.nodeName === "VIDEO") {
              console.log("检测到新的VIDEO元素:", _0x2999de);
              if (_0x2999de.src) {
                _0x23e01b(_0x2999de.src);
              }
            } else if (_0x2999de.nodeType === 1) {
              const _0x1c258c = _0x2999de.querySelectorAll("video");
              for (const _0x3f91c1 of _0x1c258c) {
                console.log("在新添加的DOM中检测到VIDEO元素:", _0x3f91c1);
                if (_0x3f91c1.src) {
                  _0x23e01b(_0x3f91c1.src);
                }
              }
            }
          }
        }
      }
    }
  });
  _0x389d99.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  console.log("增强版媒体嗅探工具已启动...");
})();
