/* eslint-disable no-unused-vars */
/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-console */
// VOID
// Author: 熊猫小A
// Link: https://blog.imalan.cn/archives/247/

console.log(' %c Theme VOID %c https://blog.imalan.cn/archives/247/ ', 'color: #fadfa3; background: #23b7e5; padding:5px;', 'background: #1c2b36; padding:5px;');

var VOID_Content = {
    countWords: function () {
        if ($('#totalWordCount').length) {
            var total = 0;
            $.each($('a.archive-title'), function (i, item) {
                total += parseInt($(item).attr('data-words'));
            });
            $('#totalWordCount').html(total);
        }
    },

    // 统计正文字数（中文按字、英文按词），对应 Typecho 插件里 contents.wordCount 字段
    postWordCount: function () {
        var el = document.querySelector('#post .articleBody');
        var target = document.getElementById('post-word-count');
        if (!el || !target) return;
        var text = el.innerText || el.textContent || '';
        var cn = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        var en = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
        target.textContent = (cn + en) + ' 字';
    },

    // 解析文章目录
    parseTOC: function () {
        if ($('.TOC').length > 0) {
            var toc_option = {
                // Where to render the table of contents.
                tocSelector: '.TOC',
                // Where to grab the headings to build the table of contents.
                contentSelector: 'div.articleBody',
                // Which headings to grab inside of the contentSelector element.
                headingSelector: 'h2, h3, h4, h5',
                // 收缩深度
                collapseDepth: 6
            };
            tocbot.init(toc_option);
            $.each($('.toc-link'), function(i, item){
                $(item).click(function(){
                    VOID_SmoothScroller.scrollTo($(this).attr('href'), -60);
                    if(window.innerWidth < 1200) {
                        TOC.close();
                    }
                    return false;
                });
            });
            // 检查目录
            if(window.innerWidth >= 1200) {
                TOC.open();
            } 
        }
    },

    // 解析照片集
    parsePhotos: function () {
        $.each($('div.articleBody figure:not(.size-parsed)'), function (i, item){
            var img = new Image();
            img.onload = function () {
                var w = parseFloat(img.width);
                var h = parseFloat(img.height);
                $(item).addClass('size-parsed');
                $(item).css('width', w + 'px');
                $(item).css('flex-grow', w * 50 / h);
                $(item).find('a').css('padding-top', h / w * 100 + '%');
            };
            img.src = $(item).find('img').attr('data-src');
        });
    },

    // 处理友链列表
    parseBoardThumbs: function () {
        $.each($('.board-thumb'), function(i, item) {
            if (VOIDConfig.lazyload) {
                if (VOIDConfig.browserLevelLoadingLazy) {
                    $(item).html('<img class="lazyload browserlevel-lazy" src="' +$(item).attr('data-thumb')+ '" loading="lazy">');
                } else {
                    $(item).html('<img class="lazyload" data-src="' +$(item).attr('data-thumb')+ '">');
                }
            } else {
                $(item).html('<img src="' +$(item).attr('data-thumb')+ '">');
            }
        });
    },

    // 解析URL
    parseUrl: function () {
        var domain = document.domain;
        $('a:not(a[href^="#"]):not(".post-like")').each(function (i, item) {
            if ((!$(item).attr('target') || (!$(item).attr('target') == '' && !$(item).attr('target') == '_self'))) {
                if (item.hostname != domain) {
                    $(item).attr('target', '_blank');
                }
            }
        });

        if (VOIDConfig.PJAX) {
            $.each($('a:not(a[target="_blank"], a[no-pjax])'), function (i, item) {
                if (item.hostname == domain) {
                    $(item).addClass('pjax');
                }
            });
            $(document).pjax('a.pjax', {
                container: '#pjax-container',
                fragment: '#pjax-container',
                timeout: 8000
            });
        }
    },

    highlight: function () {
        $.each($('.yue pre code'), function (i, item) {
            var classStr = $(item).attr('class');

            if (typeof(classStr) == 'undefined') {
                classStr = 'language-none';
            }

            if (classStr.indexOf('lang') == -1) {
                classStr += ' language-none';
            }

            $(item).attr('class', classStr);
        });
        
        Prism.highlightAll();
    },

    bigfoot: function () {
        // 初始化注脚
        $.bigfoot({ actionOriginalFN: 'ignore' });
    },

    pangu: function () {
        pangu.spacingElementByTagName('p');
    },

    math: function () {
        if (VOIDConfig.enableMath && typeof MathJax !== 'undefined') {
            MathJax.Hub.Config({
                tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
            });
            MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
        }
    },

    hyphenate: function() {
        $('div.articleBody p, div.articleBody blockquote').hyphenate('en-us');
    }
};

var VOID = {
    // 初始化单页应用
    init: function () {
        /* 初始化 UI */
        VOID_Ui.checkHeader();
        VOID_Ui.MasonryCtrler.init();
        VOID_Ui.DarkModeSwitcher.checkColorScheme();
        VOID_Ui.checkScrollTop();
        VOID_Content.parseBoardThumbs();
        VOID_Ui.lazyload();
        VOID_Ui.headroom();

        VOID_Content.countWords();
        VOID_Content.postWordCount();
        VOID_Content.parseTOC();
        VOID_Content.parsePhotos();
        VOID_Content.highlight();
        VOID_Content.parseUrl();
        VOID_Content.pangu();
        VOID_Content.bigfoot();
        VOID_Content.math();
        VOID_Content.hyphenate();
        

        $('body').on('click', function (e) {
            if (!VOID_Util.clickIn(e, '.mobile-search-form') && !VOID_Util.clickIn(e, '#toggle-mobile-search')) {
                if ($('.mobile-search-form').hasClass('opened')) {
                    $('.mobile-search-form').removeClass('opened');
                    return false;
                }
            }
            if (!VOID_Util.clickIn(e, '#toggle-setting-pc') && !VOID_Util.clickIn(e, '#toggle-setting')) {
                if ($('body').hasClass('setting-panel-show') && !VOID_Util.clickIn(e, '#setting-panel')) {
                    $('body').removeClass('setting-panel-show');
                    setTimeout(function () {
                        $('#setting-panel').hide();
                    }, 300);
                    return false;
                }
            }
        });
    },

    // PJAX 开始前
    beforePjax: function () {
        NProgress.start();
        VOID_Ui.reset();
    },

    // PJAX 结束后
    afterPjax: function () {
        NProgress.done();

        VOID_Content.parseBoardThumbs();

        if ($('#loggin-form').length) {
            $('#loggin-form').addClass('need-refresh');
        }

        VOID_Ui.MasonryCtrler.init();
        VOID_Ui.lazyload();
        
        VOID_Ui.checkScrollTop();
        VOID_Content.countWords();
        VOID_Content.postWordCount();
        VOID_Content.parseTOC();
        VOID_Content.parsePhotos();
        VOID_Content.parseUrl();
        VOID_Content.highlight();
        VOID_Content.math();
        VOID_Content.hyphenate();
        VOID_Content.pangu();
        VOID_Content.bigfoot();


        // 重载表情
        if ($('.OwO').length > 0) {
            new OwO({
                logo: 'OωO',
                container: document.getElementsByClassName('OwO')[0],
                target: document.getElementsByClassName('input-area')[0],
                api: '/usr/themes/VOID/assets/libs/owo/OwO_03.json',
                position: 'down',
                width: '400px',
                maxHeight: '250px'
            });
        }
        
    },

    endPjax: function () {
        if ($('.TOC').length < 1) {	
            TOC.close();
        }
    },

    alert: function (content, time) {
        var errTemplate = '<div class="msg" id="msg{id}">{Text}</div>';
        var id = new Date().getTime();
        $('body').prepend(errTemplate.replace('{Text}', content).replace('{id}', id));
        $.each($('.msg'), function (i, item) {
            if ($(item).attr('id') != 'msg' + id) {
                $(item).css('top', $(item).offset().top - $(document).scrollTop() + $('.msg#msg' + id).outerHeight() + 20 + 'px');
            }
        });
        $('.msg#msg' + id).addClass('show');
        var t = time;
        if (typeof (t) != 'number') {
            t = 2500;
        }
        setTimeout(function () {
            $('.msg#msg' + id).addClass('hide');
            setTimeout(function () {
                $('.msg#msg' + id).remove();
            }, 1000);
        }, t);
    },

    startSearch: function (item) {
        var el = (typeof item === 'string') ? $(item) : $(item);
        var c = el.val();
        el.val('');
        el.blur();
        if (!c || c === '') {
            el.attr('placeholder', '你还没有输入任何信息');
            return;
        }
        window.location.href = VOIDConfig.searchBase + encodeURIComponent(c);
    },

    enterSearch: function (e, item) {
        var ev = e || window.event;
        if (ev && (ev.keyCode === 13 || ev.which === 13)) {
            VOID.startSearch(item);
        }
    }
};

var VOID_Vote = {
    vote: function (item) {
        var type = $(item).attr('data-type');
        var id = $(item).attr('data-item-id');
        var table = $(item).attr('data-table');

        var cookieName = 'void_vote_' + table + '_' + type;
        var voted = VOID_Util.getCookie(cookieName);
        if (voted == null) voted = ',';

        // 首先检查本地 cookie
        if (voted.indexOf(',' + id + ',') != -1) {
            $(item).addClass('done');
            VOID.alert('您已经投过票了~');
            return;
        }

        // 当是评论投票时检查是否已经投过另一个选项
        if ($(item).hasClass('comment-vote')) {
            var type_2 = '';
            if (type == 'up') type_2 = 'down';
            else type_2 = 'up';
            if (VOID_Vote.checkVoted(type_2, id, table)) {
                VOID.alert('暂不支持更改投票哦～');
                return;
            }
        }

        // VOID 增强插件：文章点赞与评论赞踩，按 IP 去重并记录互动明细
        var subjectType = table === 'content' ? 'post' : 'comment';

        fetch('/apis/api.void.halo.run/v1alpha1/votes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                subjectType: subjectType,
                subjectName: id,
                action: type === 'down' ? 'down' : 'up',
                title: document.title,
                url: window.location.href
            })
        }).then(function (res) {
            return res.ok ? res.json() : null;
        }).then(function (data) {
            if (!data) {
                VOID.alert('投票失败 o(╥﹏╥)o，请稍后重试');
                return;
            }
            switch (data.code) {
            case 200:
                $(item).addClass('done');
                voted += id + ',';
                VOID_Util.setCookie(cookieName, voted, 3600 * 24 * 90);
                $(item).find('.value').text(type === 'down' ? data.down : data.up);
                // 同时写入 Halo 内核的点赞计数，保持服务端渲染的数字与插件记录一致
                if (subjectType === 'post') {
                    fetch('/apis/api.halo.run/v1alpha1/trackers/upvote', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            group: 'content.halo.run',
                            plural: 'posts',
                            name: id
                        })
                    }).catch(function () { /* 忽略 */ });
                }
                break;
            case 302:
                $(item).addClass('done');
                VOID.alert('您好像已经投过票了呢～');
                break;
            case 403:
                VOID.alert('暂不支持更改投票哦～');
                break;
            default:
                VOID.alert('投票失败 o(╥﹏╥)o，请稍后重试');
                break;
            }
        }).catch(function () {
            VOID.alert('投票失败 o(╥﹏╥)o，请稍后重试');
        });
    },

    checkVoted: function (type, id, table) {
        var cookieName = 'void_vote_' + table + '_' + type;
        var voted = VOID_Util.getCookie(cookieName);
        if (voted == null) voted = ',';
        return voted.indexOf(',' + id + ',') != -1;
    },

    reload: function () {
        // 高亮已记录的
        var ids = [];
        $.each($('.vote-button'), function (i, item) {
            var type = $(item).attr('data-type');
            var id = $(item).attr('data-item-id');
            var table = $(item).attr('data-table');

            if (VOID_Vote.checkVoted(type, id, table)) {
                $(item).addClass('done');
            }
            if (table === 'content' && id) {
                ids.push(id);
            }
        });

        // 用插件接口回填真实计数
        if (!ids.length) return;
        fetch('/apis/api.void.halo.run/v1alpha1/vote-stats?subjectType=post&names='
            + encodeURIComponent(ids.join(',')))
            .then(function (res) { return res.ok ? res.json() : null; })
            .then(function (data) {
                if (!data || !data.items) return;
                var counts = {};
                data.items.forEach(function (entry) { counts[entry.name] = entry; });
                $('.vote-button').each(function (i, item) {
                    var id = $(item).attr('data-item-id');
                    if ($(item).attr('data-table') !== 'content' || !counts[id]) return;
                    $(item).find('.value').text(counts[id].up);
                });
            })
            .catch(function () { /* 插件未启用时静默降级 */ });
    },

    toggleFoldComment: function (coid, item) {
        var sel = '#comment-'+String(coid);
        $(sel).toggleClass('fold');
        if ($(sel).hasClass('fold')) {
            $(item).text('点击展开');
        } else {
            $(item).text('还是叠上吧');
        }
    },
};

var Share = {
    parseItem: function (item) {
        var wrap = $(item).parent();
        return {
            url: wrap.attr('data-url') || location.href,
            title: wrap.attr('data-title') || document.title,
            excerpt: wrap.attr('data-excerpt') || '',
            img: wrap.attr('data-img') || '',
            twitter: wrap.attr('data-twitter') || '',
            weibo: wrap.attr('data-weibo') || '',
        };
    },

    // 居中弹窗，避免整页跳走
    popup: function (url) {
        var w = 640, h = 560;
        var left = (screen.width - w) / 2;
        var top = (screen.height - h) / 2;
        var win = window.open(url, 'void-share',
            'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top +
            ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes');
        if (win && win.focus) win.focus();
        return win;
    },

    share: function (item, type) {
        var content = Share.parseItem(item);
        var url = encodeURIComponent(content.url);
        var title = content.title;
        var text = '分享《' + title + '》' + (content.excerpt ? '\n\n' + content.excerpt : '');

        if (type === 'wechat') {
            Share.qrcode(content.url, title);
            return;
        }
        if (type === 'copy') {
            Share.copy(content.url);
            return;
        }

        var links = {
            // X（原 Twitter）：x.com/intent/post，text 里带 @ 账号
            x: 'https://x.com/intent/post?text=' +
                encodeURIComponent(text + (content.twitter ? ' @' + content.twitter : '')) +
                '&url=' + url,
            weibo: 'https://service.weibo.com/share/share.php?title=' +
                encodeURIComponent(text + (content.weibo ? ' @' + content.weibo : '')) +
                '&url=' + url +
                (content.img ? '&pic=' + encodeURIComponent(content.img) : '') +
                '&searchPic=false&style=simple',
            qq: 'https://connect.qq.com/widget/shareqq/index.html?url=' + url +
                '&title=' + encodeURIComponent(title) +
                '&summary=' + encodeURIComponent(content.excerpt || '') +
                '&source=' + encodeURIComponent(document.title) +
                (content.img ? '&pics=' + encodeURIComponent(content.img) : ''),
        };

        if (links[type]) Share.popup(links[type]);
    },

    // 微信没有网页分享接口，用二维码
    qrcode: function (url, title) {
        Share.style();
        Share.ensureQR(function (ok) {
            var mask = document.createElement('div');
            mask.className = 'void-qr-mask';

            var box = document.createElement('div');
            box.className = 'void-qr-box';
            box.setAttribute('role', 'dialog');
            box.setAttribute('aria-label', '微信扫码分享');

            var heading = document.createElement('div');
            heading.className = 'void-qr-title';
            heading.textContent = title;
            box.appendChild(heading);

            var holder = document.createElement('div');
            holder.className = 'void-qr-code';
            box.appendChild(holder);

            if (ok && window.QRCode) {
                new QRCode(holder, {
                    text: url,
                    width: 200,
                    height: 200,
                    correctLevel: QRCode.CorrectLevel.M,
                });
            } else {
                var fallback = document.createElement('p');
                fallback.className = 'void-qr-fallback';
                fallback.textContent = '二维码生成失败，请直接复制链接：' + url;
                holder.appendChild(fallback);
            }

            var tip = document.createElement('p');
            tip.className = 'void-qr-tip';
            tip.textContent = ok ? '打开微信「扫一扫」，扫描上方二维码' : '';
            if (ok) box.appendChild(tip);

            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'void-qr-close';
            close.setAttribute('aria-label', '关闭');
            close.innerHTML = '&times;';
            box.appendChild(close);

            mask.appendChild(box);
            document.body.appendChild(mask);

            function hide() {
                if (mask.parentNode) mask.parentNode.removeChild(mask);
                document.removeEventListener('keydown', onKey);
            }
            function onKey(e) {
                if (e.key === 'Escape' || e.keyCode === 27) hide();
            }
            close.addEventListener('click', hide);
            mask.addEventListener('click', function (e) {
                if (e.target === mask) hide();
            });
            document.addEventListener('keydown', onKey);
        });
    },

    // 首次点微信时才加载二维码库
    ensureQR: function (callback) {
        if (window.QRCode) {
            callback(true);
            return;
        }
        var current = document.querySelector('script[src*="VOID.js"]');
        var base = current ? current.src.replace(/VOID\.js.*$/, '') : '/themes/theme-void/assets/js/';
        var script = document.createElement('script');
        script.src = base + 'qrcode.min.js';
        script.onload = function () { callback(!!window.QRCode); };
        script.onerror = function () { callback(false); };
        document.head.appendChild(script);
    },

    copy: function (url) {
        function done() { VOID.alert('链接已复制'); }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(done, function () {
                Share.fallbackCopy(url, done);
            });
        } else {
            Share.fallbackCopy(url, done);
        }
    },

    fallbackCopy: function (text, done) {
        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.top = '-9999px';
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
            done();
        } catch (e) {
            VOID.alert('复制失败，请手动复制：' + text);
        }
        document.body.removeChild(area);
    },

    style: function () {
        if (document.getElementById('void-qr-style')) return;
        var css = [
            '.void-qr-mask{position:fixed;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px}',
            '.void-qr-box{position:relative;background:#fff;border-radius:6px;padding:24px 24px 14px;text-align:center;width:100%;max-width:320px;box-shadow:0 10px 40px rgba(0,0,0,.25)}',
            '.theme-dark .void-qr-box{background:#1f1f1f;color:#ddd}',
            '.void-qr-title{font-size:.95rem;font-weight:700;line-height:1.5;margin-bottom:14px;word-break:break-word}',
            '.void-qr-code{display:flex;justify-content:center;align-items:center;min-height:200px;background:#fff;padding:6px;border-radius:4px}',
            '.void-qr-code img,.void-qr-code canvas{display:block;max-width:100%}',
            '.void-qr-tip{font-size:.8rem;color:#888;margin:12px 0 0}',
            '.void-qr-fallback{font-size:.75rem;color:#666;word-break:break-all;padding:10px;margin:0}',
            '.void-qr-close{position:absolute;top:4px;right:8px;border:none;background:none;font-size:1.5rem;line-height:1;cursor:pointer;color:#999;padding:0}',
            '.void-qr-close:hover{color:#333}',
        ].join('');
        var style = document.createElement('style');
        style.id = 'void-qr-style';
        style.textContent = css;
        document.head.appendChild(style);
    },
};

var AjaxComment = {
    noName: '必须填写用户名',
    noMail: '必须填写电子邮箱地址',
    noUrl: '必须填写 URL',
    noContent: '必须填写评论内容',
    invalidMail: '邮箱地址不合法',
    commentsOrder: 'DESC',
    commentList: '.comment-list',
    comments: '#comments .comments-title',
    commentReply: '.comment-reply',
    commentForm: '#comment-form',
    respond: '.respond',
    textarea: '#textarea',
    submitBtn: '#comment-submit-button',
    newID: '',
    parentID: '',

    bindClick: function () {
        $(AjaxComment.commentReply + ' a, #cancel-comment-reply-link').unbind('click');
        $(AjaxComment.commentReply + ' a').click(function () { // 回复
            AjaxComment.parentID = $(this).parent().parent().parent().attr('id');
            $(AjaxComment.textarea).focus();
        });
        $('#cancel-comment-reply-link').click(function () { // 取消
            AjaxComment.parentID = '';
        });
    },

    err: function () {
        $(AjaxComment.submitBtn).attr('disabled', false);
        AjaxComment.newID = '';
    },

    finish: function () {
        TypechoComment.cancelReply();
        $(AjaxComment.submitBtn).html('提交评论');
        $(AjaxComment.textarea).val('');
        $(AjaxComment.submitBtn).attr('disabled', false);
        if ($('#comment-' + AjaxComment.newID).length > 0) {
            VOID_SmoothScroller.scrollTo($('#comment-' + AjaxComment.newID).offset().top, -60);
            $('#comment-' + AjaxComment.newID).fadeTo(500, 1);
        }
        $('.comment-num .num').html(parseInt($('.comment-num .num').html()) + 1);
        AjaxComment.bindClick();
        VOID_Content.highlight();
    },

    init: function () {
        AjaxComment.bindClick();
        $(AjaxComment.commentForm).submit(function () { // 提交事件
            $(AjaxComment.submitBtn).attr('disabled', true);

            /* 检查 */
            if ($(AjaxComment.commentForm).find('#author')[0]) {
                if ($(AjaxComment.commentForm).find('#author').val() == '') {
                    VOID.alert(AjaxComment.noName);
                    AjaxComment.err();
                    return false;
                }

                if (typeof $(AjaxComment.commentForm).find('#mail').attr('required') != 'undefined') {
                    // 需要邮箱
                    if ($(AjaxComment.commentForm).find('#mail').val() == '') {
                        VOID.alert(AjaxComment.noMail);
                        AjaxComment.err();
                        return false;
                    }
                }

                if ($(AjaxComment.commentForm).find('#mail').val() != '') {
                    var filter = /^[^@\s<&>]+@([a-z0-9]+\.)+[a-z]{2,4}$/i;
                    if (!filter.test($(AjaxComment.commentForm).find('#mail').val())) {
                        VOID.alert(AjaxComment.invalidMail);
                        AjaxComment.err();
                        return false;
                    }
                }

                if ($(AjaxComment.commentForm).find('#url').val() == '' 
                    && typeof $(AjaxComment.commentForm).find('#url').attr('required') != 'undefined') {
                    VOID.alert(AjaxComment.noUrl);
                    AjaxComment.err();
                    return false;
                }
            }

            var textValue = $(AjaxComment.commentForm).find(AjaxComment.textarea).val().replace(/(^\s*)|(\s*$)/g, '');//检查空格信息
            if (textValue == null || textValue == '') {
                VOID.alert(AjaxComment.noContent);
                AjaxComment.err();
                return false;
            }
            $(AjaxComment.submitBtn).html('提交中');
            $.ajax({
                url: $(AjaxComment.commentForm).attr('action'),
                type: $(AjaxComment.commentForm).attr('method'),
                data: $(AjaxComment.commentForm).serializeArray(),
                error: function () {
                    VOID.alert('提交失败！请重试。');
                    $(AjaxComment.submitBtn).html('提交评论');
                    AjaxComment.err();
                    return false;
                },
                success: function (data) { //成功取到数据
                    try {
                        if (!$(AjaxComment.commentList, data).length) {
                            var msg = '提交失败！请重试。' + $($(data)[7]).text();
                            VOID.alert(msg);
                            $(AjaxComment.submitBtn).html('提交评论');
                            AjaxComment.err();
                            return false;
                        } else {
                            AjaxComment.newID = $(AjaxComment.commentList, data).html().match(/id="?comment-\d+/g).join().match(/\d+/g).sort(function (a, b) {
                                return a - b;
                            }).pop();

                            if ($('.pager .prev').length && AjaxComment.parentID == '') {
                                // 在分页对文章发表评论，无法取得最新评论内容
                                VOID.alert('评论成功！请回到评论第一页查看。');
                                AjaxComment.newID = '';
                                AjaxComment.parentID = '';
                                AjaxComment.finish();
                                return false;
                            }

                            var newCommentType = AjaxComment.parentID == '' ? 'comment-parent' : 'comment-child';
                            var newCommentData = '<div id="comment-' + AjaxComment.newID + '" style="opacity:0" class="comment-body ' + newCommentType + '">' + $(data).find('#comment-' + AjaxComment.newID).html() + '</div>';

                            // 当页面无评论，先添加一个评论容器
                            if ($(AjaxComment.commentList).length <= 0) {
                                $('#comments').append('<h3 class="comment-separator"><div class="comment-tab-current"><span class="comment-num">已有 <span class="num">0</span> 条评论</span></div></h3>')
                                    .append('<div class="comment-list"></div>');
                            }

                            if (AjaxComment.parentID == '') {
                                // 无父 id，直接对文章评论，插入到第一个 comment-list 头部
                                $('#comments>.comment-list').prepend(newCommentData);
                                VOID.alert('评论成功！');
                                AjaxComment.finish();
                                AjaxComment.newID = '';
                                return false;
                            } else {
                                if ($('#' + AjaxComment.parentID).hasClass('comment-parent')) {
                                    // 父评论是母评论
                                    if ($('#' + AjaxComment.parentID + ' > .comment-children').length > 0) {
                                        // 父评论已有子评论，插入到子评论列表头部
                                        $('#' + AjaxComment.parentID + ' > .comment-children > .comment-list').prepend(newCommentData);
                                    }
                                    else {
                                        // 父评论没有子评论，新建一层包裹
                                        newCommentData = '<div class="comment-children"><div class="comment-list">' + newCommentData + '</div></div>';
                                        $('#' + AjaxComment.parentID).append(newCommentData);
                                    }
                                } else {
                                    // 父评论是子评论，与父评论平级，并放在后面
                                    $('#' + AjaxComment.parentID).after(newCommentData);
                                }
                                VOID.alert('评论成功！');
                                AjaxComment.finish();
                                AjaxComment.parentID = '';
                                AjaxComment.newID = '';
                                return false;
                            }
                        }
                    } catch (e) {
                        window.location.reload();
                    }
                } // end success()
            }); // end ajax()
            return false;
        }); // end submit()
    }
};

(function () {
    $(document).ready(function () {
        VOID.init();
        if (VOIDConfig.PJAX) {
            $(document).on('pjax:send', function () {
                VOID.beforePjax();
            });
    
            $(document).on('pjax:complete', function () {
                VOID.afterPjax();
            });
    
            $(document).on('pjax:end', function () {	
                VOID.endPjax();
            });
        }
    });

    window.setInterval(function () {
        var times = new Date().getTime() - Date.parse(VOIDConfig.buildTime);
        times = Math.floor(times / 1000); // convert total milliseconds into total seconds
        var days = Math.floor(times / (60 * 60 * 24)); //separate days
        times %= 60 * 60 * 24; //subtract entire days
        var hours = Math.floor(times / (60 * 60)); //separate hours
        times %= 60 * 60; //subtract entire hours
        var minutes = Math.floor(times / 60); //separate minutes
        times %= 60; //subtract entire minutes
        var seconds = Math.floor(times / 1); // remainder is seconds
        $('#uptime').html(days + ' 天 ' + hours + ' 小时 ' + minutes + ' 分 ' + seconds + ' 秒 ');
    }, 1000);
})();