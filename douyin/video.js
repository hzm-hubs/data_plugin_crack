function isDouyinVideoModal() {
    console.log("检查是否为抖音视频详情modal...");
    const hasModalId = window.location.href.includes("modal_id=");
    console.log("URL是否包含modal_id参数:", hasModalId);
    const modalSelectors = ["div[data-e2e=\"modal-video-container\"]", ".vtCDirga.modal-video-container", ".vtCDirga.modal-video-container.m3vr37Qp", ".modal-video-container"];
    for (const selector of modalSelectors) {
        const selectedElement = document.querySelector(selector);
        console.log(`检查选择器 ${selector}:`, selectedElement !== null);
    }
    const videoModal = document.querySelector(modalSelectors.join(", "));
    console.log("是否找到视频modal容器:", videoModal !== null);
    if (videoModal) {
        const videoInfo = videoModal.querySelector(".AXQAavwp div[data-e2e=\"video-info\"], .video-info-detail");
        console.log("是否找到视频信息区域:", videoInfo !== null);
        const interactionBox = videoModal.querySelector(".MarSXdLE, .MarSXdLE.YmptQEz6.nRO8QGrO.positionBox");
        console.log("是否找到视频交互区域:", interactionBox !== null);
    }
    const isVideoModal = hasModalId && videoModal !== null;
    console.log("当前页面是否为视频详情modal:", isVideoModal);
    return isVideoModal;
}
async function scrapeDouyinVideoModal(videoId, videoOptions, videoData, videoUrl, videoData2, videoElem, videoModal, videoData3, videoModal2, modalData, isVideoModal, hasVideo, hasModal, videoModal3) {
    console.log("开始抓取抖音视频详情modal...");
    console.log("当前URL:", window.location.href);
    console.log("是否包含modal_id:", window.location.href.includes("modal_id="));
    sniffedVideoUrl = "";
    if (!window.sniffedVideoUrls) {
        window.sniffedVideoUrls = [];
    } else {
        console.log("已有嗅探视频URL列表，共", window.sniffedVideoUrls.length, "个");
    }
    videoSearchAttempts = 0;
    videoId = "";
    const modalId = window.location.href.match(new RegExp("modal_id=([0-9]+)", ""));
    if (modalId && modalId[1]) {
        videoId = modalId[1];
        console.log("从URL提取视频ID:", videoId);
    } else {
        console.error("URL中未找到modal_id参数");
        return {
            error: true,
            message: "URL中未找到modal_id参数",
            title: "无法获取视频数据",
            description: "请确认当前URL包含modal_id参数",
            link: window.location.href
        };
    }
    const isFromSearch = window.location.href.includes("/search/") || window.location.href.includes("/discover/search");
    console.log("视频弹窗来源:", isFromSearch ? "搜索页面" : "用户页面/其他");
    if (isFromSearch) {
        console.log("检测到来自搜索页的视频弹窗，使用增强嗅探");
        await new Promise(resolve => setTimeout(resolve, 1000));
        const videoSelectors = ["video.xgplayer-video", ".xg-video video", ".player-container video", ".xgplayer-inner video", "[class*=\"player\"] video"];
        for (const selector of videoSelectors) {
            const videoElems = document.querySelectorAll(selector);
            console.log(`使用选择器 "${selector}" 找到 ${videoElems.length} 个视频元素`);
            for (const video of videoElems) {
                try {
                    if (video && !video.src) {
                        console.log("尝试播放视频以触发资源加载");
                        video.play().catch(e => console.log("播放视频失败，这是预期的行为"));
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                    if (video.src) {
                        console.log("找到视频元素src:", video.src);
                        if (video.src.includes("v3-dy-o.zjcdn.com/") || video.src.includes("v26-dy.ixigua.com/") || video.src.includes("v9-dy.ixigua.com/") || video.src.includes("v3-dy.ixigua.com/") || video.src.includes("douyinvod.com/") || video.src.includes(".mp4") && video.src.includes("douyin")) {
                            sniffedVideoUrl = video.src;
                            console.log("在搜索页视频元素中找到视频URL:", sniffedVideoUrl);
                        }
                    }
                    if (!sniffedVideoUrl) {
                        const attributes = video.attributes;
                        for (let i = 0; i < attributes.length; i++) {
                            const attrName = attributes[i].name;
                            const attrValue = attributes[i].value;
                            if (attrName.startsWith("data-") && attrValue && (attrValue.includes(".mp4") || attrValue.includes("douyinvod") || attrValue.includes("-dy.") || attrValue.includes("v3-dy"))) {
                                console.log(`在视频元素的属性 ${attrName} 中找到可能的URL:`, attrValue);
                                try {
                                    const jsonData = JSON.parse(attrValue);
                                    searchForVideoURLInObject(jsonData);
                                } catch (e) {
                                    if (attrValue.startsWith("http")) {
                                        sniffedVideoUrl = attrValue;
                                        console.log("从视频属性中获取视频URL:", sniffedVideoUrl);
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.error("处理视频元素时出错:", e);
                }
            }
            if (sniffedVideoUrl) {
                break;
            }
        }
        if (!sniffedVideoUrl) {
            const players = document.querySelectorAll(".xgplayer, [class*=\"player\"], [class*=\"Player\"], .swiper-slide-active");
            console.log(`找到 ${players.length} 个可能的播放器容器`);
            for (const player of players) {
                try {
                    const attributes = player.attributes;
                    for (let i = 0; i < attributes.length; i++) {
                        const attrName = attributes[i].name;
                        const attrValue = attributes[i].value;
                        if (attrValue && (attrValue.includes(".mp4") || attrValue.includes("douyinvod") || attrValue.includes("-dy.") || attrValue.includes("v3-dy"))) {
                            console.log(`在播放器容器的属性 ${attrName} 中找到可能的URL:`, attrValue);
                            if (attrValue.startsWith("http")) {
                                sniffedVideoUrl = attrValue;
                                console.log("从播放器容器属性中获取视频URL:", sniffedVideoUrl);
                                break;
                            }
                        }
                        if (attrName.startsWith("data-")) {
                            try {
                                const jsonData = JSON.parse(attrValue);
                                searchForVideoURLInObject(jsonData);
                                if (sniffedVideoUrl) {
                                    break;
                                }
                            } catch (e) {}
                        }
                    }
                    if (sniffedVideoUrl) {
                        break;
                    }
                    const bgImage = player.style.backgroundImage;
                    if (bgImage) {
                        console.log("播放器容器背景图片:", bgImage);
                        const videoId1 = bgImage.match(new RegExp("\\/([0-9]+)~noop", ""));
                        if (videoId1 && videoId1[1]) {
                            const videoId11 = videoId1[1];
                            console.log("从背景图片中提取可能的视频ID:", videoId11);
                        }
                    }
                } catch (e) {
                    console.error("处理播放器容器时出错:", e);
                }
            }
        }
        if (!sniffedVideoUrl) {
            console.log("尝试拦截网络请求查找视频URL");
            if (window.performance && window.performance.getEntries) {
                const networkEntries = window.performance.getEntries();
                console.log(`分析 ${networkEntries.length} 个网络请求`);
                for (const networkEntry of networkEntries) {
                    try {
                        if (networkEntry.name && typeof networkEntry.name === "string") {
                            if (networkEntry.name.includes("douyinvod.com") || networkEntry.name.includes("v3-dy") || networkEntry.name.includes("v26-dy") || networkEntry.name.includes("v9-dy") || networkEntry.name.includes(".mp4") && networkEntry.name.includes("douyin")) {
                                console.log("从网络请求中找到视频URL:", networkEntry.name);
                                sniffedVideoUrl = networkEntry.name;
                                break;
                            }
                        }
                    } catch (e) {
                        console.error("分析网络请求时出错:", e);
                    }
                }
            }
        }
    }
    for (let i = 0; i < 3; i++) {
        const videoElements = document.querySelectorAll("video");
        for (const video of videoElements) {
            if (video.src) {
                console.log("视频modal中发现视频元素src:", video.src);
                if (video.src.includes("v3-dy-o.zjcdn.com/") || video.src.includes("v26-dy.ixigua.com/") || video.src.includes("v9-dy.ixigua.com/") || video.src.includes("v3-dy.ixigua.com/") || video.src.includes("douyinvod.com/") || video.src.includes(".mp4") && video.src.includes("douyin")) {
                    sniffedVideoUrl = video.src;
                    console.log("在视频元素中找到视频URL:", sniffedVideoUrl);
                }
            }
            const videoSources = video.querySelectorAll("source");
            videoSources.forEach(source => {
                if (source.src) {
                    console.log("发现视频source标签src:", source.src);
                    if (source.src.includes("v3-dy-o.zjcdn.com/") || source.src.includes("v26-dy.ixigua.com/") || source.src.includes("v9-dy.ixigua.com/") || source.src.includes("v3-dy.ixigua.com/") || source.src.includes("douyinvod.com/") || source.src.includes(".mp4") && source.src.includes("douyin")) {
                        sniffedVideoUrl = source.src;
                        console.log("在source标签中找到视频URL:", sniffedVideoUrl);
                    }
                }
            });
        }
        if (!sniffedVideoUrl) {
            console.log("第", i + 1, "次尝试从HTML中搜索视频URL");
            const urlPatterns = [new RegExp("https:\\/\\/v3-web\\.douyinvod\\.com\\/[^\"'\\s]+", "g"), new RegExp("https:\\/\\/v(\\d+)-\\w+\\.douyinvod\\.com\\/[^\"'\\s]+", "g"), new RegExp("https:\\/\\/v(\\d+)-dy\\.ixigua\\.com\\/[^\"'\\s]+", "g"), new RegExp("https:\\/\\/v(\\d+)-dy-o\\.zjcdn\\.com\\/[^\"'\\s]+", "g"), new RegExp("\"playAddr\":\\s*\"([^\"]+)\"", "g"), new RegExp("\"play_url\":\\s*\"([^\"]+)\"", "g"), new RegExp("\"downloadAddr\":\\s*\"([^\"]+)\"", "g"), new RegExp("playAddr:\\s*'([^']+)'", "g"), new RegExp("src=\"(https:\\/\\/[^\"]+\\.mp4[^\"]*)\"", "g")];
            const htmlContent = document.documentElement.outerHTML;
            for (const pattern of urlPatterns) {
                const videoUrls = htmlContent.match(pattern);
                if (videoUrls && videoUrls.length) {
                    for (const videoUrl1 of videoUrls) {
                        let videoUrl11 = videoUrl1;
                        if (videoUrl1.includes("playAddr\":") || videoUrl1.includes("play_url\":") || videoUrl1.includes("downloadAddr\":")) {
                            const urlMatch = new RegExp("\":\\s*\"([^\"]+)\"", "").exec(videoUrl1);
                            if (urlMatch && urlMatch[1]) {
                                videoUrl11 = urlMatch[1].replace(new RegExp("\\\\u002F", "g"), "/");
                            }
                        } else {
                            if (videoUrl1.includes("playAddr:")) {
                                const urlMatch = new RegExp("'([^']+)'", "").exec(videoUrl1);
                                if (urlMatch && urlMatch[1]) {
                                    videoUrl11 = urlMatch[1].replace(new RegExp("\\\\u002F", "g"), "/");
                                }
                            } else {
                                if (videoUrl1.includes("src=\"")) {
                                    const urlMatch = new RegExp("src=\"([^\"]+)\"", "").exec(videoUrl1);
                                    if (urlMatch && urlMatch[1]) {
                                        videoUrl11 = urlMatch[1];
                                    }
                                }
                            }
                        }
                        console.log("从HTML中找到可能的视频URL:", videoUrl11);
                        if (videoUrl11 && (videoUrl11.includes("v3-dy-o.zjcdn.com/") || videoUrl11.includes("v26-dy.ixigua.com/") || videoUrl11.includes("v9-dy.ixigua.com/") || videoUrl11.includes("v3-dy.ixigua.com/") || videoUrl11.includes("douyinvod.com/") || videoUrl11.includes(".mp4") && videoUrl11.includes("douyin"))) {
                            sniffedVideoUrl = videoUrl11;
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
                const renderData = JSON.parse(decodeURIComponent(window.RENDER_DATA));
                function findUrls(obj, depth = 0) {
                    if (depth > 5) {
                        return;
                    }
                    if (!obj || typeof obj !== "object") {
                        return;
                    }
                    for (const key in obj) {
                        if (key === "playAddr" || key === "play_url" || key === "downloadAddr" || key === "video_url" || key === "url") {
                            const videoUrl1 = obj[key];
                            if (typeof videoUrl1 === "string" && videoUrl1.includes("http")) {
                                console.log(`在RENDER_DATA.${key}中找到视频URL:`, videoUrl1);
                                if (videoUrl1.includes("v3-dy-o.zjcdn.com/") || videoUrl1.includes("v26-dy.ixigua.com/") || videoUrl1.includes("v9-dy.ixigua.com/") || videoUrl1.includes("v3-dy.ixigua.com/") || videoUrl1.includes("douyinvod.com/") || videoUrl1.includes(".mp4") && videoUrl1.includes("douyin")) {
                                    sniffedVideoUrl = videoUrl1;
                                    return true;
                                }
                            }
                        }
                        if (obj[key] && typeof obj[key] === "object") {
                            if (findUrls(obj[key], depth + 1)) {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                findUrls(renderData);
            } catch (e) {
                console.log("从RENDER_DATA解析视频URL失败:", e);
            }
        }
        if (sniffedVideoUrl) {
            console.log("成功找到视频URL，中止进一步搜索");
            break;
        }
        if (i < 2) {
            console.log("未找到视频URL，等待500ms后再次尝试");
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    const videoElements = document.querySelectorAll("video");
    console.log(`找到 ${videoElements.length} 个视频元素`);
    videoElements.forEach(video => {
        if (video.src) {
            console.log("检查视频源URL:", video.src);
            if (video.src.startsWith("https://v3-dy-o.zjcdn.com/") || video.src.startsWith("https://v26-dy.ixigua.com/") || video.src.startsWith("https://v9-dy.ixigua.com/") || video.src.startsWith("https://v3-dy.ixigua.com/")) {
                sniffedVideoUrl = video.src;
                console.log("直接从视频元素获取到视频URL:", sniffedVideoUrl);
            }
        }
    });
    if (!sniffedVideoUrl) {
        console.log("没有立即找到视频URL，将在后台继续嗅探");
    }
    const videoSrc = document.querySelectorAll(".xgplayer-play, .xgplayer-start, [data-e2e=\"video-play\"]");
    if (videoSrc.length > 0) {
        console.log("找到播放按钮，点击以触发视频加载");
        try {
            videoSrc[0].click();
        } catch (e) {
            console.error("点击播放按钮失败:", e);
        }
    }
    console.log("通过data-e2e-vid和video_ID属性查找当前视频元素...");
    let videoURL = document.querySelector(`div[data-e2e="feed-active-video"][data-e2e-vid="${videoId}"]`);
    if (!videoURL) {
        videoURL = document.querySelector(`.video_${videoId}`);
        console.log("通过video_class查找:", videoURL ? "找到了" : "未找到");
    }
    if (!videoURL) {
        const activeVideos = document.querySelectorAll("div[data-e2e=\"feed-active-video\"]");
        console.log(`找到${activeVideos.length}个feed-active-video元素`);
        for (const videoElement of activeVideos) {
            console.log("检查元素:", videoElement.getAttribute("data-e2e-vid"), videoElement.className);
            if (videoElement.className.includes("ZTBYOIeC") && (videoElement.getAttribute("data-e2e-vid") === videoId || videoElement.className.includes(`video_${videoId}`))) {
                videoURL = videoElement;
                console.log("找到匹配的活跃视频元素!");
                break;
            }
        }
    }
    let getVideoUrl = null;
    if (videoURL) {
        console.log("找到活跃视频元素:", videoURL);
        console.log("活跃视频元素data-e2e-vid:", videoURL.getAttribute("data-e2e-vid"));
        console.log("活跃视频元素class:", videoURL.className);
        getVideoUrl = videoURL;
    } else {
        console.log("未找到精确匹配的活跃视频元素，回退到常规查找方式...");
        const modalSelectors = ["div[data-e2e=\"modal-video-container\"]", ".vtCDirga.modal-video-container", ".vtCDirga.modal-video-container.m3vr37Qp", ".modal-video-container", ".AXQAavwp"];
        let modalContainer = null;
        let attempts = 0;
        const maxAttempts = 10;
        const retryDelay = 500;
        while (!modalContainer && attempts < maxAttempts) {
            console.log(`尝试查找modal容器，第${attempts + 1}次尝试...`);
            for (const selector of modalSelectors) {
                const modalElem = document.querySelector(selector);
                if (modalElem) {
                    modalContainer = modalElem;
                    console.log(`在第${attempts + 1}次尝试中找到modal容器，使用选择器:`, selector);
                    break;
                }
            }
            if (!modalContainer) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        if (!modalContainer) {
            console.log("尝试使用MutationObserver等待modal容器加载...");
            try {
                modalContainer = await waitForElement(modalSelectors.join(", "), 5000);
            } catch (e) {
                console.error("等待modal容器加载超时:", e);
            }
        }
        if (!modalContainer) {
            console.error("未找到视频modal容器");
            console.log("当前页面结构:");
            console.log(document.body.innerHTML.substring(0, 500) + "...");
            return {
                error: true,
                message: "未找到视频modal容器",
                id: videoId,
                title: "无法获取视频数据",
                description: "未找到视频详情容器，请确认当前页面包含视频详情弹窗",
                link: window.location.href
            };
        }
        getVideoUrl = modalContainer;
        console.log("找到备选视频modal容器:", getVideoUrl);
    }
    console.log("Modal container HTML (前300字符):");
    console.log(getVideoUrl.innerHTML.substring(0, 300) + "...");
    videoOptions = "";
    const sniffedVideoUrl = getVideoUrl.querySelector(".slider-video .hiddenImgbackgroundPlugin");
    if (sniffedVideoUrl && sniffedVideoUrl.src) {
        videoOptions = sniffedVideoUrl.src;
        console.log("提取到封面图:", videoOptions);
    }
    videoData = "";
    const sniffedVideoSrc = ["div[data-e2e=\"video-desc\"], .video-desc, .title, .desc, .HKxbhvW_", ".title-wrap h1", ".video-info-title", "span.JI6vfzjc"];
    for (const selector of sniffedVideoSrc) {
        const videoElem1 = getVideoUrl.querySelector(selector);
        if (videoElem1 && videoElem1.textContent.trim()) {
            const clonedVideo = videoElem1.cloneNode(true);
            const expandButtons = clonedVideo.querySelectorAll("button, [role=\"button\"], .expand-btn, [class*=\"expand\"]");
            expandButtons.forEach(button => {
                if (button && button.parentNode) {
                    button.parentNode.removeChild(button);
                }
            });
            videoData = clonedVideo.textContent.trim();
            console.log(`从选择器 ${selector} 提取到纯标题(不含按钮文本):`, videoData);
            if (expandButtons.length > 0) {
                console.log("在标题元素中找到展开按钮:", expandButtons.length);
                try {
                    const expandButtons1 = videoElem1.querySelectorAll("button, [role=\"button\"], .expand-btn, [class*=\"expand\"]");
                    if (expandButtons1 && expandButtons1.length > 0) {
                        expandButtons1[0].click();
                        console.log("点击展开按钮展开完整标题");
                        setTimeout(() => {
                            if (videoElem1) {
                                const clonedNode = videoElem1.cloneNode(true);
                                const expandButtons11 = clonedNode.querySelectorAll("button, [role=\"button\"], .expand-btn, [class*=\"expand\"]");
                                expandButtons11.forEach(button => {
                                    if (button && button.parentNode) {
                                        button.parentNode.removeChild(button);
                                    }
                                });
                                const videoTitle = clonedNode.textContent.trim();
                                if (videoTitle && videoTitle.length > videoData.length) {
                                    videoData = videoTitle;
                                    console.log("展开后获取到更完整的标题(不含按钮文本):", videoData);
                                }
                            }
                        }, 300);
                    }
                } catch (e) {
                    console.log("点击展开按钮失败:", e);
                }
            }
            break;
        }
    }
    videoUrl = "";
    videoData2 = "";
    videoElem = "";
    const fetchVideoUrl = ["a[data-e2e=\"video-author\"], .video-author-name, .J6IbfgxH", ".author-name span", ".account-name", "a.hY8lWHgA, a[href*=\"/user/\"]"];
    for (const selector of fetchVideoUrl) {
        const authorElement = getVideoUrl.querySelector(selector);
        if (authorElement) {
            videoUrl = authorElement.textContent.trim();
            console.log(`从选择器 ${selector} 提取到作者:`, videoUrl);
            if (authorElement.tagName === "A" && authorElement.href) {
                videoElem = authorElement.href;
                const userId = videoElem.match(new RegExp("\\/user\\/([^?]+)", ""));
                if (userId && userId[1]) {
                    videoData2 = userId[1];
                }
                console.log("作者链接:", videoElem);
                console.log("作者ID:", videoData2);
            }
            break;
        }
    }
    videoModal = "";
    const videoSelector = [".video-info-detail .SqVMXNQp, .publish-time, div[data-e2e=\"video-publish-time\"]", ".video-create-time", ".create-time", ".time-info"];
    for (const selector of videoSelector) {
        const videoElement = getVideoUrl.querySelector(selector);
        if (videoElement && videoElement.textContent.trim()) {
            videoModal = videoElement.textContent.trim().replace(new RegExp("^[·\\s]+", ""), "");
            console.log(`从选择器 ${selector} 提取到发布时间:`, videoModal);
            break;
        }
    }
    videoData3 = "";
    videoModal2 = "";
    modalData = "";
    isVideoModal = "";
    const videoSelector2 = ["div[data-e2e=\"video-player-digg\"] .M7M0nmSI", "div[data-e2e=\"video-player-digg\"] + div", "div[data-e2e=\"video-player-digg\"] .count", "div[data-e2e-state=\"video-player-digged\"] .M7M0nmSI"];
    for (const selector of videoSelector2) {
        const videoElement = getVideoUrl.querySelector(selector);
        if (videoElement && videoElement.textContent.trim()) {
            videoData3 = videoElement.textContent.trim();
            console.log(`从选择器 ${selector} 提取到点赞数:`, videoData3);
            break;
        }
    }
    const getVideoSrc = ["div[data-e2e=\"feed-comment-icon\"] .SfwAcdr1", "div[data-e2e=\"feed-comment-icon\"] .JrV13Yco", "div[data-e2e=\"feed-comment-icon\"] .count"];
    for (const selector of getVideoSrc) {
        const commentCount = getVideoUrl.querySelector(selector);
        if (commentCount && commentCount.textContent.trim()) {
            videoModal2 = commentCount.textContent.trim();
            console.log(`从选择器 ${selector} 提取到评论数:`, videoModal2);
            break;
        }
    }
    const sniffedUrl = ["div[data-e2e=\"video-player-collect\"] .JQCocDWm", "div[data-e2e=\"video-player-collect\"] .NT67BHnx", "div[data-e2e=\"video-player-collect\"] .count", "div[data-e2e-state=\"video-player-collected\"] .JQCocDWm"];
    for (const selector of sniffedUrl) {
        const videoElem1 = getVideoUrl.querySelector(selector);
        if (videoElem1 && videoElem1.textContent.trim()) {
            modalData = videoElem1.textContent.trim();
            console.log(`从选择器 ${selector} 提取到收藏数:`, modalData);
            break;
        }
    }
    const videoElem2 = ["div[data-e2e=\"video-player-share\"] .MQXEGdYW", "div[data-e2e=\"video-player-share\"] .count"];
    for (const selector of videoElem2) {
        const videoElement = getVideoUrl.querySelector(selector);
        if (videoElement && videoElement.textContent.trim()) {
            isVideoModal = videoElement.textContent.trim();
            console.log(`从选择器 ${selector} 提取到分享数:`, isVideoModal);
            break;
        }
    }
    hasVideo = "";
    const fetchVideoUrl2 = getVideoUrl.querySelector(".ckopQfVu, .video-duration, .time-duration, span.time-duration");
    if (fetchVideoUrl2) {
        hasVideo = fetchVideoUrl2.textContent.trim();
    } else {
        const timeElem = getVideoUrl.querySelector(".xgplayer-time") || document.querySelector(".xgplayer-time");
        if (timeElem) {
            hasVideo = timeElem.textContent.trim().split("/").pop().trim();
        } else {
            const currentTime = getVideoUrl.querySelector(".current-time") || document.querySelector(".current-time");
            if (currentTime) {
                hasVideo = currentTime.textContent.trim();
            }
        }
    }
    console.log("提取到时长:", hasVideo);
    hasModal = "";
    const videoSrc2 = getVideoUrl.querySelectorAll(".tag-item");
    if (videoSrc2.length > 0) {
        videoSrc2.forEach(element => {
            const textContent = element.textContent.trim();
            if (textContent) {
                hasModal += textContent + ", ";
            }
        });
        hasModal = hasModal.trim();
        console.log("提取到标签:", hasModal);
    }
    videoModal3 = "";
    const videoSrc3 = getVideoUrl.querySelector(".music-info");
    if (videoSrc3 && videoSrc3.textContent.trim()) {
        videoModal3 = videoSrc3.textContent.trim();
        console.log("提取到音乐信息:", videoModal3);
    }
    const commentsList = await scrapeVideoComments(100);
    const videoSelector3 = {
        author: {
            id: videoData2,
            name: videoUrl,
            avatar: "",
            link: videoElem
        },
        post: {
            id: videoId,
            title: videoData,
            coverImage: videoOptions,
            description: videoData,
            link: `https://www.douyin.com/video/${videoId}`,
            duration: hasVideo,
            publishTime: videoModal,
            musicInfo: videoModal3,
            tags: hasModal
        },
        interactions: {
            likes: videoData3,
            comments: videoModal2,
            favorites: modalData,
            shares: isVideoModal
        },
        mediaContent: [{
            type: "video",
            url: sniffedVideoUrl,
            cover: ""
        }],
        commentsList: commentsList.map(comment => ({
            userName: comment.userName || "",
            avatar: comment.avatar || "",
            content: comment.content || "",
            likes: comment.likes || "0",
            date: comment.date || "",
            location: comment.location || "",
            isAuthor: comment.isAuthor || false
        }))
    };
    console.log("数据抓取完成，尝试打开评论");
    try {
        console.log("尝试创建视频URL列表UI元素");
        if (window.sniffedVideoUrls && window.sniffedVideoUrls.length > 0) {
            const videoInfoContainer = document.querySelector(".AXQAavwp div[data-e2e=\"video-info\"], .video-info-detail");
            if (videoInfoContainer) {
                const videoContainer = document.createElement("div");
                videoContainer.className = "video-urls-container";
                videoContainer.style.cssText = "margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;";
                const videoCount = document.createElement("div");
                videoCount.textContent = `视频URL列表 (共${window.sniffedVideoUrls.length}个)`;
                videoCount.style.cssText = "color: #f85959; font-weight: bold; margin-bottom: 5px; font-size: 14px;";
                videoContainer.appendChild(videoCount);
                const urlList = document.createElement("div");
                urlList.className = "video-urls-list";
                urlList.style.cssText = "max-height: 120px; overflow-y: auto; font-size: 12px;";
                window.sniffedVideoUrls.forEach((url, index) => {
                    const urlItem = document.createElement("div");
                    urlItem.className = "video-url-item";
                    urlItem.style.cssText = "margin-bottom: 5px; word-break: break-all; color: #fff;";
                    const urlLink = document.createElement("a");
                    urlLink.href = url;
                    urlLink.textContent = `${index + 1}. ${url.slice(0, 50)}...`;
                    urlLink.title = url;
                    urlLink.target = "_blank";
                    urlLink.style.cssText = "color: #66ccff; text-decoration: none;";
                    urlLink.onclick = function (e) {
                        e.stopPropagation();
                        navigator.clipboard.writeText(url).then(() => {
                            alert("视频URL已复制到剪贴板");
                        }).catch(err => {
                            console.error("复制失败: ", err);
                        });
                        return false;
                    };
                    urlItem.appendChild(urlLink);
                    urlList.appendChild(urlItem);
                });
                videoContainer.appendChild(urlList);
                videoInfoContainer.appendChild(videoContainer);
                console.log("成功添加视频URL列表UI");
            } else {
                console.error("未找到合适的视频信息容器来添加URL列表");
            }
        } else {
            console.log("没有嗅探到的视频URL列表可显示");
        }
    } catch (error) {
        console.error("添加视频URL列表UI时出错:", error);
    }
    try {
        const commentSelectors = ["div[data-e2e=\"feed-comment-icon\"]", "div[data-e2e=\"video-player-comment\"]", "div[class*=\"comment-icon\"]"];
        let commentButton = null;
        for (const selector of commentSelectors) {
            const commentBtn = getVideoUrl.querySelector(selector);
            if (commentBtn) {
                commentButton = commentBtn;
                console.log(`找到评论按钮: ${selector}`);
                break;
            }
        }
        if (commentButton) {
            console.log("点击评论按钮打开评论面板");
            commentButton.click();
            chrome.runtime.sendMessage({
                action: "updateStatus",
                status: "已打开评论面板，准备抓取评论..."
            });
            await new Promise(resolve => setTimeout(resolve, 2000));
            const commentsList = await scrapeVideoComments(100);
            videoSelector3.commentsList = commentsList.map(comment => ({
                userName: comment.userName || "",
                avatar: comment.avatar || "",
                content: comment.content || "",
                likes: comment.likes || "0",
                date: comment.date || "",
                location: comment.location || "",
                isAuthor: comment.isAuthor || false
            }));
            chrome.runtime.sendMessage({
                action: "updateStatus",
                status: `已抓取 ${commentsList.length} 条评论`
            });
            if (commentsList.length > 0) {
                console.log(`成功抓取 ${commentsList.length} 条评论，已添加到结果数据`);
            } else {
                console.log("未抓取到评论，已添加空评论列表到结果数据");
            }
        } else {
            console.log("未找到评论按钮，无法打开评论");
        }
    } catch (error) {
        console.error("抓取评论过程出错:", error);
    }
    console.log("最终嗅探到的视频URL:", sniffedVideoUrl);
    console.log("抓取结果:", videoSelector3);
    return videoSelector3;
}
async function scrapeVideoComments(maxComments = 100, currentCommentCount, noNewCommentsCount) {
    console.log(`开始抓取视频评论，最多 ${maxComments} 条`);
    const commentContainer = document.querySelector("[data-e2e=\"comment-list\"]");
    if (!commentContainer) {
        console.error("未找到评论容器 [data-e2e=\"comment-list\"]");
        const commentContainer1 = document.getElementById("merge-all-comment-container");
        if (!commentContainer1) {
            console.error("备用容器也未找到，无法抓取评论");
            return [];
        }
        console.log("使用备用评论容器进行抓取");
    }
    const commentContainer2 = commentContainer || document.getElementById("merge-all-comment-container");
    console.log("找到评论容器，开始处理评论");
    let maxFetch = maxComments;
    try {
        const commentCountElement = document.querySelector(".qx5s_hbj");
        if (commentCountElement && commentCountElement.textContent) {
            const commentCount = commentCountElement.textContent.match(new RegExp("\\((\\d+)\\)", ""));
            if (commentCount && commentCount[1]) {
                maxFetch = parseInt(commentCount[1], 10);
                console.log(`找到评论总数: ${maxFetch}`);
                if (maxFetch < maxComments) {
                    maxComments = maxFetch;
                    console.log(`调整抓取目标为实际评论总数: ${maxComments}`);
                }
            }
        }
    } catch (error) {
        console.error("获取评论总数出错:", error);
    }
    const comments = [];
    const uniqueComments = new Set();
    currentCommentCount = 0;
    noNewCommentsCount = 0;
    chrome.runtime.sendMessage({
        action: "updateStatus",
        status: `准备抓取评论，总评论数: ${maxFetch}`
    });
    async function fetchCommentsRecursively(attempt = 0, maxAttempts = 30) {
        chrome.runtime.sendMessage({
            action: "updateStatus",
            status: `正在抓取评论 ${comments.length}/${maxComments}...`
        });
        if (attempt >= maxAttempts || comments.length >= maxComments || noNewCommentsCount >= 5) {
            if (noNewCommentsCount >= 5) {
                console.log(`连续 ${noNewCommentsCount} 次没有新评论加载，停止抓取`);
            } else {
                if (attempt >= maxAttempts) {
                    console.log(`达到最大尝试次数 ${maxAttempts}，停止抓取`);
                } else {
                    console.log(`已抓取目标数量 ${comments.length}/${maxComments} 条评论`);
                }
            }
            return;
        }
        await fetchComments();
        const hasNewComments = comments.length > currentCommentCount;
        if (hasNewComments) {
            console.log(`本次新增 ${comments.length - currentCommentCount} 条评论`);
            currentCommentCount = comments.length;
            noNewCommentsCount = 0;
        } else {
            noNewCommentsCount++;
            console.log(`没有新评论加载，连续无变化次数: ${noNewCommentsCount}`);
        }
        if (comments.length < maxComments) {
            await loadMoreComments();
            const waitTime = 500 + Math.min(200, attempt * 20);
            console.log(`等待 ${waitTime}ms 加载新评论...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            await fetchCommentsRecursively(attempt + 1, maxAttempts);
        }
    }
    async function fetchComments() {
        const commentItems = commentContainer2.querySelectorAll("div[data-e2e=\"comment-item\"]");
        console.log(`当前找到 ${commentItems.length} 条评论元素`);
        for (const commentItem of commentItems) {
            try {
                const userName = commentItem.querySelector(".j5WZzJdp.E7y2ZDk0");
                const userText = userName ? userName.textContent.trim() : "";
                const userComment = commentItem.querySelector(".LvAtyU_f .sU2yAQQU");
                let userCommentText = userComment ? userComment.textContent.trim() : "";
                const avatar = commentItem.querySelector(".GOkWHE6S");
                const avatarText = avatar ? avatar.textContent.trim() : "";
                let avatarName = "";
                let $location = "";
                if (avatarText) {
                    const avatarParts = avatarText.split("·");
                    avatarName = avatarParts[0] ? avatarParts[0].trim() : "";
                    $location = avatarParts[1] ? avatarParts[1].trim() : "";
                }
                const likesCount = commentItem.querySelector(".wiQmZrKV span");
                const likesCountText = likesCount ? likesCount.textContent.trim() : "";
                const commentKey = `${userText}-${userCommentText.substring(0, 50)}`;
                if (!uniqueComments.has(commentKey) && userText && userCommentText) {
                    uniqueComments.add(commentKey);
                    comments.push({
                        userName: userText,
                        avatar: "",
                        content: userCommentText,
                        likes: likesCountText,
                        date: avatarName,
                        location: $location,
                        isAuthor: false
                    });
                    if (comments.length >= maxComments) {
                        console.log(`已达到最大评论数 ${maxComments}`);
                        break;
                    }
                }
            } catch (error) {
                console.error("处理评论元素时出错:", error);
            }
        }
    }
    async function loadMoreComments() {
        console.log("开始快速滚动加载更多评论");
        const scrollTop = commentContainer2.scrollTop;
        const totalHeight = commentContainer2.scrollHeight;
        const clientHeight = commentContainer2.clientHeight;
        const maxScroll = commentContainer2.scrollHeight - clientHeight;
        if (maxScroll - scrollTop < 200) {
            commentContainer2.scrollTop = maxScroll;
            console.log(`直接滚动到底部: ${scrollTop} -> ${commentContainer2.scrollTop}`);
            return;
        }
        const scrollStep = Math.min(1500, commentContainer2.scrollHeight / 1.5);
        commentContainer2.scrollTop = scrollTop + scrollStep;
        console.log(`完成快速滚动: ${scrollTop} -> ${commentContainer2.scrollTop}, 滚动距离: ${commentContainer2.scrollTop - scrollTop}px`);
    }
    console.log("开始滚动加载评论...");
    await fetchCommentsRecursively(0, 50);
    console.log(`评论抓取完成，共抓取 ${comments.length}/${maxFetch} 条评论`);
    chrome.runtime.sendMessage({
        action: "updateStatus",
        status: `已抓取 ${comments.length}/${maxFetch} 条评论`
    });
    return comments;
}
