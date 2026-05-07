package pingbus

import "time"

type PingBusConfig struct {
	APIKey  string
	BaseURL string
	Timeout time.Duration
}

type PingBusResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Error   string      `json:"error"`
}

type PaginatedResponse struct {
	Total  int         `json:"total"`
	Limit  int         `json:"limit"`
	Offset int         `json:"offset"`
	Data   interface{} `json:"data"`
}

type Notification struct {
	ID          string `json:"id"`
	ChatID      string `json:"chatId"`
	Message     string `json:"message"`
	SenderName  string `json:"senderName"`
	Timestamp   int64  `json:"timestamp"`
	TypeWebhook string `json:"typeWebhook"`
}

type EmailLog struct {
	ID      string    `json:"id"`
	To      string    `json:"to"`
	Subject string    `json:"subject"`
	Status  string    `json:"status"`
	SentAt  time.Time `json:"sentAt"`
	Error   string    `json:"error,omitempty"`
}

type EmailOptions struct {
	IsHTML     bool   `json:"isHtml,omitempty"`
	From       string `json:"from,omitempty"`
	InstanceID string `json:"instanceId,omitempty"`
}

type PushTarget struct {
	Type    string `json:"type"`
	UserID  string `json:"userId,omitempty"`
	Token   string `json:"token,omitempty"`
	Topic   string `json:"topic,omitempty"`
}

type Transaction struct {
	ID          string    `json:"id"`
	Date        time.Time `json:"date"`
	Description string    `json:"description"`
	Amount      float64   `json:"amount"`
	Status      string    `json:"status"`
	Type        string    `json:"type"`
}

type SMTPConfig struct {
	Host      string `json:"host"`
	Port      int    `json:"port"`
	Secure    bool   `json:"secure"`
	User      string `json:"user"`
	Pass      string `json:"pass"`
	FromEmail string `json:"fromEmail"`
	FromName  string `json:"fromName"`
}
