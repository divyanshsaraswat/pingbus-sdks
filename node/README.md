# PingBus Node.js SDK (`@pingbus/sdk`)

A production-ready TypeScript SDK for the PingBus Notification Gateway. Features native `fetch` support and first-class **TanStack React Query** integration.

## 📦 Installation

```bash
npm install @pingbus/sdk @tanstack/react-query
```

## 🚀 Quick Start

### Basic Usage (Node.js)
```typescript
import { PingBusClient } from '@pingbus/sdk';

const client = new PingBusClient({
  apiKey: process.env.PINGBUS_API_KEY,
  timeout: 30000
});

// Send a WhatsApp Message
await client.whatsapp.sendMessage('instance_123', '1234567890@s.whatsapp.net', 'Hello World!');
```

### React Integration (TanStack Query)
The SDK provides a built-in Context Provider and custom hooks for frontend apps.

```tsx
import { PingBusClient, PingBusProvider, useWhatsAppStatus } from '@pingbus/sdk';

const client = new PingBusClient({ apiKey: 'pk_...' });

function App() {
  return (
    <PingBusProvider client={client}>
      <Dashboard />
    </PingBusProvider>
  );
}

function Dashboard() {
  const { data, isLoading } = useWhatsAppStatus('instance_123');
  
  if (isLoading) return <p>Loading...</p>;
  return <div>Status: {data.status}</div>;
}
```

## 🛡️ Reliability Features
- **Auto-Retry**: Implements Exponential Backoff with Jitter for `429` and `5xx` errors.
- **Webhook Security**: Use `PingBusClient.verifySignature(body, signature, key)` for HMAC validation.
- **Environment Aware**: Automatically detects `PINGBUS_API_KEY` and `PINGBUS_BASE_URL`.
