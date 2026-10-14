// Every brand kit the review page can pick from (step 1 "Brand kit"). A customer's kit is one more file + one line here.
import scrolly from './scrolly.mjs';
import holiday from './scrolly-holiday.mjs';
import { S } from '../settings.mjs';

export const BRANDS = { scrolly, 'scrolly-holiday': holiday };
// the person's default kit (reel-settings.json → brand), else the first one listed
export const defaultBrand = () => BRANDS[S.brand] || Object.values(BRANDS)[0];
export const brandList = () => Object.entries(BRANDS).map(([id, b]) => ({ id, label: b.label || id, colors: b.C }));
