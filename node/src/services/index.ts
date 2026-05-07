import { BaseService } from './base';
import { 
  EmailLog, EmailOptions, SMTPConfig, RequestOptions, 
  PaginatedResponse, PingBusResponse, PushTarget, FCMConfig,
  TwilioConfig, Transaction
} from '../types';

export class EmailService extends BaseService {
  async send(to: string, subject: string, body: string, options?: EmailOptions & RequestOptions): Promise<PingBusResponse<any>> {
    return this.request('POST', '/api/channels/email/send', { to, subject, body, ...options }, options);
  }
  async listLogs(limit?: number, offset?: number, options?: RequestOptions): Promise<PaginatedResponse<EmailLog>> {
    const query = new URLSearchParams({ limit: String(limit || 50), offset: String(offset || 0) });
    return this.request('GET', `/api/channels/email/logs?${query}`, undefined, options);
  }
  async testConnection(config: SMTPConfig, options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/channels/email/instances/test-connection', config, options);
  }
  async sendTestEmail(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/channels/email/instances/${instanceId}/test`, undefined, options);
  }
}

export class PushService extends BaseService {
  async send(target: PushTarget, notification: any, data?: any, options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/channels/push/send', { target, notification, data }, options);
  }
  async register(userId: string, token: string, platform: string, instanceId?: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/channels/push/register', { userId, token, platform, instanceId }, options);
  }
  async listLogs(limit?: number, options?: RequestOptions): Promise<PaginatedResponse<any>> {
    return this.request('GET', `/api/channels/push/logs?limit=${limit || 50}`, undefined, options);
  }
}

export class SmsService extends BaseService {
  async send(to: string, body: string, instanceId?: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/channels/sms/send', { to, body, instanceId }, options);
  }
  async listLogs(limit?: number, options?: RequestOptions): Promise<PaginatedResponse<any>> {
    return this.request('GET', `/api/channels/sms/logs?limit=${limit || 50}`, undefined, options);
  }
}

export class AccountService extends BaseService {
  async getProfile(options?: RequestOptions): Promise<any> {
    return this.request('GET', '/api/account', undefined, options);
  }
  async updateProfile(data: { name: string }, options?: RequestOptions): Promise<any> {
    return this.request('PATCH', '/api/account', data, options);
  }
  async listKeys(options?: RequestOptions): Promise<any> {
    return this.request('GET', '/api/account/keys', undefined, options);
  }
  async createKey(name: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/account/keys', { name }, options);
  }
  async deleteKey(keyId: string, options?: RequestOptions): Promise<any> {
    return this.request('DELETE', `/api/account/keys/${keyId}`, undefined, options);
  }
}

export class BalanceService extends BaseService {
  async getBalance(options?: RequestOptions): Promise<any> {
    return this.request('GET', '/api/balance', undefined, options);
  }
  async listPurchases(options?: RequestOptions): Promise<Transaction[]> {
    return this.request('GET', '/api/balance/purchases', undefined, options);
  }
}

export class ProxyService extends BaseService {
  async list(options?: RequestOptions): Promise<any[]> {
    return this.request('GET', '/api/proxies', undefined, options);
  }
  async provision(options?: RequestOptions): Promise<any> {
    return this.request('POST', '/api/proxies', undefined, options);
  }
  async attach(proxyId: string, instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/proxies/${proxyId}/attach`, { instanceId }, options);
  }
  async detach(proxyId: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/proxies/${proxyId}/detach`, undefined, options);
  }
}
