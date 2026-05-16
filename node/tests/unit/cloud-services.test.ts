/**
 * Unit Tests: AccountService, BalanceService, ProxyService, DispatchService
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { PingBusClient } from '../../src/client';

const API_KEY = 'pk_test_cloud';
const BASE_URL = 'http://localhost:8000';

function makeClient() {
  return new PingBusClient({ apiKey: API_KEY, baseUrl: BASE_URL });
}

function mockOkResponse(data: any) {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
}

// ─── AccountService ────────────────────────────────────────────────────────────

describe('AccountService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('getProfile', () => {
    test('GETs /api/account with Authorization header', async () => {
      mockOkResponse({ id: 'user_01', name: 'Alice', email: 'alice@example.com' });
      await client.account.getProfile();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/account');
      expect(opts.method).toBe('GET');
      expect(opts.headers['Authorization']).toBe(`Bearer ${API_KEY}`);
    });
  });

  describe('updateProfile', () => {
    test('PATCHes /api/account with name', async () => {
      mockOkResponse({ success: true, data: { name: 'Bob' }, error: null });
      await client.account.updateProfile({ name: 'Bob' });
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/account');
      expect(opts.method).toBe('PATCH');
      const body = JSON.parse(opts.body);
      expect(body.name).toBe('Bob');
    });
  });

  describe('listKeys', () => {
    test('GETs /api/account/keys', async () => {
      mockOkResponse([{ id: 'key_01', name: 'Production', createdAt: '2026-01-01' }]);
      await client.account.listKeys();
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/account/keys');
    });
  });

  describe('createKey', () => {
    test('POSTs name to /api/account/keys', async () => {
      mockOkResponse({ id: 'key_02', name: 'Staging', key: 'pk_staging_xyz' });
      await client.account.createKey('Staging');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/account/keys');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body.name).toBe('Staging');
    });
  });

  describe('deleteKey', () => {
    test('DELETEs /api/account/keys/:id', async () => {
      mockOkResponse({ success: true });
      await client.account.deleteKey('key_02');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/account/keys/key_02');
      expect(opts.method).toBe('DELETE');
    });
  });
});

// ─── BalanceService ────────────────────────────────────────────────────────────

describe('BalanceService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('getBalance', () => {
    test('GETs /api/balance and returns balance data', async () => {
      mockOkResponse({ balance: 250.75, currency: 'USD' });
      const result = await client.balance.getBalance();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/balance');
      expect(opts.method).toBe('GET');
      expect((result as any).balance).toBe(250.75);
    });
  });

  describe('listPurchases', () => {
    test('GETs /api/balance/purchases and returns Transaction array', async () => {
      const transactions = [
        {
          id: 'tx_01',
          date: '2026-05-01',
          description: 'Credit top-up',
          amount: 100,
          status: 'completed',
          type: 'credit',
        },
      ];
      mockOkResponse(transactions);
      const result = await client.balance.listPurchases();
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/balance/purchases');
      expect(Array.isArray(result)).toBe(true);
      expect(result[0].type).toBe('credit');
    });
  });
});

// ─── ProxyService ──────────────────────────────────────────────────────────────

describe('ProxyService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('list', () => {
    test('GETs /api/proxies', async () => {
      mockOkResponse([]);
      await client.proxies.list();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/proxies');
      expect(opts.method).toBe('GET');
    });
  });

  describe('provision', () => {
    test('POSTs to /api/proxies to create new proxy', async () => {
      mockOkResponse({ id: 'proxy_01', host: '10.0.0.1', port: 3128 });
      await client.proxies.provision();
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/proxies');
      expect(opts.method).toBe('POST');
    });
  });

  describe('attach', () => {
    test('POSTs instanceId to /api/proxies/:id/attach', async () => {
      mockOkResponse({ success: true });
      await client.proxies.attach('proxy_01', 'inst_wa_001');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/proxies/proxy_01/attach');
      const body = JSON.parse(opts.body);
      expect(body.instanceId).toBe('inst_wa_001');
    });
  });

  describe('detach', () => {
    test('POSTs to /api/proxies/:id/detach with no body', async () => {
      mockOkResponse({ success: true });
      await client.proxies.detach('proxy_01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/proxies/proxy_01/detach');
      expect(opts.method).toBe('POST');
    });
  });
});

// ─── DispatchService ───────────────────────────────────────────────────────────

describe('DispatchService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('trigger', () => {
    test('POSTs full DispatchPayload to /api/dispatch', async () => {
      mockOkResponse({ success: true, data: { dispatchId: 'dsp_001' }, error: null });

      const payload = {
        idempotencyKey: 'unique-key-abc123',
        event: 'order.confirmed',
        targets: {
          whatsapp: { instanceId: 'inst_wa_001', chatId: '919876543210@c.us' },
          email: { to: 'customer@example.com', instanceId: 'smtp_01' },
        },
        content: {
          title: 'Order Confirmed',
          body: 'Your order #{{orderId}} has been confirmed.',
        },
        variables: { orderId: 'ORD-5001' },
        strategy: 'parallel' as const,
      };

      await client.dispatch.trigger(payload);

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/dispatch');
      expect(opts.method).toBe('POST');
      expect(opts.headers['Authorization']).toBe(`Bearer ${API_KEY}`);

      const body = JSON.parse(opts.body);
      expect(body.idempotencyKey).toBe('unique-key-abc123');
      expect(body.event).toBe('order.confirmed');
      expect(body.targets.whatsapp.instanceId).toBe('inst_wa_001');
      expect(body.strategy).toBe('parallel');
      expect(body.variables.orderId).toBe('ORD-5001');
    });

    test('supports waterfall strategy with timeout config', async () => {
      mockOkResponse({ success: true, data: { dispatchId: 'dsp_002' }, error: null });

      await client.dispatch.trigger({
        idempotencyKey: 'waterfall-key-xyz',
        event: 'payment.failed',
        targets: {
          email: { to: 'user@example.com' },
          sms: { to: '+14155551234' },
        },
        content: { body: 'Payment failed. Please retry.' },
        strategy: 'waterfall',
        config: { waterfallTimeoutMs: 5000 },
      });

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.strategy).toBe('waterfall');
      expect(body.config.waterfallTimeoutMs).toBe(5000);
    });
  });

  describe('getStatus', () => {
    test('GETs dispatch status by ID', async () => {
      mockOkResponse({
        success: true,
        data: { id: 'dsp_001', status: 'delivered', channels: { whatsapp: 'sent', email: 'sent' } },
        error: null,
      });

      const result = await client.dispatch.getStatus('dsp_001');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/dispatch/dsp_001');
      expect(opts.method).toBe('GET');
      expect((result as any).data.status).toBe('delivered');
    });
  });
});
