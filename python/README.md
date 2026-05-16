# PingBus Python SDK (`pingbus`)

A production-grade Python SDK for the PingBus Notification Gateway. Features native `httpx` async support, full type hints, and first-class integration for multi-channel messaging.

## 📦 Installation

```bash
pip install pingbus
```

---

## 🔑 Configuration

| Option | Env Variable | Default | Description |
|---|---|---|---|
| `api_key` | `PINGBUS_API_KEY` | **Required** | Your `pk_...` API key from Account settings. |
| `base_url` | `PINGBUS_BASE_URL` | `https://www.pingbus.live` | Production API base URL. |
| `timeout` | `PINGBUS_TIMEOUT` | `30.0` | Global request timeout in seconds. |

```python
import os
from pingbus import PingBusClient

client = PingBusClient(
    api_key=os.getenv("PINGBUS_API_KEY"), # keep server-side only
    base_url="https://www.pingbus.live"
)
```

> **Security:** Your `pk_` API key is a full-access bearer token. Always keep it on the server — never expose it in frontend/client code.

---

## 🔐 Authentication

All requests are authenticated with a standard `Authorization` header automatically set by the SDK:

```http
Authorization: Bearer pk_your_key_here
Content-Type: application/json
```

No token in the URL is required or used.

---

## 🚀 Unified Orchestration (`client.dispatch`)

Trigger notifications across multiple channels simultaneously or via a waterfall fallback using a single, idempotent API call.

```python
import asyncio

async def main():
    result = await client.dispatch.trigger({
        "idempotencyKey": "unique-uuid-v4",
        "event": "order_shipped",
        "targets": {
            "whatsapp": { "instanceId": "waInstance4256253175", "chatId": "919876543210@c.us" },
            "email":    { "to": "customer@example.com" },
            "sms":      { "to": "+19876543210" }
        },
        "content": {
            "title": "Order Shipped!",
            "body":  "Hi {{name}}, your order #{{orderId}} is on the way."
        },
        "variables": { "name": "Alice", "orderId": "ORD-777" },
        "strategy": "waterfall",
        "config": { "waterfallTimeoutMs": 300000 }
    })

    # Check dispatch status
    status = await client.dispatch.get_status("unique-uuid-v4")

asyncio.run(main())
```

---

## 🛰️ WhatsApp Service (`client.whatsapp`)

### Messaging

```python
async def whatsapp_examples():
    # Send a text message
    await client.whatsapp.send_message('4256253175', '919876543210@c.us', 'Hello from PingBus!')

    # Send a file from URL
    await client.whatsapp.send_file_by_url(
        '4256253175',
        '919876543210@c.us',
        'https://example.com/invoice.pdf',
        name='invoice.pdf',
        caption='Your Invoice'
    )

    # Poll for incoming messages (returns None if queue is empty)
    notification = await client.whatsapp.receive('4256253175')
```

*(Note: In the Python SDK, instance ID can be passed simply as the number string, e.g., `'4256253175'`, because `client.whatsapp` internally prepends `waInstance` to it.)*

---

## 📧 Email Service (`client.email`)

```python
async def email_examples():
    # Send Email
    await client.email.send('user@example.com', 'Welcome', '<h1>Hi!</h1>', options={'isHtml': True})

    # Fetch Logs
    logs = await client.email.list_logs(limit=50, offset=0)
```

---

## 📱 Push & SMS Services

### Push Notifications (FCM)

```python
from pingbus.models import PushTarget

async def push_example():
    target = PushTarget(type="user", userId="app_user_123")
    await client.push.send(
        target=target,
        notification={"title": "Update", "body": "New feature available!"}
    )
```

---

## ☁️ Account & Management

```python
async def mgmt_examples():
    # Get profile
    profile = await client.account.get_profile()

    # Provision Proxies for WhatsApp
    proxy = await client.proxies.provision()
    await client.proxies.attach(proxy['id'], 'waInstance4256253175')
```

---

## 🛡️ Reliability

### Automatic Retries
The SDK implements **Exponential Backoff with Jitter**. It automatically handles rate limits (`429`) and server availability issues (`503`).

### Webhook Verification
Validate that incoming webhooks genuinely originated from PingBus:

```python
is_valid = PingBusClient.verify_signature(raw_body, signature_header, os.getenv("PINGBUS_API_KEY"))
```

---

## 📄 License
MIT © PingBus 2026
