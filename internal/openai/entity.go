package openai

import "io"

type Role string

const (
	RUser      Role = "user"
	RSystem    Role = "system"
	RAssistant Role = "assistant"
	RTool      Role = "tool"
)

type Message struct {
	Role    Role   `json:"role"`
	Content string `json:"content"`
}

func NewMessage(role Role, content string) Message {
	return Message{Role: role, Content: content}
}

type ReqChat struct {
	Stream      bool      `json:"stream"`
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	Temperature float64   `json:"temperature"`
}

type RespChat struct {
	Body    io.ReadCloser
	Message Message
}
