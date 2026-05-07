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

  // Stubs (as per Section 3.2)
  async sendPoll(instanceId: string, chatId: string, pollName: string, options: string[]): Promise<any> {
    throw new Error('Method sendPoll not implemented');
  }
  async sendLocation(instanceId: string, chatId: string, lat: number, lng: number, title?: string): Promise<any> {
    throw new Error('Method sendLocation not implemented');
  }
  async sendContact(instanceId: string, chatId: string, contactNumber: string, contactName: string): Promise<any> {
    throw new Error('Method sendContact not implemented');
  }
  async createGroup(instanceId: string, groupName: string, participants: string[]): Promise<any> {
    throw new Error('Method createGroup not implemented');
  }
  async checkWhatsapp(instanceId: string, phoneNumber: string): Promise<any> {
    throw new Error('Method checkWhatsapp not implemented');
  }
}
