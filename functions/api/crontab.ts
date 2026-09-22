import { CronExpressionParser } from "cron-parser"

const systemPrompt = `/no_think
Convert the user's request into a Crontab expression.
For natural language, use five fields: minute, hour, day of month, month, day of week.
If the input is already a valid five- or six-field Crontab expression, return it unchanged.
Return only the expression, without Markdown, explanations, or reasoning.`

type AiResult = {
  choices?: Array<{
    finish_reason?: string
    message?: {
      content?: unknown
      reasoning_content?: unknown
    }
    text?: unknown
  }>
}

type QwenInput = {
  messages: Array<{ role: string; content: string }>
  max_tokens: number
  temperature: number
  chat_template_kwargs: { enable_thinking: boolean }
}

function getRawExpression(result: unknown) {
  if (typeof result === "string") {
    return result
  }
  if (typeof result !== "object" || result === null) {
    return undefined
  }

  const output = result as AiResult
  const candidates = [
    output.choices?.[0]?.message?.content,
    output.choices?.[0]?.text,
    output.choices?.[0]?.message?.reasoning_content,
  ]
  return candidates.find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0
  )
}

function failure(message: string, status: number) {
  return Response.json({ message }, { status })
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "POST") {
    const response = failure("请使用 POST 请求", 405)
    response.headers.set("Allow", "POST")
    return response
  }

  const contentType = request.headers.get("Content-Type")?.split(";")[0].trim()
  if (contentType?.toLowerCase() !== "application/json") {
    return failure("请使用 application/json 请求体", 415)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return failure("请求体不是有效的 JSON", 400)
  }
  if (
    typeof body !== "object" ||
    body === null ||
    !("desc" in body) ||
    typeof body.desc !== "string"
  ) {
    return failure("desc 必须是字符串", 400)
  }

  const desc = body.desc.trim()
  if (!desc || desc.length > 500) {
    return failure("请输入 1–500 个字符的描述或 Crontab 表达式", 400)
  }

  const signal = AbortSignal.timeout(15_000)
  const input: QwenInput = {
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: desc },
    ],
    temperature: 0,
    max_tokens: 1024,
    chat_template_kwargs: {
      enable_thinking: false,
    },
  }
  let result: unknown
  try {
    result = await env.AI.run("@cf/qwen/qwen3-30b-a3b-fp8", input, { signal })
  } catch (error) {
    console.error("Workers AI 请求失败", error)
    return signal.aborted
      ? failure("AI 生成超时，请稍后重试", 504)
      : failure("AI 生成失败，请稍后重试", 503)
  }

  if (
    typeof result === "object" &&
    result !== null &&
    (result as AiResult).choices?.[0]?.finish_reason === "length"
  ) {
    console.error("AI 生成达到 token 上限", { finish_reason: "length" })
    return failure("AI 生成不完整，请重试", 502)
  }

  const rawExpression = getRawExpression(result)

  if (typeof rawExpression !== "string" || !rawExpression.trim()) {
    console.error("AI 未返回非空的 Crontab 表达式")
    return failure("AI 未返回 Crontab 表达式，请重试", 502)
  }

  const expression = rawExpression.trim()
  const fields = expression.split(/\s+/)
  if (fields.length !== 5 && fields.length !== 6) {
    console.error("AI 返回的 Crontab 字段数无效", {
      expression,
      fieldCount: fields.length,
    })
    return failure("AI 返回的 Crontab 表达式无效，请重试", 502)
  }
  try {
    CronExpressionParser.parse(expression)
  } catch (error) {
    console.error("AI 生成的 Crontab 表达式无效", expression, error)
    return failure("AI 返回的 Crontab 表达式无效，请重试", 502)
  }

  return Response.json({ data: expression })
}
