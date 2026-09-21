/* ===========================================================================
   Yi Hua Huang — Portfolio / 開場動畫
   依 Figma timeline（5.8s、loop）復刻：條紋由左而右依序點亮、太陽落下、
   海鷗依序滑入、三行文字逐字打出。時間常數集中在 T 物件，與設計稿一一對應。
   =========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var CYCLE = 5800;                       /* 設計稿 timeline 總長 */

  /* 5.8s timeline 上的百分比 → 毫秒 */
  function at(pct) { return Math.round(pct / 100 * CYCLE); }

  var T = {
    stripes: {
      a: { start: at(25.862), span: at(34.035), dur: at(3.104) },   /* Group 97 米色 */
      b: { start: at(25.862), span: at(34.035), dur: at(3.104) },   /* Group 98 近白 */
      c: { start: at(22.069), span: at(34.034), dur: at(2.759) }    /* Group 96 白色 */
    },
    typing: {
      name:    { start: at(27.931), step: at(0.948) },   /* 5:1201 */
      role:    { start: at(36.207), step: at(0.862) },   /* 5:1217 */
      tagline: { start: at(49.138), step: at(0.810) }    /* 5:1235 */
    }
  };

  /* ---- 1 設計稿單位：--u = 1 個設計稿 px（以 clientWidth 計，避開捲軸誤差） ---- */
  function setUnit() {
    var w = root.clientWidth || window.innerWidth;
    root.style.setProperty('--u', Math.min(1, w / 1440) + 'px');
    return Math.min(1, w / 1440);
  }

  /* ---- 2 條紋：設計稿每層 95 條，間距 15px；畫面寬於 1440 時往兩側續接 ---- */
  var LAST = 94;                              /* 設計稿條紋索引 0…94 */
  var LAYERS = [
    { sel: '.stripes--a', key: 'a', x0: 10 }, /* ink 起點：10 + 15k */
    { sel: '.stripes--b', key: 'b', x0: 10 },
    { sel: '.stripes--c', key: 'c', x0: 9 }   /* 海面那層左移 1px，與設計稿一致 */
  ];

  function buildStripes() {
    var u = setUnit();
    var vw = root.clientWidth || window.innerWidth;
    var stageLeft = Math.max(0, (vw - 1440 * u) / 2);   /* 版心置中後左側留白 */

    LAYERS.forEach(function (layer) {
      var host = document.querySelector(layer.sel);
      if (!host) return;

      var kMin = 0, kMax = LAST;
      if (stageLeft > 0) {                    /* 畫面比設計稿寬：沿用間距往外補 */
        kMin = Math.min(0, Math.floor((-stageLeft - layer.x0 * u) / (15 * u)));
        kMax = Math.max(LAST, Math.ceil((vw - stageLeft - layer.x0 * u) / (15 * u)));
      }
      var range = kMin + ':' + kMax;
      if (host.dataset.range === range) return;         /* 範圍沒變就不重建 */
      host.dataset.range = range;

      var t = T.stripes[layer.key];
      var frag = document.createDocumentFragment();
      host.textContent = '';
      for (var k = kMin; k <= kMax; k++) {
        var s = document.createElement('i');
        s.className = 'stripe';
        s.style.setProperty('--i', k);
        /* 掃描節奏固定綁在設計稿的 95 條上，畫面再寬也與設計稿同速 */
        s.style.setProperty('--delay', (t.start + (k / LAST) * t.span) + 'ms');
        s.style.setProperty('--dur', t.dur + 'ms');
        frag.appendChild(s);
      }
      host.appendChild(frag);
    });
  }

  /* ---- 3 逐字打字：量測每個字的實際寬度，與 Figma 的逐字 keyframe 相同 ---- */
  var typeTargets = [
    { el: document.querySelector('.type--name'),    key: 'name' },
    { el: document.querySelector('.type--role'),    key: 'role' },
    { el: document.querySelector('.type--tagline'), key: 'tagline' }
  ].filter(function (t) { return t.el; });

  var typingAnims = [];

  function measure(el) {
    var span = el.querySelector('.type__text');
    var node = span && span.firstChild;
    if (!node) return null;

    var prev = el.style.width;
    el.style.width = 'auto';                       /* 量測時先解除裁切 */
    var range = document.createRange();
    var base = span.getBoundingClientRect().left;
    var widths = [0];
    for (var i = 1; i <= node.length; i++) {
      range.setStart(node, 0);
      range.setEnd(node, i);
      var r = range.getBoundingClientRect();
      widths.push(Math.ceil(r.right - base) + 1);  /* +1：避免尾字被裁掉半像素 */
    }
    widths[widths.length - 1] = Math.ceil(span.getBoundingClientRect().width) + 1;
    el.style.width = prev;
    return widths;
  }

  function playTyping() {
    typingAnims.forEach(function (a) { a.cancel(); });
    typingAnims = [];
    if (!('animate' in Element.prototype)) return;

    typeTargets.forEach(function (t) {
      var widths = measure(t.el);
      if (!widths || widths.length < 2) return;
      var cfg = T.typing[t.key];
      var n = widths.length - 1;
      var frames = widths.map(function (w, i) {
        return { width: w + 'px', offset: i / n, easing: 'steps(1, end)' };
      });
      var anim = t.el.animate(frames, {
        duration: n * cfg.step,
        delay: cfg.start,
        fill: 'both',
        easing: 'linear'
      });
      typingAnims.push(anim);
    });
  }

  /* ---- 4 播放控制 ---- */
  var loopTimer = null;
  var wantsLoop = /[?&#]loop\b/.test(location.search + location.hash);

  function play() {
    root.classList.add('anim');
    root.classList.remove('is-playing');
    void root.offsetWidth;                          /* 強制回流，讓 CSS 動畫重新起跑 */
    root.classList.add('is-playing');
    playTyping();
    window.__pfStart = performance.now();   /* 除錯／截圖比對用的時間基準 */

    if (loopTimer) clearTimeout(loopTimer);
    if (wantsLoop) loopTimer = setTimeout(play, CYCLE);   /* 與設計稿相同的無限循環 */
  }

  function finish() {                               /* 不播動畫：直接停在完成態 */
    root.classList.remove('anim', 'is-playing');
    typingAnims.forEach(function (a) { a.cancel(); });
    typingAnims = [];
  }

  /* ---- 5 啟動 ---- */
  buildStripes();

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    setUnit();
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var playing = root.classList.contains('is-playing');
      buildStripes();
      if (playing) { root.classList.add('is-playing'); }
      if (typingAnims.length) playTyping();         /* 字寬隨縮放改變，重新量測 */
    }, 180);
  });

  var replay = document.getElementById('replay');
  if (replay) replay.addEventListener('click', play);

  function start() {
    if (window.__pfSafety) clearTimeout(window.__pfSafety);
    if (root.classList.contains('anim')) play();    /* head 已判斷是否尊重 reduce-motion */
    else finish();
  }

  /* 等字型就緒再量測字寬，避免打字中途換字型跳動；最多等 1.5s */
  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1500);
  } else {
    start();
  }
})();
