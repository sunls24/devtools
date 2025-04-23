import Encode from "@/components/tsx/Encode"
import { toast } from "sonner"

function EncodeB64() {
  return (
    <Encode
      encode={(str) =>
        btoa(String.fromCharCode(...new TextEncoder().encode(str)))
      }
      decode={(str) => {
        try {
          return new TextDecoder().decode(
            Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
          )
        } catch {
          toast.error("输入文本不符合 Base64 格式")
          return ""
        }
      }}
    ></Encode>
  )
}

export default EncodeB64
