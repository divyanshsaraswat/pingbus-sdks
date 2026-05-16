/**
 * Unit Tests: EmailService, PushService, SmsService
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { PingBusClient } from '../../src/client';

const API_KEY = 'pk_test_channels';
const BASE_URL = 'http://localhost:8000';

function makeClient() {
  return new PingBusClient({ apiKey: API_KEY, baseUrl: BASE_URL });
}

function mockOkResponse(data: any) {
  mockFetch.mockResolvedValueOnce({ ok: true, json: async () => data });
}

function mockErrorResponse(status: number, code: string, error: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error, code }),
  });
}

// ─── EmailService ──────────────────────────────────────────────────────────────

describe('EmailService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('send', () => {
    test('POSTs to /api/channels/email/send with correct payload', async () => {
      mockOkResponse({ success: true, data: { messageId: 'em_001' }, error: null });

      await client.email.send('user@example.com', 'Hello', '<p>World</p>', { isHtml: true });

      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/email/send');
      expect(opts.method).toBe('POST');
      expect(opts.headers['Authorization']).toBe(`Bearer ${API_KEY}`);

      const body = JSON.parse(opts.body);
      expect(body.to).toBe('user@example.com');
      expect(body.subject).toBe('Hello');
      expect(body.body).toBe('<p>World</p>');
      expect(body.isHtml).toBe(true);
    });

    test('sends with instanceId when provided', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.email.send('a@b.com', 'Subj', 'Body', { instanceId: 'smtp_01' });
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.instanceId).toBe('smtp_01');
    });

    test('throws on VALIDATION_ERROR', async () => {
      mockErrorResponse(400, 'VALIDATION_ERROR', 'Invalid email address');
      await expect(
        client.email.send('not-an-email', 'Test', 'Body')
      ).rejects.toMatchObject({ status: 400, code: 'VALIDATION_ERROR' });
    });
  });

  describe('listLogs', () => {
    test('GETs /api/channels/email/logs with default pagination', async () => {
      mockOkResponse({ total: 0, limit: 50, offset: 0, data: [] });
      await client.email.listLogs();
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/email/logs');
      expect(url).toContain('limit=50');
      expect(url).toContain('offset=0');
    });

    test('respects custom limit and offset', async () => {
      mockOkResponse({ total: 100, limit: 10, offset: 20, data: [] });
      await client.email.listLogs(10, 20);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('limit=10');
      expect(url).toContain('offset=20');
    });

    test('returns PaginatedResponse shape', async () => {
      const expected = {
        total: 1,
        limit: 50,
        offset: 0,
        data: [{ id: 'log_01', to: 'a@b.com', subject: 'Hi', status: 'sent', sentAt: '2026-01-01T00:00:00Z' }],
      };
      mockOkResponse(expected);
      const result = await client.email.listLogs();
      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe('sent');
    });
  });

  describe('getLog', () => {
    test('GETs /api/channels/email/logs/:id', async () => {
      mockOkResponse({ success: true, data: { id: 'log_01' }, error: null });
      await client.email.getLog('log_01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/email/logs/log_01');
      expect(opts.method).toBe('GET');
    });
  });

  describe('testConnection', () => {
    test('POSTs SMTP config to test-connection endpoint', async () => {
      mockOkResponse({ success: true, data: { connected: true }, error: null });
      const smtpConfig = {
        name: 'My SMTP',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        user: 'me@gmail.com',
        pass: 'password',
        fromEmail: 'me@gmail.com',
        fromName: 'Me',
      };
      await client.email.testConnection(smtpConfig);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/email/instances/test-connection');
      const body = JSON.parse(opts.body);
      expect(body.host).toBe('smtp.gmail.com');
      expect(body.port).toBe(587);
    });
  });

  describe('sendTestEmail', () => {
    test('POSTs to instance test endpoint', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.email.sendTestEmail('smtp_instance_01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/email/instances/smtp_instance_01/test');
      expect(opts.method).toBe('POST');
    });
  });
});

// ─── PushService ───────────────────────────────────────────────────────────────

describe('PushService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('send', () => {
    test('sends push to user target', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.push.send(
        { type: 'user', userId: 'user_123' },
        { title: 'New Message', body: 'You have mail' },
        { orderId: 'ord_001' }
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.target.type).toBe('user');
      expect(body.target.userId).toBe('user_123');
      expect(body.notification.title).toBe('New Message');
      expect(body.data.orderId).toBe('ord_001');
    });

    test('sends push to token target', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.push.send(
        { type: 'token', token: 'fcm_device_token_abc' },
        { title: 'Alert', body: 'Check this out' }
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.target.type).toBe('token');
      expect(body.target.token).toBe('fcm_device_token_abc');
    });

    test('sends push to topic target', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.push.send(
        { type: 'topic', topic: 'news' },
        { title: 'Breaking', body: 'Big news!' }
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.target.type).toBe('topic');
      expect(body.target.topic).toBe('news');
    });
  });

  describe('register', () => {
    test('POSTs user, token, platform to register endpoint', async () => {
      mockOkResponse({ success: true, data: { registered: true }, error: null });
      await client.push.register('user_456', 'device_token_xyz', 'android', 'fcm_inst_01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/push/register');
      const body = JSON.parse(opts.body);
      expect(body.userId).toBe('user_456');
      expect(body.token).toBe('device_token_xyz');
      expect(body.platform).toBe('android');
      expect(body.instanceId).toBe('fcm_inst_01');
    });
  });

  describe('listLogs', () => {
    test('GETs push logs with limit', async () => {
      mockOkResponse({ total: 0, limit: 20, offset: 0, data: [] });
      await client.push.listLogs(20);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/push/logs?limit=20');
    });
  });
});

// ─── SmsService ────────────────────────────────────────────────────────────────

describe('SmsService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  describe('send', () => {
    test('POSTs to /api/channels/sms/send with to and body', async () => {
      mockOkResponse({ success: true, data: { sid: 'SM123' }, error: null });
      await client.sms.send('+14155551234', 'Your OTP is 9876', 'twilio_inst_01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/sms/send');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body.to).toBe('+14155551234');
      expect(body.body).toBe('Your OTP is 9876');
      expect(body.instanceId).toBe('twilio_inst_01');
    });

    test('sends without instanceId (uses default)', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.sms.send('+19999999999', 'Hello');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.instanceId).toBeUndefined();
    });
  });

  describe('listLogs', () => {
    test('GETs SMS logs with default limit', async () => {
      mockOkResponse({ total: 0, limit: 50, offset: 0, data: [] });
      await client.sms.listLogs();
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain('/api/channels/sms/logs?limit=50');
    });
  });
});
