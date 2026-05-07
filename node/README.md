# PingBus Node.js SDK (`@pingbus/sdk`)

A production-grade TypeScript SDK for the PingBus Notification Gateway. Features native `fetch` support, full type safety, and first-class integration for multi-channel messaging.

## 📦 Installation

```bash
npm install @pingbus/sdk
```

## 🔑 Configuration

The client supports automatic environment detection for ease of deployment.

| Option | Env Variable | Default | Description |
|---|---|---|---|
| `apiKey` | `PINGBUS_API_KEY` | **Required** | Your `pk_...` API key. |
| `baseUrl` | `PINGBUS_BASE_URL` | `https://api.pingbus.com` | Backend server URL. |
| `timeout` | `PINGBUS_TIMEOUT` | `30000` | Global timeout in ms. |

```typescript
import { PingBusClient } from '@pingbus/sdk';

const client = new PingBusClient({
  apiKey: 'pk_your_key_here',
  timeout: 45000 // Optional override
});
```

---

## 🚀 Unified Orchestration (`client.dispatch`)

Trigger notifications across multiple channels simultaneously or via a waterfall fallback system using a single, idempotent API call.

```typescript
// Trigger a multi-channel dispatch
const result = await client.dispatch.trigger({
  idempotencyKey: 'unique-uuid-v4',
  event: 'order_shipped',
  targets: {
    whatsapp: { instanceId: 'wa_123', chatId: '1234567890@c.us' },
    email: { to: 'customer@example.com' },
    sms: { to: '+19876543210' }
  },
  content: {
    title: 'Order Shipped!',
    body: 'Hi {{name}}, your order #{{orderId}} is on the way.'
  },
  variables: { name: 'Alice', orderId: 'ORD-777' },
  strategy: 'waterfall', // or 'parallel'
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
await client.whatsapp.sendMessage('instance_id', '1234567890@c.us', 'Hello from Node!');

// Send a file from URL
await client.whatsapp.sendFileByUrl('instance_id', '1234567890@c.us', 'https://example.com/inv.pdf', 'invoice.pdf', 'Your Invoice');
```

### Advanced Features
```typescript
// Send a Poll
await client.whatsapp.sendPoll('instance_id', '1234@g.us', 'Lunch?', ['Pizza', 'Sushi']);

// Manage Groups
await client.whatsapp.createGroup('instance_id', 'Project Alpha', ['user1@c.us', 'user2@c.us']);

// Check existence
const res = await client.whatsapp.checkWhatsapp('instance_id', '1234567890');
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

## ☁️ Cloud & Management

```typescript
// Check Credits
const balance = await client.balance.getBalance();

// Provision Proxies for WhatsApp
const proxy = await client.proxies.provision();
await client.proxies.attach(proxy.id, 'instance_id');
```

---

## 🛡️ Reliability & Security

### Automatic Retries
The SDK implements **Exponential Backoff with Jitter** as defined in the PingBus Master Spec (v1.6). It automatically handles rate limits (`429`) and server availability issues (`503`).

### Webhook Verification
Validate that incoming webhooks genuinely originated from PingBus:

```typescript
const isValid = PingBusClient.verifySignature(rawBody, signatureHeader, process.env.PINGBUS_API_KEY);
```

## 📄 License
MIT © PingBus 2026
