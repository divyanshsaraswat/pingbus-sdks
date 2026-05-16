# PingBus Node.js SDK (`@pingbus/sdk`)

A production-grade TypeScript SDK for the PingBus Notification Gateway. Features native `fetch` support, full type safety, and first-class integration for multi-channel messaging.

## 📦 Installation

```bash
npm install @pingbus/sdk
```

---

## 🔑 Configuration

| Option | Env Variable | Default | Description |
|---|---|---|---|
| `apiKey` | `PINGBUS_API_KEY` | **Required** | Your `pk_...` API key from Account settings. |
| `baseUrl` | `PINGBUS_BASE_URL` | `https://www.pingbus.live` | Production API base URL. |
| `timeout` | `PINGBUS_TIMEOUT` | `30000` | Global request timeout in ms. |

```typescript
import { PingBusClient } from '@pingbus/sdk';

const client = new PingBusClient({
  apiKey: process.env.PINGBUS_API_KEY!, // keep server-side only
  baseUrl: 'https://www.pingbus.live',
});
```

> **Security:** Your `pk_` API key is a full-access bearer token. Always keep it on the server — never expose it in frontend/browser code.

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

```typescript
const result = await client.dispatch.trigger({
  idempotencyKey: 'unique-uuid-v4',
  event: 'order_shipped',
  targets: {
    whatsapp: { instanceId: 'waInstance4256253175', chatId: '919876543210@c.us' },
    email:    { to: 'customer@example.com' },
    sms:      { to: '+19876543210' }
  },
  content: {
    title: 'Order Shipped!',
    body:  'Hi {{name}}, your order #{{orderId}} is on the way.'
  },
  variables: { name: 'Alice', orderId: 'ORD-777' },
  strategy: 'waterfall',
  config: { waterfallTimeoutMs: 300000 }
});

// Check dispatch status
const status = await client.dispatch.getStatus('unique-uuid-v4');
```

---

## 🛰️ WhatsApp Service (`client.whatsapp`)

### Messaging

```typescript
// Send a text message
await client.whatsapp.sendMessage('waInstance4256253175', '919876543210@c.us', 'Hello from PingBus!');

// Send a file from URL
await client.whatsapp.sendFileByUrl(
  'waInstance4256253175',
  '919876543210@c.us',
  'https://example.com/invoice.pdf',
  'invoice.pdf',
  'Your Invoice'
);

// Poll for incoming messages (returns null if queue is empty)
const notification = await client.whatsapp.receive('waInstance4256253175');

// Check instance authorization state
const state = await client.whatsapp.getStatus('waInstance4256253175');
// → { stateInstance: 'authorized', liveStatus: 'READY' }
```

### Advanced Features

```typescript
// Send a Poll
await client.whatsapp.sendPoll('waInstance4256253175', '919876543210@c.us', 'Lunch?', ['Pizza', 'Sushi']);

// Send Location
await client.whatsapp.sendLocation('waInstance4256253175', '919876543210@c.us', 28.6139, 77.2090, 'New Delhi');

// Check if a number is on WhatsApp
const check = await client.whatsapp.checkWhatsapp('waInstance4256253175', '919876543210');

// Group management
await client.whatsapp.createGroup('waInstance4256253175', 'Project Alpha', ['user1@c.us', 'user2@c.us']);

// Chat history
const history = await client.whatsapp.getChatHistory('waInstance4256253175', '919876543210@c.us', 50);

// Logout instance
await client.whatsapp.logout('waInstance4256253175');
```

---

## 📧 Email Service (`client.email`)

```typescript
// Send Email
await client.email.send('user@example.com', 'Welcome', '<h1>Hi!</h1>', { isHtml: true });

// Fetch Logs
const logs = await client.email.listLogs(50, 0);
```

---

## 📱 Push & SMS Services

### Push Notifications (FCM)

```typescript
await client.push.send(
  { type: 'user', userId: 'app_user_123' },
  { title: 'Update', body: 'New feature available!' }
);
```

### SMS (Twilio)

```typescript
await client.sms.send('+19876543210', 'Your verification code is 1234');
```

---

## ☁️ Account & Management

```typescript
// Get profile
const profile = await client.account.getProfile();

// Check balance
const { balance, plan } = await client.balance.getBalance();

// Provision Proxies for WhatsApp
const proxy = await client.proxies.provision();
await client.proxies.attach(proxy.id, 'waInstance4256253175');
```

---

## 🛡️ Reliability

### Automatic Retries
The SDK implements **Exponential Backoff with Jitter**. It automatically handles rate limits (`429`) and server availability issues (`503`).

### Webhook Verification
Validate that incoming webhooks genuinely originated from PingBus:

```typescript
const isValid = PingBusClient.verifySignature(rawBody, signatureHeader, process.env.PINGBUS_API_KEY);
```

---

## 🧪 Testing

Tests live in the `tests/` directory and are split into unit and integration suites.

### Unit Tests (no credentials needed)

Run from the **SDK root**:
```bash
npm test                        # run all tests
npm run test:unit               # unit tests only
```

Or from the `tests/` directory:
```bash
cd tests
npm test
npm run test:unit
```

### Integration Tests (live API)

Integration tests hit the real PingBus production API. Set the following environment variables before running:

```bash
# Required
export PINGBUS_API_KEY="pk_your_key_here"
export PINGBUS_INSTANCE_ID="waInstance4256253175"   # your WhatsApp instance
export PINGBUS_TEST_PHONE="919876543210@c.us"       # recipient for test messages

# Optional
export PINGBUS_BASE_URL="https://www.pingbus.live"  # defaults to production
```

Then run:

```bash
# From SDK root
npm run test:integration

# From tests/ directory
cd tests
npm run test:integration
```

With coverage report:
```bash
cd tests
npm test -- --coverage
```

Watch mode during development:
```bash
cd tests
npm run test:watch
```

---

## 📄 License
MIT © PingBus 2026
