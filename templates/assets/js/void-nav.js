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
  var drawerCats = Array.prototype.slice.call(document.querySelectorAll('.nav-mobile-cat'));
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

  /* 移动端断点，与 CSS 的 @media (max-width: 767px) 保持一致 */
  function isMobileViewport() {
    return window.matchMedia && window.matchMedia('(max-width: 767px)').matches;
  }

  function selectTab(tab) {
    activeGroup = tab.getAttribute('data-group') || 'all';
    tabs.forEach(function (t) {
      t.classList.toggle('active', t === tab);
    });
    // 移动端抽屉里的分类同步高亮
    drawerCats.forEach(function (d) {
      d.classList.toggle('active', d.getAttribute('data-group') === activeGroup);
    });
    applyFilter();
    // 把选中的分类按钮横向滚到可见区域
    scrollTabIntoView(tab);
    // 切换分类时回到列表顶部：桌面滚到分类条，移动端分类条不显示则滚到当前分组
    var anchor = document.getElementById('nav-tabs-wrap');
    if (!anchor || !anchor.offsetHeight) {
      anchor =
        document.querySelector('.nav-group[data-group="' + activeGroup + '"]') ||
        document.querySelector('.nav-group');
    }
    if (anchor) {
      var offset = anchor.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY > offset) window.scrollTo({ top: offset, behavior: 'smooth' });
    }
    // 仅移动端：分类卡片处于展开态时，选中后自动收起
    if (isMobileViewport() && isExpanded()) {
      toggleExpanded();
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

  /* ---------- 半截按钮的定向擦除 ---------- */

  function allTabs(bar) {
    return Array.prototype.slice.call(bar.querySelectorAll('.nav-tab'));
  }

  /* 横跨右边界的按钮（半显示半隐藏） */
  function tabsAtEdge(bar) {
    var bb = bar.getBoundingClientRect();
    return allTabs(bar).filter(function (t) {
      var r = t.getBoundingClientRect();
      return r.left < bb.right - 1 && r.right > bb.right + 1;
    });
  }

  /* dir: 'out' 从左往右淡出 / 'in' 从右往左淡入 */
  function wipeTabs(list, dir, ms) {
    if (!list.length) return;
    list.forEach(function (t) {
      t.classList.remove('is-wiping', 'is-wiping-out', 'is-wiping-in');
      t.classList.add('is-wiping', dir === 'out' ? 'is-wiping-out' : 'is-wiping-in');
    });
    setTimeout(function () {
      list.forEach(function (t) {
        t.classList.remove('is-wiping', 'is-wiping-out', 'is-wiping-in');
      });
    }, ms + 40);
  }

  function clearTabOpacity(bar) {
    allTabs(bar).forEach(function (t) {
      t.style.transition = '';
      t.style.opacity = '';
    });
  }

  /* 展开/收起带高度过渡动画 */
  function toggleExpanded() {
    if (!tabsWrap) return;
    var bar = document.getElementById('nav-tabs');
    if (!bar) return;
    var next = !isExpanded();
    if (reduceMotion) {
      setExpanded(next);
      return;
    }

    // 展开：先把右边缘那颗半截按钮从左往右擦掉，再切布局生长
    if (next) {
      var edge = tabsAtEdge(bar);
      if (edge.length) {
        wipeTabs(edge, 'out', 140);
        setTimeout(function () {
          runTabsTransition(true);
        }, 140);
        return;
      }
    }

    runTabsTransition(next);
  }

  function runTabsTransition(toExpanded) {
    var bar = document.getElementById('nav-tabs');
    if (!bar) return;

    var startH = bar.getBoundingClientRect().height;
    var startScroll = bar.scrollLeft;
    var finished = false;

    bar.style.transition = 'none';
    bar.style.height = startH + 'px';
    bar.style.overflow = 'hidden';

    // 量两种布局的自然高度
    tabsWrap.setAttribute('data-expanded', 'true');
    bar.style.height = 'auto';
    var expandedH = bar.offsetHeight;
    tabsWrap.setAttribute('data-expanded', 'false');
    bar.style.height = 'auto';
    var collapsedH = bar.offsetHeight;
    var targetH = toExpanded ? expandedH : collapsedH;

    // 展开：立刻切多行（行被高度裁住）；收起：动画期间仍保持多行，结束再切单行
    tabsWrap.setAttribute('data-expanded', 'true');

    // 展开时那颗半截按钮已经落到第二行（被裁住不可见），把透明度还原
    if (toExpanded) clearTabOpacity(bar);

    bar.style.height = startH + 'px';
    bar.scrollLeft = startScroll;
    void bar.offsetHeight; // 强制重排，确保起始高度生效

    bar.style.transition = 'height 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    bar.style.height = targetH + 'px';

    var done = function () {
      if (finished) return;
      finished = true;

      if (!toExpanded) {
        // 切成单行：此时首行可见内容不变，新出现的是原先落在第二行的半截按钮
        tabsWrap.setAttribute('data-expanded', 'false');
        bar.style.transition = '';
        bar.style.height = '';
        bar.style.overflow = '';
        // 新出现的半截按钮从右往左淡入，与横向滚动并行
        var edgeIn = tabsAtEdge(bar);
        if (edgeIn.length) wipeTabs(edgeIn, 'in', 180);
      } else {
        bar.style.transition = '';
        bar.style.height = '';
        bar.style.overflow = '';
        clearTabOpacity(bar);
      }

      updateTabsLayout();
      if (!toExpanded) scrollActiveIntoView();
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

  var scrollAnim = null;

  /* 显式动画：部分浏览器/设置下原生 behavior:'smooth' 不生效，这里自己插值 */
  function animateScrollLeft(bar, target) {
    if (scrollAnim) {
      cancelAnimationFrame(scrollAnim);
      scrollAnim = null;
    }
    var start = bar.scrollLeft;
    var delta = target - start;
    if (Math.abs(delta) < 1) return;
    if (reduceMotion) {
      bar.scrollLeft = target;
      return;
    }
    var duration = Math.min(520, Math.max(260, Math.abs(delta) * 0.7));
    var t0 = performance.now();
    function step(now) {
      var p = Math.min(1, (now - t0) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      bar.scrollLeft = start + delta * eased;
      scrollAnim = p < 1 ? requestAnimationFrame(step) : null;
    }
    scrollAnim = requestAnimationFrame(step);
  }

  function scrollTabIntoView(tab) {
    var bar = document.getElementById('nav-tabs');
    if (!bar || isExpanded() || bar.scrollWidth <= bar.clientWidth) return;
    var target = tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2;
    var maxScroll = bar.scrollWidth - bar.clientWidth;
    target = Math.max(0, Math.min(maxScroll, target));
    animateScrollLeft(bar, target);
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      selectTab(tab);
    });
  });

  /* ---------- 移动端：分类抽屉 ---------- */

  /* 关闭抽屉走 VOID 自己的关闭路径（旋转回汉堡、淡出、解除滚动锁定） */
  function closeMobileDrawer() {
    var toggle = document.querySelector('header .toggle');
    if (toggle && toggle.classList.contains('pushed') && window.VOID_Ui && VOID_Ui.toggleNav) {
      VOID_Ui.toggleNav(toggle);
    }
  }

  drawerCats.forEach(function (item) {
    item.addEventListener('click', function () {
      var g = item.getAttribute('data-group');
      var tab = tabs.filter(function (t) {
        return t.getAttribute('data-group') === g;
      })[0];
      closeMobileDrawer();
      if (tab) selectTab(tab);
    });
  });

  /* ---------- 移动端：搜索面板 ---------- */

  var searchBox = document.querySelector('.nav-search');
  var searchToggle = document.getElementById('nav-toggle-search');

  if (searchToggle && searchBox) {
    searchToggle.addEventListener('click', function () {
      var opened = searchBox.classList.toggle('opened');
      if (opened && input) input.focus();
    });
  }

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
        if (searchBox) searchBox.classList.remove('opened');
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
