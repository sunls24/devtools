import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { CronExpressionParser } from "cron-parser"
import { Calculator, Timer } from "lucide-react"
import React, { useState } from "react"
import { toast } from "sonner"

function TCrontab() {
  const [input, setInput] = useState("")
  const [list, setList] = useState<string[]>([])

  function onClick() {
    const expr = input.trim()
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
          onKeyDown={onKeyDown}
          className="font-mono"
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="请输入 Crontab 表达式"
        ></Input>
        <Button variant="secondary" onClick={onClick}>
          <Calculator />
          计算执行时间
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
