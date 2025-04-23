import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

function TJson() {
  const [input, setInput] = useState("")

  return (
    <div className="flex">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        className="h-30 resize-none"
        placeholder="请输入 JSON 格式的文本"
      />
    </div>
  )
}

export default TJson
