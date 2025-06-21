package api

import (
	"devtools/internal/openai"
	"strings"
)

func Crontab(ctx *Context) error {
	desc := ctx.QueryParam("desc")
	if strings.TrimSpace(desc) == "" {
		return nil
	}
	resp, err := ctx.oai.Chat(ctx.Request().Context(), openai.ReqChat{
		Stream:      false,
		Model:       ctx.cfg.OpenAI.Model,
		Messages:    buildPrompt(desc),
		Temperature: 0,
	})
	if err != nil {
		return ctx.ErrMsg(err, "调用 AI 生成异常")
	}
	return ctx.Data(resp.Message.Content)
}

func buildPrompt(desc string) []openai.Message {
	return []openai.Message{
		{
			Role:    openai.RSystem,
			Content: "You are a professional Crontab generator. Don't do any interpretation, just reply to the expression. If the user sends a crontab, it is returned as is.",
		},
		{
			Role:    openai.RUser,
			Content: desc,
		},
	}
}
