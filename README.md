# VOID for Halo

[Typecho-Theme-VOID](https://github.com/AlanDecode/Typecho-Theme-VOID) 的 Halo 2 移植版。

移植者：awking。原主题作者：熊猫小A（https://blog.imalan.cn）。

移植说明（含功能清单、设置项、与原版的差异）：https://blog.sanmizu.com/archives/halo-theme-void

## 特性

- 首页双栏瀑布流（Masonry）文章卡片，可切换为单栏
- 沉浸式头图：支持首页头图、文章主图、模糊头图、作为标题背景
- 深色模式：跟随系统 / 手动切换 / 按时间段自动切换
- 文章目录（tocbot）、代码高亮（Prism）、字数统计、阅读进度
- 分享：X（原 Twitter）、微博、QQ、微信扫码、复制链接
- 文章点赞（ENJOY）：配合 `plugin-void` 插件记录明细，同时写 Halo 内核 upvote 计数；可在主题设置中关闭
- 正文字数统计（中文按字、英文按词）
- 归档页（按年份 + 标签云）、分类页、标签页、作者页
- 站内搜索（基于公开 API 的前端检索）
- 设置面板：字号调节、衬线/非衬线切换、深色模式
- 移动端适配：抽屉式导航、单栏列表

## 安装

在 Halo 后台「主题 → 安装主题」上传 `theme-void.zip`，或把主题目录放到 `~/.halo2/themes/theme-void` 后重启。

安装后在「主题 → 设置」中填写站点名、头图等。

## 主题设置

| 分组 | 说明 |
| --- | --- |
| 基础设置 | 左上角站点名、首页/归档头图、首页布局（瀑布流/单栏）、配色方案、页脚文字 |
| 内容设置 | 正文字号、衬线字体、代码块样式、行号、懒加载、数学公式、评论提示 |
| 高级设置 | 头图高度（vh）、导航栏模式、品牌字体、Service Worker、自定义 CSS/JS |
| SEO | 元数据、结构化数据 |

### 代码块

「内容设置」里有三个开关，分别控制：

| 开关 | 实现方式 |
| --- | --- |
| 代码使用 Fira Code 字体 | 从 Google Fonts 加载，`body.firaCode` 类驱动 `.yue` 下的 `pre`/`code`/`tt`/`kbd`/`samp` |
| Mac 风格代码块 | `body.macStyleCodeBlock`，给 `pre` 加 32px 顶部留白 + 红黄绿圆点 + 语言名标题栏 |
| 代码块行号 | `body.line-numbers`，由主题内置的 Prism `line-numbers` 插件生成 |

三者都依赖**主题自己渲染代码块**（Prism 客户端高亮）。如果装了 `shiki` 之类的服务端高亮插件并开启了「主题侧渲染」，代码块会被它接管（渲染进自定义元素的 shadow DOM），此时：

- 字体、行号不生效（shadow DOM 内是硬编码字体，外部 CSS 进不去）
- Mac 风格只能显示简化版（主题用背景层画出顶栏与圆点）

要让这三项完全生效，请在插件设置里关闭 shiki 的「启用主题侧渲染」。关闭后主题用 Prism 高亮，带 `language-*` 类的代码块（Markdown 编辑器的 ```cpp 等）正常着色。

## 文章注解（文章编辑页「文章设置」中）

| 字段 | 说明 |
| --- | --- |
| 自定义摘要 | 覆盖自动摘要 |
| 文章主图 | 文章页头图，留空则使用封面 |
| 文章主图样式 | 顶部显示 / 模糊 / 不显示 |
| 首页主图样式 | 标题上方 / 作为标题背景 / 不显示 |
| 文章目录 | 是否显示目录（默认显示） |
| 赞赏二维码 | 文章底部赞赏入口 |

## 自定义模板

- 文章模板 `Landscape`：巨大标题的沉浸式排版
- 页面模板 `归档`：按年份归档 + 标签云

## 扩展语法

以下语法由 `plugin-void` 在服务端解析（`ReactivePostContentHandler`），
在 Markdown 或富文本编辑器里直接写即可，代码块内的同名标记不会被解析。

### 图片排版（可用作相册）

```
[photos]
![](1.jpg)
![](2.jpg)
![](3.jpg)
[/photos]
```

解析为 `.photos` 相册。插件会探测每张图的原始宽高（本地图片读文件头，
远程图片取一次 HTTP 头，结果缓存），据此给 `<figure>` 写 `--ar` 与
`flex-grow`、给 `<a>` 写 `padding-top`，实现原版那种 justified 排版：

- 同一行内图片高度一致、两端对齐，宽度按各自宽高比分配
- 图片多时自动折行，桌面端基准宽度 `--ar × 200px`，移动端 `--ar × 120px`
- 点击任意一张打开 fancybox 灯箱（同组可左右切换），`alt` 作为图注
- 探测失败的图片退回等宽等高裁切，不会破版

普通图片会自动包成 `<figure>` 并带灯箱，无需额外标记。

### 提示块

```
[notice]这里是一段需要强调的内容。[/notice]
```

渲染为 `<p class="notice">`，左侧黄色竖线 + 浅色底。

### 注音

```
{{漢字:かんじ}}
```

渲染为 `<ruby>漢字<rt>かんじ</rt></ruby>`。

### 友链列表

```
[links]
[站点名称](https://example.com)+(https://example.com/avatar.png)
[/links]
```

渲染为卡片网格：上方缩略图、下方站点名，整卡可点击。

### 标题锚点

正文 `h2`–`h6` 会自动补 `id="toc_N"`，主题的目录（tocbot）依赖它跳转。

## 与 Typecho 原版的差异

- PHP 模板逻辑改为 Halo Finder API（`postFinder`、`categoryFinder`、`tagFinder`、`menuFinder`）
- 原配套插件（`VOID-3.5.1/2.配套插件`）已移植为 Halo 插件 `plugin-void`：文章点赞、评论赞踩（按 IP 去重）、访客互动记录
- 浏览量用 Halo 内核 `post.stats.visit`；字数统计改为主题侧 JS 计算
- 评论使用 Halo 官方评论组件；评论赞踩按钮尚未注入到该组件（其 Lit + 多层 shadow DOM 结构），插件接口已就绪
- 原版「图片宽高」（插件在上传时把 `#vwid/#vhei` 拼到图片地址）改为**渲染时探测**：`ImageSizeProbe` 对本地图片读文件头、远程图片取一次 HTTP 头并缓存，效果与原版一致，相册为 justified 排版；探测失败才退回等宽等高裁切
- OwO 表情、文章归档短代码未移植
- 搜索改为前端检索 Halo 公开文章接口（最多取 200 篇）
- 静态资源统一放在 `templates/assets/`（Halo 2.22 的资源路由要求）

## 依赖插件

配合 [plugin-void](https://github.com/AwKings/halo-plugin-void)（VOID 增强）使用效果最佳：

- 未启用插件时：点赞按钮仍显示，但只写 Halo 内核计数，没有互动明细
- 启用插件后：点赞/评论赞踩按 IP 去重，Console 出现「工具 → 访客互动」

## 许可

原主题采用 MIT 协议，版权归原作者 AlanDecode（熊猫小A）所有。本移植版同样以 MIT 发布，保留原始版权声明，见 [LICENSE](LICENSE)。
