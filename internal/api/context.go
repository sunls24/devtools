package api

import (
	"devtools/config"
	"devtools/internal/openai"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog/log"
	"net/http"
)

type Context struct {
	echo.Context
	cfg *config.Config
	oai *openai.OpenAI
}

func Middleware(cfg *config.Config) echo.MiddlewareFunc {
	oai := openai.New(cfg.OpenAI)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(ctx echo.Context) error {
			return next(&Context{ctx, cfg, oai})
		}
	}
}

func Wrap(fn func(*Context) error) echo.HandlerFunc {
	return func(c echo.Context) error {
		return fn(c.(*Context))
	}
}

func (c *Context) Bad(msg string) error {
	return echo.NewHTTPError(http.StatusBadRequest, msg)
}

func (c *Context) BadParam() error {
	return c.Bad("请求参数异常")
}

type Message struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    any    `json:"data,omitempty"`
}

func (c *Context) Data(data any) error {
	return c.JSON(http.StatusOK, Message{
		Code:    0,
		Message: "ok",
		Data:    data,
	})
}

func (c *Context) Msg(msg string) error {
	return c.JSON(http.StatusOK, Message{
		Code:    -1,
		Message: msg,
	})
}

func (c *Context) ErrMsg(err error, msg string) error {
	if err == nil {
		return c.Data(nil)
	}
	log.Err(err).Msg(msg)
	return c.Msg(msg)
}

//goland:noinspection SpellCheckingInspection
func (c *Context) ErrMsgf(err error, f string, args ...any) error {
	return c.ErrMsg(err, fmt.Sprintf(f, args...))
}
