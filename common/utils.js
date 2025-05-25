function scrollToBottom() {
  return new Promise((resolve) => {
    const scrollHeight = document.body.scrollHeight;
    const scrollInc = scrollHeight / 10;
    let scrollPos = 0;
    const scrollTimer = setInterval(() => {
      if (scrollPos < scrollHeight) {
        window.scrollTo(0, scrollPos, {
          behavior: "smooth",
        });
        scrollPos += scrollInc;
      } else {
        window.scrollTo(0, 0, {
          behavior: "smooth",
        });
        clearInterval(scrollTimer);
        resolve();
      }
    }, 200);
  });
}
function getParentChain(element, maxLevels = 5, level) {
  const parentHierarchy = [];
  let currentElement = element;
  level = 0;
  while (currentElement && level < maxLevels) {
    const classDetails = currentElement.className
      ? ` (class="${currentElement.className}")`
      : "";
    const idDetail = currentElement.id ? ` (id="${currentElement.id}")` : "";
    parentHierarchy.push(
      `${currentElement.tagName.toLowerCase()}${classDetails}${idDetail}`
    );
    currentElement = currentElement.parentElement;
    level++;
  }
  return parentHierarchy;
}
function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    console.log(`等待元素加载: ${selector}, 超时: ${timeout}ms`);
    const element = document.querySelector(selector);
    if (element) {
      console.log("元素已存在，无需等待");
      return resolve(element);
    }
    const timeoutId = setTimeout(() => {
      if (observer) {
        observer.disconnect();
        console.log(`等待元素超时: ${selector}`);
        const foundElement = document.querySelector(selector);
        if (foundElement) {
          console.log("超时后找到元素");
          resolve(foundElement);
        } else {
          reject(new Error(`等待元素超时: ${selector}`));
        }
      }
    }, timeout);
    const observer = new MutationObserver((mutations, obs) => {
      console.log("...测检化变MOD".split("").reverse().join(""));
      const element1 = document.querySelector(selector);
      if (element1) {
        console.log(`找到元素: ${selector}`);
        clearTimeout(timeoutId);
        obs.disconnect();
        resolve(element1);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["ssalc".split("").reverse().join(""), "data-e2e"],
    });
    console.log("动启已revresbOnoitatuM".split("").reverse().join(""));
  });
}
