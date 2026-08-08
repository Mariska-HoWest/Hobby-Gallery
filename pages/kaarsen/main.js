import { mountNav } from '/Hobby-Gallery/shared/nav.js';
import { makeLogger } from '/Hobby-Gallery/shared/utils/log.js';
import { loadCandleData } from './js/data.js';
import { setupSorting } from './js/sorting.js';
import { renderCandles } from './js/render.js';
import { initModal, openCandleModal } from './js/modal.js';

const log = makeLogger('Candles');

mountNav();

try
{
    const candleData = await loadCandleData();

    initModal(candleData);

    const refresh = () => renderCandles(candleData, idx => openCandleModal(idx));

    setupSorting(candleData, refresh);
    refresh();

    log.info(`loaded ${candleData.length} candles`);
}
catch (err)
{
    log.error('failed to load Candles:', err);
}
