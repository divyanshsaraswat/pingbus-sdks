import { BaseService } from './base';
import { RequestOptions, PingBusResponse, DispatchPayload } from '../types';

export class DispatchService extends BaseService {
  async trigger(payload: DispatchPayload, options?: RequestOptions): Promise<PingBusResponse<any>> {
    return this.request('POST', '/api/dispatch', payload, options);
  }

  async getStatus(dispatchId: string, options?: RequestOptions): Promise<PingBusResponse<any>> {
    return this.request('GET', `/api/dispatch/${dispatchId}`, undefined, options);
  }
}
