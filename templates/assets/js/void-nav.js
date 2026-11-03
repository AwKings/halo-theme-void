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
    var bar = document.getElementById('nav-tabs');
    if (bar && bar.scrollWidth > bar.clientWidth) {
      var target = tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2;
      bar.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    }
    // 切换分类时回到列表顶部，避免停在页面中间
    var tabsTop = document.getElementById('nav-tabs');
    if (tabsTop) {
      var offset = tabsTop.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > offset) window.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }

  /* 分类不多时按钮条居中，超出时左对齐并可横向滚动 */
  function updateTabsLayout() {
    var bar = document.getElementById('nav-tabs');
    if (!bar) return;
    bar.setAttribute('data-compact', bar.scrollWidth <= bar.clientWidth + 1 ? 'true' : 'false');
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
  window.addEventListener('resize', updateTabsLayout);
})();
