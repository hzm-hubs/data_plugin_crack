async function scrapeDouyinSearchData() {
    console.log("开始抓取抖音搜索页数据...");
    let videoContainer = document.querySelector("ul.gZq36zrh.PAjzsG5a[data-e2e=\"scroll-list\"]");
    console.log("视频列表容器:", videoContainer);
    if (!videoContainer) {
        console.log("未找到视频列表容器，尝试其他选择器...");
        const selectors = ["ul[data-e2e=\"scroll-list\"]", "ul[class*=\"gZq36zrh\"]", "ul[class*=\"PAjzsG5a\"]", ".search-result-container > ul", "div[data-e2e=\"search-result-container\"] > ul"];
        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`找到容器，使用选择器: ${selector}`);
                videoContainer = container;
                break;
            }
        }
    }
    async function fetchVideos(maxVideos = 100, allResults = [], scrollAttempts = 0, maxScrollAttempts = 10) {
        let isEndOfScroll = false;
        const divElements = document.querySelectorAll("div");
        for (const divElem of divElements) {
            if (divElem.textContent && divElem.textContent.includes("暂时没有更多了")) {
                console.log("检测到\"暂时没有更多了\"提示，已到达页面底部");
                isEndOfScroll = true;
                break;
            }
        }
        if (isEndOfScroll) {
            console.log("已抓取到底部，返回当前结果");
            return allResults;
        }
        let videoItems = [];
        if (videoContainer) {
            videoItems = videoContainer.querySelectorAll("li.SwZLHMKk.SEbmeLLH");
            console.log(`从容器中找到 ${videoItems.length} 个视频项`);
        }
        if (videoItems.length === 0) {
            console.log("在容器中未找到视频项，尝试在全页面中查找...");
            videoItems = document.querySelectorAll("li.SwZLHMKk.SEbmeLLH");
            console.log(`在全页面中找到 ${videoItems.length} 个视频项`);
        }
        function getParentTags(element, maxLevels = 5, getParentChain) {
            const parentTags = [];
            let currentElement = element;
            getParentChain = 0;
            while (currentElement && getParentChain < maxLevels) {
                const classInfo = currentElement.className ? ` (class="${currentElement.className}")` : "";
                const idInfo = currentElement.id ? ` (id="${currentElement.id}")` : "";
                parentTags.push(`${currentElement.tagName.toLowerCase()}${classInfo}${idInfo}`);
                currentElement = currentElement.parentElement;
                getParentChain++;
            }
            return parentTags;
        }
        if (videoItems.length === 0) {
            console.log("未找到视频项，输出页面结构以辅助调试:");
            const videoLinks = document.querySelectorAll("a[href*=\"/video/\"]");
            console.log("包含/video/字符串的链接数量:", videoLinks.length);
            if (videoLinks.length > 0) {
                console.log("第一个视频链接:", videoLinks[0]);
                console.log("包含该链接的父元素链:", getParentTags(videoLinks[0]));
            }
            const listItems = document.querySelectorAll("li");
            console.log("页面上的列表项数量:", listItems.length);
            console.log("页面上前5个列表项的类名:");
            for (let i = 0; i < Math.min(5, listItems.length); i++) {
                console.log(`列表项 ${i + 1} 类名:`, listItems[i].className);
                if (listItems[i].querySelector("a[href*=\"/video/\"]")) {
                    console.log(`列表项 ${i + 1} 包含视频链接`);
                    videoItems = [listItems[i]];
                    break;
                }
            }
        }
        const videoData = [];
        const uniqueLinksSet = new Set(allResults.map(item => item.link));
        for (let index = 0; index < videoItems.length; index++) {
            const videoItem = videoItems[index];
            console.log(`处理第 ${index + 1}/${videoItems.length} 个视频数据 (总计 ${allResults.length + videoData.length}/${maxVideos})`);
            const videoLink = videoItem.querySelector("a[href*=\"/video/\"]");
            let videoLink2 = "";
            if (videoLink && videoLink.href) {
                videoLink2 = videoLink.href;
                if (videoLink2.startsWith("//")) {
                    videoLink2 = "https:" + videoLink2;
                }
                if (uniqueLinksSet.has(videoLink2)) {
                    console.log("跳过重复视频:", videoLink2);
                    continue;
                }
                console.log("提取到链接:", videoLink2);
            } else {
                console.log("未找到链接元素，跳过此项");
                continue;
            }
            const coverImage = videoItem.querySelector(".FWkvEMo5, img[src*=\"douyinpic\"]");
            let coverSrc = "";
            if (coverImage) {
                if (coverImage.style && coverImage.style.backgroundImage) {
                    const bgImage = coverImage.style.backgroundImage;
                    const bgUrl = bgImage.match(new RegExp("url\\(['\"]?(.*?)['\"]?\\)", ""));
                    if (bgUrl && bgUrl[1]) {
                        coverSrc = bgUrl[1];
                    }
                } else {
                    if (coverImage.src) {
                        coverSrc = coverImage.src;
                    }
                }
                console.log("提取到封面图:", coverSrc);
            } else {
                console.log("未找到封面图元素");
            }
            const videoTitle = videoItem.querySelector(".VDYK8Xd7");
            const videoTitle2 = videoTitle ? videoTitle.innerText.trim() : "";
            console.log("提取到标题:", videoTitle2);
            const likeCount = videoItem.querySelector(".cIiU4Muu");
            const likes = likeCount ? likeCount.innerText.trim() : "";
            console.log("提取到点赞数:", likes);
            const duration = videoItem.querySelector(".ckopQfVu");
            const duration2 = duration ? duration.innerText.trim() : "";
            console.log("提取到时长:", duration2);
            const authorElement = videoItem.querySelector(".MZNczJmS");
            const author = authorElement ? authorElement.innerText.trim() : "";
            console.log("提取到作者:", author);
            const publishTime = videoItem.querySelector(".faDtinfi");
            const publishDate = publishTime ? publishTime.innerText.trim().replace(new RegExp("^[·\\s]+", ""), "") : "";
            console.log("提取到发布时间:", publishDate);
            videoData.push({
                title: videoTitle2,
                cover: coverSrc,
                author: author,
                authorID: "",
                authorLink: "",
                authorAvatar: "",
                link: videoLink2,
                likes: likes,
                isTop: false,
                duration: duration2,
                publishTime: publishDate
            });
            uniqueLinksSet.add(videoLink2);
            console.log(`成功添加第 ${index + 1} 项视频数据 (总计 ${allResults.length + videoData.length}/${maxVideos})`);
            try {
                chrome.runtime.sendMessage({
                    action: "updateStatus",
                    status: `已抓取 ${allResults.length + videoData.length}/${maxVideos} 个视频，继续抓取中...`
                });
            } catch (e) {
                console.error("发送进度消息失败:", e);
            }
        }
        const findVideoLink = [...allResults, ...videoData];
        console.log(`当前已抓取 ${findVideoLink.length} 个视频数据`);
        if (findVideoLink.length >= maxVideos) {
            return findVideoLink.slice(0, maxVideos);
        }
        if (videoData.length === 0) {
            scrollAttempts++;
            if (scrollAttempts >= maxScrollAttempts) {
                console.log(`已尝试滚动 ${scrollAttempts} 次但没有找到新视频，停止抓取`);
                return findVideoLink;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        await loadMoreVideos();
        return fetchVideos(maxVideos, findVideoLink, scrollAttempts, maxScrollAttempts);
    }
    async function loadMoreVideos() {
        return new Promise(resolve => {
            console.log("滚动加载更多视频...");
            try {
                chrome.runtime.sendMessage({
                    action: "updateStatus",
                    status: `正在滚动加载更多视频...`
                });
            } catch (e) {
                console.error("发送滚动进度消息失败:", e);
            }
            let isLoading = false;
            const divElements = document.querySelectorAll("div");
            for (const divEl of divElements) {
                if (divEl.textContent && divEl.textContent.includes("暂时没有更多了")) {
                    console.log("检测到\"暂时没有更多了\"提示，停止滚动");
                    isLoading = true;
                    break;
                }
            }
            if (isLoading) {
                resolve();
                return;
            }
            const scrollContainer = document.querySelector(".parent-route-container.route-scroll-container, .parent-route-container.bX97FWk8.route-scroll-container.h5AVrOfS");
            if (!scrollContainer) {
                console.log("未找到滚动容器，使用window滚动到页面底部");
                window.scrollTo(0, document.body.scrollHeight);
                setTimeout(resolve, 1500);
                return;
            }
            console.log("找到滚动容器:", scrollContainer);
            const scrollTop = scrollContainer.scrollTop;
            const scrollHeight = scrollContainer.scrollHeight;
            const containerHeight = scrollContainer.clientHeight;
            const scrollTo = scrollTop + 1000;
            console.log(`滚动容器信息 - 当前位置: ${scrollTop}, 容器高度: ${containerHeight}, 总高度: ${scrollHeight}`);
            const scrollSteps = 10;
            const scrollStepTime = 1000 / scrollSteps;
            const scrollDelay = 50;
            let scrollStep = 0;
            const scrollInterval = setInterval(() => {
                if (scrollStep >= scrollSteps) {
                    clearInterval(scrollInterval);
                    setTimeout(() => {
                        console.log("等待新视频加载完成...");
                        try {
                            chrome.runtime.sendMessage({
                                action: "updateStatus",
                                status: `正在等待新视频加载...`
                            });
                        } catch (e) {
                            console.error("发送等待消息失败:", e);
                        }
                        resolve();
                    }, 1500);
                    return;
                }
                scrollStep++;
                scrollContainer.scrollTop = scrollTop + scrollStepTime * scrollStep;
                console.log(`滚动步骤 ${scrollStep}/${scrollSteps}, 当前位置: ${scrollContainer.scrollTop}`);
            }, scrollDelay);
        });
    }
    const findVideoContainer = await fetchVideos(100);
    console.log(`共抓取到 ${findVideoContainer.length} 个视频数据`);
    return findVideoContainer;
}
