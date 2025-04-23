package route

import (
	"fmt"
	"github.com/labstack/echo/v4"
)

func Register(e *echo.Echo) {
	g := e.Group("/api")
	fmt.Println(g)
}
