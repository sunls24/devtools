export interface ToolItem {
  name: string
  image: string
  route: string
}

export interface ToolCategory {
  name: string
  list: ToolItem[]
}

export const tools: ToolCategory[] = [
  {
    name: "常用工具",
    list: [
      {
        name: "JSON 格式化",
        image: "/img/json-tree-viewer.svg",
        route: "/json",
      },
      {
        name: "Base64 编解码",
        image: "/img/base64-encoder-decoder.svg",
        route: "/base64",
      },
      {
        name: "Crontab 时间计算",
        image: "/img/letter-counter.svg",
        route: "/crontab",
      },
      {
        name: "URL 编解码",
        image: "/img/url-encoder-decoder.svg",
        route: "/url",
      },
    ],
  },
] as const

export function getTool(path: string): ToolItem | undefined {
  for (const category of tools) {
    const found = category.list.find((item) => item.route === path)
    if (found) {
      return found
    }
  }
  return undefined
}

export function quote(str: string): string {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str
  }
  return `"${str}"`
}
