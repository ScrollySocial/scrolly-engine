# scrollyseo.com page design rules (READ BEFORE DESIGNING ANY PAGE)

These are Mercedes's standing rules. They override anything improvised. Sources: `Scrolly Organic Engine/products/1k-club/sales-page-v2-brief.md`, the approved homepage (`pages/home.mjs`), and her feedback. If a new page idea breaks one of these, don't do it.

## Match the homepage, reuse its components
- Build pages from the homepage's own components in `shared.css` (`.goal` stripe tracker, `.tile` solid tiles, `.earned` shirt band, `.calcard` rounded white card, `.btn.btn-pill`). Don't invent new visual languages.
- **No outlined boxes.** No 2-3px black borders on cards, no offset-shadow squares. Solid color fields, or a rounded (16px) white card. Borders are rare.
- **No decorative dash or line marks** before eyebrows or labels (the "— A FEW USEFUL ANSWERS" look). Eyebrows are plain black text.
- Buttons are **pills** (`.btn-pill`), black fill with white text, or orange fill with **black** text. Never white text on orange.
- Not every section needs a container. Let content sit on cream/teal with strong type and space.

## Page template
- **Approved base template (2026-09-23): `tierPage()` in `pages/offers.mjs`** (hero, one-line stripe tracker, Club/Challenge tiles, black shirt band with doodle + caption under shirts, FAQ, closing CTA). Mercedes: "a genuinely good base." New offer pages reuse it; only tier color + copy change. One page per tier; separate Challenge pages forward to `/<tier>-club/#join`.
- Light lavender text on black is an approved accent.

## Color
- Palette: black `#000` (the dark; navy is dead), cream `#fbf8f3`, orange `#ff6338`, teal `#94ece1` ($1K), lavender `#c1aefc` ($10K), peach `#ffb38f` ($24K). **No red** (`#c8380f` is banned).
- **Each tier page is dominated by its tier color.** The $1K page is teal-dominant; lavender and peach stay off it (and vice versa).
- Text on teal or cream: **black only**. **Never white text on teal** (unreadable), including buttons in hover/focus states; force it with `!important` since theme.css recolors links. Orange is **never text** on cream or teal (fails contrast); orange text only on black, and sparingly.
- Orange is for fills (buttons, the whole `.earned` band, stripe tracker fill) and small marks.
- **Orange and teal never touch** inside one component.
- Orange-italic headline words are rare, not the default.
- Default when unsure: tier color + black + cream/white.

## Copy
- No em dashes anywhere customer-facing (buttons included). Use a comma or colon.
- Never promise $1,000. "Results not guaranteed" near $1K claims. No testimonials, member counts or invented stats.
- The shirt is **earned** by a verified goal. Never "win", "chance", "giveaway", "contest".
- Describe only what is actually delivered at launch.
- Fewest words possible. Cut any line that isn't needed to convey meaning.
- The Challenge is **30 consecutive days**; say "consecutive" where the window is described.

## Checkout friction
- Mercedes wants the fewest possible steps: buttons on the page add straight to cart ("Join the Club", "Join the Challenge"); anything extra (shirt size) is collected at checkout, not on the page.

## Process
- Preview locally (`website` launch config), check desktop + 375px, then publish. After publishing, verify the live page's inline scripts parse (WordPress can mangle `&&`).
