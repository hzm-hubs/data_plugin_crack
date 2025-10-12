async function scrapeSkuOptions() {
  const skuOptions = [];
  const uniqueTypes = new Set();
  const skuSelectors = [
    '[class*="skuItem--"]:not([class*="serviceCateItem--"])',
    ".tb-prop:not(.tb-service)",
    ".tm-sale-prop:not(.tm-service)",
    ".J_TSaleProp:not(.service)",
  ];
  for (const skuSelector of skuSelectors) {
    const skuElements = document.querySelectorAll(skuSelector);
    if (!skuElements || skuElements.length === 0) {
      continue;
    }
    for (const skuItem of skuElements) {
      if (
        skuItem.className.includes("Operation--") ||
        skuItem.className.includes("Service--") ||
        skuItem.className.includes("BuyPattern--")
      ) {
        continue;
      }
      const labelElement = skuItem.querySelector(
        '[class*="labelText--"], .tb-label, .tm-label, .sku-label, .prop-name'
      );
      if (!labelElement) {
        continue;
      }
      const labelText = labelElement.innerText.trim();
      if (
        labelText === "数量" ||
        labelText === "特色服务" ||
        labelText === "保障服务"
      ) {
        continue;
      }
      if (uniqueTypes.has(labelText)) {
        continue;
      }
      const contentContainer = skuItem.querySelector(
        '[class*="content--"], .tb-sku-list, .J_TSaleProp ul, .sku-options, .prop-values'
      );
      if (!contentContainer) {
        continue;
      }
      const optionsList = contentContainer.querySelectorAll(
        '[class*="valueItem--"], .tb-selected, .tb-sku-item, .J_TSaleProp li, .sku-option, .prop-value'
      );
      if (!optionsList || optionsList.length === 0) {
        continue;
      }
      const skuOptions1 = [];
      const uniqueTexts = new Set();
      for (const option of optionsList) {
        if (
          option.className.includes("countWrapper--") ||
          option.className.includes("quantityBtn--")
        ) {
          continue;
        }
        const valueItem =
          option.querySelector('[class*="valueItemText--"], span, a') || option;
        const itemText = valueItem.innerText.trim();
        if (uniqueTexts.has(itemText)) {
          continue;
        }
        const imageElement = option.querySelector(
          '[class*="valueItemImg--"], img'
        );
        const imgUrl = imageElement ? imageElement.src : "";
        const isOutOfStock =
          option.className.includes("isDisabled--") ||
          option.className.includes("tb-out-of-stock") ||
          option.className.includes("disabled");
        skuOptions1.push({
          text: itemText,
          imgUrl: imgUrl,
          hasStock: !isOutOfStock,
        });
        uniqueTexts.add(itemText);
      }
      if (skuOptions1.length > 0) {
        skuOptions.push({
          typeName: labelText,
          options: skuOptions1,
        });
        uniqueTypes.add(labelText);
      }
    }
  }
  return skuOptions;
}

window.skuScraper = {
  scrapeSkuOptions: scrapeSkuOptions,
};
