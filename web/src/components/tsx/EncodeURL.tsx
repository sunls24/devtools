import Encode from "@/components/tsx/Encode"

function EncodeURL() {
  return (
    <Encode
      encode={(str) => encodeURIComponent(str)}
      decode={(str) => decodeURIComponent(str)}
    ></Encode>
  )
}

export default EncodeURL
