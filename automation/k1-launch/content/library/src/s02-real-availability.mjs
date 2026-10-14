// S11 Â· Real availability (Playbook Ch. 13 4-frame pattern; Golden Hour's Nurture â†’ Trust â†’ Offer â†’ Action).
// 1080 Ã— 1920. Everything important sits inside Meta's safe zone: 269 px top, 672 px bottom, 65 px sides clear.
// Stickers are NEVER faked: dashed blue boxes mark where the customer adds the real sticker in Instagram.
import { C, img, rect, text, note, zone } from './design.mjs';

const pill = (y, s) => text(140, y, 800, 130, s, { size: 64, bold: true, fill: 'FFFFFF', align: 'center', valign: 'middle', radius: 22 });

export default {
  id: 'S02', slug: 's02-real-availability', kind: 'story', W: 1080, H: 1920,
  name: 'Real availability',
  group: 'Sales / conversion', job: 'Sell',
  forr: 'Telling warm followers you have real openings, and making booking one tap.',
  when: 'You have actual dates, spots or stock open. Only when itâ€™s true.',
  example: 'Field Notes Photography (illustrative example)',
  check: 'Link taps and bookings.',
  // Ideas attachment: the same 4 frames for 8 kinds of business. Frame 3 only when it's true.
  ideas: { roles: ['Frame 1 Â· Nurture (photo + line)', 'Frame 2 Â· Trust (video + line)', 'Frame 2 Â· Sample question box', 'Frame 3 Â· Offer (only if true)', 'Frame 4 Â· Link sticker text'], rows: [
    { biz: 'Hair salon', lines: ['Saturdayâ€™s balayage, before the blowout', '2 hours, one very good playlist', 'What do you want to know before your first color?', '3 Saturday spots left in May', 'BOOK YOUR SPOT'] },
    { biz: 'Dog groomer', lines: ['Biscuitâ€™s first groom', 'bath, brush, bandana', 'What does your dog hate most about grooming?', '2 openings this week: Tuesday and Thursday', 'BOOK A GROOM'] },
    { biz: 'Bakery', lines: ['this weekendâ€™s wedding cake', '6 hours of piping', 'What flavor should I add next?', '4 custom-cake slots left in June', 'ORDER YOURS'] },
    { biz: 'Etsy or product seller', lines: ['fresh batch, still curing', 'pouring 60 today', 'Which scent should come back next?', '12 left from this batch', 'SHOP THE BATCH'] },
    { biz: 'Tutor', lines: ['a studentâ€™s first chapter book', '1-on-1, 45 minutes, after school', 'Whatâ€™s the hardest subject at your house?', '2 after-school spots open this term', 'BOOK A FREE TRIAL'] },
    { biz: 'Personal trainer', lines: ['6am crew, week 4', 'small group, 3 people max', 'Whatâ€™s stopping you from starting?', '1 spot left in the 6am group', 'GRAB THE SPOT'] },
    { biz: 'Consultant or coach', lines: ['a clientâ€™s whiteboard after the audit', '90 minutes, one clear plan', 'Whatâ€™s the messiest part of your week?', '2 audit slots left in October', 'BOOK A CALL'] },
    { biz: 'Photographer', lines: ['last Saturday, 6:52pm', '8 hours. No stiff poses.', 'What do you want to know before booking?', '2 spring dates left: April 12 and May 3', 'PICK YOUR DATE'] },
  ]},
  frames: [
    { bg: C.ink, role: 'Nurture', els: [
      img(0, 0, 1080, 1920, 'Your photo: a favorite shot from recent work', 'familyGrass'),
      pill(330, 'last Saturday, 6:52pm'),
      note(140, 1290, 800, 200, 'SWAP IN: when or where it was, plus one small detail.\nEverything blue is a guide. Delete it before you download.'),
    ]},
    { bg: C.ink, role: 'Trust', els: [
      img(0, 0, 1080, 1920, 'Your video: 5 to 10 seconds behind the scenes. Drag your video onto this.', 'cameraBack'),
      pill(330, '8 hours. No stiff poses.'),
      zone(150, 560, 780, 360, 'question box', 'Sample question: â€œWhat do you want to know before booking?â€'),
      note(140, 1290, 800, 170, 'SWAP IN: what working with you is like, in 2 short lines. Keep your face or hands in the middle.'),
    ]},
    { bg: C.ink, role: 'Offer', els: [
      text(110, 440, 860, 520, '2 spring dates left', { f: 'serif', size: 160, color: 'FFFFFF', lh: 1.0, valign: 'bottom' }),
      text(110, 990, 860, 130, 'April 12 and May 3', { size: 64, color: C.hi, bold: true }),
      note(140, 1290, 800, 170, 'SWAP IN: your real number and your real dates, spots or stock. Only post this frame if itâ€™s true.'),
    ]},
    { bg: C.ink, role: 'Action', els: [
      img(0, 0, 1080, 1920, 'Your photo: you at work, or your work', 'familySky'),
      pill(330, 'booking page is open'),
      zone(150, 600, 780, 360, 'link sticker', 'Sample sticker text: â€œPICK YOUR DATEâ€ Â· link: your booking page'),
      note(140, 1290, 800, 170, 'SWAP IN: one line that says itâ€™s open. Then add the link sticker in Instagram, inside the box area.'),
    ]},
  ],
};
