/*!
 * 代码块复制
 * 给 .yue 里的代码块加一个复制按钮。
 * - 兼容 pjax：VOID 走 pjax 切换页面，pjax:end 后重新绑定
 * - 兼容 shiki 插件：代码块被渲染进 <shiki-code> 的 shadow DOM 时，
 *   按钮挂在 host 上，复制内容取宿主内原始 <pre> 的文本
 */
(function () {
    'use strict';

    var COPY_TEXT = '复制';
    var DONE_TEXT = '已复制';
    var FAIL_TEXT = '复制失败';
    var ICON =
        '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="none" ' +
        'stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/>' +
        '<path d="M10.5 5.5V3.5A1.5 1.5 0 0 0 9 2H3.5A1.5 1.5 0 0 0 2 3.5V9a1.5 1.5 0 0 0 1.5 1.5h2"/>' +
        '</svg>';

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.setAttribute('readonly', '');
            ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            ta.setSelectionRange(0, ta.value.length);
            var ok = false;
            try {
                ok = document.execCommand('copy');
            } catch (e) {
                ok = false;
            }
            document.body.removeChild(ta);
            if (ok) {
                resolve();
            } else {
                reject(new Error('execCommand copy failed'));
            }
        });
    }

    function codeOf(block) {
        var code = block.querySelector('pre code') || block.querySelector('code');
        return (code ? code.textContent : block.textContent) || '';
    }

    function flash(btn, text) {
        var label = btn.querySelector('span');
        label.textContent = text;
        clearTimeout(btn._voidCopyTimer);
        btn._voidCopyTimer = setTimeout(function () {
            btn.classList.remove('copied');
            label.textContent = COPY_TEXT;
        }, 1600);
    }

    function attach(block) {
        var wrap = document.createElement('div');
        wrap.className = 'void-code-copy-wrap';
        block.parentNode.insertBefore(wrap, block);
        wrap.appendChild(block);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'void-copy-btn';
        btn.setAttribute('aria-label', '复制代码');
        btn.innerHTML = ICON + '<span>' + COPY_TEXT + '</span>';

        btn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            var text = codeOf(block).replace(/\s+$/, '');
            copyText(text)
                .then(function () {
                    btn.classList.add('copied');
                    flash(btn, DONE_TEXT);
                })
                .catch(function () {
                    flash(btn, FAIL_TEXT);
                });
        });

        wrap.appendChild(btn);
    }

    function init() {
        var blocks = document.querySelectorAll('.yue pre, .yue shiki-code');
        for (var i = 0; i < blocks.length; i++) {
            var b = blocks[i];
            // 已处理过（pjax 重复触发、MutationObserver 重复触发）
            if (b.parentNode && b.parentNode.classList.contains('void-code-copy-wrap')) {
                continue;
            }
            // shiki 里被隐藏的原始 <pre>，按钮挂在 host 上即可
            if (b.tagName === 'PRE' && b.parentNode && b.parentNode.tagName === 'SHIKI-CODE') {
                continue;
            }
            if (b.closest && b.closest('shiki-code')) {
                continue;
            }
            attach(b);
        }
    }

    function schedule() {
        setTimeout(init, 0);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', schedule);
    } else {
        schedule();
    }

    // VOID 用 jQuery 触发 pjax 事件；自定义事件不会派发原生事件，所以用 jQuery 监听
    if (window.jQuery) {
        window.jQuery(document).on('pjax:end', schedule);
    }

    // 兜底：内容被局部替换时也能补上（debounce）
    if (window.MutationObserver) {
        var timer = null;
        var observer = new MutationObserver(function () {
            clearTimeout(timer);
            timer = setTimeout(init, 120);
        });
        var start = function () {
            var root = document.getElementById('pjax-container') || document.body;
            observer.observe(root, { childList: true, subtree: true });
        };
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', start);
        } else {
            start();
        }
    }
})();
