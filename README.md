# 💬 概述

一款简洁高效的在线工具箱，使用 Golang + Astro + React + shadcn/ui

- [x] JSON 在线解析及格式化验证
- [x] Base64 / URL 编解码
- [x] Crontab 时间计算
- [ ] RGB 颜色值转换

## 🚀 本地运行

```shell
# 安装 bun
brew install oven-sh/bun/bun

# 前端打包
cd web && bun install && bun run build && cd -

# 运行
go run cmd/main.go
```