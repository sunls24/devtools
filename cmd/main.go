package main

import (
	"devtools/internal"
	"log"
)

func main() {
	if err := internal.NewApp().Run(); err != nil {
		log.Fatal(err)
	}
}
