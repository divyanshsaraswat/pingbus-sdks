/**
 * Integration Tests: End-to-end flows against a live PingBus backend.
 *
 * ─── AUTH: Unified API Key ──────────────────────────────────────────────────
 *
 * All routes (WhatsApp, REST, Dispatch) now support the `pk_...` API key.
 *
 * ─── ENV VARS ─────────────────────────────────────────────────────────────────
 *   RUN_INTEGRATION_TESTS=true
 *   PINGBUS_BASE_URL=https://pingbus.live
 *   PINGBUS_API_KEY=pk_xxx               (your pk_... API key)
 *   WA_INSTANCE_ID=3730946394            (your WhatsApp instance ID)
 *   WA_CHAT_ID=91XXXXXXXXXX@c.us         (recipient in WhatsApp format)
 *   INTEGRATION_EMAIL_TO=you@email.com
 *   INTEGRATION_SMS_TO=+91XXXXXXXXXX
 *
 * Run: $env:RUN_INTEGRATION_TESTS="true"; $env:PINGBUS_API_KEY="pk_xxx"; ... npm run test:integration
 *
 * These tests make REAL HTTP requests and will consume API credits.
 * They are skipped by default unless RUN_INTEGRATION_TESTS=true is set.
 */

import { PingBusClient } from '../../src/client';

const SKIP = process.env.RUN_INTEGRATION_TESTS !== 'true';
const describeIf = SKIP ? describe.skip : describe;

// Unified client for all routes using the single API key
const client = new PingBusClient({
  apiKey: process.env.WA_API_KEY || process.env.PINGBUS_API_KEY || 'pk_placeholder',
  baseUrl: process.env.PINGBUS_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
});

const WA_INSTANCE_ID = process.env.WA_INSTANCE_ID || '';
const WA_CHAT_ID = process.env.WA_CHAT_ID || '';
const EMAIL_TO = process.env.INTEGRATION_EMAIL_TO || 'test@example.com';
const SMS_TO = process.env.INTEGRATION_SMS_TO || '+14155551234';

// ─── WhatsApp Integration ─────────────────────────────────────────────────────

describeIf('Integration: WhatsApp', () => {
  test('getStatus returns instance state', async () => {
    const result = await client.whatsapp.getStatus(WA_INSTANCE_ID);
    expect(result).toBeDefined();
    expect(typeof (result as any).stateInstance).toBe('string');
  });

  test('sendMessage sends a WhatsApp message and returns idMessage', async () => {
    const result = await client.whatsapp.sendMessage(
      WA_INSTANCE_ID,
      WA_CHAT_ID,
      `[SDK Integration Test] Hello at ${new Date().toISOString()}`
    );
    // API returns { type, queued, jobId } or { idMessage } depending on queue availability
    const sent = (result as any).idMessage || (result as any).jobId || (result as any).queued;
    expect(sent).toBeDefined();
  });

  test('receive returns null or a Notification', async () => {
    const result = await client.whatsapp.receive(WA_INSTANCE_ID);
    // Queue may be empty (null) or contain a notification
    if (result !== null && result !== undefined) {
      expect((result as any).id ?? (result as any).receiptId).toBeDefined();
    } else {
      // null/undefined means queue is empty — that's a valid state
      expect(result == null).toBe(true);
    }
  });

  test('checkWhatsapp returns existsWhatsapp flag', async () => {
    const result = await client.whatsapp.checkWhatsapp(
      WA_INSTANCE_ID,
      WA_CHAT_ID.replace('@c.us', '')
    );
    // May return { existsWhatsapp } or a stub { status } depending on session state
    const hasResponse = typeof (result as any).existsWhatsapp === 'boolean'
      || typeof (result as any).status === 'string';
    expect(hasResponse).toBe(true);
  });
});

// ─── Email Integration ────────────────────────────────────────────────────────

describeIf('Integration: Email', () => {
  test('send dispatches an email successfully', async () => {
    const result = await client.email.send(
      EMAIL_TO,
      `[SDK Integration Test] ${new Date().toISOString()}`,
      '<p>This is an automated integration test email from PingBus SDK.</p>',
      { isHtml: true }
    );
    expect((result as any).success).toBe(true);
  });

  test('listLogs returns a paginated list', async () => {
    const result = await client.email.listLogs(5, 0);
    // API returns { logs: [...] }
    const logs = (result as any).logs ?? (result as any).data;
    expect(Array.isArray(logs)).toBe(true);
  });
});

// ─── SMS Integration ──────────────────────────────────────────────────────────

describeIf('Integration: SMS', () => {
  test('send dispatches an SMS successfully', async () => {
    const result = await client.sms.send(
      SMS_TO,
      `[PingBus SDK Test] ${new Date().toISOString()}`
    );
    expect((result as any).success).toBe(true);
  });
});

// ─── Account & Balance Integration ────────────────────────────────────────────

describeIf('Integration: Account & Balance', () => {
  test('getProfile returns user profile with email', async () => {
    const result = await client.account.getProfile();
    expect(result).toBeDefined();
    // API returns { success, account: { email, ... } }
    const email = (result as any).email ?? (result as any).account?.email;
    expect(typeof email).toBe('string');
  });

  test('getBalance returns numeric balance', async () => {
    const result = await client.balance.getBalance();
    expect(result).toBeDefined();
    expect(typeof (result as any).balance).toBe('number');
  });

  test('listPurchases returns an array of transactions', async () => {
    const result = await client.balance.listPurchases();
    // API returns { success, purchases: [...] }
    const purchases = Array.isArray(result) ? result : (result as any).purchases;
    expect(Array.isArray(purchases)).toBe(true);
  });

  test('full API key lifecycle: create → list → delete', async () => {
    const created = await client.account.createKey(`SDK-Test-${Date.now()}`);
    // API returns { success, apiKeys: [...] } — find the newly created key
    const createdKeys: any[] = (created as any).apiKeys ?? [];
    const newKey = createdKeys[createdKeys.length - 1]; // last one is the newly created
    expect(newKey).toBeDefined();
    const keyId = newKey?.key;
    expect(keyId).toBeDefined();

    // List keys via getProfile (no dedicated /keys endpoint)
    const profile = await client.account.getProfile();
    const keys: any[] = (profile as any).account?.apiKeys ?? (profile as any).apiKeys ?? [];
    const found = keys.find((k: any) => k.key === keyId);
    expect(found).toBeDefined();

    // Delete by key string
    await client.account.deleteKey(keyId);

    const profileAfter = await client.account.getProfile();
    const keysAfter: any[] = (profileAfter as any).account?.apiKeys ?? (profileAfter as any).apiKeys ?? [];
    const notFound = keysAfter.find((k: any) => k.key === keyId);
    expect(notFound).toBeUndefined();
  });
});

// ─── Dispatch Integration ─────────────────────────────────────────────────────

describeIf('Integration: Dispatch (Orchestration)', () => {
  test('trigger dispatches a multi-channel event and returns dispatchId', async () => {
    const idempotencyKey = `sdk-test-${Date.now()}`;

    const result = await client.dispatch.trigger({
      idempotencyKey,
      event: 'sdk.integration.test',
      targets: {
        email: { to: EMAIL_TO },
      },
      content: {
        title: 'SDK Integration Test',
        body: `Integration test at ${new Date().toISOString()}`,
      },
      strategy: 'parallel',
    });

    expect((result as any).success).toBe(true);
    // API returns { success, dispatchId } — not wrapped in data
    const dispatchId = (result as any).dispatchId ?? (result as any).data?.id ?? (result as any).data?.dispatchId;
    expect(dispatchId).toBeDefined();

    if (dispatchId) {
      await new Promise((r) => setTimeout(r, 1000));
      const status = await client.dispatch.getStatus(dispatchId);
      // API returns { success, dispatchId, events: [...] }
      const hasStatus = (status as any).events?.length > 0 || (status as any).data?.status;
      expect(hasStatus).toBeTruthy();
    }
  });
});
