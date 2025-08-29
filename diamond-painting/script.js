// =======================
// diamond-painting/script.js
// =======================

const DP_CONFIG = {
    SPREADSHEET_ID: '103CRnO-NKddx5BnUqerR3dWxvaQwZa2fNLVcbh2ysZM',
    SHEET_TAB: 'Diamond Painting',
    SHEET_RANGE: 'A:K'
};

let diamondData = [];
let tokenClient;

// ---------------------------
// Helper: convert raw sheet rows into objects
// ---------------------------
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
// Fetch DiamondPainting data
// ---------------------------
function fetchDiamondData() {
    console.log('⏳ Fetching Diamond Painting data...');
    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: DP_CONFIG.SPREADSHEET_ID,
        range: `${DP_CONFIG.SHEET_TAB}!${DP_CONFIG.SHEET_RANGE}`
    }).then(response => {
        diamondData = processSheetResponse(response);
        if (diamondData.length > 0) {
            console.log('✅ Diamond Painting data fetched successfully!', diamondData);
        } else {
            console.warn('⚠️ Diamond Painting tab is empty or could not be processed.');
        }
    }).catch(err => {
        console.error('❌ Failed to fetch Diamond Painting data:', err);
    });
}

// ---------------------------
// Initialize GAPI client
// ---------------------------
function initGAPI() {
    console.log('⏳ Initializing GAPI client...');
    gapi.load('client', async () => {
        try {
            await gapi.client.init({
                apiKey: CONFIG.API_KEY,
                discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
            });
            console.log('✅ Google API client initialized');

            // Once GAPI is ready, fetch the data
            fetchDiamondData();
        } catch (err) {
            console.error('❌ Failed to initialize GAPI client:', err);
        }
    });
}

// ---------------------------
// Initialize GIS token client and request token
// ---------------------------
function initGIS() {
    const waitForGIS = setInterval(() => {
        if (window.google && google.accounts && google.accounts.oauth2) {
            clearInterval(waitForGIS);

            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
                callback: (tokenResponse) => {
                    console.log('✅ OAuth token received', tokenResponse);

                    // Now initialize GAPI after token is available
                    initGAPI();
                }
            });

            console.log('⏳ Requesting OAuth token...');
            tokenClient.requestAccessToken(); // triggers consent popup if needed
        }
    }, 100);
}

// ---------------------------
// Auto-init after page load
// ---------------------------
window.addEventListener('load', () => {
    initGIS(); // Start the GIS -> GAPI -> fetch sequence
});
