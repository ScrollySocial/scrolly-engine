# Scrolly Tools 0.4.1

## Update the installed plugin
1. WordPress → Plugins → Add New → Upload Plugin: upload scrolly-offer-finder-wordpress.zip without unzipping.
2. Choose “Replace current with uploaded.” Keep the plugin active. This preserves the existing response table and answers.
3. Your existing Offer Finder page continues using `[scrolly_offer_finder]`.
4. Create “Find Your Next Step.” Add a Shortcode block containing `[scrolly_next_move_quiz]`.
5. In Settings → Scrolly Tools, enter the published links for the two tools, the $1K Club and the $10K sales or interest page. Do not send visitors to an unfinished purchase page.
6. Add both pages under Free Resources in your menu.

## Before marketing
- Test both pages while signed out, on desktop and a phone.
- Finder: Start → select skills → Find my offers → select plan → request it at an email you control.
- Quiz: complete all six questions → check result → request kit → download the HTML worksheet. It can be completed locally and printed to PDF.
- Check your inbox and spam. WordPress accepted mail is not proof of inbox delivery. Use the site's existing working mail transport or configure it if the test fails.
- Tools → Scrolly Offers lists both tools' answers, recommendations and emails. Export CSV includes separate tool, revenue, channels, bottleneck, goal and hours columns, plus complete answers.
- Check every Club and Finder link. For the $10K recommendation, a working interest-list page is appropriate while its offering is being completed.
- Exclude `?scrolly_offer_view=1` and `?scrolly_quiz_view=1` from caching if the cache ignores WordPress no-cache headers.

## What is included
- Offer Finder opens directly to selectors, 19-offer catalog, up to three matches, summary, pricing evidence, Instagram prospecting and AI exposure.
- Seven-screen branching business quiz: active offer, last-30-days revenue, acquisition checklist, stage-specific obstacle and follow-up, available time and goal. One question per screen, Back navigation, retained selections.
- Three tailored resources: First Offer Test Kit, First Customer Sprint, Organic Growth Experiment. Email contains the personalized action plan and worksheet prompts; browser download includes an editable seven-day worksheet. This is HTML, not a PDF attachment.
- Results show the free kit prominently, then the relevant Club CTA. Results are visible without email; the downloadable quiz kit unlocks after requesting its email.
- Routing: no active offer → first offer kit / $1K; selling below $1K → first customer kit / $1K; selling at $1K+ → growth kit / $10K next step. No automatic $24K recommendation while scope is undefined.
- Existing answers preserved. Both tools use the existing table. Responses remain saved until you choose to delete them; the old automatic deletion schedule is cleared on upgrade.
- No external AI API or API-based WordPress installation is required.

## Optional MailerLite
Requested kit emails work through WordPress independently of MailerLite. Emails are collected in your WordPress table even without marketing-list integration.

To enable optional marketing subscriptions, set the existing private server constants:

```php
define('SCROLLY_MAILERLITE_API_KEY', 'YOUR_PRIVATE_API_KEY');
define('SCROLLY_MAILERLITE_OFFER_GROUP_ID', 'EXISTING_GROUP_ID');
```

Do not expose credentials in HTML, chat, downloads or public code. Checkbox stays hidden without both constants. It is unchecked by default. Subscription requires explicit opt-in and confirmation using the emailed link; GET displays a button, POST confirms. Both tools use one configured group. Existing $10K/$24K signup forms elsewhere are not modified. Per-result marketing automation is not included.

## Data and security
Responses, email, selected recommendation, consent and mail/sync status are stored in WordPress. Update your privacy policy to describe ongoing retention and optional email use. Public signed, expiring form tokens, fresh bootstrap requests, strict input validation, same-origin checks, a honeypot and hashed-IP rate limits are used. A public form token is not authentication. Admin actions continue using WordPress capability and nonce checks. Lead tokens expire after 24 hours. Admin and CSV export require admin capability. CSV formula prefixes are escaped. No credentials are bundled. No personal-data exporter/eraser integration or purchase attribution is included.

## Validation and limits
PHP lint and actual PHP runtime checks pass for fresh/expired/tampered tokens, same-origin submission, server routing and input validation. Browser simulations test six stage paths, branch changes, Back navigation, required answers, token refresh/retry, finder save/email and quiz email/download. Chromium checks at 1440px desktop and 375px mobile verify one question per screen, complete paths, results, finder email requests, no browser exceptions, no sideways page scroll and no text under 15px. Live WordPress, actual mail delivery, optional MailerLite synchronization and theme/cache interaction still require installation checks. No claim of live deployment is made.

WordPress route documentation: https://developer.wordpress.org/reference/functions/register_rest_route/
MailerLite API: https://developers.mailerlite.com/api/subscribers

## 0.3.0
Quiz opens directly to its questions. Removed its intro screen and repeated inner wordmark. Existing shortcodes and stored answers are preserved.

## 0.3.0
Removed Offer Finder intro and duplicate wordmark. Both tools open directly to their questions. Removed 90-day wording and automatic response deletion, including clearing older scheduled cleanup jobs.

## 0.3.0 changes
- Both tools use Scrolly v3 colors, typography, cream page background, focus outlines and 52px orange/black buttons. Removed colored panels, decorative eyebrow text and repeated wordmarks.
- Quiz changes its question pool based on offer status and revenue. New follow-up answers influence the server-generated focus. Full answers, including branch and detail, remain in the response table and CSV.
- Public submission tokens no longer depend on the visitor's logged-in WordPress session. The browser fetches a fresh, uncached token before its first submission and retries once if it expires. This addresses the logged-in/public REST mismatch and cached-token failure behind the reload message.
- Wider desktop embed, up to 1440px with responsive side gutters; quiz content up to 1040px, prose up to 720px. A centered breakout wrapper expands beyond narrow WordPress content columns. If the theme clips the wrapper, use the Full Width page template.
- Existing shortcodes, responses and ongoing retention are preserved. No intro screens added.

After installing, clear the site cache once to replace old iframe markup. Test the quiz while signed in and signed out, and request a real email before marketing.

Iframe sizing now measures actual content height, allowing it to shrink after results or a longer question instead of retaining blank space.

Embed checks also pass inside a simulated 720px WordPress column: desktop expands, mobile remains within 375px, and iframe height grows for the checklist and shrinks on Back.

## 0.4.1
Business Locator results presentation only: diagnosis, wide peach recommendation with named Club CTA, then white free kit. $1K price display $40 / $75; no new $10K pricing or $24K assignment. Quiz branching, thresholds, URLs, delivery, download, and consent behavior are preserved.

Also includes the preceding authorized Offer Finder update: three question screens, preserved answers and Back controls, compact offer highlights, details dialog, named selected-offer email dialog, and a download after sending. Desktop compares three offers; mobile switches between them. Existing catalog/ranking and server plan delivery stay the same.

The plugin does not create the global Search bubble seen in the site header. Its source is outside this package; global header code is not changed.

Validation: browser tests at 1440px and 375px cover $1K/$10K result ordering, different panel treatments, named CTA URLs, pricing visibility, email requests and actual HTML downloads. No $24K result exists to test. Finder tests cover transitions, selected offer dialogs, mail requests, Escape and retained answers. PHP lint passes. Live WordPress/email transport remains a deployment check.


## Phase 1 (0.4.2)
Shared server-side MailerLite routing. Admin-only /scrolly/v1/mailerlite/config protects the API key encrypted with WordPress salts. Configure all five approved groups. Marketing requires an unchecked optional checkbox followed by emailed confirmation. Downloads do not depend on email delivery. Woo hooks add customer groups only for existing active Scrolly Subscribers. No nurture automations are installed. Rotate salts only with a plan to reconfigure the protected key.


## Phase 1.5 candidate (0.5.0) — do not deploy before rendered-example approval
The default locator release is legacy. After explicit approval, an administrator may POST {"release":"1.5"} to /scrolly/v1/locator/release. POST {"release":"legacy"} rolls the public quiz back while preserving 1.5 response interpretation and confirmed-kit access. No schema migration is required. Each revised response stores quiz_version 1.5 and resource_version 1.5.0; unversioned responses retain legacy rules. Locator signup records explicit disclosed intent, sends one WordPress confirmation, and unlocks protected resources only after human POST. MailerLite sync is independent and gets up to three retries. Confirmation expires in 24 hours, resend recovery in seven days; kit access expires in seven days and downloaded files can be kept. Neither marketing status nor prior groups are forced/reset. Protect salts and the original router configuration. Review fixtures are not shipped with the plugin.
