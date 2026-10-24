// Writes the owner's privacy policy, terms and home page into config/pages/ from profile.json
// (brand, handle) and profile.legal (the answers the setup skill asks for). Only the parts that
// apply are included: which platforms are connected, DMs, TikTok through Apify, which email tool,
// Claude drafts. Modelled on scrollyseo.com/privacy/, which passed Meta's and Google's setup, and on
// what Google's YouTube API policies (III.A.2, III.E.4) and Meta's Platform Terms (4.b) ask for.
// It's a starting point written in plain words, not legal advice; the guide says so.
//   node setup/pages.mjs            (then node setup/cm.mjs push-config to put them online)
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readProfile, readServer } from './lib.mjs';

const p = readProfile();
const L = p.legal || {};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const missing = ['businessName', 'contactEmail', 'location'].filter((k) => !L[k]);
if (missing.length) {
  console.log(`NEEDS YOU profile.legal is missing: ${missing.join(', ')}`);
  process.exit(1);
}
const name = esc(L.businessName);
const email = esc(L.contactEmail);
const handle = p.handle ? ` (@${esc(p.handle)})` : '';
const S = readServer().settings || {};
// What's switched on comes from the server settings the skill saved, so the policy matches the setup.
const on = { instagram: true, dms: S.DMS_ENABLED === 'true', youtube: !!S.YOUTUBE, tiktok: !!S.TIKTOK, ...(L.platforms || {}) };
// Email tool name as people know it, from the server settings the skill saved.
const TOOL = { mailerlite: 'MailerLite', kit: 'Kit', mailchimp: 'Mailchimp', beehiiv: 'beehiiv', flodesk: 'Flodesk' }[readServer().settings?.EMAIL_LIST] || '';
const date = L.effectiveDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const places = ['Instagram', on.youtube && 'YouTube', on.tiktok && 'TikTok'].filter(Boolean);
const list = (a) => (a.length < 3 ? a.join(' and ') : `${a.slice(0, -1).join(', ')} and ${a.at(-1)}`);

const privacy = `<h1>Privacy policy</h1>
<p>Effective date: ${esc(date)}</p>
<p>${name} is run from ${esc(L.location)}. This policy covers the comments and messages ${name} answers with an automation, and the free resources ("freebies") it sends.</p>

<h2>Comments and messages on social media</h2>
<p>${name} uses an automation to read and answer public comments on its own ${list(places)} posts${on.dms ? `, and direct messages and Story replies sent to its Instagram account${handle}` : ''}.</p>
<p><strong>What is collected:</strong> for comments, the comment text, your username or channel name, the comment and post IDs, a link to the comment and the date it was posted.${on.dms ? ' For Instagram direct messages and Story replies: the message text, your username, Instagram IDs, the time it was sent, and the replies.' : ''}</p>
<p><strong>Why:</strong> to sort comments${on.dms ? ' and messages' : ''} (for example questions, requests and spam), to draft replies that ${name}'s owner reads and approves before anything is sent, and to send a free resource on Instagram when you comment${on.dms ? ', message or reply to a Story' : ''} with the keyword a post asks for. That resource is sent automatically, once per request.${on.youtube ? ' On YouTube, a keyword comment gets one automatic public reply with the link.' : ''} Every other reply is approved by the owner first.</p>
<p><strong>Freebies by email:</strong> for some freebies, the Instagram message includes a personal link to a signup page on ${name}'s server. If you enter your email address there and tick the box, the page shows the freebie right away${on.dms ? ', and if you sent a message on Instagram in the last 24 hours, the link also comes to you there in one message' : ''}. ${TOOL ? `Your address is added to ${name}'s email list at ${TOOL}` : `Your address is kept on ${name}'s email list`} for the emails the box describes; you can unsubscribe at any time with the link in every email. The server records your email address next to your Instagram conversation and the steps you reached (link sent, page opened, signed up${on.dms ? ', reminder sent' : ''}).${on.dms ? ' If you don\'t sign up, one reminder message may be sent on Instagram within 24 hours.' : ''}</p>
<p><strong>Where it is stored:</strong> on ${name}'s own server at DigitalOcean, which runs the automation with n8n. It keeps technical run logs for up to 14 days and the IDs of comments and messages already handled, so nothing is answered twice.${on.tiktok ? ' TikTok comments are collected through Apify.' : ''}${L.claudeDrafts !== false ? ' Reply drafts are written with Claude by Anthropic.' : ''}</p>
<p><strong>How long it is kept:</strong> ${on.youtube ? 'YouTube comment information is deleted within 30 days of being collected. ' : ''}Instagram comments${on.dms ? ' and messages' : ''}${on.tiktok ? ' and TikTok comments' : ''} are kept only as long as they are needed for replying and following up, and you can ask for them to be deleted at any time. An email address you give for a freebie stays on the email list until you unsubscribe or ask for it to be deleted.</p>
<p><strong>Who can see it:</strong> ${name}'s owner, and the service providers above while they process it. This information is not sold, shared with advertisers, or used to build profiles.</p>
${on.youtube ? `
<h2>YouTube API Services</h2>
<p>${name} uses YouTube API Services to read comments on its YouTube channel and post approved replies. YouTube's handling of your information is covered by the <a href="https://www.youtube.com/t/terms">YouTube Terms of Service</a> and the <a href="https://policies.google.com/privacy">Google Privacy Policy</a>. Only ${name}'s own YouTube channel is connected. If you have given ${name} access to a Google account, you can remove that access at any time on the <a href="https://security.google.com/settings/security/permissions">Google security settings page</a>. Questions or complaints about how ${name} uses YouTube information can be sent to <a href="mailto:${email}">${email}</a>.</p>
` : ''}
<h2 id="delete-your-data">Deleting your data</h2>
<p>To delete your comments${on.dms ? ', messages' : ''} or an email address you gave for a freebie, email <a href="mailto:${email}">${email}</a> with the subject "Delete my social media data". Include your username or channel name and the platform${places.length > 1 ? ` (${list(places)})` : ''}. Your information is deleted from ${name}'s records within 7 days, and you will get an email when it is done. This removes ${name}'s copy only; to remove a comment itself, delete it on the platform.</p>

<h2>Contact</h2>
<p>Questions about this policy: <a href="mailto:${email}">${email}</a>.</p>
`;

const terms = `<h1>Terms</h1>
<p>Effective date: ${esc(date)}</p>
<p>These terms cover the free resources ${name} sends when you comment or message a keyword, and the signup pages on this site.</p>
<p><strong>Freebies:</strong> free resources are for your own personal or business use. Please don't resell or republish them. They're shared as-is, for general information.</p>
<p><strong>Messages:</strong> automatic messages are only sent after you comment${on.dms ? ', message or reply to a Story' : ''} with a keyword, once per request. Every other reply is written or approved by ${name}'s owner.</p>
<p><strong>Your email:</strong> signing up is optional. You can unsubscribe at any time, and the <a href="/privacy">privacy policy</a> explains what is kept and how to have it deleted.</p>
<p><strong>Contact:</strong> <a href="mailto:${email}">${email}</a>.</p>
`;

const home = `<h1>${esc(p.brand)}</h1>
<p>This site sends the free resources ${name} offers on Instagram${handle}${on.youtube ? ' and YouTube' : ''}. Comment or message the keyword from a post to get yours.</p>
<p><a href="/privacy">Privacy policy</a> · <a href="/terms">Terms</a> · <a href="mailto:${email}">${email}</a></p>
`;

const dir = join(ROOT, 'config', 'pages');
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, 'privacy.html'), privacy);
writeFileSync(join(dir, 'terms.html'), terms);
writeFileSync(join(dir, 'home.html'), home);
console.log('OK        Wrote config/pages/privacy.html, terms.html and home.html');
