# PingBus Java SDK (`pingbus-java`)

A robust, multi-service Java client for the PingBus Notification Gateway. Built on `OkHttp` and `Gson`, it is compatible with Android and Java 11+.

## 🚀 Quick Start

### Installation (Maven)
```xml
<dependency>
  <groupId>com.pingbus</groupId>
  <artifactId>pingbus-java</artifactId>
  <version>1.6.0</version>
</dependency>
```

### Basic Usage
```java
import com.pingbus.PingBusClient;
import com.pingbus.models.EmailOptions;

public class Main {
    public static void main(String[] args) throws Exception {
        // Automatically picks up PINGBUS_API_KEY from environment if null
        PingBusClient client = new PingBusClient(null, "https://api.pingbus.com");

        // Send a WhatsApp Message
        client.whatsapp.sendMessage("inst_123", "1234567890@c.us", "Hello from Java!");

        // Send an Email
        EmailOptions options = new EmailOptions();
        options.isHtml = true;
        client.email.send("user@example.com", "Hello", "<h1>Welcome!</h1>", options);
    }
}
```

### Unified Orchestration
Trigger notifications across multiple channels simultaneously or via a waterfall fallback system using a single, idempotent API call.
```java
import java.util.Map;

Map<String, Object> payload = Map.of(
    "idempotencyKey", "unique-uuid-v4",
    "event", "order_shipped",
    "targets", Map.of(
        "whatsapp", Map.of("instanceId", "wa_123", "chatId", "1234567890@c.us"),
        "sms", Map.of("to", "+19876543210")
    ),
    "content", Map.of(
        "title", "Order Shipped!",
        "body", "Hi {{name}}, your order #{{orderId}} is on the way."
    ),
    "variables", Map.of("name", "Alice", "orderId", "ORD-777"),
    "strategy", "waterfall",
    "config", Map.of("waterfallTimeoutMs", 300000)
);

String response = client.dispatch.trigger(payload);

// Check dispatch status
String status = client.dispatch.getStatus("unique-uuid-v4");
```

---

## 🔑 Configuration Reference

The `PingBusClient` constructor manages global settings and authentication.

| Option | Env Variable | Default |
|---|---|---|
| `apiKey` | `PINGBUS_API_KEY` | **Required** |
| `baseUrl` | `PINGBUS_BASE_URL` | `https://api.pingbus.com` |

```java
PingBusClient client = new PingBusClient("pk_your_key", "https://api.pingbus.com");
```

---

## ⚡ Key Features

*   **Service-Oriented Architecture:** Methods are logically grouped under `client.whatsapp`, `client.email`, `client.push`, `client.sms`, etc.
*   **Automatic Auth Injection:** The SDK automatically handles the dual-auth requirements (Bearer token for REST, Path token for WhatsApp).
*   **Built-in Resilience:** Core request logic includes automated retries with exponential backoff for `429` (Rate Limits) and `5xx` (Server Errors).
*   **Type Safety:** Uses typed models for all request payloads and responses to ensure compile-time safety.

---

## 📦 Core Dependencies
*   `okhttp`: Production-grade HTTP client with connection pooling.
*   `gson`: Efficient JSON serialization/deserialization.

## 📄 License
MIT © PingBus 2026
