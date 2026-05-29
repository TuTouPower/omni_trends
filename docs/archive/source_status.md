# 数据源状态报告

> 更新时间：2026-05-22

## 正常工作（98 个源）

配置 `HTTPS_PROXY=http://127.0.0.1:7897` 后，所有活跃源均正常工作。

### 国内源

| 源 ID | 说明 |
|--------|------|
| 36kr-quick | 36氪快讯 |
| acfun | AcFun |
| baidu | 百度热搜 |
| bilibili-hot-search | 哔哩哔哩热搜 |
| bilibili-hot-video | 哔哩哔哩热门视频 |
| bilibili-ranking | 哔哩哔哩排行榜 |
| cankaoxiaoxi | 参考消息 |
| chongbuluo-hot | 虫部落最热 |
| cls-telegraph | 财联社电报 |
| cls-depth | 财联社深度 |
| cls-hot | 财联社热门 |
| coolapk | 酷安 |
| csdn | CSDN |
| dgtle | 数字尾巴 |
| douban | 豆瓣热门电影 |
| douyin | 抖音 |
| freebuf | Freebuf 网络安全 |
| gelonghui | 格隆汇 |
| ghxi | 果核剥壳 |
| hupu | 虎扑 |
| huxiu | 虎嗅 |
| ifeng | 凤凰网 |
| iqiyi-hot-ranklist | 爱奇艺热播榜 |
| ithome | IT之家 |
| jin10 | 金十数据 |
| juejin | 稀土掘金 |
| kuaishou | 快手 |
| lol | 英雄联盟 |
| miyoushe (原神) | 米游社原神 |
| miyoushe-genshin | 米游社原神 |
| miyoushe-starrail | 米游社星穹铁道 |
| miyoushe-honkai | 米游社崩坏3 |
| netease-music | 网易云音乐 |
| netease-news | 网易新闻 |
| newsmth | 水木社区 |
| ngabbs | NGA |
| nowcoder | 牛客 |
| pcbeta-windows11 | 远景论坛 Win11 |
| qq-news | 腾讯新闻 |
| qqvideo-tv-hotsearch | 腾讯视频热搜榜 |
| sina | 新浪 |
| sspai | 少数派 |
| tencent-hot | 腾讯新闻综合早报 |
| thepaper | 澎湃新闻 |
| tieba | 百度贴吧 |
| toutiao | 今日头条 |
| wallstreetcn-quick | 华尔街见闻快讯 |
| wallstreetcn-news | 华尔街见闻最新 |
| wallstreetcn-hot | 华尔街见闻最热 |
| weatheralarm | 天气预警 |
| weibo | 微博 |
| weread | 微信读书 |
| xiaohongshu | 小红书 |
| xueqiu-hotstock | 雪球热门股票 |
| zhihu | 知乎 |
| zhihu-daily | 知乎日报 |
| history | 历史今天 |
| kaopu | 靠谱新闻 |
| 52pojie | 吾爱破解 |
| oschina | 开源中国 |
| stcn | 证券时报 |
| techflowpost | 深潮 TechFlow |
| segmentfault | SegmentFault |
| nodeseek | NodeSeek |
| hostloc | 全球主机交流 |

### 国际源（需代理）

| 源 ID | 说明 |
|--------|------|
| hackernews | Hacker News |
| reddit-hot | Reddit Hot |
| reddit-worldnews | Reddit World News |
| youtube | YouTube |
| steam | Steam |
| aljazeera | 半岛电视台 |
| bbc | BBC News |
| guardian | 卫报 |
| economist | 经济学人 |
| huggingface | Huggingface Papers |
| v2ex-share | V2EX |
| nytimes-china | 纽约时报中文 |
| nytimes-global | 纽约时报国际 |
| zaobao | 联合早报 |
| apnews | AP News |
| nhk | NHK World |
| washingtonpost | 华盛顿邮报 |
| wsj | 华尔街日报 |
| producthunt | Product Hunt |
| github-trending-today | Github Trending |
| solidot | Solidot |

### 科技/社区

| 源 ID | 说明 |
|--------|------|
| geekpark | 极客公园 |
| guokr | 果壳 |
| hellogithub | HelloGitHub |
| ifanr | 爱范儿 |
| sputniknewscn | 卫星通讯社 |

## 已禁用（5 个源）

在 `shared/pre-sources.ts` 中标记 `disable: true`，不会尝试抓取：

| 源 ID | 名称 | 禁用原因 |
|--------|------|----------|
| fastbull | 法布财经 | 网站改版为纯 SPA，无公开 API |
| mktnews | MKTNews | API 返回 403 |
| jianshu | 简书 | SSR 只渲染极少内容，无可用 API |
| smzdm | 什么值得买 | JS challenge 反爬 |
| linuxdo | LINUX DO | 被墙且需登录 |

## 代理配置

`.env.server` 中需配置：

```
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
```

WSL mirrored 网络模式下，代理运行在 Windows 宿主机，通过 `127.0.0.1` 端口映射访问。项目使用 `undici ProxyAgent` 自动走代理。

注意：`curl` 在此环境下无法通过代理（SSL error 35），但 Node.js undici 正常工作。

## 修复历史

- **2026-05-22**：在 `.env.server` 添加代理配置，恢复全部 23 个外网/超时源
- **2026-05-22**：修复 freebuf（node:https + RSS）、xiaohongshu（edith API）
- **2026-05-22**：禁用 fastbull、mktnews、jianshu（上游不可用）
