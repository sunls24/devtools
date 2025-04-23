import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { quote } from "@/lib/tools"
import JsonView from "@uiw/react-json-view"
import {
  CodeXml,
  Database,
  DatabaseBackup,
  DatabaseZap,
  FoldVertical,
  UnfoldVertical,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

function invalidJSON(err: any) {
  toast.error("输入文本不符合 JSON 格式", { description: err.message ?? err })
}

const defCollapsed = 1

function TJson() {
  const [input, setInput] = useState("")
  const [jsonObj, setJsonObj] = useState({})
  const [collapsed, setCollapsed] = useState<number | boolean>(defCollapsed)

  function onTextareaChange(value: string) {
    setInput(value)

    value = value.trim()
    if (!value) {
      setJsonObj({})
      return
    }

    try {
      setJsonObj(JSON.parse(value))
    } catch {}
  }

  function onFormatClick() {
    if (!input) {
      return
    }
    try {
      const obj = JSON.parse(input)
      setInput(JSON.stringify(obj, null, 2))
      setJsonObj(obj)
    } catch (err: any) {
      invalidJSON(err)
      setJsonObj({})
    }
  }

  function onCompressClick() {
    if (!input) {
      return
    }
    try {
      setInput(JSON.stringify(JSON.parse(input)))
    } catch (err: any) {
      invalidJSON(err)
    }
  }

  function onCompressEscapeClick() {
    if (!input) {
      return
    }
    let str = input
    try {
      str = JSON.stringify(JSON.parse(str))
    } catch {}
    setInput(JSON.stringify(str).slice(1, -1))
  }

  function onUnescapeClick() {
    if (!input) {
      return
    }

    try {
      const unescaped = JSON.parse(quote(input))
      setInput(unescaped)
      try {
        const obj = JSON.parse(unescaped)
        setJsonObj(obj)
        setInput(JSON.stringify(obj, null, 2))
      } catch {}
    } catch {}
  }

  return (
    <div className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
        <Button onClick={onFormatClick}>
          <CodeXml />
          格式化
        </Button>
        <Button variant="secondary" onClick={onCompressClick}>
          <Database />
          压缩
        </Button>
        <Button variant="secondary" onClick={onCompressEscapeClick}>
          <DatabaseZap />
          压缩并转义
        </Button>
        <Button variant="secondary" onClick={onUnescapeClick}>
          <DatabaseBackup />
          去除转义
        </Button>
        {collapsed ? (
          <Button variant="secondary" onClick={() => setCollapsed(false)}>
            <UnfoldVertical />
            展开
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => setCollapsed(defCollapsed)}
          >
            <FoldVertical />
            收起
          </Button>
        )}
      </div>
      <div className="flex min-h-0 flex-col">
        <Textarea
          wrap="off"
          value={input}
          onChange={(e) => onTextareaChange(e.currentTarget.value)}
          className="max-h-60 min-h-30 resize-none font-mono sm:max-h-none"
          placeholder="请输入 JSON 格式的文本"
        />
      </div>
      <JsonView
        style={{ fontSize: "14px" }}
        collapsed={collapsed}
        displayDataTypes={false}
        className="overflow-auto dark:invert"
        value={jsonObj}
      >
        <JsonView.Quote render={() => <></>} />
      </JsonView>
    </div>
  )
}

export default TJson
