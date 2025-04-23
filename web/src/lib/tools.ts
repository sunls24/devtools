interface ToolItem {
  name: string
  image: string
  route: string
}

interface ToolCategory {
  name: string
  list: ToolItem[]
}

export const tools: ToolCategory[] = [
  {
    name: "常用工具",
    list: [
      {
        name: "JSON 格式化",
        image: "img/json-tree-viewer.svg",
        route: "json",
      },
      {
        name: "Crontab 时间计算",
        image: "img/letter-counter.svg",
        route: "crontab",
      },
      {
        name: "Base64 编解码",
        image: "img/base64-encoder-decoder.svg",
        route: "base64",
      },
      {
        name: "URL 编解码",
        image: "img/url-encoder-decoder.svg",
        route: "url",
      },
    ],
  },
] as const
