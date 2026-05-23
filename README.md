# OmniTrends

![](/public/logo.png)

Real-time trending news aggregator — forked from [NewsNow](https://github.com/ourongxing/newsnow) and extended with more sources, proxy support, and bug fixes.

**Live Demo**: https://omni-trends.pages.dev

[简体中文](README.zh-CN.md) | [Deploy to Cloudflare](docs/cloudflare_deployment.md)

## What's Different

Compared to the original NewsNow:

- **98 data sources** (up from ~40), covering Chinese, international media, tech, and finance
- **Proxy support** — `HTTPS_PROXY` in `.env.server` routes all requests through your local proxy (essential for accessing blocked sites in China)
- **Fixed broken sources** — freebuf (TLS fingerprint bypass via `node:https`), xiaohongshu (edith API), and others
- **Dark/light mode** toggle
- **Cloudflare Tunnel** basePath support (`/omni_trends`)

## Quick Start

```bash
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

## Configuration

Copy `example.env.server` to `.env.server`:

```env
PORT=20193
HTTPS_PROXY=http://127.0.0.1:7897
HTTP_PROXY=http://127.0.0.1:7897
G_CLIENT_ID=
G_CLIENT_SECRET=
JWT_SECRET=
INIT_TABLE=true
ENABLE_CACHE=true
```

Proxy is optional but required for international sources (Reddit, HackerNews, BBC, NYTimes, etc.).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19 + TanStack Router/Query + UnoCSS |
| Backend | Nitro (h3) — Node.js / Cloudflare Workers |
| Database | SQLite (local) / D1 (Cloudflare) |
| HTTP | ofetch + undici ProxyAgent |
| Build | Vite 7 + pnpm |

## Data Sources

See [docs/source_status.md](docs/source_status.md) for the full list of 98 working sources and 5 disabled ones.

## Development

> Requires Node.js >= 20

```bash
corepack enable
pnpm install
pnpm build
PORT=20193 node --env-file=.env.server dist/output/server/index.mjs
```

> `pnpm dev` has known compatibility issues. Use build + run instead.

### Adding Sources

1. Define metadata in `shared/pre-sources.ts`
2. Create getter in `server/sources/{name}.ts`
3. Rebuild and test: `curl http://localhost:20193/omni_trends/api/s?id={name}&latest`

## Acknowledgements

Forked from [NewsNow](https://github.com/ourongxing/newsnow) by [ourongxing](https://github.com/ourongxing). Original project is MIT licensed.

## License

[MIT](./LICENSE)
