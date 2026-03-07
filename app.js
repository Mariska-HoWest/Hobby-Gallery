// =======================
// GENERAL APP.JS
// =======================

window.CONFIG = {
    CLIENT_ID: '451352190641-gqo0cqlg6urfmourrubdv3lhceg8rd39.apps.googleusercontent.com',
    API_KEY: 'AIzaSyBUtd0nI5kvhy0JjnpeXcSDdFTYYOVvxGM'
};

window.CONFIG = 
{
  CLIENT_ID: '451352190641-gqo0cqlg6urfmourrubdv3lhceg8rd39.apps.googleusercontent.com',
  API_KEY: 'AIzaSyBUtd0nI5kvhy0JjnpeXcSDdFTYYOVvxGM'
};

// Shared helper: convert Google Drive share link to direct link
function convertDriveLink(url) 
{
    try {
        const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);  // Adjust regex to correctly capture file ID
        if (match && match[1]) {
            const fileId = match[1];
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        } else {
            throw new Error("No file ID found");
        }
    } catch (error) {
        console.error("Error converting URL:", error);
        return url;  // Return original URL if conversion fails
    }
}
