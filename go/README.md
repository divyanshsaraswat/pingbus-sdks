# PingBus Go SDK (`github.com/pingbus/pingbus-go`)

A zero-dependency, thread-safe Go client for the PingBus Notification Gateway.

## 🚀 Quick Start

```go
package main

import (
	"log"
	"github.com/pingbus/pingbus-go"
)

func main() {
	client, err := pingbus.NewClient("your_api_key", "")
	if err != nil {
		log.Fatal(err)
	}

	// Send WhatsApp
	err = client.WhatsApp.SendMessage("inst_123", "1234567890@s.whatsapp.net", "Ping!")
	if err != nil {
		log.Printf("Failed: %v", err)
	}
}
```

## 🛠️ Key Design Patterns
- **Standard Library Only**: Built using `net/http` for maximum compatibility and zero security vulnerabilities from dependencies.
- **Service Partitioning**: Methods are grouped logically under `client.WhatsApp`, `client.Email`, `client.Push`, etc.
- **Context Support**: Future-ready for cancellation and timeouts via `context.Context`.

## 🛡️ Security
```go
isValid := pingbus.VerifySignature(body, signature, apiKey)
```
Uses `subtle.ConstantTimeCompare` to protect against timing attacks.
