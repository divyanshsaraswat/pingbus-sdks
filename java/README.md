# PingBus Java SDK (`pingbus-java`)

[![Maven Central](https://img.shields.io/maven-central/v/com.pingbus/pingbus-java.svg?label=Maven%20Central)](https://central.sonatype.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official Java SDK for the PingBus Notification Gateway. This SDK provides a robust, type-safe, and asynchronous-friendly client for orchestrating multi-channel notifications (WhatsApp, Email, SMS, Push) through a single unified interface.

Built with performance and reliability in mind using `OkHttp 4.x` and `Gson`.

---

## 🚀 Installation

### Maven
Add the following dependency to your `pom.xml`:

```xml
<dependency>
    <groupId>io.github.divyanshsaraswat</groupId>
    <artifactId>pingbus</artifactId>
    <version>0.5.0</version>
</dependency>
```

### Gradle (Groovy)
Add to your `build.gradle`:

```gradle
implementation 'io.github.divyanshsaraswat:pingbus:0.5.0'
```

### Gradle (Kotlin DSL)
Add to your `build.gradle.kts`:

```kotlin
implementation("io.github.divyanshsaraswat:pingbus:0.5.0")
```

---

## 🛠️ Implementation & Usage

### 1. Initialization
The `PingBusClient` is the entry point for all interactions. It manages a persistent `OkHttpClient` instance with optimized connection pooling.

```java
import com.pingbus.PingBusClient;

// Initialize with your API Key
// If apiKey is null, it looks for the PINGBUS_API_KEY environment variable.
PingBusClient client = new PingBusClient("pk_live_your_key_here");
```

### 2. WhatsApp Service
Direct interaction with WhatsApp instances (Green-API compatible).

```java
// Send a text message
client.whatsapp.sendMessage("inst_12345", "1234567890@c.us", "Hello from Java SDK!");

// Send a file/media
client.whatsapp.sendFileByUrl("inst_12345", "1234567890@c.us", "https://example.com/invoice.pdf", "invoice.pdf", "Your Invoice");
```

### 3. Unified Dispatch (Recommended)
The most powerful way to use PingBus. Orchestrate multiple channels with fallback logic in one call.

```java
import java.util.Map;
import java.util.HashMap;

Map<String, Object> payload = new HashMap<>();
payload.put("event", "security_alert");
payload.put("idempotencyKey", "unique-request-id-123");

// Define targets
Map<String, Object> targets = new HashMap<>();
targets.put("whatsapp", Map.of("chatId", "1234567890@c.us", "instanceId", "inst_123"));
targets.put("email", Map.of("to", "security@company.com"));
payload.put("targets", targets);

// Content and Variables
payload.put("content", Map.of("title", "Unauthorized Login", "body", "Hi {{name}}, we detected a login from {{ip}}."));
payload.put("variables", Map.of("name", "Admin", "ip", "192.168.1.1"));

// Strategy
payload.put("strategy", "waterfall"); // Try WA first, fallback to Email if WA fails

String dispatchId = client.dispatch.trigger(payload);
```

### 4. Email & SMS Services
```java
import com.pingbus.models.EmailOptions;

// Email
EmailOptions emailOpts = new EmailOptions();
emailOpts.from = "alerts@pingbus.com";
client.email.send("user@example.com", "Subject", "Hello Body", emailOpts);

// SMS
client.sms.send("+1234567890", "Your verification code is 4455");
```

---

## ⚙️ Configuration

| Parameter | Environment Variable | Default | Description |
|-----------|----------------------|---------|-------------|
| `apiKey` | `PINGBUS_API_KEY` | - | Your PingBus Secret Key |
| `baseUrl` | `PINGBUS_BASE_URL` | `https://api.pingbus.com` | API Gateway endpoint |

---

## 🏗️ Development & Building

If you are contributing to the SDK or building from source, ensure you have **Maven 3.8+** and **JDK 11+** installed.

```bash
# Clone the repository
git clone https://github.com/divyanshsaraswat/notification-manager.git
cd sdks/java

# Build and Package
mvn clean package

# Run Tests
mvn test
```

The build will generate a standard JAR and a sources JAR in the `target/` directory.

---

## ⚡ Key Features

*   **Thread Safe:** `PingBusClient` is thread-safe and designed to be used as a singleton across your application.
*   **Auto-Retry:** Built-in exponential backoff for `429` (Rate Limited) and `5xx` (Server Error) responses.
*   **Android Compatible:** Uses standard libraries compatible with modern Android development.
*   **Type Safety:** Comprehensive model classes in `com.pingbus.models` ensure compile-time validation of your payloads.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
