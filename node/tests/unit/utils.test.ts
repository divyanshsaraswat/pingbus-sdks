/**
 * Unit Tests: verifySignature utility & retry logic
 */

import * as crypto from 'crypto';
import { verifySignature } from '../../src/utils/crypto';
import { withRetry } from '../../src/utils/retry';

// ─── verifySignature ───────────────────────────────────────────────────────────

describe('verifySignature', () => {
  const API_KEY = 'pk_secret_key_123';
  const BODY = JSON.stringify({ event: 'message.received', chatId: '919876543210@c.us' });

  function generateSignature(body: string, key: string): string {
    return crypto.createHmac('sha256', key).update(body).digest('hex');
  }

  test('returns true for a valid HMAC-SHA256 signature', () => {
    const sig = generateSignature(BODY, API_KEY);
    expect(verifySignature(BODY, sig, API_KEY)).toBe(true);
  });

  test('returns false for an incorrect signature', () => {
    const wrongSig = generateSignature(BODY, 'wrong_key');
    expect(verifySignature(BODY, wrongSig, API_KEY)).toBe(false);
  });

  test('returns false for a tampered body', () => {
    const sig = generateSignature(BODY, API_KEY);
    const tamperedBody = BODY.replace('received', 'TAMPERED');
    expect(verifySignature(tamperedBody, sig, API_KEY)).toBe(false);
  });

  test('returns false for empty signature', () => {
    expect(verifySignature(BODY, '', API_KEY)).toBe(false);
  });

  test('returns false for malformed hex signature', () => {
    expect(verifySignature(BODY, 'not-valid-hex!!', API_KEY)).toBe(false);
  });

  test('is accessible as PingBusClient.verifySignature (static)', () => {
    // Import via the client
    const { PingBusClient } = require('../../src/client');
    const sig = generateSignature(BODY, API_KEY);
    expect(PingBusClient.verifySignature(BODY, sig, API_KEY)).toBe(true);
  });
});

// ─── withRetry ─────────────────────────────────────────────────────────────────

describe('withRetry', () => {
  // Use a zero-delay config so tests run fast
  const fastConfig = { initialDelay: 0, maxDelay: 0, backoffFactor: 1, jitter: 0 };

  test('returns value immediately on first success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { retries: 3 }, fastConfig);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('retries on 429 (rate limit) and succeeds eventually', async () => {
    const rateLimitError = Object.assign(new Error('Rate limited'), { status: 429 });
    const fn = jest.fn()
      .mockRejectedValueOnce(rateLimitError)
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce('success_after_retry');

    const result = await withRetry(fn, { retries: 3 }, fastConfig);
    expect(result).toBe('success_after_retry');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('retries on 503 (service unavailable)', async () => {
    const serviceUnavailableError = Object.assign(new Error('Service unavailable'), { status: 503 });
    const fn = jest.fn()
      .mockRejectedValueOnce(serviceUnavailableError)
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { retries: 2 }, fastConfig);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('retries on 504 (gateway timeout)', async () => {
    const gatewayTimeoutError = Object.assign(new Error('Gateway timeout'), { status: 504 });
    const fn = jest.fn()
      .mockRejectedValueOnce(gatewayTimeoutError)
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { retries: 2 }, fastConfig);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  test('does NOT retry on 401 (auth error) – throws immediately', async () => {
    const authError = Object.assign(new Error('Auth failed'), { status: 401 });
    const fn = jest.fn().mockRejectedValue(authError);

    await expect(withRetry(fn, { retries: 3 }, fastConfig)).rejects.toMatchObject({
      status: 401,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('does NOT retry on 400 (validation error)', async () => {
    const validationError = Object.assign(new Error('Bad request'), { status: 400 });
    const fn = jest.fn().mockRejectedValue(validationError);

    await expect(withRetry(fn, { retries: 3 }, fastConfig)).rejects.toMatchObject({
      status: 400,
    });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test('exhausts retries and throws the last error', async () => {
    const rateLimitError = Object.assign(new Error('Still rate limited'), { status: 429 });
    const fn = jest.fn().mockRejectedValue(rateLimitError);

    await expect(withRetry(fn, { retries: 2 }, fastConfig)).rejects.toMatchObject({
      status: 429,
    });
    // Called 1 (initial) + 2 retries = 3 times
    expect(fn).toHaveBeenCalledTimes(3);
  });

  test('uses default 3 retries when no options provided', async () => {
    const error = Object.assign(new Error('Rate limited'), { status: 429 });
    const fn = jest.fn().mockRejectedValue(error);

    await expect(withRetry(fn, undefined, fastConfig)).rejects.toBeDefined();
    expect(fn).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  });
});
