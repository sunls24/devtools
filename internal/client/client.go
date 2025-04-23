package client

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"time"
)

var Default = &http.Client{
	Timeout: time.Minute * 5,
}

func Get(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	return Do(req)
}

func Do(req *http.Request) ([]byte, error) {
	resp, err := Default.Do(req)
	if err != nil {
		return nil, err
	}
	body, err := io.ReadAll(resp.Body)
	_ = resp.Body.Close()
	if err != nil {
		return nil, err
	}

	if !isOk(resp.StatusCode) {
		status := fmt.Sprintf("bad status: %s", resp.Status)
		if len(body) != 0 {
			status = fmt.Sprintf("%s: %s", status, string(body))
		}
		return nil, errors.New(status)
	}
	return body, nil
}

func DoBody(req *http.Request) (io.ReadCloser, error) {
	resp, err := Default.Do(req)
	if err != nil {
		return nil, err
	}
	if !isOk(resp.StatusCode) {
		_, _ = io.Copy(io.Discard, resp.Body)
		_ = resp.Body.Close()
		return nil, fmt.Errorf("bad status: %s", resp.Status)
	}
	return resp.Body, nil
}

func isOk(code int) bool {
	return http.StatusOK <= code && code < http.StatusBadRequest
}

func NewBody(body any) io.Reader {
	data, _ := json.Marshal(body)
	return bytes.NewReader(data)
}
