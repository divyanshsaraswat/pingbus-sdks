# PingBus Java SDK (`pingbus-java`)

A robust Java client for PingBus built on `OkHttp` and `Gson`. Compatible with Android and Java 11+.

## 🚀 Quick Start

```java
import com.pingbus.PingBusClient;

public class Main {
    public static void main(String[] args) throws Exception {
        PingBusClient client = new PingBusClient("your_api_key", null);

        // Send a Push Notification
        client.push.send(
            new PushTarget("user", "user_99"),
            Map.of("title", "Hello", "body", "World")
        );
    }
}
```

## 🛠️ Features
- **Connection Pooling**: Uses `OkHttp` for efficient TCP connection reuse.
- **POJO Mapping**: All responses are mapped to typed models using `Gson`.
- **Stateless Execution**: Designed for multi-instance high-concurrency environments.

## 📦 Dependencies
- `com.squareup.okhttp3:okhttp:4.11.0`
- `com.google.code.gson:gson:2.10.1`
