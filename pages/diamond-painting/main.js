import { mountNav } from '/Hobby-Gallery/shared/nav.js';
import { makeLogger } from '/Hobby-Gallery/shared/utils/log.js';
import { loadDpData } from './js/data.js';
import { initFilters } from './js/filters.js';
import { renderDp, applyMasonry } from './js/render.js';
import { mountEditor } from './js/editor.js';

const log = makeLogger('DP');

const dpData = [];

mountNav();
mountEditor(dpData);

const refresh = () =>
{
    renderDp(dpData);
    requestAnimationFrame(applyMasonry);
};

try
{
    const fetched = await loadDpData();

    fetched.sort((a, b) =>
    {
        const areaDiff = (b.Width * b.Height) - (a.Width * a.Height);
        if (Math.abs(areaDiff) < 50) return Math.random() - 0.5;
        return areaDiff;
    });

    fetched.forEach(dp => dp.__visible = true);
    dpData.push(...fetched);

    initFilters(dpData, refresh);
    refresh();

    log.info(`loaded ${dpData.length} paintings`);
}
catch (err)
{
    log.error('failed to load Diamond Painting data:', err);
}
