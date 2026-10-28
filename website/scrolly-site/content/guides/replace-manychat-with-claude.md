---
slug: replace-manychat-with-claude
draftPostId: 1971
wpId:
title: Replace ManyChat with Claude: How I Built My Own Comment-to-DM
description: I replaced ManyChat with my own Instagram comment-to-DM system that Claude built and set up. What it does, what it costs, the setup traps, and who should stay on ManyChat.
h1: How I replaced ManyChat
h1Italic: with Claude
lede: [WRITE one or two sentences: who you are and what this guide shows. Keep it under 30 words.]
author: Mercedes
authorBio: [WRITE two sentences about you, in your voice. Mention The Ambition Department and that you build your own tools with Claude.]
authorPhoto:
heroImage:
heroAlt:
product: chat-manager
updated: 2026-10-27
---

:::note
**How to use this file.** Every grey dashed box like this one is a writing note. It shows in your preview only and never gets published. Write your words under each heading, then delete the note. The page won't build for publishing while a note or a [WRITE …] line is left, so nothing half-done goes live.

**Why your own words matter.** Google doesn't punish a page for how it was typed. It ranks pages that show real, first-hand experience and ranks down mass-produced pages that add nothing. Your edge here is that you actually built and run this. So, in every section: use "I", give your real dates and numbers, add your own screenshots, and tell the parts that went wrong. Nobody else ranking for this has that.

**Keywords (from the cluster plan).** Main: *replace manychat with claude*. Also work in naturally, once each: *can claude replace manychat*, *manychat claude*, *manychat vs claude*, *self hosted manychat*, *instagram comment to dm automation*. Use the main phrase in the first 100 words and in one H2. Don't force the others.

**Top picture.** Beside the title goes one real picture: you at your laptop with the inbox open, or a clean screenshot of a keyword DM on your phone. Put the file name after `heroImage:` at the top of this file and a short description after `heroAlt:`. The same goes for `authorPhoto:` (a photo of you, shown in a pink ring).

**Pictures and charts.** The page has a picture, chart or graphic about every 300 words so it never reads as a wall of text: 2 step graphics, 1 cost chart, 4 screenshot spots and the product card. The step graphics and chart are drawn by the page from the words and numbers in this file, so you can reword any label. The screenshots must be your own.

**Chat Manager mentions.** Three, spread out: a one-line mention after "What mine does", another after the cost chart, and the full card near the end. That's the most a helpful guide can carry before it reads like a sales page, which readers trust less and Google ranks lower. Each mention sits right where a reader would think "can I just buy this?".

**Length.** Aim for 1,800 to 2,500 words. Short paragraphs (2 to 4 sentences).

**Facts below** come from your build notes (vault `products/content-engine/comment-to-dm-n8n-plan.md` and the Chat Manager page source). Each says where it's from. Re-check any price on the day you publish and change the "checked" date.
:::

:::note
**The short answer box (right under the title).** Google often shows a 40 to 60 word answer from the top of a page. Answer "Can Claude replace ManyChat?" directly, in 2 or 3 sentences.

Facts to work from:
- Claude doesn't send the DMs itself. It builds and sets up your own comment-to-DM system, then steps back.
- The system is n8n (free automation software) on a small server of your own, about $6 a month at DigitalOcean.
- It uses Instagram's official API, through a Meta app that only works on your own account.
- Day to day it runs with no Claude costs. You use Claude again only to change or update it.
:::

:::answer
[WRITE the short answer here: 2 or 3 sentences, 40 to 60 words.]
:::

## Why I stopped paying for ManyChat

:::note
Your story, so this one is all you. Questions to answer:
- What were you using or about to use before? Were you on ManyChat, or about to sign up?
- What made you look for another way? Your build notes give these reasons: ManyChat charges by how many people message you, Pro isn't even its top plan, and it doesn't do YouTube.
- When did you decide to build your own? (Your notes: scope set 2026-10-22, built and tested locally that same day, live on 2026-10-23.)
- One line on what you wanted it to do: comment a keyword, get a freebie by DM, join your email list.

Use *replace ManyChat with Claude* naturally in this section.

ManyChat prices, from manychat.com/pricing, checked 2026-10-26 (re-check before publishing), monthly billing, by active contacts:

| Plan | Price a month | Contacts |
| --- | --- | --- |
| Free | $0 | 25 |
| Essential | $17 | 250 |
| Pro | $39 | 2,500 |
| Business | $99 | 7,500 |
| Advanced | $199 | 25,000 |
:::

## What "replacing ManyChat with Claude" actually means

:::note
This is the section that makes the page trustworthy, because most people searching think Claude will answer their DMs live. Explain the three parts in plain words. A simple drawing or a Canva graphic of the three boxes would help here.

1. **Claude is the builder.** It writes and sets up everything with you, runs the commands, and asks you plain questions. It's also who you ask later for changes ("make my dashboard match my brand colours").
2. **n8n is what runs every day.** Free automation software on your own small server. It's on day and night, so your keywords answer while your laptop is closed.
3. **Instagram's official API is how the DMs get sent.** You make a free Meta developer app that only works on your own account.

Facts:
- Day to day there are no Claude costs. Keyword replies, signups and stats run without Claude.
- Optional: fully automatic reply drafts through Claude's pay-as-you-go API. Your notes: under 1 cent a comment on Opus 5.5, far less on Haiku 5.5. You chose the free route: drafts come from your Claude subscription and wait for your OK.
- Accuracy rule: never say Claude answers DMs on its own. Keyword DMs are automatic. Other comments wait in your inbox for you.

The graphic below shows the three parts. Reword the labels if you like (keep each short).
:::

:::flow
Claude builds it | Sets everything up with you, once. You come back to Claude only for changes.
n8n runs it | Free automation software on your own small server, on day and night.
Instagram sends it | The DMs go out through Instagram's official API.
:::

## What mine does every day

:::note
Proof section. Show, don't tell. Screenshots to take (blur other people's names and photos):
1. A real keyword comment under one of your posts and the "sent you a DM" reply under it. Your second account @thecrunchyfinder is perfect for this, it's what you tested with on 2026-10-23.
2. The DM it got, with the READY reply and the signup link.
3. Your inbox at hooks.scrollyseo.com/inbox (or the demo at demo.scrollyseo.com/inbox if you'd rather show made-up data; say so in the caption).
4. Your Stats page.

What it does (from the kit's changelog, version 1.0.0):
- Comment a keyword (yours: MATH, QUIZ, PLAN, CHALLENGE) and get the freebie link by DM, plus a public "check your DMs" reply in rotating wordings.
- Or the DM asks them to reply READY, then sends a personal signup link, they join your email list, and the freebie shows right away.
- One reminder DM if they forget, inside Instagram's 24-hour window.
- Optional "only for followers" gate.
- YouTube: keyword comments get a public reply with the link (YouTube has no DMs). Checked every 30 minutes.
- TikTok: comments land in the inbox with a suggested reply and a Copy and open TikTok button. TikTok has no reply API.
- One inbox for Instagram, YouTube and TikTok. Stats with signups, top posts and your reply time.
- A health check that tells you when something needs you.

Add one honest line about how it's gone since it went live (only numbers you can see in your Stats, no guesses).

Below: a graphic of what happens, then your two screenshots (phone, then dashboard), then the first Chat Manager mention.
:::

:::flow
They comment | A keyword like MATH under your post.
They get a DM | Plus a "sent you a DM" reply under the comment.
They get the freebie | And their email joins your list.
You see it all | One inbox for Instagram, YouTube and TikTok.
:::

![WRITE alt text: describe the screenshot](REPLACE-phone-comment-and-dm.webp "WRITE a caption: the keyword comment and the DM it got, with the date")

![WRITE alt text: describe the screenshot](REPLACE-inbox-dashboard.webp "WRITE a caption: your inbox or stats page, names blurred")

:::cta slim


## What it costs compared with ManyChat

:::note
Readers searching this care most about money. Put the table first, then 2 or 3 sentences.

Your running costs (from your build notes):
- Server: about $6 a month, DigitalOcean, 1 GB. The $4 one is too small for n8n.
- Claude: a paid plan you probably already have (Pro or higher). Only used for setup and changes.
- TikTok comments: Apify's free monthly credit covers it (yours is capped at $0.10 a run, so $3 a month at most).
- Web address: free with DuckDNS (yourname.duckdns.org), or your own domain.
- An insider fact worth one sentence: Google Cloud's "free" small server still charges for its public IP address, about $3.60 a month (cloud.google.com/vpc/network-pricing, checked 2026-10-22). That's why you picked DigitalOcean.

Suggested table (re-check ManyChat's prices on the day you publish):

| People messaging you a month | ManyChat | Your own setup |
| --- | --- | --- |
| 250 | $17 | about $6 |
| 2,500 | $39 | about $6 |
| 7,500 | $99 | about $6 |
| 25,000 | $199 | about $6 |

Later, link to the ManyChat cost calculator (guide B3) here once it exists.

The chart below is drawn from these numbers. Update them when you re-check ManyChat's prices.
:::

:::bars What it costs each month
250 people | ManyChat $17 | Your own $6
2,500 people | ManyChat $39 | Your own $6
7,500 people | ManyChat $99 | Your own $6
25,000 people | ManyChat $199 | Your own $6
:::

:::cta slim Chat Manager is $97 once, then about $6 a month for hosting, however many people message you.

## How the setup works, step by step

:::note
An overview, not the full tutorial (the full n8n tutorial is guide B2; link to it once it's live). Number the steps because order matters. For each, write one or two sentences and **how long it took you**.

1. **Get a server.** Claude creates it for you at DigitalOcean, in your name. You add a card.
2. **Give it a web address with HTTPS.** Free DuckDNS name or your own domain. Caddy (free) gets the secure certificate. Meta needs a public https address. You don't need a website.
3. **Make a Meta developer app.** Use case "Manage messaging & content on Instagram". Give your Instagram account the Instagram Tester role, then accept the invite in Instagram. Subscribe the webhook to `comments` only.
4. **Publish the app.** Webhooks only arrive once it's published. Own-account apps publish with no App Review (yours went straight through on 2026-10-23).
5. **Privacy page.** Meta (and Google, for YouTube) need a public privacy policy. No website? A public Notion page works.
6. **Add your keywords and DM text.** Approve each DM's wording before it can send.
7. **Test mode first.** Nothing gets sent; the inbox shows what would have been sent. Turn it off once a real test from a second account works.

Your total time, roughly? (The Chat Manager page says about an hour, once.)

Screenshot spot below: one Meta screen, for example the webhook page with only `comments` ticked.
:::

![WRITE alt text: describe the screenshot](REPLACE-meta-webhook-screen.webp "WRITE a caption: which screen this is and what to click")

## The setup traps that cost me time

:::note
This is the most valuable section on the page, because only someone who did it knows these. Pick your 4 to 6 worst ones and tell each as a short story: what you clicked, what happened, what to do instead. Each one goes in a "watch out" box (example below). Your full list is in the vault plan under "traps to call out loudly". The best ones for this page:

Meta:
- First visit to developers.facebook.com can say "Account confirmation needed… unusual activity". Normal for a new developer account; Confirm Account and follow the steps.
- Meta pre-ticks several message webhook fields. Untick them and keep only `comments`.
- Publishing needs five fields in App settings → Basic, and the Terms of Service URL is easy to miss. App icon must be 1024 × 1024.
- The Publish page links to "Customize use case" with + Add buttons. Don't add any. Extra permissions can send the app to App Review.
- There are two app IDs (the dashboard's and the Instagram one). Use the one the step asks for.

Google (for YouTube):
- Never upload an app logo. It forces Google verification, 4 to 6 weeks.
- Leaving the app in "Testing" makes the YouTube sign-in expire every 7 days and replies silently stop. Publish it to In production.
- "Get started for free" is the $300 trial that asks for a card. Go to console.cloud.google.com instead.

Small but real:
- Saving keys in Notepad: pick "All files" and check the file name (one of yours lost its first letter).

Add your screenshots of the Meta screens if you still have them: the "Customize use case" page with the + Add buttons to leave alone would be a good one, right above or inside a trap box.
:::

:::trap Untick Meta's extra webhook fields
[WRITE this trap in your words: what Meta pre-ticks, what you do instead, what happens if you skip it.]
:::

## What Instagram won't let any tool do

:::note
State each limit once, as a plain fact a reader needs before switching (your writing rules: explain a limitation once, where it changes what the reader does). From Meta's Instagram Platform docs and your notes:
- One private reply DM per comment, sent within 7 days of the comment. Meta caps it at 750 an hour.
- Follow-ups and reminders only reach people who messaged you in the last 24 hours.
- Creator or Business accounts only. It's free to switch.
- Facebook Page comments need Meta to review your app by hand (days, not guaranteed), so they're not in your setup.
- TikTok has no way to reply automatically. ManyChat can auto-reply TikTok DMs (beta, TikTok Business accounts), but TikTok comment → DM didn't work in ManyChat either as of mid-2026 (its own community forum, April and June 2026).
:::

## Who should stay on ManyChat

:::note
Being fair here earns trust, and it's what makes this page different from tool companies' "alternatives" lists. Two short lists.

Stay on ManyChat if you:
- need WhatsApp or Messenger, or TikTok DM auto-replies
- want zero setup and don't mind paying by contacts
- [anything else from your own view]

Build your own if you:
- have, or expect, a big audience, so per-contact pricing hurts
- want YouTube comment keywords
- want your data on your own server and to change the software yourself (ask Claude)
- are fine with about an hour of setup, once
:::

## Build it yourself or use my kit

:::note
Soft, honest close. Two paths, one line each:
1. **Free route:** follow this guide and the full n8n tutorial (guide B2, link once live). Everything above is enough to build it.
2. **Chat Manager:** the same system as a kit. Open the folder in Claude and say "set up my Chat Manager". $97 founding beta, first 10 buyers, plus about $6 a month hosting and your own Claude plan.

No scarcity you can't back up: "first 10 buyers" is true (stock 10), so it's fine. Don't add "selling fast" or similar.
:::

:::cta

:::faq
?? Can Claude replace ManyChat?
[WRITE 2 or 3 sentences. Same idea as the short answer, worded differently.]
?? Do I need to know how to code?
[WRITE. Fact: no, Claude runs every command and asks a few plain questions.]
?? Is it allowed by Instagram?
[WRITE. Fact: it uses Meta's official Instagram API with an app that only works on your own account.]
?? Does Claude answer my DMs automatically?
[WRITE. Fact: keyword DMs are automatic. Other comments wait in your inbox; drafts can come from Claude and wait for your OK.]
?? What does it cost each month?
[WRITE. Fact: about $6 for the server, the same however many people message you. Claude plan separate.]
?? Can I use ManyChat's Claude integration instead?
[WRITE, only if you check it first. A newsletter says ManyChat lists Claude under Settings → Integrations on paid Pro; a 2024 forum post says it doesn't. Look in a ManyChat account before you answer, or cut this question.]
:::

:::sources
- [WRITE each source as: Name of page, site, date you checked it. Suggested:]
- ManyChat pricing, manychat.com/pricing
- Instagram Platform: Private Replies and Webhooks, developers.facebook.com/docs/instagram-platform
- DigitalOcean Droplet pricing, digitalocean.com/pricing/droplets
- Google Cloud network pricing (public IP), cloud.google.com/vpc/network-pricing
- n8n, n8n.io
:::
