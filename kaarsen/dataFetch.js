// =======================
// /Hobby-Gallery/kaarsen/dataFetch.js
// =======================

console.log('🕯️ Candles dataFetch.js loaded');

const CANDLE_SHEET = 
{
  spreadsheetId: '103CRnO-NKddx5BnUqerR3dWxvaQwZa2fNLVcbh2ysZM',
  tab: 'Candles',
  range: 'A:F',
};

const SHEETS_READ_SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

window.addEventListener('load', async () => {
  try {
    const data = await SheetsService.getObjects({
      spreadsheetId: CANDLE_SHEET.spreadsheetId,
      tab: CANDLE_SHEET.tab,
      range: CANDLE_SHEET.range,
      scope: SHEETS_READ_SCOPE,
      ttlMs: 10 * 60 * 1000,
    });

    console.log(`✅ Candles fetched: ${data.length} rows`);
    initCandleManipulation(data);
  } catch (err) {
    console.error('❌ Failed to fetch Candles:', err);
    initCandleManipulation([]); // still initialize safely
  }
});

