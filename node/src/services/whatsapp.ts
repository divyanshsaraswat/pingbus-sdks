import { BaseService } from './base';
import { Notification, RequestOptions, PingBusResponse } from '../types';

export class WhatsAppService extends BaseService {
  async sendMessage(
    instanceId: string,
    chatId: string,
    msg: string,
    options?: RequestOptions
  ): Promise<PingBusResponse<any>> {
    return this.request(
      'POST',
      `/waInstance${instanceId}/sendMessage/${this.config.apiKey}`,
      { chatId, message: msg },
      options,
      true
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
      `/waInstance${instanceId}/sendFileByUrl/${this.config.apiKey}`,
      { chatId, urlFile: url, fileName: name, caption },
      options,
      true
    );
  }

  async receive(
    instanceId: string,
    options?: RequestOptions
  ): Promise<Notification | null> {
    return this.request(
      'GET',
      `/waInstance${instanceId}/receiveNotification/${this.config.apiKey}`,
      undefined,
      options,
      true
    );
  }

  async getQr(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('GET', `/waInstance${instanceId}/qr/${this.config.apiKey}`, undefined, options, true);
  }

  async getStatus(instanceId: string, options?: RequestOptions): Promise<any> {
    return this.request('GET', `/waInstance${instanceId}/getStateInstance/${this.config.apiKey}`, undefined, options, true);
  }

  async updateWebhook(instanceId: string, url: string, options?: RequestOptions): Promise<any> {
    return this.request('PATCH', `/api/instances/${instanceId}/webhook`, { webhookUrl: url }, options);
  }

  // Advanced WhatsApp Methods
  async sendPoll(instanceId: string, chatId: string, pollName: string, options: string[], requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/sendPoll/${this.config.apiKey}`, { chatId, pollName, options }, requestOptions, true);
  }

  async sendLocation(instanceId: string, chatId: string, lat: number, lng: number, title?: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/sendLocation/${this.config.apiKey}`, { chatId, latitude: lat, longitude: lng, name: title }, requestOptions, true);
  }

  async sendContact(instanceId: string, chatId: string, contactNumber: string, contactName: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/sendContact/${this.config.apiKey}`, { chatId, phoneNumber: contactNumber, contactName }, requestOptions, true);
  }

  async createGroup(instanceId: string, groupName: string, participants: string[], requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/createGroup/${this.config.apiKey}`, { groupName, participants }, requestOptions, true);
  }

  async checkWhatsapp(instanceId: string, phoneNumber: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/checkWhatsapp/${this.config.apiKey}`, { phoneNumber }, requestOptions, true);
  }

  async getChatHistory(instanceId: string, chatId: string, limit?: number, requestOptions?: RequestOptions): Promise<any> {
    return this.request('GET', `/waInstance${instanceId}/getChatHistory/${this.config.apiKey}`, { chatId, limit }, requestOptions, true);
  }

  async readChat(instanceId: string, chatId: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/readChat/${this.config.apiKey}`, { chatId }, requestOptions, true);
  }

  async archiveChat(instanceId: string, chatId: string, archive: boolean, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/archiveChat/${this.config.apiKey}`, { chatId, archive }, requestOptions, true);
  }

  async deleteMessage(instanceId: string, chatId: string, messageId: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('POST', `/waInstance${instanceId}/deleteMessage/${this.config.apiKey}`, { chatId, messageId }, requestOptions, true);
  }

  async logout(instanceId: string, requestOptions?: RequestOptions): Promise<any> {
    return this.request('GET', `/waInstance${instanceId}/logout/${this.config.apiKey}`, undefined, requestOptions, true);
  }
}
