package com.pingbus.models;

public class EmailLog {
    public String id;
    public String to;
    public String subject;
    public String status;
    public String sentAt;
    public String error;
}

public class Notification {
    public String id;
    public String chatId;
    public String message;
    public String senderName;
    public long timestamp;
    public String typeWebhook;
}

public class Transaction {
    public String id;
    public String date;
    public String description;
    public double amount;
    public String status;
    public String type;
}

public class EmailOptions {
    public boolean isHtml;
    public String from;
    public String instanceId;
}

public class PushTarget {
    public String type;
    public String userId;
    public String token;
    public String topic;
}
