// Every brand kit the review page can pick from (step 1 "Brand kit"). Another kit (a second brand, a client) is one
// more file in this folder + one line here. Holiday versions of your kit come from holidays.mjs.
import myBrand from './my-brand.mjs';
import { holidayKits } from './holidays.mjs';
import { S } from '../settings.mjs';

export const BRANDS = { 'my-brand': myBrand, ...holidayKits(myBrand, S.holidays) };
// the person's default kit (reel-settings.json → brand), else the first one listed
export const defaultBrand = () => BRANDS[S.brand] || Object.values(BRANDS)[0];
export const brandList = () => Object.entries(BRANDS).map(([id, b]) => ({ id, label: b.label || id, colors: b.C }));
