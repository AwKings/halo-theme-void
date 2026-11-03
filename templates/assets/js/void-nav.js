/* ==========================================================================
   VOID Nav —— 导航页交互
   分类筛选（默认「全部」）/ 搜索过滤 / 键盘快捷键
   ========================================================================== */
(function () {
  'use strict';

  var input = document.getElementById('nav-search-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.nav-card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.nav-tab'));
  var noResult = document.getElementById('nav-no-result');

  if (!cards.length) return;

  var activeGroup = 'all'; // 'all' 或分组序号

  /* ---------- 吸顶偏移跟随头部高度 ---------- */

  function syncStickyOffset() {
    var header = document.querySelector('body > header');
    if (!header) return;
    var offset = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--nav-sticky-top', offset + 'px');
  }
  syncStickyOffset();
  window.addEventListener('resize', syncStickyOffset);

  /* ---------- 过滤 ---------- */

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function haystack(card) {
    return [
      card.getAttribute('data-name'),
      card.getAttribute('data-desc'),
      card.getAttribute('data-url')
    ]
      .map(normalize)
      .join(' ');
  }

  function visibleCardsIn(group) {
    return Array.prototype.filter.call(group.querySelectorAll('.nav-card'), function (c) {
      return c.style.display !== 'none';
    });
  }

  function applyFilter() {
    var kw = normalize(input ? input.value : '');
    var total = 0;

    // 1. 先按关键词筛卡片
    cards.forEach(function (card) {
      card.style.display = !kw || haystack(card).indexOf(kw) !== -1 ? '' : 'none';
    });

    // 2. 再按选中分组决定哪些分组显示
    groups.forEach(function (group) {
      var gi = group.getAttribute('data-group');
      var inGroup = activeGroup === 'all' || gi === activeGroup;
      var shown = visibleCardsIn(group).length;
      var emptyHint = group.querySelector('.nav-group-empty');
      var keepEmptyHint = emptyHint && kw === '';

      group.style.display = inGroup && (shown > 0 || keepEmptyHint) ? '' : 'none';
      total += inGroup ? shown : 0;

      // 3. 搜索时把没有命中的分组按钮隐起来，避免点了空白
      var tab = tabs.filter(function (t) {
        return t.getAttribute('data-group') === gi;
      })[0];
      if (tab) tab.style.display = !kw || shown > 0 || gi === activeGroup ? '' : 'none';
    });

    if (noResult) noResult.style.display = total ? 'none' : '';
    updateTabsFade();
    return total;
  }

  /* ---------- 分类筛选按钮 ---------- */

  function selectTab(tab) {
    activeGroup = tab.getAttribute('data-group') || 'all';
    tabs.forEach(function (t) {
      t.classList.toggle('active', t === tab);
    });
    applyFilter();
    // 把选中的分类按钮横向滚到可见区域
    scrollTabIntoView(tab);
    // 切换分类时回到列表顶部，避免停在页面中间
    var tabsTop = document.getElementById('nav-tabs-wrap');
    if (tabsTop) {
      var offset = tabsTop.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > offset) window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  /* 分类不多时按钮条居中，超出时左对齐并可横向滚动；溢出才显示「展开」 */
  var tabsWrap = document.getElementById('nav-tabs-wrap');
  var expandBtn = document.getElementById('nav-tabs-expand');

  function isExpanded() {
    return tabsWrap && tabsWrap.getAttribute('data-expanded') === 'true';
  }

  function updateTabsLayout() {
    var bar = document.getElementById('nav-tabs');
    if (!bar) return;
    if (isExpanded()) {
      bar.setAttribute('data-compact', 'false');
      bar.removeAttribute('data-fade');
      if (expandBtn) {
        expandBtn.setAttribute('data-visible', 'true');
        expandBtn.textContent = '收起';
        expandBtn.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    var overflow = bar.scrollWidth > bar.clientWidth + 1;
    bar.setAttribute('data-compact', overflow ? 'false' : 'true');
    if (expandBtn) {
      expandBtn.setAttribute('data-visible', overflow ? 'true' : 'false');
      expandBtn.textContent = '展开';
      expandBtn.setAttribute('aria-expanded', 'false');
    }
    updateTabsFade();
  }

  /* 被裁切的一侧加渐隐，避免出现硬切的「半截按钮」 */
  function updateTabsFade() {
    var bar = document.getElementById('nav-tabs');
    if (!bar) return;
    if (isExpanded()) {
      bar.removeAttribute('data-fade');
      return;
    }
    var maxScroll = bar.scrollWidth - bar.clientWidth;
    if (maxScroll <= 1) {
      bar.removeAttribute('data-fade');
      return;
    }
    var left = bar.scrollLeft > 1;
    var right = bar.scrollLeft < maxScroll - 1;
    bar.setAttribute('data-fade', left && right ? 'both' : left ? 'left' : 'right');
  }

  var reduceMotion =
    window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function scrollActiveIntoView() {
    var act = tabs.filter(function (t) {
      return t.classList.contains('active');
    })[0];
    if (act) scrollTabIntoView(act);
  }

  function setExpanded(next) {
    tabsWrap.setAttribute('data-expanded', next ? 'true' : 'false');
    updateTabsLayout();
    if (!next) scrollActiveIntoView();
  }

  /* 展开/收起带高度过渡动画 */
  function toggleExpanded() {
    if (!tabsWrap) return;
    var bar = document.getElementById('nav-tabs');
    var next = !isExpanded();
    if (!bar || reduceMotion) {
      setExpanded(next);
      return;
    }

    var start = bar.getBoundingClientRect().height;
    var finished = false;

    bar.style.transition = 'none';
    bar.style.height = start + 'px';
    bar.style.overflow = 'hidden';

    // 先临时切到目标布局量一次自然高度（同帧内还原，不会产生绘制）
    tabsWrap.setAttribute('data-expanded', next ? 'true' : 'false');
    bar.style.height = 'auto';
    var target = bar.offsetHeight;

    // 收起：动画期间保持多行布局，让行从底部被裁掉；动画结束再切成单行
    if (!next) tabsWrap.setAttribute('data-expanded', 'true');

    bar.style.height = start + 'px';
    void bar.offsetHeight; // 强制重排，确保起始高度生效

    bar.style.transition = 'height 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    bar.style.height = target + 'px';

    var done = function () {
      if (finished) return;
      finished = true;
      // 单行布局在此刻切换：可见的第一行位置不变，不会跳
      if (!next) tabsWrap.setAttribute('data-expanded', 'false');
      bar.style.transition = '';
      bar.style.height = '';
      bar.style.overflow = '';
      updateTabsLayout();
      if (!next) scrollActiveIntoView();
    };

    var onEnd = function (e) {
      if (e.target !== bar || e.propertyName !== 'height') return;
      bar.removeEventListener('transitionend', onEnd);
      done();
    };
    bar.addEventListener('transitionend', onEnd);
    setTimeout(function () {
      bar.removeEventListener('transitionend', onEnd);
      done();
    }, 450);
  }

  if (expandBtn) {
    expandBtn.addEventListener('click', toggleExpanded);
  }

  /* 与高度动画同节奏的横向滚动（easeOutCubic，0.28s） */
  function animateScrollLeft(el, to, duration) {
    var from = el.scrollLeft;
    var delta = to - from;
    if (Math.abs(delta) < 1) return;
    var startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      var p = Math.min(1, (ts - startTime) / duration);
      var e = 1 - Math.pow(1 - p, 3);
      el.scrollLeft = from + delta * e;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollTabIntoView(tab) {
    var bar = document.getElementById('nav-tabs');
    if (!bar || isExpanded() || bar.scrollWidth <= bar.clientWidth) return;
    var target = tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2;
    var maxScroll = bar.scrollWidth - bar.clientWidth;
    target = Math.max(0, Math.min(maxScroll, target));
    if (reduceMotion) {
      bar.scrollLeft = target;
      return;
    }
    animateScrollLeft(bar, target, 280);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectTab(tab);
    });
  });

  /* ---------- 搜索框 ---------- */

  if (input) {
    input.addEventListener('input', function () {
      applyFilter();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = cards.filter(function (c) {
          return c.style.display !== 'none';
        })[0];
        if (first) window.open(first.href, '_blank', 'noopener');
      } else if (e.key === 'Escape') {
        input.value = '';
        applyFilter();
        input.blur();
      }
    });
  }

  /* ---------- 键盘：任意键聚焦搜索 / Ctrl+数字打开第 N 个 ---------- */

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || e.target.isContentEditable;

    // Ctrl/Cmd + 数字：打开第 N 个可见站点
    if ((e.ctrlKey || e.metaKey) && /^[1-9]$/.test(e.key)) {
      var list = cards.filter(function (c) {
        return c.style.display !== 'none';
      });
      var target = list[Number(e.key) - 1];
      if (target) {
        e.preventDefault();
        window.open(target.href, '_blank', 'noopener');
      }
      return;
    }

    if (typing || !input) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // 可打印字符：聚焦搜索框并输入
    if (e.key.length === 1) {
      input.focus();
    }
  });

  /* ---------- 初始化：默认「全部」 ---------- */

  var allTab = tabs.filter(function (t) {
    return t.getAttribute('data-group') === 'all';
  })[0];
  if (allTab) selectTab(allTab);
  else applyFilter();
  updateTabsLayout();

  var tabsBarEl = document.getElementById('nav-tabs');
  if (tabsBarEl) {
    tabsBarEl.addEventListener('scroll', updateTabsFade, { passive: true });
  }
  window.addEventListener('resize', updateTabsLayout);
})();
