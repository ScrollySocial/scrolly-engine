// Every brand kit the review page can pick from (step 1 "Brand kit"). Another kit (a holiday look, a client) is one
// more file in this folder + one line here.
import myBrand from './my-brand.mjs';
import { S } from '../settings.mjs';

export const BRANDS = { 'my-brand': myBrand };
// the person's default kit (reel-settings.json → brand), else the first one listed
export const defaultBrand = () => BRANDS[S.brand] || Object.values(BRANDS)[0];
export const brandList = () => Object.entries(BRANDS).map(([id, b]) => ({ id, label: b.label || id, colors: b.C }));
