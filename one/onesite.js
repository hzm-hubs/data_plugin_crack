const a0_0x182e64 = a0_0x180f;
(function (_0x142012, _0x9b952c) {
  const _0xd3e4f8 = a0_0x180f,
    _0x3b6b48 = _0x142012();
  while (!![]) {
    try {
      const _0x4a4511 =
        (-parseInt(_0xd3e4f8(0x1e6)) / 0x1) *
          (-parseInt(_0xd3e4f8(0x1fc)) / 0x2) +
        -parseInt(_0xd3e4f8(0x1e7)) / 0x3 +
        -parseInt(_0xd3e4f8(0x1f6)) / 0x4 +
        (parseInt(_0xd3e4f8(0x1c5)) / 0x5) *
          (-parseInt(_0xd3e4f8(0x221)) / 0x6) +
        -parseInt(_0xd3e4f8(0x202)) / 0x7 +
        (-parseInt(_0xd3e4f8(0x216)) / 0x8) *
          (-parseInt(_0xd3e4f8(0x1d6)) / 0x9) +
        parseInt(_0xd3e4f8(0x1d3)) / 0xa;
      if (_0x4a4511 === _0x9b952c) break;
      else _0x3b6b48["push"](_0x3b6b48["shift"]());
    } catch (_0x38363e) {
      _0x3b6b48["push"](_0x3b6b48["shift"]());
    }
  }
})(a0_0xdfbe, 0xcb0f1),
  console[a0_0x182e64(0x213)]("页面初始化");
let tableHeads = [];
function getTargetTable(_0x3c8b85 = a0_0x182e64(0x220)) {
  const _0x51b59c = a0_0x182e64,
    _0x2f26c7 = document[_0x51b59c(0x1f0)]("div[mxv^=\x22biz,params\x22]")[0x0][
      _0x51b59c(0x1c4)
    ](_0x51b59c(0x209));
  if (_0x3c8b85 == _0x51b59c(0x1f7)) return _0x2f26c7[0x1] || null;
  return _0x2f26c7[0x0] || null;
}
function a0_0x180f(_0x3ca733, _0x2d387f) {
  const _0xdfbe9e = a0_0xdfbe();
  return (
    (a0_0x180f = function (_0x180fc5, _0x3818ea) {
      _0x180fc5 = _0x180fc5 - 0x1c2;
      let _0x285fa8 = _0xdfbe9e[_0x180fc5];
      return _0x285fa8;
    }),
    a0_0x180f(_0x3ca733, _0x2d387f)
  );
}
let lastTableContent = "";
async function getPageData(_0x22930c) {
  const _0x327397 = a0_0x182e64,
    _0x49f0e5 = document["querySelector"](_0x327397(0x207));
  if (!_0x49f0e5) return;
  const _0x39afb4 = _0x49f0e5[_0x327397(0x1c4)]("a");
  let _0x111db0 = 0x0,
    _0x34c6bd = 0x0;
  Array[_0x327397(0x1c3)](_0x39afb4)
    [_0x327397(0x1e4)]((_0x5b65b6) => !isNaN(_0x5b65b6[_0x327397(0x21f)]))
    ["forEach"]((_0xb280c9, _0x5d933e) => {
      const _0x9b19df = _0x327397;
      _0xb280c9[_0x9b19df(0x21a)][_0x9b19df(0x1e1)] > _0x111db0 &&
        ((_0x111db0 = _0xb280c9["classList"][_0x9b19df(0x1e1)]),
        (_0x34c6bd = _0xb280c9["textContent"]));
    }),
    console["log"]("当前选中页码", _0x34c6bd),
    await getCurrentTables(_0x22930c);
  return;
  _0x34c6bd == 0x1 && (await getCurrentTables(_0x22930c));
  for (
    let _0x16e0f4 = _0x34c6bd == 0x1 ? 0x1 : 0x0;
    _0x16e0f4 < _0x39afb4[_0x327397(0x1e1)];
    _0x16e0f4++
  ) {
    chrome[_0x327397(0x1fd)][_0x327397(0x1f5)]({
      from: _0x327397(0x1ef),
      action: _0x327397(0x1ff),
      data: _0x327397(0x212) + (_0x16e0f4 + 0x1) + _0x327397(0x1db),
    }),
      _0x39afb4[_0x16e0f4][_0x327397(0x20e)](),
      await new Promise((_0x52c967) => {
        let _0x300eef = 0x14,
          _0x3dd4ab = setInterval(() => {
            const _0x33a518 = a0_0x180f;
            (_0x300eef == 0x0 ||
              lastTableContent !==
                JSON[_0x33a518(0x203)](
                  getTargetTable(_0x33a518(0x1f7))?.["innerHTML"]
                )) &&
              (clearInterval(_0x3dd4ab),
              (_0x3dd4ab = null),
              (_0x300eef = 0x14),
              waitForRenderComplete2()[_0x33a518(0x21c)](() => {
                _0x52c967(getCurrentTables(_0x22930c));
              })),
              --_0x300eef;
          }, 0x3e8);
      });
  }
}
function a0_0xdfbe() {
  const _0x1079c3 = [
    "1404707SLDIOT",
    "1476108IJsmst",
    "trim",
    "getAttribute",
    "directAmount",
    "clipboard",
    "directPreTrans",
    "collectAndPurchase",
    "展现量",
    "myseller",
    "querySelectorAll",
    "mx-stickytable-operation",
    "uploadFile\x20error:\x20",
    "display",
    "img",
    "sendMessage",
    "3988736iBwjSJ",
    "tbody",
    "实际投产比",
    "span[data-spm-click*=\x22_dialog_close\x22]",
    "includePreProRatio",
    "url",
    "2oVKvLJ",
    "runtime",
    "spending",
    "updateTipContent",
    "clicks",
    "boostingDisplayVolume",
    "669816OVgiqQ",
    "stringify",
    "boostingDrivingClick",
    "push",
    "date",
    "[mxv=pageSizes]",
    "childNodes",
    "table",
    "clickConversionRate",
    "totalPreSaleAmount",
    "innerHTML",
    "error",
    "click",
    "goodsInfo",
    ".dialog-body",
    "bidding",
    "正在读取第\x20",
    "log",
    "div[mx-click*=\x22magix-portsu\x22]",
    "totalShoppingCarts",
    "32VXnWpS",
    "querySelector",
    "thousandDisplayCost",
    "scrollIntoView",
    "classList",
    "totalAmount",
    "then",
    "directTransactions",
    "totaPreSaleTrans",
    "textContent",
    "head",
    "91434EiihiX",
    "children",
    "includes",
    "from",
    "getElementsByTagName",
    "350seMpCw",
    "radar",
    ".dialog-modal-body",
    "详情页",
    "pastDatePut",
    "findIndex",
    "slice",
    "forEach",
    "src",
    "directPreSale",
    "innerText",
    "商品图片",
    "clickRate",
    "[mx-click*=magix-portsu]",
    "18375600HxoepC",
    "budget",
    "div[mxv*=\x22listPrefix,fields\x22]",
    "542475xfkqtJ",
    "proRatio",
    "hour",
    "replace",
    "split",
    "\x20页数据……",
    "splice",
    "href",
    "no\x20table\x20data",
    "div[mxv^=\x22cubeAction,params\x22]",
    "剪贴板内容:",
    "length",
    "map",
    "averageClickCost",
    "filter",
    "pastHourDisplay",
  ];
  a0_0xdfbe = function () {
    return _0x1079c3;
  };
  return a0_0xdfbe();
}
function waitForRenderComplete2(
  _0x58a814 = document,
  _0x1257e9 = a0_0x182e64(0x1df)
) {
  return new Promise((_0x2f7dde) => {
    let _0x5aef55 = 0x9;
    const _0xa68f49 = setInterval(() => {
      const _0x52ff0e = a0_0x180f;
      (_0x58a814[_0x52ff0e(0x1f0)](_0x1257e9)?.[0x0] || !_0x5aef55) &&
        (clearInterval(_0xa68f49), _0x2f7dde()),
        --_0x5aef55;
    }, 0x1f4);
  });
}
const fieldsList = [
  a0_0x182e64(0x20f),
  a0_0x182e64(0x1fb),
  a0_0x182e64(0x1c6),
  a0_0x182e64(0x1d4),
  a0_0x182e64(0x211),
  a0_0x182e64(0x1d7),
  a0_0x182e64(0x1fe),
  a0_0x182e64(0x1ea),
  a0_0x182e64(0x21b),
  a0_0x182e64(0x1f3),
  a0_0x182e64(0x200),
  a0_0x182e64(0x1d1),
  "totalTransactions",
  a0_0x182e64(0x21d),
  a0_0x182e64(0x1e3),
  a0_0x182e64(0x218),
  a0_0x182e64(0x20a),
  a0_0x182e64(0x215),
  "collectedNums",
  a0_0x182e64(0x1ed),
  a0_0x182e64(0x20b),
  a0_0x182e64(0x21e),
  a0_0x182e64(0x1ce),
  a0_0x182e64(0x1ec),
  a0_0x182e64(0x1fa),
  a0_0x182e64(0x201),
  a0_0x182e64(0x204),
];
async function getClipboardText() {
  const _0x1bc42e = a0_0x182e64;
  try {
    const _0x2b92cb = await navigator[_0x1bc42e(0x1eb)]["readText"]();
    return console[_0x1bc42e(0x213)](_0x1bc42e(0x1e0), _0x2b92cb), _0x2b92cb;
  } catch (_0x21af5a) {
    return console[_0x1bc42e(0x20d)]("无法读取剪贴板:", _0x21af5a), "";
  }
}
function closeDialog(_0x20e962 = 0x0) {
  return new Promise((_0x269e1a) => {
    const _0x3d0c3 = a0_0x180f,
      _0x554ba9 = document[_0x3d0c3(0x217)](_0x3d0c3(0x1f9));
    _0x554ba9 && _0x554ba9[_0x3d0c3(0x20e)](),
      setTimeout(() => {
        _0x269e1a();
      }, _0x20e962);
  });
}
function getDetailMode(
  _0x5d19c5,
  _0x302bd5 = 0x0,
  _0x461d0d = a0_0x182e64(0x1f8),
  _0x31df15 = a0_0x182e64(0x1d8)
) {
  return new Promise(async (_0x2e385e) => {
    const _0x2052af = a0_0x180f,
      _0x29680a = [];
    _0x5d19c5[_0x302bd5][_0x2052af(0x219)](),
      _0x5d19c5[_0x302bd5][_0x2052af(0x1f0)](_0x2052af(0x1d2))[0x1][
        _0x2052af(0x20e)
      ](),
      await waitForRenderComplete2(_0x5d19c5[_0x302bd5], _0x2052af(0x1d5));
    const _0xbc6da5 = Array[_0x2052af(0x1c3)](
        _0x5d19c5[_0x302bd5][_0x2052af(0x217)]("thead")["getElementsByTagName"](
          "th"
        )
      )[_0x2052af(0x1e2)]((_0x510177) => _0x510177[_0x2052af(0x21f)]),
      _0x2c3830 = _0xbc6da5[_0x2052af(0x1ca)](
        (_0x320884) => _0x320884 == _0x461d0d
      );
    let _0x6e67dc = Array["from"](
      _0x5d19c5[_0x302bd5][_0x2052af(0x217)](_0x2052af(0x1f7))[
        _0x2052af(0x1c4)
      ]("tr")
    );
    _0x31df15 == _0x2052af(0x1d8) &&
      (currentHour < 0x3
        ? (_0x6e67dc = _0x6e67dc[_0x2052af(0x1cb)](0x0, currentHour + 0x1))
        : (_0x6e67dc = _0x6e67dc[_0x2052af(0x1cb)](
            currentHour - 0x2,
            currentHour + 0x1
          ))),
      _0x6e67dc[_0x2052af(0x1cc)]((_0x34a403) => {
        const _0x3587a8 = _0x2052af;
        let _0x320d45 = {};
        _0x320d45[_0xbc6da5[0x0]] =
          _0x34a403[_0x3587a8(0x222)][0x0][_0x3587a8(0x1cf)];
        const _0x280d7f = _0x34a403["children"][_0x2c3830]["innerText"][
            "replace"
          ](/([+-])[\d.]+%/, ""),
          _0xb584a = _0x280d7f[_0x3587a8(0x1c2)]("\x0a")
            ? _0x280d7f["split"]("\x0a")
            : _0x280d7f;
        (_0x320d45["value"] = _0xb584a), _0x29680a[_0x3587a8(0x205)](_0x320d45);
      }),
      _0x2e385e(_0x29680a);
  });
}
function readItDetail() {
  return new Promise(async (_0x3a3b61) => {
    const _0x5ee171 = a0_0x180f,
      _0x16d3d3 = {};
    await waitForRenderComplete2(document, _0x5ee171(0x1c7));
    const _0x42ddeb = document["querySelector"](".dialog-modal-body");
    _0x42ddeb[_0x5ee171(0x1c4)]("a")[0x2][_0x5ee171(0x20e)](),
      await waitForRenderComplete2(_0x42ddeb, ".dialog-body");
    const _0x17e870 = await getDetailMode(
      _0x42ddeb[_0x5ee171(0x1f0)](".dialog-body"),
      0x1,
      _0x5ee171(0x1ee)
    );
    (_0x16d3d3[_0x5ee171(0x1e5)] = _0x17e870),
      _0x42ddeb[_0x5ee171(0x217)]("div[mxv*=\x22outQuicks\x22]")
        [_0x5ee171(0x1f0)](_0x5ee171(0x214))[0x2]
        [_0x5ee171(0x20e)](),
      await waitForRenderComplete2(_0x42ddeb, _0x5ee171(0x210));
    const _0x19f397 = await getDetailMode(
      _0x42ddeb[_0x5ee171(0x1f0)](_0x5ee171(0x210)),
      0x0,
      _0x5ee171(0x1f8),
      _0x5ee171(0x206)
    );
    _0x16d3d3[_0x5ee171(0x1c9)] = _0x19f397;
    const _0x5842bf = await getDetailMode(
      _0x42ddeb[_0x5ee171(0x1f0)](_0x5ee171(0x210)),
      0x1,
      _0x5ee171(0x1ee),
      _0x5ee171(0x206)
    );
    (_0x16d3d3["pastDateDisplay"] = _0x5842bf),
      await closeDialog(0x9c4),
      _0x3a3b61(_0x16d3d3);
  });
}
const currentHour = new Date()["getHours"]();
async function getCurrentTables(_0x4e829e) {
  const _0x32fdc6 = a0_0x182e64;
  lastTableContent = JSON[_0x32fdc6(0x203)](
    getTargetTable(_0x32fdc6(0x1f7))?.[_0x32fdc6(0x20c)]
  );
  let _0x398204 = Array[_0x32fdc6(0x1c3)](
    getTargetTable(_0x32fdc6(0x1f7))[_0x32fdc6(0x1c4)]("tr")
  );
  for (let _0x1f53cd = 0x0; _0x1f53cd < _0x398204["length"]; _0x1f53cd++) {
    const _0x2058d1 = _0x398204[_0x1f53cd];
    if (_0x2058d1[_0x32fdc6(0x1e9)](_0x32fdc6(0x1f1))) {
      _0x2058d1[_0x32fdc6(0x217)]("button[mxv=\x22popData\x22]")[
        _0x32fdc6(0x20e)
      ]();
      const _0x36a8d0 = await readItDetail();
      _0x4e829e[_0x32fdc6(0x1e1)] &&
        (_0x4e829e[_0x4e829e["length"] - 0x1]["timeData"] = _0x36a8d0);
    } else {
      if (
        Array["from"](_0x2058d1["children"])[_0x32fdc6(0x1e1)] > 0x2 &&
        !_0x2058d1[_0x32fdc6(0x208)][0x0][_0x32fdc6(0x21f)][_0x32fdc6(0x1c2)](
          "合计"
        )
      ) {
        const _0x288899 =
            _0x2058d1[_0x32fdc6(0x217)]("a")?.[_0x32fdc6(0x1dd)] || "",
          _0x16d6f0 =
            _0x2058d1["querySelector"](_0x32fdc6(0x1f4))?.[_0x32fdc6(0x1cd)] ||
            "",
          _0x2874f4 = Array[_0x32fdc6(0x1c3)](_0x2058d1["children"])["map"](
            (_0x5360e1) => {
              const _0x1300e7 = _0x32fdc6;
              return _0x5360e1[_0x1300e7(0x1cf)]
                [_0x1300e7(0x1d9)](/[\uE000-\uF8FF]/g, "")
                [_0x1300e7(0x1e8)]();
            }
          );
        _0x2874f4["splice"](0x2, 0x0, _0x288899),
          _0x2874f4[_0x32fdc6(0x1dc)](0x2, 0x0, _0x16d6f0);
        const _0x17a3fd = {};
        _0x2874f4[_0x32fdc6(0x1cc)]((_0x238246, _0xb6fa28) => {
          const _0xc917b9 = _0x32fdc6;
          _0xb6fa28 !== 0x0 &&
            _0xb6fa28 !== _0x2874f4[_0xc917b9(0x1e1)] - 0x1 &&
            (_0x17a3fd[tableHeads[_0xb6fa28]] = _0x238246);
        }),
          _0x4e829e[_0x32fdc6(0x205)](_0x17a3fd);
      }
    }
  }
}
async function scrapeOneData(_0xfb2513) {
  const _0x1835ef = a0_0x182e64;
  try {
    await closeDialog();
    const _0x22bd8b = getTargetTable();
    if (!_0x22bd8b) throw _0x1835ef(0x1de);
    _0x22bd8b["scrollIntoView"](),
      (tableHeads = Array[_0x1835ef(0x1c3)](
        _0x22bd8b["getElementsByTagName"]("thead")?.[0x0][_0x1835ef(0x1c4)](
          "th"
        )
      )[_0x1835ef(0x1e2)](
        (_0x1637ac) =>
          _0x1637ac[_0x1835ef(0x1cf)][_0x1835ef(0x1da)]("\x0a")[0x0]
      )),
      tableHeads["splice"](0x2, 0x0, _0x1835ef(0x1c8)),
      tableHeads[_0x1835ef(0x1dc)](0x2, 0x0, _0x1835ef(0x1d0));
    const _0x33b37e = [];
    return await getPageData(_0x33b37e), _0x33b37e;
  } catch (_0x863676) {
    return console["log"](_0x1835ef(0x1f2), _0x863676), [];
  }
}
