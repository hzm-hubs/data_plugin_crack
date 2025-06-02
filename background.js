chrome.runtime.onInstalled.addListener(function () {
  console.log("数据抓取工具已安装");
});
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "updateData") {
    console.log(
      "收到数据更新消息，域名:",
      request.domain,
      "数据类型:",
      request.type,
      "页面URL:",
      request.url
    );
    if (request.domain === "douyin") {
      if (request.type === "video") {
        console.log("抖音视频详情数据:", request.data.title);
      } else {
        if (request.type === "user") {
          console.log(
            "抖音用户数据:",
            request.data.nickname,
            "视频数量:",
            request.data.videos ? request.data.videos.length : 0
          );
        } else {
          if (request.type === "search") {
            console.log("抖音搜索数据条数:", request.data.length);
          }
        }
      }
    } else {
      if (request.domain === "xiaohongshu") {
        if (request.type === "user") {
          console.log(
            "小红书用户数据:",
            request.data.username,
            "笔记数量:",
            request.data.notes ? request.data.notes.length : 0
          );
        } else {
          if (request.type === "search") {
            console.log("小红书搜索数据条数:", request.data.length);
          } else {
            if (request.type === "note") {
              console.log("小红书笔记详情数据:", request.data.title);
            }
          }
        }
      } else if (request.domain === "myseller") {
        if (request.type === "tableList") {
          console.log("千牛读取商品条数:", request.data.length);
        }
      } else {
        if (request.domain === "taobao" || request.domain === "tmall") {
          if (request.type === "search") {
            console.log("淘系搜索数据条数:", request.data.length);
          } else {
            if (request.type === "detail") {
              console.log("淘系详情页数据:", request.data.title);
            }
          }
        } else {
          console.log("其他域名数据:", request.domain, request.type);
          if (request.type === "search") {
            console.log("搜索数据条数:", request.data.length);
          } else {
            if (request.type === "detail") {
              console.log("详情页数据:", request.data.title);
            }
          }
        }
      }
    }
  } else {
    if (request.action === "updateStatus") {
      console.log("状态更新:", request.status);
    }
  }
  return true;
});

// 监听响应开始（只能读取，不能修改）
chrome.webRequest.onResponseStarted.addListener(
  function (details) {
    console.log("Response started:", details);
  },
  { urls: ["https://one.alimama.com/report/*"] }
);

chrome.webRequest.onCompleted.addListener(
  function (details) {
    console.log("Response completed:", details);
  },
  { urls: ["https://one.alimama.com/report/*"] }
);
