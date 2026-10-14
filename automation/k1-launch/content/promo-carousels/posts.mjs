// Scrolly's own Instagram carousels selling the $1K Club (Mercedes posts these; not customer templates).
// Copy rules (website/scrolly-site/CLAUDE.md): no em dashes, never promise $1,000, "earned" not "win",
// no testimonials or invented stats, describe only what ships. Facts come from the live $1K page
// (pages/offers.mjs TIER_PAGES['1k']) and the Playbook manuscript; illustrative examples are labeled.
// Slide fields: see layouts in build.mjs. {mark} wraps a word in the highlight box, {br} is a line break.

const CTA_FINE = 'Results not guaranteed.';

export default [
  {
    slug: '01-start-here',
    caption: `Don't know where to start making money online? Start with a number.

The $1K Club is a 64-page playbook that works backward from $1,000 and turns Instagram into sales you can actually track. Worksheets, templates and the $1K Math calculator included.

$40, one time. Yours to keep. Link in bio.

Built for businesses that already sell something. Brand new Instagram accounts welcome. Results not guaranteed.`,
    slides: [
      { l: 'cover', bg: 'teal', title: 'Don’t know where to start making money {mark}online?{/mark}', hand: 'We’ve got you.', art: 'tiger' },
      { l: 'photo', photo: 'laptopDesk', pos: 'center 40%', title: 'You already have something to sell.', body: 'A product, a service or a download. Plus an Instagram account. Brand new is fine.' },
      { l: 'statement', bg: 'cream', title: 'Posting more isn’t a plan.', body: 'A post with 40,000 views and no sales moved you $0 closer.{br}A post with 900 views that brought one $350 booking moved you $350 closer.', note: 'Illustrative example' },
      { l: 'list', bg: 'teal', title: 'The $1K Club gives you the plan', items: [['Do your $1K math', 'How many sales $1,000 takes at your price.'], ['Use Instagram to run it', 'Reels, carousels and Stories, each with a job.'], ['Measure, fix, repeat', 'Find what’s stuck and fix that first.']] },
      { l: 'pages', bg: 'black', title: '64 pages.{br}{mark}Yours to keep.{/mark}', body: 'The playbook, printable worksheets, templates and the $1K Math calculator.', pages: ['p01', 'p07', 'p50'] },
      { l: 'cta', title: 'Make your first $1K with Instagram.', price: '$1K Club · $40 one time', fine: CTA_FINE + ' For businesses that already sell something.' },
    ],
  },
  {
    slug: '02-1k-math',
    caption: `How many sales is $1,000? Do the math before you post another thing.

$1,000 ÷ your average sale = sales needed. Round up. Then notice: fewer sales isn't easier, and more sales isn't harder. They just need different plans.

The $1K Math calculator and the full plan are in the $1K Club. $40, link in bio.

Examples are illustrative. Results not guaranteed.`,
    slides: [
      { l: 'cover', bg: 'teal', title: 'How many sales is {mark}$1,000?{/mark}', hand: 'Let’s do the math.', art: 'tiger' },
      { l: 'statement', bg: 'cream', big: true, title: '$1,000 ÷ your average sale = sales needed', body: 'Always round up. You can’t make half a sale.' },
      { l: 'table', bg: 'teal', title: 'Your number', head: ['Average sale', 'Sales needed'], rows: [['$25', '40'], ['$50', '20'], ['$100', '10'], ['$250', '4'], ['$500', '2']] },
      { l: 'panel', photo: 'toolBelt', pos: 'center 30%', bg: 'cream', kicker: 'A $250 repair job', title: '4 sales. Not automatically easier.', body: 'Each customer is trusting you inside their home with $250.' },
      { l: 'panel', photo: 'teeStack', pos: 'center 50%', bg: 'teal', kicker: 'A $28 tee', title: '36 sales. Not automatically harder.', body: 'Each order is a small, easy decision. Different plans, that’s all.' },
      { l: 'statement', bg: 'black', title: 'Use your {mark}real{/mark} average, not your list price.', body: 'If most people buy two $28 tees, your average order is $56.{br}That’s 18 orders, not 36.' },
      { l: 'cta', title: 'Get your $1K number.', body: 'The $1K Math calculator and the full plan are in the $1K Club.', price: '$1K Club · $40 one time', fine: 'Illustrative examples. ' + CTA_FINE },
    ],
  },
  {
    slug: '03-whats-inside',
    caption: `Everything you get in the $1K Club, no surprises.

The 64-page playbook (plan it, run it on Instagram, measure and fix), four downloads (Reel safe-zone package, 3:4 carousel template, Instagram setup checklist, printable worksheets) and the $1K Math calculator.

$40 one time. Yours to keep. Link in bio. Results not guaranteed.`,
    slides: [
      { l: 'pages', bg: 'teal', cover: true, title: 'What $40 gets you', hand: 'Swipe for the full list', pages: ['p01'] },
      { l: 'pages', bg: 'cream', title: 'The playbook: 64 pages', items: [['Part I', 'Build your $1K plan'], ['Part II', 'Use Instagram to run it'], ['Part III', 'Measure, fix, repeat']], pages: ['p05', 'p20', 'p54'] },
      { l: 'list', bg: 'teal', title: '4 downloads', items: [['Reel safe-zone package', 'An overlay to edit with, plus a cover and crop guide.'], ['3:4 carousel template', 'Sized for the feed and your grid.'], ['Instagram setup checklist', 'Every setting, tap by tap.'], ['Printable worksheets', 'One for every step in the playbook.']] },
      { l: 'calc', bg: 'black', title: 'The $1K Math calculator', body: 'How many sales it takes to reach $1,000 at your price.' },
      { l: 'checks', bg: 'cream', title: 'It’s for you if you have', items: ['Something to sell, with a price', 'An Instagram account (brand new is fine)', 'A next step people can take online: buy, book, request a quote or inquire'] },
      { l: 'cta', title: 'Your plan, yours to keep.', price: '$1K Club · $40 one time', fine: 'Digital product. ' + CTA_FINE },
    ],
  },
  {
    slug: '04-earn-your-stripe',
    caption: `Some things can't be bought. They're earned.

The $1K Challenge: 30 consecutive days, one goal, $1,000 in total revenue for your business. Hit it, show your sales records, and once they're verified your stripe shirt ships (free in the lower 48).

$1K Club + Challenge, $75. Pick your shirt size at checkout. Link in bio.

Not guaranteed. That's why it means something.`,
    slides: [
      { l: 'shirt', bg: 'black', title: 'Some things can’t be bought.', hand: 'They’re earned.', shirt: 'back' },
      { l: 'statement', bg: 'teal', kicker: 'The $1K Challenge', big: true, title: '30 consecutive days.{br}One goal: {mark}$1,000.{/mark}', body: 'In total revenue for your business.' },
      { l: 'photo', photo: 'barista', pos: 'center 30%', title: 'Hit it. Show your sales records.', body: 'Once they’re verified, your stripe shirt ships. Free in the lower 48.' },
      { l: 'shirt', bg: 'cream', shirt: 'both', title: 'Earned my first stripe.', body: 'Comfort Colors heavyweight tee, adult S to 4XL. Pick your size at checkout.' },
      { l: 'split', bg: 'cream', title: 'What counts', left: ['Counts', ['Money your business collects for what you sell, wherever it’s processed']], right: ['Doesn’t count', ['Sales tax', 'Shipping you charge', 'Refunds']] },
      { l: 'cta', title: 'Take on your 30 days.', price: '$1K Club + Challenge · $75', fine: 'Not guaranteed. That’s why it means something.' },
    ],
  },
  {
    slug: '05-every-post-has-a-job',
    caption: `Every post needs a job: Reach, Trust or Sell.

Reels get you discovered. Carousels (like this one) build trust. Stories turn interest into action. And not every post needs "buy now": your bio, link, pinned posts and Highlights carry the offer.

The $1K Club playbook shows the weekly mix for wherever you're stuck. $40, link in bio. Results not guaranteed.`,
    slides: [
      { l: 'cover', bg: 'cream', title: 'Every post needs a {mark}job.{/mark}', hand: 'Reach. Trust. Sell.', art: 'tiger' },
      { l: 'photo', photo: 'talkCam', pos: 'center 30%', kicker: 'Reels', title: 'Reach', body: 'Get discovered by the right people.' },
      { l: 'photo', photo: 'teamLaptops', pos: 'center 40%', kicker: 'Carousels', title: 'Trust', body: 'Teach, answer an objection, show proof.', hand: 'like this one' },
      { l: 'photo', photo: 'coffeeRun', pos: 'center 35%', kicker: 'Stories', title: 'Sell', body: 'Give interested people a reason to act, and an obvious way to do it.' },
      { l: 'statement', bg: 'teal', title: 'Not every post needs “buy now.”', body: 'Your account as a whole makes the offer: your bio, your link, pinned posts, Highlights and your Sell posts.' },
      { l: 'cta', title: 'Plan your week by job.', body: 'The playbook shows the weekly mix for wherever you’re stuck.', price: '$1K Club · $40 one time', fine: CTA_FINE },
    ],
  },
  {
    slug: '06-10-second-test',
    caption: `Try the 10-second test today.

Show your Instagram profile to someone who doesn't know your business. In 10 seconds, can they tell what you sell, who it's for, about what it costs, and what to do if they want it?

Reach can't fix an offer people don't understand. Chapter 3 of the $1K Club playbook walks you through the fix. $40, link in bio.

Examples are illustrative. Results not guaranteed.`,
    slides: [
      { l: 'cover', bg: 'teal', title: 'The {mark}10-second{/mark} test', body: 'Show your Instagram profile to someone who doesn’t know your business.', hand: 'Try it today' },
      { l: 'list', bg: 'cream', title: 'Can they answer all 4?', items: [['What do you sell?'], ['Who is it for?'], ['About how much does it cost?'], ['What do I do if I want it?']] },
      { l: 'before', photo: 'glovesPost', pos: 'center 40%', before: 'Handy guy, call me!', after: 'Home repairs in Austin: decks, fences, drywall. Free quotes, same-day reply.' },
      { l: 'before', photo: 'partyTable', pos: 'center 50%', before: 'Pretty printables', after: 'Editable party invitations you finish in Canva in 10 minutes. $25 kits, instant download.' },
      { l: 'statement', bg: 'black', big: true, title: 'Reach can’t fix an offer people don’t {mark}understand.{/mark}', body: 'Make it clear first. Then go get seen.' },
      { l: 'cta', title: 'Fix the offer, then get seen.', body: 'Chapter 3 of the playbook walks you through it.', price: '$1K Club · $40 one time', fine: 'Illustrative examples. ' + CTA_FINE },
    ],
  },
  {
    slug: '07-views-vs-sales',
    caption: `30,000 views and $0, or 1,100 views and $250?

Instagram's scoreboard tells you whether a post will travel. Yours tells you whether it's worth traveling: profile visits, link taps, DMs about price, inquiries, orders, revenue.

We're not trying to become influencers. We're using Instagram to get customers. The $1K Club, $40, link in bio.

Illustrative example. Results not guaranteed.`,
    slides: [
      { l: 'versus', bg: 'black', a: ['30,000 views.', '$0.'], b: ['1,100 views.', '$250.'] },
      { l: 'table', bg: 'cream', title: 'Two Reels', head: ['', 'Reel A', 'Reel B'], rows: [['Views', '30,000', '1,100'], ['Buying actions', '0', '4 quote requests'], ['Sales', '0', '1 job × $250'], ['Revenue', '$0', '$250']], strongLast: true, note: 'Illustrative example' },
      { l: 'photo', photo: 'fenceLean', pos: 'center 50%', title: 'Which Reel won?', body: 'Reel A won on Instagram.{br}Reel B won for the business.' },
      { l: 'statement', bg: 'teal', big: true, title: 'We’re not trying to become {mark}influencers.{/mark}', body: 'We’re using Instagram to get customers.' },
      { l: 'list', bg: 'cream', title: 'Your scoreboard', items: [['Profile visits'], ['Link taps'], ['DMs asking about price or dates'], ['Inquiries and bookings'], ['Orders'], ['Revenue']], strongLast: true },
      { l: 'cta', title: 'Keep score in dollars.', price: '$1K Club · $40 one time', fine: CTA_FINE },
    ],
  },
  {
    slug: '08-club-or-challenge',
    caption: `Club or Club + Challenge? Here's the difference.

$1K Club ($40): the playbook, templates, worksheets and the $1K Math calculator. Your plan, yours to keep.

Club + Challenge ($75): everything in the Club, plus your personal $1K Plan, weekly direction and check-ins, 25 Reel ideas every week, 30 carousel and 30 Story templates, and 30 consecutive days to earn your stripe shirt.

Link in bio. Results not guaranteed.`,
    slides: [
      { l: 'cover', bg: 'teal', title: 'Club or Club + {mark}Challenge?{/mark}', hand: 'Here’s the difference.' },
      { l: 'offer', bg: 'cream', name: '$1K Club', price: '$40', one: 'Your plan, yours to keep. One time.', items: ['The $1K Club playbook (PDF)', 'Reel and carousel templates', 'Setup checklist and worksheets', '$1K Math calculator'] },
      { l: 'offer', bg: 'black', name: 'Club + Challenge', price: '$75', one: 'Everything in the Club, plus:', items: ['Your personal $1K Plan', 'What to do each week, and a weekly check-in', '25 Reel ideas every week', '30 carousel and 30 Story templates', '30 consecutive days, one goal: $1,000', 'Your stripe shirt when you hit it'] },
      { l: 'split', bg: 'teal', title: 'Pick', left: ['The Club if', ['You want the full plan', 'You like to work at your own pace']], right: ['The Challenge if', ['You want a deadline', 'You want weekly direction', 'You want a shirt to earn']] },
      { l: 'shirt', bg: 'black', shirt: 'front', title: 'One checkout.', body: 'Choose Club or Club + Challenge. Challenge shirt size is picked at checkout.' },
      { l: 'cta', title: 'Pick your package.', price: '$40 Club · $75 Club + Challenge', fine: CTA_FINE },
    ],
  },
  {
    slug: '09-is-it-guaranteed',
    caption: `Is $1,000 guaranteed? No. And that's the point.

The $1K Club is a realistic plan, not a promise. Results depend on your offer, your customers and the work you put in. What you do get: a plan worked backward from $1,000, and a way to see which part of your path is holding sales back.

It's not an ads course, an SEO course, or a plan to become a full-time content creator. $40, link in bio.`,
    slides: [
      { l: 'statement', bg: 'black', kicker: 'Is $1,000 guaranteed?', huge: 'No.', hand: 'And that’s the point.' },
      { l: 'statement', bg: 'teal', big: true, title: 'It’s a realistic plan, not a {mark}promise.{/mark}', body: 'The win means something because it isn’t handed to you.' },
      { l: 'list', bg: 'cream', title: 'Results depend on', items: [['Your offer'], ['Your customers'], ['The work you put in']] },
      { l: 'photo', photo: 'wbDiagram', pos: 'center 40%', kicker: 'What you do get', title: 'A plan worked backward from $1,000.', body: 'And a way to see which part of your path is holding sales back.' },
      { l: 'checks', bg: 'teal', no: true, title: 'This is not', items: ['An ads course', 'An SEO course', 'A plan to become a full-time content creator'] },
      { l: 'cta', title: 'Want a real shot at it?', price: '$1K Club · $40 one time', fine: CTA_FINE },
    ],
  },
  {
    slug: '10-phone-test',
    caption: `Before you post more, do the phone test.

Open your Instagram profile like a customer. Tap your link. Try to buy, book or request a quote. Time it, and note every moment you had to think, scroll or guess. Then fix the first one.

Every extra tap loses people. Chapter 5 of the $1K Club playbook covers the full buying path. $40, link in bio. Results not guaranteed.`,
    slides: [
      { l: 'photo', photo: 'marketTote', pos: 'center 30%', cover: true, title: 'Do the phone test before you post more.' },
      { l: 'list', bg: 'teal', title: 'The phone test', items: [['Open your profile like a customer'], ['Tap your link'], ['Try to buy, book or request a quote'], ['Time it. Note every moment you had to think, scroll or guess.']] },
      { l: 'statement', bg: 'cream', big: true, title: 'Every extra tap loses {mark}people.{/mark}', body: 'Send them to the exact listing, booking page or checkout. Not your homepage.' },
      { l: 'checks', bg: 'black', title: 'A good path has', items: ['A price, or a clear “from $___”', 'A page that works on a phone without zooming', 'A line saying what happens next', 'At least one piece of proof'] },
      { l: 'photo', photo: 'frontDoor', pos: 'center 50%', title: 'One next step, straight there.', body: 'Then fix the first friction point you hit.' },
      { l: 'cta', title: 'Build the buying path.', body: 'Chapter 5 of the playbook walks you through it.', price: '$1K Club · $40 one time', fine: CTA_FINE },
    ],
  },
];
