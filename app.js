// =======================
// GENERAL APP.JS
// =======================

window.CONFIG = {
    CLIENT_ID: '451352190641-gqo0cqlg6urfmourrubdv3lhceg8rd39.apps.googleusercontent.com',
    API_KEY: 'AIzaSyBUtd0nI5kvhy0JjnpeXcSDdFTYYOVvxGM'
};

// Initialize Google API client
function initGAPIClient(onReadyCallback) {
    // Wait until gapi is loaded
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: CONFIG.CLIENT_ID,
            apiKey: CONFIG.API_KEY,
            scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
        }).then(() => {
            console.log('GAPI client initialized');
            gapi.auth2.getAuthInstance().signIn()
                .then(() => {
                    console.log('Sign-in successful');
                    if (typeof onReadyCallback === 'function') onReadyCallback();
                })
                .catch(err => console.error('Error signing in:', err));
        }).catch(err => console.error('Error initializing GAPI client:', err));
    });
}

// Shared helper: convert Google Drive share link to direct link
function convertDriveLink(url) {
    try {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);  // Adjust regex to correctly capture file ID
        if (match && match[1]) {
            const fileId = match[1];
        return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
        } else {
            throw new Error("No file ID found");
        }
    } catch (error) {
        console.error("Error converting URL:", error);
        return url;  // Return original URL if conversion fails
    }
}
