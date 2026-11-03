// Builds the 8 Christmas countdown captions from her shared caption (2026-11-03 v3): same message and order on every
// post, with the opener, the examples, the comment line and the hashtags varied per day so Instagram doesn't see
// 8 copies. Writes christmas-countdown-2026.md next to this file.
//   node make-christmas-captions.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const KEYWORD = 'EARN1K'; // her pick for the $1K Club + Challenge (2026-10-23); must be live on email signup first

const days = [
  { day: 51, date: 'Nov 4', card: 'cf8d4dff0e6c', open: '51 days until Christmas 🎄 Want some extra money for Christmas shopping? Here\'s how.' },
  { day: 50, date: 'Nov 5', card: '4e05bbe4611d', open: '50 days until Christmas 🎁 Imagine buying the presents with money from your own little business.' },
  { day: 49, date: 'Nov 6', card: 'e861eeed655f', open: 'Christmas is in 49 days ☕ An extra $1,000 before then would feel pretty good, right?' },
  { day: 48, date: 'Nov 7', card: '54adbcdb83bf', open: '48 days until Christmas 🎄 What if this year\'s present to yourself was finally starting that business?' },
  { day: 47, date: 'Nov 8', card: 'd5600a3bb731', open: '47 days until Christmas ☕ A little extra income before the holidays would be nice, right?' },
  { day: 45, date: 'Nov 10', card: '6c08961e02d1', open: 'Dear Santa, I\'d like some customers for Christmas 🎅 Actually, let\'s make a plan.' },
  { day: 44, date: 'Nov 11', card: '261f4114b8a9', open: '44 days until Christmas 🎁 If you made an extra $1,000 before then, what would you spend it on?' },
  { day: 30, date: 'Nov 25', card: '47910a225fbd', open: '30 days until Christmas 🎄 Start the 30-day Challenge today and your 30 days finish on Christmas.' },
];

// one variant per day for each changing part (index = position in `days`)
const V = {
  challenge: [
    'If you want to make $1,000 but haven\'t unlocked making money online yet, and you\'re tired of starting over, we built the $1K Challenge to help people like you get your business off the ground.',
    'Want to make $1,000 but still haven\'t cracked making money online? Tired of starting over? We built the $1K Challenge to help people like you get your business going.',
    'If making money online hasn\'t clicked for you yet, and you\'re tired of starting over, the $1K Challenge was built for you: to help you get your business started and keep it going.',
    'Ready to make $1,000, but making money online hasn\'t clicked yet? If you\'re tired of starting over, we built the $1K Challenge to help people like you finally get started.',
    'If you\'d love to make $1,000 but haven\'t figured out making money online yet, and you\'re tired of starting over, we built the $1K Challenge for people like you.',
    'Want your first $1,000 online, without starting over again? We built the $1K Challenge to help people like you get your business off the ground.',
    'If you want to make $1,000 but making money online hasn\'t clicked yet, and you\'re tired of starting over, the $1K Challenge is built to help you get started.',
    'If you\'ve wanted to make $1,000 online but it hasn\'t clicked yet, and you\'re tired of starting over, we built the $1K Challenge to help people like you get your business going.',
  ],
  simple: [
    'We simplified everything to get you started: 25 Reel ideas every week, so all you have to do is film short clips and post! You also get your $1K Plan for the next 30 days. And when you show proof of $1,000 in sales, you earn the Challenge shirt 🎉',
    'We made it simple: you get 25 Reel ideas every week, so all you have to do is film short clips and post! Your $1K Plan maps out the next 30 days. Show proof of $1,000 in sales and you earn the Challenge shirt 🎉',
    'Everything is simplified for you: 25 Reel ideas every week, so you just film short clips and post! Plus your $1K Plan for the next 30 days. When you show proof of $1,000 in sales, the Challenge shirt is yours to earn 🎉',
    'We kept it simple: 25 Reel ideas every week, so all you have to do is film short clips and post! You also get your $1K Plan for the next 30 days, and you earn the Challenge shirt when you show proof of $1,000 in sales 🎉',
    'We simplified it all: 25 Reel ideas land every week, so all you have to do is film short clips and post! You get your $1K Plan for the next 30 days too. Show proof of $1,000 in sales and you earn the Challenge shirt 🎉',
    'To get you started, we simplified everything: 25 Reel ideas every week, so you film short clips and post! You also get your $1K Plan for the next 30 days. And when you show proof of $1,000 in sales, you earn the Challenge shirt 🎉',
    'We made getting started simple: 25 Reel ideas every week, so all you have to do is film short clips and post! Your $1K Plan covers the next 30 days. When you show proof of $1,000 in sales, you earn the Challenge shirt 🎉',
    'Starting today, you could have 25 Reel ideas every week, so all you have to do is film short clips and post! You also get your $1K Plan for the 30 days. Show proof of $1,000 in sales and you earn the Challenge shirt 🎉',
  ],
  callout: [
    '"If you\'re a busy mom who wants…"', '"If you sell handmade candles and…"', '"If you\'re a new photographer who…"',
    '"If you bake from home and…"', '"If you\'re a teacher with a side hustle…"', '"If you make jewelry and…"',
    '"If you\'re a coach who…"', '"If you sell on Etsy and…"',
  ],
  educate: [
    'People buy from the person who helped them first.', 'A helpful tip makes them trust you.',
    'Help first, and they\'ll remember you when they\'re ready to buy.', 'People buy from the person who helped them first.',
    'A quick tip they can use today makes them trust you.', 'Help first, and they\'ll remember you when they\'re ready to buy.',
    'People buy from the person who helped them first.', 'A helpful tip makes them trust you.',
  ],
  demo: [
    'the unboxing, the before and after, a quick how-to', 'you making it, a close-up, the finished piece',
    'a client\'s before and after, a 10-second tutorial', 'the box arriving, the first use, the result',
    'a quick tutorial, the finished result', 'a close-up of the details, then it in use',
    'a mini session, a client result', 'the packing, the unboxing, the five-star moment',
  ],
  objection: [
    'the price, the time it takes, "will this work for me?"', '"is it worth it?", "how long will it take?", "what if I\'m a beginner?"',
    '"I don\'t have time", "I\'ve tried before", "is it too expensive?"', 'the price, the shipping time, "will it fit me?"',
    '"I\'m not techy", "I don\'t have time", "will this work for me?"', '"is it worth the price?", "how long does it last?"',
    '"I\'ve tried this before", "what if it doesn\'t work for me?"', 'the price, the delivery date, "will this work for me?"',
  ],
  after: [
    'how their day looks once they have it', 'how they feel once it\'s theirs', 'what changes for them a week later',
    'the moment it all clicks for them', 'how their day looks once they have it', 'how they feel once it\'s theirs',
    'what changes for them a week later', 'the moment it all clicks for them',
  ],
  product: [
    'Already have a product? This is a golden opportunity for online sales. Don\'t wait for the new year to start!',
    'Already selling something? This is the golden season for online shopping, so don\'t wait for the new year to start!',
    'Have a product already? Holiday shopping is a golden opportunity for online sales. Start now, before the new year!',
    'Already have a product? Right now is a golden opportunity for online sales. Don\'t wait for January!',
    'Got a product? This is the golden season for online sales, so don\'t wait for the new year to start!',
    'Already have a product? People are shopping online for gifts right now. Don\'t wait for the new year to start!',
    'Selling something already? This is a golden opportunity for online sales. Don\'t wait for the new year!',
    'Already have a product? These last weeks before Christmas are a golden opportunity for online sales. Start today!',
  ],
  affiliate: [
    'No product yet, but want some extra income? If you own Chat Manager, you can join our affiliate program. You share a tool that saves people from paying monthly ManyChat fees, and earn up to $40 for every sale.',
    'No product yet? If you own Chat Manager, you can earn extra income as an affiliate: share a tool that saves people from monthly ManyChat fees, and make up to $40 for every sale.',
    'Don\'t have a product yet, but want to earn something now? Chat Manager owners can join our affiliate program and make up to $40 per sale, sharing a tool that saves people from monthly ManyChat fees.',
    'No product yet? If you own Chat Manager, join our affiliate program and earn up to $40 for every sale. You\'d be sharing a tool that saves people from paying monthly ManyChat fees.',
    'Want extra income but don\'t have a product yet? If you own Chat Manager, you can become one of our affiliates and earn up to $40 per sale, sharing a tool that saves people from monthly ManyChat fees.',
    'No product of your own yet? Chat Manager owners can join our affiliate program, share a tool that saves people from paying monthly ManyChat fees, and earn up to $40 for every sale.',
    'Don\'t have a product yet? If you own Chat Manager, you can start earning now as an affiliate: up to $40 for every sale of a tool that saves people from monthly ManyChat fees.',
    'No product yet, but want to earn before Christmas? If you own Chat Manager, join our affiliate program and make up to $40 per sale, sharing a tool that saves people from monthly ManyChat fees.',
  ],
  cta: [
    `Comment ${KEYWORD} and I'll send you the details 👇`, `Want in? Comment ${KEYWORD} below 👇`,
    `Comment ${KEYWORD} and I'll DM you how it works 👇`, `Ready to start? Comment ${KEYWORD} 👇`,
    `Comment ${KEYWORD} and I'll send you the details 👇`, `Want in? Comment ${KEYWORD} below 👇`,
    `Comment ${KEYWORD} and I'll DM you how it works 👇`, `Ready? Comment ${KEYWORD} and I'll send you everything 👇`,
  ],
  tags: [
    '#smallbusinessowner #sidehustle #makemoneyonline', '#sidehustleideas #giftbusiness #instagramtips',
    '#onlinebusiness #reelstips #smallbusinesstips', '#startabusiness #sidehustle #instagramgrowth',
    '#smallbusinessowner #makemoneyonline #reelsideas', '#sidehustleideas #instagrammarketing #onlinebusiness',
    '#smallbusinesstips #sidehustle #christmasbusiness', '#30daychallenge #makemoneyonline #smallbusinessowner',
  ],
};

const caption = (d, i) => [
  d.open,
  V.challenge[i],
  V.simple[i],
  'Here are 5 ways to sell with your posts 👇',
  [
    `1. Call out who you're selling to\nName them in your first line, like ${V.callout[i]}, so the right people stop scrolling.`,
    `2. Educate\nTeach one thing your buyer wants to know. ${V.educate[i]}`,
    `3. Demonstrate\nShow it working: ${V.demo[i]}.`,
    `4. Overcome objections\nAnswer the "but…" out loud: ${V.objection[i]}${V.objection[i].endsWith('"') ? '' : '.'}`,
    `5. Make a transformational appeal\nShow them the after: ${V.after[i]}.`,
  ].join('\n\n'),
  V.product[i],
  V.affiliate[i],
  V.cta[i],
  V.tags[i],
].join('\n\n');

const head = `---
series: Christmas countdown (Reels, automation/reel-series/christmas-countdown)
status: draft v3 for her review (2026-11-03). Built by make-christmas-captions.mjs: her caption, same message and order on
  every post, examples / comment line / hashtags varied per day so they aren't 8 copies
keyword: ${KEYWORD}, LIVE 2026-11-03 in Chat Manager (email signup, asks READY, group "Freebie: EARN1K", sends the $1K
  Challenge page; same wording as CHALLENGE). She ruled out CHALLENGE as the comment word.
sources:
  - Her caption 2026-11-03 (Challenge first, 5 ways, product / no product, affiliate up to $40)
  - Affiliate: products/chat-manager/affiliate-program.md (open to Chat Manager buyers only; $30 sales 1-2, $40 from sale 3)
  - Challenge: 25 Reel ideas every week, $1K Plan, 30 days (CHALLENGE DM she approved 2026-10-28); shirt is earned with
    proof of $1,000 in sales (launch decisions 2026-09-26)
---
`;
const body = days.map((d, i) => `## Day ${d.day} · ${d.date} · card ${d.card}\n\n${caption(d, i)}\n`).join('\n');
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'christmas-countdown-2026.md');
writeFileSync(out, head + '\n' + body);
for (const [i, d] of days.entries()) console.log(`day ${d.day}: ${caption(d, i).length} chars`);
