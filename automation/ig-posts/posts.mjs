// Instagram single-image posts. Caption text: automation/planner/data/captions/<id>.md. Pins: automation/pins/batch-02.mjs.
// link = the site page the post teaches (its Pins link there, never to Instagram while a page fits).
export const POSTS = [
  { id: '2026-11-02-three-prices', link: '/calculators/profit/', tile: 'prices', image: {
    head: ['One $1,000 goal,', 'three prices'],
    rows: [['$15', '67', 'customers'], ['$35', '29', 'customers'], ['$60', '17', 'customers']],
    circle: '17',
    hand: 'the full math is in the caption ↓' } },
  { id: '2026-11-04-comment-to-dm', link: '/chat-manager/', tile: 'dm', image: {
    head: ['Comment a word.', 'Get the link', 'in your DMs.'],
    keyword: 'MATH',
    dm: ['Here’s your free calculator:', 'theambitiondepartment.com/calculators/income-goal/', 'Start with your income goal, it takes two minutes.'],
    aside: 'about $6 a month to run',
    hand: 'how it works is in the caption ↓' } },
  { id: '2026-11-06-google-checks', link: '/seo-site-audit/', tile: 'checks', image: {
    head: ['Can Google find', 'your website?'],
    sub: '5 free checks',
    items: ['Pages indexed', 'What Google shows', 'Titles that say what you sell', 'Speed on a phone', 'One page per offer'],
    hand: 'how to do each one is in the caption ↓' } },
];
