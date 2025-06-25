package route

import (
	"devtools/internal/service"

	"github.com/labstack/echo/v5"
	"github.com/sunls24/gox/server"
)

func Register(e *echo.Echo) {
	g := e.Group("/api")
	g.GET("/crontab", server.Wrap(service.Crontab))
}
