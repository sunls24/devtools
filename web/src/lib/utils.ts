import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { toast } from "sonner"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function copyToClipboard(value: string) {
  navigator.clipboard
    .writeText(value)
    .then(() => toast.success("已拷贝至剪贴板"))
    .catch((e) => toast.error(e.message ?? e))
}
