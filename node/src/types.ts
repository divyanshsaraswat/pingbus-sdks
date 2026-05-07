export interface PingBusConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
}

export interface PingBusResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
}

export interface PaginatedResponse<T> {
  total: number;
  limit: number;
  offset: number;
  data: T[];
}

export interface Notification {
  id: string;
  chatId: string;
  message: string;
  senderName: string;
  timestamp: number;
  typeWebhook: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: 'queued' | 'sent' | 'failed';
  sentAt: string;
  error?: string;
}

export interface EmailOptions {
  isHtml?: boolean;
  from?: string;
  instanceId?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  type: 'credit' | 'debit';
}

export interface SMTPConfig {
  name: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export type PushTarget = 
  | { type: 'user'; userId: string }
  | { type: 'token'; token: string }
  | { type: 'topic'; topic: string };

export interface FCMConfig {
  name: string;
  serviceAccountBase64: string;
}

export interface TwilioConfig {
  name: string;
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export interface DispatchPayload {
  idempotencyKey: string;
  event: string;
  targets: {
    whatsapp?: { instanceId: string; chatId: string };
    email?: { to: string; instanceId?: string };
    sms?: { to: string; instanceId?: string };
    push?: { type: string; userId?: string; token?: string; topic?: string };
    webhook?: { targetUrl: string; method?: string; headers?: Record<string, string>; payload?: any };
  };
  content: {
    title?: string;
    body: string;
  };
  variables?: Record<string, string>;
  strategy?: 'parallel' | 'waterfall';
  config?: {
    waterfallTimeoutMs?: number;
    callbackUrl?: string;
  };
}
