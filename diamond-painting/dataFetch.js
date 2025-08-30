// =======================
// diamond-painting/script.js
// =======================

console.log('🔹 script.js loaded');

const DP_CONFIG = {
    SPREADSHEET_ID: '103CRnO-NKddx5BnUqerR3dWxvaQwZa2fNLVcbh2ysZM', // Sheet ID only
    SHEET_TAB: 'Diamond Painting',                                  // Name of the tab
    SHEET_RANGE: 'A:K'                                              // Columns range
};

let diamondData = [];
let tokenClient;

// Helper to convert raw sheet rows to objects
function processSheetResponse(response) {
    const rawData = response.result.values;
    if (!rawData || rawData.length === 0) return [];
    const headers = rawData[0];
    return rawData.slice(1).map(row => {
        let obj = {};
        row.forEach((cell, i) => obj[headers[i]] = cell);
        return obj;
    });
}

// ---------------------------
// Wait until google.accounts exists
function waitForGIS(callback) {
    if (typeof google !== 'undefined' && google.accounts) {
        callback();
    } else {
        setTimeout(() => waitForGIS(callback), 100);
    }
}

// Initialize GIS and request token
function initGISAndFetch() {
    waitForGIS(() => {
        console.log('🟢 google.accounts ready');

        if (!window.CONFIG || !CONFIG.CLIENT_ID || !CONFIG.API_KEY) {
            console.error('❌ CONFIG.CLIENT_ID or CONFIG.API_KEY not defined');
            return;
        }

        tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CONFIG.CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
            callback: async (tokenResponse) => {
                console.log('✅ OAuth token received', tokenResponse);

                // Load gapi client AFTER token
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: CONFIG.API_KEY,
                            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
                        });
                        console.log('✅ Google API client initialized');

                        fetchDiamondData(updateDpDisplay);
                    } catch (err) {
                        console.error('❌ Failed to init gapi.client:', err);
                    }
                });
            },
        });

        // Request token immediately
        tokenClient.requestAccessToken();

        // Optionally show One Tap prompt
        google.accounts.id.initialize({
            client_id: CONFIG.CLIENT_ID,
            callback: (credResponse) => {
                console.log('ℹ️ One Tap credential received', credResponse);
            },
            auto_select: true,
            cancel_on_tap_outside: false
        });
        google.accounts.id.prompt();
    });
}

// Fetch the Diamond Painting sheet
function fetchDiamondData(callback) {
    console.log('🔹 Fetching Diamond Painting data...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: DP_CONFIG.SPREADSHEET_ID,
        range: `${DP_CONFIG.SHEET_TAB}!${DP_CONFIG.SHEET_RANGE}`
    }).then(response => {
        diamondData = processSheetResponse(response);
        if (diamondData.length > 0) {
            console.log('✅ Diamond Painting data fetched successfully!', diamondData);
            callback();
        } else {
            console.warn('⚠️ Diamond Painting tab is empty or could not be processed.');
        }
    }).catch(err => {
        console.error('❌ Failed to fetch Diamond Painting data:', err);
    });
}

function waitForScripts(callback) {
    const check = () => {
        if (typeof google !== 'undefined' && google.accounts && typeof gapi !== 'undefined') {
            callback();
        } else {
            setTimeout(check, 100);
        }
    };
    check();
}

window.addEventListener('load', () => {
    console.log('🔹 Window loaded, waiting for Google scripts...');
    waitForScripts(() => {
        console.log('🟢 Google scripts loaded, starting GIS -> gapi -> fetch sequence');
        initGISAndFetch();
    });
});
