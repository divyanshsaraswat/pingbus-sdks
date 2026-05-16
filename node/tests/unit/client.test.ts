/**
 * Unit Tests: PingBusClient instantiation & configuration
 * Tests that the client initialises correctly and validates its config.
 */

// Mock fetch globally before any imports
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { PingBusClient } from '../../src/client';

describe('PingBusClient – Instantiation', () => {
  afterEach(() => {
    mockFetch.mockReset();
    delete process.env.PINGBUS_API_KEY;
    delete process.env.PINGBUS_BASE_URL;
    delete process.env.PINGBUS_TIMEOUT;
  });

  test('throws if no apiKey is provided', () => {
    expect(() => new PingBusClient({ apiKey: '' })).toThrow(
      'PingBus API Key is required'
    );
  });

  test('accepts apiKey in config', () => {
    expect(() => new PingBusClient({ apiKey: 'pk_test_123' })).not.toThrow();
  });

  test('reads apiKey from PINGBUS_API_KEY environment variable', () => {
    process.env.PINGBUS_API_KEY = 'pk_env_key';
    // Pass empty string – the client should fall back to env var
    const client = new PingBusClient({ apiKey: '' } as any);
    expect(client).toBeDefined();
  });

  test('uses default baseUrl when not specified', () => {
    const client = new PingBusClient({ apiKey: 'pk_test_123' });
    // Access protected config via any cast
    expect((client.whatsapp as any).config.baseUrl).toBe('https://api.pingbus.com');
  });

  test('reads baseUrl from PINGBUS_BASE_URL env var', () => {
    process.env.PINGBUS_BASE_URL = 'http://localhost:8000';
    const client = new PingBusClient({ apiKey: 'pk_test_123' });
    expect((client.whatsapp as any).config.baseUrl).toBe('http://localhost:8000');
  });

  test('uses default timeout of 30000ms', () => {
    const client = new PingBusClient({ apiKey: 'pk_test_123' });
    expect((client.whatsapp as any).config.timeout).toBe(30000);
  });

  test('reads timeout from PINGBUS_TIMEOUT env var', () => {
    process.env.PINGBUS_TIMEOUT = '5000';
    const client = new PingBusClient({ apiKey: 'pk_test_123' });
    expect((client.whatsapp as any).config.timeout).toBe(5000);
  });

  test('overrides timeout with explicit config', () => {
    const client = new PingBusClient({ apiKey: 'pk_test_123', timeout: 15000 });
    expect((client.whatsapp as any).config.timeout).toBe(15000);
  });

  test('exposes all service namespaces', () => {
    const client = new PingBusClient({ apiKey: 'pk_test_123' });
    expect(client.whatsapp).toBeDefined();
    expect(client.email).toBeDefined();
    expect(client.push).toBeDefined();
    expect(client.sms).toBeDefined();
    expect(client.account).toBeDefined();
    expect(client.balance).toBeDefined();
    expect(client.proxies).toBeDefined();
    expect(client.dispatch).toBeDefined();
  });

  test('exposes static verifySignature method', () => {
    expect(typeof PingBusClient.verifySignature).toBe('function');
  });
});
