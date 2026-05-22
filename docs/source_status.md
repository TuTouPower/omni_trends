# 数据源状态报告

> 更新时间：2026-05-22

## 正常工作（75 个源）

以下源在 2 小时内成功更新：

| 源 ID | 数据量 | 说明 |
|--------|--------|------|
| 36kr-quick | 3.2KB | 36氪快讯 |
| acfun | 9.9KB | AcFun |
| apnews | 9.5KB | AP News |
| baidu | 13.8KB | 百度热搜 |
| bilibili-hot-search | 7.6KB | 哔哩哔哩热搜 |
| bilibili-hot-video | 6.0KB | 哔哩哔哩热门视频 |
| bilibili-ranking | 10.1KB | 哔哩哔哩排行榜 |
| cankaoxiaoxi | 5.7KB | 参考消息 |
| chongbuluo-hot | 4.7KB | 虫部落最热 |
| cls-telegraph | 4.4KB | 财联社电报 |
| cls-depth | 3.6KB | 财联社深度 |
| cls-hot | 1.3KB | 财联社热门 |
| coolapk | 3.2KB | 酷安 |
| csdn | 5.0KB | CSDN |
| dgtle | 6.2KB | 数字尾巴 |
| douban | 3.6KB | 豆瓣热门电影 |
| douyin | 2.5KB | 抖音 |
| freebuf | 4.1KB | Freebuf 网络安全 |
| geekpark | 4.4KB | 极客公园 |
| gelonghui | 2.5KB | 格隆汇 |
| ghxi | 4.7KB | 果核剥壳 |
| github-trending-today | 5.2KB | Github Trending |
| guokr | 5.0KB | 果壳 |
| hellogithub | 5.5KB | HelloGitHub |
| history | 3.4KB | 历史今天 |
| hupu | 2.9KB | 虎扑 |
| huxiu | 10.2KB | 虎嗅 |
| ifanr | 4.8KB | 爱范儿 |
| ifeng | 1.6KB | 凤凰网 |
| iqiyi-hot-ranklist | 8.1KB | 爱奇艺热播榜 |
| ithome | 5.3KB | IT之家 |
| jin10 | 8.3KB | 金十数据 |
| juejin | 3.7KB | 稀土掘金 |
| kaopu | 9.7KB | 靠谱新闻 |
| kuaishou | 7.9KB | 快手 |
| lol | 5.5KB | 英雄联盟 |
| miyoushe (原神) | 2.9KB | 米游社原神 |
| netease-music | 5.9KB | 网易云音乐 |
| netease-news | 4.4KB | 网易新闻 |
| newsmth | 4.5KB | 水木社区 |
| ngabbs | 4.2KB | NGA |
| nhk | 1.6KB | NHK World |
| nowcoder | 2.7KB | 牛客 |
| pcbeta-windows11 | 4.0KB | 远景论坛 Win11 |
| producthunt | 5.8KB | Product Hunt |
| qq-news | 11.8KB | 腾讯新闻 |
| qqvideo-tv-hotsearch | 4.5KB | 腾讯视频热搜榜 |
| sina | 7.2KB | 新浪 |
| solidot | 2.7KB | Solidot |
| sputniknewscn | 3.2KB | 卫星通讯社 |
| sspai | 2.5KB | 少数派 |
| tencent-hot | 3.6KB | 腾讯新闻综合早报 |
| thepaper | 3.6KB | 澎湃新闻 |
| tieba | 6.8KB | 百度贴吧 |
| toutiao | 6.4KB | 今日头条 |
| wallstreetcn-quick | 4.3KB | 华尔街见闻快讯 |
| wallstreetcn-news | 4.1KB | 华尔街见闻最新 |
| wallstreetcn-hot | 1.1KB | 华尔街见闻最热 |
| washingtonpost | 8.2KB | 华盛顿邮报 |
| weatheralarm | 5.3KB | 天气预警 |
| weibo | 12.7KB | 微博 |
| weread | 10.7KB | 微信读书 |
| wsj | 9.7KB | 华尔街日报 |
| xiaohongshu | 4.5KB | 小红书 |
| xueqiu-hotstock | 2.9KB | 雪球热门股票 |
| zhihu | 8.7KB | 知乎 |

### 数据偏少但正常

| 源 ID | 条数 | 说明 |
|--------|------|------|
| zhihu-daily | 4 条 | 知乎日报（每日更新少量） |
| jianshu | 2 条 | 简书（SSR 只渲染少量，已标记 disable） |

## 不可用 — 需要代理（14 个源）

这些源因网络原因无法从服务端访问，需配置 `HTTPS_PROXY` 环境变量：

| 源 ID | 名称 | 上次成功 | 原因 |
|--------|------|----------|------|
| hackernews | Hacker News | 800h+ | 被墙 |
| reddit-hot | Reddit Hot | 800h+ | 被墙 |
| reddit-worldnews | Reddit World News | 800h+ | 被墙 |
| youtube | YouTube | 800h+ | 被墙 |
| steam | Steam | 800h+ | 连接超时 |
| aljazeera | 半岛电视台 | 800h+ | 连接超时 |
| bbc | BBC News | 800h+ | 连接超时 |
| guardian | 卫报 | 800h+ | 连接超时 |
| economist | 经济学人 | 800h+ | 连接超时 |
| hostloc | 全球主机交流 | 800h+ | 连接超时 |
| huggingface | Huggingface Papers | 800h+ | 连接超时 |
| v2ex-share | V2EX | 800h+ | API 限流 + 需代理 |
| nytimes-china | 纽约时报中文 | 800h+ | 被墙 |
| nytimes-global | 纽约时报国际 | 800h+ | 被墙 |

## 不可用 — API/网站变更（8 个源）

这些源因上游接口变更导致无法抓取：

| 源 ID | 名称 | 上次成功 | 原因 |
|--------|------|----------|------|
| 52pojie | 吾爱破解 | 800h+ | 页面结构变更或反爬 |
| miyoushe-genshin | 米游社原神 | 800h+ | API 变更（主 miyoushe 正常） |
| miyoushe-honkai | 米游社崩坏3 | 800h+ | API 变更 |
| miyoushe-starrail | 米游社星穹铁道 | 800h+ | API 变更 |
| nodeseek | NodeSeek | 800h+ | 反爬/需登录 |
| oschina | 开源中国 | 800h+ | 页面结构变更 |
| segmentfault | SegmentFault | 800h+ | 页面结构变更 |
| stcn | 证券时报 | 800h+ | Google News RSS 失效 |
| techflowpost | 深潮 TechFlow | 800h+ | Google News RSS 失效 |
| zaobao | 联合早报 | 800h+ | 网站改版 |
| chongbuluo-latest | 虫部落最新 | 800h+ | 页面结构变更 |

## 已禁用（5 个源）

在 `shared/pre-sources.ts` 中标记 `disable: true`，不会尝试抓取：

| 源 ID | 名称 | 禁用原因 |
|--------|------|----------|
| fastbull | 法布财经 | 网站改版为纯 SPA，无公开 API |
| mktnews | MKTNews | API 返回 403 |
| jianshu | 简书 | SSR 只渲染极少内容，无可用 API |
| smzdm | 什么值得买 | JS challenge 反爬 |
| linuxdo | LINUX DO | 被墙 |

## 修复建议

### 优先级高（配代理即可恢复）

配置 `HTTPS_PROXY` 环境变量后，以下 14 个源预计可直接恢复：
hackernews, reddit, youtube, steam, aljazeera, bbc, guardian, economist, hostloc, huggingface, v2ex, nytimes

### 优先级中（需排查具体原因）

| 源 | 可能方案 |
|----|----------|
| 52pojie | 检查页面结构，更新 cheerio 选择器 |
| miyoushe 子源 | 检查 API 端点是否变更 |
| nodeseek | 尝试模拟浏览器 headers 或找 RSS |
| oschina | 检查页面结构或找 RSS feed |
| segmentfault | 检查页面结构或找 API |
| stcn | 换用直接 RSS 或网站 API |
| techflowpost | 换用网站 RSS 或 API |
| zaobao | 检查新版网站结构 |

### 优先级低（投入产出比低）

fastbull, mktnews, jianshu, smzdm — 需 headless browser 或无公开接口，建议保持禁用。
