# $1K launch marketing push (October 2026)

Written 2026-10-09, the day the store went live. Four jobs: Pinned 2, the "what you get" video, automated review collection, and the Week 2 Reels set (due Oct 19).

Nothing here is published. Items marked **Decide** need Mercedes.

---

## 1. Pinned 2: "Want to make $1,000 in 30 days?"

**Files:** `automation/carousels/posts/2026-10-07-pinned-challenge/` (source), `OneDrive/Scrolly Media/exports/carousels/2026-10-07-pinned-challenge/` (slides + `preview.html`). Notion row: Content Pipeline, "PINNED 2", Status **Edit**.

**Done 2026-10-09:** checked against the live /1k-club/ page. The Challenge now also includes the Notion content tracker and the auto-posting guide, so both were added to slide 6 and the caption. `config/destinations.json` was refreshed to match the page. Rebuilt; Notion caption updated.

**Still open (why it's at Edit, not Approved):**
- **Slide 1 is a stand-in.** The cover is one third of a shared panorama built on a stock photo (`stock:talkCam`). Once a carousel is posted, Instagram won't let you swap a slide's image. Posting Pinned 2 now locks the stock photo in, and Pinned 1 and Pinned 3 must use the same photo to line up.
- **Slides 3 and 5 are mock phone screens.** The plan was to replace them with screen recordings (Your $1K Plan; this week's Reel ideas).

**Decide:** (a) post now with the stand-ins and commit the panorama to the stock photo, or (b) record the screens first (same session as the video below) and post all three pinned posts the same day. Recommended: **(b)**. One filming session covers Pinned 1's walking clip, Pinned 2's two screens, Pinned 3's calculator recording, and the video.

**How it gets posted:** from her phone (the export folder syncs through OneDrive), then pin it in the Instagram app. A Buffer draft is possible, but only if the slides are hosted at a public URL (Buffer can't take uploads); ask before uploading anything.

---

## 2. "What you get" video

**Where it goes:** the /1k-club/ video section (hidden while `VIDEO` is empty in `website/scrolly-site/pages/offers.mjs`) and a Reel. Page cut is about 60 seconds; the Reel cut is about 30 seconds.

**Format:** screen recordings on her phone plus a few short talking clips. On-screen text carries the list. Export without music; she adds audio in Edits.

### Script (beats map to real deliverables only)

| # | Shows | Says / on-screen text |
|---|---|---|
| 0 | Her face, or the My Account tab bar | "Here's everything you get in the $1K Challenge." |
| 1 | My Account, **Your $1K Plan** | Your $1K number and what to do each week |
| 2 | **This Week** + **Weekly Check-in** | A plan that adjusts every week |
| 3 | Challenge Content: **25 Reel ideas** (slow scroll) | 25 new Reel ideas every week, ready to film |
| 4 | Carousel + Story template gallery | 30 carousel and 30 Story templates |
| 5 | Notion content tracker | Plan and track every post |
| 6 | Auto-posting guide PDF | Auto-post with your AI |
| 7 | Playbook PDF + Quality Tips (flip pages) | The full $1K Club Playbook |
| 8 | /calculators/income-goal/ | The $1K Math calculator |
| 9 | Her face, or the Club page | "$75, one time. 30 consecutive days, one goal: $1,000. Link in bio." |

Rules: no shirt visuals (text mention only, if at all); no results claims; "earn", never "win". Mercedes confirmed 2026-10-09 the shirt design is being redone, so no shirt imagery anywhere new until the new design exists.

### Shot list for Mercedes (one session, about 30 minutes)

- Use the test customer account from order #1385. **Before recording**, check that no email address or real name shows on screen.
- Phone screen recordings, vertical, 8 to 12 seconds each, slow steady scrolls: beats 1 to 8 above.
- 2 or 3 talking clips (beat 0 and beat 9), 2 takes each, plain background, face high in frame so text sits below it.
- In the same session: the **walking clip** (Pinned 1) and the **calculator recording** (Pinned 3).
- Drop the files in `OneDrive/Scrolly Media/videos/`.

### Edit (Claude)

Whisper transcript, then best take per line, then cuts, captions in brand style, then a preview MP4 sent to her before any final export. HDR footage gets tone-mapped to SDR (same chain as the Oct 8 b-roll). Deliver: 60-second page version, 30-second Reel version, and a no-music export of each.

---

## 3. Automated review and testimonial collection

**Decided 2026-10-09 (Mercedes):** collect reviews ASAP. Buyers can review any time once they've gone through the content, and get asked again after the Challenge.

**Built 2026-10-09, NOT live:** `automation/k1-launch/php/k1-reviews.php` (separate WPCode snippet; reads the frozen snippet's data, never changes it). Test: `php automation/k1-launch/test/reviews-run.php <form|save|save-bad|cron> [days] [none|active|done|verified]`. Previews: `automation/k1-launch/preview/review-*.png`. Waiting on her OK, then she pastes it as a new WPCode snippet.
- Form at My Account > `leave-a-review` (no new menu item), linked from a "Leave a review" card at the bottom of My $1K Plan and Downloads.
- Emails, once each, daily check: 7 days after purchase (if no review yet) · after the 30 days end without a verified $1K · when she verifies a $1K. One-click opt-out in each.
- Reviews land in wp-admin > **Reviews** as Pending, plus an email to hello@. Publish = approved for use within what they ticked; nothing shows on the site.
- Defaults chosen (change if she wants): no public WooCommerce product reviews; ticking the social box counts as consent (no second ask); emails signed "Scrolly".

### Original design notes

### Constraints

- **No real buyers yet.** The earliest real Day 31 is about 30 days after the first sale, so this needs to be live by roughly early November, not this week.
- **Challenge software is frozen for V1.** Build this as a **separate WPCode snippet** that only *reads* the lifecycle data. Any change to `my-account-1k-tabs.php` needs her OK and a desktop + phone preview first.
- **Run it in WordPress** (WP-Cron + `wp_mail`). The local n8n stack depends on Docker and a tunnel URL that dies on restart.
- **Never store uploads on the site** (same rule as proof uploads), so v1 is text only: no photos.

### Flow

1. **Triggers** (daily WP-Cron check, one email per trigger per attempt, logged in user meta):
   - **A. Verified $1K.** This is the moment of highest value. The email is sent when Mercedes clicks Verify on the user's "$1K Challenge" panel.
   - **B. Attempt ended (Day 31).** Sent to everyone else: "How did it go?" Honest feedback is the goal here, not marketing.
   - Optional **C. Club-only buyers** 14 days after purchase.
2. **Form:** a "Share your experience" card in My Account. The email links straight to it, so no login juggling is needed. Fields:
   - star rating (1 to 5)
   - "What changed for you?"
   - optional: what they sold and their 30-day total
   - display name: first name / first name + business / anonymous
   - **separate consent checkboxes:** quote on the website; quote on Instagram; OK to trim for length
3. **Storage:** private custom post type `scrolly_testimonial`, status Pending. Mercedes gets an email for each one and approves or archives it in wp-admin. Approved quotes are exported to a "Testimonials" view in Scrolly HQ so they can feed carousels and Stories.

### Compliance notes

- **FTC rule on consumer reviews and testimonials (16 CFR Part 465, in effect since Oct 2024):** never make an incentive conditional on a positive review. If WooCommerce product reviews are shown as "reviews", negative ones can't be selectively hidden. A curated testimonial section is fine as long as it isn't presented as all reviews.
- **Results quotes** ("I made $1,240") need typical-results context near them. Her standing rule: ask before adding any disclaimer line on Club pages.
- **v1 has no incentive.** Revisit later if needed: a discount on the Challenge re-buy offered to everyone who answers, whatever they say.

### Decide

- Triggers A + B, or also C?
- Should **WooCommerce product reviews** on product 279 (verified-owner badge, public) be turned on as well, or only curated testimonials?
- Instagram use allowed by default when the box is ticked, or ask the customer again before each IG post?

**Build after the OK:** snippet + PHP stub tests (`automation/k1-launch/test/`), desktop + phone preview of the form card, then she pastes it.

---

## 4. Week 2 Reels set (due Oct 19)

**Week 2 = Monday Oct 19 to Sunday Oct 25.** Page 633 gets replaced with the new 25 (back it up first, as with the Week 1 re-date).

**No-buyer rule (Mercedes 2026-10-09):** check Challenge orders on Sun Oct 18. If nobody has bought yet, nobody has seen Week 1, so re-date page 633 to "Week 1: October 19 to October 25" (same 25) and push Week 2 back a week (due Oct 26; same schedule shifted 7 days). The research below can still run early. Apify credit also resets Oct 24, which helps a later Week 2.

**Rules carried over:** calibration v2 (current, easy, broad applicability 4-5, explainable in 1 to 2 sentences, low performance burden); rolling 4-week no-repeat, so none of Week 1's 25 return; Instagram first, and TikTok-only finds are labeled as such; organic posts only, so no ad caveats; correct audio notes (song vs. original sound vs. none). She rejected padding to 25 and she rejected shrinking the number, so start early.

**Budget constraint:** the Apify free credit is almost used up ($4.62 of $5) and resets **Oct 24**, so Week 2 uses free sources only:
- Later's Instagram Reels trend tracker
- SocialPilot's weekly trends report
- **Instagram's own Trending Audio list**, which only Mercedes can see (Professional Dashboard, top 50, US)
- TikTok oEmbed/embed checks in the built-in browser for visual confirmation

**Schedule**

| Date | Who | Step |
|---|---|---|
| Tue Oct 13 to Wed Oct 14 | Claude | Research; shortlist about 40 candidates scored on the 5 dimensions |
| Wed Oct 14 | Mercedes | Screenshot IG Trending Audio (top 50) and send it over (2 minutes) |
| Thu Oct 15 | Claude | Pick 25, write cards (`content/week-02-reels.mjs`, copied from Week 1's shape), verify each Inspiration Reel + audio ID, render preview |
| Fri Oct 16 | Mercedes | Review the preview; flag cuts |
| Sat Oct 17 | Claude | Swap replacements, rebuild |
| Sun Oct 18 evening | Claude, with her OK | Back up page 633, publish Week 2 |

The weekend gives a buffer if more than a few candidates fail review.
