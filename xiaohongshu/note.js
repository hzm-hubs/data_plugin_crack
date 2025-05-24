function isXiaohongshuNoteDetail() {
  console.log("检查是否为小红书笔记详情页面...");
  const isExplorePage = window.location.href.includes("/explore/");
  console.log("URL是否包含/explore/路径:", isExplorePage);
  const noteId = window.location.href.match(
    new RegExp("\\/explore\\/([a-zA-Z0-9]+)", "")
  );
  const noteId2 = noteId && noteId[1];
  console.log(
    "是否能从URL提取笔记ID:",
    noteId2 ? `是，ID: ${noteId[1]}` : "否"
  );
  const noteContainer = document.querySelector(
    ".note-container, #noteContainer, div[note-id]"
  );
  console.log("是否找到笔记容器元素:", noteContainer !== null);
  if (noteContainer) {
    const authorElem = noteContainer.querySelector(".author, .author-wrapper");
    console.log("是否找到作者信息区域:", authorElem !== null);
    const interaction = noteContainer.querySelector(
      ".interaction-container, .comments-el"
    );
    console.log("是否找到交互区域:", interaction !== null);
  }
  const isNoteDetail = isExplorePage && noteContainer !== null;
  console.log("当前页面是否为小红书笔记详情页面:", isNoteDetail);
  return isNoteDetail;
}
async function scrapeXiaohongshuNoteData(
  noteId,
  noteTitle,
  noteContent,
  createdAt,
  noteId2
) {
  console.log("开始抓取小红书笔记详情数据...");
  console.log("当前URL:", window.location.href);
  noteId = "";
  const extractedNoteId = window.location.href.match(
    new RegExp("\\/explore\\/([a-zA-Z0-9]+)", "")
  );
  if (extractedNoteId && extractedNoteId[1]) {
    noteId = extractedNoteId[1];
    console.log("从URL提取笔记ID:", noteId);
  } else {
    console.error("URL中未找到笔记ID");
    return {
      error: true,
      message: "URL中未找到笔记ID",
      title: "无法获取笔记数据",
      description: "请确认当前URL包含笔记ID",
      link: window.location.href,
    };
  }
  let noteContainer = null;
  try {
    noteContainer = await waitForElement("#noteContainer", 5000);
    console.log("成功找到笔记容器元素");
  } catch (e) {
    console.error("等待笔记容器加载超时:", e);
    return {
      error: true,
      message: "等待笔记容器加载超时",
      id: noteId,
      title: "无法获取笔记数据",
      description: "笔记详情容器未加载",
      link: window.location.href,
    };
  }
  noteTitle = "";
  const noteTitleElement = noteContainer.querySelector(".title, #detail-title");
  if (noteTitleElement) {
    noteTitle = noteTitleElement.textContent.trim();
    console.log("提取到笔记标题:", noteTitle);
  } else {
    console.log("未找到笔记标题元素");
  }
  noteContent = "";
  const noteDesc = noteContainer.querySelector(".desc, #detail-desc");
  if (noteDesc) {
    noteContent = noteDesc.textContent.trim();
    console.log("提取到笔记内容:", noteContent);
  } else {
    console.log("未找到笔记内容元素");
  }
  let tags = [];
  const tags2 = noteContainer.querySelectorAll('a.tag, a[id="hash-tag"]');
  if (tags2 && tags2.length > 0) {
    tags2.forEach((tag) => {
      const text = tag.textContent.trim();
      if (text && !tags.includes(text)) {
        tags.push(text);
      }
    });
    console.log("提取到标签:", tags);
  } else {
    console.log("未找到标签元素");
  }
  let authorInfo = {
    id: "",
    nickname: "",
    avatar: "",
    link: "",
  };
  const authorInfoContainer = noteContainer.querySelector(
    ".author-wrapper, .author"
  );
  if (authorInfoContainer) {
    const authorName = authorInfoContainer.querySelector(".name, .username");
    if (authorName) {
      authorInfo.nickname = authorName.textContent.trim();
      console.log("提取到作者昵称:", "");
      const authorLink = authorName.closest("a");
      if (authorLink && authorLink.href) {
        const userId = authorLink.href.match(
          new RegExp("\\/user\\/profile\\/([a-zA-Z0-9]+)", "")
        );
        if (userId && userId[1]) {
          authorInfo.id = userId[1];
          console.log("提取到作者ID:", "");
        }
      }
    }
    const avatarImg = authorInfoContainer.querySelector("img.avatar-item");
    if (avatarImg && avatarImg.src) {
      authorInfo.avatar = avatarImg.src;
      console.log("提取到作者头像:", "");
    }
  } else {
    console.log("未找到作者信息容器");
  }
  createdAt = "";
  const creationDate = noteContainer.querySelector(
    ".date, .note-content .date"
  );
  if (creationDate) {
    createdAt = creationDate.textContent.trim();
    console.log("提取到创建时间:", createdAt);
  } else {
    console.log("未找到创建时间元素");
  }
  let interactions = {
    likes: 0,
    comments: 0,
    collects: 0,
  };
  const likeCount = noteContainer.querySelector(
    ".interact-container .like-wrapper .count"
  );
  if (likeCount) {
    const likeCount1 = likeCount.textContent.trim();
    if (likeCount1 && likeCount1 !== "赞") {
      interactions.likes = parseInt(likeCount1) || 0;
      console.log("提取到点赞数:", interactions.likes);
    }
  }
  const commentCount = noteContainer.querySelector(
    ".interact-container .chat-wrapper .count"
  );
  if (commentCount) {
    const commentCount1 = commentCount.textContent.trim();
    const commentCount2 = commentCount1.match(new RegExp("(\\d+)", ""));
    if (commentCount2 && commentCount2[1]) {
      interactions.comments = parseInt(commentCount2[1]) || 0;
      console.log("提取到评论数:", interactions.comments);
    }
  }
  const collectCount = noteContainer.querySelector(
    ".interact-container .collect-wrapper .count"
  );
  if (collectCount) {
    const collectsCount = collectCount.textContent.trim();
    if (collectsCount && collectsCount !== "收藏") {
      interactions.collects = parseInt(collectsCount) || 0;
      console.log("提取到收藏数:", interactions.collects);
    }
  }
  noteId2 = "";
  let videoUrls = [];
  const videoElement = noteContainer.querySelector(
    ".media-container video, video.xgplayer-video"
  );
  if (videoElement) {
    noteId2 = "video";
    console.log("检测到视频类型的笔记");
    let videoUrl = "";
    if (videoElement.src) {
      videoUrl = videoElement.src;
      console.log("从video元素的src属性提取视频URL:", videoUrl);
    } else {
      console.log("video元素没有直接的src属性，尝试其他方式获取");
      try {
        const playerElements = noteContainer.querySelectorAll(
          ".xgplayer, .player-container"
        );
        for (const playerElement of playerElements) {
          if (playerElement.__xgplayer__ && playerElement.__xgplayer__.src) {
            videoUrl = playerElement.__xgplayer__.src;
            console.log("从播放器实例中提取视频URL:", videoUrl);
            break;
          }
        }
      } catch (e) {
        console.error("尝试从播放器实例提取视频URL时出错:", e);
      }
    }
    let videoCover = "";
    const videoPoster = noteContainer.querySelector(
      ".xgplayer-poster, xg-poster"
    );
    if (videoPoster) {
      const videoStyle = videoPoster.getAttribute("style");
      if (videoStyle) {
        const videoUrl1 = videoStyle.match(
          new RegExp("url\\(['\"]?(.*?)['\"]?\\)", "")
        );
        if (videoUrl1 && videoUrl1[1]) {
          videoCover = videoUrl1[1];
          console.log("提取到视频封面:", videoCover);
        }
      }
    }
    videoUrls.push({
      type: "video",
      url: videoUrl,
      cover: videoCover,
    });
  } else {
    const imageElems = noteContainer.querySelectorAll(
      ".media-container img, .note-detail-img img"
    );
    if (imageElems && imageElems.length > 0) {
      console.log("检测到图片类型的笔记，共找到", imageElems.length, "张图片");
      imageElems.forEach((img, index) => {
        if (img.src) {
          videoUrls.push({
            type: "image",
            url: img.src,
            cover: "",
          });
          console.log(`提取到第${index + 1}张图片:`, img.src);
        }
      });
    } else {
      noteId2 = "text";
      console.log("未检测到媒体内容，可能是纯文本笔记");
    }
  }
  let videoSrc = [];
  try {
    console.log("开始提取评论数据...");
    videoSrc = await scrapeNoteComments();
  } catch (e) {
    console.error("提取评论数据时出错:", e);
  }
  const tagText = {
    author: {
      id: authorInfo.id || "",
      name: authorInfo.nickname || "",
      avatar: authorInfo.avatar || "",
      link: authorInfo.link || "",
    },
    post: {
      id: noteId,
      title: noteTitle,
      coverImage: "",
      description: noteContent,
      link: window.location.href,
      duration: "",
      publishTime: createdAt,
      musicInfo: "",
      tags: tags,
    },
    interactions: {
      likes: interactions.likes,
      comments: interactions.comments,
      favorites: interactions.collects,
      shares: 0,
    },
    mediaContent: videoUrls,
    commentsList: videoSrc.map((comment) => ({
      userName: comment.userName,
      avatar: comment.avatar || "",
      content: comment.content,
      likes: comment.likes || "0",
      date: comment.date || "",
      location: comment.location || "",
      isAuthor: comment.isAuthor,
    })),
  };
  console.log("笔记数据抓取完成:", tagText);
  return tagText;
}
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      return resolve(element);
    }
    const observer = new MutationObserver((mutations) => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`等待元素 ${selector} 超时`));
    }, timeout);
  });
}
async function scrapeNoteComments(maxComments = 100) {
  console.log("开始抓取小红书笔记评论数据...");
  const comments = [];
  const commentIds = new Set();
  try {
    const commentsContainer = await waitForElement(".comments-el", 10000);
    if (!commentsContainer) {
      console.log("未找到评论容器，跳过评论抓取");
      return comments;
    }
    const totalCommentsElement = commentsContainer.querySelector(".total");
    const totalComments = totalCommentsElement
      ? totalCommentsElement.textContent.trim()
      : "";
    const totalMatch = totalComments.match(
      new RegExp("共\\s*(\\d+)\\s*条评论", "")
    );
    const totalCommentsCount = totalMatch ? parseInt(totalMatch[1]) : 0;
    console.log(`总评论数: ${totalCommentsCount}`);
    const targetCount = Math.min(maxComments, totalCommentsCount);
    if (targetCount === 0) {
      console.log("没有评论，返回空数组");
      return comments;
    }
    const commentsList = commentsContainer.querySelector(".list-container");
    const noteScroller = document.querySelector(".note-scroller");
    if (!commentsList || !noteScroller) {
      console.log("未找到评论列表容器或滚动容器");
      return comments;
    }
    let scrollAttempts = 0;
    const maxScrollAttempts = 20;
    while (scrollAttempts < maxScrollAttempts) {
      const commentCount =
        commentsList.querySelectorAll(".parent-comment").length;
      console.log(`当前已加载评论数: ${commentCount}`);
      const endMarker = document.querySelector(".end-container");
      if (endMarker) {
        console.log("检测到底部标记，评论已全部加载");
        break;
      }
      if (commentCount >= targetCount) {
        console.log("已达到目标评论数");
        break;
      }
      noteScroller.scrollTop = noteScroller.scrollHeight;
      console.log("滚动到底部");
      await new Promise((resolve) => setTimeout(resolve, 1000));
      scrollAttempts++;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const loadedComments = commentsList.querySelectorAll(".parent-comment");
    console.log(`找到 ${loadedComments.length} 条评论`);
    for (const comment of loadedComments) {
      try {
        const commentItem = comment.querySelector(".comment-item");
        if (!commentItem || !commentItem.id) {
          continue;
        }
        const commentId = commentItem.id;
        if (commentIds.has(commentId)) {
          continue;
        }
        commentIds.add(commentId);
        const noteText = comment.querySelector(".content .note-text");
        const note = noteText ? noteText.textContent.trim() : "";
        const author = comment.querySelector(".author");
        const userName = author
          ? author.querySelector(".name").textContent.trim()
          : "";
        const dateElement = comment.querySelector(
          ".info .date span:first-child"
        );
        const date = dateElement ? dateElement.textContent.trim() : "";
        const $location = comment.querySelector(".info .date .location");
        const $location2 = $location ? $location.textContent.trim() : "";
        const likeCount = comment.querySelector(
          ".info .interactions .like .count"
        );
        const likeCount2 = likeCount
          ? likeCount.textContent.trim() === "赞"
            ? "0"
            : likeCount.textContent.trim()
          : "0";
        const avatar = comment.querySelector("img.avatar-item");
        const avatarSrc = avatar ? avatar.src : "";
        const authorLink = author ? author.querySelector("a").href : "";
        const authorIdMatch = authorLink.match(
          new RegExp("\\/user\\/profile\\/([a-zA-Z0-9]+)", "")
        );
        const authorId = authorIdMatch ? authorIdMatch[1] : "";
        const tagElement = author.querySelector(".tag");
        const isAuthorTag = tagElement
          ? tagElement.textContent.includes("作者")
          : false;
        const replyCount = comment.querySelector(
          ".info .interactions .reply .count"
        );
        const replyCount2 = replyCount
          ? replyCount.textContent.trim() === "回复"
            ? "0"
            : replyCount.textContent.trim()
          : "0";
        comments.push({
          id: commentId,
          userName: userName,
          content: note,
          date: date,
          location: $location2,
          likes: likeCount2,
          avatar: avatarSrc,
          authorId: authorId,
          isAuthor: isAuthorTag,
          replies: replyCount2,
        });
        if (comments.length >= targetCount) {
          console.log("达到目标评论数，停止抓取");
          break;
        }
      } catch (error) {
        console.error("抓取单条评论时出错:", error);
      }
    }
    console.log(`评论抓取完成，共获取 ${comments.length} 条评论`);
    return comments;
  } catch (error) {
    console.error("抓取评论数据时出错:", error);
    return comments;
  }
}
if (typeof module !== "undefined") {
  module.exports = {
    isXiaohongshuNoteDetail: isXiaohongshuNoteDetail,
    scrapeXiaohongshuNoteData: scrapeXiaohongshuNoteData,
  };
}
