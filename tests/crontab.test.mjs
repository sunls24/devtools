import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  spyOn,
  test,
} from "bun:test"
import { onRequest } from "../functions/api/crontab.ts"
import { respData } from "../src/lib/utils.ts"

const url = "https://devtools.example/api/crontab"

function request(body) {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  })
}

let errorLog
beforeEach(() => {
  errorLog = spyOn(console, "error").mockImplementation(() => {})
})
afterEach(() => mock.restore())

describe("Crontab API", () => {
  test.each(["0 */2 * * *", "30 0 */2 * * *"])(
    "returns a validated expression: %s",
    async (expression) => {
      const run = mock(async () => ({
        choices: [{ message: { content: ` ${expression}\n` } }],
      }))
      const desc = "每两小时执行一次 & # + ?"
      const response = await onRequest({
        request: request({ desc }),
        env: { AI: { run } },
      })

      expect(response.status).toBe(200)
      expect(await respData(response.clone())).toBe(expression)
      expect(await response.json()).toEqual({
        data: expression,
      })
      expect(run).toHaveBeenCalledTimes(1)
      const [model, input, options] = run.mock.calls[0]
      expect(model).toBe("@cf/qwen/qwen3-30b-a3b-fp8")
      expect(input.messages[1]).toEqual({ role: "user", content: desc })
      expect(input.max_tokens).toBe(1024)
      expect(input.chat_template_kwargs).toEqual({ enable_thinking: false })
      expect(options.signal).toBeInstanceOf(AbortSignal)
    }
  )

  test.each([
    null,
    [],
    {},
    { desc: 1 },
    { desc: " " },
    { desc: "x".repeat(501) },
  ])("rejects invalid input without calling AI: %j", async (body) => {
    const run = mock()
    const response = await onRequest({
      request: request(body),
      env: { AI: { run } },
    })
    expect(response.status).toBe(400)
    expect((await response.json()).message).toBeString()
    expect(run).not.toHaveBeenCalled()
  })

  test("rejects malformed JSON", async () => {
    const run = mock()
    const response = await onRequest({
      request: new Request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{",
      }),
      env: { AI: { run } },
    })
    expect(response.status).toBe(400)
    expect(run).not.toHaveBeenCalled()
  })

  test("rejects unsupported content types", async () => {
    const run = mock()
    const response = await onRequest({
      request: new Request(url, { method: "POST", body: "desc=test" }),
      env: { AI: { run } },
    })
    expect(response.status).toBe(415)
    expect(run).not.toHaveBeenCalled()
  })

  test("GET returns 405 instead of a static page", async () => {
    const response = await onRequest({ request: new Request(url), env: {} })
    expect(response.status).toBe(405)
    expect(response.headers.get("Allow")).toBe("POST")
  })

  test.each(["", " ", "```cron\n0 * * * *\n```", "61 * * * *", "@daily"])(
    "rejects invalid model output: %s",
    async (expression) => {
      const response = await onRequest({
        request: request({ desc: "每小时执行" }),
        env: {
          AI: {
            run: async () => ({
              choices: [{ message: { content: expression } }],
            }),
          },
        },
      })
      expect(response.status).toBe(502)
      expect((await response.json()).message).toBeString()
    }
  )

  test.each([
    [null, "0 6-18/3 * * *", 200, "0 6-18/3 * * *"],
    ["0 9 * * *", "0 6-18/3 * * *", 200, "0 9 * * *"],
    [null, "The expression is 0 6-18/3 * * *", 502, undefined],
    [null, "61 * * * *", 502, undefined],
  ])(
    "validates reasoning fallback with content=%s and reasoning=%s",
    async (content, reasoning_content, status, expression) => {
      const response = await onRequest({
        request: request({ desc: "每天6点到18点每三小时执行" }),
        env: {
          AI: {
            run: async () => ({
              choices: [
                {
                  finish_reason: "stop",
                  message: { content, reasoning_content },
                },
              ],
            }),
          },
        },
      })
      expect(response.status).toBe(status)
      const body = await response.json()
      if (status === 200) {
        expect(body).toEqual({ data: expression })
      } else {
        expect(body.message).toBe("AI 返回的 Crontab 表达式无效，请重试")
      }
    }
  )

  test.each([
    { message: { content: "0 9 * * *" } },
    { message: { content: null, reasoning_content: "0 9 * * *" } },
    { text: "0 9 * * *" },
  ])("rejects truncated output: %j", async (choice) => {
    const response = await onRequest({
      request: request({ desc: "每天上午9点" }),
      env: {
        AI: {
          run: async () => ({
            choices: [{ ...choice, finish_reason: "length" }],
          }),
        },
      },
    })

    expect(response.status).toBe(502)
    expect(await response.json()).toEqual({ message: "AI 生成不完整，请重试" })
    expect(errorLog).toHaveBeenCalledWith("AI 生成达到 token 上限", {
      finish_reason: "length",
    })
  })

  test("reports upstream errors and preserves the cause in logs", async () => {
    const cause = new Error("AI quota exceeded")
    const response = await onRequest({
      request: request({ desc: "每天执行" }),
      env: {
        AI: {
          run: async () => {
            throw cause
          },
        },
      },
    })
    expect(response.status).toBe(503)
    await expect(respData(response.clone())).rejects.toThrow(
      "AI 生成失败，请稍后重试"
    )
    expect(await response.json()).toEqual({
      message: "AI 生成失败，请稍后重试",
    })
    expect(errorLog).toHaveBeenCalledWith("Workers AI 请求失败", cause)
  })

  test("reports timeouts", async () => {
    const signal = AbortSignal.abort(
      new DOMException("timeout", "TimeoutError")
    )
    spyOn(AbortSignal, "timeout").mockReturnValue(signal)
    const response = await onRequest({
      request: request({ desc: "每天执行" }),
      env: {
        AI: {
          run: async (_model, _input, options) => {
            options.signal.throwIfAborted()
          },
        },
      },
    })
    expect(response.status).toBe(504)
    expect((await response.json()).message).toContain("超时")
  })
})
