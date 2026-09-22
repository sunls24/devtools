import Encode from "@/components/tsx/Encode"

function EncodeB64() {
  return (
    <Encode
      encode={(str) => {
        const bytes = new TextEncoder().encode(str)
        const chunks: string[] = []
        const chunkSize = 8192
        for (let offset = 0; offset < bytes.length; offset += chunkSize) {
          chunks.push(
            String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
          )
        }
        return btoa(chunks.join(""))
      }}
      decode={(str) =>
        new TextDecoder().decode(
          Uint8Array.from(atob(str), (c) => c.charCodeAt(0))
        )
      }
    ></Encode>
  )
}

export default EncodeB64
