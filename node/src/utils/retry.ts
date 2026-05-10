import { RequestOptions } from '../types';

export interface RetryConfig {
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  initialDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: 1000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: RequestOptions,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  const maxRetries = options?.retries ?? 3;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error: any) {
      // Only retry on transient errors (429, 503, 504)
      const status = error.status || (error.response?.status);
      const isTransient = [429, 503, 504].includes(status);

      if (!isTransient || attempt >= maxRetries) {
        throw error;
      }

      const waitTime = Math.min(
        config.maxDelay,
        config.initialDelay * Math.pow(config.backoffFactor, attempt)
      ) + Math.random() * config.jitter;

      await new Promise((resolve) => setTimeout(resolve, waitTime));
      attempt++;
    }
  }
}
