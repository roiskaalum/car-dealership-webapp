import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import worker from './index.mjs';

function createStore(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    async get(key, type) {
      const value = values.get(key);
      if (value === undefined) return null;
      return type === 'json' ? JSON.parse(value) : value;
    },
    async put(key, value) {
      values.set(key, value);
    },
    raw(key) {
      return values.get(key);
    }
  };
}

async function createAccessToken() {
  const keys = await webcrypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: Uint8Array.of(1, 0, 1),
      hash: 'SHA-256'
    },
    true,
    ['sign', 'verify']
  );
  const jwk = await webcrypto.subtle.exportKey('jwk', keys.publicKey);
  jwk.kid = 'test-key';
  jwk.alg = 'RS256';

  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const header = encode({ alg: 'RS256', kid: jwk.kid, typ: 'JWT' });
  const claims = encode({
    iss: 'https://test-team.cloudflareaccess.com',
    aud: 'test-audience',
    exp: Math.floor(Date.now() / 1000) + 60
  });
  const signingInput = `${header}.${claims}`;
  const signature = await webcrypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keys.privateKey,
    new TextEncoder().encode(signingInput)
  );
  return {
    jwk,
    token: `${signingInput}.${Buffer.from(signature).toString('base64url')}`
  };
}

test('public config uses defaults and does not expose Worker secrets', async () => {
  const response = await worker.fetch(
    new Request('https://dealer.example/api/config'),
    { SITE_DATA: createStore() }
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.config.siteTitle, 'Krathmand');
  assert.equal('password' in body.config, false);
});

test('public inventory serves the bundled offline XML without querying BilInfo', async () => {
  const xml = '<Vehicles><Vehicle><Make>Test</Make></Vehicle></Vehicles>';
  const response = await worker.fetch(
    new Request('https://dealer.example/api/cars.xml'),
    {
      SITE_DATA: createStore({
        'bilinfo-api-credentials': JSON.stringify({ version: 1, iv: 'unused', ciphertext: 'unused' })
      }),
      ASSETS: { fetch: async () => new Response(xml, { status: 200 }) }
    }
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Inventory-Source'), 'offline');
  assert.equal(await response.text(), xml);
});

test('public inventory serves the persistent KV snapshot', async () => {
  const xml = '<Listing><Vehicle><VehicleId>live-1</VehicleId></Vehicle></Listing>';
  const response = await worker.fetch(
    new Request('https://dealer.example/api/cars.xml'),
    { SITE_DATA: createStore({ 'bilinfo-inventory-xml': xml }) }
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('X-Inventory-Source'), 'kv');
  assert.equal(await response.text(), xml);
});

test('scheduled refresh skips disabled or not-yet-due schedules', async () => {
  const past = new Date(Date.now() - 60_000).toISOString();
  const future = new Date(Date.now() + 60_000).toISOString();
  const store = createStore({
    'bilinfo-inventory-settings': JSON.stringify({
      autoRefreshEnabled: false,
      intervalHours: 24,
      nextRefreshAt: past
    })
  });
  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    throw new Error('BilInfo should not be called for a skipped schedule.');
  };

  try {
    let task;
    await worker.scheduled({}, { SITE_DATA: store }, { waitUntil: (promise) => { task = promise; } });
    await task;
    assert.equal(fetchCount, 0);

    await store.put('bilinfo-inventory-settings', JSON.stringify({
      autoRefreshEnabled: true,
      intervalHours: 24,
      nextRefreshAt: future
    }));
    await worker.scheduled({}, { SITE_DATA: store }, { waitUntil: (promise) => { task = promise; } });
    await task;
    assert.equal(fetchCount, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('admin writes require an Access JWT and accept only known config fields', async () => {
  const unauthorized = await worker.fetch(
    new Request('https://dealer.example/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ siteTitle: 'New title' })
    }),
    { SITE_DATA: createStore() }
  );
  assert.equal(unauthorized.status, 401);

  const unauthorizedSettings = await worker.fetch(
    new Request('https://dealer.example/api/admin/inventory/settings'),
    { SITE_DATA: createStore() }
  );
  assert.equal(unauthorizedSettings.status, 401);

  for (const path of ['/admin/', '/admin/index.html', '/admin/admin.js']) {
    const protectedAsset = await worker.fetch(
      new Request(`https://dealer.example${path}`),
      { ASSETS: { fetch: async () => new Response('<h1>admin</h1>') } }
    );
    assert.equal(protectedAsset.status, 401, `${path} must require Access`);
  }

  const { jwk, token } = await createAccessToken();
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ keys: [jwk] }));

  try {
    const store = createStore();
    const protectedAsset = await worker.fetch(
      new Request('https://dealer.example/admin/index.html', {
        headers: { 'Cf-Access-Jwt-Assertion': token }
      }),
      {
        ASSETS: { fetch: async (request) => new Response(new URL(request.url).pathname) },
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(protectedAsset.status, 200);
    assert.equal(await protectedAsset.text(), '/admin/index.html');

    const saved = await worker.fetch(
      new Request('https://dealer.example/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ siteTitle: 'Updated title', primary: '#123456' })
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(saved.status, 200);
    assert.equal((await saved.json()).config.siteTitle, 'Updated title');
    assert.equal((await (await worker.fetch(
      new Request('https://dealer.example/api/config'),
      { SITE_DATA: store }
    )).json()).config.primary, '#123456');

    const invalidColor = await worker.fetch(
      new Request('https://dealer.example/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ primary: 'not-a-color' })
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(invalidColor.status, 400);

    const encryptionKey = Buffer.from(webcrypto.getRandomValues(new Uint8Array(32))).toString('base64url');
    const credentials = await worker.fetch(
      new Request('https://dealer.example/api/admin/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ username: 'test-user', password: 'test-password' })
      }),
      {
        SITE_DATA: store,
        BILINFO_CREDENTIALS_ENCRYPTION_KEY: encryptionKey,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(credentials.status, 200);
    assert.equal((await credentials.json()).configured, true);
    assert.equal(store.raw('bilinfo-api-credentials').includes('test-password'), false);

    const credentialStatus = await worker.fetch(
      new Request('https://dealer.example/api/admin/credentials', {
        headers: { 'Cf-Access-Jwt-Assertion': token }
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    const statusBody = await credentialStatus.json();
    assert.equal(statusBody.configured, true);
    assert.equal('password' in statusBody, false);

    const savedSettings = await worker.fetch(
      new Request('https://dealer.example/api/admin/inventory/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ autoRefreshEnabled: true, intervalHours: 24 })
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(savedSettings.status, 200);
    assert.equal((await savedSettings.json()).settings.autoRefreshEnabled, true);

    const invalidSettings = await worker.fetch(
      new Request('https://dealer.example/api/admin/inventory/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ autoRefreshEnabled: true, intervalHours: 2 })
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(invalidSettings.status, 400);

    let apiAuthorization;
    let bilInfoRequestCount = 0;
    globalThis.fetch = async (input, options) => {
      if (String(input).includes('/cdn-cgi/access/certs')) {
        return new Response(JSON.stringify({ keys: [jwk] }));
      }
      bilInfoRequestCount += 1;
      apiAuthorization = options.headers.Authorization;
      return new Response('<Listing><Vehicle><Make>Test</Make></Vehicle></Listing>');
    };
    const offline = await worker.fetch(
      new Request('https://dealer.example/api/cars.xml'),
      {
        SITE_DATA: store,
        BILINFO_CREDENTIALS_ENCRYPTION_KEY: encryptionKey,
        ASSETS: { fetch: async () => new Response('<Listing><Vehicle><Make>Fixture</Make></Vehicle></Listing>') }
      }
    );
    assert.equal(offline.headers.get('X-Inventory-Source'), 'offline');
    assert.equal(bilInfoRequestCount, 0);

    const refreshed = await worker.fetch(
      new Request('https://dealer.example/api/admin/inventory/refresh', {
        method: 'POST',
        headers: { 'Cf-Access-Jwt-Assertion': token }
      }),
      {
        SITE_DATA: store,
        BILINFO_CREDENTIALS_ENCRYPTION_KEY: encryptionKey,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(refreshed.status, 200);
    assert.equal((await refreshed.json()).vehicleCount, 1);
    assert.equal(bilInfoRequestCount, 1);
    assert.equal(apiAuthorization, `Basic ${Buffer.from('test-user:test-password').toString('base64')}`);
    assert.equal(await store.get('bilinfo-inventory-xml'), '<Listing><Vehicle><Make>Test</Make></Vehicle></Listing>');
    assert.ok((await store.get('bilinfo-inventory-settings', 'json')).lastUpdatedAt);

    const dueSettings = await store.get('bilinfo-inventory-settings', 'json');
    dueSettings.nextRefreshAt = new Date(Date.now() - 1000).toISOString();
    await store.put('bilinfo-inventory-settings', JSON.stringify(dueSettings));
    let scheduledTask;
    await worker.scheduled(
      { scheduledTime: Date.now() },
      {
        SITE_DATA: store,
        BILINFO_CREDENTIALS_ENCRYPTION_KEY: encryptionKey
      },
      { waitUntil: (promise) => { scheduledTask = promise; } }
    );
    await scheduledTask;
    assert.equal(bilInfoRequestCount, 2);
    assert.ok(Date.parse((await store.get('bilinfo-inventory-settings', 'json')).nextRefreshAt) > Date.now());

    const lastGoodSnapshot = await store.get('bilinfo-inventory-xml');
    globalThis.fetch = async (input) => {
      if (String(input).includes('/cdn-cgi/access/certs')) {
        return new Response(JSON.stringify({ keys: [jwk] }));
      }
      return new Response('temporary upstream failure', { status: 503 });
    };
    const failedRefresh = await worker.fetch(
      new Request('https://dealer.example/api/admin/inventory/refresh', {
        method: 'POST',
        headers: { 'Cf-Access-Jwt-Assertion': token }
      }),
      {
        SITE_DATA: store,
        BILINFO_CREDENTIALS_ENCRYPTION_KEY: encryptionKey,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(failedRefresh.status, 502);
    assert.equal(await store.get('bilinfo-inventory-xml'), lastGoodSnapshot);

    const rejected = await worker.fetch(
      new Request('https://dealer.example/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cf-Access-Jwt-Assertion': token
        },
        body: JSON.stringify({ BILINFO_PASSWORD: 'not-allowed' })
      }),
      {
        SITE_DATA: store,
        CF_ACCESS_TEAM_DOMAIN: 'test-team.cloudflareaccess.com',
        CF_ACCESS_AUD: 'test-audience'
      }
    );
    assert.equal(rejected.status, 400);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
