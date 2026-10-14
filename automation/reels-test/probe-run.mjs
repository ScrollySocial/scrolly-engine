// Small capped probe runs: saves raw items to data/probes/<label>.json and prints field shape.
// Usage: node probe-run.mjs <label>
import fs from 'node:fs';
import path from 'node:path';
import { runActor, DATA_DIR } from './apify.mjs';

const PROBES = {
  'clockworks-sounds-surging': ['clockworks/tiktok-trends-scraper', { adsScrapeHashtags: false, adsScrapeSounds: true, adsSoundsCountryCode: 'US', adsRankType: 'surging', adsTimeRange: '7', resultsPerPage: 10 }],
  'clockworks-videos': ['clockworks/tiktok-trends-scraper', { adsScrapeHashtags: false, adsScrapeVideos: true, adsVideosCountryCode: 'US', adsSortVideosBy: 'vv', adsTimeRange: '7', resultsPerPage: 10 }],
  'datapeak-songs': ['datapeak/tiktok-creative-center', { mode: 'songs', region: 'US', period: '7', maxItems: 10 }],
  'doliz-videos': ['doliz/tiktok-creative-center-scraper', { target: 'trending_videos', videos_country: 'US', videos_period: '7', videos_sort_by: 'vv', videos_limit: 10 }],
  'apidojo-search-week': ['apidojo/tiktok-scraper', { keywords: ['small business'], dateRange: 'THIS_WEEK', sortType: 'MOST_LIKED', location: 'US', maxItems: 20 }],
  'apidojo-rawshape': ['apidojo/tiktok-scraper', { keywords: ['trend'], dateRange: 'THIS_WEEK', sortType: 'MOST_LIKED', location: 'US', maxItems: 3,
    customMapFunction: '(o) => ({ keys: Object.keys(o), songKeys: o.song ? Object.keys(o.song) : null, musicKeys: o.music ? Object.keys(o.music) : null, songIdType: typeof (o.song && o.song.id), dump: JSON.stringify(o).slice(0, 2500) })' }],
  'clockworks-search-week': ['clockworks/tiktok-scraper', { searchQueries: ['capcut template'], searchSection: '/video', videoSearchSorting: 'MOST_LIKED', videoSearchDateFilter: 'PAST_WEEK', resultsPerPage: 5, proxyCountryCode: 'None' }],
  'data-xplorer-hashtags': ['data_xplorer/tiktok-trends', { countryCode: 'US', period: '7', sortBy: 'popular', maxHashtags: 10 }],
  'khadinakbar-explore': ['khadinakbar/tiktok-trending-videos-scraper', { feed: 'explore', region: 'US', maxResults: 10 }],
};

const label = process.argv[2];
const [actor, input] = PROBES[label] || [];
if (!actor) { console.log('labels:', Object.keys(PROBES).join(', ')); process.exit(1); }
try {
  const { items, rec } = await runActor(actor, input, { maxItems: 25, maxTotalChargeUsd: /^clockworks/.test(label) ? 0.5 : 0.1, timeoutSecs: 240, label: `probe:${label}` });
  fs.mkdirSync(path.join(DATA_DIR, 'probes'), { recursive: true });
  fs.writeFileSync(path.join(DATA_DIR, 'probes', `${label}.json`), JSON.stringify(items, null, 2));
  console.log(JSON.stringify(rec));
  const keys = new Set(); items.forEach((i) => Object.keys(i).forEach((k) => keys.add(k)));
  console.log('fields:', [...keys].join(', '));
  console.log('first:', JSON.stringify(items[0] ?? null).slice(0, 1500));
} catch (e) { console.log(`FAILED ${label}: ${e.message.slice(0, 500)}`); }


