import { CONFIG, SHEETS_READ_SCOPE } from '/Hobby-Gallery/shared/config.js';
import { getObjects } from '/Hobby-Gallery/shared/sheets/sheetsService.js';

const SHEET = {
    spreadsheetId: CONFIG.SPREADSHEET_ID,
    tab: 'Candles',
    range: 'A:G'
};

export async function loadCandleData()
{
    return getObjects({
        spreadsheetId: SHEET.spreadsheetId,
        tab: SHEET.tab,
        range: SHEET.range,
        scope: SHEETS_READ_SCOPE,
        ttlMs: 10 * 60 * 1000
    });
}
