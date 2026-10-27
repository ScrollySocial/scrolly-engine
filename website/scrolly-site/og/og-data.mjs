// Link previews (Open Graph) for theambitiondepartment.com, one entry per WP page ID.
// title/desc show when a link is shared (Pinterest, iMessage, Facebook, LinkedIn). Copy comes from each page's own hero text.
// art = image in ../assets used on the 1200x630 share card; fit 'contain' for cut-out tigers/covers, 'cover' for full photos.
// Pages not listed fall back to their WP title + the default description + the default card (see snippet.php.tpl).
export const DEFAULT = {
  key: 'default', title: 'Stand out online.',
  desc: 'The Ambition Department helps small businesses and creators find more customers without depending on paid ads.',
  art: 'hp3-hero-tiger.webp', fit: 'contain',
};
const calc = (id, slug, title, desc) => ({ id, key: 'calc-' + slug, title, desc, art: 'calc-tiger-climb.webp', fit: 'cover', pos: '78% center', label: 'Free calculator' });
export const PAGES = [
  { id: 161, key: 'home', title: 'Stand out online.', desc: 'Find your path to more customers without depending on paid ads. Clubs, Challenges, free calculators and practical guides.', art: 'hp3-hero-tiger.webp', fit: 'contain' },
  { id: 291, key: '1k-club', title: 'The $1K Club', desc: 'A complete toolkit to plan, create and go after your first $1,000 with organic content.', art: 'k1-hero-products.webp', fit: 'cover' },
  { id: 303, key: '1k-challenge', title: 'The $1K Challenge', desc: '30 consecutive days to go after your first $1,000 with organic content. Reach your verified goal and earn the Club T-shirt.', art: 'k1-hero-products.webp', fit: 'cover' },
  { id: 1132, key: 'calculators', title: 'Free business calculators', desc: 'Work out what it takes to reach your income goal. Turn a revenue goal into sales, website visitors and views.', art: 'calc-tiger-climb.webp', fit: 'cover', pos: '78% center', label: 'Free calculators' },
  calc(1151, 'income-goal', 'Income Goal Calculator', 'Set your income goal and offer price. See how many sales, website visitors and views it takes to get there.'),
  calc(1152, 'price-to-customers', 'Price to Customers Calculator', 'Compare three price points side by side. See how many customers each one needs to reach your goal.'),
  calc(1153, 'sales-goal', 'Sales Goal Calculator', 'Break a monthly revenue target into the sales you need each month, week and day.'),
  calc(1154, 'traffic-to-sales', 'Traffic to Sales Calculator', 'Turn your website traffic and conversion rate into estimated sales and revenue.'),
  calc(1155, 'conversion-rate', 'Conversion Rate Calculator', 'Find out what share of your website visitors actually buy.'),
  calc(1156, 'content-output', 'Content Output Calculator', 'See how a small daily content habit adds up when you share each piece on more than one platform.'),
  calc(1157, 'profit', 'Profit Calculator', 'Work out your gross profit, net profit and profit margin from revenue and costs.'),
  calc(1158, 'break-even', 'Break-Even Calculator', 'Find out how many sales it takes for a course, tool or ad budget to pay for itself.'),
  calc(1159, 'average-order-value', 'Average Order Value Calculator', 'See how much the average customer spends per order, and what a small increase is worth.'),
  { id: 1767, key: 'chat-manager', title: 'Turn comments into email signups', desc: 'Your own comment-to-DM software for Instagram and YouTube. About $6 a month to run, whatever your list size.', art: 'chat-manager-product.webp', fit: 'contain' },
  { id: 1570, key: 'halloween-reels', title: 'Cute Halloween Reels that sell', desc: 'Five ready-made Reels for October. Add your clips and post. Change it all in CapCut.', art: 'og-halloween-reel-pack.webp', fit: 'contain' },
  { id: 1623, key: 'product-reels', title: "Your month's content: done", desc: '25 ready-made Reels for your product. Add your clips and post. Change it all in CapCut.', art: 'og-product-reel-pack.webp', fit: 'contain' },
  { id: 312, key: 'digital-products', title: 'Good tools. Useful next steps.', desc: 'Practical workbooks to help you research, plan and improve how customers discover your business.', art: 'hp3-hero-tiger.webp', fit: 'contain' },
  { id: 313, key: 'shop', title: 'For the builders. For the doers.', desc: 'Club tees, printed to order. Free shipping in the US.', art: 'hp3-hero-tiger.webp', fit: 'contain' },
  { id: 316, key: 'seo-tools', title: 'Be easier to discover', desc: 'A site audit, implementation help and practical platform workbooks for when SEO is your next step.', art: 'hp3-hero-tiger.webp', fit: 'contain' },
  { id: 16, key: 'seo-site-audit', title: 'SEO Site Audit', desc: 'A prioritized expert audit of your website, competitors, technical performance, content and search opportunities.', art: 'cover-seo-site-audit-tad.webp', fit: 'contain' },
  { id: 50, key: 'shopify-seo-workbook', title: 'Shopify SEO Workbook', desc: 'A guided, 29-section workbook: build a keyword universe, a site architecture, optimized pages and a 90-day plan for your store.', art: 'cover-shopify-seo-workbook.webp', fit: 'contain' },
  { id: 71, key: 'pinterest-seo-workbook', title: 'Pinterest SEO Workbook', desc: 'Find what your customers search for, turn it into boards and Pins, and leave with a 90-day Pinterest plan.', art: 'cover-pinterest-seo-workbook.webp', fit: 'contain' },
  { id: 263, key: 'implementation', title: 'Know what to fix. Then fix it.', desc: 'Implementation help is in development: turning approved SEO recommendations into real website changes. Join the early-access list.', art: 'hp3-hero-tiger.webp', fit: 'contain' },
];
