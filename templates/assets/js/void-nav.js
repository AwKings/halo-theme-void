/* ==========================================================================
   VOID Nav —— 导航页交互
   搜索过滤 / 键盘快捷键 / 分组锚点高亮
   ========================================================================== */
(function () {
  'use strict';

  var input = document.getElementById('nav-search-input');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.nav-card'));
  var groups = Array.prototype.slice.call(document.querySelectorAll('.nav-group'));
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.nav-tab'));
  var noResult = document.getElementById('nav-no-result');

  if (!cards.length) return;

  /* ---------- 吸顶偏移跟随头部高度 ---------- */

  function syncStickyOffset() {
    var header = document.querySelector('body > header');
    if (!header) return;
    var offset = Math.round(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--nav-sticky-top', offset + 'px');
  }
  syncStickyOffset();
  window.addEventListener('resize', syncStickyOffset);

  /* ---------- 搜索过滤 ---------- */

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function filter(keyword) {
    var kw = normalize(keyword);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-name'),
        card.getAttribute('data-desc'),
        card.getAttribute('data-url')
      ].map(normalize).join(' ');
      var hit = !kw || haystack.indexOf(kw) !== -1;
      card.style.display = hit ? '' : 'none';
      if (hit) visible++;
    });

    groups.forEach(function (group) {
      var shown = group.querySelectorAll('.nav-card:not([style*="display: none"])').length;
      var empty = group.querySelector('.nav-group-empty');
      group.style.display = shown || (empty && kw === '') ? '' : 'none';

      var tab = tabs[Number(group.getAttribute('data-group'))];
      if (tab) tab.style.display = shown ? '' : 'none';
    });

    if (noResult) noResult.style.display = visible ? 'none' : '';
    return visible;
  }

  if (input) {
    input.addEventListener('input', function () {
      filter(input.value);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = cards.filter(function (c) {
          return c.style.display !== 'none';
        })[0];
        if (first) window.open(first.href, '_blank', 'noopener');
      } else if (e.key === 'Escape') {
        input.value = '';
        filter('');
        input.blur();
      }
    });
  }

  /* ---------- 键盘：任意键聚焦搜索 / Ctrl+数字打开第 N 个 ---------- */

  var isMac = /Mac|iPhone|iPad/.test(navigator.platform);

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

  /* ---------- 滚动高亮当前分组 ---------- */

  if ('IntersectionObserver' in window && tabs.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = entry.target.getAttribute('data-group');
          tabs.forEach(function (tab) {
            tab.classList.toggle('active', tab.getAttribute('data-group') === idx);
          });
        });
      },
      { rootMargin: '-120px 0px -70% 0px', threshold: 0 }
    );
    groups.forEach(function (group) {
      observer.observe(group);
    });
  }

  /* ---------- 平滑滚动到分组 ---------- */

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function (e) {
      var id = tab.getAttribute('href');
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- 提示：Mac 用 ⌘ ---------- */

  if (isMac) {
    document.documentElement.setAttribute('data-platform', 'mac');
  }
})();
