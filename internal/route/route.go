package route

import (
	"devtools/internal/api"
	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) {
	g := e.Group("/api")
	g.GET("/crontab", api.Wrap(api.Crontab))
}
