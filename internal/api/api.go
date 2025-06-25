package api

import (
	"context"
	"devtools/config"

	"github.com/labstack/echo/v5"
	"github.com/sunls24/gox/openai"
)

type configKey struct{}
type oaiKey struct{}

func Middleware(cfg *config.Config) echo.MiddlewareFunc {
	oai := openai.New(cfg.OpenAI.BaseURL, cfg.OpenAI.APIKey)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c *echo.Context) error {
			ctx := c.Request().Context()
			ctx = context.WithValue(ctx, configKey{}, cfg)
			ctx = context.WithValue(ctx, oaiKey{}, oai)
			c.SetRequest(c.Request().WithContext(ctx))
			return next(c)
		}
	}
}

func Config(ctx context.Context) *config.Config {
	return ctx.Value(configKey{}).(*config.Config)
}

func OAI(ctx context.Context) *openai.OpenAI {
	return ctx.Value(oaiKey{}).(*openai.OpenAI)
}
