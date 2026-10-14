// C04 · Mistakes → consequences → fix (Playbook Ch. 12 structure; Paper & Pixel is the book's example).
// Template text = a worked example (plumber) the customer overwrites; blue notes say what to swap in.
// Photos in the template are labeled placeholders (customers use their own photos, never stock as their work).
// `ex` = the licensed stock photo used only in the finished-example previews (Playbook stock, illustrative).
import { C, img, rect, text, note } from './design.mjs';

export default {
  id: 'C04', slug: 'c04-mistakes', kind: 'carousel', W: 1080, H: 1440,
  name: 'Mistakes → consequences → fix',
  job: 'Trust + Sell',
  forr: 'Teaching people what goes wrong, then showing your product or service as the fix.',
  when: 'Your customers make predictable mistakes before they buy from you.',
  example: 'Bright Pipe Plumbing (illustrative example)',
  caption: 'Comment [WORD] and I’ll send you the link. (Only if you’ll reply to every comment.) Or: [YOUR NEXT STEP] on my profile.',
  // Ideas attachment: the same template filled in for 8 kinds of business (illustrative, not real results).
  ideas: { roles: ['Slide 1 · Hook', 'Mistake #1', 'Mistake #2', 'Mistake #3', 'Do this instead', 'Last slide · Action'], rows: [
    { biz: 'Bakery', lines: ['3 cake-ordering mistakes that leave you with the wrong cake.', 'Ordering the week of the party.', 'Guessing how many it feeds.', 'Buttercream flowers at an outdoor July party.', 'Order 3 weeks ahead, by guest count, and ask what holds up outside.', 'Custom cakes from $65. Order form on my profile.'] },
    { biz: 'Hair salon', lines: ['3 at-home color mistakes that end in a correction appointment.', 'Box dye over old highlights.', 'Going two shades lighter in one go.', 'Hot showers the first week.', 'Book a consult before you DIY, go lighter in steps, rinse cool.', 'Free color consults. Book from my profile.'] },
    { biz: 'Photographer', lines: ['3 outfit mistakes that make family photos look stiff.', 'Everyone in matching white tees.', 'Brand-new shoes nobody can walk in.', 'Big logos and tiny patterns.', 'Pick 3 colors and let everyone mix them. Wear shoes you can run in.', 'Fall sessions are open. Pick your date on my booking page.'] },
    { biz: 'Realtor', lines: ['3 first-home mistakes that cost buyers the house they wanted.', 'Touring before you’re pre-approved.', 'Opening a new credit card mid-search.', 'Skipping the inspection to win.', 'Pre-approval first, no new credit, inspection every time.', 'DM me LIST for my first-home checklist.'] },
    { biz: 'Consultant or coach', lines: ['3 hiring mistakes that cost small teams a month.', 'Writing the job post the day you need help.', 'Hiring for skills, not for the handoff.', 'No plan for week one.', 'Post early, test the handoff in the interview, write the first-week plan first.', 'Book a 20-minute call from my profile.'] },
    { biz: 'Etsy or product seller', lines: ['3 gift-buying mistakes that mean it arrives after the birthday.', 'Ordering a personalized gift a week out.', 'Skipping the size chart.', 'Forgetting the gift note.', 'Order 2 weeks ahead, check the size chart, add a note at checkout.', 'Shop link on my profile. Ships in 3 days.'] },
    { biz: 'Cleaner or local service', lines: ['3 move-out cleaning mistakes that cost you your deposit.', 'Leaving the oven for last.', 'Forgetting inside the cabinets.', 'No photos when you hand back the keys.', 'Book the clean before the movers, and photograph every room after.', 'Move-out cleans from $180. Book from my profile.'] },
    { biz: 'Fitness or wellness', lines: ['3 beginner yoga mistakes that make class feel harder than it is.', 'Picking the advanced class to catch up.', 'Holding your breath in hard poses.', 'Skipping the blocks.', 'Start with a beginner flow, breathe slowly, use the props.', 'First class $10. Link on my profile.'] },
  ]},
  slides: [
    { bg: C.ink, role: 'Hook 1', els: [
      img(0, 0, 1080, 1440, 'Your photo: the problem or your product, close up', 'sinkLeak'),
      rect(0, 720, 1080, 720, C.ink, { alpha: 0.55 }),
      text(76, 820, 928, 540, '3 leak mistakes that turn a $150 repair into a $1,500 one.', { f: 'serif', size: 96, color: 'FFFFFF', valign: 'bottom', lh: 1.04 }),
      note(560, 64, 460, 300, 'SWAP IN: [number] mistakes about [your topic] that lead to [the result your customer fears].\nEverything blue is a guide. Delete it before you download.'),
    ]},
    { bg: C.paper, role: 'Hook 2 · works alone', els: [
      text(96, 380, 330, 76, 'MISTAKE #1', { size: 36, bold: true, fill: C.hi, align: 'center', valign: 'middle', radius: 10, charSpacing: 3 }),
      text(96, 490, 888, 450, 'Putting a bucket under it and waiting.', { f: 'serif', size: 112, lh: 1.02 }),
      text(96, 960, 860, 200, 'A slow drip under the sink can rot the cabinet floor before you notice.', { size: 46, lh: 1.3 }),
      note(560, 1220, 460, 160, 'SWAP IN: the #1 thing your customers do wrong, and what it costs them.'),
    ]},
    { bg: C.white, role: 'Middle', els: [
      text(76, 70, 928, 150, 'Mistake #2: ignoring a dripping faucet', { size: 60, bold: true, lh: 1.12 }),
      img(76, 250, 928, 1110, 'Your photo: mistake #2 in real life', 'faucetDrip'),
      text(120, 520, 560, 100, '3,000+ gallons a year', { f: 'hand', size: 66, fill: C.hi, align: 'center', valign: 'middle', rot: -3, radius: 8, shadow: true }),
      text(420, 790, 560, 100, 'usually a worn washer', { f: 'hand', size: 66, fill: C.hi, align: 'center', valign: 'middle', rot: 2, radius: 8, shadow: true }),
      text(140, 1040, 460, 100, 'a 20-minute fix', { f: 'hand', size: 66, fill: C.hi, align: 'center', valign: 'middle', rot: -2, radius: 8, shadow: true }),
      note(560, 1200, 440, 140, 'SWAP IN: mistake #2, then 3 short labels: what goes wrong, why, what it costs.'),
    ]},
    { bg: C.hi, role: 'Middle', els: [
      text(76, 300, 928, 380, '#3', { f: 'serif', size: 340, lh: 0.9, valign: 'bottom' }),
      text(76, 720, 900, 240, 'Pouring drain cleaner down it. Again.', { size: 70, bold: true, lh: 1.12 }),
      text(76, 980, 880, 200, 'It can damage older pipes, and the clog usually comes back.', { size: 46, lh: 1.3 }),
      note(560, 1230, 460, 140, 'SWAP IN: mistake #3 and what it causes, in one line.'),
    ]},
    { bg: C.paper2, role: 'Proof', els: [
      rect(150, 150, 780, 900, 'FFFFFF', { rot: -3, shadow: true }),
      img(185, 185, 710, 710, 'Your photo: your product or work fixing it', 'toolBelt', { rot: -3 }),
      text(185, 920, 710, 110, 'All three, fixed in one visit.', { f: 'hand', size: 76, align: 'center', valign: 'middle', rot: -3, color: '2A2A2A' }),
      rect(430, 122, 220, 64, C.hi, { rot: 4, alpha: 0.8 }),
      text(150, 1130, 780, 140, 'The cabinet leak, the faucet and the drain. Before lunch.', { size: 44, align: 'center', lh: 1.3 }),
      note(560, 1290, 460, 120, 'SWAP IN: a photo of YOUR work fixing it. Never stock.'),
    ]},
    { bg: C.paper, role: 'Middle', els: [
      text(96, 330, 888, 110, 'Do this instead:', { size: 68, bold: true }),
      rect(96, 520, 60, 60, null, { line: { color: C.ink, w: 7 }, radius: 8 }),
      text(190, 506, 800, 140, 'Call at the first drip', { size: 56, lh: 1.2 }),
      rect(96, 680, 60, 60, null, { line: { color: C.ink, w: 7 }, radius: 8 }),
      text(190, 666, 800, 140, 'Fix faucet drips the same week', { size: 56, lh: 1.2 }),
      rect(96, 840, 60, 60, null, { line: { color: C.ink, w: 7 }, radius: 8 }),
      text(190, 826, 800, 140, 'Snake the drain. Skip the chemicals.', { size: 56, lh: 1.2 }),
      note(560, 1230, 460, 140, 'SWAP IN: the fix for each mistake, in the same order.'),
    ]},
    { bg: C.ink, role: 'Action', els: [
      text(96, 330, 200, 100, '→', { f: 'hand', size: 100, color: C.hi }),
      text(96, 440, 888, 420, 'Same-day visits, Monday to Saturday.', { f: 'serif', size: 104, color: 'FFFFFF', lh: 1.03 }),
      text(96, 900, 560, 110, 'Book from my profile', { size: 46, bold: true, fill: C.hi, align: 'center', valign: 'middle', radius: 55 }),
      text(96, 1050, 860, 120, 'or DM me a photo of the leak.', { size: 42, color: 'D9D7D0', lh: 1.3 }),
      note(560, 1220, 460, 170, 'SWAP IN: your offer (price or timing) and your ONE next step. Put the same step in your caption.'),
    ]},
  ],
};
