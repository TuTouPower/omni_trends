# TASKS.md

> 代码改进建议。不包含文档修改，只列代码层面需要做的事。

## 测试

- [ ] **补充单元测试** — 当前仅 `server/utils/date.test.ts` 一个测试文件。建议为核心工具函数补充测试：
  - `server/utils/crypto.ts` — 加密/解密逻辑
  - `server/utils/base64.ts` — 编码逻辑
  - `server/utils/source.ts` — defineRSSSource / defineRSSHubSource / proxySource
  - `shared/utils.ts` — relativeTime 等工具函数
- [ ] **补充数据源测试** — 为关键数据源（weibo、zhihu、github 等）编写集成测试，验证抓取逻辑仍有效

## 代码质量

- [ ] **修复 ESLint 报错** — CLAUDE.md 记载 `react-dom/no-children-in-void-dom-elements` 报错，提交时需绕过 lint-staged。应定位并修复
- [ ] **TypeScript strict 模式** — 检查 `tsconfig.base.json` 是否启用了 strict。未启用则应逐步开启，减少隐式 any
- [ ] **数据源错误处理** — 部分数据源 getter 缺少 try/catch，抓取失败时可能抛出未处理异常。应统一错误处理模式

## 架构

- [ ] **数据源超时处理** — CLAUDE.md 记载部分代理源（v2ex、reddit、hackernews）可能超时。可考虑增加重试逻辑或健康检查降级
- [ ] **`pnpm dev` 兼容性** — dev 模式有已知问题，只能 build + run。应排查 vite-plugin-with-nitro 或相关依赖兼容性

## 依赖

- [ ] **dayjs patch** — `package.json` 有 `patchedDependencies: { dayjs }`，检查 patch 是否需要随 dayjs 版本更新
- [ ] **nitropack fork** — 使用 `npm:nitro-go@0.0.3` 作为 nitropack 替代，注意上游更新
