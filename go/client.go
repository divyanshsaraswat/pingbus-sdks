package pingbus

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type Client struct {
	config   PingBusConfig
	http     *http.Client
	WhatsApp *WhatsAppService
	Email    *EmailService
	Push     *PushService
	SMS      *SmsService
	Account  *AccountService
	Balance  *BalanceService
	Proxies  *ProxyService
	Dispatch *DispatchService
}

func NewClient(apiKey, baseURL string) (*Client, error) {
	if apiKey == "" { apiKey = os.Getenv("PINGBUS_API_KEY") }
	if baseURL == "" {
		baseURL = os.Getenv("PINGBUS_BASE_URL")
		if baseURL == "" { baseURL = "https://api.pingbus.com" }
	}
	if apiKey == "" { return nil, fmt.Errorf("API key is required") }

	c := &Client{
		config: PingBusConfig{ APIKey: apiKey, BaseURL: baseURL, Timeout: 30 * time.Second },
		http: &http.Client{Timeout: 30 * time.Second},
	}
	c.WhatsApp = &WhatsAppService{client: c}
	c.Email = &EmailService{client: c}
	c.Push = &PushService{client: c}
	c.SMS = &SmsService{client: c}
	c.Account = &AccountService{client: c}
	c.Balance = &BalanceService{client: c}
	c.Proxies = &ProxyService{client: c}
	c.Dispatch = &DispatchService{client: c}
	return c, nil
}

func (c *Client) request(method, path string, body interface{}, usePathToken bool) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonBody, _ := json.Marshal(body)
		bodyReader = bytes.NewBuffer(jsonBody)
	}
	url := c.config.BaseURL + path
	req, _ := http.NewRequest(method, url, bodyReader)
	req.Header.Set("Content-Type", "application/json")
	if !usePathToken { req.Header.Set("Authorization", "Bearer "+c.config.APIKey) }

	var lastErr error
	for attempt := 0; attempt < 3; attempt++ {
		resp, err := c.http.Do(req)
		if err != nil { lastErr = err; time.Sleep(GetWaitTime(attempt)); continue }
		defer resp.Body.Close()
		if resp.StatusCode == 429 || resp.StatusCode >= 503 {
			lastErr = fmt.Errorf("HTTP %d", resp.StatusCode)
			time.Sleep(GetWaitTime(attempt)); continue
		}
		return io.ReadAll(resp.Body)
	}
	return nil, lastErr
}

type WhatsAppService struct{ client *Client }
func (s *WhatsAppService) SendMessage(instanceId, chatId, message string) error {
	path := fmt.Sprintf("/waInstance%s/sendMessage/%s", instanceId, s.client.config.APIKey)
	_, err := s.client.request("POST", path, map[string]string{"chatId": chatId, "message": message}, true)
	return err
}

func (s *WhatsAppService) SendFileByUrl(instanceId, chatId, urlFile, fileName, caption string) error {
	path := fmt.Sprintf("/waInstance%s/sendFileByUrl/%s", instanceId, s.client.config.APIKey)
	_, err := s.client.request("POST", path, map[string]string{
		"chatId":   chatId,
		"urlFile":  urlFile,
		"fileName": fileName,
		"caption":  caption,
	}, true)
	return err
}

func (s *WhatsAppService) ReceiveNotification(instanceId string) ([]byte, error) {
	path := fmt.Sprintf("/waInstance%s/receiveNotification/%s", instanceId, s.client.config.APIKey)
	return s.client.request("GET", path, nil, true)
}

func (s *WhatsAppService) GetStatus(instanceId string) ([]byte, error) {
	path := fmt.Sprintf("/waInstance%s/getStateInstance/%s", instanceId, s.client.config.APIKey)
	return s.client.request("GET", path, nil, true)
}

type EmailService struct{ client *Client }
func (s *EmailService) Send(to, subject, body string, options *EmailOptions) error {
	payload := map[string]interface{}{"to": to, "subject": subject, "body": body}
	if options != nil { payload["isHtml"] = options.IsHTML; payload["from"] = options.From }
	_, err := s.client.request("POST", "/api/channels/email/send", payload, false)
	return err
}

func (s *EmailService) ListLogs(limit, offset int) ([]byte, error) {
	path := fmt.Sprintf("/api/channels/email/logs?limit=%d&offset=%d", limit, offset)
	return s.client.request("GET", path, nil, false)
}

type PushService struct{ client *Client }
func (s *PushService) Send(target PushTarget, notification map[string]interface{}) error {
	payload := map[string]interface{}{"target": target, "notification": notification}
	_, err := s.client.request("POST", "/api/channels/push/send", payload, false)
	return err
}

type SmsService struct{ client *Client }
func (s *SmsService) Send(to, body, instanceId string) error {
	payload := map[string]string{"to": to, "body": body}
	if instanceId != "" { payload["instanceId"] = instanceId }
	_, err := s.client.request("POST", "/api/channels/sms/send", payload, false)
	return err
}

type ProxyService struct{ client *Client }
func (s *ProxyService) Provision() error {
	_, err := s.client.request("POST", "/api/proxies", nil, false)
	return err
}

type AccountService struct{ client *Client }
func (s *AccountService) GetProfile() ([]byte, error) {
	return s.client.request("GET", "/api/account", nil, false)
}

type BalanceService struct{ client *Client }
func (s *BalanceService) GetBalance() (map[string]interface{}, error) {
	data, err := s.client.request("GET", "/api/balance", nil, false)
	if err != nil { return nil, err }
	var res map[string]interface{}
	json.Unmarshal(data, &res)
	return res, nil
}

type DispatchService struct{ client *Client }
func (s *DispatchService) Trigger(payload map[string]interface{}) ([]byte, error) {
	return s.client.request("POST", "/api/dispatch", payload, false)
}

func (s *DispatchService) GetStatus(dispatchId string) ([]byte, error) {
	return s.client.request("GET", "/api/dispatch/"+dispatchId, nil, false)
}
