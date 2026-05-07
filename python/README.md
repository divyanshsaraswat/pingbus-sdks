# PingBus Python SDK (`pingbus-python`)

An asynchronous, type-safe Python SDK for PingBus using `httpx` and `pydantic`.

## 📦 Installation

```bash
pip install httpx pydantic
```

## 🚀 Quick Start

```python
import asyncio
from pingbus import PingBusClient

async def main():
    # Automatically picks up PINGBUS_API_KEY from environment
    client = PingBusClient()

    # Send an Email
    await client.email.send(
        to="user@example.com",
        subject="Welcome!",
        body="<h1>Hello!</h1>",
        options={"isHtml": True}
    )

    # Check Balance
    balance = await client.balance.get_balance()
    print(f"Current Credits: {balance['credits']}")

asyncio.run(main())
```

## ⚡ Features
- **Async First**: Built on `httpx` for high-performance concurrent I/O.
- **Strict Typing**: All models use `Pydantic` for runtime validation and IDE autocompletion.
- **Resilient**: Normative retry strategy with jitter for robust production delivery.

## 🛡️ Webhook Verification
```python
is_valid = PingBusClient.verify_signature(payload_body, signature, api_key)
```
