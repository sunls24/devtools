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

export async function respData(resp: Response): Promise<any> {
  const res = await resp.json()
  if (!resp.ok) {
    return Promise.reject(`${resp.status} ${res.message}`)
  }
  if (res.code !== 0) {
    return Promise.reject(res.message)
  }
  return res.data
}

export function quote(str: string): string {
  if (str.startsWith('"') && str.endsWith('"')) {
    return str
  }
  return `"${str}"`
}
