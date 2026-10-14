// R01 · Weekly Reel series: one named show, same look every week, a new episode each time.
// Customers duplicate the design weekly and change only the episode title, number and clips.
// Example business is illustrative. `ex` stock photos appear only in the finished-example previews.
import { R, S } from './layouts.mjs';

const RULE = '\nEverything blue is a guide. Delete it before you download.';

export default {
  kind: 'reel', W: 1080, H: 1920,
  id: 'R01', slug: 'r01-weekly-series', name: 'Weekly Reel series', job: 'Reach + Trust',
  forr: 'A named weekly show people come back for: same name, same look, a new episode every week.',
  when: 'You can answer one useful question a week. Pick a day you can keep.',
  example: 'Fix-It Frank handyman (illustrative example)',
  check: 'Follows, saves, and people asking for the next episode.',
  frames: [
    R.cover({ role: 'Cover (grid)', ph: 'Your photo: a still from this episode', ex: 'fenceLean', series: 'Fix-it Friday', title: 'Why your fence leans', ep: 'Ep. 04',
      note: 'SWAP IN: the series name (keep it the same every week), this episode’s title, and the number. Words stay in the middle so the grid doesn’t crop them.' + RULE }),
    R.open({ role: 'First 2 seconds', ph: 'Your video: the problem, close up', ex: 'fencePost', tag: 'Fix-it Friday · Ep. 4', hook: 'The post isn’t broken. The ground around it is.',
      note: 'SWAP IN: your clip + this episode’s hook in one line. Keep the series tag the same every week.' }),
    S.photo({ role: 'The useful part', ph: 'Your video: the fix or the answer', ex: 'postSetting', pillText: 'gravel at the base, not just dirt',
      note: 'SWAP IN: the one thing they should remember. Add more pages like this if you need them.' }),
    S.text({ role: 'Next episode', big: 'New Fix-it Friday every week.', sub: 'Follow so you catch Ep. 5: gates that drag.',
      note: 'SWAP IN: when the next episode comes out + what it’s about. Only promise a day you can keep.' }),
  ],
  ideas: { roles: ['Series name', 'This week’s episode (cover)', 'First 2 seconds (hook)', 'Next episode tease'], rows: [
    { biz: 'Bakery', lines: ['Bread Lab Monday', 'Why your sourdough is flat', 'One change made my loaves rise.', 'Next Monday: the crust trick.'] },
    { biz: 'Hair salon', lines: ['Color Check Tuesday', 'Why blonde turns brassy', 'It’s not your shampoo. It’s your water.', 'Next Tuesday: making a gloss last.'] },
    { biz: 'Photographer', lines: ['Frame It Friday', 'Phone photos of your kids that don’t blur', 'Stop chasing them. Do this instead.', 'Next Friday: window light at home.'] },
    { biz: 'Realtor', lines: ['Market Minute Monday', 'What $400K buys in our town now', 'Three houses, same price, very different.', 'Next Monday: the hidden cost of HOAs.'] },
    { biz: 'Consultant or coach', lines: ['Fix-It Wednesday', 'The meeting you can cancel this week', 'If it could be an email, here’s the test.', 'Next Wednesday: handoffs that stall.'] },
    { biz: 'Etsy or product seller', lines: ['Studio Sunday', 'How one candle gets poured', 'Two weeks of waiting in 30 seconds.', 'Next Sunday: picking this month’s scent.'] },
    { biz: 'Local service', lines: ['Fix-it Friday', 'Why your fence leans', 'The post isn’t broken. The ground is.', 'Next Friday: gates that drag.'] },
    { biz: 'Fitness or wellness', lines: ['Desk Reset Thursday', 'The 60-second neck fix', 'Do this at your desk right now.', 'Next Thursday: tight hips from sitting.'] },
  ]},
};
