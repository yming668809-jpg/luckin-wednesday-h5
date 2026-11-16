/**
 * ============================================================
 * 瑞幸「幸运星期四 今天有惊喜」H5 - 交互逻辑（纯前端演示）
 * 抽奖次数 / 我的奖品 使用 localStorage 本地演示数据管理
 * ============================================================
 */
(function () {
  'use strict';

  var CFG = window.LUCKIN_DEMO;
  var STORAGE_KEY = 'luckin-wednesday-demo-state';

  /** 本地演示状态 */
  var state = {
    count: CFG.activity.initDrawCount,
    prizes: [], // [{name, time, img}]
  };

  /* ---------------- 本地存储（含降级） ---------------- */
  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        // 次数不持久化：每次打开页面都重置为初始次数
        if (Array.isArray(saved.prizes)) state.prizes = saved.prizes;
      }
    } catch (e) { /* 隐私模式等场景降级为内存态 */ }
  }
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* ignore */ }
  }

  /* ---------------- 工具 ---------------- */
  var $ = function (sel) { return document.querySelector(sel); };

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 2000);
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function formatTime(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  /* ---------------- 弹窗通用：滚动锁 + 关闭 ---------------- */
  var openModals = [];
  function openModal(id) {
    var m = $(id);
    m.hidden = false;
    openModals.push(m);
    document.body.classList.add('no-scroll');
    var closeBtn = m.querySelector('.modal-close');
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function closeModal(m) {
    m.hidden = true;
    openModals = openModals.filter(function (x) { return x !== m; });
    if (openModals.length === 0) document.body.classList.remove('no-scroll');
  }
  // 遮罩 / 关闭按钮：仅 data-close 元素可关闭，弹窗内容区点击不冒泡误触
  document.addEventListener('click', function (e) {
    var closer = e.target.closest('[data-close]');
    if (closer) {
      var modal = closer.closest('.modal');
      if (modal) closeModal(modal);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openModals.length) closeModal(openModals[openModals.length - 1]);
  });

  /* ---------------- 顶部内容渲染 ---------------- */
  function renderHero() {
    var t = CFG.texts;
    $('#storeName').textContent = CFG.activity.storeName;
    $('#titleLine1').textContent = CFG.activity.titleLine1;
    $('#titleLine2').textContent = CFG.activity.titleLine2;
    $('#titleHighlight').textContent = CFG.activity.titleHighlight;
    $('#fsTitle1').textContent = t.flashSaleTitle1;
    $('#fsTitle2').textContent = t.flashSaleTitle2;
    $('#fsTitle3').textContent = t.flashSaleTitle3;
    $('#winTitle').textContent = t.winTitle;
    $('#winTip').textContent = t.winTip;
    $('#goDrinkBtn').textContent = t.winBtn;
    $('#myPrizesTitle').textContent = t.myPrizesTitle;
    $('#rulesTitle').textContent = t.rulesTitle;
  }

  function renderMarquee() {
    var items = CFG.marquee;
    [$('#marqueeTrack1'), $('#marqueeTrack2')].forEach(function (track, row) {
      track.innerHTML = '';
      // 内容复制两份实现无缝循环
      for (var copy = 0; copy < 2; copy++) {
        items.forEach(function (text, i) {
          var span = document.createElement('span');
          span.textContent = items[(i + row * 3) % items.length];
          track.appendChild(span);
        });
      }
    });
  }

  /* ---------------- 九宫格渲染 ---------------- */
  function renderGrid() {
    var grid = $('#grid');
    var drawBtn = $('#drawBtn');
    CFG.gridPrizes.forEach(function (prize, idx) {
      if (prize === null) { // 中心按钮移动到第 5 格（九宫格正中）
        if (grid.children[4] !== drawBtn) grid.appendChild(drawBtn);
        return;
      }
      var cell = document.createElement('div');
      cell.className = 'cell';
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', prize.mystery ? '神秘大奖' : prize.name);
      if (prize.mystery) {
        // 神秘大奖占位：只显示「？」，不在九宫格提前泄露奖品图
        var mark = document.createElement('span');
        mark.className = 'cell-mystery';
        mark.textContent = '？';
        cell.appendChild(mark);
      } else {
        var img = document.createElement('img');
        img.src = prize.img;
        img.alt = prize.name;
        cell.appendChild(img);
      }
      if (prize.tag) {
        var tag = document.createElement('span');
        tag.className = 'cell-tag';
        tag.textContent = prize.tag;
        cell.appendChild(tag);
      }
      grid.appendChild(cell);
    });
  }

  /* ---------------- 抽奖核心 ---------------- */
  var spinning = false;
  // 顺时针轮播顺序（九宫格位置索引，绕过中心格 4）
  var SPIN_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
  // 奖品格 NodeList 不含中心按钮，位置 >4 的索引需前移一位
  function toCellIndex(gridIdx) { return gridIdx < 4 ? gridIdx : gridIdx - 1; }
  var CELL_ORDER = SPIN_ORDER.map(toCellIndex);

  function updateDrawBtn() {
    var btn = $('#drawBtn');
    var main = $('#drawBtnMain');
    var count = $('#drawBtnCount');
    if (state.count > 0) {
      main.textContent = CFG.texts.drawBtnMain;
      count.textContent = CFG.texts.drawBtnCountPrefix + ' ' + state.count + ' 次';
      btn.classList.remove('is-empty');
    } else {
      main.textContent = CFG.texts.drawBtnEmpty;
      count.textContent = CFG.texts.drawBtnEmptyHint;
      btn.classList.add('is-empty');
    }
  }

  function pickResultIndex() {
    if (CFG.activity.fixedResultIndex !== null) return CFG.activity.fixedResultIndex;
    var exclude = CFG.activity.secondPrizeIndex; // 第 1 次随机抽奖排除神秘大奖下标
    var valid = [];
    CFG.gridPrizes.forEach(function (p, i) {
      if (p && i !== exclude) valid.push(i);
    });
    return valid[Math.floor(Math.random() * valid.length)];
  }

  /**
   * 决定本次抽奖结果：
   * - 第 1 次（非最后一次）：随机，且排除海蓝之谜神秘大奖
   * - 第 2 次（本页最后一次）：固定中 secondPrizeIndex（海蓝之谜套盒）
   * @param {boolean} isLastDraw 本次是否为最后一次抽奖
   */
  function decideResultIndex(isLastDraw) {
    var secondIdx = CFG.activity.secondPrizeIndex;
    if (isLastDraw && secondIdx != null && CFG.gridPrizes[secondIdx]) {
      return secondIdx;
    }
    return pickResultIndex();
  }

  function spin() {
    if (spinning) return; // 防止抽奖过程中重复点击
    if (state.count <= 0) { toast(CFG.texts.emptyCountToast); return; }

    spinning = true;
    // 抽奖序号（1-based），在减少次数前计算，用于判定是否为最后一次
    var drawNumber = CFG.activity.initDrawCount - state.count + 1;
    var isLastDraw = drawNumber >= CFG.activity.initDrawCount;
    state.count--;
    saveState();
    updateDrawBtn();

    var btn = $('#drawBtn');
    var cells = document.querySelectorAll('#grid .cell:not(.center-btn)');
    btn.classList.add('is-drawing');

    var resultIdx = decideResultIndex(isLastDraw);
    var targetPos = SPIN_ORDER.indexOf(resultIdx);
    var totalSteps = 3 * SPIN_ORDER.length + targetPos + 1; // 3 圈后停在奖项上
    var startDelay = 70, endDelay = 300;
    var step = 0;

    (function tick() {
      cells.forEach(function (c) { c.classList.remove('is-active'); });
      cells[CELL_ORDER[step % CELL_ORDER.length]].classList.add('is-active');
      step++;
      if (step < totalSteps) {
        var t = step / totalSteps;
        var delay = startDelay + (endDelay - startDelay) * t * t; // 减速曲线
        setTimeout(tick, delay);
      } else {
        setTimeout(function () {
          cells.forEach(function (c) { c.classList.remove('is-active'); });
          cells[toCellIndex(resultIdx)].classList.add('is-active');
          btn.classList.remove('is-drawing');
          spinning = false;
          showWin(resultIdx);
        }, 380);
      }
    })();
  }

  /* ---------------- 中奖弹窗 ---------------- */
  function showWin(gridIdx) {
    var prize = CFG.gridPrizes[gridIdx];
    $('#winPrizeImg').src = prize.img;
    $('#winPrizeName').textContent = prize.name;
    state.prizes.unshift({ name: prize.name, time: formatTime(new Date()), img: prize.img });
    saveState();
    openModal('#winModal');
  }

  /* ---------------- 我的奖品 ---------------- */
  function renderMyPrizes() {
    var list = $('#prizeList');
    list.innerHTML = '';
    if (!state.prizes.length) {
      var li = document.createElement('li');
      li.className = 'empty';
      li.textContent = CFG.texts.myPrizesEmpty;
      list.appendChild(li);
      return;
    }
    state.prizes.forEach(function (p) {
      var li = document.createElement('li');
      var img = document.createElement('img');
      img.src = p.img;
      img.alt = '';
      var box = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'pl-name';
      name.textContent = p.name;
      var time = document.createElement('div');
      time.className = 'pl-time';
      time.textContent = p.time;
      box.appendChild(name);
      box.appendChild(time);
      li.appendChild(img);
      li.appendChild(box);
      list.appendChild(li);
    });
  }

  /* ---------------- 规则 ---------------- */
  function renderRules() {
    var box = $('#ruleList');
    box.innerHTML = '';
    CFG.rules.forEach(function (line) {
      var p = document.createElement('p');
      p.textContent = line;
      box.appendChild(p);
    });
  }

  /* ---------------- 奖品池 / 限时购渲染 ---------------- */
  function renderPool() {
    var wrap = $('#poolScroll');
    wrap.innerHTML = '';
    CFG.prizePool.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'pool-card' + (item.soldOut ? ' soldout' : '');
      card.setAttribute('role', 'listitem');
      var badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = item.badge;
      var img = document.createElement('img');
      img.src = item.img;
      img.alt = item.name;
      var name = document.createElement('p');
      name.className = 'p-name';
      name.textContent = item.name;
      var status = document.createElement('p');
      status.className = 'p-status';
      status.textContent = item.soldOut ? '已赠完' : '可抽取';
      card.appendChild(badge);
      if (item.tag) {
        var ribbon = document.createElement('span');
        ribbon.className = 'ribbon';
        ribbon.textContent = item.tag;
        card.appendChild(ribbon);
      }
      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(status);
      wrap.appendChild(card);
    });
  }

  function renderFlashSale() {
    var wrap = $('#fsScroll');
    wrap.innerHTML = '';
    var t = CFG.texts;
    CFG.flashSale.forEach(function (item) {
      var card = document.createElement('div');
      card.className = 'fs-card';
      card.setAttribute('role', 'listitem');
      var img = document.createElement('img');
      img.src = item.img;
      img.alt = item.name;
      var name = document.createElement('p');
      name.className = 'f-name';
      name.textContent = item.name;
      var desc = document.createElement('p');
      desc.className = 'f-desc';
      desc.textContent = item.desc;
      var priceRow = document.createElement('div');
      priceRow.className = 'f-price-row';
      var price = document.createElement('span');
      price.className = 'f-price';
      price.textContent = item.price;
      var origin = document.createElement('span');
      origin.className = 'f-origin';
      origin.textContent = item.origin;
      priceRow.appendChild(price);
      priceRow.appendChild(origin);
      var buy = document.createElement('button');
      buy.className = 'f-buy';
      buy.type = 'button';
      buy.textContent = t.flashSaleBtn;
      buy.addEventListener('click', function () { toast(t.flashSaleToast); });
      card.appendChild(img);
      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(priceRow);
      card.appendChild(buy);
      wrap.appendChild(card);
    });
  }

  /* ---------------- 事件绑定 ---------------- */
  function bindEvents() {
    $('#drawBtn').addEventListener('click', spin);
    $('#ruleBtn').addEventListener('click', function () { openModal('#ruleModal'); });
    $('#myPrizeTab').addEventListener('click', function () {
      renderMyPrizes();
      openModal('#prizeModal');
    });
    $('#goDrinkBtn').addEventListener('click', function () {
      // 立即领取：提示已入账，关闭中奖弹窗回到抽奖界面
      toast('已领取，奖品已放入「我的奖品」');
      closeModal($('#winModal'));
    });
    $('#storeEntry').addEventListener('click', function () {
      toast('演示环境：此处将打开门店切换（本地演示）');
    });
  }

  /* ---------------- 启动 ---------------- */
  loadState();
  renderHero();
  renderMarquee();
  renderGrid();
  renderPool();
  renderFlashSale();
  renderRules();
  updateDrawBtn();
  bindEvents();
})();
