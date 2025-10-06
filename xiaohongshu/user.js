function scrapeXiaohongshuUserData(refresh = false) {
  console.log("开始抓取小红书用户页面数据");
  return new Promise(async (resolve, reject) => {
    try {
      sendStatusToPopup("正在获取用户信息...");
      const userInfo = {
        userId: "",
        username: "",
        avatar: "",
        description: "",
        age: "",
        gender: "",
        constellation: "",
        location: "",
        ipLocation: "",
        following: "",
        followers: "",
        likes: "",
        postCount: "",
        verified: "",
        notes: [],
      };
      const userInfoContainer = document.querySelector(".user-info");
      if (!userInfoContainer) {
        console.error("找不到用户信息容器");
        sendStatusToPopup("无法获取用户信息");
        reject(new Error("找不到用户信息容器"));
        return;
      }
      const userName = userInfoContainer.querySelector(".user-name");
      if (userName) {
        userInfo.username = userName.textContent.trim();
        console.log(`找到用户昵称: ${userInfo.username}`);
      }
      const userIdElement = userInfoContainer.querySelector(".user-redId");
      if (userIdElement) {
        userInfo.userId = userIdElement.textContent
          .replace("小红书号：", "")
          .trim();
        console.log(`找到用户ID: ${userInfo.userId}`);
      }
      const avatar = userInfoContainer.querySelector(".avatar-wrapper img");
      if (avatar) {
        userInfo.avatar = avatar.src;
        console.log(`找到用户头像: ${userInfo.avatar}`);
      }
      const userDesc = userInfoContainer.querySelector(".user-desc");
      if (userDesc) {
        userInfo.description = userDesc.textContent.trim();
        console.log(`找到用户简介: ${userInfo.description}`);
      }
      const tagItems = userInfoContainer.querySelectorAll(".tag-item");
      if (tagItems.length > 0) {
        for (const tagItem of tagItems) {
          const genderElement = tagItem.querySelector(".gender");
          if (genderElement) {
            const genderIcon = genderElement.querySelector("use");
            if (genderIcon) {
              const genderRef = genderIcon.getAttribute("xlink:href");
              if (genderRef === "#male") {
                userInfo.gender = "男";
              } else {
                if (genderRef === "#female") {
                  userInfo.gender = "女";
                }
              }
            }
            const genderText = genderElement.querySelector(".gender-text");
            if (genderText) {
              const userInfoDetail = genderText.textContent.trim();
              if (userInfoDetail.includes("岁")) {
                userInfo.age = userInfoDetail;
                console.log(`找到用户年龄: ${userInfo.age}`);
              } else {
                if (userInfoDetail.includes("座")) {
                  userInfo.constellation = userInfoDetail;
                  console.log(`找到用户星座: ${userInfo.constellation}`);
                }
              }
            }
          }
        }
        if (tagItems.length > 1 && !tagItems[1].querySelector(".gender")) {
          userInfo.location = tagItems[1].textContent.trim();
          console.log(`找到用户地区: ${userInfo.location}`);
        }
      }
      const ipLocation = userInfoContainer.querySelector(".user-IP");
      if (ipLocation) {
        userInfo.ipLocation = ipLocation.textContent
          .replace("IP属地：", "")
          .trim();
        console.log(`找到IP属地: ${userInfo.ipLocation}`);
      }
      const interactions = userInfoContainer.querySelectorAll(
        ".user-interactions > div"
      );
      if (interactions.length >= 3) {
        const followingCount = interactions[0].querySelector(".count");
        if (followingCount) {
          userInfo.following = followingCount.textContent.trim();
          console.log(`找到关注数: ${userInfo.following}`);
        }
        const followersCount = interactions[1].querySelector(".count");
        if (followersCount) {
          userInfo.followers = followersCount.textContent.trim();
          console.log(`找到粉丝数: ${userInfo.followers}`);
        }
        const likesElement = interactions[2].querySelector(".count");
        if (likesElement) {
          userInfo.likes = likesElement.textContent.trim();
          console.log(`找到获赞数: ${userInfo.likes}`);
        }
      }
      sendStatusToPopup(`正在抓取用户 ${userInfo.username} 的笔记...`);
      let isFetching = false;
      const uniqueLinks = new Set();
      const maxNotes = 100;
      const maxRetries = 15;
      let noteCount = 0;
      let noteCount2 = 0;
      function updateStatus(count, total) {
        sendStatusToPopup(`已找到 ${count}/${total} 个笔记，继续加载中...`);
      }
      function fetchNotes(noteCount) {
        const feedsContainer =
          document.querySelector("#userPostedFeeds") ||
          document.querySelector(".feeds-container");
        if (!feedsContainer) {
          console.error("找不到笔记容器");
          return 0;
        }
        const noteItems = feedsContainer.querySelectorAll(".note-item");
        console.log(`当前页面找到 ${noteItems.length} 个笔记元素`);
        noteCount = 0;
        // todo notes selector
        for (const noteItem of noteItems) {
          try {
            const noteLink =
              noteItem.querySelector("a.cover") ||
              noteItem.querySelector('a[href*="/explore/note/"]') ||
              noteItem.querySelector('a[href*="/user/profile/"]');
            if (!noteLink) {
              console.warn("找不到链接元素，跳过此笔记");
              continue;
            }
            const noteUrl = noteLink.href;
            // 需要登录才能查看笔记，不然noteUrl都是一样的，点击弹出登录框
            if (uniqueLinks.has(noteUrl)) {
              continue;
            }
            uniqueLinks.add(noteUrl);
            noteCount++;
            const noteImage =
              noteItem.querySelector("img[data-xhs-img]") ||
              noteItem.querySelector("img.cover") ||
              noteLink.querySelector("img");
            const noteImageSrc = noteImage ? noteImage.src : "";
            const noteTitle =
              noteItem.querySelector(".title span") ||
              noteItem.querySelector(".content") ||
              noteItem.querySelector(".desc");
            const noteTitle2 = noteTitle ? noteTitle.textContent.trim() : "";
            const username = userInfo.username;
            const topTags =
              noteItem.querySelector(".top-tag-area .top-wrapper") ||
              noteItem.querySelector(".top-wrapper");
            const hasTopTags = !!topTags;
            const likeCount =
              noteItem.querySelector(".like-wrapper .count") ||
              noteItem.querySelector(".like-count") ||
              noteItem.querySelector(".interact-info");
            const likeCount2 = likeCount ? likeCount.textContent.trim() : "0";
            userInfo.notes.push({
              title: noteTitle2,
              cover: noteImageSrc,
              author: username,
              authorID: "",
              authorLink: window.location.href,
              authorAvatar: userInfo.avatar,
              link: noteUrl,
              likes: likeCount2,
              isTop: hasTopTags,
              duration: "",
              publishTime: "",
            });
            if (userInfo.notes.length >= maxNotes) {
              break;
            }
          } catch (error) {
            console.error("抓取单个笔记时出错:", error);
          }
        }
        console.log(
          `本次新增 ${noteCount} 个笔记，当前总数: ${userInfo.notes.length}`
        );
        return noteCount;
      }
      async function loadMore() {
        if (isFetching) {
          return;
        }
        isFetching = true;
        try {
          const notesCount = fetchNotes();
          userInfo.postCount = userInfo.notes.length;
          updateStatus(userInfo.notes.length, maxNotes);
          if (userInfo.notes.length >= maxNotes) {
            console.log(`已达到目标数量 ${maxNotes} 个笔记，停止滚动`);
            isFetching = false;
            resolve(userInfo);
            return;
          }
          if (notesCount === 0) {
            noteCount2++;
            console.log(`本次滚动没有新增笔记，无新数据计数: ${noteCount2}`);
            if (noteCount2 >= 3) {
              console.log(
                `连续 ${noteCount2} 次没有新增笔记，可能已加载完全部内容`
              );
              isFetching = false;
              resolve(userInfo);
              return;
            }
          } else {
            noteCount2 = 0;
          }
          noteCount++;
          if (noteCount >= maxRetries) {
            console.log(`已达到最大重试次数 ${maxRetries}，停止滚动`);
            isFetching = false;
            resolve(userInfo);
            return;
          }
          console.log(
            `滚动加载更多内容，当前已有 ${userInfo.notes.length} 个笔记`
          );
          window.scrollTo(0, document.body.scrollHeight);
          await new Promise((resolve) => setTimeout(resolve, 2000));
          isFetching = false;
          loadMore();
        } catch (error) {
          console.error("滚动加载时出错:", error);
          isFetching = false;
          resolve(userInfo);
        }
      }
      await loadMore();
    } catch (error) {
      console.error("抓取小红书用户页面数据时出错:", error);
      reject(error);
    }
  });
}
function sendStatusToPopup(status) {
  try {
    chrome.runtime.sendMessage({
      action: "updateStatus",
      status: status,
    });
  } catch (error) {
    console.error("发送状态更新失败:", error);
  }
}
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapeData") {
    console.log("收到抓取用户数据请求");
    scrapeXiaohongshuUserData()
      .then((results) => {
        console.log("抓取完成，发送结果到popup");
        sendResponse({
          success: true,
          data: results,
        });
      })
      .catch((error) => {
        console.error("抓取失败:", error);
        sendResponse({
          success: false,
          error: error.message,
        });
      });
    return true;
  }
});
