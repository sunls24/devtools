import { Button } from "@/components/ui/button.tsx"
import { Textarea } from "@/components/ui/textarea"
import { copyToClipboard } from "@/lib/utils.ts"
import { Clipboard, Package, PackageOpen } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

function Encode({
  encode,
  decode,
}: {
  encode: (str: string) => string
  decode: (str: string) => string
}) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [encoding, setEncoding] = useState(false)

  function convert(encoding: boolean) {
    setEncoding(encoding)
    if (!input) {
      setOutput("")
      return
    }
    try {
      setOutput(encoding ? encode(input) : decode(input))
    } catch (error) {
      setOutput("")
      toast.error(
        encoding ? "编码失败，请检查输入文本" : "解码失败，请检查输入格式",
        {
          description: error instanceof Error ? error.message : String(error),
        }
      )
    }
  }

  function copyClick() {
    if (!output) {
      return
    }
    copyToClipboard(output)
  }

  useEffect(() => {
    if (!encoding) {
      return
    }
    convert(true)
  }, [input])

  return (
    <>
      <Textarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        className="max-h-60 min-h-30 resize-none"
        placeholder="请输入需要编解码的文本"
      />
      <div className="flex items-center gap-3">
        <Button
          variant={encoding ? "default" : "secondary"}
          onClick={() => convert(true)}
        >
          <Package />
          编码
        </Button>
        <Button variant="secondary" onClick={() => convert(false)}>
          <PackageOpen />
          解码
        </Button>
        {output && (
          <Button size="icon" variant="outline" onClick={copyClick}>
            <Clipboard />
          </Button>
        )}
      </div>
      {output && (
        <Textarea
          readOnly
          value={output}
          className="bg-sidebar max-h-60 resize-none"
        />
      )}
    </>
  )
}

export default Encode
