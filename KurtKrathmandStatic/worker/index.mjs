const CONFIG_KEY = 'site-config';
const INVENTORY_KEY = 'bilinfo-inventory-xml';
const INVENTORY_SETTINGS_KEY = 'bilinfo-inventory-settings';
const CREDENTIALS_KEY = 'bilinfo-api-credentials';
const MAX_CONFIG_BYTES = 32 * 1024;
const MAX_CREDENTIAL_BYTES = 8 * 1024;
const MAX_FIELD_LENGTH = 4000;
const COLOR_CONFIG_KEYS = new Set(['primary', 'accent', 'darkPrimary', 'darkAccent']);
const INVENTORY_INTERVAL_HOURS = new Set([1, 6, 12, 24, 168]);
const VEHICLE_TAG_PATTERN = /<(?:[\w.-]+:)?Vehicle(?:\s|>)/gi;

const DEFAULT_CONFIG = {
  siteTitle: 'Krathmand',
  logoUrl: '/images/logo.jpg',
  primaryColor: '#1e3a8a',
  secondaryColor: '#3b82f6',
  primary: '#123f79',
  primaryDark: '#0d2d5d',
  primaryLight: '#dfeeff',
  accent: '#1e88e5',
  navText: '#edf6ff',
  darkNavText: '#1e88e5',
  background: '#f4f7fb',
  backgroundAlt: '#edf3fb',
  panel: '#ffffff',
  panelStrong: '#0f172a',
  panelSoft: '#eaf2ff',
  text: '#111827',
  textSoft: '#53627a',
  border: 'rgba(15, 23, 42, 0.12)',
  darkPrimary: '#1d4ed8',
  darkPrimaryDark: '#0f2f69',
  darkPrimaryLight: '#bfdcff',
  darkAccent: '#63b3ff',
  darkBackground: '#0f172a',
  darkBackgroundAlt: '#111c2d',
  darkPanel: '#152333',
  darkPanelStrong: '#101c2d',
  darkPanelSoft: '#1a2c42',
  darkText: '#edf3ff',
  darkTextSoft: '#a7b7cf',
  darkBorder: 'rgba(148, 163, 184, 0.18)',
  contactPhone: '+45 86 62 85 45',
  contactEmail: 'kurt@krathmand.dk',
  contactAddress: 'Fabrikvej 1 8800 Viborg',
  contactHours: 'Efter aftale',
  homeHeroTitle: 'Find den rette bil hos Krathmand',
  homeHeroText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre. Vi tilbyder et velholdt udvalg af brugte biler og personlig service med fokus på ærlighed, kvalitet og en god oplevelse fra første kontakt til købesummering.',
  homeAboutHeading: 'Vi har altid ca. 25 biler på lager',
  homeAboutText: 'Krathmand er kendt for at kombinere mange års erfaring med personlig service, som gør det nemt at finde den rigtige bil. Vi arbejder med et bredt udvalg af kvalitetsbiler og hjælper dig fra første spørgsmål til den afsluttende aftale.',
  serviceTitle1: 'Lav gerne en aftale i forvejen',
  serviceText1: 'Det er altid en god idé at ringe i forvejen, inden du besøger os. Då vi kan sikre, at vi har åbent, er klar til at tage imod dig og kan give dig tiden og den service, du fortjener.',
  serviceTitle2: 'Vi guider dig til den rigtige bil',
  serviceText2: 'Uanset om du vil have en lille bybil, en praktisk familiebil, en meget økonomisk diesel eller en moderne elbil, så hjælper vi med at finde en løsning, der passer til dit behov.',
  contactSectionTitle: 'Kontakt os',
  contactSectionText: 'Vi er altid klar til at hjælpe dig med at finde den rigtige bil til dig og din hverdag.',
  ownerName: 'Kurt Krathmand',
  ownerPhoto: 'https://media.istockphoto.com/id/587805156/vector/profile-picture-vector-illustration.jpg?s=612x612&w=is&k=20&c=-Jq_6tAjuYieAjOB5B1CyUXSrD_tKE3IKZwVGIjn8-8=',
  aboutHeading: 'Krathmand',
  aboutText: 'Krathmand er din leverandør af kvalitetsbiler i alle aldre.\n\nFirmaet har mange års erfaring og har samarbejde med finansieringsselskaber, så drømmebilen kan blive en realitet.\n\nVi fremskaffer også biler ud fra bestemte ønsker, så giv et ring på 40 15 90 45.',
  bannerTitle: 'Kvalitetsbiler til Alle',
  bannerText: 'Udforsk udvalget af biler tilgængelige på BilInfo.'
};

let accessKeys;
let accessKeysExpiry = 0;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function xmlResponse(xml, source, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'X-Inventory-Source': source,
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function encodeBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getEncryptionKey(env) {
  if (!env.BILINFO_CREDENTIALS_ENCRYPTION_KEY) {
    throw new Error('BILINFO_CREDENTIALS_ENCRYPTION_KEY Worker secret is not configured.');
  }
  const rawKey = decodeBase64Url(env.BILINFO_CREDENTIALS_ENCRYPTION_KEY);
  if (rawKey.byteLength !== 32) {
    throw new Error('BILINFO_CREDENTIALS_ENCRYPTION_KEY must decode to 32 bytes.');
  }
  return crypto.subtle.importKey('raw', rawKey, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptCredentials(credentials, env) {
  const key = await getEncryptionKey(env);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(credentials));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return JSON.stringify({
    version: 1,
    iv: encodeBase64Url(iv),
    ciphertext: encodeBase64Url(new Uint8Array(ciphertext))
  });
}

async function decryptCredentials(encrypted, env) {
  if (!encrypted || encrypted.version !== 1 || !encrypted.iv || !encrypted.ciphertext) {
    throw new Error('Stored BilInfo credentials have an unsupported format.');
  }
  const key = await getEncryptionKey(env);
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: decodeBase64Url(encrypted.iv) },
    key,
    decodeBase64Url(encrypted.ciphertext)
  );
  const credentials = JSON.parse(new TextDecoder().decode(plaintext));
  if (typeof credentials.username !== 'string' || typeof credentials.password !== 'string') {
    throw new Error('Stored BilInfo credentials are invalid.');
  }
  return credentials;
}

async function loadAccessKeys(teamDomain) {
  if (accessKeys && Date.now() < accessKeysExpiry) return accessKeys;

  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, {
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) {
    throw new Error(`Cloudflare Access public keys request failed (${response.status}).`);
  }

  const keySet = await response.json();
  if (!Array.isArray(keySet.keys) || keySet.keys.length === 0) {
    throw new Error('Cloudflare Access returned no signing keys.');
  }

  accessKeys = keySet.keys;
  accessKeysExpiry = Date.now() + 5 * 60 * 1000;
  return accessKeys;
}

async function requireAccess(request, env) {
  const teamDomain = env.CF_ACCESS_TEAM_DOMAIN;
  const audience = env.CF_ACCESS_AUD;
  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!teamDomain || !audience || !token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const header = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[0])));
    const claims = JSON.parse(new TextDecoder().decode(decodeBase64Url(parts[1])));
    const now = Math.floor(Date.now() / 1000);
    const issuer = `https://${teamDomain.replace(/\/+$/, '')}`;
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (
      header.alg !== 'RS256' ||
      claims.iss !== issuer ||
      !audiences.includes(audience) ||
      typeof claims.exp !== 'number' ||
      claims.exp <= now ||
      (typeof claims.nbf === 'number' && claims.nbf > now)
    ) {
      return false;
    }

    const keySet = await loadAccessKeys(teamDomain);
    const jwk = keySet.find((key) => key.kid === header.kid && key.alg === 'RS256');
    if (!jwk) return false;

    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
    return crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      decodeBase64Url(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
  } catch (error) {
    console.error('Cloudflare Access token validation failed.', error);
    return false;
  }
}

async function readConfig(env) {
  const stored = await env.SITE_DATA.get(CONFIG_KEY, 'json');
  const config = { ...DEFAULT_CONFIG };
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return config;
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    if (typeof stored[key] === 'string') config[key] = stored[key];
  }
  return config;
}

async function readOfflineInventory(request, env) {
  const offlineUrl = new URL('/bilinfo-offline.xml', request.url);
  const response = await env.ASSETS.fetch(new Request(offlineUrl));
  if (!response.ok) {
    throw new Error(`Offline inventory file request failed (${response.status}).`);
  }
  return response.text();
}

async function readInventorySettings(env) {
  const stored = await env.SITE_DATA.get(INVENTORY_SETTINGS_KEY, 'json');
  const intervalHours = Number(stored?.intervalHours);
  return {
    autoRefreshEnabled: stored?.autoRefreshEnabled === true,
    intervalHours: INVENTORY_INTERVAL_HOURS.has(intervalHours) ? intervalHours : 24,
    lastUpdatedAt: typeof stored?.lastUpdatedAt === 'string' ? stored.lastUpdatedAt : null,
    nextRefreshAt: typeof stored?.nextRefreshAt === 'string' ? stored.nextRefreshAt : null,
    vehicleCount: Number.isInteger(stored?.vehicleCount) ? stored.vehicleCount : null,
    lastError: typeof stored?.lastError === 'string' ? stored.lastError : null
  };
}

async function writeInventorySettings(env, settings) {
  await env.SITE_DATA.put(INVENTORY_SETTINGS_KEY, JSON.stringify(settings));
}

function countVehicles(xml) {
  return Array.from(xml.matchAll(VEHICLE_TAG_PATTERN)).length;
}

async function fetchBilInfo(env) {
  const encrypted = await env.SITE_DATA.get(CREDENTIALS_KEY, 'json');
  if (!encrypted) throw new Error('BilInfo credentials have not been configured.');
  const { username, password } = await decryptCredentials(encrypted, env);
  const credentials = btoa(
    Array.from(new TextEncoder().encode(`${username}:${password}`), (byte) => String.fromCharCode(byte)).join('')
  );
  const response = await fetch('https://gw.bilinfo.net/listingapi/api/export', {
    headers: {
      Authorization: `Basic ${credentials}`,
      Accept: 'application/xml,text/xml'
    }
  });
  if (!response.ok) {
    throw new Error(`BilInfo request failed (${response.status}).`);
  }

  const xml = await response.text();
  if (!countVehicles(xml)) {
    throw new Error('BilInfo returned no vehicle records.');
  }
  return xml;
}

async function getInventory(request, env) {
  const snapshot = await env.SITE_DATA.get(INVENTORY_KEY);
  if (snapshot) return xmlResponse(snapshot, 'kv');

  try {
    return xmlResponse(await readOfflineInventory(request, env), 'offline');
  } catch (error) {
    console.error('Offline inventory could not be loaded.', error);
    return jsonResponse({ ok: false, error: 'Vehicle inventory is unavailable.' }, 502);
  }
}

async function refreshInventory(env) {
  const settings = await readInventorySettings(env);
  const xml = await fetchBilInfo(env);
  const vehicleCount = countVehicles(xml);
  const refreshedAtTime = Date.now();
  const refreshedAt = new Date(refreshedAtTime).toISOString();
  const nextRefreshAt = settings.autoRefreshEnabled
    ? new Date(refreshedAtTime + settings.intervalHours * 60 * 60 * 1000).toISOString()
    : null;

  await env.SITE_DATA.put(INVENTORY_KEY, xml);
  await writeInventorySettings(env, {
    ...settings,
    lastUpdatedAt: refreshedAt,
    vehicleCount,
    nextRefreshAt,
    lastError: null
  });
  return { refreshedAt, nextRefreshAt, vehicleCount };
}

async function saveInventorySettings(request, env) {
  let submitted;
  try {
    submitted = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'A JSON inventory settings object is required.' }, 400);
  }

  if (
    !submitted ||
    typeof submitted.autoRefreshEnabled !== 'boolean' ||
    !INVENTORY_INTERVAL_HOURS.has(Number(submitted.intervalHours))
  ) {
    return jsonResponse({ ok: false, error: 'Choose whether automatic updates are enabled and a supported interval.' }, 400);
  }

  const current = await readInventorySettings(env);
  const intervalHours = Number(submitted.intervalHours);
  const lastUpdatedTime = current.lastUpdatedAt ? Date.parse(current.lastUpdatedAt) : NaN;
  const nextRefreshTime = Number.isFinite(lastUpdatedTime) ? lastUpdatedTime : Date.now();
  const nextRefreshAt = submitted.autoRefreshEnabled
    ? new Date(nextRefreshTime + intervalHours * 60 * 60 * 1000).toISOString()
    : null;
  const settings = {
    ...current,
    autoRefreshEnabled: submitted.autoRefreshEnabled,
    intervalHours,
    nextRefreshAt,
    lastError: null
  };
  await writeInventorySettings(env, settings);
  return jsonResponse({ ok: true, settings });
}

async function runScheduledInventoryRefresh(env, now = Date.now()) {
  const settings = await readInventorySettings(env);
  const nextRefreshTime = settings.nextRefreshAt ? Date.parse(settings.nextRefreshAt) : NaN;
  if (
    !settings.autoRefreshEnabled ||
    !Number.isFinite(nextRefreshTime) ||
    nextRefreshTime > now
  ) {
    return;
  }

  try {
    const xml = await fetchBilInfo(env);
    const vehicleCount = countVehicles(xml);
    const refreshedAtTime = Date.now();
    await env.SITE_DATA.put(INVENTORY_KEY, xml);
    await writeInventorySettings(env, {
      ...settings,
      lastUpdatedAt: new Date(refreshedAtTime).toISOString(),
      vehicleCount,
      nextRefreshAt: new Date(refreshedAtTime + settings.intervalHours * 60 * 60 * 1000).toISOString(),
      lastError: null
    });
  } catch (error) {
    console.error('Scheduled BilInfo inventory refresh failed.', error);
    await writeInventorySettings(env, {
      ...settings,
      lastError: 'BilInfo update failed. The previous inventory snapshot is still being served.'
    });
  }
}

async function saveCredentials(request, env) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_CREDENTIAL_BYTES) {
    return jsonResponse({ ok: false, error: 'Credential payload is too large.' }, 413);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_CREDENTIAL_BYTES) {
    return jsonResponse({ ok: false, error: 'Credential payload is too large.' }, 413);
  }

  let submitted;
  try {
    submitted = JSON.parse(body);
  } catch {
    return jsonResponse({ ok: false, error: 'A JSON credential object is required.' }, 400);
  }
  if (
    !submitted ||
    typeof submitted.username !== 'string' ||
    typeof submitted.password !== 'string' ||
    !submitted.username.trim() ||
    !submitted.password ||
    submitted.username.length > 512 ||
    submitted.password.length > 2048
  ) {
    return jsonResponse({ ok: false, error: 'BilInfo username and password are required.' }, 400);
  }

  let encrypted;
  try {
    encrypted = await encryptCredentials({
      username: submitted.username.trim(),
      password: submitted.password
    }, env);
  } catch (error) {
    console.error('Could not encrypt BilInfo credentials.', error);
    return jsonResponse({ ok: false, error: 'Credential encryption is not configured.' }, 503);
  }

  await env.SITE_DATA.put(CREDENTIALS_KEY, encrypted);
  return jsonResponse({ ok: true, configured: true });
}

async function saveConfig(request, env) {
  const declaredLength = Number(request.headers.get('Content-Length') || 0);
  if (declaredLength > MAX_CONFIG_BYTES) {
    return jsonResponse({ ok: false, error: 'Config payload is too large.' }, 413);
  }
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > MAX_CONFIG_BYTES) {
    return jsonResponse({ ok: false, error: 'Config payload is too large.' }, 413);
  }

  let submitted;
  try {
    submitted = JSON.parse(body);
  } catch {
    return jsonResponse({ ok: false, error: 'A JSON config object is required.' }, 400);
  }
  if (!submitted || typeof submitted !== 'object' || Array.isArray(submitted)) {
    return jsonResponse({ ok: false, error: 'A JSON config object is required.' }, 400);
  }

  const nextConfig = await readConfig(env);
  for (const [key, value] of Object.entries(submitted)) {
    if (!(key in DEFAULT_CONFIG)) {
      return jsonResponse({ ok: false, error: `Unknown config field: ${key}.` }, 400);
    }
    if (typeof value !== 'string' || value.length > MAX_FIELD_LENGTH) {
      return jsonResponse({ ok: false, error: `Invalid value for ${key}.` }, 400);
    }
    if (COLOR_CONFIG_KEYS.has(key) && !/^#[\da-f]{6}$/i.test(value)) {
      return jsonResponse({ ok: false, error: `Invalid color for ${key}.` }, 400);
    }
    if ((key === 'logoUrl' || key === 'ownerPhoto') && value) {
      const localPath = value.startsWith('/') && !value.startsWith('//');
      if (!localPath && !/^https:\/\//i.test(value)) {
        return jsonResponse({ ok: false, error: `Invalid image URL for ${key}.` }, 400);
      }
    }
    nextConfig[key] = value;
  }

  await env.SITE_DATA.put(CONFIG_KEY, JSON.stringify(nextConfig));
  return jsonResponse({ ok: true, config: nextConfig });
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      if (!(await requireAccess(request, env))) {
        return jsonResponse({ ok: false, error: 'Cloudflare Access authorization required.' }, 401);
      }
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
      }
      if (pathname === '/admin') {
        return Response.redirect(new URL('/admin/', request.url), 302);
      }
      return env.ASSETS.fetch(request);
    }
    if (pathname === '/api/config' && request.method === 'GET') {
      return jsonResponse({ ok: true, config: await readConfig(env) });
    }
    if (pathname === '/api/cars.xml' && request.method === 'GET') {
      return getInventory(request, env);
    }
    if (pathname.startsWith('/api/admin/')) {
      if (!(await requireAccess(request, env))) {
        return jsonResponse({ ok: false, error: 'Cloudflare Access authorization required.' }, 401);
      }
      if (pathname === '/api/admin/config' && request.method === 'POST') {
        return saveConfig(request, env);
      }
      if (pathname === '/api/admin/credentials' && request.method === 'GET') {
        return jsonResponse({
          ok: true,
          configured: !!(await env.SITE_DATA.get(CREDENTIALS_KEY))
        });
      }
      if (pathname === '/api/admin/credentials' && request.method === 'POST') {
        return saveCredentials(request, env);
      }
      if (pathname === '/api/admin/inventory/settings' && request.method === 'GET') {
        return jsonResponse({ ok: true, settings: await readInventorySettings(env) });
      }
      if (pathname === '/api/admin/inventory/settings' && request.method === 'POST') {
        return saveInventorySettings(request, env);
      }
      if (pathname === '/api/admin/inventory/refresh' && request.method === 'POST') {
        try {
          const result = await refreshInventory(env);
          return jsonResponse({ ok: true, source: 'bilinfo', ...result });
        } catch (error) {
          console.error('BilInfo inventory refresh failed.', error);
          return jsonResponse({ ok: false, error: 'BilInfo refresh failed. Check Worker logs.' }, 502);
        }
      }
      return jsonResponse({ ok: false, error: 'Not found.' }, 404);
    }

    return env.ASSETS.fetch(request);
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runScheduledInventoryRefresh(env));
  }
};
