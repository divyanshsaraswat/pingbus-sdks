# 🛰️ PingBus Multi-Language SDK Ecosystem

Welcome to the official SDK suite for the PingBus Notification Gateway. This repository provides unified, production-grade clients for **Node.js**, **Python**, **Go**, and **Java**, all strictly adhering to the [Master Specification (v1.6)](../SDK.md).

---

## 📁 SDK Catalog

| Language | Path | Stack | Primary Use Case |
| :--- | :--- | :--- | :--- |
| **TypeScript** | [/node](./node) | Fetch + React Query | Web Apps, Node.js Backends |
| **Python** | [/python](./python) | httpx + Pydantic | AI Pipelines, Fast API, Automation |
| **Go** | [/go](./go) | net/http | Microservices, High-Performance Systems |
| **Java** | [/java](./java) | OkHttp + Gson | Enterprise Backends, Android Apps |

---

## 🛡️ Shared Core Principles

Every SDK in this suite is guaranteed to provide the following features:

### 1. Deterministic Resilience (Section 9)
All SDKs implement a normative **Exponential Backoff with Jitter** algorithm. They automatically detect and retry transient errors (`429`, `503`, `504`) to ensure your notifications reach the target even during network instability.

### 2. Auto-Auth Injection
No more manual header management. The SDKs automatically determine the correct authentication routing:
- **Cloud APIs**: Uses `Authorization: Bearer <key>`.
- **WhatsApp Instances**: Transparently injects the key into the URL path.

### 3. Environment Variable First
Zero-config initialization is supported across all platforms. The SDKs will automatically search for:
- `PINGBUS_API_KEY`
- `PINGBUS_BASE_URL`

### 4. Machine-Readable Security
Includes static `verifySignature` utilities implemented with constant-time comparison logic to protect your webhook endpoints against timing attacks.

---

## 🚀 Unified Method Naming
We maintain strict naming parity across languages so your teams can switch contexts effortlessly:
- `client.whatsapp.sendMessage()`
- `client.email.send()`
- `client.push.send()`
- `client.account.getProfile()`

---

## 📚 Documentation
For language-specific installation guides and advanced usage, please refer to the README files in each subdirectory.
