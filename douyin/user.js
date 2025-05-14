async function scrapeDouyinUserData(avatarUrl, role, userID, gender, age, bio, scraper, bioText, bioData, bioExtractor) {
    console.log("开始抓取抖音用户页面数据...");
    console.log("提取用户基本信息...");
    avatarUrl = "";
    const userDetail = document.querySelector("div[data-e2e=\"user-detail\"]");
    if (userDetail) {
        const userAvatar = userDetail.querySelector("img");
        if (userAvatar && userAvatar.src) {
            avatarUrl = userAvatar.src;
            console.log("从user-detail中提取到用户头像:", avatarUrl);
        }
    }
    if (!avatarUrl) {
        const avatarImg = document.querySelector("span[data-e2e=\"live-avatar\"] img, .ZgMmtbts img, .vBNjZx2k img, .RlLOO79h");
        if (avatarImg && avatarImg.src) {
            avatarUrl = avatarImg.src;
            console.log("从其他选择器提取到用户头像:", avatarUrl);
        }
    }
    const userInfoContainer = document.querySelector("div[data-e2e=\"user-info\"], .mZmVWLzR");
    if (!userInfoContainer) {
        console.log("未找到用户信息容器");
        return {
            nickname: "",
            userid: "",
            bio: "",
            videos: []
        };
    }
    const nickname = userInfoContainer.querySelector("h1.a34DMvQe span span");
    const nickname2 = nickname ? nickname.innerText.trim() : "";
    console.log("用户昵称:", nickname2);
    role = "";
    const roleBadge = document.querySelector("span[data-e2e=\"badge-role-name\"]");
    if (roleBadge) {
        role = roleBadge.innerText.trim();
        console.log("从badge-role-name提取到认证信息:", role);
    }
    if (!role) {
        const authInfo = document.querySelector(".RgbYc1wS, .Rbnl7KnE");
        if (authInfo) {
            role = authInfo.innerText.trim();
            console.log("从RgbYc1wS或Rbnl7KnE提取到认证信息:", role);
        }
    }
    if (!role) {
        const selectors = ["svg[fill=\"#FFDF3F\"] + span", ".iCzbLgz8", ".QvpE-l1F", ".rZnY2xpc span"];
        for (const selector of selectors) {
            try {
                const el = document.querySelector(selector);
                if (el && el.innerText && el.innerText.trim() !== "") {
                    role = el.innerText.trim();
                    console.log(`从选择器 ${selector} 提取到认证信息:`, role);
                    break;
                }
            } catch (e) {
                console.error(`选择器 ${selector} 提取出错:`, e);
            }
        }
    }
    const userIDElement = userInfoContainer.querySelector("span.TVGQz3SI");
    userID = "";
    if (userIDElement) {
        const userID1 = userIDElement.innerText.trim();
        if (userID1.startsWith("抖音号：")) {
            userID = userID1.replace("抖音号：", "");
        }
        console.log("用户ID:", userID);
    }
    const ipLocation = userInfoContainer.querySelector("span.W5BoFrmn");
    const ipLocation2 = ipLocation ? ipLocation.innerText.trim().replace("IP属地：", "") : "";
    console.log("IP属地:", ipLocation2);
    gender = "";
    age = "";
    const userDetails = userInfoContainer.querySelector("span.ZsWSQtbs");
    if (userDetails) {
        const femaleSvg = userDetails.querySelector("svg[stroke=\"#F5588E\"]");
        const femaleGroup = userDetails.querySelector("g[stroke=\"#F5588E\"]");
        const maleSvg = userDetails.querySelector("svg[stroke=\"#57BDFC\"]");
        const maleGroup = userDetails.querySelector("g[stroke=\"#57BDFC\"]");
        const bluePath = userDetails.querySelector("path[fill=\"#168EF9\"]");
        const userText = userDetails.textContent.trim();
        if (femaleSvg || femaleGroup || userText.includes("女")) {
            gender = "female";
            console.log("性别: 女");
        } else {
            if (maleSvg || maleGroup || bluePath || userText.includes("男")) {
                gender = "male";
                console.log("性别: 男");
            }
        }
        const ageSpan = userDetails.querySelector("span");
        if (ageSpan) {
            const ageMatch = ageSpan.innerText.match(new RegExp("(\\d+)", ""));
            if (ageMatch && ageMatch[1]) {
                age = ageMatch[1];
                console.log("年龄:", age);
            }
        }
    }
    bio = "";
    try {
        const scriptTags = document.querySelectorAll("script");
        for (const scriptTag of scriptTags) {
            if (scriptTag.textContent && scriptTag.textContent.includes("\"desc\":")) {
                const scriptContent = scriptTag.textContent;
                const bioMatch = new RegExp("\"desc\":\"([^\"]*)\"", "").exec(scriptContent);
                if (bioMatch && bioMatch[1]) {
                    bio = bioMatch[1].replace(new RegExp("\\\\n", "g"), "\n");
                    console.log("从脚本中提取到完整bio:", bio);
                    break;
                }
            }
        }
    } catch (e) {
        console.error("从脚本提取bio出错:", e);
    }
    if (!bio) {
        const bioElement1 = userInfoContainer.querySelector("div.DtlymgqL span span span span span span");
        if (bioElement1) {
            bio = bioElement1.innerText.trim();
            console.log("从DtlymgqL元素提取到bio:", bio);
        }
        if (!bio || bio === "") {
            const bioElement11 = document.querySelector("div.X45g5WK0 span span span span span span");
            if (bioElement11) {
                bio = bioElement11.innerText.trim();
                console.log("从X45g5WK0元素提取到bio:", bio);
            }
        }
        if (!bio || bio === "") {
            const bioSelectors = [".X45g5WK0 span", ".j5WZzJdp span", ".X45g5WK0 .j5WZzJdp", ".user-bio", ".user-desc", "[data-e2e=\"user-bio\"]", "[data-e2e=\"user-desc\"]"];
            for (const selector of bioSelectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText && el.innerText.trim() !== "") {
                    bio = el.innerText.trim();
                    console.log(`从选择器 ${selector} 提取到bio:`, bio);
                    break;
                }
            }
        }
    }
    console.log("最终提取到的bio:", bio);
    const avatarImage = userInfoContainer.querySelectorAll("div[data-e2e=\"user-info-follow\"] .sCnO6dhe, div[data-e2e=\"user-info-fans\"] .sCnO6dhe, div[data-e2e=\"user-info-like\"] .sCnO6dhe");
    scraper = "";
    bioText = "";
    bioData = "";
    if (avatarImage && avatarImage.length >= 3) {
        scraper = avatarImage[0].innerText.trim();
        bioText = avatarImage[1].innerText.trim();
        bioData = avatarImage[2].innerText.trim();
    }
    console.log("关注数:", scraper);
    console.log("粉丝数:", bioText);
    console.log("获赞数:", bioData);
    const bioElement = document.querySelector(".PCbKMDUa[data-e2e=\"user-tab-count\"]");
    let bioSelector = bioElement ? bioElement.innerText.trim() : "";
    console.log("作品数量:", bioSelector);
    bioExtractor = 0;
    if (bioSelector) {
        if (bioSelector.includes("万")) {
            const bioValue = parseFloat(bioSelector.replace(new RegExp("[^0-9.]", "g"), ""));
            if (!isNaN(bioValue)) {
                bioExtractor = bioValue * 10000;
            }
        } else {
            bioExtractor = parseInt(bioSelector.replace(new RegExp("[^0-9]", "g"), "")) || 0;
        }
    }
    console.log("作品数量(数字):", bioExtractor);
    const userBio = Math.min(bioExtractor, 100);
    console.log(`将抓取最多 ${userBio} 个视频`);
    const userBio2 = await scrapeUserVideos(userBio);
    console.log(`成功抓取 ${userBio2.length} 个视频`);
    return {
        userId: userID,
        username: nickname2,
        avatar: avatarUrl,
        description: bio,
        age: age,
        gender: gender,
        constellation: "",
        location: ipLocation2,
        ipLocation: "",
        following: scraper,
        followers: bioText,
        likes: bioData,
        postCount: bioSelector,
        verified: role,
        videos: userBio2
    };
}
async function scrapeUserVideos(maxVideos = 100) {
    console.log(`开始抓取用户视频，最多 ${maxVideos} 个...`);
    function getElementHierarchy(element, maxLevels = 5, elementDepth) {
        const hierarchy = [];
        let currentElement = element;
        elementDepth = 0;
        while (currentElement && elementDepth < maxLevels) {
            const classInfo = currentElement.className ? ` (class="${currentElement.className}")` : "";
            const idInfo = currentElement.id ? ` (id="${currentElement.id}")` : "";
            hierarchy.push(`${currentElement.tagName.toLowerCase()}${classInfo}${idInfo}`);
            currentElement = currentElement.parentElement;
            elementDepth++;
        }
        return hierarchy;
    }
    let videoContainer = null;
    const videoList = document.querySelector("div[data-e2e=\"user-post-list\"]");
    if (videoList) {
        const scrollList = videoList.querySelector("ul[data-e2e=\"scroll-list\"]");
        if (scrollList) {
            videoContainer = scrollList;
            console.log("找到data-e2e=\"scroll-list\"容器");
        }
    }
    if (!videoContainer) {
        videoContainer = document.querySelector(".OCcpRRtX");
        if (videoContainer) {
            console.log("找到.OCcpRRtX容器");
        }
    }
    if (!videoContainer) {
        const selectors = ["ul[data-e2e=\"scroll-list\"]", "div[data-e2e=\"user-post-list-item\"]", "ul[data-e2e=\"user-post-list\"]", ".DmhHcNHN", "div[data-e2e=\"user-post\"]"];
        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container) {
                console.log(`找到容器，使用选择器: ${selector}`);
                videoContainer = container;
                break;
            }
        }
    }
    async function fetchVideos(allResults = [], scrollAttempts = 0, maxScrollAttempts = 20) {
        try {
            chrome.runtime.sendMessage({
                action: "updateStatus",
                status: `已抓取 ${allResults.length}/${maxVideos} 个视频，继续抓取中...`
            });
        } catch (e) {
            console.error("发送初始进度消息失败:", e);
        }
        let videoItems = [];
        if (videoContainer) {
            videoItems = videoContainer.querySelectorAll("li");
            console.log(`从容器中找到 ${videoItems.length} 个视频项`);
        } else {
            videoItems = document.querySelectorAll("div[data-e2e=\"user-post-item\"], .TikR9yWD, .niBfRBgX");
            console.log(`直接找到 ${videoItems.length} 个视频项`);
        }
        const videos = [];
        const videoLinksSet = new Set(allResults.map(item => item.link));
        for (let index = 0; index < videoItems.length; index++) {
            const videoItem = videoItems[index];
            console.log(`处理第 ${index + 1}/${videoItems.length} 个视频数据 (总计 ${allResults.length + videos.length}/${maxVideos})`);
            const linkElement = videoItem.querySelector("a");
            let videoLink = "";
            if (linkElement && linkElement.href) {
                videoLink = linkElement.href;
                if (videoLinksSet.has(videoLink)) {
                    console.log("跳过重复视频:", videoLink);
                    continue;
                }
                console.log("视频链接:", videoLink);
            } else {
                console.log("未找到链接元素，跳过此项");
                continue;
            }
            const videoImg = videoItem.querySelector("img");
            let coverSrc = "";
            if (videoImg && videoImg.src) {
                coverSrc = videoImg.src;
                console.log("视频封面:", coverSrc);
            }
            let videoTitle = "";
            const selectors = [".ztA3qIFr", ".Ja95nb2Z", ".iQKjh6vV", "p.VdTyguLN"];
            for (const selector of selectors) {
                const videoElement = videoItem.querySelector(selector);
                if (videoElement && videoElement.innerText.trim()) {
                    videoTitle = videoElement.innerText.trim();
                    console.log(`从选择器 ${selector} 提取到视频标题:`, videoTitle);
                    break;
                }
            }
            const likes = videoItem.querySelector(".b3Dh2ia8, .DxWBwQZu");
            let likesCount = "";
            if (likes) {
                likesCount = likes.innerText.trim();
                console.log("视频点赞数:", likesCount);
            }
            const duration = videoItem.querySelector(".ckopQfVu, .video-duration, ._L26I_xb");
            let duration2 = "";
            if (duration) {
                duration2 = duration.innerText.trim();
                console.log("视频时长:", duration2);
            }
            let publishDate = "";
            const publishSelectors = [".faDtinfi", ".VFUqD35C", ".video-date", ".publish-time"];
            for (const selector of publishSelectors) {
                const publishDateElem = videoItem.querySelector(selector);
                if (publishDateElem && publishDateElem.innerText.trim()) {
                    publishDate = publishDateElem.innerText.trim().replace(new RegExp("^[·\\s]+", ""), "");
                    console.log(`从选择器 ${selector} 提取到发布时间:`, publishDate);
                    break;
                }
            }
            const tagElement = videoItem.querySelector(".semi-tag-content-ellipsis, .user-video-tag");
            const isPinned = tagElement && tagElement.innerText.includes("置顶");
            if (isPinned) {
                console.log("这是置顶视频");
            }
            videos.push({
                title: videoTitle,
                cover: coverSrc,
                author: "",
                authorID: "",
                authorLink: "",
                authorAvatar: "",
                link: videoLink,
                likes: likesCount,
                isTop: isPinned || false,
                duration: duration2,
                publishTime: publishDate
            });
            videoLinksSet.add(videoLink);
            try {
                chrome.runtime.sendMessage({
                    action: "updateStatus",
                    status: `已抓取 ${allResults.length + videos.length}/${maxVideos} 个视频，继续抓取中...`
                });
            } catch (e) {
                console.error("发送进度消息失败:", e);
            }
            if (allResults.length + videos.length >= maxVideos) {
                console.log(`已达到最大视频数 ${maxVideos}，停止处理`);
                break;
            }
        }
        const fetchedVideos = [...allResults, ...videos];
        console.log(`当前已抓取 ${fetchedVideos.length} 个视频数据`);
        if (fetchedVideos.length >= maxVideos) {
            return fetchedVideos.slice(0, maxVideos);
        }
        if (videos.length === 0) {
            scrollAttempts++;
            if (scrollAttempts >= maxScrollAttempts) {
                console.log(`已尝试滚动 ${scrollAttempts} 次但没有找到新视频，停止抓取`);
                return fetchedVideos;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 300));
        await loadMoreVideos();
        return fetchVideos(fetchedVideos, scrollAttempts, maxScrollAttempts);
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
            const targetScroll = scrollTop + 1000;
            console.log(`滚动容器信息 - 当前位置: ${scrollTop}, 容器高度: ${containerHeight}, 总高度: ${scrollHeight}`);
            const scrollSteps = 10;
            const scrollStep = 1000 / scrollSteps;
            const scrollInterval = 50;
            let scrollCount = 0;
            const scrollTimer = setInterval(() => {
                if (scrollCount >= scrollSteps) {
                    clearInterval(scrollTimer);
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
                scrollCount++;
                scrollContainer.scrollTop = scrollTop + scrollStep * scrollCount;
                console.log(`滚动步骤 ${scrollCount}/${scrollSteps}, 当前位置: ${scrollContainer.scrollTop}`);
            }, scrollInterval);
        });
    }
    try {
        const fetchedVideos = await fetchVideos([], 0, 20);
        const userInfo = document.querySelector("div[data-e2e=\"user-info\"], .mZmVWLzR");
        let authorName = "";
        let authorID = "";
        if (userInfo) {
            const authorHeader = userInfo.querySelector("h1.a34DMvQe span span");
            authorName = authorHeader ? authorHeader.innerText.trim() : "";
            const authorIDSpan = userInfo.querySelector("span.TVGQz3SI");
            if (authorIDSpan) {
                const authorID1 = authorIDSpan.innerText.trim();
                if (authorID1.startsWith("抖音号：")) {
                    authorID = authorID1.replace("抖音号：", "");
                }
            }
        }
        try {
            chrome.runtime.sendMessage({
                action: "updateStatus",
                status: `已完成抓取 ${fetchedVideos.length} 个视频数据`
            });
        } catch (e) {
            console.error("发送完成消息失败:", e);
        }
        return fetchedVideos.map(video => ({
            ...video,
            author: authorName,
            authorID: authorID
        }));
    } catch (error) {
        console.error("抓取视频时出错:", error);
        return [];
    }
}
