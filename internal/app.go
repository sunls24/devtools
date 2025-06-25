package internal

import (
	"devtools/config"
	"devtools/internal/api"
	"devtools/internal/route"
	"devtools/web"
	"fmt"
	"log/slog"

	"github.com/labstack/echo/v5"
	"github.com/sunls24/gox/server"
)

type App struct {
}

func NewApp() App {
	return App{}
}

func (app App) Run() error {
	cfg := config.MustNew()
	return server.Start(fmt.Sprintf("%s:%s", cfg.Host, cfg.Port), func(e *echo.Echo) {
		e.Logger = slog.Default()
		e.StaticFS("/", echo.MustSubFS(web.FS, "dist"))
		e.Use(api.Middleware(cfg))
		route.Register(e)
	})
}
