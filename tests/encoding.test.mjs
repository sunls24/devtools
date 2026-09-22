import { expect, test } from "bun:test"
import EncodeB64 from "../src/components/tsx/EncodeB64.tsx"
import EncodeURL from "../src/components/tsx/EncodeURL.tsx"

const base64 = EncodeB64().props
const url = EncodeURL().props

test.each(["", "hello", "中文 😀", "中文 😀".repeat(100000)])(
  "Base64 round-trips UTF-8 input %#",
  (input) => {
    const encoded = base64.encode(input)
    expect(encoded).toBe(Buffer.from(input, "utf8").toString("base64"))
    expect(base64.decode(encoded)).toBe(input)
  }
)

test("invalid Base64 propagates to the shared error handler", () => {
  expect(() => base64.decode("%%%")).toThrow()
})

test.each(["%", "%E4%B8"])(
  "invalid URL input propagates to the shared error handler: %s",
  (input) => {
    expect(() => url.decode(input)).toThrow(URIError)
  }
)
