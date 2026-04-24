// =======================
// /Hobby-Gallery/diamond-painting/dataFetch.js
// =======================

console.log('🔹 DP dataFetch.js loaded');

const DP_SHEET = {
  spreadsheetId: '103CRnO-NKddx5BnUqerR3dWxvaQwZa2fNLVcbh2ysZM',
  tab: 'Diamond Painting',
  range: 'A:K',
};

const SHEETS_READ_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

window.addEventListener('load', async () => {
  try 
  {
    const data = await SheetsService.getObjects({
      spreadsheetId: DP_SHEET.spreadsheetId,
      tab: DP_SHEET.tab,
      range: DP_SHEET.range,
      scope: SHEETS_READ_SCOPE,
      ttlMs: 10 * 60 * 1000,
    });

    initManipulation(data);
  } 
  catch (err) 
  {
    console.error('❌ Failed to load Diamond Painting data:', err);
  }
});