// =======================
// /Hobby-Gallery/sheetsService.js
// =======================

(function () 
{
    'use strict';

    // ---- Storage prefixes ----
    const TOKEN_PREFIX = 'gs_token::';
    const DATA_PREFIX  = 'gs_data::';
    const DEFAULT_TTL_MS = 10 * 60 * 1000; // 10 min

    const memCache = new Map();
    const inFlight = new Map();
    const tokenClients = new Map();

    let gapiInitPromise = null;

    // ---- Helpers ----
    function waitForGoogleScripts() 
    {
        return new Promise(resolve => 
        {
            const check = () => 
            {
                if (window.gapi && window.google && google.accounts) resolve();
                else setTimeout(check, 50);
            };
            check();
        });
    }

    function readJSON(key) 
    {
        try 
        {
            const raw = sessionStorage.getItem(key);
            return raw ? JSON.parse(raw) : null;
        } 
        catch { return null; }
    }

    function writeJSON(key, value) 
    {
        try 
        {
            sessionStorage.setItem(key, JSON.stringify(value));
        } 
        catch { /* fail silently */ }
    }

    function tokenKey(scope) { return TOKEN_PREFIX + encodeURIComponent(scope); }
    function dataKey(spreadsheetId, tab, range, asObjects) 
    {
        return DATA_PREFIX + `${spreadsheetId}::${tab}::${range}::${asObjects ? 'obj' : 'raw'}`;
    }

    function getStoredToken(scope) 
    {
        const t = readJSON(tokenKey(scope));
        if (!t?.access_token || !t?.expires_at) return null;
        if (Date.now() >= t.expires_at) return null;
        return t;
    }

    function storeToken(scope, tokenResponse) 
    {
        const expiresAt = Date.now() + (tokenResponse.expires_in * 1000) - 60_000;
        writeJSON(tokenKey(scope), { access_token: tokenResponse.access_token, expires_at: expiresAt });
    }

    function clearStoredToken(scope) 
    {
        sessionStorage.removeItem(tokenKey(scope));
    }

    function processToObjects(values, headerRowIndex = 0) 
    {
        if (!values || values.length <= headerRowIndex) return [];
        const headers = values[headerRowIndex];
        const rows = values.slice(headerRowIndex + 1);

        return rows.map(row => 
        {
            const obj = {};
            for (let i = 0; i < headers.length; i++) 
            {
                obj[headers[i]] = row[i] ?? '';
            }
            return obj;
        });
    }

    // ---- GAPI init ----
    async function initGapiOnce() 
    {
        if (gapiInitPromise) return gapiInitPromise;

        gapiInitPromise = new Promise((resolve, reject) => 
        {
            gapi.load('client', async () => 
            {
                try 
                {
                    if (!window.CONFIG?.API_KEY) throw new Error('CONFIG.API_KEY missing');

                    await gapi.client.init({
                        apiKey: CONFIG.API_KEY,
                        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                    });

                    resolve();
                } 
                catch (e) { reject(e); }
            });
        });

        return gapiInitPromise;
    }

    // ---- GIS token ----
    function getTokenClient(scope) 
    {
        if (tokenClients.has(scope)) return tokenClients.get(scope);
        if (!window.CONFIG?.CLIENT_ID) throw new Error('CONFIG.CLIENT_ID missing');

        const tc = google.accounts.oauth2.initTokenClient({ client_id: CONFIG.CLIENT_ID, scope, callback: () => {} });
        tokenClients.set(scope, tc);
        return tc;
    }

    function requestAccessToken(scope, prompt) 
    {
        return new Promise((resolve, reject) => 
        {
            const tc = getTokenClient(scope);
            tc.callback = resp => 
            {
                if (!resp || resp.error) reject(resp);
                else resolve(resp);
            };
            tc.requestAccessToken({ prompt });
        });
    }

    async function ensureAuthed(scope) 
    {
        await waitForGoogleScripts();
        await initGapiOnce();

        const stored = getStoredToken(scope);
        if (stored) 
        {
            gapi.client.setToken({ access_token: stored.access_token });
            return;
        }

        try 
        {
            const resp = await requestAccessToken(scope, '');
            storeToken(scope, resp);
            gapi.client.setToken({ access_token: resp.access_token });
        } 
        catch 
        {
            const resp = await requestAccessToken(scope, 'consent');
            storeToken(scope, resp);
            gapi.client.setToken({ access_token: resp.access_token });
        }
    }

    // ---- Fetch ----
    async function fetchValues({ spreadsheetId, tab, range, scope, retry401 = true }) 
    {
        await ensureAuthed(scope);

        try 
        {
            const res = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId, range: `${tab}!${range}` });
            return res.result.values || [];
        } 
        catch (err) 
        {
            const code = err?.result?.error?.code;
            if (retry401 && code === 401) 
            {
                clearStoredToken(scope);
                await ensureAuthed(scope);
                return fetchValues({ spreadsheetId, tab, range, scope, retry401: false });
            }
            throw err;
        }
    }

    // ---- Public API ----
    async function getValues(opts) 
    {
        const { spreadsheetId, tab, range, ttlMs = DEFAULT_TTL_MS, scope = 'https://www.googleapis.com/auth/spreadsheets.readonly' } = opts;
        if (!spreadsheetId || !tab || !range) throw new Error('Missing required parameter');

        const key = dataKey(spreadsheetId, tab, range, false);
        if (memCache.has(key)) return memCache.get(key);

        const cached = readJSON(key);
        if (cached?.expiresAt && cached?.data && Date.now() < cached.expiresAt) 
        {
            memCache.set(key, cached.data);
            return cached.data;
        }

        if (inFlight.has(key)) return inFlight.get(key);

        const p = (async () => 
        {
            const values = await fetchValues({ spreadsheetId, tab, range, scope });
            memCache.set(key, values);
            writeJSON(key, { expiresAt: Date.now() + ttlMs, data: values });
            return values;
        })().finally(() => inFlight.delete(key));

        inFlight.set(key, p);
        return p;
    }

    async function getObjects(opts) 
    {
        const { headerRowIndex = 0, ...rest } = opts;
        const { spreadsheetId, tab, range, ttlMs = DEFAULT_TTL_MS, scope = 'https://www.googleapis.com/auth/spreadsheets.readonly' } = rest;

        if (!spreadsheetId || !tab || !range) throw new Error('Missing required parameter');

        const key = dataKey(spreadsheetId, tab, range, true);
        if (memCache.has(key)) return memCache.get(key);

        const cached = readJSON(key);
        if (cached?.expiresAt && cached?.data && Date.now() < cached.expiresAt) 
        {
            memCache.set(key, cached.data);
            return cached.data;
        }

        if (inFlight.has(key)) return inFlight.get(key);

        const p = (async () => 
        {
            const values = await fetchValues({ spreadsheetId, tab, range, scope });
            const objects = processToObjects(values, headerRowIndex);
            memCache.set(key, objects);
            writeJSON(key, { expiresAt: Date.now() + ttlMs, data: objects });
            return objects;
        })().finally(() => inFlight.delete(key));

        inFlight.set(key, p);
        return p;
    }

    function invalidateTab(spreadsheetId, tab) 
    {
        const prefix = DATA_PREFIX + `${spreadsheetId}::${tab}::`;
        for (let i = sessionStorage.length - 1; i >= 0; i--) 
        {
            const k = sessionStorage.key(i);
            if (k && k.startsWith(prefix)) sessionStorage.removeItem(k);
        }
        for (const k of memCache.keys()) 
        {
            if (k.startsWith(prefix)) memCache.delete(k);
        }
    }

    function clearAll() 
    {
        for (let i = sessionStorage.length - 1; i >= 0; i--) 
        {
            const k = sessionStorage.key(i);
            if (!k) continue;
            if (k.startsWith(TOKEN_PREFIX) || k.startsWith(DATA_PREFIX)) sessionStorage.removeItem(k);
        }
        memCache.clear();
        inFlight.clear();
    }

    window.SheetsService = { getValues, getObjects, invalidateTab, clearAll };

})();