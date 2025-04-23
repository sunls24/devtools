package config

import "github.com/caarlos0/env/v11"

type Config struct {
	Host   string `env:"HOST" envDefault:"127.0.0.1"`
	Port   string `env:"PORT" envDefault:"3000"`
	OpenAI OpenAI `envPrefix:"OAI_"`
}

type OpenAI struct {
	BaseURL string `env:"BASE_URL"`
	APIKey  string `env:"API_KEY"`
	Model   string `env:"MODEL"`
}

func MustNew() *Config {
	var cfg Config
	if err := env.Parse(&cfg); err != nil {
		panic(err)
	}
	return &cfg
}
