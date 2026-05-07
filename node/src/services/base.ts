import { PingBusConfig, RequestOptions } from '../types';
import { withRetry } from '../utils/retry';

export abstract class BaseService {
  constructor(protected config: PingBusConfig) {}

  protected async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: RequestOptions,
    usePathToken: boolean = false
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl || 'https://api.pingbus.com');
    
    // Auth injection logic (Section 1.2)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (!usePathToken) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    const controller = new AbortController();
    const timeout = options?.timeout ?? this.config.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await withRetry(() => fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      }), options);

      clearTimeout(timeoutId);

      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.error || `HTTP ${response.status}`);
        (error as any).status = response.status;
        (error as any).code = data.code || 'INTERNAL_ERROR';
        throw error;
      }

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
