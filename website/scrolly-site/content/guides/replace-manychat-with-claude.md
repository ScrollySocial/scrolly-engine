---
slug: replace-manychat-with-claude
draftPostId: 1971
wpId:
title: Replace ManyChat with Claude: How I Built My Own Comment-to-DM
description: I replaced ManyChat with my own Instagram comment-to-DM system that Claude built and set up. What it does, what it costs, the setup traps, and who should stay on ManyChat.
h1: How I replaced ManyChat
h1Italic: with Claude
lede: I wouldn't pay ManyChat's per-contact prices, so I had Claude build me my own comment-to-DM software instead. Here's what it does, what it costs and the traps I hit.
author: Mercedes
authorBio: I'm Mercedes, founder of The Ambition Department. I build my own business tools with Claude and share the systems so you don't have to start from scratch.
authorPhoto:
heroImage:
heroAlt:
product: chat-manager
updated: 2026-10-28
---

:::answer
Yes, mostly. Claude can set up your own private software that does most of what ManyChat does, including Instagram comment-to-DM through Instagram's official API. It runs on n8n on your own small server, about $6 a month at DigitalOcean, however many people comment. ManyChat still wins on TikTok DMs.
:::

## Why I wouldn't pay for ManyChat

ManyChat does have a free tier and I tried it out, but many of the automations I wanted to run were restricted to the paying tiers. I felt the cost was kind of extreme once you start getting a significant number of contacts for a business. It's like paying for a second email platform.

ManyChat charges by how many people you interact with each month (prices from manychat.com/pricing, monthly billing, checked October 28, 2026):

| Plan | Price a month | Contacts |
| --- | --- | --- |
| Free | $0 | 25 |
| Essential | $17 | 250 |
| Pro | $39 | 2,500 |
| Business | $99 | 7,500 |
| Advanced | $199 | 25,000 |

So I decided to see if I could replace ManyChat with Claude and build my own version. It turns out you can. I decided on October 22, built and tested it that same day, and it went live on October 23.

## What "replacing ManyChat with Claude" actually means

For me it was a couple of hours of researching the options and then setting up the accounts you need to make what is essentially your own private software.

You need a server so your automation always stays on. If you ran it off your laptop, anytime you powered it down the automation would stop, and people would at best get a delay after commenting. That's not a good customer experience. It seemed worth $6 a month to keep it always on, especially since the price of the server doesn't depend on how many contacts you have.

The automation runs in a program called n8n. Claude builds it for you, so you don't have to be technical. You can add as many keywords as you want, with no restrictions.

It's set up through Instagram's official API: you create your own personal app that only works on your account. So it's 100% official and legit from Instagram's perspective.

:::flow
Claude builds it | Sets everything up with you, once. You come back to Claude only for changes.
n8n runs it | Free automation software on your own small server, on day and night.
Instagram sends it | The DMs go out through Instagram's official API.
:::

You can add Facebook Page comments too, but Meta reviews those apps by hand instead of automatically. I can't guarantee you'll pass their review, but in theory, with a little more work, you could answer Facebook comments the same way you do on Instagram.

If you're on YouTube and want to answer comments that use a keyword there too, you can add a YouTube connection. This is great because ManyChat doesn't include YouTube at all, so YouTubers would need separate software to get the same result.

Finally, TikTok. I set it up so my Chat Manager receives every TikTok comment, but there's no way to reply to TikTok comments automatically. Even ManyChat can't do this. I still like having them, because I can copy and paste replies from my Chat Manager into TikTok easily. ManyChat can auto-reply to TikTok DMs (in beta, for TikTok Business accounts), and that isn't something I've been able to re-create with the official APIs available.

## What mine does every day

Every day my Chat Manager answers anyone who comments a keyword with their link. It replies both with a public comment and with a private DM.

I also set mine up to ask them to reply to me by DM before it sends the link. That way I can follow up with them in the DMs instead of only sending the link they asked for. If they forget to reply, it sends them one follow-up DM.

It also replies to YouTube comments that use a keyword, with the link they asked for.

For TikTok, I use Apify to load my comments, and my Chat Manager drafts replies. I then copy and paste them into the TikTok app myself.

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

Building your own chat software with Claude costs a small amount, and the price stays the same as you grow.

First, you need a paid Claude plan. The lowest one is currently $20 a month. Then you need a server. I chose DigitalOcean: it's $6 a month with straightforward pricing. Google also offers a "free" server, but it still charges about $3.60 a month for its public IP address.

To load your account's public TikTok comments you can use Apify. Its free monthly credit covers it, and even paid it would cost $3 a month at most. I'm on the free plan. The server also needs a web address. If you don't have a website or don't want to buy a domain, you can get one free with DuckDNS.

So my personal cost is $6 a month on top of the Claude subscription I already had.

:::bars What it costs each month
250 people | ManyChat $17 | Your own $6
2,500 people | ManyChat $39 | Your own $6
7,500 people | ManyChat $99 | Your own $6
25,000 people | ManyChat $199 | Your own $6
:::

:::cta slim Chat Manager is $97 once, then about $6 a month for hosting, however many people message you.

## How the setup works, step by step

First you set up your accounts. With Claude's help this takes a few hours. Some people already have a website, and others will need a free web address. Everyone needs a server, unless you're a super techie and already have one.

Then you need a Meta developer account to make your app official. If you also want to answer YouTube comments, you connect YouTube through its official API as well. You can optionally add Facebook comments, but that needs a manual review, so it's more work and approval isn't guaranteed.

Before you go live, your new chat app needs a privacy page. A free Notion page works if you don't have a website. Then you can set up how your dashboard looks. This step can take some tweaking to get it to fully replace ManyChat for you.

Then you're ready to add your keywords and start testing. Congratulations!

1. **Get a server.** Claude creates it with you.
2. **Get a web address with HTTPS.** DuckDNS (free) or your own domain, plus Caddy for the secure certificate.
3. **Make a Meta developer app** and give your Instagram account the Instagram Tester role.
4. **Publish the app.** Apps for your own account skip App Review.
5. **Add a privacy page.** A public Notion page works.
6. **Add your keywords** and approve each DM's wording.
7. **Use test mode first,** then turn it off.

![WRITE alt text: describe the screenshot](REPLACE-meta-webhook-screen.webp "WRITE a caption: which screen this is and what to click")

## The setup traps that cost me time

:::trap Don't upload a logo to your Google app
You need a Google app for YouTube. Do NOT add a logo to it. Simply adding a logo image triggers a 4 to 6 week verification process. You don't need a logo, and you skip all that waiting if you don't upload one.
:::

:::trap Publish your Google app out of Testing
If you leave your Google app in Testing, it makes you sign in again every 7 days, and YouTube replies stop until you do. Publish it to In production.
:::

:::trap Don't add extras when you publish your Meta app
Some options you can select during setup can send your Instagram app to manual review. Don't click any + Add buttons on the Customize use case page if you don't want to go through App Review.
:::

It also took some use and tweaking during testing to get the dashboard working and looking the way I wanted.

## What Instagram won't let any tool do

These limits come from Instagram itself, so they apply to ManyChat too:

- You can send one private DM per comment, within 7 days of the comment. Older comments can't get a DM.
- Follow-up DMs only work within 24 hours of the person's last message to you.
- You need an Instagram Creator or Business account. It's free to switch.
- No tool can DM new followers automatically. Instagram only allows DMs to people who commented or messaged you first.

## Who should stay on ManyChat

ManyChat is still the best solution for people who rely on automated TikTok DMs or WhatsApp automations to run their business, because those can't be officially replicated with Claude. At least not yet.

- **Stay on ManyChat if you:** need WhatsApp, Messenger or TikTok DMs, or want zero setup.
- **Build your own if you:** have a growing audience, want YouTube keywords, want your own data, and are OK spending a few hours on setup.

## Build it yourself or use my kit

If you have plenty of time and you're scrappy, you should be able to use this guide and your Claude to build your own Chat Manager.

If this feels confusing or overwhelming, or you'd rather save yourself the time and just get posting, you can copy my work! I made a customer version of my own software that you can re-create with Claude. It comes with Claude setup instructions, so instead of taking hours to set up the accounts, it should only take maybe 30 minutes of your active work while Claude does the rest.

I also spent a lot of time after setting up the connections making the Chat Manager easy to use and maintain. That's time you'd spend tweaking regularly if you build your own.

:::cta

:::faq
?? Can Claude replace ManyChat?
Yes. Claude can help you create your own private software that replaces all but one or two of ManyChat's current features. There's no tiered pricing, though it does use outside tools and not all of them are free. It costs about $6 a month, however many contacts or chats you have.
?? Do I need to know how to code?
Absolutely not. As long as you have Claude Code, you can build this.
?? Is it allowed by Instagram?
Yes. It's set up with Instagram's official API, through an app that only works on your own account, so it's 100% legit.
?? Does Claude answer my DMs automatically?
You choose how much is automatic. Mine auto-replies to keyword comments, and it writes drafts for normal comments without a keyword. I can update a draft before posting it. You could set it to answer 100% of comments through your Claude plan or paid API use, but then you're bound by the AI's automatic replies. I set mine to drafts only, to keep costs low and avoid that risk.
?? What does it cost each month?
About $6 for the server, the same however many people message you. Your Claude plan is separate.
:::

:::sources
- ManyChat pricing, manychat.com/pricing, checked October 28, 2026
- Instagram Platform: Private Replies and Webhooks, developers.facebook.com/docs/instagram-platform, checked October 24, 2026
- DigitalOcean Droplet pricing, digitalocean.com/pricing/droplets, checked October 22, 2026
- Google Cloud network pricing (public IP), cloud.google.com/vpc/network-pricing, checked October 22, 2026
- n8n, n8n.io
:::
