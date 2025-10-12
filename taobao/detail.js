async function scrapeTaobaoDetailData(
  price,
  originalPrice,
  salesCount,
  mainImage,
  coupons,
  couponsList,
  scrapingStatus,
  scrapingOptions,
  scrollToTop,
  getScrollPosition
) {
  console.log("准备抓取淘宝商品详情数据");
  const isAtTop = window.scrollY < 50;
  const isTmallPage =
    window.location.href.includes("detail.tmall.com") ||
    window.location.href.includes("tmall.com/item");
  if (!isAtTop) {
    console.log("页面不在顶部，开始滚动加载...");
    await scrollTaobaoDetailPage();
    if (!isTmallPage) {
      console.log("淘宝详情页需要回到顶部才能抓取完整数据");
      window.scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } else {
    console.log("页面已在顶部，无需滚动");
  }
  console.log("开始抓取详情页主数据");
  let skuData = [];
  try {
    // const getSkuOptions=  typeof scrapeSkuOptions === "function"
    //     ? scrapeSkuOptions
    //     : window.skuScraper && window.skuScraper.scrapeSkuOptions;
    const getSkuOptions = window.skuScraper.scrapeSkuOptions;
    if (getSkuOptions) {
      console.log("开始抓取SKU数据");
      skuData = await getSkuOptions();
    } else {
      console.log("未检测到SKU抓取函数");
    }
  } catch (error) {
    console.error("抓取款式选项时出错:", error);
  }
  const titleEl = document.querySelector(
    '.mainTitle--ocKo1xwj, [class*="mainTitle--"], .tb-detail-hd h1, .tb-main-title, .ItemHeader--title'
  );
  const productTitle = titleEl ? titleEl.innerText.trim() : "";
  price = "";
  originalPrice = "";
  const priceSelectors = [
    ".J_price",
    ".tm-price",
    ".J_priceStd",
    "#J_StrPrice",
    ".tb-rmb-num",
    ".mod-info-price .price",
    ".tb-detail-price .tb-rmb-num",
    '[class*="Price--small--"]',
    '[class*="Price--large--"]',
    '[class*="Price--normal--"]',
    '[class*="Price--priceText--"]',
    '[class*="Price--priceInteger--"]',
    '[class*="Price--priceDecimal--"]',
    '[class*="highlightPrice--"] [class*="text--"]',
  ];
  for (const selector of priceSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      price = el.innerText.trim();
      break;
    }
  }
  const originalPriceSelectors = [
    ".J_priceOri",
    ".J_originalPrice",
    ".mod-info-price .price-original",
    ".tb-detail-price .tb-rmb-num.tb-rmb-del",
    ".tm-price-panel .tm-price-panel-price-original",
    '[class*="Price--delete--"]',
    '[class*="Price--deleted--"]',
    '[class*="Price--original--"]',
    '[class*="subPrice--"] [class*="text--"]:last-child',
  ];
  for (const selector of originalPriceSelectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim()) {
      originalPrice = el.innerText.trim();
      break;
    }
  }
  if (!price) {
    const priceRegex = new RegExp("¥\\s*(\\d+(\\.\\d+)?)", "");
    const pageText = document.body.innerText;
    const matchedPrice = pageText.match(priceRegex);
    if (matchedPrice && matchedPrice[1]) {
      price = matchedPrice[1];
    }
  }
  const salesDesc = document.querySelector('[class*="salesDesc--"]');
  salesCount = "";
  if (salesDesc) {
    const salesInfo = salesDesc.innerText.trim();
    const salesMatch = salesInfo.match(
      new RegExp("已售\\s*([\\d万千百十亿]+\\+?)", "")
    );
    if (salesMatch && salesMatch[1]) {
      salesCount = salesMatch[1];
    } else {
      salesCount = salesInfo.replace("·", "").trim();
    }
  }
  if (!salesCount) {
    const salesDesc1 = document.querySelector(
      '[class*="summaryWrap--"] [class*="salesDesc--"]'
    );
    if (salesDesc1) {
      const salesDesc11 = salesDesc1.innerText.trim();
      const salesMatch = salesDesc11.match(
        new RegExp("已售\\s*([\\d万千百十亿]+\\+?)", "")
      );
      if (salesMatch && salesMatch[1]) {
        salesCount = salesMatch[1];
      } else {
        salesCount = salesDesc11.replace("已售", "").trim();
      }
    }
  }
  const coupons3 = [];
  const coupons4 = document.querySelectorAll('[class*="couponText--"]');
  const couponsSet = new Set();
  coupons4.forEach((couponEl) => {
    if (couponEl && couponEl.innerText) {
      const couponCode = couponEl.innerText.trim();
      if (!couponsSet.has(couponCode)) {
        couponsSet.add(couponCode);
        coupons3.push(couponCode);
      }
    }
  });
  const imageUrls = [];
  const thumbnailImages = document.querySelectorAll(
    '[class*="thumbnailPic--"], .tb-thumb li img, .tm-layout-list-item img'
  );
  thumbnailImages.forEach((imgEl) => {
    if (imgEl && imgEl.src) {
      let imgSrc = imgEl.src;
      imgSrc = imgSrc.replace(new RegExp("_\\d+x\\d+q\\d+\\.jpg", "g"), "");
      imgSrc = imgSrc.replace(new RegExp("_\\d+x\\d+\\.jpg", "g"), "");
      imgSrc = imgSrc.replace(
        new RegExp("\\.jpg_\\d+x\\d+q\\d+\\.jpg", "g"),
        ".jpg"
      );
      imgSrc = imgSrc.replace(
        new RegExp("\\.jpg_\\d+x\\d+\\.jpg", "g"),
        ".jpg"
      );
      if (imgSrc.includes("_60x60q90") || imgSrc.includes("_50x50.jpg")) {
        imgSrc = imgSrc.replace("_60x60q90", "").replace("_50x50.jpg", "");
      }
      imageUrls.push(imgSrc);
    }
  });
  mainImage = "";
  const mainImageSelectors = [
    '[class*="mainPic--"]',
    ".tb-booth img",
    ".tb-main-pic img",
    ".magnifier-preview img",
    ".preview-img img",
  ];
  for (const selector of mainImageSelectors) {
    const mainImg1 = document.querySelector(selector);
    if (mainImg1 && mainImg1.src) {
      mainImage = mainImg1.src;
      break;
    }
  }
  if (!mainImage && imageUrls.length > 0) {
    mainImage = imageUrls[0];
  }
  if (!mainImage && imageUrls.length > 0) {
    mainImage = imageUrls[0];
  }
  coupons = "";
  const mainImg = [
    "video source",
    ".lib-video video source",
    ".tb-video-player video source",
    ".mui-player video source",
    '[data-role="videoPlayer"] video source',
  ];
  for (const selector of mainImg) {
    const videoEl = document.querySelector(selector);
    if (videoEl && videoEl.src) {
      coupons = videoEl.src;
      break;
    }
  }
  if (!coupons) {
    const videoEl = document.querySelector("video");
    if (videoEl && videoEl.src) {
      coupons = videoEl.src;
    }
  }
  couponsList = "";
  const skuScraper = document.querySelector('[class*="shipping--"]');
  if (skuScraper) {
    couponsList = skuScraper.innerText.trim();
  }
  scrapingStatus = "";
  const scrapeSkuFunc = document.querySelector('[class*="freight--"]');
  if (scrapeSkuFunc) {
    scrapingStatus = scrapeSkuFunc.innerText.trim();
  }
  scrapingOptions = "";
  const skuScraper2 = document.querySelector('[class*="delivery-from-addr--"]');
  if (skuScraper2) {
    scrapingOptions = skuScraper2.innerText.trim();
  }
  scrollToTop = "";
  const scrapeSkuOptions = document.querySelector('[class*="guaranteeText--"]');
  if (scrapeSkuOptions) {
    scrollToTop = scrapeSkuOptions.innerText.trim();
  }
  const skuOptions = [];
  const scrapeCoupons = [];
  const fetchSKUOptions = [
    '[class*="tabDetailItem--"] [class*="infoItem--"]',
    ".tb-attributes .attributes-list li",
    ".tm-fcs-panel .tm-fcs-properties .tm-fcs-property",
    ".attributes-list .property-item",
  ];
  for (const selector of fetchSKUOptions) {
    const elements = document.querySelectorAll(selector);
    if (elements && elements.length > 0) {
      elements.forEach((item) => {
        const selectors = [
          '[class*="infoItemTitle--"]',
          ".property-name",
          ".tb-property-type",
          ".tm-fcs-prop-key",
        ];
        const contentSelectors = [
          '[class*="infoItemContent--"]',
          ".property-value",
          ".tb-property-cont",
          ".tm-fcs-prop-value",
        ];
        let titleEl = null;
        for (const selector1 of selectors) {
          titleEl = item.querySelector(selector1);
          if (titleEl) {
            break;
          }
        }
        let content = null;
        for (const selector1 of contentSelectors) {
          content = item.querySelector(selector1);
          if (content) {
            break;
          }
        }
        if (titleEl && content) {
          const title = titleEl.innerText.trim();
          const content1 = content.innerText.trim();
          skuOptions.push(title);
          scrapeCoupons.push(content1);
        }
      });
      if (skuOptions.length > 0) {
        break;
      }
    }
  }
  getScrollPosition = "";
  let skuOptionsFunction = [];
  const SKUOptions = [
    '[class*="imageTextInfo--"]',
    ".descV8-container",
    ".desc-root",
    "#J_DivItemDesc",
    "#description",
    ".tb-desc",
    ".detail-content",
    ".detail-desc",
    ".detail-desc-decorate",
  ];
  for (const selector of SKUOptions) {
    const element = document.querySelector(selector);
    if (element) {
      const textList = Array.from(
        element.querySelectorAll("p, h1, h2, h3, h4, h5, h6, span, div")
      )
        .filter(
          (el) =>
            el.innerText &&
            !el.querySelector("a") &&
            el.className !== "descV8-hotArea"
        )
        .map((el) => el.innerText.trim())
        .filter((text) => text.length > 0);
      const shortTexts = [];
      const uniqueTexts = new Set();
      textList.forEach((text) => {
        if (text.length < 10) {
          shortTexts.push(text);
          return;
        }
        let isDuplicate = false;
        for (const uniqueText of uniqueTexts) {
          if (
            uniqueText === text ||
            uniqueText.includes(text) ||
            text.includes(uniqueText)
          ) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          uniqueTexts.add(text);
          shortTexts.push(text);
        }
      });
      getScrollPosition = shortTexts.join("\n");
      const imageElements = element.querySelectorAll(
        ".descV8-singleImage img, .descV8-singleImage-image"
      );
      if (imageElements && imageElements.length > 0) {
        const uniqueImageUrls = new Set();
        imageElements.forEach((imgEl) => {
          const imgSrc = imgEl.getAttribute("data-src") || imgEl.src;
          if (imgSrc && !imgSrc.includes("g.alicdn.com/s.gif")) {
            let fullImgSrc = imgSrc;
            if (imgSrc.startsWith("//")) {
              fullImgSrc = "https:" + imgSrc;
            }
            uniqueImageUrls.add(fullImgSrc);
          }
        });
        skuOptionsFunction = Array.from(uniqueImageUrls);
      } else {
        const imageElements1 = element.querySelectorAll("img");
        const uniqueImageUrls = new Set();
        imageElements1.forEach((imgEl) => {
          const imgSrc = imgEl.getAttribute("data-src") || imgEl.src;
          if (imgSrc && !imgSrc.includes("g.alicdn.com/s.gif")) {
            let fullImgSrc = imgSrc;
            if (imgSrc.startsWith("//")) {
              fullImgSrc = "https:" + imgSrc;
            }
            uniqueImageUrls.add(fullImgSrc);
          }
        });
        skuOptionsFunction = Array.from(uniqueImageUrls);
      }
      if (
        (getScrollPosition && getScrollPosition.length > 500) ||
        skuOptionsFunction.length > 10
      ) {
        break;
      }
    }
  }
  console.log("skuData", skuData);
  console.log("开始抓取评论数据...");
  const skuFunction = await scrapeComments();
  console.log("评论数据抓取完成", skuFunction);
  const scrapeFunction = {
    title: productTitle,
    price: {
      discount: price,
      original: originalPrice,
    },
    sales: salesCount,
    coupons: coupons3,
    images: imageUrls,
    mainImage: mainImage,
    videoUrl: coupons,
    shipping: {
      info: couponsList,
      freight: scrapingStatus,
      fromAddr: scrapingOptions,
    },
    guarantee: scrollToTop,
    sku: {
      keys: skuOptions,
      values: scrapeCoupons,
    },
    detail: {
      content: getScrollPosition,
      images: skuOptionsFunction,
    },
    skuOptions: skuData,
    comments: skuFunction,
  };
  console.log("详情数据抓取完成");
  return scrapeFunction;
}
async function scrollTaobaoDetailPage() {
  console.log("开始滚动加载淘宝/天猫详情页面");
  chrome.runtime.sendMessage({
    action: "updateStatus",
    status: "正在加载商品详情，请稍候...",
  });
  return new Promise(async (resolve) => {
    try {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const viewportHeight = window.innerHeight;
      window.scrollTo({
        top: documentHeight * 0.25,
        behavior: "smooth",
      });
      console.log(
        `滚动到页面的25%位置: ${documentHeight * 0.25}/${documentHeight}`
      );
      await new Promise((r) => setTimeout(r, 1500));
      window.scrollTo({
        top: documentHeight * 0.5,
        behavior: "smooth",
      });
      console.log(
        `滚动到页面的50%位置: ${documentHeight * 0.5}/${documentHeight}`
      );
      await new Promise((r) => setTimeout(r, 1500));
      window.scrollTo({
        top: documentHeight * 0.75,
        behavior: "smooth",
      });
      console.log(
        `滚动到页面的75%位置: ${documentHeight * 0.75}/${documentHeight}`
      );
      await new Promise((r) => setTimeout(r, 1500));
      window.scrollTo({
        top: documentHeight,
        behavior: "smooth",
      });
      console.log(`滚动到页面底部: ${documentHeight}/${documentHeight}`);
      await new Promise((r) => setTimeout(r, 2000));
      console.log('尝试点击各种"查看更多"、"展开"按钮');
      const selectors = [
        'a:contains("查看更多")',
        'button:contains("查看更多")',
        'a:contains("展开")',
        'button:contains("展开")',
        'a:contains("更多")',
        'button:contains("更多")',
        '[data-spm-click*="展开"]',
        '[class*="expand"]',
        '[class*="more"]',
        '[class*="ShowMore"]',
        '[class*="ShowButton"]',
      ];
      function filterByText(tagName, text) {
        const elements = document.getElementsByTagName(tagName);
        return Array.from(elements).filter((el) =>
          el.textContent.includes(text)
        );
      }
      for (const selector of selectors) {
        try {
          if (selector.includes(":contains(")) {
            const matchResult = selector.match(
              new RegExp('([a-z]+):contains\\("(.+)"\\)', "")
            );
            if (matchResult) {
              const element = matchResult[1];
              const searchTerm = matchResult[2];
              const buttons = filterByText(element, searchTerm);
              console.log(
                `找到 ${buttons.length} 个包含文本"${searchTerm}"的 ${element} 元素`
              );
              for (const btn of buttons) {
                if (btn.offsetParent !== null) {
                  console.log(`点击按钮: "${btn.textContent}"`);
                  btn.click();
                  await new Promise((r) => setTimeout(r, 1000));
                }
              }
            }
          } else {
            const buttons = document.querySelectorAll(selector);
            console.log(
              `找到 ${buttons.length} 个匹配选择器 "${selector}" 的元素`
            );
            for (const btn of buttons) {
              if (btn.offsetParent !== null) {
                console.log(`点击按钮: "${btn.textContent || selector}"`);
                btn.click();
                await new Promise((r) => setTimeout(r, 1000));
              }
            }
          }
        } catch (e) {
          console.error(`选择器 ${selector} 出错:`, e);
        }
      }
      console.log("再次滚动页面以确保所有内容都加载出来");
      window.scrollTo({
        top: documentHeight * 0.25,
        behavior: "smooth",
      });
      await new Promise((r) => setTimeout(r, 1000));
      window.scrollTo({
        top: documentHeight * 0.5,
        behavior: "smooth",
      });
      await new Promise((r) => setTimeout(r, 1000));
      window.scrollTo({
        top: documentHeight * 0.75,
        behavior: "smooth",
      });
      await new Promise((r) => setTimeout(r, 1000));
      window.scrollTo({
        top: documentHeight,
        behavior: "smooth",
      });
      await new Promise((r) => setTimeout(r, 3000));
      const viewMoreButtons = filterByText("a", "查看更多评价").concat(
        filterByText("button", "查看更多评价"),
        filterByText("div", "查看更多评价"),
        filterByText("span", "全部评价")
      );
      if (viewMoreButtons.length > 0) {
        console.log(`找到 ${viewMoreButtons.length} 个"查看更多评价"按钮`);
        for (const btn of viewMoreButtons) {
          if (btn.offsetParent !== null) {
            console.log(`点击"${btn.textContent}"按钮`);
            btn.click();
            await new Promise((r) => setTimeout(r, 2000));
          }
        }
      }
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      console.log("滚动加载完成，已回到页面顶部");
      await new Promise((r) => setTimeout(r, 1000));
      chrome.runtime.sendMessage({
        action: "updateStatus",
        status: "页面加载完成，开始抓取数据...",
      });
      resolve();
    } catch (error) {
      console.error("滚动过程中出错:", error);
      resolve();
    }
  });
}
