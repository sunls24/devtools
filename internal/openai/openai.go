package openai

import (
	"bufio"
	"bytes"
	"context"
	"devtools/config"
	"devtools/internal/client"
	"devtools/internal/constant"
	"devtools/internal/utils"
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/tidwall/gjson"
	"io"
	"net/http"
	"time"
)

type OpenAI struct {
	config.OpenAI
}

func New(cfg config.OpenAI) *OpenAI {
	return &OpenAI{cfg}
}

func (oai *OpenAI) Chat(ctx context.Context, reqChat ReqChat) (*RespChat, error) {
	const path = "/v1/chat/completions"

	req, _ := http.NewRequestWithContext(ctx, http.MethodPost, oai.BaseURL+path, client.NewBody(reqChat))

	req.Header.Add("Content-Type", "application/json")
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", oai.APIKey))

	if reqChat.Stream {
		body, err := client.DoBody(req)
		if err != nil {
			return nil, err
		}
		return &RespChat{Body: body}, nil
	}

	body, err := client.Do(req)
	if err != nil {
		return nil, err
	}

	m := gjson.GetBytes(body, "choices.0.message")
	return &RespChat{Message: Message{
		Role:    Role(m.Get("role").String()),
		Content: m.Get("content").String(),
	}}, nil
}

var (
	ssePrefix = []byte("data: ")
	sseDone   = []byte("[DONE]")
)

func Stream(body io.ReadCloser, w *echo.Response, onFinish func([]byte) error) error {
	w.Header().Add("Content-Type", "text/stream")
	w.WriteHeader(http.StatusOK)

	done := make(chan struct{})
	data := make(chan []byte, 1)
	fixedWrite(data, done, w)

	var message []byte
	scanner := bufio.NewScanner(body)
	think := false
	for scanner.Scan() {
		line := scanner.Bytes()
		if !bytes.HasPrefix(line, ssePrefix) {
			continue
		}
		line = line[len(ssePrefix):]
		if bytes.Equal(line, sseDone) {
			continue
		}

		content := gjson.GetBytes(line, "choices.0.delta.reasoning_content").String()
		if content != "" {
			if !think {
				think = true
				content = constant.ThinkStart + content
			}
		} else {
			content = gjson.GetBytes(line, "choices.0.delta.content").String()
			if content == "" {
				continue
			}
			if think {
				think = false
				content = constant.ThinkEnd + content
			}
		}

		b := utils.Str2Bytes(content)
		if onFinish != nil {
			message = append(message, b...)
		}
		data <- b
	}
	_ = body.Close()
	close(data)
	<-done
	if scanner.Err() != nil {
		return scanner.Err()
	}
	if onFinish != nil {
		return onFinish(message)
	}
	return nil
}

func fixedWrite(data <-chan []byte, done chan<- struct{}, w *echo.Response) {
	const maxLen = 36
	const interval = time.Millisecond * 100

	buffer := make([]byte, 0, maxLen)
	end := false
	go func() {
		defer close(done)
		tick := time.NewTicker(interval)
		defer tick.Stop()
		for {
			select {
			case b, ok := <-data:
				if !ok {
					data = nil
					end = true
					break
				}
				buffer = append(buffer, b...)
			case <-tick.C:
				if len(buffer) == 0 {
					if end {
						return
					}
					continue
				}
				var b = buffer
				if len(b) > maxLen {
					b = buffer[:maxLen]
				}
				buffer = buffer[len(b):]

				if _, err := w.Write(b); err != nil {
					if end {
						return
					}
					continue
				}
				w.Flush()
			}
		}
	}()
}
