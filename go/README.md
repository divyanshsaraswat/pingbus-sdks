# PingBus Go SDK (`github.com/pingbus/pingbus-go`)

A zero-dependency, thread-safe Go client for the PingBus Notification Gateway. Designed for high-performance backend systems and microservices.

## 🚀 Quick Start

### Installation
```bash
go get github.com/pingbus/pingbus-go
```

### Basic Usage
```go
package main

import (
    "log"
    "github.com/pingbus/pingbus-go"
)

func main() {
    // Automatically detects PINGBUS_API_KEY and PINGBUS_BASE_URL
    client, err := pingbus.NewClient("", "")
    if err != nil {
        log.Fatal(err)
    }

    // Send a WhatsApp Message
    err = client.WhatsApp.SendMessage("inst_123", "1234567890@c.us", "Hello from Go!")
    if err != nil {
        log.Printf("WhatsApp failed: %v", err)
    }

    // Send an Email
    err = client.Email.Send("user@example.com", "Hello", "Welcome!", &pingbus.EmailOptions{
        IsHTML: true,
    })
}
```

### Unified Orchestration
Trigger notifications across multiple channels simultaneously or via a waterfall fallback system using a single, idempotent API call.
```go
payload := map[string]interface{}{
    "idempotencyKey": "unique-uuid-v4",
    "event":          "order_shipped",
    "targets": map[string]interface{}{
        "whatsapp": map[string]string{"instanceId": "wa_123", "chatId": "1234567890@c.us"},
        "sms":      map[string]string{"to": "+19876543210"},
    },
    "content": map[string]string{
        "title": "Order Shipped!",
        "body":  "Hi {{name}}, your order #{{orderId}} is on the way.",
    },
    "variables": map[string]string{"name": "Alice", "orderId": "ORD-777"},
    "strategy":  "waterfall",
    "config":    map[string]interface{}{"waterfallTimeoutMs": 300000},
}

response, err := client.Dispatch.Trigger(payload)

// Check dispatch status
status, err := client.Dispatch.GetStatus("unique-uuid-v4")
```

---

## 🔑 Configuration Reference

The `NewClient` constructor accepts `apiKey` and `baseURL`. If empty strings are passed, it defaults to environment variables.

| Env Variable | Default | Description |
|---|---|---|
| `PINGBUS_API_KEY` | **Required** | Your `pk_...` API key. |
| `PINGBUS_BASE_URL` | `https://api.pingbus.com` | Backend server URL. |
| `PINGBUS_TIMEOUT` | `30s` | Global HTTP timeout. |

---

## ⚡ Key Features

*   **Zero Dependencies:** Uses only the Go Standard Library (`net/http`, `crypto/hmac`, etc.) for maximum security and minimal binary size.
*   **Production-Grade Retries:** Implements the normative PingBus retry strategy with **Exponential Backoff and Jitter** in the core request loop.
*   **Thread-Safe:** The `Client` struct is designed to be shared across multiple goroutines safely.

---

## 🛡️ Webhook Security

Protect your endpoints by verifying the HMAC-SHA256 signature of incoming PingBus webhooks:

```go
isValid := pingbus.VerifySignature(rawBody, signatureHeader, apiKey)
```
*Note: Uses `subtle.ConstantTimeCompare` to mitigate timing attacks.*

## 📄 License
MIT © PingBus 2026
