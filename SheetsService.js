// =======================
// General SheetsService
// =======================

(function () 
{
  'use strict';

  // ---- Storage prefixes ----
  const TOKEN_PREFIX = 'gs_token::';
  const DATA_PREFIX  = 'gs_data::';

  // Default data cache TTL (adjust if you want)
  const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 minutes

  // Per-page caches (fast)
  const memCache = new Map();   // key -> data
  const inFlight = new Map();   // key -> Promise

  // Per-page init
  let gapiInitPromise = null;

  // GIS token clients per scope
  const tokenClients = new Map(); // scope -> tokenClient

  // ---- Helpers ----
  function waitForGoogleScripts() {
    return new Promise((resolve) => {
      const check = () => {
        const ok = (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2)
               && (typeof gapi !== 'undefined');
        if (ok) resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  function readJSON(key) {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // sessionStorage full or blocked — just fail gracefully (memory cache still works)
      console.warn('⚠️ sessionStorage write failed:', e);
    }
  }

  function tokenKey(scope) {
    return TOKEN_PREFIX + encodeURIComponent(scope);
  }

  function dataKey(spreadsheetId, tab, range, asObjects) {
    return DATA_PREFIX + `${spreadsheetId}::${tab}::${range}::${asObjects ? 'obj' : 'raw'}`;
  }

  function getStoredToken(scope) {
    const t = readJSON(tokenKey(scope));
    if (!t?.access_token || !t?.expires_at) return null;
    if (Date.now() >= t.expires_at) return null;
    return t;
  }

  function storeToken(scope, tokenResponse) {
    // tokenResponse.expires_in is seconds
    const expiresAt = Date.now() + (tokenResponse.expires_in * 1000) - 60_000; // 1 min buffer
    writeJSON(tokenKey(scope), {
      access_token: tokenResponse.access_token,
      expires_at: expiresAt
    });
  }

  function clearStoredToken(scope) {
    sessionStorage.removeItem(tokenKey(scope));
  }

  function processToObjects(values, headerRowIndex = 0) {
    if (!values || values.length === 0) return [];
    if (values.length <= headerRowIndex) return [];

    const headers = values[headerRowIndex];
    const rows = values.slice(headerRowIndex + 1);

    return rows.map(row => {
      const obj = {};
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = row[i] ?? '';
      }
      return obj;
    });
  }

  // ---- GAPI init ----
  async function initGapiOnce() {
    if (gapiInitPromise) return gapiInitPromise;

    gapiInitPromise = new Promise((resolve, reject) => {
      gapi.load('client', async () => {
        try {
          if (!window.CONFIG?.API_KEY) {
            throw new Error('window.CONFIG.API_KEY is missing');
          }

          await gapi.client.init({
            apiKey: CONFIG.API_KEY,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
          });

          resolve();
        } catch (e) {
          reject(e);
        }
      });
    });

    return gapiInitPromise;
  }

  // ---- GIS token ----
  function getTokenClient(scope) {
    if (tokenClients.has(scope)) return tokenClients.get(scope);

    if (!window.CONFIG?.CLIENT_ID) {
      throw new Error('window.CONFIG.CLIENT_ID is missing');
    }

    const tc = google.accounts.oauth2.initTokenClient({
      client_id: CONFIG.CLIENT_ID,
      scope,
      callback: () => {} // replaced per request
    });

    tokenClients.set(scope, tc);
    return tc;
  }

  function requestAccessToken(scope, prompt) {
    return new Promise((resolve, reject) => {
      const tc = getTokenClient(scope);

      tc.callback = (resp) => {
        if (!resp || resp.error) reject(resp);
        else resolve(resp);
      };

      tc.requestAccessToken({ prompt });
    });
  }

  async function ensureAuthed(scope) {
    await waitForGoogleScripts();
    await initGapiOnce();

    // If we already have a valid stored token, use it
    const stored = getStoredToken(scope);
    if (stored) {
      gapi.client.setToken({ access_token: stored.access_token });
      return;
    }

    // Try silent first, then interactive as fallback
    try {
      const resp = await requestAccessToken(scope, '');
      storeToken(scope, resp);
      gapi.client.setToken({ access_token: resp.access_token });
    } catch (e) {
      const resp = await requestAccessToken(scope, 'consent');
      storeToken(scope, resp);
      gapi.client.setToken({ access_token: resp.access_token });
    }
  }

  // ---- Core fetch ----
  async function fetchValues({ spreadsheetId, tab, range, scope, retry401 = true }) {
    await ensureAuthed(scope);

    try {
      const res = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${tab}!${range}`
      });
      return res.result.values || [];
    } catch (err) {
      const code = err?.result?.error?.code;

      // If token expired/revoked, clear and retry once
      if (retry401 && code === 401) {
        clearStoredToken(scope);
        // force new token next call
        await ensureAuthed(scope);
        return fetchValues({ spreadsheetId, tab, range, scope, retry401: false });
      }

      throw err;
    }
  }

  // ---- Public API ----
  async function getValues(opts) {
    const {
      spreadsheetId,
      tab,
      range,
      ttlMs = DEFAULT_TTL_MS,
      scope = 'https://www.googleapis.com/auth/spreadsheets.readonly'
    } = opts;

    if (!spreadsheetId) throw new Error('getValues: spreadsheetId is required');
    if (!tab) throw new Error('getValues: tab is required');
    if (!range) throw new Error('getValues: range is required');

    const key = dataKey(spreadsheetId, tab, range, false);

    // memory cache first
    if (memCache.has(key)) return memCache.get(key);

    // session cache
    const cached = readJSON(key);
    if (cached?.expiresAt && cached?.data && Date.now() < cached.expiresAt) {
      memCache.set(key, cached.data);
      return cached.data;
    }

    // de-dupe parallel calls
    if (inFlight.has(key)) return inFlight.get(key);

    const p = (async () => {
      const values = await fetchValues({ spreadsheetId, tab, range, scope });
      memCache.set(key, values);
      writeJSON(key, { expiresAt: Date.now() + ttlMs, data: values });
      return values;
    })().finally(() => inFlight.delete(key));

    inFlight.set(key, p);
    return p;
  }

  async function getObjects(opts) {
    const {
      headerRowIndex = 0, // 0 = first row is headers
      ...rest
    } = opts;

    const {
      spreadsheetId,
      tab,
      range,
      ttlMs = DEFAULT_TTL_MS,
      scope = 'https://www.googleapis.com/auth/spreadsheets.readonly'
    } = rest;

    if (!spreadsheetId) throw new Error('getObjects: spreadsheetId is required');
    if (!tab) throw new Error('getObjects: tab is required');
    if (!range) throw new Error('getObjects: range is required');

    const key = dataKey(spreadsheetId, tab, range, true);

    if (memCache.has(key)) return memCache.get(key);

    const cached = readJSON(key);
    if (cached?.expiresAt && cached?.data && Date.now() < cached.expiresAt) {
      memCache.set(key, cached.data);
      return cached.data;
    }

    if (inFlight.has(key)) return inFlight.get(key);

    const p = (async () => {
      const values = await fetchValues({ spreadsheetId, tab, range, scope });
      const objects = processToObjects(values, headerRowIndex);
      memCache.set(key, objects);
      writeJSON(key, { expiresAt: Date.now() + ttlMs, data: objects });
      return objects;
    })().finally(() => inFlight.delete(key));

    inFlight.set(key, p);
    return p;
  }

  function invalidateTab(spreadsheetId, tab) {
    const prefix = DATA_PREFIX + `${spreadsheetId}::${tab}::`;
    // remove from sessionStorage
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(prefix)) sessionStorage.removeItem(k);
    }
    // remove from memory
    for (const k of memCache.keys()) {
      if (k.startsWith(prefix)) memCache.delete(k);
    }
  }

  function clearAll() {
    // sessionStorage: remove our keys
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (!k) continue;
      if (k.startsWith(TOKEN_PREFIX) || k.startsWith(DATA_PREFIX)) {
        sessionStorage.removeItem(k);
      }
    }
    memCache.clear();
    inFlight.clear();
  }

  window.SheetsService = {
    getValues,
    getObjects,
    invalidateTab,
    clearAll
  };
})();
