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
