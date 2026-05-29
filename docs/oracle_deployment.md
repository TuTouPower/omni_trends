# Oracle 服务器部署指南

## 服务器信息

| 项目 | 值 |
|------|-----|
| IP | `<SSH_HOST>` （见 `.env.server`） |
| 系统 | Ubuntu 22.04 ARM64 |
| 配置 | 4 OCPU / 24GB RAM / 194GB disk |
| Docker | 29.1.3, Compose v5.1.3 |
| 架构 | aarch64 (ARM64) |

## 网络架构

```
用户浏览器
  ▼
nginx (port 80)
  │ /omni_trends/ → proxy_pass
  ▼
omnitrends 容器 (127.0.0.1:20229)
  │ 内部端口 4444
  ▼
应用服务
```

## 目录结构

```
/opt/omni_trends/
├── docker-compose.yml
├── certs/                  # CA 证书（备用）
└── (容器内) /usr/app/
    └── .data/             # 数据卷
```

## Docker Compose 配置

```yaml
services:
  omnitrends:
    image: ghcr.io/tutoupower/omni_trends:main
    container_name: omnitrends
    restart: unless-stopped
    ports:
      - '127.0.0.1:20229:4444'
    volumes:
      - omnitrends_data:/usr/app/.data
    environment:
      - HOST=0.0.0.0
      - PORT=4444
      - NODE_ENV=production
      - INIT_TABLE=true
      - ENABLE_CACHE=true
      - NODE_TLS_REJECT_UNAUTHORIZED=0
      - PRODUCTHUNT_API_TOKEN=<token>

volumes:
  omnitrends_data:
    name: omnitrends_data
```

**注意：** 端口绑定 `127.0.0.1:20229` 仅本地监听，不直接暴露公网，通过 nginx 反代访问。

## TLS 与 mitmproxy（重要）

### 问题

Oracle 服务器上运行着 **透明 mitmproxy**（`mitmdump --mode transparent --listen-port 8080`），拦截所有出站 HTTPS 流量。导致：

1. Node.js 收到的 TLS 证书由 `mitmproxy` CA 签发，不是真实 CA（如 DigiCert）
2. Node.js 验证失败：`UNABLE_TO_VERIFY_LEAF_SIGNATURE`
3. 所有 HTTPS 数据源（reddit、hackernews 等）全部报 `fetch failed`

### 为什么需要 NODE_TLS_REJECT_UNAUTHORIZED=0

- mitmproxy CA 证书不固定：每次重启 mitmproxy 会重新生成 CA
- 无法预先把 CA 证书加入 Docker 镜像的信任链
- 用 `NODE_EXTRA_CA_CERTS` 挂载 CA 证书也不行，因为磁盘上的证书和代理实际使用的不一致
- 此服务器是个人用途，mitmproxy 本身已在拦截所有流量，禁用 TLS 验证不额外降低安全性

### 踩坑记录

| 尝试 | 结果 | 原因 |
|------|------|------|
| `apk add ca-certificates` | 无效 | Alpine 默认已装 `ca-certificates-bundle`，加装完整包后 `update-ca-certificates` 未正确重建 bundle |
| `NODE_EXTRA_CA_CERTS` 挂载 mitmproxy CA | 无效 | 磁盘上的 CA 证书和代理实际使用的证书不一致（mitmproxy 重启后重新生成） |
| 手动追加 DigiCert 证书到 bundle | 无效 | 真实证书根本没到达 Node.js，中间人代理替换了一切 |
| `NODE_TLS_REJECT_UNAUTHORIZED=0` | **有效** | 直接跳过证书验证 |

### 结论

在有透明 TLS 代理的服务器上，唯一可靠的方案是 `NODE_TLS_REJECT_UNAUTHORIZED=0`。不要浪费时间调 CA 证书。

## Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /usr/src
COPY . .
RUN corepack enable
RUN pnpm install
RUN pnpm run build

FROM node:20-alpine
RUN apk add --no-cache ca-certificates && update-ca-certificates
WORKDIR /usr/app
COPY --from=builder /usr/src/dist/output ./output
ENV HOST=0.0.0.0 PORT=4444 NODE_ENV=production
EXPOSE $PORT
CMD ["node", "output/server/index.mjs"]
```

`ca-certificates` 对无代理环境有用（如直连服务器），但对 Oracle 这种有 mitmproxy 的环境无效。

## Nginx 配置

文件：`/etc/nginx/sites-available/omni_trends`

```nginx
server {
    listen 80;
    server_name _;

    location /omni_trends/ {
        proxy_pass http://127.0.0.1:20229/omni_trends/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 部署方法

### 自动部署（推荐）

在本地运行项目根目录的 `deploy.sh`，自动完成三端部署（Cloudflare + Oracle + 本地）。

SSH 配置从 `.env.server` 读取（`SSH_KEY`、`SSH_USER`、`SSH_HOST`）。

### 手动部署

```bash
ssh -i <SSH_KEY> <SSH_USER>@<SSH_HOST>
cd /opt/omni_trends
sudo docker compose pull
sudo docker compose up -d
```

## 防火墙

Oracle 云服务器使用 nftables，需开放端口：

```bash
sudo nft list ruleset
sudo nft insert rule inet filter input tcp dport 80 accept
```

**注意：** nftables 规则重启后失效，需重新添加或持久化配置。

## 数据卷

数据持久化在 Docker volume `omnitrends_data`，挂载到容器 `/usr/app/.data`。

```bash
sudo docker volume inspect omnitrends_data

# 备份
sudo docker run --rm -v omnitrends_data:/data -v $(pwd):/backup alpine tar czf /backup/omnitrends-data-$(date +%Y%m%d).tar.gz -C /data .
```

## 访问地址

访问地址配置在 `.env.server` 的 `SSH_HOST` 中。

## 相关文件

| 文件 | 说明 |
|------|------|
| `/opt/omni_trends/docker-compose.yml` | Docker Compose 配置 |
| `Dockerfile` | 镜像构建（node:20-alpine + ca-certificates） |
| `deploy.sh` | 本地一键三端部署脚本 |
| `.env.server` | 部署配置（SSH 信息、环境变量） |
