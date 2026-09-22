# 开发者工具箱

基于 Astro + React + shadcn/ui，支持 JSON 格式化、Base64 / URL 编解码、Cron 时间计算与 AI 生成，部署于 Cloudflare Pages。

## 本地开发

需要 Node.js 22.12+ 和 Bun 1.3.14。

```sh
bun install --frozen-lockfile
bun run dev
```

联调 AI 功能：

```sh
bunx wrangler login
bun run dev:pages
```

`dev:pages` 修改前端后需重新运行；AI 调用消耗 Cloudflare 账户额度。

## 检查

在仓库根目录执行：

```sh
bun run check
bun test
bun run build
bunx wrangler pages functions build --outdir .wrangler/functions
```

## Cloudflare Pages 部署

连接 Git 仓库，使用以下配置：

| 配置 | 值 |
| --- | --- |
| 项目名 | `devtools`（与 `wrangler.jsonc` 一致） |
| 根目录 | 仓库根目录（留空） |
| 构建命令 | `bun run build` |
| 输出目录 | `dist` |
| 环境变量 | `NODE_VERSION=22.16.0`、`BUN_VERSION=1.3.14` |

Workers AI 绑定 `AI` 已在 `wrangler.jsonc` 中声明，部署后确认生产和预览环境均生效。请通过 Git 集成或 Wrangler 发布，不能仅上传 `dist`。
