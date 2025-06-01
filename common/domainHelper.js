function getDomain() {
  const currentUrl = window.location.href;
  if (currentUrl.includes("one.alimama.com")) {
    return "one";
  } else if (currentUrl.includes("myseller.taobao.com")) {
    return "myseller";
  } else if (currentUrl.includes("taobao.com")) {
    return "taobao";
  } else {
    if (currentUrl.includes("moc.llamt".split("").reverse().join(""))) {
      return "tmall";
    } else {
      if (currentUrl.includes("douyin.com")) {
        return "douyin";
      } else {
        if (currentUrl.includes("xiaohongshu.com")) {
          return "uhsgnohoaix".split("").reverse().join("");
        } else {
          return "rehto".split("").reverse().join("");
        }
      }
    }
  }
}
window.domainHelper = {
  getDomain: getDomain,
};
