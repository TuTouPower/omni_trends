#!/bin/bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 从 .env.server 读取部署配置
set -a
source "$PROJECT_DIR/.env.server"
set +a

SSH_KEY="${SSH_KEY/#\~/$HOME}"
SSH_KEY="${SSH_KEY/#\$HOME/$HOME}"

cd "$PROJECT_DIR"

# ========== [1/4] 构建 Cloudflare + 部署 ==========
echo "========== [1/4] 构建 + 部署 Cloudflare Pages =========="
npx cross-env CF_PAGES=1 pnpm build
npx wrangler pages deploy dist/output/public --branch main --commit-dirty=true 2>&1
echo "[Cloudflare] 完成"

# ========== [2/4] 构建 node-server ==========
echo ""
echo "========== [2/4] 构建 node-server =========="
pnpm build

# ========== [3/4] 推送代码触发 CI 构建镜像 ==========
echo ""
echo "========== [3/4] 推送代码，等待 Docker 镜像构建 =========="
if [ -n "$(git status --porcelain)" ]; then
  echo "有未提交的更改，先提交"
  git add -A
  git commit -m "chore: deploy $(date +%Y%m%d-%H%M%S)"
fi
git push

COMMIT_SHA=$(git rev-parse HEAD)
echo "等待 CI 构建 (commit ${COMMIT_SHA:0:7})..."

# 等 CI run 出现（最多 30s）
RUN_ID=""
for i in $(seq 1 6); do
  RUN_ID=$(gh run list --limit 5 --json databaseId,headSha --jq ".[] | select(.headSha==\"$COMMIT_SHA\") | .databaseId")
  if [ -n "$RUN_ID" ]; then break; fi
  sleep 5
done

if [ -z "$RUN_ID" ]; then
  echo "未找到 CI run，回退到最新 run"
  RUN_ID=$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')
fi

gh run watch "$RUN_ID" 2>&1 | tail -3

# 检查 job conclusion（忽略 post-step 噪声）
JOB_CONCLUSION=$(gh run view "$RUN_ID" --json jobs --jq '.jobs[0].conclusion')
if [ "$JOB_CONCLUSION" != "success" ]; then
  echo "[CI] 镜像构建失败 (job: $JOB_CONCLUSION)"
  exit 1
fi
echo "[CI] 镜像构建完成"

# ========== [4/4] Oracle + 本地同时部署 ==========
echo ""
echo "========== [4/4] 部署 Oracle + 本地 =========="

deploy_oracle() {
  echo "[Oracle] 部署中..."
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/omni_trends
sudo docker compose pull
sudo docker compose up -d --force-recreate
for i in $(seq 1 15); do
    if curl -sf -o /dev/null http://127.0.0.1:20229/; then
        echo "[Oracle] 启动成功 (${i}s)"
        exit 0
    fi
    sleep 1
done
echo "[Oracle] 超时"
sudo docker compose logs --tail 20
exit 1
REMOTE
}

deploy_local() {
  echo "[本地] 启动中..."
  kill $(lsof -t -i:20193) 2>/dev/null || true
  sleep 1
  nohup node --env-file=.env.server dist/output/server/index.mjs > /tmp/omnitrends-local.log 2>&1 &
  for i in $(seq 1 10); do
    if curl -sf -o /dev/null http://localhost:20193/ 2>/dev/null; then
      echo "[本地] 启动成功 http://localhost:20193/"
      return 0
    fi
    sleep 1
  done
  echo "[本地] 启动超时，日志："
  tail -10 /tmp/omnitrends-local.log
  return 1
}

deploy_oracle &
PID_ORACLE=$!

deploy_local &
PID_LOCAL=$!

FAIL=0
wait $PID_ORACLE || { echo "[Oracle] 失败"; FAIL=1; }
wait $PID_LOCAL || { echo "[本地] 失败"; FAIL=1; }

echo ""
if [ $FAIL -eq 0 ]; then
  echo "========== 三端部署全部完成 =========="
  echo "  Cloudflare: https://omni-trends.pages.dev/"
  echo "  Oracle:     https://trends.zzzkkkccc.site/"
  echo "  本地:       http://localhost:20193/"
else
  echo "========== 部分部署失败 =========="
  exit 1
fi
