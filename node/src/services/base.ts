import { PingBusConfig, RequestOptions } from '../types';
import { withRetry } from '../utils/retry';

export abstract class BaseService {
  constructor(protected config: PingBusConfig) {}

  protected async request<T>(
    method: string,
    path: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl || 'https://api.pingbus.com');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
    };

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

      // Some endpoints (e.g. Green API) return 200 with an empty body.
      // We read the raw text first and only parse if non-empty,
      // which avoids "Unexpected end of JSON input" on empty bodies.
      // The headers check is optional — we fall back safely if headers.get is absent.
      let data: any = null;
      if (response.status !== 204) {
        const text = typeof response.text === 'function'
          ? await response.text()
          : await response.json().then(JSON.stringify).catch(() => '');
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            // Non-JSON body (e.g. plain text) — return as-is
            data = text;
          }
        }
      }

      if (!response.ok) {
        const error = new Error((data && data.error) || `HTTP ${response.status}`);
        (error as any).status = response.status;
        (error as any).code = (data && data.code) || 'INTERNAL_ERROR';
        throw error;
      }

      return data;
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw err;
    }
  }
}
