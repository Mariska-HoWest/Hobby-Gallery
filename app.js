// =======================
// GENERAL APP.JS
// =======================

const CONFIG = {
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
        const id = url.match(/\/d\/(.*?)\//)[1];
        return `https://drive.google.com/uc?export=view&id=${id}`;
    } catch {
        return url; // fallback in case it's already direct
    }
}
