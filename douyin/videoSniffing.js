let sniffedVideoUrl = "";
window.sniffedVideoUrls = window.sniffedVideoUrls || [];
let videoSearchAttempts = 0;
(function () {
    const videoFormats = [".mp4", ".m3u8", ".webm", ".flv", "video", "audio", "play_url", "video_url"];
    function findVideos() {
        const videoElems = document.querySelectorAll("video");
        for (const videoElem of videoElems) {
            if (videoElem.src) {
                console.log("发现视频元素src:", videoElem.src);
                checkUrl(videoElem.src);
            }
            const videoSources = videoElem.querySelectorAll("source");
            for (const source of videoSources) {
                if (source.src) {
                    console.log("发现视频source元素src:", source.src);
                    checkUrl(source.src);
                }
            }
        }
    }
    function extractVideoData() {
        try {
            const dataSources = ["window.__INITIAL_STATE__", "window.rawData", "window.ssrData", "window.__NEXT_DATA__", "window.__playInfo__", "window.videoData", "window.SIGI_STATE", "window.VIDEO_INFO"];
            for (const source of dataSources) {
                try {
                    const parsedData = new Function(`try { return ${source}; } catch(e) { return null; }`)();
                    if (parsedData) {
                        console.log(`在${source}中找到数据:`, parsedData);
                        findVideo(parsedData);
                    }
                } catch (e) {
                    console.log(`尝试提取${source}时出错:`, e);
                }
            }
            if (window.RENDER_DATA) {
                try {
                    const renderData = JSON.parse(decodeURIComponent(window.RENDER_DATA));
                    console.log("找到RENDER_DATA:", renderData);
                    findVideo(renderData);
                } catch (e) {
                    console.log("解析RENDER_DATA时出错:", e);
                }
            }
            for (const key in window) {
                if (key.toLowerCase().includes("video") || key.toLowerCase().includes("player") || key.toLowerCase().includes("media") || key.toLowerCase().includes("douyin")) {
                    try {
                        const videoObj = window[key];
                        if (videoObj && typeof videoObj === "object") {
                            console.log(`在window.${key}中找到可能的视频相关对象`);
                            findVideo(videoObj);
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {
            console.error("从window提取视频信息出错:", e);
        }
    }
    function extractVideoUrls() {
        const isSearchPage = window.location.href.includes("/search/") || window.location.href.includes("/discover/search");
        console.log("searchForVideoURLInPage - 当前页面类型:", isSearchPage ? "搜索页面" : "普通页面");
        const videoRegexes = [new RegExp("https:\\/\\/v(\\d+)-\\w+\\.douyinvod\\.com\\/[^\"'\\s]+", "g"), new RegExp("https:\\/\\/v(\\d+)-dy\\.ixigua\\.com\\/[^\"'\\s]+", "g"), new RegExp("https:\\/\\/v(\\d+)-dy-o\\.zjcdn\\.com\\/[^\"'\\s]+", "g"), new RegExp("\"playAddr\":\\s*\"([^\"]+)\"", "g"), new RegExp("\"play_url\":\\s*\"([^\"]+)\"", "g"), new RegExp("\"downloadAddr\":\\s*\"([^\"]+)\"", "g"), new RegExp("playAddr:\\s*'([^']+)'", "g"), new RegExp("src=\"(https:\\/\\/[^\"]+\\.mp4[^\"]*)\"", "")];
        if (isSearchPage) {
            videoRegexes.push(new RegExp("\"src\":\\s*\"([^\"]+\\.mp4[^\"]*)\"", "g"), new RegExp("\"url\":\\s*\"([^\"]+)\"", "g"), new RegExp("\"video_url\":\\s*\"([^\"]+)\"", "g"), new RegExp("url:'([^']+\\.mp4[^']*)'", "g"), new RegExp("source:\"([^\"]+\\.mp4[^\"]*)\"", "g"), new RegExp("https:\\/\\/[^\"'\\s]*\\.mp4[^\"'\\s]*", "g"));
        }
        const pageHTML = document.documentElement.outerHTML;
        for (const videoRegex of videoRegexes) {
            const videoUrls = pageHTML.match(videoRegex);
            if (videoUrls && videoUrls.length) {
                for (const videoUrl of videoUrls) {
                    let videoSrc1 = videoUrl;
                    if (videoUrl.includes("playAddr\":") || videoUrl.includes("play_url\":") || videoUrl.includes("downloadAddr\":") || videoUrl.includes("video_url\":") || videoUrl.includes("src\":") || videoUrl.includes("url\":")) {
                        const urlMatch = new RegExp("\":\\s*\"([^\"]+)\"", "").exec(videoUrl);
                        if (urlMatch && urlMatch[1]) {
                            videoSrc1 = urlMatch[1].replace(new RegExp("\\\\u002F", "g"), "/");
                        }
                    } else {
                        if (videoUrl.includes("playAddr:") || videoUrl.includes("url:") || videoUrl.includes("source:")) {
                            const urlMatch = new RegExp("'([^']+)'", "").exec(videoUrl);
                            if (urlMatch && urlMatch[1]) {
                                videoSrc1 = urlMatch[1].replace(new RegExp("\\\\u002F", "g"), "/");
                            }
                        } else {
                            if (videoUrl.includes("src=\"")) {
                                const urlMatch = new RegExp("src=\"([^\"]+)\"", "").exec(videoUrl);
                                if (urlMatch && urlMatch[1]) {
                                    videoSrc1 = urlMatch[1];
                                }
                            }
                        }
                    }
                    console.log("从页面HTML中找到视频URL:", videoSrc1);
                    if (videoSrc1.startsWith("http")) {
                        checkUrl(videoSrc1);
                    }
                }
            }
        }
        if (isSearchPage) {
            const videoElements = document.querySelectorAll("video");
            if (videoElements && videoElements.length > 0) {
                console.log(`搜索页面找到 ${videoElements.length} 个视频元素`);
                for (const videoElement of videoElements) {
                    try {
                        if (videoElement.currentSrc) {
                            console.log("视频元素currentSrc:", videoElement.currentSrc);
                            checkUrl(videoElement.currentSrc);
                        }
                        if (videoElement.src) {
                            console.log("视频元素src:", videoElement.src);
                            checkUrl(videoElement.src);
                        }
                        if (videoElement.srcObject) {
                            console.log("视频元素srcObject:", videoElement.srcObject);
                        }
                        for (let i = 0; i < videoElement.attributes.length; i++) {
                            const attr = videoElement.attributes[i];
                            if (attr.value && (attr.value.includes(".mp4") || attr.value.includes("douyinvod") || attr.value.includes("-dy.") || attr.value.includes("ixigua"))) {
                                console.log(`视频元素属性 ${attr.name}:`, attr.value);
                                checkUrl(attr.value);
                            }
                        }
                    } catch (e) {
                        console.error("访问视频元素属性时出错:", e);
                    }
                }
            }
            const dataElements = document.querySelectorAll("[data-e2e], [data-src], [data-video], [data-player]");
            if (dataElements && dataElements.length > 0) {
                console.log(`搜索页面找到 ${dataElements.length} 个可能包含视频数据的元素`);
                for (const element of dataElements) {
                    for (let i = 0; i < element.attributes.length; i++) {
                        const attr = element.attributes[i];
                        if (attr.name.startsWith("data-") && attr.value) {
                            try {
                                const videoData = JSON.parse(attr.value);
                                findVideo(videoData);
                            } catch (e) {
                                if (attr.value.includes(".mp4") || attr.value.includes("douyinvod") || attr.value.includes("-dy.") || attr.value.includes("ixigua")) {
                                    console.log(`在元素 ${element.tagName} 的 ${attr.name} 属性中找到潜在视频URL:`, attr.value);
                                    checkUrl(attr.value);
                                }
                            }
                        }
                    }
                }
            }
        }
        const videoPlayers = document.querySelectorAll(".xgplayer, [class*=\"player\"]");
        if (videoPlayers && videoPlayers.length > 0) {
            console.log("找到视频播放器，尝试获取数据属性");
            for (const player of videoPlayers) {
                for (const attr of player.attributes) {
                    const attrName = attr.name;
                    const videoUrl = attr.value;
                    if (videoUrl && (videoUrl.includes(".mp4") || videoUrl.includes("-dy.") || videoUrl.includes("douyinvod") || videoUrl.includes("https://v"))) {
                        console.log(`在播放器属性${attrName}中找到视频URL:`, videoUrl);
                        checkUrl(videoUrl);
                    }
                    if (attrName.startsWith("data-")) {
                        try {
                            const videoData = JSON.parse(videoUrl);
                            findVideo(videoData);
                        } catch (e) {
                            if (videoUrl && (videoUrl.includes(".mp4") || videoUrl.includes("-dy.") || videoUrl.includes("douyinvod"))) {
                                console.log(`在播放器数据属性${attrName}中找到视频URL:`, videoUrl);
                                checkUrl(videoUrl);
                            }
                        }
                    }
                }
            }
        }
        if (!sniffedVideoUrl && isSearchPage) {
            if (window.performance && window.performance.getEntries) {
                try {
                    const perfEntries = window.performance.getEntries();
                    for (const perfEntry of perfEntries) {
                        if (perfEntry.name && typeof perfEntry.name === "string") {
                            if (perfEntry.name.includes("douyinvod.com") || perfEntry.name.includes("v3-dy") || perfEntry.name.includes("v26-dy") || perfEntry.name.includes("v9-dy")) {
                                console.log("在网络请求中发现视频URL:", perfEntry.name);
                                checkUrl(perfEntry.name);
                                if (sniffedVideoUrl) {
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("分析网络请求时出错:", e);
                }
            }
        }
    }
    function findVideo(obj, depth = 0) {
        if (depth > 5) {
            return;
        }
        if (!obj || typeof obj !== "object") {
            return;
        }
        const isSearchPage = window.location.href.includes("/search/") || window.location.href.includes("/discover/search");
        const videoKeys = ["playAddr", "play_url", "downloadAddr", "video_url", "videoUrl", "url", "src", "download_url", "play_addr", "video_id", "mp4url", "bitrate", "urlList", "video_list"];
        if (isSearchPage) {
            videoKeys.push("source", "media", "mediaUrl", "file", "uri", "display_url", "srcUrl", "videoResource", "videoData", "video_origin_url", "main_url", "backup_url", "download_url", "download_uri");
        }
        for (const key in obj) {
            const videoData = obj[key];
            if (videoKeys.includes(key)) {
                if (typeof videoData === "string" && videoData.includes("http")) {
                    console.log(`在对象属性${key}中找到视频URL:`, videoData);
                    checkUrl(videoData);
                    if (sniffedVideoUrl) {
                        return;
                    }
                } else {
                    if (Array.isArray(videoData)) {
                        for (const videoItem of videoData) {
                            if (typeof videoItem === "string" && videoItem.includes("http")) {
                                console.log(`在对象属性${key}数组中找到视频URL:`, videoItem);
                                checkUrl(videoItem);
                                if (sniffedVideoUrl) {
                                    return;
                                }
                            } else {
                                if (typeof videoItem === "object") {
                                    findVideo(videoItem, depth + 1);
                                    if (sniffedVideoUrl) {
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (isSearchPage) {
                if (key === "video" || key === "aweme" || key === "detail" || key === "item" || key === "media" || key === "stream") {
                    console.log(`发现可能包含视频数据的对象: ${key}`);
                    if (typeof videoData === "object") {
                        findVideo(videoData, depth + 1);
                        if (sniffedVideoUrl) {
                            return;
                        }
                    }
                }
                if (typeof videoData === "string" && (videoData.includes(".mp4") || videoData.includes("douyinvod.com") || videoData.includes("-dy.ixigua.com") || videoData.includes("v3-dy-o.zjcdn.com"))) {
                    console.log(`在属性${key}中找到视频URL:`, videoData);
                    checkUrl(videoData);
                    if (sniffedVideoUrl) {
                        return;
                    }
                }
            }
            if (videoData && typeof videoData === "object") {
                findVideo(videoData, depth + 1);
                if (sniffedVideoUrl) {
                    return;
                }
            }
        }
    }
    function checkUrl(url) {
        if (!url) {
            return;
        }
        try {
            url = decodeURIComponent(url);
        } catch (e) {}
        if (url.includes("v3-dy-o.zjcdn.com/") || url.includes("v26-dy.ixigua.com/") || url.includes("v9-dy.ixigua.com/") || url.includes("v3-dy.ixigua.com/") || url.includes("douyinvod.com/") || url.includes(".mp4") && url.includes("douyin")) {
            console.log("检测到抖音视频资源：", url);
            if (!window.sniffedVideoUrls.includes(url)) {
                window.sniffedVideoUrls.push(url);
                console.log("新的视频URL已添加到数组，当前共有", window.sniffedVideoUrls.length, "个URL");
            }
            sniffedVideoUrl = url;
            return;
        }
        for (let format of videoFormats) {
            if (url.indexOf(format) !== -1) {
                console.log("检测到媒体资源：", url);
                if (!window.sniffedVideoUrls.includes(url)) {
                    window.sniffedVideoUrls.push(url);
                }
                if (!sniffedVideoUrl) {
                    sniffedVideoUrl = url;
                }
                break;
            }
        }
    }
    const findVideoUrls = window.fetch;
    window.fetch = function () {
        const urlArg = arguments[0]?.url || arguments[0];
        if (typeof urlArg === "string") {
            checkUrl(urlArg);
        }
        return findVideoUrls.apply(this, arguments).then(response => {
            if (response.url) {
                checkUrl(response.url);
            }
            return response;
        });
    };
    const videoSrc = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
        if (url) {
            checkUrl(url);
        }
        return videoSrc.apply(this, arguments);
    };
    setInterval(findVideos, 1000);
    setInterval(() => {
        if (!sniffedVideoUrl && videoSearchAttempts < 10) {
            extractVideoUrls();
            extractVideoData();
            videoSearchAttempts++;
        }
    }, 1000);
    const extractVideoURLs = new MutationObserver(mutations => {
        if (!sniffedVideoUrl) {
            findVideos();
            for (const mutation of mutations) {
                if (mutation.type === "childList") {
                    for (const newNode of mutation.addedNodes) {
                        if (newNode.nodeName === "VIDEO") {
                            console.log("检测到新的VIDEO元素:", newNode);
                            if (newNode.src) {
                                checkUrl(newNode.src);
                            }
                        } else {
                            if (newNode.nodeType === 1) {
                                const videoElements = newNode.querySelectorAll("video");
                                for (const video of videoElements) {
                                    console.log("在新添加的DOM中检测到VIDEO元素:", video);
                                    if (video.src) {
                                        checkUrl(video.src);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    extractVideoURLs.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    console.log("增强版媒体嗅探工具已启动...");
})();
