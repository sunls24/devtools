package main

import (
	"devtools/internal"
	"github.com/rs/zerolog/log"
)

func main() {
	if err := internal.NewApp().Run(); err != nil {
		log.Panic().Err(err).Send()
	}
}
