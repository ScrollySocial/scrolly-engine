// Every brand kit the review page can pick from (step 1 "Brand kit"). A customer's kit is one more file + one line here.
import scrolly from './scrolly.mjs';
import holiday from './scrolly-holiday.mjs';
import { S } from '../settings.mjs';

export const BRANDS = { scrolly, 'scrolly-holiday': holiday };
// the person's default kit (reel-settings.json → brand), else the first one listed
export const defaultBrand = () => BRANDS[S.brand] || Object.values(BRANDS)[0];
// how a kit sets its statements (kits written before 2026-10-21 have no statementType: the heavy condensed default)
export const statementType = (B) => ({ file: 'bricolage-800.woff2', format: 'woff2', weight: 800, stretch: '78%', thin: false, ...(B.statementType || {}) });
export const brandList = () => Object.entries(BRANDS).map(([id, b]) => ({ id, label: b.label || id, colors: b.C }));
