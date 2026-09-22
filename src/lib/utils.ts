import { type ClassValue, clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(value: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success("已拷贝至剪贴板"))
    .catch((err) => toast.error(err.message ?? err))
}

export async function respData(resp: Response): Promise<string> {
  const res = (await resp.json()) as {
    message: string
    data: string
  }
  if (!resp.ok) {
    throw new Error(res.message)
  }
  return res.data
}

export function quote(str: string): string {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str
  }
  return `"${str}"`
}
