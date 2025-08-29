// =======================
// diamond-painting/script.js
// =======================

// Configuration for this page
const DP_CONFIG = {
    SPREADSHEET_ID: '103CRnO-NKddx5BnUqerR3dWxvaQwZa2fNLVcbh2ysZM', // Sheet ID only
    SHEET_TAB: 'Diamond Painting',                                  // Name of the tab
    SHEET_RANGE: 'A:K'                                              // Adjust based on your columns
};

// ---------------------------
// Data storage
// ---------------------------
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
// Initialize GIS and request token
// ---------------------------
function initGISAndFetch() {
    const waitForGoogle = setInterval(() => {
        if (typeof google !== 'undefined') {
            clearInterval(waitForGoogle);

            tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: CONFIG.CLIENT_ID,
                scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
                callback: async (tokenResponse) => {
                    console.log('✅ OAuth token received');

                    // Load gapi client AFTER token
                    gapi.load('client', async () => {
                        await gapi.client.init({
                            apiKey: CONFIG.API_KEY,
                            discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"]
                        });
                        console.log('✅ Google API client initialized');

                        // Fetch the sheet data
                        fetchDiamondData();
                    });
                },
            });

            // Automatically request an access token (user consent popup)
            tokenClient.requestAccessToken();
        }
    }, 100);
}

// ---------------------------
// Fetch DiamondPainting data
// ---------------------------
function fetchDiamondData() {
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
// Auto-init after page load
// ---------------------------
window.addEventListener('load', () => {
    // Start the GIS -> gapi -> fetch sequence
    initGISAndFetch();
});
