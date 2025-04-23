package route

import (
	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) {
	g := e.Group("/api")
	_ = g
}
