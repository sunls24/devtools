package service

import (
	"context"
	"devtools/internal/api"
	"strings"

	"github.com/sunls24/gox/openai"
	"github.com/sunls24/gox/server"
)

type reqCrontab struct {
	Desc string `query:"desc"`
}

func Crontab(ctx context.Context, req reqCrontab) (*string, error) {
	if strings.TrimSpace(req.Desc) == "" {
		return nil, nil
	}
	resp, err := api.OAI(ctx).Chat(ctx, openai.ReqChat{
		Model:       api.Config(ctx).OpenAI.Model,
		Messages:    openai.StartPrompt(req.Desc, systemPrompt),
		Temperature: 0,
	})
	if err != nil {
		return nil, server.ErrMsg("调用 AI 模型异常").WithErr(err)
	}
	return &resp, nil
}

const systemPrompt = "You are a professional Crontab generator. Don't do any interpretation, just reply to the expression. If the user sends a crontab, it is returned as is."
