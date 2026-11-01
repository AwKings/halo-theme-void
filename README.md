# VOID for Halo

[Typecho-Theme-VOID](https://github.com/AlanDecode/Typecho-Theme-VOID) 的 Halo 2 移植版。

移植者：awking。原主题作者：熊猫小A（https://blog.imalan.cn）。

移植说明（含功能清单、设置项、与原版的差异）：http://163.192.199.131:8090/archives/halo-theme-void

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

## 与 Typecho 原版的差异

- PHP 模板逻辑改为 Halo Finder API（`postFinder`、`categoryFinder`、`tagFinder`、`menuFinder`）
- 原配套插件（`VOID-3.5.1/2.配套插件`）已移植为 Halo 插件 `plugin-void`：文章点赞、评论赞踩（按 IP 去重）、访客互动记录
- 浏览量用 Halo 内核 `post.stats.visit`；字数统计改为主题侧 JS 计算
- 评论使用 Halo 官方评论组件；评论赞踩按钮尚未注入到该组件（其 Lit + 多层 shadow DOM 结构），插件接口已就绪
- OwO 表情、文章归档短代码未移植
- 搜索改为前端检索 Halo 公开文章接口（最多取 200 篇）
- 静态资源统一放在 `templates/assets/`（Halo 2.22 的资源路由要求）

## 依赖插件

配合 [plugin-void](https://github.com/AlanDecode/Typecho-Theme-VOID)（VOID 增强）使用效果最佳：

- 未启用插件时：点赞按钮仍显示，但只写 Halo 内核计数，没有互动明细
- 启用插件后：点赞/评论赞踩按 IP 去重，Console 出现「工具 → 访客互动」

## 许可

原主题采用 MIT 协议，版权归原作者 AlanDecode（熊猫小A）所有。本移植版同样以 MIT 发布，保留原始版权声明，见 [LICENSE](LICENSE)。
