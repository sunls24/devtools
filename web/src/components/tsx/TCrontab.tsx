import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { respData } from "@/lib/utils"
import { CronExpressionParser } from "cron-parser"
import { Calculator, Orbit, Timer } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"

function TCrontab() {
  const [input, setInput] = useState("")
  const [list, setList] = useState<string[]>([])

  const [loading, setLoading] = useState(false)

  function onClick(data?: string) {
    const expr = (data ?? input).trim()
    if (!expr) {
      return
    }
    try {
      const cron = CronExpressionParser.parse(expr)
      setList(cron.take(7).map((d) => d.toDate().toLocaleString()))
    } catch (err: any) {
      toast.error("输入文本不符合 Crontab 格式", {
        description: err.message ?? err,
      })
    }
  }

  function onAIClick() {
    const desc = input.trim()
    if (!desc) {
      return
    }
    setLoading(true)
    fetch(`/api/crontab?desc=${desc}`)
      .then(respData)
      .then((data) => {
        setInput(data)
        onClick(data)
      })
      .catch((err) => toast.error(err.message ?? err))
      .finally(() => setLoading(false))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) {
      return
    }
    e.preventDefault()
    onClick()
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={input}
          disabled={loading}
          onKeyDown={onKeyDown}
          className="font-mono"
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Crontab 表达式 / 每两小时执行一次"
        />
        <Button onClick={() => onClick()} disabled={loading}>
          <Calculator />
          计算执行时间
        </Button>
        <Button variant="secondary" onClick={onAIClick} disabled={loading}>
          <Orbit />
          使用 AI 生成
        </Button>
      </div>
      {list.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 font-medium">
            <Timer size={22} />
            接下来 7 次的执行时间：
          </div>
          {list.map((date, index) => (
            <span
              className="bg-secondary rounded-md p-2 font-mono"
              key={index}
            >{`${index + 1} - ${date}`}</span>
          ))}
        </div>
      )}

      <pre className="bg-secondary/70 overflow-x-auto rounded-md p-3">
        {`*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    │
│    │    │    │    │    └─ day of week (0-7, 1L-7L) (0 or 7 is Sun)
│    │    │    │    └────── month (1-12, JAN-DEC)
│    │    │    └─────────── day of month (1-31, L)
│    │    └──────────────── hour (0-23)
│    └───────────────────── minute (0-59)
└────────────────────────── second (0-59, optional)`}
      </pre>
    </>
  )
}

export default TCrontab
