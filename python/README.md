# PingBus Python SDK (`pingbus-python`)

An asynchronous, type-safe Python SDK for the PingBus Notification Gateway. Built on `httpx` and `pydantic` for high performance and robust data validation.

## 📦 Installation

```bash
pip install httpx pydantic
```

## 🚀 Quick Start

### Basic Usage
```python
import asyncio
from pingbus import PingBusClient

async def main():
    # Automatically picks up PINGBUS_API_KEY and PINGBUS_BASE_URL from env
    client = PingBusClient()

    # Send a WhatsApp Message
    await client.whatsapp.send_message(
        instance_id="inst_123",
        chat_id="1234567890@c.us",
        message="Hello from Python!"
    )

    # Send an Email
    await client.email.send(
        to="user@example.com",
        subject="Welcome",
        body="<h1>Welcome!</h1>",
        options={"isHtml": True}
    )

asyncio.run(main())
```

### Advanced Push Notifications
```python
from pingbus.models import PushTarget

# Send to a specific User ID
await client.push.send(
    target=PushTarget(type="user", userId="user_456"),
    notification={"title": "Alert", "body": "Critical Update"}
)
```

### Unified Orchestration
Trigger notifications across multiple channels simultaneously or via a waterfall fallback system using a single, idempotent API call.
```python
await client.dispatch.trigger({
    "idempotencyKey": "unique-uuid-v4",
    "event": "order_shipped",
    "targets": {
        "whatsapp": { "instanceId": "wa_123", "chatId": "1234567890@c.us" },
        "sms": { "to": "+19876543210" }
    },
    "content": {
        "title": "Order Shipped!",
        "body": "Hi {{name}}, your order #{{orderId}} is on the way."
    },
    "variables": { "name": "Alice", "orderId": "ORD-777" },
    "strategy": "waterfall",
    "config": { "waterfallTimeoutMs": 300000 }
})

# Check dispatch status
status = await client.dispatch.get_status("unique-uuid-v4")
```

---

## 🔑 Configuration Reference

The client supports automatic environment detection.

| Option | Env Variable | Default |
|---|---|---|
| `api_key` | `PINGBUS_API_KEY` | **Required** |
| `base_url` | `PINGBUS_BASE_URL` | `https://api.pingbus.com` |
| `timeout` | `PINGBUS_TIMEOUT` | `30.0` |

```python
client = PingBusClient(api_key="pk_...", timeout=10.0)
```

---

## ⚡ Key Features

*   **Async/Await Native:** Uses `httpx.AsyncClient` for non-blocking concurrent requests and connection pooling.
*   **Pydantic Models:** All request and response data is validated using Pydantic, providing full IDE autocompletion and type safety.
*   **Automatic Retries:** Implements the normative PingBus retry strategy (Exponential Backoff + Jitter) to handle rate limits (`429`) and server errors (`503`).

---

## 🛡️ Webhook Security

Verify that incoming HTTP requests genuinely originated from PingBus using HMAC-SHA256:

```python
is_valid = PingBusClient.verify_signature(
    body=request.body, 
    signature=request.headers["X-PingBus-Signature"], 
    api_key="your_api_key"
)
```

## 📄 License
MIT © PingBus 2026
