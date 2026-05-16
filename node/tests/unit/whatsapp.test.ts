/**
 * Unit Tests: WhatsAppService
 * Validates correct URL construction, auth patterns, and payload shapes.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch;

import { PingBusClient } from '../../src/client';

const API_KEY = 'pk_test_whatsapp';
const INSTANCE_ID = 'inst_wa_001';
const CHAT_ID = '919876543210@c.us';
const BASE_URL = 'http://localhost:8000';

function makeClient() {
  return new PingBusClient({ apiKey: API_KEY, baseUrl: BASE_URL });
}

function mockOkResponse(data: any) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

function mockErrorResponse(status: number, code: string, error: string) {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status,
    json: async () => ({ error, code }),
  });
}

describe('WhatsAppService', () => {
  let client: PingBusClient;

  beforeEach(() => {
    client = makeClient();
    mockFetch.mockReset();
  });

  // ── Messaging ─────────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    test('POSTs to correct waInstance path with apiKey in URL (path-token auth)', async () => {
      mockOkResponse({ success: true, data: { messageId: 'msg_001' }, error: null });

      await client.whatsapp.sendMessage(INSTANCE_ID, CHAT_ID, 'Hello World');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, opts] = mockFetch.mock.calls[0];

      expect(url).toContain(`/waInstance${INSTANCE_ID}/sendMessage/${API_KEY}`);
      expect(opts.method).toBe('POST');

      const body = JSON.parse(opts.body);
      expect(body.chatId).toBe(CHAT_ID);
      expect(body.message).toBe('Hello World');
    });

    test('does NOT send Authorization header (uses path token)', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.sendMessage(INSTANCE_ID, CHAT_ID, 'Hi');
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers['Authorization']).toBeUndefined();
    });

    test('returns parsed PingBusResponse', async () => {
      const expected = { success: true, data: { messageId: 'msg_42' }, error: null };
      mockOkResponse(expected);
      const result = await client.whatsapp.sendMessage(INSTANCE_ID, CHAT_ID, 'Test');
      expect(result).toEqual(expected);
    });
  });

  describe('sendFileByUrl', () => {
    test('sends file URL, name, and caption in payload', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.sendFileByUrl(
        INSTANCE_ID, CHAT_ID,
        'https://example.com/file.pdf',
        'report.pdf',
        'Monthly Report'
      );
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.urlFile).toBe('https://example.com/file.pdf');
      expect(body.fileName).toBe('report.pdf');
      expect(body.caption).toBe('Monthly Report');
    });
  });

  describe('receive', () => {
    test('GETs from receiveNotification path', async () => {
      mockOkResponse(null);
      await client.whatsapp.receive(INSTANCE_ID);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain(`/waInstance${INSTANCE_ID}/receiveNotification/${API_KEY}`);
      expect(opts.method).toBe('GET');
    });

    test('returns null when queue is empty', async () => {
      mockOkResponse(null);
      const result = await client.whatsapp.receive(INSTANCE_ID);
      expect(result).toBeNull();
    });

    test('returns Notification object when message queued', async () => {
      const notif = {
        id: 'notif_01',
        chatId: CHAT_ID,
        message: 'Hey!',
        senderName: 'Alice',
        timestamp: 1715000000,
        typeWebhook: 'incomingMessageReceived',
      };
      mockOkResponse(notif);
      const result = await client.whatsapp.receive(INSTANCE_ID);
      expect(result).toEqual(notif);
    });
  });

  describe('getStatus', () => {
    test('GETs from getStateInstance path', async () => {
      mockOkResponse({ stateInstance: 'authorized' });
      await client.whatsapp.getStatus(INSTANCE_ID);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain(`/waInstance${INSTANCE_ID}/getStateInstance/${API_KEY}`);
    });
  });

  describe('getQr', () => {
    test('GETs from qr path', async () => {
      mockOkResponse({ type: 'qrCode', message: 'base64...' });
      await client.whatsapp.getQr(INSTANCE_ID);
      const [url] = mockFetch.mock.calls[0];
      expect(url).toContain(`/waInstance${INSTANCE_ID}/qr/${API_KEY}`);
    });
  });

  describe('updateWebhook', () => {
    test('PATCHes /api/instances with Authorization header (bearer auth)', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.updateWebhook(INSTANCE_ID, 'https://my-server.com/hook');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain(`/api/instances/${INSTANCE_ID}/webhook`);
      expect(opts.method).toBe('PATCH');
      expect(opts.headers['Authorization']).toBe(`Bearer ${API_KEY}`);
      const body = JSON.parse(opts.body);
      expect(body.webhookUrl).toBe('https://my-server.com/hook');
    });
  });

  // ── Advanced Methods ───────────────────────────────────────────────────────

  describe('sendPoll', () => {
    test('sends pollName and options array', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.sendPoll(INSTANCE_ID, CHAT_ID, 'Favourite color?', ['Red', 'Blue', 'Green']);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.pollName).toBe('Favourite color?');
      expect(body.options).toEqual(['Red', 'Blue', 'Green']);
    });
  });

  describe('sendLocation', () => {
    test('sends latitude, longitude and title', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.sendLocation(INSTANCE_ID, CHAT_ID, 28.6139, 77.2090, 'Delhi');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.latitude).toBe(28.6139);
      expect(body.longitude).toBe(77.2090);
      expect(body.name).toBe('Delhi');
    });
  });

  describe('sendContact', () => {
    test('sends phoneNumber and contactName', async () => {
      mockOkResponse({ success: true, data: {}, error: null });
      await client.whatsapp.sendContact(INSTANCE_ID, CHAT_ID, '919876543210', 'Bob');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.phoneNumber).toBe('919876543210');
      expect(body.contactName).toBe('Bob');
    });
  });

  describe('createGroup', () => {
    test('sends groupName and participants array', async () => {
      mockOkResponse({ success: true, data: { groupId: 'grp_01' }, error: null });
      const participants = ['911111111111@c.us', '912222222222@c.us'];
      await client.whatsapp.createGroup(INSTANCE_ID, 'Team Alpha', participants);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.groupName).toBe('Team Alpha');
      expect(body.participants).toEqual(participants);
    });
  });

  describe('checkWhatsapp', () => {
    test('sends phoneNumber in body', async () => {
      mockOkResponse({ existsWhatsapp: true });
      await client.whatsapp.checkWhatsapp(INSTANCE_ID, '919999999999');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.phoneNumber).toBe('919999999999');
    });
  });

  describe('getChatHistory', () => {
    test('sends chatId as query param, not in body (GET safety)', async () => {
      mockOkResponse([]);
      await client.whatsapp.getChatHistory(INSTANCE_ID, CHAT_ID, 25);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain(`chatId=${encodeURIComponent(CHAT_ID)}`);
      expect(url).toContain('limit=25');
      // Body must be undefined for GET
      expect(opts.body).toBeUndefined();
    });
  });

  describe('readChat', () => {
    test('POSTs chatId', async () => {
      mockOkResponse({ success: true });
      await client.whatsapp.readChat(INSTANCE_ID, CHAT_ID);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.chatId).toBe(CHAT_ID);
    });
  });

  describe('archiveChat', () => {
    test('POSTs chatId and archive flag', async () => {
      mockOkResponse({ success: true });
      await client.whatsapp.archiveChat(INSTANCE_ID, CHAT_ID, true);
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.chatId).toBe(CHAT_ID);
      expect(body.archive).toBe(true);
    });
  });

  describe('deleteMessage', () => {
    test('POSTs chatId and messageId', async () => {
      mockOkResponse({ success: true });
      await client.whatsapp.deleteMessage(INSTANCE_ID, CHAT_ID, 'msg_to_delete');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.chatId).toBe(CHAT_ID);
      expect(body.messageId).toBe('msg_to_delete');
    });
  });

  describe('logout', () => {
    test('GETs logout path', async () => {
      mockOkResponse({ success: true });
      await client.whatsapp.logout(INSTANCE_ID);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain(`/waInstance${INSTANCE_ID}/logout/${API_KEY}`);
      expect(opts.method).toBe('GET');
    });
  });

  // ── Error Handling ─────────────────────────────────────────────────────────

  describe('error handling', () => {
    test('throws with HTTP status and code on 4xx errors', async () => {
      mockErrorResponse(401, 'AUTH_FAILED', 'Invalid API Key');
      await expect(
        client.whatsapp.sendMessage(INSTANCE_ID, CHAT_ID, 'test')
      ).rejects.toMatchObject({
        message: 'Invalid API Key',
        status: 401,
        code: 'AUTH_FAILED',
      });
    });

    test('throws INSTANCE_NOT_READY on 503', async () => {
      mockErrorResponse(503, 'INSTANCE_NOT_READY', 'Instance not authorized');
      await expect(
        client.whatsapp.sendMessage(INSTANCE_ID, CHAT_ID, 'test')
      ).rejects.toMatchObject({ status: 503, code: 'INSTANCE_NOT_READY' });
    });
  });
});
