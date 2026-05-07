package com.pingbus;

import okhttp3.*;
import com.google.gson.Gson;
import com.pingbus.models.*;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class PingBusClient {
    private final String apiKey;
    private final String baseUrl;
    private final OkHttpClient httpClient;
    private final Gson gson = new Gson();

    public final WhatsAppService whatsapp;
    public final EmailService email;
    public final PushService push;
    public final SmsService sms;
    public final AccountService account;
    public final BalanceService balance;
    public final ProxyService proxies;

    public PingBusClient(String apiKey, String baseUrl) {
        this.apiKey = apiKey != null ? apiKey : System.getenv("PINGBUS_API_KEY");
        this.baseUrl = baseUrl != null ? baseUrl : System.getenv("PINGBUS_BASE_URL");
        
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build();

        this.whatsapp = new WhatsAppService(this);
        this.email = new EmailService(this);
        this.push = new PushService(this);
        this.sms = new SmsService(this);
        this.account = new AccountService(this);
        this.balance = new BalanceService(this);
        this.proxies = new ProxyService(this);
    }

    protected Response executeRequest(Request request) throws IOException {
        int attempts = 0;
        while (attempts < 3) {
            Response response = httpClient.newCall(request).execute();
            if (response.code() == 429 || response.code() >= 503) {
                try { Thread.sleep(1000 * (long)Math.pow(2, attempts)); } catch (InterruptedException e) {}
                attempts++;
                continue;
            }
            return response;
        }
        throw new IOException("Failed after 3 retries");
    }

    public class WhatsAppService {
        private final PingBusClient parent;
        WhatsAppService(PingBusClient parent) { this.parent = parent; }

        public void sendMessage(String instanceId, String chatId, String message) throws IOException {
            String url = String.format("%s/waInstance%s/sendMessage/%s", parent.baseUrl, instanceId, parent.apiKey);
            Map<String, String> payload = Map.of("chatId", chatId, "message", message);
            RequestBody body = RequestBody.create(gson.toJson(payload), MediaType.get("application/json"));
            Request request = new Request.Builder().url(url).post(body).build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
            }
        }

        public void sendFileByUrl(String instanceId, String chatId, String urlFile, String fileName, String caption) throws IOException {
            String url = String.format("%s/waInstance%s/sendFileByUrl/%s", parent.baseUrl, instanceId, parent.apiKey);
            Map<String, String> payload = Map.of("chatId", chatId, "urlFile", urlFile, "fileName", fileName != null ? fileName : "", "caption", caption != null ? caption : "");
            RequestBody body = RequestBody.create(gson.toJson(payload), MediaType.get("application/json"));
            Request request = new Request.Builder().url(url).post(body).build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
            }
        }

        public String receiveNotification(String instanceId) throws IOException {
            String url = String.format("%s/waInstance%s/receiveNotification/%s", parent.baseUrl, instanceId, parent.apiKey);
            Request request = new Request.Builder().url(url).get().build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
                return resp.body().string();
            }
        }
    }

    public class EmailService {
        private final PingBusClient parent;
        EmailService(PingBusClient parent) { this.parent = parent; }
        public void send(String to, String subject, String body, EmailOptions options) throws IOException {
            String url = parent.baseUrl + "/api/channels/email/send";
            Map<String, Object> payload = new java.util.HashMap<>(Map.of("to", to, "subject", subject, "body", body));
            if (options != null) {
                payload.put("isHtml", options.isHtml);
                payload.put("from", options.from);
            }
            RequestBody rb = RequestBody.create(gson.toJson(payload), MediaType.get("application/json"));
            Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .post(rb)
                .build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
            }
        }

        public String listLogs(int limit, int offset) throws IOException {
            String url = String.format("%s/api/channels/email/logs?limit=%d&offset=%d", parent.baseUrl, limit, offset);
            Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .get()
                .build();
            try (Response resp = parent.executeRequest(request)) {
                return resp.body().string();
            }
        }
    }

    public class PushService {
        private final PingBusClient parent;
        PushService(PingBusClient parent) { this.parent = parent; }
        public void send(PushTarget target, Map<String, Object> notification) throws IOException {
            String url = parent.baseUrl + "/api/channels/push/send";
            Map<String, Object> payload = Map.of("target", target, "notification", notification);
            RequestBody rb = RequestBody.create(gson.toJson(payload), MediaType.get("application/json"));
            Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .post(rb)
                .build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
            }
        }
    }

    public class SmsService {
        private final PingBusClient parent;
        SmsService(PingBusClient parent) { this.parent = parent; }
        public void send(String to, String body, String instanceId) throws IOException {
            String url = parent.baseUrl + "/api/channels/sms/send";
            Map<String, String> payload = new java.util.HashMap<>(Map.of("to", to, "body", body));
            if (instanceId != null) payload.put("instanceId", instanceId);
            RequestBody rb = RequestBody.create(gson.toJson(payload), MediaType.get("application/json"));
            Request request = new Request.Builder()
                .url(url)
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .post(rb)
                .build();
            try (Response resp = parent.executeRequest(request)) {
                if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code());
            }
        }
    }

    public class AccountService {
        private final PingBusClient parent;
        AccountService(PingBusClient parent) { this.parent = parent; }
        public String getProfile() throws IOException {
            Request request = new Request.Builder()
                .url(parent.baseUrl + "/api/account")
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .get()
                .build();
            try (Response resp = parent.executeRequest(request)) { return resp.body().string(); }
        }
    }

    public class BalanceService {
        private final PingBusClient parent;
        BalanceService(PingBusClient parent) { this.parent = parent; }
        public String getBalance() throws IOException {
            Request request = new Request.Builder()
                .url(parent.baseUrl + "/api/balance")
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .get()
                .build();
            try (Response resp = parent.executeRequest(request)) { return resp.body().string(); }
        }
    }

    public class ProxyService {
        private final PingBusClient parent;
        ProxyService(PingBusClient parent) { this.parent = parent; }
        public void provision() throws IOException {
            Request request = new Request.Builder()
                .url(parent.baseUrl + "/api/proxies")
                .addHeader("Authorization", "Bearer " + parent.apiKey)
                .post(RequestBody.create("", null))
                .build();
            try (Response resp = parent.executeRequest(request)) { if (!resp.isSuccessful()) throw new IOException("HTTP " + resp.code()); }
        }
    }
}
