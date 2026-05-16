import { BaseService } from './base';
import { Notification, RequestOptions, PingBusResponse } from '../types';

export class WhatsAppService extends BaseService {
  private clean(id: string): string {
    return id.replace(/^waInstance/i, '');
  }

  async sendMessage(
    instanceId: string,
    chatId: string,
    msg: string,
    options?: RequestOptions
  ): Promise<PingBusResponse<any>> {
    return this.request(
      'POST',
      `/api/waInstance${this.clean(instanceId)}/sendMessage`,
      { chatId, message: msg },
      options
    );
  }

  async sendFileByUrl(
    instanceId: string,
    chatId: string,
    url: string,
    name?: string,
    caption?: string,
    options?: RequestOptions
  ): Promise<PingBusResponse<any>> {
    return this.request(
      'POST',
      `/api/waInstance${this.clean(instanceId)}/sendFileByUrl`,
      { chatId, urlFile: url, fileName: name, caption },
      options
    );
  }

  async receive(
    instanceId: string,
    options?: RequestOptions
  ): Promise<Notification | null> {
    return this.request(
      'GET',
      `/api/waInstance${this.clean(instanceId)}/receiveNotification`,
      undefined,
      options
    );
  }

  async getQr(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('GET', `/api/waInstance${this.clean(instanceId)}/qr`, undefined, options);
  }

  async getStatus(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('GET', `/api/waInstance${this.clean(instanceId)}/getStateInstance`, undefined, options);
  }

  async updateWebhook(instanceId: string, url: string, options?: RequestOptions): Promise<any> {
    return this.request('PATCH', `/api/instances/${instanceId}/webhook`, { webhookUrl: url }, options);
  }

  async sendPoll(instanceId: string, chatId: string, pollName: string, pollOptions: string[], options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/sendPoll`, { chatId, pollName, options: pollOptions }, options);
  }

  async sendLocation(instanceId: string, chatId: string, lat: number, lng: number, title?: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/sendLocation`, { chatId, latitude: lat, longitude: lng, name: title }, options);
  }

  async sendContact(instanceId: string, chatId: string, contactNumber: string, contactName: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/sendContact`, { chatId, phoneNumber: contactNumber, contactName }, options);
  }

  async createGroup(instanceId: string, groupName: string, participants: string[], options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/createGroup`, { groupName, participants }, options);
  }

  async checkWhatsapp(instanceId: string, phoneNumber: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/checkWhatsapp`, { phoneNumber }, options);
  }

  async getChatHistory(instanceId: string, chatId: string, limit?: number, options?: RequestOptions): Promise<any> {
    const query = new URLSearchParams({ chatId, ...(limit ? { limit: String(limit) } : {}) });
    return this.request('GET', `/api/waInstance${this.clean(instanceId)}/getChatHistory?${query}`, undefined, options);
  }

  async readChat(instanceId: string, chatId: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/readChat`, { chatId }, options);
  }

  async archiveChat(instanceId: string, chatId: string, archive: boolean, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/archiveChat`, { chatId, archive }, options);
  }

  async deleteMessage(instanceId: string, chatId: string, messageId: string, options?: RequestOptions): Promise<any> {
    return this.request('POST', `/api/waInstance${this.clean(instanceId)}/deleteMessage`, { chatId, messageId }, options);
  }

  async logout(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('GET', `/api/waInstance${this.clean(instanceId)}/logout`, undefined, options);
  }
}
